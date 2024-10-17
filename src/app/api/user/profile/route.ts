import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { ProfileResponse } from "@/utils/types";

/**
 * Get info about the user such as their project, account settings, tasks, etc, for the profile page
 */
export async function GET() {
    const { user } = await getSession();

    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }
    const serviceSupabase = getServiceSupabase();
    const { data, error } = await serviceSupabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error) {
        return internalErrorResponse({ success: false, data: "Unable to load profile data" });
    }

    const { data: taskData, error: taskError } = await serviceSupabase
        .from("task_assignee")
        .select("task_id, task!inner(*)")
        .eq("user_id", user.id);

    let completedTasks = 0;
    let inProgressTasks = 0;
    let notStartTasks = 0;

    if (taskData) {
        completedTasks = taskData.filter(
            (task) => (task?.task as any)?.task_status === "COMPLETE",
        ).length;
        inProgressTasks = taskData.filter(
            (task) => (task?.task as any)?.task_status === "DOING",
        ).length;
        notStartTasks = taskData.filter(
            (task) => (task?.task as any)?.task_status === "TODO",
        ).length;
    }

    const responseData: ProfileResponse = {
        user_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        profile_display_name: data.profile_display_name || "",
        profile_bio: data.profile_bio || "",
        profile_avatar: data.profile_avatar || "",
        tasks: {
            todo: notStartTasks,
            doing: inProgressTasks,
            completed: completedTasks,
        },
    };

    return okResponse({
        success: true,
        data: responseData,
    });
}

/**
 * Update a user's profile data such as name, email, profile avatar, etc
 */
export async function PATCH(request: Request) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    const updateData: Record<string, string | undefined> = {};
    const serviceSupabase = getServiceSupabase();

    if (data.has("avatar_image")) {
        // Attempt to upload the avatar image if one is provided
        const avatarImage = data.get("avatar_image");
        if (avatarImage instanceof File) {
            const { data, error } = await serviceSupabase.storage
                .from("avatars")
                .upload(user.id, avatarImage, {
                    cacheControl: "3600",
                    upsert: true,
                });
            if (error || !data) {
                console.error(`Unable to upload avatar image for ${user.id}`, error);
            } else {
                updateData.profile_avatar = data.fullPath;
            }
        }
    }

    // Update the user's data provided
    if (data.get("first_name")) {
        updateData.first_name = data.get("first_name") as string;
    }
    if (data.get("last_name")) {
        updateData.last_name = data.get("last_name") as string;
    }
    if (data.get("display_name")) {
        updateData.profile_display_name = data.get("display_name") as string;
    }
    if (data.get("bio")) {
        updateData.profile_bio = data.get("bio") as string;
    }

    // Update the user's email and name in supabase first
    const { error: authError } = await serviceSupabase.auth.admin.updateUserById(user.id, {
        email: data.has("email") ? (data.get("email") as string) : undefined,
        user_metadata: {
            first_name: data.has("first_name") ? (data.get("first_name") as string) : undefined,
            last_name: data.has("last_name") ? (data.get("last_name") as string) : undefined,
        },
    });
    if (authError) {
        console.error(`Error while updating user details ${user.id}`, authError);
        return internalErrorResponse({
            success: false,
            data: "Unable to update your profile details.",
        });
    }

    // Update the user's name in the database as well.
    const { error } = await serviceSupabase
        .from("profile")
        .update(updateData)
        .eq("user_id", user.id);

    if (error) {
        console.error(`Error while updating profile details for user ${user.id}`, error);
        return internalErrorResponse({
            success: false,
            data: "Unable to update your profile details.",
        });
    }

    return createdResponse({ success: true, data: "Profile updated" });
}

import { getServerSupabase, getServiceSupabase } from "@/utils/supabase/server";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";

export async function GET() {
    const { user } = await getSession();

    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }
    const { data, error } = await getServiceSupabase()
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error) {
        return internalErrorResponse({ success: false, data: "Unable to load profile data" });
    }

    return okResponse({
        success: true,
        data: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            display_name: data.profile_display_name,
            bio: data.profile_bio,
            avatar: data.profile_avatar,
        },
    });
}

export async function PATCH(request: Request) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    const updateData: Record<string, string | undefined> = {};
    const serviceSupabase = getServiceSupabase();

    if (data.has("avatar_image")) {
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

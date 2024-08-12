import { getServerSupabase } from "@/utils/supabase/server";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";

export async function GET() {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }
    const { data, error } = await supabase
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
            display_name: data.profile_display_name,
            bio: data.profile_bio,
            avatar: data.profile_avatar,
        },
    });
}

export async function PATCH(request: Request) {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    const updateData: Record<string, string | undefined> = {};

    if (data.has("avatar_image")) {
        const avatarImage = data.get("avatar_image");
        if (avatarImage instanceof File) {
            const { data, error } = await supabase.storage
                .from("avatars")
                .upload(user.id, avatarImage, {
                    cacheControl: "3600",
                    upsert: true,
                });
            if (error || !data) {
                console.log(`Unable to upload avatar image for ${user.id}`);
                console.error(error);
            } else {
                updateData.profile_avatar = data.fullPath;
            }
        }
    }

    if (data.get("display_name")) {
        updateData.profile_display_name = data.get("display_name") as string;
    }
    if (data.get("bio")) {
        updateData.profile_bio = data.get("bio") as string;
    }

    const { error } = await supabase.from("profile").update(updateData).eq("user_id", user.id);

    if (error) {
        console.error(`Error while updating profile details for user ${user.id}`, error);
        return internalErrorResponse({
            success: false,
            data: "Unable to update your profile details.",
        });
    }

    return createdResponse({ success: true, data: "Profile updated" });
}

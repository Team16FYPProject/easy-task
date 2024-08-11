import { getServerSupabase } from "@/utils/supabase/server";

export async function GET() {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return Response.json({ success: false, data: "Unauthorized" }, { status: 401 });
    }
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error) {
        return Response.json(
            { success: false, data: "Unable to load profile data" },
            { status: 500 },
        );
    }

    return Response.json(
        {
            success: true,
            data: {
                display_name: data.profile_display_name,
                bio: data.profile_bio,
                avatar: data.profile_avatar,
            },
        },
        { status: 200 },
    );
}

export async function PATCH(request: Request) {
    const supabase = getServerSupabase();
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return Response.json({ success: false, data: "Unauthorized" }, { status: 401 });
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
            }
            updateData.profile_avatar = data?.fullPath;
        }
    }

    if (data.has("display_name")) {
        updateData.profile_display_name = data.get("display_name") as string;
    }
    if (data.has("bio")) {
        updateData.profile_bio = data.get("bio") as string;
    }

    const { error } = await supabase.from("profile").update(updateData).eq("user_id", user.id);

    if (error) {
        console.error(`Error while updating profile details for user ${user.id}`, error);
        return Response.json({ success: false, data: "Unable to update your profile details." });
    }

    return Response.json({ success: true, data: "Profile updated" }, { status: 201 });
}

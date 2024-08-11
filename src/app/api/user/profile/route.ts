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

export async function PATCH() {
    // const data = await request.formData();
    return Response.json({}, { status: 200 });
}

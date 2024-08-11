import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSupabase } from "@/utils/supabase/server";
import { ResponseData } from "@/pages/api/types";

const GET = async (request: NextApiRequest, response: NextApiResponse) => {
    const supabase = getServerSupabase(request, response);
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) {
        return response.status(401).json({ success: false, data: "Unauthorized" });
    }
    const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
    if (error) {
        return response.status(500).json({ success: false, data: "Unable to load profile data" });
    }

    return response.status(200).json({
        success: true,
        data: {
            display_name: data.profile_display_name,
            bio: data.profile_bio,
            avatar: data.profile_avatar,
        },
    });
};

const PATCH = async (request: NextApiRequest, response: NextApiResponse) => {
    return response.status(200).json({});
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    if (req.method === "GET") {
        return await GET(req, res);
    } else if (req.method === "PATCH") {
        return await PATCH(req, res);
    } else {
        res.status(404).json({ success: false, data: "Page not found" });
    }
}

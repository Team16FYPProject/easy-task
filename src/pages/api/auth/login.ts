import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSupabase } from "@/utils/supabase/server";

type ResponseData = {
    success: boolean;
    data: any;
};

const POST = async (request: NextApiRequest, response: NextApiResponse) => {
    const { email, password } = request.body;

    if (!email) {
        return response
            .status(400)
            .json({ success: false, data: "Please provide an email address" });
    }
    if (!password) {
        return response
            .status(400)
            .json({ success: false, data: "Please provide a valid password" });
    }

    const supabase = getServerSupabase(request, response);
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message === "Invalid login credentials") {
            return response
                .status(400)
                .json({ success: false, data: "Incorrect credentials provided." });
        }
        return response.status(400).json({
            success: false,
            data: "Unable to login at this time. Please try again later.",
        });
    }

    return response.status(200).json({ success: true, data: "Logging you in..." });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    if (req.method === "POST") {
        return await POST(req, res);
    } else {
        res.status(404).json({ success: false, data: "Page not found" });
    }
}

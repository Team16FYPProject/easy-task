import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSupabase } from "@/utils/supabase/server";

type ResponseData = {
    success: boolean;
    data: any;
};

const POST = async (request: NextApiRequest, response: NextApiResponse) => {
    const { firstName, lastName, email, password } = request.body;
    if (!firstName) {
        return response.status(400).json({ success: false, data: "Please enter your first name" });
    }
    if (!lastName) {
        return response.status(400).json({ success: false, data: "Please enter your last name" });
    }
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
    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        },
    });

    if (error) {
        switch (error.code) {
            case "email_exists":
                return response
                    .status(400)
                    .json({ success: false, data: "An account with that email already exists." });
            case "weak_password":
                return response
                    .status(400)
                    .json({ success: false, data: "Please enter a stronger password" });
            case "validation_failed":
                return response
                    .status(400)
                    .json({ success: false, data: "Please enter a valid email" });
            default:
                console.error(error);
                return response.status(400).json({
                    success: false,
                    data: "Unable to register at this time. Please try again later.",
                });
        }
    }

    return response.status(200).json({ success: true, data: "Creating your account..." });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    if (req.method === "POST") {
        return await POST(req, res);
    } else {
        res.status(404).json({ success: false, data: "Page not found" });
    }
}

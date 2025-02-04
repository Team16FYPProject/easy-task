import { getServerSupabase } from "@/utils/supabase/server";

/**
 * This endpoint is used to log a user in
 * @param request The HTTP request
 */
export async function POST(request: Request) {
    const { email, password } = await request.json();
    // Basic validation
    if (!email) {
        return Response.json(
            { success: false, data: "Please provide an email address" },
            { status: 400 },
        );
    }
    if (!password) {
        return Response.json(
            { success: false, data: "Please provide a valid password" },
            { status: 400 },
        );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message === "Invalid login credentials") {
            return Response.json(
                { success: false, data: "Incorrect credentials provided." },
                { status: 400 },
            );
        }
        return Response.json(
            {
                success: false,
                data: "Unable to login at this time. Please try again later.",
                // data: error.message,
            },
            { status: 400 },
        );
    }

    return Response.json({ success: true, data: "Logging you in..." }, { status: 200 });
}

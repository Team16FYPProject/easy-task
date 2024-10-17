import { getServerSupabase } from "@/utils/supabase/server";

/**
 * Creates an account for a user
 * @param request The HTTP request
 */
export async function POST(request: Request) {
    const { firstName, lastName, email, password } = await request.json();
    // Basic validation
    if (!firstName) {
        return Response.json(
            { success: false, data: "Please enter your first name" },
            { status: 400 },
        );
    }
    if (!lastName) {
        return Response.json(
            { success: false, data: "Please enter your last name" },
            { status: 400 },
        );
    }
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
                return Response.json(
                    { success: false, data: "An account with that email already exists." },
                    { status: 400 },
                );
            case "weak_password":
                return Response.json(
                    { success: false, data: "Please enter a stronger password" },
                    { status: 400 },
                );
            case "validation_failed":
                return Response.json(
                    { success: false, data: "Please enter a valid email" },
                    { status: 400 },
                );
            default:
                console.error(error);
                return Response.json(
                    {
                        success: false,
                        data: "Unable to register at this time. Please try again later.",
                    },
                    { status: 400 },
                );
        }
    }

    return Response.json({ success: true, data: "Creating your account..." }, { status: 200 });
}

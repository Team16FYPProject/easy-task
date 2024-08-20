import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookies) {
                        for (const cookie of cookies) {
                            request.cookies.set(cookie);
                        }
                    },
                },
            },
        );

        // refreshing the auth token
        await supabase.auth.getUser();
    } catch (error) {
        console.error("Unable to refresh in middleware", error);
    }
    return response;
}

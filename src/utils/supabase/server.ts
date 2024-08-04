import { type CookieOptions, createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { NextApiRequest, NextApiResponse } from "next";

export function getServerSupabase(request: NextApiRequest, response: NextApiResponse) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies[name];
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.setHeader("Set-Cookie", serializeCookieHeader(name, value, options));
                },
                remove(name: string, options: CookieOptions) {
                    response.setHeader("Set-Cookie", serializeCookieHeader(name, "", options));
                },
            },
        },
    );
}

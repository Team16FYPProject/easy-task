import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { isValidEmail } from "@/utils/check.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import {
    checkAndUpdateAchievementProgress,
    increaseAchievementProgress,
} from "@/utils/server/achievements.utils";

export async function GET(_: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();
    const { data: memberData, error: memberError } = await supabase
        .from("project_member")
        .select("user_id")
        .eq("project_id", id);

    if (memberError) {
        console.error(`Unable to fetch member data for team ${id}`, memberError);
        return okResponse({ success: true, users: [] });
    }

    const { data: userData, error: userError } = await supabase
        .from("profile")
        .select("*")
        .in(
            "user_id",
            memberData!.map((data) => data.user_id),
        );
    if (userError) {
        console.error(`Unable to fetch user data for team ${id}`, userError);
        return okResponse({ success: false, users: [] });
    }
    return okResponse({ success: true, users: userData });
}

export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const { email } = await request.json();
    if (!email) return badRequestResponse({ success: false, data: "Email is a required field." });

    if (!isValidEmail(email))
        return badRequestResponse({ success: false, data: "Please enter a valid email." });

    const serviceSupabase = getServiceSupabase();

    const { data: userData, error: userError } = await serviceSupabase
        .from("profile")
        .select("*")
        .ilike("email", email)
        .single();
    if (userError) {
        return badRequestResponse({
            success: false,
            data: "This member does not have an account. Please ask them to sign up first.",
        });
    }

    const { data: memberData, error: memberError } = await serviceSupabase
        .from("project_member")
        .select("user_id")
        .eq("user_id", userData.user_id)
        .eq("project_id", id)
        .maybeSingle();
    if (memberError) {
        console.error(memberError);
        return internalErrorResponse({ success: false, data: "Unable to add that member" });
    }
    if (memberData) {
        return badRequestResponse({
            success: false,
            data: "That member is already part of this project.",
        });
    }

    const { error: insertError } = await getServiceSupabase().from("project_member").insert({
        user_id: userData.user_id,
        project_id: id,
    });

    if (insertError) {
        console.error(insertError);
        return internalErrorResponse({ success: false, data: "Unable to remove that member" });
    }

    // When a user joins a new project, increase their progress on the Team Player achievement.
    void increaseAchievementProgress(userData.user_id, "Team Player", 1);
    return okResponse({ success: true, data: userData });
}

export async function DELETE(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { error } = await getServiceSupabase()
        .from("project_member")
        .delete()
        .eq("user_id", session.user.id)
        .eq("project_id", id);

    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to leave that team" });
    }
    return okResponse({ success: true, data: "Successfully left that team" });
}

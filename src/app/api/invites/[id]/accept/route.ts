import { InviteIdParams } from "@/app/api/invites/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

/**
 * Accepts a project invitation URL to add a member to a project
 * @param _ The HTTP Request
 * @param id The invite id
 */
export async function POST(_: Request, { params: { id } }: InviteIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();
    // Get the details about the invite link from the database
    const { data: inviteData, error: inviteError } = await supabase
        .from("project_invite_link")
        .select("project_id")
        .eq("invite_id", id)
        .single();
    if (inviteError) {
        console.error(inviteError);
        return badRequestResponse({ success: false, data: "Invalid invite link provided" });
    }

    // Check if the member is already part of the project
    const { error: memberError, data: memberData } = await supabase
        .from("project_member")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("project_id", inviteData.project_id)
        .maybeSingle();
    if (memberError) {
        console.error(memberError);
        return internalErrorResponse({ success: false, data: "Unable to join that project" });
    }

    if (memberData) {
        return badRequestResponse({ success: false, data: "You are already a part of that team." });
    }

    // Add the member to the project
    const { error: joinError } = await supabase.from("project_member").insert({
        project_id: inviteData.project_id,
        user_id: session.user.id,
    });

    if (joinError) {
        console.error(joinError);
        return internalErrorResponse({ success: false, data: "Unable to join that project." });
    }

    // Return the id of the project the user just joined so they can be redirected to the project page.
    return okResponse({
        success: true,
        data: {
            project: { id: inviteData.project_id },
        },
    });
}

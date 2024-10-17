import { InviteIdParams } from "@/app/api/invites/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

/**
 * This endpoint (GET /api/invites/id]) is used to get information about an invite sent to a user
 * Information including the person who created the invite and the project to which the user was invited to
 *
 * @param _ The HTTP request
 * @param id The invite DI
 * @returns An error response if the invite is invalid, otherwise returns an OK response with data about the invite
 */
export async function GET(_: Request, { params: { id } }: InviteIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();
    // Get information about the invitation
    const { data: inviteData, error: inviteError } = await supabase
        .from("project_invite_link")
        .select("*, profile!inner(first_name, last_name)")
        .eq("invite_id", id)
        .single();

    if (inviteError) {
        console.error(inviteError);
        return badRequestResponse({ success: false, data: "Invalid invite link provided" });
    }

    // Get info about the project the user was invited into
    const projectQuery = supabase
        .from("project")
        .select("*")
        .eq("project_id", inviteData.project_id)
        .single();
    // Get info about the user who created the invite
    const inviterQuery = supabase
        .from("profile")
        .select("*")
        .eq("user_id", inviteData.invite_creator_id)
        .single();

    const [{ data: projectData, error: projectError }, { data: inviterData, error: inviterError }] =
        await Promise.all([await projectQuery, await inviterQuery]);

    if (projectError) {
        console.error(projectError);
        return badRequestResponse({
            success: false,
            data: "The team you were invited to no longer exists",
        });
    }
    if (inviterError) {
        console.error(inviteError);
        return badRequestResponse({ success: false, data: "Expired invite link provided" });
    }

    return okResponse({
        success: true,
        data: {
            project: {
                name: projectData.project_name,
                image: projectData.project_profile_pic,
            },
            inviter: {
                name: inviteData.profile.first_name + " " + inviteData.profile.last_name,
            },
        },
    });
}

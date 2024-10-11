import { InviteIdParams } from "@/app/api/invites/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function GET(_: Request, { params: { id } }: InviteIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();
    const { data: inviteData, error: inviteError } = await supabase
        .from("project_invite_link")
        .select("*, profile!inner(first_name, last_name)")
        .eq("invite_id", id)
        .single();

    if (inviteError) {
        console.error(inviteError);
        return badRequestResponse({ success: false, data: "Invalid invite link provided" });
    }

    const projectQuery = supabase
        .from("project")
        .select("*")
        .eq("project_id", inviteData.project_id)
        .single();
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

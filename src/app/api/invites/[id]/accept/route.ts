import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { InviteIdParams } from "@/app/api/invites/[id]/types";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function POST(_: Request, { params: { id } }: InviteIdParams) {
    const session = await getSession();
    if (!session) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();
    const { data: inviteData, error: inviteError } = await supabase
        .from("project_invite_link")
        .select("project_id")
        .eq("invite_id", id)
        .single();
    if (inviteError) {
        console.error(inviteError);
        return badRequestResponse({ success: false, data: "Invalid invite link provided" });
    }

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

    const { error: joinError } = await supabase.from("project_member").insert({
        project_id: inviteData.project_id,
        user_id: session.user.id,
    });

    if (joinError) {
        console.error(joinError);
        return internalErrorResponse({ success: false, data: "Unable to join that project." });
    }

    return okResponse({
        success: true,
        data: {
            project: { id: inviteData.project_id },
        },
    });
}

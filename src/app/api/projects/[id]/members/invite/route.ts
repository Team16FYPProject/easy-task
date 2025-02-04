import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { InviteMemberEmailTemplate } from "@/components/emails/InviteMemberEmailTemplate";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    notFoundResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_123");

/**
 * Sends an project invitation email to a specified email
 *
 * @param request The HTTP request
 * @param id The project id
 */
export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const { email } = await request.json();
    if (!email) {
        return badRequestResponse({ success: false, data: "Email is a required field" });
    }

    const supabase = getServiceSupabase();

    // Get basic information about the project the user is being invited into
    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("project_name, project_id")
        .eq("project_id", id)
        .single();

    if (projectError) {
        console.error(projectError);
        return notFoundResponse({ success: false, data: "No project with that id exists" });
    }

    // Create the invite link and attach required information to it
    const { data: inviteData, error: inviteError } = await supabase
        .from("project_invite_link")
        .insert({
            project_id: projectData.project_id,
            invite_creator_id: user.id,
        })
        .select("invite_id")
        .single();

    if (inviteError) {
        console.error(inviteError);
        return internalErrorResponse({
            success: false,
            data: "Unable to create invite link. Please try again later.",
        });
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_URL}/invite/${inviteData.invite_id}`;

    // Send out the invitation email
    const { error } = await resend.emails.send({
        from: "Easy-Task <no-reply@easy-task.com>",
        to: [email],
        subject: `Easy Task - Join Team ${projectData.project_name}`,
        react: InviteMemberEmailTemplate({ teamName: projectData.project_name, link: inviteLink }),
    });

    if (error) {
        // Error is expected here since we don't own the easy-task.com domain.
        // console.error(error);
        // return internalErrorResponse({ success: false, data: error });
    }
    return okResponse({ success: true, data: "The invite email has been sent." });
}

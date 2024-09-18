import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    createdResponse,
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServerSupabase, getServiceSupabase } from "@/utils/supabase/server";
import { createTask } from "./utils";

export async function GET(request: Request, { params: { id } }: ProjectIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();

    // query the database to find all tasks that match a project id
    const { data: taskData, error: taskError } = await supabase
        .from("task")
        .select(
            `
            *,
            assignees:task_assignee(user_id)
        `,
        )
        .eq("project_id", id);

    // handle query errors
    if (taskError) {
        console.error("Unable to fetch tasks from the database", taskError);
        return okResponse({ success: true, tasks: [] });
    }
    return okResponse({ success: true, tasks: taskData });
}

export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.json();
    return createTask(id, null, data, session, true);
}

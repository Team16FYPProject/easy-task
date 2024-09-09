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
        .select("*")
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

// export async function PATCH(request: Request, { params: { id } }: ProjectIdParams) {
//     const supabase = getServerSupabase();
//     const user = (await supabase.auth.getUser())?.data?.user;
//     if (!user) {
//         return unauthorizedResponse({ success: false, data: "Unauthorized" });
//     }
//     // destructure task_status from response
//     const { task_status, task_id } = await request.json();

//     // update in the database
//     const { error } = await supabase.from("tasks").update({ task_status }).eq("task_id", task_id);

//     // handle an error
//     if (error) {
//         console.error(`Error while updating task_status for task ${task_id}`, error);
//         return internalErrorResponse({
//             success: false,
//             data: "Unable to update your task status details.",
//         });
//     }

//     return createdResponse({ success: true, data: "Task status updated" });
// }

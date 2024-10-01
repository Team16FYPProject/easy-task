import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";

export async function POST(request: Request, { params: { id, taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { assignee } = await request.json();

    // Add the user ID to the task_assignees table
    const { error: insertError } = await getServiceSupabase()
        .from("task_assignee")
        .insert({ task_id: taskId, user_id: assignee });

    if (insertError) {
        console.error(`Error adding user ${user.id} to task ${taskId}:`, insertError);
        return internalErrorResponse({
            success: false,
            data: `Unable to add user to task assignees. Error: ${insertError.message}`,
        });
    }

    // if (error) {
    //     console.error(`Error updating task ${taskId}:`, error);
    //     return internalErrorResponse({
    //         success: false,
    //         data: `Unable to update task status. Error: ${error.message}`,
    //     });
    // }
    return okResponse({ success: true });
}

import { Session } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function setTaskSettings(
    projectId: string,
    id: string | null,
    data: FormData,
    session: Session,
    create: boolean,
): Promise<Response> {
    const task_name = data.get("task_name");
    const task_desc = data.get("task_desc");
    const task_deadline = data.get("task_deadline");
    const task_priority = data.get("task_priority");
    const task_parent = data.get("task_parent");
    const task_status = data.get("task_status");
    const task_is_meeting = data.get("task_meeting");
    const task_location = data.get("task_location");

    if (!task_name) {
        return badRequestResponse({ success: false, data: "Task name is a required field" });
    }
    if (!task_deadline) {
        return badRequestResponse({
            success: false,
            data: "Task deadline is a required field",
        });
    }

    const { user } = session;

    let taskId: string;
    if (create) {
        taskId = crypto.randomUUID();
    } else {
        if (!id) {
            return badRequestResponse({ success: false, data: "Task id is a required field" });
        }
        taskId = id;
    }

    const supabase = getServiceSupabase();

    const { data: taskData, error: taskError } = await supabase
        .from("task")
        .upsert({
            task_id: taskId,
            project_id: projectId,
            task_name: task_name,
            project_desc: task_desc,
            task_deadline: task_deadline,
            task_time_spent: 0,
            task_creater_id: user.id,
            task_parent_id: task_parent,
            task_status: task_status,
            task_priority: task_priority,
            task_location: task_location,
            task_is_meeting: task_is_meeting,
        })
        .select("task_id")
        .single();

    if (taskError || !data) {
        console.error("Unable to insert task to database", taskError);
        return internalErrorResponse({
            success: false,
            data: "Unable to create task at this time. Please try again later",
        });
    }

    if (create) {
        return createdResponse({ success: true, data: { id: taskData.task_id } });
    } else {
        return okResponse({ success: true, data: "Successfully updated your tasks" });
    }
}

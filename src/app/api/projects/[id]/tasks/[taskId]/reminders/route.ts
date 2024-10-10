import {
    okResponse,
    unauthorizedResponse,
    serverErrorResponse,
    internalErrorResponse,
} from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { Reminders } from "@/utils/types";

export async function GET(request: Request, { params }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { taskId } = params;
    if (!taskId) {
        return serverErrorResponse({ success: false, data: "Task ID is required" });
    }

    const supabase = getServiceSupabase();

    try {
        const { data: remindersData, error: remindersError } = await supabase
            .from("task_reminder")
            .select(
                `
                reminder_id,
                reminder_datetime,
                task!inner (
                    task_id,
                    project_id,
                    task_name,
                    task_desc,
                    task_deadline,
                    task_time_spent,
                    task_creator_id,
                    task_parent_id,
                    task_status,
                    task_priority,
                    task_location,
                    task_is_meeting,
                    task_reminder!inner (user_id)
                )
            `,
            )
            .eq("task_id", taskId)
            .eq("task.task_reminder.user_id", user.id);

        if (remindersError) {
            console.error(`Unable to fetch reminders for task ${taskId}`, remindersError);
            return serverErrorResponse({ success: false, data: "Failed to fetch reminders" });
        }

        if (!remindersData || remindersData.length === 0) {
            return okResponse({ success: true, data: [] });
        }

        const { data: projectData, error: projectError } = await supabase
            .from("project")
            .select("*")
            .eq("project_id", remindersData[0].task.project_id)
            .single();

        if (projectError) {
            console.error(`Unable to fetch project for task ${taskId}`, projectError);
            return okResponse({ success: false, data: "Failed to fetch project details" });
        }

        const reminders = remindersData.map((reminder) => ({
            reminder_id: reminder.reminder_id,
            reminder_datetime: reminder.reminder_datetime,
            task: {
                ...reminder.task,
                project: projectData,
            },
        }));

        return okResponse({ success: true, data: reminders });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

export async function PUT(request: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();
    const { reminder_id, new_datetime } = await request.json();

    if (!reminder_id || !new_datetime) {
        return serverErrorResponse({
            success: false,
            data: "Reminder ID and new datetime are required",
        });
    }

    try {
        const { data, error } = await supabase
            .from("task_reminder")
            .update({ reminder_datetime: new_datetime })
            .eq("reminder_id", reminder_id)
            .eq("task_id", taskId);

        if (error) {
            console.error(`Error updating reminder for task ${taskId}:`, error);
            return internalErrorResponse({ success: false, data: "Failed to update reminder" });
        }

        return okResponse({ success: true, data });
    } catch (error) {
        console.error("Error updating reminder:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

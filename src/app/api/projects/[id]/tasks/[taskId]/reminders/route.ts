import {
    okResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";

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
        // Fetch task reminders for the specific task
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
                    task_assignee!inner (user_id)
                )
            `,
            )
            .eq("task_id", taskId)
            .eq("task.task_assignee.user_id", user.id);

        if (remindersError) {
            console.error(`Unable to fetch reminders for task ${taskId}`, remindersError);
            return serverErrorResponse({ success: false, data: "Failed to fetch reminders" });
        }

        if (!remindersData || remindersData.length === 0) {
            return okResponse({ success: true, data: [] });
        }

        // Fetch project related to the task
        const { data: projectData, error: projectError } = await supabase
            .from("project")
            .select("*")
            .eq("project_id", remindersData[0].task.project_id)
            .single();

        if (projectError) {
            console.error(`Unable to fetch project for task ${taskId}`, projectError);
            return okResponse({ success: false, data: "Failed to fetch project details" });
        }

        // Combine reminders with project data
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

export async function POST(request: Request, { params }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { taskId } = params;
    if (!taskId) {
        return serverErrorResponse({ success: false, data: "Task ID is required" });
    }

    try {
        const data = await request.json();
        const supabase = getServiceSupabase();

        // Create new reminder for the specific task
        const { data: newReminder, error } = await supabase
            .from("task_reminder")
            .insert({
                task_id: taskId,
                reminder_datetime: data.reminder_datetime,
                // Add any other necessary fields
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating new reminder:", error);
            return serverErrorResponse({ success: false, data: "Failed to create reminder" });
        }

        return okResponse({ success: true, data: newReminder });
    } catch (error) {
        console.error("Error processing POST request:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

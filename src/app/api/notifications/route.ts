import { getSession } from "@/utils/server/auth.server.utils";
import {
    okResponse,
    serverErrorResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

/**
 * Get all the user's notifications
 */
export async function GET() {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();

    try {
        // Fetch task reminders (notifications) for the user
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
            .eq("task.task_assignee.user_id", user.id);

        if (remindersError) {
            console.error(`Unable to fetch reminders for user ${user.id}`, remindersError);
            return serverErrorResponse({ success: false, data: "Failed to fetch notifications" });
        }

        if (!remindersData || remindersData.length === 0) {
            return okResponse({ success: true, data: [] });
        }

        // Fetch projects related to the reminders
        const projectIds = Array.from(
            new Set(
                remindersData
                    .map((r) => r.task?.project_id)
                    .filter((id): id is string => id !== undefined),
            ),
        );

        const { data: projectsData, error: projectsError } = await supabase
            .from("project")
            .select("*")
            .in("project_id", projectIds);

        if (projectsError) {
            console.error(`Unable to fetch projects for user ${user.id}`, projectsError);
            return okResponse({ success: false, data: "Failed to fetch project details" });
        }

        // Create a map of projects for easy lookup
        const projectsMap = new Map(projectsData.map((project) => [project.project_id, project]));

        // Combine reminders with project data
        const notifications = remindersData.map((reminder) => ({
            reminder_id: reminder.reminder_id,
            reminder_datetime: reminder.reminder_datetime,
            task: {
                ...reminder.task,
                project: projectsMap.get(reminder.task.project_id),
            },
        }));

        return okResponse({ success: true, data: notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

export async function POST(request: Request) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    try {
        const data = await request.json();
        const supabase = getServiceSupabase();

        // Implement logic to create new notifications
        const { data: newReminder, error } = await supabase
            .from("task_reminder")
            .insert({
                task_id: data.task_id,
                reminder_datetime: data.reminder_datetime,
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

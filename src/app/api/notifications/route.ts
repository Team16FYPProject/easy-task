import { okResponse, unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

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
            return okResponse({ success: false, data: "Failed to fetch notifications" });
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
        return okResponse({ success: false, data: "An unexpected error occurred" });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    // Handle creating new notifications if needed
    const data = await request.json();
    // Implement logic to create new notifications
    return okResponse({ success: true, data: "Notification created successfully" });
}

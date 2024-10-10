import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import { okResponse, unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { createTask } from "./utils";

export async function GET(_: Request, { params: { id } }: ProjectIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();

    // Query the database to find all tasks that match a project id
    const { data: taskData, error: taskError } = await supabase
        .from("task")
        .select(
            `*, 
            assignees:task_assignee(user_id, profile!inner(email, first_name, last_name)), 
            reminders:task_reminder(reminder_datetime)`,
        )
        .eq("project_id", id);

    // Handle query errors
    if (taskError) {
        console.error("Unable to fetch tasks from the database", taskError);
        return okResponse({ success: true, tasks: [] });
    }

    // Merge user information with tasks
    // Merge user information and reminders with tasks
    const tasksWithDetails = taskData?.map((task) => ({
        ...task,
        assignees: task.assignees.map((assignee) => ({
            ...assignee,
            user: {
                email: assignee.profile.email,
                name: assignee.profile.first_name + " " + assignee.profile.last_name,
            },
        })),
        reminders: task.reminders || [], // Attach reminders
    }));

    return okResponse({ success: true, tasks: tasksWithDetails || [] });
}

export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.json();
    return createTask(id, null, data, session, true);
}

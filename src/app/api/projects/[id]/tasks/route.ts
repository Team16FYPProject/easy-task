import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { getSession } from "@/utils/server/auth.server.utils";
import { okResponse, unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { createTask } from "./utils";

export async function GET(request: Request, { params: { id } }: ProjectIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const supabase = getServiceSupabase();

    // Query the database to find all tasks that match a project id
    const { data: taskData, error: taskError } = await supabase
        .from("task")
        .select("*,assignees:task_assignee(user_id)")
        .eq("project_id", id);

    // Handle query errors
    if (taskError) {
        console.error("Unable to fetch tasks from the database", taskError);
        return okResponse({ success: true, tasks: [] });
    }

    // Extract unique assignee IDs
    const assigneeIds = [
        ...new Set(
            taskData?.flatMap((task) => task.assignees.map((assignee) => assignee.user_id)) || [],
        ),
    ];

    // Fetch user details from auth.users table
    const { data: userData, error: userError } = await supabase
        .from("auth.users")
        .select("id, email, raw_user_meta_data")
        .in("id", assigneeIds);

    if (userError) {
        console.error("Unable to fetch user information", userError);
        return okResponse({ success: true, tasks: taskData || [] });
    }

    // Merge user information with tasks
    const tasksWithUserDetails = taskData?.map((task) => ({
        ...task,
        assignees: task.assignees.map((assignee) => {
            const user = userData?.find((u) => u.id === assignee.user_id);
            return {
                ...assignee,
                user: user
                    ? {
                          email: user.email,
                          name: user.raw_user_meta_data?.name || "N/A",
                      }
                    : null,
            };
        }),
    }));

    return okResponse({ success: true, tasks: tasksWithUserDetails || [] });
}

export async function POST(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.json();
    return createTask(id, null, data, session, true);
}

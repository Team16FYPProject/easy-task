import { getServiceSupabase } from "@/utils/supabase/server";
import { badRequestResponse, okResponse } from "@/utils/server/server.responses.utils";
import { getSession } from "@/utils/server/auth.server.utils";
import { DashboardResponse, Project, ProjectTask } from "@/utils/types";

export async function GET() {
    const { user } = await getSession();

    if (!user) {
        return badRequestResponse({ success: false, data: "Unauthorized" });
    }
    const serviceSupabase = getServiceSupabase();

    const { data: taskData, error: taskError } = await serviceSupabase
        .from("task_assignee")
        .select("task_id, task!inner(*)")
        .eq("user_id", user.id);

    if (taskError) {
        console.error(taskError);
    }

    const { data: projectsData, error: projectsError } = await serviceSupabase
        .from("project_member")
        .select("project_id, project!inner(*)")
        .eq("user_id", user.id);

    if (projectsError) {
        console.error(projectsError);
    }

    const responseData: DashboardResponse = {
        tasks:
            taskData?.map(
                (task) =>
                    ({
                        ...task.task,
                    }) as unknown as ProjectTask,
            ) ?? [],
        projects:
            projectsData?.map(
                (project) =>
                    ({
                        ...project.project,
                    }) as unknown as Project,
            ) ?? [],
    };

    return okResponse({
        success: true,
        data: responseData,
    });
}

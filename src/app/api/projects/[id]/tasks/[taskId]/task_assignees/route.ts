import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { Assignee } from "@/utils/types";
import { TaskIdParams } from "./types";

export async function POST(request: Request, { params: { id, taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const serviceSupabase = getServiceSupabase();
    const { ids } = await request.json();

    // Get all the current assignees for the task
    const { data: currentData, error: currentError } = await serviceSupabase
        .from("task_assignee")
        .select("user_id")
        .eq("task_id", taskId);
    if (currentError || currentData == null) {
        console.error(currentError);
        return internalErrorResponse({
            success: false,
            data: "Unable to update assignees. Please try again",
        });
    }

    const currentIds: string[] = currentData.map((assignee) => assignee.user_id);
    // Get the assignees that need to be inserted
    const idsToInsert: string[] = ids.filter((id: string) => !currentIds.includes(id));
    // Get the assignees that need to be deleted
    const idsToDelete: string[] = currentIds.filter((id: string) => !ids.includes(id));
    console.log("idsToInsert", idsToInsert);
    console.log("idsToDelete", idsToDelete);
    const insertQuery = serviceSupabase
        .from("task_assignee")
        .insert(idsToInsert.map((id) => ({ task_id: taskId, user_id: id })));
    const deleteQuery = serviceSupabase
        .from("task_assignee")
        .delete()
        .eq("task_id", taskId)
        .in("user_id", idsToDelete);

    // Update the assignees, insert new ones and delete remove assignees.
    const dbResponses = await Promise.all([insertQuery, deleteQuery]);
    for (const dbResponse of dbResponses) {
        if (dbResponse.error) {
            console.error(dbResponse.error);
            return internalErrorResponse({
                success: false,
                data: "Unable to properly update assignees. Please refresh and try again",
            });
        }
    }

    // Query the db to fetch the new assignees to match the required response.
    const { data: assigneesData, error: assigneesError } = await serviceSupabase
        .from("task_assignee")
        .select(
            "user_id, profile!inner(user_id, first_name, last_name, email, profile_bio, profile_display_name, profile_avatar)",
        )
        .eq("task_id", taskId);

    if (assigneesError) {
        console.error(assigneesError);
        return internalErrorResponse({
            success: false,
            data: "Unable to complete updating assignees. Please refresh and try again",
        });
    }

    const assignees: Assignee[] =
        assigneesData?.map((assignee) => ({
            ...assignee,
            user: {
                email: assignee.profile.email,
                name: assignee.profile.first_name + " " + assignee.profile.last_name,
            },
        })) ?? [];

    return okResponse({ success: true, data: assignees });
}

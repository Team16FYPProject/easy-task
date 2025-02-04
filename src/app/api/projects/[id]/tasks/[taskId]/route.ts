import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";
import {
    checkAndUpdateAchievementProgress,
    increaseAchievementProgress,
} from "@/utils/server/achievements.utils";

/**
 * Get all information about a task
 */
export async function GET(_: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    // Get the information from the database.
    const { data, error } = await getServiceSupabase()
        .from("task")
        .select("*")
        .eq("task_id", taskId)
        .single();
    if (error) {
        return internalErrorResponse({ success: false, data: "Unable to get task data" });
    }

    return okResponse({ success: true, data: data });
}

/**
 * Modify a task's details/data
 */
export async function PATCH(request: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const data = await request.json();

    const supabase = getServiceSupabase();

    try {
        const updateFields: any = {};

        // Only add fields to updateFields if they are present in the request
        if (data.taskName !== undefined) updateFields.task_name = data.taskName;
        if (data.taskDescription !== undefined) updateFields.task_desc = data.taskDescription;
        if (data.taskDeadline !== undefined) updateFields.task_deadline = data.taskDeadline;
        if (data.taskParent !== undefined) updateFields.task_parent_id = data.taskParent;
        if (data.taskStatus !== undefined) updateFields.task_status = data.taskStatus;
        if (data.taskPriority !== undefined) updateFields.task_priority = data.taskPriority;
        if (data.taskLocation !== undefined) updateFields.task_location = data.taskLocation;
        if (data.taskMeetingBool !== undefined) updateFields.task_is_meeting = data.taskMeetingBool;
        if (data.taskTimeSpent !== undefined) updateFields.task_time_spent = data.taskTimeSpent;

        const { data: updateData, error: updateError } = await supabase
            .from("task")
            .update(updateFields)
            .eq("task_id", taskId)
            .select()
            .single();

        if (updateError) {
            console.error("Update error:", updateError);
            if (updateError.code === "PGRST116") {
                console.log("No rows returned. Task might not exist.");
                return okResponse({ success: false, data: "Task not found" });
            }
            return internalErrorResponse({ success: false, data: "Unable to update the task" });
        }

        if (data.taskTimeSpent) {
            void increaseAchievementProgress(user.id, "Time Wizard", data.taskTimeSpent);
        }

        if (data.taskStatus === "DOING") {
            void checkAndUpdateAchievementProgress(user.id, "Multitasker");
        } else if (data.taskStatus === "COMPLETE") {
            const date = new Date();
            // If the user marked a task as COMPLETE before 9AM, increase their progress for the 'Early Bird' achievement.
            if (date.getHours() <= 9) {
                void increaseAchievementProgress(user.id, "Early Bird", 1);
            }

            if (updateData.task_deadline) {
                const deadline = new Date(updateData.task_deadline);
                // If the user completed the task before the deadline, mark increase their progress for the 'Deadline Crusher'
                if (date.getTime() < deadline.getTime()) {
                    void increaseAchievementProgress(user.id, "Deadline Crusher", 1);
                }
            }
        }
        return okResponse({ success: true, data: updateData });
    } catch (error) {
        console.error("Unexpected error:", error);
        return internalErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

/**
 * Delete a task
 */
export async function DELETE(_: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { error } = await getServiceSupabase().from("task").delete().eq("task_id", taskId);
    if (error) {
        console.error(error);
        return internalErrorResponse({ success: false, data: "Unable to delete the task" });
    }
    return okResponse({ success: true, data: "Task deleted" });
}

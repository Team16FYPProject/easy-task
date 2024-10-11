import {
    internalErrorResponse,
    okResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";
import { TaskIdParams } from "./types";
import { getSession } from "@/utils/server/auth.server.utils";

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

    // Merge user information and reminders with tasks
    // const tasksWithDetails = data?.map((task) => ({
    //     ...task,
    //     assignees: task.assignees.map((assignee) => ({
    //         ...assignee,
    //         user: {
    //             email: assignee.profile.email,
    //             name: assignee.profile.first_name + " " + assignee.profile.last_name,
    //         },
    //     })),
    //     reminders: task.reminders || [], // Attach reminders
    // }));

    return okResponse({ success: true, data: data });
}

export async function PATCH(request: Request, { params: { taskId } }: TaskIdParams) {
    console.log("PATCH function called with taskId:", taskId);

    const { user } = await getSession();
    if (!user) {
        console.log("Unauthorized access attempt");
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const data = await request.json();
    console.log("Received data:", data);

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

        console.log("Fields to update:", updateFields);

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

        console.log("Update successful. Updated data:", updateData);

        // Merge user information and reminders with tasks
        const tasksWithDetails = updateData?.map((task) => ({
            ...task,
            assignees: task.assignees.map((assignee) => ({
                ...assignee,
                user: {
                    email: assignee.profile.email,
                    name: assignee.profile.first_name + " " + assignee.profile.last_name,
                },
            })),
            // reminders: task.
            // reminders: task.reminders || [], // Attach reminders
        }));

        return okResponse({ success: true, data: tasksWithDetails });
    } catch (error) {
        console.error("Unexpected error:", error);
        return internalErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

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

// export async function PATCH(request: Request, { params: { taskId } }: TaskIdParams) {
//     const { user } = await getSession();
//     if (!user) {
//         return unauthorizedResponse({ success: false, data: "Unauthorized" });
//     }
//     const data = await request.json();
//     console.log(data);

//     // First, check if the task exists
//     const { data: existingTask, error: checkError } = await getServiceSupabase()
//         .from("task")
//         .select("task_id")
//         .eq("task_id", taskId)
//         .single();

//     if (checkError) {
//         if (checkError.code === "PGRST116") {
//             return okResponse({ success: false, data: "Task not found" });
//         }
//         console.error(checkError);
//         return internalErrorResponse({ success: false, data: "Error checking task existence" });
//     }

//     // Update the task in the database and return the newly updated task
//     const { data: updateData, error: updateError } = await getServiceSupabase()
//         .from("task")
//         .update({
//             task_name: data.name ?? undefined,
//             task_desc: data.desc ?? undefined,
//             task_time_spent: data.time_spent ?? undefined,
//             task_parent_id: data.parent_id ?? undefined,
//             task_status: data.status ?? undefined,
//             task_priority: data.priority ?? undefined,
//             task_location: data.location ?? undefined,
//             task_is_meeting: data.is_meeting ?? undefined,
//         })
//         .eq("task_id", taskId)
//         .select("*");
//     // .single();
//     if (updateError) {
//         console.error(updateError);
//         return internalErrorResponse({ success: false, data: "Unable to update the task" });
//     }
//     return okResponse({ success: true, data: updateData });
// }

import { Session } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function createTask(
    projectId: string,
    id: string | null,
    data: Record<string, any>,
    session: Session,
    create: boolean,
): Promise<Response> {
    const {
        taskName,
        taskDescription,
        taskDeadline,
        taskPriority,
        taskParent,
        taskStatus,
        taskMeetingBool,
        taskLocation,
        taskAssignee,
        taskReminder,
    } = data;
    if (!taskName) {
        return badRequestResponse({ success: false, data: "Task name is a required field" });
    }
    if (taskName.length > 30) {
        return badRequestResponse({
            success: false,
            data: "Task name must be under 30 characters",
        });
    }
    if (!taskDeadline) {
        return badRequestResponse({
            success: false,
            data: "Task deadline is a required field",
        });
    }
    if (!taskStatus) {
        return badRequestResponse({
            success: false,
            data: "Task status is a required field",
        });
    }
    if (!taskPriority) {
        return badRequestResponse({
            success: false,
            data: "Task priority is a required field",
        });
    }
    const { user } = session;

    let taskId: string;
    if (create) {
        taskId = crypto.randomUUID();
    } else {
        if (!id) {
            return badRequestResponse({ success: false, data: "Task id is a required field" });
        }
        taskId = id;
    }

    const supabase = getServiceSupabase();
    const { data: taskData, error: taskError } = await supabase
        .from("task")
        .upsert({
            task_id: taskId,
            project_id: projectId,
            task_name: taskName,
            task_desc: taskDescription,
            task_deadline: taskDeadline,
            task_time_spent: 0,
            task_creator_id: user.id,
            task_parent_id: taskParent,
            task_status: taskStatus,
            task_priority: taskPriority,
            task_location: taskLocation,
            task_is_meeting: taskMeetingBool,
        })
        .select("*")
        .single();

    let assigneeData: {
        profile: { email: string; first_name: string; last_name: string };
        user: { email: string; name: string };
        user_id: string;
    }[] = [];
    if (taskAssignee && taskAssignee.length > 0) {
        const { error: assigneeError } = await supabase
            .from("task_assignee")
            .upsert(taskAssignee.map((userId: string) => ({ task_id: taskId, user_id: userId })));

        const { data: userData, error: userProfileError } = await supabase
            .from("profile")
            .select("user_id, email, first_name, last_name")
            .in("user_id", taskAssignee);

        if (assigneeError) {
            console.error("Unable to assign users to task", assigneeError);
        }
        if (userData) {
            assigneeData = userData.map((user) => ({
                profile: {
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                user: {
                    email: user.email,
                    name: `${user.first_name} ${user.last_name}`,
                },
                user_id: user.user_id,
            }));
        }
    }

    // Handle task reminders
    if (taskReminder && taskReminder.length > 0) {
        const reminderInserts = taskReminder.map((reminder: { reminder_datetime: string }) => ({
            task_id: taskId,
            reminder_datetime: reminder.reminder_datetime,
        }));

        const { error: reminderError } = await supabase
            .from("task_reminder")
            .upsert(reminderInserts);

        if (reminderError) {
            console.error("Unable to set reminders for task", reminderError);
        }
    }

    if (taskError || !data) {
        console.error("Unable to insert task to database", taskError);
        return internalErrorResponse({
            success: false,
            data: "Unable to create task at this time. Please try again later",
        });
    }
    const responseData = {
        ...taskData,
        assignees: assigneeData,
        reminders: taskReminder,
    };
    if (create) {
        return createdResponse({
            success: true,
            data: responseData,
        });
    } else {
        return okResponse({ success: true, data: "Successfully updated your tasks" });
    }
}

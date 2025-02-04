import { getSession } from "@/utils/server/auth.server.utils";
import {
    internalErrorResponse,
    okResponse,
    serverErrorResponse,
    unauthorizedResponse,
} from "@/utils/server/server.responses.utils";
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
        const { data: remindersData, error: remindersError } = await supabase
            .from("task_reminder")
            .select(
                `
                reminder_id,
                reminder_datetime,
                type
            `,
            )
            .eq("task_id", taskId);

        if (remindersError) {
            console.error(`Unable to fetch reminders for task ${taskId}`, remindersError);
            return serverErrorResponse({ success: false, data: "Failed to fetch reminders" });
        }

        if (!remindersData || remindersData.length === 0) {
            return okResponse({ success: true, data: [] });
        }

        return okResponse({ success: true, data: remindersData });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

export async function POST(request: Request, { params: { taskId } }: TaskIdParams) {
    const { user } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const supabase = getServiceSupabase();
    const { new_datetimes } = await request.json();

    if (!new_datetimes) {
        return serverErrorResponse({
            success: false,
            data: "Reminder ID and new datetime are required",
        });
    }
    const remindersToInsert = new_datetimes.map(
        (datetime: { reminder_datetime: any; type: any }) => ({
            task_id: taskId,
            reminder_datetime: datetime.reminder_datetime,
            type: datetime.type,
        }),
    );

    try {
        // Remove old reminders and insert new reminders
        await supabase.from("task_reminder").delete().eq("task_id", taskId);
        const { data, error } = await supabase.from("task_reminder").insert(remindersToInsert);

        if (error) {
            console.error(`Error updating reminder for task ${taskId}:`, error);
            return internalErrorResponse({ success: false, data: "Failed to update reminder" });
        }

        // Query the db to fetch the new assignees to match the required response.
        const { data: remindersData, error: remindersError } = await supabase
            .from("task_reminder")
            .select(
                "*", //, profile!inner(user_id, first_name, last_name, email, profile_bio, profile_display_name, profile_avatar)",
            )
            .eq("task_id", taskId);

        if (remindersError) {
            console.error(remindersError);
            return internalErrorResponse({
                success: false,
                data: "Unable to complete updating reminders. Please refresh and try again",
            });
        }

        return okResponse({ success: true, data: remindersData });
    } catch (error) {
        console.error("Error updating reminder:", error);
        return serverErrorResponse({ success: false, data: "An unexpected error occurred" });
    }
}

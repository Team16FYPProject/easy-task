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
    return okResponse({ success: true, data: data });
}

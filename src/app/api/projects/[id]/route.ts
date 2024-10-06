import { getSession } from "@/utils/server/auth.server.utils";
import { unauthorizedResponse } from "@/utils/server/server.responses.utils";
import { setProjectSettings } from "@/app/api/projects/utils";
import { ProjectIdParams } from "@/app/api/projects/[id]/types";
import { changeProjectSettings } from "./utils";

export async function PUT(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return setProjectSettings(id, data, session, false);
}

export async function PATCH(request: Request, { params: { id } }: ProjectIdParams) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return changeProjectSettings(id, data, session, false);
}

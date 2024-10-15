import { Session } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

export async function changeProjectSettings(
    id: string,
    data: FormData,
    session: Session,
): Promise<Response> {
    const name = data.get("name");
    const description = data.get("description");

    if (!name) {
        return badRequestResponse({ success: false, data: "Project name is a required field" });
    }
    if (!description) {
        return badRequestResponse({
            success: false,
            data: "Project description is a required field",
        });
    }

    const { user } = session;

    const supabase = getServiceSupabase();
    let imageUrl: string | undefined = undefined;
    if (data.has("image")) {
        const profileImage = data.get("image");
        if (!(profileImage instanceof File)) {
            return badRequestResponse({
                success: false,
                data: "Please upload a valid project image",
            });
        }
        const { data: imageData, error: imageError } = await supabase.storage
            .from("public_images")
            .upload(`projects/${id}`, profileImage, {
                cacheControl: "3600",
                upsert: true,
            });
        if (imageError || !imageData) {
            console.error("Unable to upload project image");
            console.error(imageError);
            return internalErrorResponse({
                success: false,
                data: "Unable to create your project. Please try again later.",
            });
        }
        imageUrl = imageData.fullPath;
    }

    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .update({
            project_id: id,
            project_name: name as unknown as string,
            project_desc: description as unknown as string,
            project_owner_id: user.id,
            project_profile_pic: imageUrl,
        })
        .eq("project_id", id)
        .select("project_id")
        .single();

    if (projectError || !data) {
        console.error("Unable to update project ", projectError);
        return internalErrorResponse({
            success: false,
            data: "Unable to update project at this time. Please try again later",
        });
    }

    return okResponse({ success: true, data: "Successfully updated your project" });
}

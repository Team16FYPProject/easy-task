import { Session } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";

export async function setProjectSettings(
    id: string | null,
    data: FormData,
    session: Session,
    create: boolean,
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

    const { user, supabase } = session;

    let projectId: string;
    if (create) {
        projectId = crypto.randomUUID();
    } else {
        if (!id) {
            return badRequestResponse({ success: false, data: "Project id is a required field" });
        }
        projectId = id;
    }

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
            .upload(`projects/${projectId}`, profileImage, {
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
        .upsert({
            projectId: projectId,
            project_name: name,
            project_owner_id: user.id,
            project_desc: description,
            project_profile_pic: imageUrl,
        })
        .select("id")
        .single();

    if (projectError || !data) {
        console.error("Unable to insert project to database", projectError);
        return internalErrorResponse({
            success: false,
            data: "Unable to create project at this time. Please try again later",
        });
    }

    if (create) {
        const { error: memberError } = await supabase.from("project_member").insert({
            project_id: projectData.id,
            user_id: user.id,
        });
        if (memberError) {
            console.error(
                `Unable to add user ${user.id} to project ${projectData.id} `,
                memberError,
            );
            return internalErrorResponse({
                success: false,
                data: "Unable to complete creating the project at this time. Please try again later",
            });
        }
    }
    if (create) {
        return createdResponse({ success: true, data: { id: projectData.id } });
    } else {
        return okResponse({ success: true, data: "Successfully updated your project" });
    }
}

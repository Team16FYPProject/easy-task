import { Session } from "@/utils/server/auth.server.utils";
import {
    badRequestResponse,
    createdResponse,
    internalErrorResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getServiceSupabase } from "@/utils/supabase/server";

/**
 * Set (or create if doesn't exist) a project's data
 *
 * @param id The project id
 * @param data The new data for the project
 * @param session The user's auth session
 * @param create A boolean indicating whether the project should be created if it doesn't already exist
 */
export async function setProjectSettings(
    id: string | null,
    data: FormData,
    session: Session,
    create: boolean,
): Promise<Response> {
    // Form data was used instead of a json body to allow for file/image uploads
    const name = data.get("name");
    const description = data.get("description");

    // Basic validation
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

    let projectId: string;
    if (create) {
        projectId = crypto.randomUUID();
    } else {
        if (!id) {
            return badRequestResponse({ success: false, data: "Project id is a required field" });
        }
        projectId = id;
    }

    const supabase = getServiceSupabase();
    let imageUrl: string | undefined = undefined;
    if (data.has("image")) {
        // Attempt to upload the profile image to Supabase Storage if one is provided
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
        // Set the project's image url to be the path of the newly uploaded image
        imageUrl = imageData.fullPath;
    }

    // Create or update the project information
    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .upsert({
            project_id: projectId,
            project_name: name as unknown as string,
            project_desc: description as unknown as string,
            project_owner_id: user.id,
            project_profile_pic: imageUrl,
        })
        .select("project_id")
        .single();

    if (projectError || !data) {
        console.error("Unable to insert project to database", projectError);
        return internalErrorResponse({
            success: false,
            data: "Unable to create project at this time. Please try again later",
        });
    }

    // If it's a new project, add the current user as an owner/member to the project
    if (create) {
        const { error: memberError } = await supabase.from("project_member").insert({
            project_id: projectData.project_id,
            user_id: user.id,
        });
        if (memberError) {
            console.error(
                `Unable to add user ${user.id} to project ${projectData.project_id} `,
                memberError,
            );
            return internalErrorResponse({
                success: false,
                data: "Unable to complete creating the project at this time. Please try again later",
            });
        }
    }
    if (create) {
        return createdResponse({ success: true, data: { id: projectData.project_id } });
    } else {
        return okResponse({ success: true, data: "Successfully updated your project" });
    }
}

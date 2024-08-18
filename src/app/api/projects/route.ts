import {
    badRequestResponse,
    unauthorizedResponse,
    internalErrorResponse,
    createdResponse,
    okResponse,
} from "@/utils/server/server.responses.utils";
import { getSession, Session } from "@/utils/server/auth.server.utils";

export async function GET() {
    const { user, supabase } = await getSession();
    if (!user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }

    const { data: memberData, error: memberError } = await supabase
        .from("project_member")
        .select("project_id")
        .eq("user_id", user.id);

    if (memberError) {
        console.error(`Unable to fetch member data for user ${user.id}`, memberError);
        return okResponse({ success: true, projects: [] });
    }

    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("*")
        .in("project_id", memberData);
    return okResponse({ success: true, projects: projectData });
}

async function setProjectSettings(
    data: FormData,
    session: Session,
    create: boolean,
): Promise<Response> {
    const name = data.get("name");
    const description = data.get("description");
    const profileImage = data.get("image");

    if (!name) {
        return badRequestResponse({ success: false, data: "Project name is a required field" });
    }
    if (!description) {
        return badRequestResponse({
            success: false,
            data: "Project description is a required field",
        });
    }
    if (!profileImage) {
        return badRequestResponse({ success: false, data: "Project image is a required field" });
    }
    if (!(profileImage instanceof File)) {
        return badRequestResponse({ success: false, data: "Please upload a valid project image" });
    }

    const { user, supabase } = session;

    let projectId: string;
    if (create) {
        projectId = crypto.randomUUID();
    } else {
        if (!data.has("id")) {
            return badRequestResponse({ success: false, data: "Project id is a required field" });
        }
        projectId = data.get("id") as string;
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

    const { data: projectData, error: projectError } = await supabase
        .from("project")
        .upsert({
            projectId: projectId,
            project_name: name,
            project_owner_id: user.id,
            project_desc: description,
            project_profile_pic: imageData.fullPath,
        })
        .select("id")
        .single();

    if (projectError || !data) {
        console.error("Unable to insert project to database", imageError);
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

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return setProjectSettings(data, session, true);
}

export async function PUT(request: Request) {
    const session = await getSession();
    if (!session.user) {
        return unauthorizedResponse({ success: false, data: "Unauthorized" });
    }
    const data = await request.formData();
    return setProjectSettings(data, session, false);
}

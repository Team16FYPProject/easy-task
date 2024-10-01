export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
};

export type ApiFailureResponse = {
    success: false;
    data: string;
};

export type ApiResponse<T> = ApiFailureResponse | ApiSuccessResponse<T>;

export interface Profile {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_bio: string;
    profile_display_name: string;
    profile_avatar: string;
}

export interface ProfileResponse extends Profile {
    tasks: {
        todo: number;
        doing: number;
        completed: number;
    };
}

export interface DashboardResponse {
    projects: Project[];
    tasks: ProjectTask[];
}

export interface Project {
    project_id: string;
    project_name: string;
    project_owner_id: string;
    project_profile_pic: string;
    project_desc: string;
}

/**
 * @param project_id: The id of the project
 * @param task_creator_id: The creator of the task
 * @param task_deadline: The date at which the task is due
 * @param task_desc: Description of the task
 * @param task_id: The id of the task
 * @param task_is_meeting: If the task has a meeting;
 * @param task_location: The location of the task;
 * @param task_name: The name of the task;
 * @param task_parent_id: The parent of the task if any;
 * @param task_priority: The priority of the task;
 * @param task_time_spent: How much time is spent on the task;
 * @param task_status: Current status of the task;
 * @param assignees: The assignees of the task;
 */
export type ProjectTask = {
    project_id: string;
    task_creator_id: string;
    task_deadline: string;
    task_desc: string;
    task_id: string;
    task_is_meeting: boolean;
    task_location: string;
    task_name: string;
    task_parent_id: string;
    task_priority: string;
    task_time_spent: number;
    task_status: string;
    assignees: Assignee[];
};

// Interface for Assignee
export interface Assignee {
    user_id: string;
    profile: Profile;
    user: User;
}

export interface User {
    email: string;
    name: string;
}

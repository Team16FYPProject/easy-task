"use client";
// Interface for Task
export interface Task {
    task_id: number;
    project_id: string;
    project_name: string;
    task_name: string;
    task_desc: string;
    task_deadline: string;
    task_time_spent: string;
    task_creator_id: string;
    task_status: string;
    task_priority: string;
    task_is_meeting: string;
    assignees: Assignee[];
}

// Interface for Assignee
export interface Assignee {
    user_id: string;
}

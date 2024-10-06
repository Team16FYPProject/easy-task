-- Add Hours to Task_Assignee
ALTER TABLE task_assignee
ADD
    COLUMN task_time_spent_user INTEGER NOT NULL DEFAULT 0;

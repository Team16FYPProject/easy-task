CREATE TABLE achievement
(
    achievement_id   uuid DEFAULT gen_random_uuid(),
    achievement_name text NOT NULL,
    achievement_desc text NOT NULL,
    PRIMARY KEY (achievement_id)
);

ALTER TABLE achievement
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE user_achievement
(
    user_id        uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    achievement_id uuid NOT NULL REFERENCES achievement (achievement_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, achievement_id)
);

-- the actual Policy

ALTER TABLE user_achievement
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE project
(
    project_id          uuid DEFAULT gen_random_uuid(),
    project_name        text NOT NULL,
    project_owner_id    uuid NOT NULL REFERENCES auth.users ON DELETE RESTRICT,
    project_profile_pic text NULL,
    project_desc        text NULL,
    PRIMARY KEY (project_id)
);

ALTER TABLE project
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can modify the projects they own"
    ON project FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = project_owner_id)
    WITH CHECK ((SELECT auth.uid()) = project_owner_id);

CREATE TABLE project_member
(
    project_id uuid NOT NULL REFERENCES project ON DELETE CASCADE,
    user_id    uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

ALTER TABLE project_member
    ENABLE ROW LEVEL SECURITY;


CREATE TABLE project_invite_link
(
    invite_id         uuid                 DEFAULT gen_random_uuid(),
    project_id        uuid        NOT NULL REFERENCES project,
    invite_creator_id uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    invite_created_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (invite_id)
);

ALTER TABLE project_invite_link
    ENABLE ROW LEVEL SECURITY;

CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE task
(
    task_id         uuid               NOT NULL DEFAULT gen_random_uuid(),
    project_id      uuid               NOT NULL REFERENCES project ON DELETE CASCADE,
    task_name       text               NOT NULL,
    task_desc       text               NULL,
    task_deadline   timestamptz        NULL,
    task_time_spent integer            NOT NULL DEFAULT 0,
    task_creator_id uuid               REFERENCES auth.users ON DELETE SET NULL,
    task_parent_id  uuid               REFERENCES task ON DELETE SET NULL,
    task_status     task_status_enum   NOT NULL DEFAULT 'TODO'::task_status_enum,
    task_priority   task_priority_enum NOT NULL DEFAULT 'MEDIUM'::task_priority_enum,
    task_location   text               NULL,
    task_is_meeting boolean            NOT NULL DEFAULT FALSE,
    PRIMARY KEY (task_id)
);

ALTER TABLE task
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE task_assignee
(
    task_id uuid NOT NULL REFERENCES task ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

ALTER TABLE task_assignee
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE task_reminder
(
    reminder_id       uuid DEFAULT gen_random_uuid(),
    task_id           uuid        NOT NULL REFERENCES task ON DELETE CASCADE,
    reminder_datetime timestamptz NOT NULL,
    PRIMARY KEY (reminder_id)
);

ALTER TABLE task_reminder
    ENABLE ROW LEVEL SECURITY;
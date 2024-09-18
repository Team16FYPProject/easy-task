-- -- First, let's create some dummy users
-- -- "$2a$10$wkJHPFspowciPpsTcxD1OOy9nZks9IWDWkwDmkqMt0xM.QR5lOLr6" is the bcrypt hash of the password "password123"
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud)
-- VALUES
--   (gen_random_uuid(), 'jcru0005@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
--   (gen_random_uuid(), 'klee0081@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
--   (gen_random_uuid(), 'oagu0001@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
--   (gen_random_uuid(), 'cche0204@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

DO $$
DECLARE
    user_ids UUID[];
    project_count INT := 5;
    i INT;
BEGIN
-- Fetch all existing user IDs from the auth.users table
SELECT ARRAY(SELECT id FROM auth.users) INTO user_ids;

-- Set the number of projects to create (minimum 1, maximum 5)
project_count := LEAST(5, GREATEST(1, array_length(user_ids, 1)));

-- Dummy data for achievement table
INSERT INTO achievement (achievement_name, achievement_desc) VALUES
('Early Bird', 'Complete 5 tasks before 9 AM'),
('Team Player', 'Collaborate on 10 different projects'),
('Deadline Crusher', 'Complete 20 tasks before their deadlines'),
('Project Master', 'Successfully complete 5 projects'),
('Multitasker', 'Have 10 tasks in progress simultaneously');

-- Dummy data for project table
FOR i IN 1..project_count LOOP
    INSERT INTO project (project_name, project_owner_id, project_profile_pic, project_desc) VALUES
    (
        'Project ' || i,
        user_ids[i],
        'project_' || i || '.png',
        'Description for Project ' || i
    );
END LOOP;

-- Dummy data for project_member table
INSERT INTO project_member (project_id, user_id)
SELECT p.project_id, u.id
FROM project p
CROSS JOIN unnest(user_ids) AS u(id);

-- Dummy data for project_invite_link table
INSERT INTO project_invite_link (project_id, invite_creator_id)
SELECT project_id, project_owner_id
FROM project;

-- Dummy data for task table
INSERT INTO task (project_id, task_name, task_desc, task_deadline, task_time_spent, task_creator_id, task_status, task_priority, task_location, task_is_meeting)
SELECT 
    p.project_id,
    'Task for ' || p.project_name,
    'Description for task in ' || p.project_name,
    NOW() + (random() * INTERVAL '30 days'),
    (random() * 300)::int,
    p.project_owner_id,
    (ARRAY['TODO', 'DOING', 'COMPLETE'])[floor(random() * 3 + 1)]::task_status_enum,
    (ARRAY['LOW', 'MEDIUM', 'HIGH'])[floor(random() * 3 + 1)]::task_priority_enum,
    CASE WHEN random() > 0.5 THEN 'Remote' ELSE 'Office' END,
    random() > 0.8
FROM project p;

-- Dummy data for task_assignee table
INSERT INTO task_assignee (task_id, user_id)
SELECT t.task_id, u.id
FROM task t
CROSS JOIN unnest(user_ids) AS u(id)
WHERE random() > 0.5;  -- 50% chance of each user being assigned to each task

-- Dummy data for task_reminder table
INSERT INTO task_reminder (task_id, reminder_datetime)
SELECT task_id, task_deadline - (random() * INTERVAL '3 days')
FROM task;

-- Dummy data for user_achievement table
INSERT INTO user_achievement (user_id, achievement_id)
SELECT u.id, a.achievement_id
FROM unnest(user_ids) AS u(id)
CROSS JOIN achievement a
WHERE random() < 0.7;  -- 70% chance of each user having each achievement

END $$;
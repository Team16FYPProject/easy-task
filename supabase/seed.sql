-- -- First, let's create some dummy users
-- -- "$2a$10$wkJHPFspowciPpsTcxD1OOy9nZks9IWDWkwDmkqMt0xM.QR5lOLr6" is the bcrypt hash of the password "password123"
INSERT INTO auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change, is_super_admin)
VALUES
  ('00000000-0000-0000-0000-000000000000','fd76e705-84df-42da-9a71-1fc6a0e215a4', 'playwright@easy-task.com', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"sub": "fd76e705-84df-42da-9a71-1fc6a0e215a4","email": "playwright@easy-task.com","last_name": "Test","first_name": "Playwright","email_verified": true,"phone_verified": false}','','','','', NULL),
  ('00000000-0000-0000-0000-000000000000','f6508257-5947-4835-a711-979cf0330777', 'jcru0005@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"sub": "f6508257-5947-4835-a711-979cf0330777","email": "jcru0005@student.monash.edu","last_name": "C","first_name": "Jesse","email_verified": true,"phone_verified": false}','','','','', NULL),
  ('00000000-0000-0000-0000-000000000000','f2c1be6b-25da-40f3-8fe1-8ec45ed5319b', 'klee0081@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"sub": "f2c1be6b-25da-40f3-8fe1-8ec45ed5319b","email": "klee0081@student.monash.edu","last_name": "L","first_name": "Khanh","email_verified": true,"phone_verified": false}','','','','', NULL),
  ('00000000-0000-0000-0000-000000000000','378fc432-b330-46dc-87ff-62bb2f24ccbb', 'oagu0001@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"sub": "378fc432-b330-46dc-87ff-62bb2f24ccbb","email": "oagu0001@student.monash.edu","last_name": "A","first_name": "Elijah","email_verified": true,"phone_verified": false}','','','','', NULL),
  ('00000000-0000-0000-0000-000000000000','86c8b615-3dca-406a-b18a-d7e631539191', 'cche0204@student.monash.edu', '$2a$10$wlgX6zexWB9xE5NhgKUBGuK35ZqXRC6xb/KeVd5WWgu2fYCh8/k62', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"sub": "86c8b615-3dca-406a-b18a-d7e631539191","email": "cche0204@student.monash.edu","last_name": "C","first_name": "Chongjie","email_verified": true,"phone_verified": false}','','','','', NULL);

INSERT INTO "auth"."identities" (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at, id) VALUES
('f6508257-5947-4835-a711-979cf0330777', 'fd76e705-84df-42da-9a71-1fc6a0e215a4', 'email', '{"sub": "fd76e705-84df-42da-9a71-1fc6a0e215a4","email": "playwright@easy-task.com","last_name": "Test","first_name": "Playwright","email_verified": true,"phone_verified": false}', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'bfe88d4c-f64b-4407-aab2-d321bb3724e8'),
('f6508257-5947-4835-a711-979cf0330777', 'f6508257-5947-4835-a711-979cf0330777', 'email', '{"sub": "f6508257-5947-4835-a711-979cf0330777","email": "jcru0005@student.monash.edu","last_name": "C","first_name": "Jesse","email_verified": true,"phone_verified": false}', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'd7dda800-8692-42e4-a7fb-6ec1d200a5e3'),
('f2c1be6b-25da-40f3-8fe1-8ec45ed5319b', 'f2c1be6b-25da-40f3-8fe1-8ec45ed5319b', 'email', '{"sub": "f2c1be6b-25da-40f3-8fe1-8ec45ed5319b","email": "klee0081@student.monash.edu","last_name": "L","first_name": "Khanh","email_verified": true,"phone_verified": false}', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'ab2dab34-2d67-48b5-8edf-83dfa35f70cd'),
('378fc432-b330-46dc-87ff-62bb2f24ccbb', '378fc432-b330-46dc-87ff-62bb2f24ccbb', 'email', '{"sub": "378fc432-b330-46dc-87ff-62bb2f24ccbb","email": "oagu0001@student.monash.edu","last_name": "A","first_name": "Elijah","email_verified": true,"phone_verified": false}', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '3c0b8a80-a862-4220-803f-331fafa7d59a'),
('86c8b615-3dca-406a-b18a-d7e631539191', '86c8b615-3dca-406a-b18a-d7e631539191', 'email', '{"sub": "86c8b615-3dca-406a-b18a-d7e631539191","email": "cche0204@student.monash.edu","last_name": "C","first_name": "Chongjie","email_verified": true,"phone_verified": false}', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', '2024-09-24 10:07:51.296459 +00:00', 'abdf6a65-c4b4-4552-a9bf-818aee68ff7a');

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
INSERT INTO achievement (achievement_id, achievement_name, achievement_desc, max_progress, icon) VALUES
(gen_random_uuid(), 'Early Bird', 'Complete 5 tasks before 9 AM', 5, '🐦'),
(gen_random_uuid(), 'Team Player', 'Collaborate on 10 different projects', 10, '🤝'),
(gen_random_uuid(), 'Deadline Crusher', 'Complete 20 tasks before their deadlines', 20, '⏰'),
(gen_random_uuid(), 'Multitasker', 'Have 10 tasks in progress simultaneously', 10, '🔄'),
(gen_random_uuid(), 'Task Master', 'Complete 50 tasks', 50, '✅'),
(gen_random_uuid(), 'Time Wizard', 'Spend 100 hours on tasks', 100, '⌛'),
(gen_random_uuid(), 'Meeting Maven', 'Attend 20 project meetings', 20, '💼'),
(gen_random_uuid(), 'Task Organizer', 'Create 25 tasks with all fields filled', 25, '📝');

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
    'Task ' || t.task_num,
    'Description for Task ' || t.task_num || ' in ' || p.project_name,
    NOW() + (random() * INTERVAL '60 days'),
    (random() * 600)::int,
    (SELECT id FROM auth.users ORDER BY random() LIMIT 1),
    (ARRAY['TODO', 'DOING', 'COMPLETE'])[floor(random() * 3 + 1)]::task_status_enum,
    (ARRAY['LOW', 'MEDIUM', 'HIGH'])[floor(random() * 3 + 1)]::task_priority_enum,
    CASE
        WHEN random() < 0.6 THEN 'Remote'
        WHEN random() < 0.9 THEN 'Office'
        ELSE 'On-site'
    END,
    random() < 0.2  -- 20% chance of being a meeting
FROM
    project p,
    generate_series(1, 10) AS t(task_num);

-- Dummy data for task_assignee table
INSERT INTO task_assignee (task_id, user_id)
SELECT t.task_id, u.id
FROM task t
CROSS JOIN unnest(user_ids) AS u(id)
WHERE random() > 0.5;  -- 50% chance of each user being assigned to each task

-- Dummy data for task_reminder table
-- INSERT INTO task_reminder (task_id, reminder_datetime)
-- SELECT task_id, task_deadline - (random() * INTERVAL '3 days')
-- FROM task;

-- Dummy data for user_achievement table
INSERT INTO user_achievement (user_id, achievement_id, progress, completed, completed_at)
SELECT
    u.id,
    a.achievement_id,
    progress,
    CASE
        WHEN progress = a.max_progress THEN TRUE
        ELSE FALSE
    END AS completed,
    CASE
        WHEN progress = a.max_progress THEN NOW() - (random() * INTERVAL '30 days')
        ELSE NULL
    END AS completed_at
FROM
    unnest(user_ids) AS u(id)
CROSS JOIN
    achievement a,
    LATERAL (
        SELECT floor(random() * (a.max_progress + 1))::INTEGER AS progress
    ) AS subquery;

-- Update progress and completed status
UPDATE user_achievement ua
SET
    progress = LEAST(ua.progress + floor(random() * 10)::INTEGER, a.max_progress),
    completed = ua.progress >= a.max_progress,
    completed_at = CASE
        WHEN ua.progress >= a.max_progress THEN NOW() - (random() * INTERVAL '30 days')
        ELSE NULL
    END
FROM
    achievement a
WHERE
    ua.achievement_id = a.achievement_id;

END $$;
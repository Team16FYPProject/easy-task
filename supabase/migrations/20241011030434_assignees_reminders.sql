CREATE TYPE task_reminder_type_enum AS ENUM ('OneHour', 'OneDay', 'OneWeek');
ALTER TABLE "task_reminder"
ADD COLUMN "type" task_reminder_type_enum NOT NULL DEFAULT 'OneHour';

-- ALTER TABLE "task_reminder"
-- ADD CONSTRAINT unique_type_task_id UNIQUE ("type", "task_id");
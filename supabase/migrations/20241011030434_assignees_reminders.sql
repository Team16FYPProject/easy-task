CREATE TYPE task_reminder_type_enum AS ENUM ('1H', '1D', '1W');
ALTER TABLE "task_reminder"
ADD COLUMN "type" task_reminder_type_enum NOT NULL;

ALTER TABLE "task_reminder"
ADD CONSTRAINT unique_type_task_id UNIQUE ("type", "task_id");
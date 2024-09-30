-- Modify Achievement Table
ALTER TABLE
    achievement
ADD
    COLUMN max_progress INTEGER NOT NULL DEFAULT 1,
ADD
    COLUMN icon TEXT;

-- If you want to keep track of when achievements are created:
ALTER TABLE
    achievement
ADD
    COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Modify User Achievement Table
ALTER TABLE
    user_achievement
ADD
    COLUMN progress INTEGER NOT NULL DEFAULT 0,
ADD
    COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD
    COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Create an index to improve query performance
CREATE INDEX idx_user_achievement_user_id ON user_achievement(user_id);

CREATE
OR REPLACE FUNCTION update_user_achievement(
    p_user_id UUID,
    p_achievement_name TEXT,
    p_progress INTEGER
) RETURNS VOID AS $function$ DECLARE v_achievement_id UUID;

v_max_progress INTEGER;

v_current_progress INTEGER;

BEGIN -- Get the achievement ID and max progress
SELECT
    achievement_id,
    max_progress INTO v_achievement_id,
    v_max_progress
FROM
    achievement
WHERE
    achievement_name = p_achievement_name;

IF NOT FOUND THEN RAISE EXCEPTION 'Achievement not found: %',
p_achievement_name;

END IF;

-- Insert or update the user achievement
INSERT INTO
    user_achievement (
        user_id,
        achievement_id,
        progress,
        completed,
        completed_at
    )
VALUES
    (
        p_user_id,
        v_achievement_id,
        LEAST(p_progress, v_max_progress),
        p_progress >= v_max_progress,
        CASE
            WHEN p_progress >= v_max_progress THEN CURRENT_TIMESTAMP
            ELSE NULL
        END
    ) ON CONFLICT (user_id, achievement_id) DO
UPDATE
SET
    progress = LEAST(
        user_achievement.progress + EXCLUDED.progress,
        v_max_progress
    ),
    completed = user_achievement.progress + EXCLUDED.progress >= v_max_progress,
    completed_at = CASE
        WHEN user_achievement.progress + EXCLUDED.progress >= v_max_progress
        AND user_achievement.completed_at IS NULL THEN CURRENT_TIMESTAMP
        ELSE user_achievement.completed_at
    END;

END;

$function$ LANGUAGE plpgsql;

-- Achievement Triggers
-- Trigger for task completion
CREATE
OR REPLACE FUNCTION update_task_completion_achievement() RETURNS TRIGGER AS $function$ BEGIN IF NEW.task_status = 'COMPLETE'
AND OLD.task_status != 'COMPLETE' THEN PERFORM update_user_achievement(NEW.task_creator_id, 'Complete tasks', 1);

END IF;

RETURN NEW;

END;

$function$ LANGUAGE plpgsql;

CREATE TRIGGER task_completion_achievement_trigger
AFTER
UPDATE
    ON task FOR EACH ROW EXECUTE FUNCTION update_task_completion_achievement();

-- Trigger for time spent on tasks
CREATE
OR REPLACE FUNCTION update_time_spent_achievement() RETURNS TRIGGER AS $function$ BEGIN IF NEW.task_time_spent > OLD.task_time_spent THEN PERFORM update_user_achievement(
    NEW.task_creator_id,
    'Time spent on tasks',
    NEW.task_time_spent - OLD.task_time_spent
);

END IF;

RETURN NEW;

END;

$function$ LANGUAGE plpgsql;

CREATE TRIGGER time_spent_achievement_trigger
AFTER
UPDATE
    ON task FOR EACH ROW EXECUTE FUNCTION update_time_spent_achievement();

-- Achievement Progress View
CREATE
OR REPLACE VIEW user_achievement_progress AS
SELECT
    p.user_id,
    p.email,
    a.achievement_id,
    a.achievement_name,
    a.achievement_desc,
    a.max_progress,
    COALESCE(ua.progress, 0) as progress,
    COALESCE(ua.completed, FALSE) as completed,
    ua.completed_at
FROM
    profile p
    CROSS JOIN achievement a
    LEFT JOIN user_achievement ua ON p.user_id = ua.user_id
    AND a.achievement_id = ua.achievement_id;
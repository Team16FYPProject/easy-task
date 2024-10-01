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
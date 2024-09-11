CREATE POLICY "Users can view their own achievements"
    ON user_achievement FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
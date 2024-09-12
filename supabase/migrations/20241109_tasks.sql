CREATE POLICY "Allow task updates for project members" ON task
FOR UPDATE
  TO authenticated USING (
    task.project_id IN (
      SELECT
        project_id
      FROM
        project_member
      WHERE
        user_id = (SELECT auth.uid ())
    )
  );
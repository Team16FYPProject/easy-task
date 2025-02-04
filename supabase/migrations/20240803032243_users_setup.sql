CREATE TABLE public.profile
(
    user_id              UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    email                TEXT NOT NULL,
    first_name           TEXT NOT NULL DEFAULT '',
    last_name            TEXT NOT NULL DEFAULT '',
    profile_display_name TEXT          DEFAULT NULL,
    profile_bio          TEXT          DEFAULT NULL,
    profile_avatar       TEXT          DEFAULT NULL,
    PRIMARY KEY (user_id)
);

ALTER TABLE public.profile
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can be seen by any logged in user"
    ON profile FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can modify their profiles"
    ON profile FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- inserts a row into public.profiles
CREATE FUNCTION public.create_profile_for_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = ''
AS
$$
BEGIN
    INSERT INTO public.profile (user_id, email, first_name, last_name)
    VALUES (new.id, new.email, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
    RETURN new;
END;
$$;

-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT
    ON auth.users
    FOR EACH ROW
EXECUTE PROCEDURE public.create_profile_for_new_user();
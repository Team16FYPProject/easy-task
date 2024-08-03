CREATE TABLE public.profile
(
    user_id              UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    profile_display_name TEXT DEFAULT NULL,
    profile_bio          TEXT DEFAULT NULL,
    profile_avatar       TEXT DEFAULT NULL,
    PRIMARY KEY (user_id)
);

ALTER TABLE public.profile
    ENABLE ROW LEVEL SECURITY;

-- inserts a row into public.profiles
CREATE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = ''
AS
$$
BEGIN
    INSERT INTO public.profile (user_id)
    VALUES (new.id);
    RETURN new;
END;
$$;

-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT
    ON auth.users
    FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
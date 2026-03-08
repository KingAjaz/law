-- Add a secure function to allow users to delete their own account
-- This function needs SECURITY DEFINER to bypass RLS and delete from auth.users

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get the ID of the currently authenticated user calling this function
    v_user_id := auth.uid();
    
    -- Ensure the user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete the user from auth.users. 
    -- Assuming foreign keys in public schema have ON DELETE CASCADE setup,
    -- this will also delete their profile, KYC data, contracts, etc.
    DELETE FROM auth.users WHERE id = v_user_id;

END;
$$;

-- Grant execution permission only to authenticated users
REVOKE ALL ON FUNCTION delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

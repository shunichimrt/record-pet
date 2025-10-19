-- Create a function to create family and add the creator as admin in one transaction
-- This bypasses the SELECT policy issue

CREATE OR REPLACE FUNCTION create_family_with_admin(
  family_name TEXT,
  user_role TEXT
)
RETURNS TABLE(
  family_id UUID,
  family_name_out TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_family_id UUID;
  new_family_name TEXT;
BEGIN
  -- Insert the family
  INSERT INTO families (name)
  VALUES (family_name)
  RETURNING id, name INTO new_family_id, new_family_name;

  -- Add the current user as an admin member
  INSERT INTO family_members (family_id, user_id, role, is_admin)
  VALUES (new_family_id, auth.uid(), user_role, true);

  -- Return the family details
  RETURN QUERY SELECT new_family_id, new_family_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_family_with_admin(TEXT, TEXT) TO authenticated;

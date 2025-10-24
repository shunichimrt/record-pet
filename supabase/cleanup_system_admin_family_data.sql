-- Cleanup family and pet data for system administrator
-- User ID: 1c53da26-7d3e-4bc3-8ae5-772d6a6457ac

-- Step 1: Check current status
-- Run this first to see what will be deleted

-- Check family membership
SELECT
  fm.id as membership_id,
  fm.family_id,
  f.name as family_name,
  fm.role,
  fm.is_admin,
  fm.joined_at
FROM family_members fm
JOIN families f ON f.id = fm.family_id
WHERE fm.user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac';

-- Check if there are other members in the same family
SELECT
  f.id as family_id,
  f.name as family_name,
  COUNT(fm.id) as total_members,
  COUNT(CASE WHEN fm.is_admin THEN 1 END) as admin_count
FROM families f
JOIN family_members fm ON fm.family_id = f.id
WHERE f.id IN (
  SELECT family_id
  FROM family_members
  WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac'
)
GROUP BY f.id, f.name;

-- Check pets in the family
SELECT
  p.id as pet_id,
  p.name as pet_name,
  p.species,
  p.family_id,
  f.name as family_name
FROM pets p
JOIN families f ON f.id = p.family_id
WHERE p.family_id IN (
  SELECT family_id
  FROM family_members
  WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac'
);

-- Step 2: Delete data
-- After confirming the above, run this to delete

-- Get the family_id first
DO $$
DECLARE
  target_family_id UUID;
  member_count INTEGER;
BEGIN
  -- Get the family_id for this user
  SELECT family_id INTO target_family_id
  FROM family_members
  WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac'
  LIMIT 1;

  IF target_family_id IS NULL THEN
    RAISE NOTICE 'User is not a member of any family';
    RETURN;
  END IF;

  -- Count total members in the family
  SELECT COUNT(*) INTO member_count
  FROM family_members
  WHERE family_id = target_family_id;

  RAISE NOTICE 'Family ID: %, Total members: %', target_family_id, member_count;

  -- If this user is the only member, delete the entire family (cascade will delete pets)
  IF member_count = 1 THEN
    RAISE NOTICE 'Deleting entire family and all related data...';

    -- Delete share tokens
    DELETE FROM share_tokens
    WHERE pet_id IN (SELECT id FROM pets WHERE family_id = target_family_id);

    -- Delete all family data (pets will be cascade deleted)
    DELETE FROM families WHERE id = target_family_id;

    RAISE NOTICE 'Family deleted successfully';
  ELSE
    -- If there are other members, only remove this user from the family
    RAISE NOTICE 'Removing user from family (other members exist)...';

    DELETE FROM family_members
    WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac';

    RAISE NOTICE 'User removed from family successfully';
  END IF;
END $$;

-- Step 3: Verify deletion
SELECT
  'family_members' as table_name,
  COUNT(*) as remaining_records
FROM family_members
WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac'
UNION ALL
SELECT
  'admin_users' as table_name,
  COUNT(*) as remaining_records
FROM admin_users
WHERE user_id = '1c53da26-7d3e-4bc3-8ae5-772d6a6457ac';

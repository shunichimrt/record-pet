-- Separate system administrators from regular users
-- System admins can ONLY access /admin, not /app
-- Regular users can ONLY access /app, not /admin

-- Add flag to mark system-only administrators
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS is_system_only BOOLEAN DEFAULT TRUE;

-- Update existing admin users to be system-only by default
UPDATE admin_users SET is_system_only = TRUE WHERE is_system_only IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN admin_users.is_system_only IS
'If true, this user is a system administrator who can ONLY access /admin.
If false, this would be a special case (not recommended).
System admins should not be family members.';

-- System administrators should not be in family_members table
-- This is enforced at application level, but we add a check constraint for safety
-- Note: We don't add a constraint here because it would require complex validation
-- Instead, we rely on application logic to prevent system admins from joining families

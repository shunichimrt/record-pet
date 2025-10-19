-- Verify and fix all RLS policies for families and family_members tables

-- ============================================
-- FAMILIES TABLE POLICIES
-- ============================================

-- Drop all existing policies on families
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Admins can update families" ON families;
DROP POLICY IF EXISTS "Admins can delete families" ON families;

-- Recreate INSERT policy (anyone authenticated can create a family)
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recreate UPDATE policy (only admins can update)
CREATE POLICY "Admins can update families"
  ON families
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Recreate DELETE policy (only admins can delete)
CREATE POLICY "Admins can delete families"
  ON families
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- FAMILY_MEMBERS TABLE POLICIES
-- ============================================

-- Drop all existing policies on family_members
DROP POLICY IF EXISTS "Users can add themselves to families" ON family_members;
DROP POLICY IF EXISTS "Admins can add members to their families" ON family_members;
DROP POLICY IF EXISTS "Admins can update members" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Admins can remove members from their families" ON family_members;

-- Recreate INSERT policy (users can add themselves)
CREATE POLICY "Users can add themselves to families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Recreate INSERT policy (admins can add other members)
CREATE POLICY "Admins can add members to their families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Recreate UPDATE policy (admins can update member roles)
CREATE POLICY "Admins can update members"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Recreate DELETE policy (users can leave families)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Recreate DELETE policy (admins can remove members)
CREATE POLICY "Admins can remove members from their families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

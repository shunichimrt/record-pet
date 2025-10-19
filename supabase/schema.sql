-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'other' CHECK (role IN ('father', 'mother', 'son', 'daughter', 'other')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Enable RLS on families
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
-- Users can view families they are members of
CREATE POLICY "Users can view their families"
  ON families
  FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Users can create new families
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  WITH CHECK (true);

-- Only admins can update families
CREATE POLICY "Admins can update families"
  ON families
  FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can delete families
CREATE POLICY "Admins can delete families"
  ON families
  FOR DELETE
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Enable RLS on family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
-- Users can view members of their families
CREATE POLICY "Users can view their family members"
  ON family_members
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Users can add themselves to a family (for joining flow)
CREATE POLICY "Users can add themselves to families"
  ON family_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can add other members to their families
CREATE POLICY "Admins can add members to their families"
  ON family_members
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update member roles
CREATE POLICY "Admins can update members"
  ON family_members
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Users can leave families
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can remove members from their families
CREATE POLICY "Admins can remove members from their families"
  ON family_members
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for families
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

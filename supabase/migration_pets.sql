-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- dog, cat, bird, etc.
  breed TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
-- Users can view pets in their families
CREATE POLICY "Users can view their family pets"
  ON pets
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Family members can create pets
CREATE POLICY "Family members can create pets"
  ON pets
  FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Family members can update their family pets
CREATE POLICY "Family members can update pets"
  ON pets
  FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Admins can delete pets
CREATE POLICY "Admins can delete pets"
  ON pets
  FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_family_id ON pets(family_id);

-- Create trigger for pets updated_at
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create share_tokens table
CREATE TABLE IF NOT EXISTS share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_share_tokens_pet_id ON share_tokens(pet_id);

-- Enable RLS on share_tokens
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_tokens
-- Users can view tokens for their family pets
CREATE POLICY "Users can view tokens for their family pets"
  ON share_tokens
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Family members can create tokens for their pets
CREATE POLICY "Family members can create share tokens"
  ON share_tokens
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Family members can update tokens (revoke)
CREATE POLICY "Family members can update share tokens"
  ON share_tokens
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Family members can delete tokens
CREATE POLICY "Family members can delete share tokens"
  ON share_tokens
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Fix share_tokens RLS to allow public (anonymous) access for viewing
-- Public users need to be able to SELECT share_tokens to verify the token

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view tokens for their family pets" ON share_tokens;

-- Create a new policy that allows:
-- 1. Authenticated users can view tokens for their family pets
-- 2. Anonymous users (public) can view any active, non-expired token
CREATE POLICY "Anyone can view active share tokens"
  ON share_tokens
  FOR SELECT
  USING (
    is_active = true
    AND expires_at > NOW()
  );

-- Also need to allow public access to pets table for shared views
-- Drop existing SELECT policy on pets
DROP POLICY IF EXISTS "Users can view their family pets" ON pets;
DROP POLICY IF EXISTS "Users can view their family pets or shared pets" ON pets;

-- Recreate with public access for shared pets
CREATE POLICY "Users can view their family pets or shared pets"
  ON pets
  FOR SELECT
  USING (
    -- Family members can view their pets
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
    OR
    -- Anyone can view pets that have active share tokens
    id IN (
      SELECT pet_id FROM share_tokens
      WHERE is_active = true
      AND expires_at > NOW()
    )
  );

-- Allow public access to pet activity data for shared pets
-- Pet walks
DROP POLICY IF EXISTS "Users can view walks for their family pets" ON pet_walks;
DROP POLICY IF EXISTS "Users can view walks for their family pets or shared pets" ON pet_walks;

CREATE POLICY "Users can view walks for their family pets or shared pets"
  ON pet_walks
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    OR
    pet_id IN (
      SELECT pet_id FROM share_tokens
      WHERE is_active = true
      AND expires_at > NOW()
    )
  );

-- Pet meals
DROP POLICY IF EXISTS "Users can view meals for their family pets" ON pet_meals;
DROP POLICY IF EXISTS "Users can view meals for their family pets or shared pets" ON pet_meals;

CREATE POLICY "Users can view meals for their family pets or shared pets"
  ON pet_meals
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    OR
    pet_id IN (
      SELECT pet_id FROM share_tokens
      WHERE is_active = true
      AND expires_at > NOW()
    )
  );

-- Pet traits
DROP POLICY IF EXISTS "Users can view traits for their family pets" ON pet_traits;
DROP POLICY IF EXISTS "Users can view traits for their family pets or shared pets" ON pet_traits;

CREATE POLICY "Users can view traits for their family pets or shared pets"
  ON pet_traits
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    OR
    pet_id IN (
      SELECT pet_id FROM share_tokens
      WHERE is_active = true
      AND expires_at > NOW()
    )
  );

-- Pet meta
DROP POLICY IF EXISTS "Users can view meta for their family pets" ON pet_meta;
DROP POLICY IF EXISTS "Users can view meta for their family pets or shared pets" ON pet_meta;

CREATE POLICY "Users can view meta for their family pets or shared pets"
  ON pet_meta
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
    OR
    pet_id IN (
      SELECT pet_id FROM share_tokens
      WHERE is_active = true
      AND expires_at > NOW()
    )
  );

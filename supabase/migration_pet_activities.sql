-- Create pet_walks table
CREATE TABLE IF NOT EXISTS pet_walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  walked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  distance_km NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pet_meals table
CREATE TABLE IF NOT EXISTS pet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  fed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  food_type TEXT,
  amount TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pet_traits table
CREATE TABLE IF NOT EXISTS pet_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  trait_name TEXT NOT NULL,
  trait_value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pet_meta table
CREATE TABLE IF NOT EXISTS pet_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  meta_key TEXT NOT NULL,
  meta_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, meta_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pet_walks_pet_id ON pet_walks(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_walks_walked_at ON pet_walks(walked_at);
CREATE INDEX IF NOT EXISTS idx_pet_meals_pet_id ON pet_meals(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_meals_fed_at ON pet_meals(fed_at);
CREATE INDEX IF NOT EXISTS idx_pet_traits_pet_id ON pet_traits(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_meta_pet_id ON pet_meta(pet_id);

-- Enable RLS on all tables
ALTER TABLE pet_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_meta ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_walks
CREATE POLICY "Users can view walks for their family pets"
  ON pet_walks
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create walks"
  ON pet_walks
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update walks"
  ON pet_walks
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete walks"
  ON pet_walks
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for pet_meals
CREATE POLICY "Users can view meals for their family pets"
  ON pet_meals
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create meals"
  ON pet_meals
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update meals"
  ON pet_meals
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete meals"
  ON pet_meals
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for pet_traits
CREATE POLICY "Users can view traits for their family pets"
  ON pet_traits
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create traits"
  ON pet_traits
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update traits"
  ON pet_traits
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete traits"
  ON pet_traits
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for pet_meta
CREATE POLICY "Users can view meta for their family pets"
  ON pet_meta
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create meta"
  ON pet_meta
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update meta"
  ON pet_meta
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete meta"
  ON pet_meta
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_pet_traits_updated_at
  BEFORE UPDATE ON pet_traits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_meta_updated_at
  BEFORE UPDATE ON pet_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create pet_health_records table
CREATE TABLE IF NOT EXISTS pet_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 食欲レベル (1-5スケール)
  appetite_level INTEGER CHECK (appetite_level BETWEEN 1 AND 5),

  -- トイレ記録
  bathroom_times INTEGER, -- 回数
  bathroom_notes TEXT,    -- 状態メモ

  -- 気分・活動レベル (1-5スケール)
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5),
  activity_level INTEGER CHECK (activity_level BETWEEN 1 AND 5),

  -- 体調メモ
  health_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pet_health_records_pet_id ON pet_health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_health_records_recorded_at ON pet_health_records(recorded_at);

-- Enable RLS
ALTER TABLE pet_health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_health_records
CREATE POLICY "Users can view health records for their family pets"
  ON pet_health_records
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create health records"
  ON pet_health_records
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update health records"
  ON pet_health_records
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete health records"
  ON pet_health_records
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pet_health_records_updated_at
  BEFORE UPDATE ON pet_health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

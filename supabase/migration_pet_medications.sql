-- Create pet_medications table
CREATE TABLE IF NOT EXISTS pet_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,                    -- 用量
  frequency TEXT,                 -- 頻度（朝、夜など）
  start_date DATE NOT NULL,
  end_date DATE,                  -- 終了日（治療完了時）
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE, -- 現在投薬中かどうか
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pet_medication_logs table
CREATE TABLE IF NOT EXISTS pet_medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES pet_medications(id) ON DELETE CASCADE,
  given_at TIMESTAMPTZ NOT NULL,  -- 投薬した日時
  given_by UUID REFERENCES auth.users(id), -- 誰が投薬したか
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pet_medications_pet_id ON pet_medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_medications_start_date ON pet_medications(start_date);
CREATE INDEX IF NOT EXISTS idx_pet_medications_is_active ON pet_medications(is_active);
CREATE INDEX IF NOT EXISTS idx_pet_medication_logs_medication_id ON pet_medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_pet_medication_logs_given_at ON pet_medication_logs(given_at);

-- Enable RLS
ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_medications
CREATE POLICY "Users can view medications for their family pets"
  ON pet_medications
  FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can create medications"
  ON pet_medications
  FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update medications"
  ON pet_medications
  FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete medications"
  ON pet_medications
  FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for pet_medication_logs
CREATE POLICY "Users can view medication logs for their family pets"
  ON pet_medication_logs
  FOR SELECT
  USING (
    medication_id IN (
      SELECT id FROM pet_medications WHERE pet_id IN (
        SELECT id FROM pets WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Family members can create medication logs"
  ON pet_medication_logs
  FOR INSERT
  WITH CHECK (
    medication_id IN (
      SELECT id FROM pet_medications WHERE pet_id IN (
        SELECT id FROM pets WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Family members can update medication logs"
  ON pet_medication_logs
  FOR UPDATE
  USING (
    medication_id IN (
      SELECT id FROM pet_medications WHERE pet_id IN (
        SELECT id FROM pets WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Family members can delete medication logs"
  ON pet_medication_logs
  FOR DELETE
  USING (
    medication_id IN (
      SELECT id FROM pet_medications WHERE pet_id IN (
        SELECT id FROM pets WHERE family_id IN (
          SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_pet_medications_updated_at
  BEFORE UPDATE ON pet_medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

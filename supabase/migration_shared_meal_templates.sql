-- Create shared_meal_templates table for users to share meal recipes
-- Users can save their meal combinations as templates for others to use

CREATE TABLE IF NOT EXISTS shared_meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- テンプレート名（例: 朝ごはんセット、ダイエット食）
  description TEXT,                       -- 説明
  species TEXT,                           -- 対象種（dog, cat, etc）

  -- 食材情報（複数の食材を組み合わせ可能）
  food_items JSONB NOT NULL,              -- [{food_product_id: uuid, amount_grams: 100, food_name: "..."}]
  total_calories NUMERIC(6, 2),           -- 総カロリー

  -- 統計情報
  use_count INTEGER DEFAULT 0,            -- 使用回数
  like_count INTEGER DEFAULT 0,           -- いいね数

  -- メタ情報
  is_public BOOLEAN DEFAULT TRUE,         -- 公開/非公開
  created_by UUID REFERENCES auth.users(id), -- 作成者
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 検索用
  tags TEXT[]                             -- タグ（朝食、夕食、ダイエット、など）
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_meal_templates_species ON shared_meal_templates(species);
CREATE INDEX IF NOT EXISTS idx_shared_meal_templates_public ON shared_meal_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_shared_meal_templates_use_count ON shared_meal_templates(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_shared_meal_templates_created_by ON shared_meal_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_meal_templates_tags ON shared_meal_templates USING GIN(tags);

-- Enable RLS
ALTER TABLE shared_meal_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view public templates
CREATE POLICY "Anyone can view public meal templates"
  ON shared_meal_templates
  FOR SELECT
  USING (is_public = TRUE);

-- Users can view their own templates (including private)
CREATE POLICY "Users can view own meal templates"
  ON shared_meal_templates
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Users can create templates
CREATE POLICY "Users can create meal templates"
  ON shared_meal_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own meal templates"
  ON shared_meal_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete own meal templates"
  ON shared_meal_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_shared_meal_templates_updated_at
  BEFORE UPDATE ON shared_meal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create table for template likes
CREATE TABLE IF NOT EXISTS meal_template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES shared_meal_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Enable RLS for likes
ALTER TABLE meal_template_likes ENABLE ROW LEVEL SECURITY;

-- RLS for likes
CREATE POLICY "Users can view all likes"
  ON meal_template_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON meal_template_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON meal_template_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to increment use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_meal_templates
  SET use_count = use_count + 1
  WHERE id = template_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_template_use_count(UUID) TO authenticated;

-- Function to toggle like
CREATE OR REPLACE FUNCTION toggle_template_like(template_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_like UUID;
  is_liked BOOLEAN;
BEGIN
  -- Check if already liked
  SELECT id INTO existing_like
  FROM meal_template_likes
  WHERE template_id = toggle_template_like.template_id
    AND user_id = auth.uid();

  IF existing_like IS NOT NULL THEN
    -- Unlike
    DELETE FROM meal_template_likes WHERE id = existing_like;
    UPDATE shared_meal_templates
    SET like_count = like_count - 1
    WHERE id = toggle_template_like.template_id;
    is_liked := FALSE;
  ELSE
    -- Like
    INSERT INTO meal_template_likes (template_id, user_id)
    VALUES (toggle_template_like.template_id, auth.uid());
    UPDATE shared_meal_templates
    SET like_count = like_count + 1
    WHERE id = toggle_template_like.template_id;
    is_liked := TRUE;
  END IF;

  RETURN is_liked;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_template_like(UUID) TO authenticated;

-- Insert sample templates
INSERT INTO shared_meal_templates (
  name,
  description,
  species,
  food_items,
  total_calories,
  tags,
  created_by
) VALUES
(
  '標準的な朝ごはん（小型犬）',
  'ドライフードとウェットフードを組み合わせた栄養バランスの良い朝食',
  'dog',
  '[
    {"food_name": "ドライフード", "amount_grams": 50, "calories": 194.5},
    {"food_name": "ウェットフード", "amount_grams": 30, "calories": 25.5}
  ]'::jsonb,
  220.0,
  ARRAY['朝食', '小型犬', 'バランス'],
  NULL
),
(
  '猫用ダイエット食',
  '低カロリーで満足感のある食事',
  'cat',
  '[
    {"food_name": "ダイエット用ドライフード", "amount_grams": 40, "calories": 140.0},
    {"food_name": "野菜ミックス", "amount_grams": 10, "calories": 5.0}
  ]'::jsonb,
  145.0,
  ARRAY['ダイエット', '猫', '低カロリー'],
  NULL
),
(
  '栄養補給セット（老犬）',
  'シニア犬向けの消化しやすい栄養豊富な食事',
  'dog',
  '[
    {"food_name": "シニア用フード", "amount_grams": 60, "calories": 210.0},
    {"food_name": "鶏肉（茹で）", "amount_grams": 20, "calories": 33.0}
  ]'::jsonb,
  243.0,
  ARRAY['シニア', '老犬', '栄養補給'],
  NULL
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE shared_meal_templates IS
'Shared meal templates that users can use as recipes for their pets.
Other users can browse and use these templates to record meals quickly.';

COMMENT ON COLUMN shared_meal_templates.food_items IS
'JSONB array of food items: [{food_product_id?: uuid, food_name: string, amount_grams: number, calories: number}]';

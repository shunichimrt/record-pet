-- Create ad_banners table for managing advertisement banners
-- System administrators can create and manage banners from /admin/banners

CREATE TABLE IF NOT EXISTS ad_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                    -- バナーのタイトル
  description TEXT,                       -- バナーの説明文
  image_url TEXT,                         -- バナー画像URL（Supabase Storage）
  link_url TEXT NOT NULL,                 -- クリック時の遷移先URL
  is_active BOOLEAN DEFAULT TRUE,         -- 有効/無効
  display_position TEXT DEFAULT 'dashboard', -- 表示位置（dashboard, pet_detail, both）
  display_order INTEGER DEFAULT 0,        -- 表示順序（小さい方が先）
  background_color TEXT DEFAULT 'from-blue-50 to-purple-50', -- 背景グラデーション
  text_color TEXT DEFAULT 'text-gray-800', -- テキストカラー
  start_date TIMESTAMPTZ,                 -- 表示開始日時（NULL=即座に開始）
  end_date TIMESTAMPTZ,                   -- 表示終了日時（NULL=無期限）
  click_count INTEGER DEFAULT 0,          -- クリック数（トラッキング用）
  created_by UUID REFERENCES auth.users(id), -- 作成者（システム管理者）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_banners_active ON ad_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_banners_position ON ad_banners(display_position);
CREATE INDEX IF NOT EXISTS idx_ad_banners_order ON ad_banners(display_order);
CREATE INDEX IF NOT EXISTS idx_ad_banners_dates ON ad_banners(start_date, end_date);

-- Enable RLS
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view active banners (for display on user pages)
CREATE POLICY "Anyone can view active banners"
  ON ad_banners
  FOR SELECT
  USING (
    is_active = TRUE
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Only authenticated users can view all banners (including inactive)
CREATE POLICY "Authenticated users can view all banners"
  ON ad_banners
  FOR SELECT
  TO authenticated
  USING (true);

-- Only system admins can insert banners
CREATE POLICY "System admins can create banners"
  ON ad_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

-- Only system admins can update banners
CREATE POLICY "System admins can update banners"
  ON ad_banners
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

-- Only system admins can delete banners
CREATE POLICY "System admins can delete banners"
  ON ad_banners
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON ad_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad-banners bucket
CREATE POLICY "Anyone can view banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-banners');

CREATE POLICY "System admins can upload banner images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ad-banners'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

CREATE POLICY "System admins can update banner images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ad-banners'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

CREATE POLICY "System admins can delete banner images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ad-banners'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_system_only = TRUE
    )
  );

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_banner_click(banner_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ad_banners
  SET click_count = click_count + 1
  WHERE id = banner_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_banner_click(UUID) TO anon, authenticated;

-- Insert sample banner for One Kitchen
INSERT INTO ad_banners (
  title,
  description,
  link_url,
  display_position,
  display_order,
  is_active
) VALUES (
  'One Kitchen - ペット用プレミアムフード',
  '愛するペットのために、厳選素材で作られた栄養バランス抜群のフードをお届けします',
  'https://onekitchen.jp',
  'both',
  0,
  TRUE
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE ad_banners IS
'Advertisement banners managed by system administrators.
Displayed on user pages (dashboard, pet details) based on position and date range.';

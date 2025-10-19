-- Create storage bucket for pet avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-avatars', 'pet-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pet-avatars bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload pet avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-avatars' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM family_members
  )
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update pet avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-avatars' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM family_members
  )
);

-- Allow authenticated users to delete pet avatars
CREATE POLICY "Admins can delete pet avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-avatars' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM family_members WHERE is_admin = true
  )
);

-- Allow public read access to pet avatars
CREATE POLICY "Public can view pet avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-avatars');

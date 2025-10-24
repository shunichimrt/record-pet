-- Create functions for system administrators to get statistics
-- These functions bypass RLS to get accurate system-wide data

-- Function to get total user count (from auth.users, excluding system admins)
CREATE OR REPLACE FUNCTION get_total_users_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count all users in auth.users, excluding system administrators
  SELECT COUNT(*)::INTEGER INTO user_count
  FROM auth.users u
  WHERE u.deleted_at IS NULL
    AND u.id NOT IN (
      SELECT user_id FROM admin_users WHERE is_system_only = TRUE
    );

  RETURN user_count;
END;
$$;

-- Function to get total pets count (bypass RLS)
CREATE OR REPLACE FUNCTION get_total_pets_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pet_count INTEGER;
BEGIN
  -- Count all pets (bypass RLS)
  SELECT COUNT(*)::INTEGER INTO pet_count
  FROM pets;

  RETURN pet_count;
END;
$$;

-- Function to get total families count
CREATE OR REPLACE FUNCTION get_total_families_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  family_count INTEGER;
BEGIN
  -- Count all families
  SELECT COUNT(*)::INTEGER INTO family_count
  FROM families;

  RETURN family_count;
END;
$$;

-- Function to get total food products count
CREATE OR REPLACE FUNCTION get_total_food_products_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Count all food products
  SELECT COUNT(*)::INTEGER INTO product_count
  FROM pet_food_products;

  RETURN product_count;
END;
$$;

-- Function to get public food products count
CREATE OR REPLACE FUNCTION get_public_food_products_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_count INTEGER;
BEGIN
  -- Count public food products
  SELECT COUNT(*)::INTEGER INTO product_count
  FROM pet_food_products
  WHERE is_public = TRUE;

  RETURN product_count;
END;
$$;

-- Function to get system statistics (returns JSON)
CREATE OR REPLACE FUNCTION get_system_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (
      SELECT COUNT(*) FROM auth.users u
      WHERE u.deleted_at IS NULL
        AND u.id NOT IN (SELECT user_id FROM admin_users WHERE is_system_only = TRUE)
    ),
    'total_system_admins', (SELECT COUNT(*) FROM admin_users WHERE is_system_only = TRUE),
    'total_families', (SELECT COUNT(*) FROM families),
    'total_pets', (SELECT COUNT(*) FROM pets),
    'total_food_products', (SELECT COUNT(*) FROM pet_food_products),
    'public_food_products', (SELECT COUNT(*) FROM pet_food_products WHERE is_public = TRUE),
    'private_food_products', (SELECT COUNT(*) FROM pet_food_products WHERE is_public = FALSE),
    'total_walks', (SELECT COUNT(*) FROM pet_walks),
    'total_meals', (SELECT COUNT(*) FROM pet_meals),
    'total_health_records', (SELECT COUNT(*) FROM pet_health_records),
    'total_medications', (SELECT COUNT(*) FROM pet_medications)
  ) INTO stats;

  RETURN stats;
END;
$$;

-- Grant execute permission to authenticated users
-- (Only system admins will call these, but we need to grant permission)
GRANT EXECUTE ON FUNCTION get_total_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_pets_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_families_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_food_products_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_food_products_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_statistics() TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION get_system_statistics() IS
'Returns system-wide statistics for system administrators.
Uses SECURITY DEFINER to bypass RLS and access all data.
Should only be called from admin panel.';

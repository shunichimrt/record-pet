import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check admin status
 * Access: GET /api/admin/check
 */
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      message: 'Not logged in',
    })
  }

  // Check if user is admin
  const { data: adminData, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    authenticated: true,
    user_id: user.id,
    email: user.email,
    is_admin: !error && !!adminData,
    admin_check_error: error?.message,
    admin_data: adminData,
    help: {
      message: 'If is_admin is false, run this SQL in Supabase:',
      sql: `INSERT INTO admin_users (user_id) VALUES ('${user.id}');`,
    },
  })
}

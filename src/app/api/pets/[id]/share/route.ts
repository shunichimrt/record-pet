import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, verifyPetAccess, verifyPetAdminAccess } from '@/lib/permissions'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'

// Generate share token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const user = await getAuthenticatedUser()

    // Verify user has access to this pet
    const hasAccess = await verifyPetAccess(user.id, id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Parse request body for expiration days
    const body = await request.json()
    const expirationDays = body.expirationDays || 7

    // Generate random token
    const token = randomBytes(32).toString('hex')

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    // Create share token
    const { data: shareToken, error: tokenError } = await supabase
      .from('share_tokens')
      .insert({
        pet_id: id,
        token,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      return NextResponse.json(
        { error: 'Failed to create token' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      token: shareToken.token,
      expires_at: shareToken.expires_at,
    })
  } catch (error) {
    console.error('Share token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate share token' },
      { status: 500 }
    )
  }
}

// Get active tokens for a pet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const user = await getAuthenticatedUser()

    // Verify user has access to this pet
    const hasAccess = await verifyPetAccess(user.id, id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Get active tokens
    const { data: tokens, error } = await supabase
      .from('share_tokens')
      .select('*')
      .eq('pet_id', id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
    }

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Get tokens error:', error)
    return NextResponse.json({ error: 'Failed to get tokens' }, { status: 500 })
  }
}

// Revoke token (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const user = await getAuthenticatedUser()

    // Verify user is admin of the pet's family (only admins can revoke)
    const isAdmin = await verifyPetAdminAccess(user.id, id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID required' }, { status: 400 })
    }

    // Revoke token (set is_active to false)
    const { error } = await supabase
      .from('share_tokens')
      .update({ is_active: false })
      .eq('id', tokenId)
      .eq('pet_id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke token error:', error)
    return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 })
  }
}

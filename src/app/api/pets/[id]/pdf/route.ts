import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser, verifyPetAccess } from '@/lib/permissions'
import { renderToStream } from '@react-pdf/renderer'
import PetRecordDocument from '@/lib/pdf/PetRecordDocument'

export const runtime = 'nodejs'

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

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Fetch pet data
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single()

    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Fetch walks with date filtering
    let walksQuery = supabase
      .from('pet_walks')
      .select('*')
      .eq('pet_id', id)
      .order('walked_at', { ascending: false })

    if (startDate) {
      walksQuery = walksQuery.gte('walked_at', startDate)
    }
    if (endDate) {
      walksQuery = walksQuery.lte('walked_at', endDate + 'T23:59:59')
    }

    const { data: walks } = await walksQuery

    // Fetch meals with date filtering
    let mealsQuery = supabase
      .from('pet_meals')
      .select('*')
      .eq('pet_id', id)
      .order('fed_at', { ascending: false })

    if (startDate) {
      mealsQuery = mealsQuery.gte('fed_at', startDate)
    }
    if (endDate) {
      mealsQuery = mealsQuery.lte('fed_at', endDate + 'T23:59:59')
    }

    const { data: meals } = await mealsQuery

    // Fetch traits
    const { data: traits } = await supabase
      .from('pet_traits')
      .select('*')
      .eq('pet_id', id)
      .order('created_at', { ascending: false })

    // Fetch meta
    const { data: metas } = await supabase
      .from('pet_meta')
      .select('*')
      .eq('pet_id', id)
      .order('created_at', { ascending: false })

    // Generate PDF
    const document = PetRecordDocument({
      pet,
      walks: walks || [],
      meals: meals || [],
      traits: traits || [],
      metas: metas || [],
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    const stream = await renderToStream(document)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pet.name}-records.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

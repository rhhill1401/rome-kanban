import { NextResponse } from 'next/server'
import { getSheetData, saveSheetData } from '@/lib/sheets'

export async function GET() {
  try {
    const data = await getSheetData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/sheets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await saveSheetData(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/sheets error:', error)
    return NextResponse.json(
      { error: 'Failed to save data to Google Sheets' },
      { status: 500 }
    )
  }
}

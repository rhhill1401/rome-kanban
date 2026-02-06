import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })

  return auth
}

export async function getSheetData() {
  const auth = await getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    // Read all columns from the Kanban sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Kanban!A:J', // id, type, title, theme, date, time, views, subs, column
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      // Return default empty structure if no data
      return {
        ideas: [],
        production: [],
        review: [],
        published: [],
      }
    }

    // Skip header row, parse data
    const items = rows.slice(1).map(row => ({
      id: row[0] || '',
      type: row[1] || 'short',
      title: row[2] || '',
      theme: row[3] || '',
      date: row[4] || '',
      time: row[5] || undefined,
      views: row[6] ? parseInt(row[6]) : undefined,
      subs: row[7] ? parseInt(row[7]) : undefined,
      column: row[8] || 'ideas',
    }))

    // Group by column
    const data: Record<string, any[]> = {
      ideas: [],
      production: [],
      review: [],
      published: [],
    }

    items.forEach(item => {
      const { column, ...itemData } = item
      if (data[column]) {
        data[column].push(itemData)
      }
    })

    return data
  } catch (error) {
    console.error('Error reading from Google Sheets:', error)
    throw error
  }
}

export async function saveSheetData(data: Record<string, any[]>) {
  const auth = await getAuthClient()
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    // Flatten data with column info
    const rows: string[][] = [
      ['id', 'type', 'title', 'theme', 'date', 'time', 'views', 'subs', 'column']
    ]

    for (const [column, items] of Object.entries(data)) {
      for (const item of items) {
        rows.push([
          item.id || '',
          item.type || '',
          item.title || '',
          item.theme || '',
          item.date || '',
          item.time || '',
          item.views?.toString() || '',
          item.subs?.toString() || '',
          column,
        ])
      }
    }

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Kanban!A:J',
    })

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Kanban!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error writing to Google Sheets:', error)
    throw error
  }
}

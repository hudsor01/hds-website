# Google Sheets Lead Tracking Setup

## 1. Create Google Sheets Spreadsheet

Create a new Google Sheets document with these column headers in row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Lead ID | Timestamp | Name | Email | Company | Phone | Message | Lead Score | UTM Source | UTM Medium | UTM Campaign | UTM Content | UTM Term | Referrer | Page URL | Status |

## 2. Get Spreadsheet ID

From the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
Copy the `SPREADSHEET_ID` part.

## 3. Set Up Google API Credentials in n8n

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create Service Account credentials
5. Download JSON key file
6. In n8n, create **Google API** credentials using the JSON

## 4. Environment Variable

Add to your `.env`:
```
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

## 5. Share Sheet with Service Account

1. Open the JSON credentials file
2. Copy the `client_email` value
3. Share your Google Sheet with this email address
4. Give "Editor" permissions

## Alternative: Simple CSV Export

If you prefer a simpler solution, the workflow can also export to a CSV file or send data via webhook to any other system.
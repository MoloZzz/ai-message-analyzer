import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

interface FeedbackRow {
  date: string;
  role: string;
  branch: string;
  message: string;
  tone: string;
  criticality: number;
  solution: string;
}

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor() {
    this.sheets = google.sheets({
      version: 'v4',
      auth: process.env.GOOGLE_API_KEY,
    });
  }

  async appendFeedbackRow(data: FeedbackRow) {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Feedback!A:G',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          data.date,
          data.role,
          data.branch,
          data.message,
          data.tone,
          data.criticality,
          data.solution,
        ]],
      },
    });
  }
}

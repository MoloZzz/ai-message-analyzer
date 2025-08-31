import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor() {
    if (process.env.GOOGLE_API_KEY) {
      this.sheets = google.sheets({
        version: 'v4',
        auth: process.env.GOOGLE_API_KEY,
      });
    } else {
      this.sheets = null; // no google
    }
  }

  async appendFeedbackRow(data: (string | number)[]) {
    if (this.sheets) {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const range = 'Feedback!A:D'; // example
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [data],
        },
      });
    } else {
      // local csv
      const filePath = path.resolve(process.cwd(), 'feedback.csv');
      const row = data.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',') + '\n';

      fs.appendFileSync(filePath, row, { encoding: 'utf8' });
    }
  }
}

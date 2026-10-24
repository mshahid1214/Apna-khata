import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for Urdu number words conversion (lakh, crore, hazar, etc.)
function parseUrduNumberWords(text: string): number | null {
  const t = text.toLowerCase();
  let multiplier = 1;
  let baseNum = 0;

  // Match expressions like "5 hazar", "2.5 lakh", "1 crore", "پچاس ہزار", "دو لاکھ"
  if (t.includes('crore') || t.includes('کروڑ')) multiplier = 10000000;
  else if (t.includes('lakh') || t.includes('لاکھ')) multiplier = 100000;
  else if (t.includes('hazar') || t.includes('hazaar') || t.includes('ہزار')) multiplier = 1000;

  // Specific Urdu word numbers
  if (t.includes('dhai') || t.includes('ڈھائی')) return 2.5 * (multiplier || 100000);
  if (t.includes('derh') || t.includes('ڈیڑھ')) return 1.5 * (multiplier || 100000);
  if (t.includes('sawa') || t.includes('سوا')) return 1.25 * (multiplier || 100000);
  if (t.includes('paune') || t.includes('پونے')) return 0.75 * (multiplier || 100000);

  const numMatch = t.match(/(\d+(\.\d+)?)/);
  if (numMatch) {
    baseNum = parseFloat(numMatch[1]);
    return baseNum * multiplier;
  }

  // Urdu digit words
  const urduWords: Record<string, number> = {
    'ایک': 1, 'do': 2, 'دو': 2, 'teen': 3, 'تین': 3, 'char': 4, 'چار': 4,
    'panch': 5, 'paanch': 5, 'پانچ': 5, 'chhay': 6, 'چھ': 6, 'sat': 7, 'saat': 7, 'سات': 7,
    'aath': 8, 'آٹھ': 8, 'nau': 9, 'نو': 9, 'das': 10, 'دس': 10,
    'bees': 20, 'بیس': 20, 'tees': 30, 'تیس': 30, 'chalees': 40, 'چالیس': 40,
    'pachas': 50, 'پچاس': 50, 'saath': 60, 'ساٹھ': 60, 'sattar': 70, 'ستر': 70,
    'assi': 80, 'اسی': 80, 'nabbe': 90, 'نوے': 90, 'sau': 100, 'سو': 100
  };

  for (const [w, val] of Object.entries(urduWords)) {
    if (t.includes(w)) {
      baseNum = val;
      break;
    }
  }

  if (baseNum > 0) {
    return baseNum * (multiplier || 1);
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase payload limit to 25mb for base64 camera scans of handwritten bahi & paper slips
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Apna Khata | اپنا کھاتہ',
      version: '1.0.0',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Mandi market status endpoint
  app.get('/api/mandi-status', (req, res) => {
    res.json({
      markets: ['Multan', 'Khanewal', 'Bahawalpur', 'Rahim Yar Khan'],
      currency: 'PKR',
      standardManKg: 40,
      supportHotline: '0800-KHATA (SAMPLE)',
    });
  });

  // -------------------------------------------------------------
  // POST /api/scan-document
  // Scan paper khata page or printed/handwritten sale slip
  // -------------------------------------------------------------
  app.post('/api/scan-document', async (req, res) => {
    try {
      const { imageBase64, documentType, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          errorUr: 'تصویر فراہم نہیں کی گئی۔ برائے مہربانی صاف تصویر منتخب کریں۔',
          errorEn: 'No image provided. Please capture or select a clear image.',
        });
      }

      // Strip data uri prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY not configured. Returning simulated OCR extraction.');
        // Provide simulated high-fidelity extraction so user can experience the Confirm & Edit split screen
        if (documentType === 'slip') {
          return res.json({
            success: true,
            documentType: 'slip',
            warning: 'AI can misread handwriting. Always check before saving.',
            warningUr: 'ہاتھ کی تحریر پڑھنے میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق کریں۔',
            slipData: {
              date: '24/10/2026',
              farmerName: 'حاجی غلام فرید',
              buyerName: 'ملک ارشد بیوپاری',
              commodity: 'mango',
              variety: 'چونسا سفید (سیمپل)',
              grade: 'درجہ اول (Grade A)',
              crateCount: 120,
              grossWeight: 4950,
              tareWeight: 240,
              netWeight: 4710,
              ratePerUnit: 4600,
              grossAmount: 541650,
              commissionPercent: 4.0,
              commissionPKR: 21666,
              laborPKR: 3000,
              marketFeePKR: 600,
              transportPKR: 3500,
              otherDeductionPKR: 500,
              netPayable: 512384,
              notes: 'کاغذی پرچی سے خودکار ڈیجیٹل پڑھائی',
              confidence: 'medium',
            },
            extractedRows: [],
          });
        }

        return res.json({
          success: true,
          documentType: 'khata',
          warning: 'AI can misread handwriting. Always check before saving.',
          warningUr: 'ہاتھ کی تحریر پڑھنے میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق کریں۔',
          extractedRows: [
            {
              id: 'ocr-1',
              date: '18/10/2026',
              partyName: 'حاجی غلام رسول',
              amount: 50000,
              flowType: 'given',
              entryType: 'advance_cash',
              note: 'نقد پیشگی ادھار (پڑھائی بااعتماد)',
              confidence: 'high',
            },
            {
              id: 'ocr-2',
              date: '20/10/2026',
              partyName: 'حاجی غلام رسول',
              amount: 34000,
              flowType: 'given',
              entryType: 'input_item',
              note: 'ڈی اے پی کھاد 2 بوری (تحریر میں ہلکا ابہام)',
              confidence: 'medium',
            },
            {
              id: 'ocr-3',
              date: '22/10/2026',
              partyName: 'حاجی غلام رسول',
              amount: 125000,
              flowType: 'received',
              entryType: 'sale_proceed',
              note: 'آم چونسا نیلامی فروخت آمدن',
              confidence: 'high',
            },
            {
              id: 'ocr-4',
              date: '23/10/2026',
              partyName: 'حاجی غلام رسول',
              amount: 5000,
              flowType: 'given',
              entryType: 'deduction',
              note: 'منڈی کمیشن و کٹوتی (مشکوک ہندسہ)',
              confidence: 'low',
            },
          ],
        });
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey });

      let promptText = '';
      if (documentType === 'slip') {
        promptText = `
You are an expert Mandi Accounting OCR specialist in Pakistan (Multan, Khanewal, Faisalabad, South Punjab).
Analyze this photograph of a handwritten or printed Mandi Sale Slip / Parchi (نیلامی پرچی).
Extract structured fields accurately.
Fields required:
- date: DD/MM/YYYY (or current year 2026 if unclear)
- farmerName: Name of the grower / farmer (اردو or Roman)
- buyerName: Name of the buyer / beopari (اردو or Roman)
- commodity: one of "mango", "citrus", "dates", "cotton"
- variety: specific variety (e.g. "Chaunsa", "Sindhri", "Kinnow")
- grade: quality grade (e.g. "Grade A", "درجہ اول")
- crateCount: number of crates or bags
- grossWeight: gross weight in kg
- tareWeight: tare weight in kg
- netWeight: net weight in kg
- ratePerUnit: rate per man (40kg) or per kg
- grossAmount: total gross PKR
- commissionPercent: commission % if specified (e.g. 4.0)
- commissionPKR: commission amount
- laborPKR: labor / palai PKR
- marketFeePKR: mandi fee PKR
- transportPKR: freight PKR
- otherDeductionPKR: other PKR
- netPayable: net amount payable PKR
- notes: any written remarks
- confidence: "high", "medium", or "low" based on clarity of handwriting.

Respond ONLY with valid JSON in this exact structure:
{
  "success": true,
  "slipData": {
    "date": "DD/MM/YYYY",
    "farmerName": "string",
    "buyerName": "string",
    "commodity": "mango",
    "variety": "string",
    "grade": "string",
    "crateCount": 100,
    "grossWeight": 4000,
    "tareWeight": 200,
    "netWeight": 3800,
    "ratePerUnit": 4500,
    "grossAmount": 427500,
    "commissionPercent": 4.0,
    "commissionPKR": 17100,
    "laborPKR": 2500,
    "marketFeePKR": 500,
    "transportPKR": 3000,
    "otherDeductionPKR": 0,
    "netPayable": 404400,
    "notes": "string",
    "confidence": "high"
  }
}
`;
      } else {
        // Khata page extraction (multiple rows)
        promptText = `
You are an expert Mandi Accounting OCR specialist in Pakistan.
Analyze this photo of a handwritten paper Bahi-Khata (بہی کھاتہ / رجسٹر) page.
Extract all transaction entries as a list of rows.
For each row:
- id: unique string e.g. "row-1"
- date: DD/MM/YYYY
- partyName: Name of farmer or arhti mentioned on the page
- amount: number in PKR (digits only)
- flowType: "given" (بنام / ادھار / دیا) or "received" (جمع / وصول / لیا)
- entryType: one of "advance_cash", "input_item", "sale_proceed", "deduction", "payment_received"
- note: description of the item or cash (e.g. "advance cash", "DAP fertilizer", "Chaunsa sale")
- confidence: "high" if clearly readable, "medium" if slightly faded or ambiguous, "low" if uncertain or scratched out.

Respond ONLY with valid JSON in this exact structure:
{
  "success": true,
  "extractedRows": [
    {
      "id": "row-1",
      "date": "DD/MM/YYYY",
      "partyName": "string",
      "amount": 50000,
      "flowType": "given",
      "entryType": "advance_cash",
      "note": "string",
      "confidence": "high"
    }
  ]
}
`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          promptText,
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      let parsedResult;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini OCR JSON:', responseText);
        throw new Error('Gemini response was not valid JSON');
      }

      parsedResult.warning = 'AI can misread handwriting. Always check before saving.';
      parsedResult.warningUr = 'ہاتھ کی تحریر پڑھنے میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق کریں۔';

      return res.json(parsedResult);
    } catch (err: any) {
      console.error('OCR Processing error:', err);
      return res.status(200).json({
        success: false,
        errorUr: 'معذرت، تصویر سے تحریر واضح نہیں ہو سکی۔ براہِ کرم دوبارہ صاف روشنی میں تصویر لیں یا دستی اندراج کریں۔',
        errorEn: 'Could not extract handwriting clearly. Please take a clearer photo in good lighting or enter manually.',
        canManualEnter: true,
      });
    }
  });

  // -------------------------------------------------------------
  // POST /api/parse-voice
  // Parse spoken Urdu, Roman Urdu, or Punjabi voice input into structured form fields
  // -------------------------------------------------------------
  app.post('/api/parse-voice', async (req, res) => {
    try {
      const { transcript, context = 'khata' } = req.body;

      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({
          success: false,
          errorUr: 'کوئی آواز یا متن موصول نہیں ہوا۔',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // Local heuristic fallback if no API key or network is offline
      const localNum = parseUrduNumberWords(transcript);

      if (!apiKey) {
        const isGiven =
          transcript.includes('diya') ||
          transcript.includes('دیا') ||
          transcript.includes('advance') ||
          transcript.includes('ادھار') ||
          transcript.includes('khad') ||
          transcript.includes('کھاد');

        return res.json({
          success: true,
          parsed: {
            amount: localNum || 5000,
            partyName: transcript.includes('haji') || transcript.includes('حاجی') ? 'حاجی غلام رسول' : '',
            flowType: isGiven ? 'given' : 'received',
            entryType: transcript.includes('khad') || transcript.includes('کھاد')
              ? 'input_item'
              : transcript.includes('advance') || transcript.includes('ادھار')
              ? 'advance_cash'
              : 'advance_cash',
            notes: transcript,
            confidence: localNum ? 'high' : 'medium',
          },
          warning: 'AI can misread handwriting or speech. Always check before saving.',
          warningUr: 'ہاتھ کی تحریر یا زبانی الفاظ میں غلطی ہو سکتی ہے، محفوظ کرنے سے پہلے ضرور تصدیق کریں۔',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are an expert Pakistani Urdu/Punjabi voice transcription assistant for Mandi agricultural accounting.
The user spoke a phrase in Urdu, Roman Urdu, or Punjabi:
"${transcript}"

Context: "${context}" (e.g. khata entry, sale slip, amount or party).

Tasks:
1. Extract the numeric amount (PKR).
   Understand words like:
   - "paanch hazaar" / "پانچ ہزار" = 5000
   - "bees hazaar" / "بیس ہزار" = 20000
   - "pachas hazaar" / "پچاس ہزار" = 50000
   - "ek lakh" / "ایک لاکھ" = 100000
   - "dedh lakh" / "dhai lakh" / "ڈیڑھ لاکھ" / "ڈھائی لاکھ" = 150000 / 250000
   - "sawa lakh" / "سوا لاکھ" = 125000
   - "paune do lakh" = 175000
   - "do lakh" / "دو لاکھ" = 200000
   - "crore" / "کروڑ" = 10000000
2. Extract the person's name (partyName) in Urdu or English if mentioned (e.g. "Haji Rasool", "Chaudhry Akram", "حاجی سلیم").
3. Determine flowType:
   - "given" (بنام / ادھار / دیا / کٹوتی / advance / input)
   - "received" (جمع / وصول / لیا / فصل آمدن / sale proceed)
4. Determine entryType:
   - "advance_cash", "input_item", "sale_proceed", "deduction", or "payment_received"
5. Commodity or item details if mentioned (e.g. fertilizer, seed, spray, mango, cotton).
6. Cleaned note text in polite Urdu and English summary.
7. Confidence: "high", "medium", or "low".

Respond ONLY with valid JSON in this exact structure:
{
  "success": true,
  "parsed": {
    "amount": 50000,
    "partyName": "string",
    "flowType": "given",
    "entryType": "advance_cash",
    "commodity": "mango",
    "itemName": "string",
    "notes": "string",
    "confidence": "high"
  }
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      let parsedResult;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (e) {
        parsedResult = {
          success: true,
          parsed: {
            amount: localNum || 0,
            notes: transcript,
            confidence: 'medium',
          },
        };
      }

      parsedResult.warning = 'AI can misread speech or handwriting. Always check before saving.';
      parsedResult.warningUr = 'زبانی الفاظ یا تحریر میں غلطی ہو سکتی ہے، براہِ کرم محفوظ کرنے سے پہلے ضرور تصدیق کریں۔';

      return res.json(parsedResult);
    } catch (err: any) {
      console.error('Voice parsing error:', err);
      const localNum = parseUrduNumberWords(req.body?.transcript || '');
      return res.json({
        success: true,
        parsed: {
          amount: localNum || 0,
          notes: req.body?.transcript || '',
          confidence: 'medium',
        },
        warning: 'AI can misread handwriting or speech. Always check before saving.',
        warningUr: 'براہِ کرم محفوظ کرنے سے پہلے رقم اور اندراج کی تصدیق کریں۔',
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apna Khata server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

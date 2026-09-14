import { apiPredictForecast, apiPredictDate, getPredictionApiMode } from './api';
import { getMuhurtRecord } from './muhurtData';
import { getPanchangForDateOffset } from './panchangSequence';

export interface MuhuratInput {
  muhurtTypeId: number;
  muhurtNameEn: string;
  muhurtNameGu: string;
  tithi: string;
  nakshatra: string;
  vaar: string;
  yoga: string;
  karan: string;
}

export interface PredictionResult {
  auspiciousnessScore: number; // 0 to 100
  verdict: string; // e.g., "Highly Auspicious", "Avoid", etc.
  tithiAnalysis: string;
  nakshatraAnalysis: string;
  vaarAnalysis: string;
  yogaAnalysis: string;
  karanAnalysis: string;
  overallAnalysis: string;
  remedies: string[];
  // Additional fields when auto-fetched by date
  date?: string;
  tithi?: string;
  nakshatra?: string;
  vaar?: string;
  yoga?: string;
  karan?: string;
}

export function evaluateLocalCustomPrediction(input: MuhuratInput): PredictionResult {
  const record = getMuhurtRecord(input.muhurtTypeId);
  const selected = record ? record.selected : {
    tithi_shukla_paksha: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    tithi_krishna_paksha: [2, 3, 5],
    nakshatra: [4, 5, 8, 12, 13, 14, 17, 21, 22, 23, 24, 26, 27],
    vaar: [1, 2, 4, 5, 6],
    yoga: [2, 3, 4, 5, 7, 8, 11, 12, 14, 16, 18, 20, 21, 22, 23, 24, 25, 26],
    karan: [1, 2, 3, 4, 5, 6]
  };

  // 1. Tithi Evaluation (25%)
  const isKrishna = input.tithi.includes('Krishna');
  const isPurnima = input.tithi.includes('Purnima');
  const isAmavasya = input.tithi.includes('Amavasya');
  const selectedTithis = isKrishna ? selected.tithi_krishna_paksha : selected.tithi_shukla_paksha;
  
  let tithiOk = false;
  if (isPurnima) {
    tithiOk = selected.tithi_shukla_paksha.includes(15);
  } else if (isAmavasya) {
    tithiOk = selected.tithi_krishna_paksha.includes(15) || selected.tithi_krishna_paksha.includes(30);
  } else {
    const match = input.tithi.match(/\((\d+)\)/) || input.tithi.match(/\b(\d+)\b/);
    const num = match ? parseInt(match[1], 10) : 5;
    tithiOk = selectedTithis.includes(num);
  }
  const tithiScore = tithiOk ? 25 : 5;

  // 2. Nakshatra Evaluation (30%)
  const NAKSHATRA_ORDER = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 
    'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  let nakIdx = NAKSHATRA_ORDER.findIndex(n => input.nakshatra.toLowerCase().includes(n.toLowerCase())) + 1;
  if (nakIdx <= 0) nakIdx = 1;
  const nakOk = selected.nakshatra.includes(nakIdx);
  const nakScore = nakOk ? 30 : 8;

  // 3. Vaar Evaluation (15%)
  const VAAR_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let vaarIdx = VAAR_ORDER.findIndex(v => v.toLowerCase() === input.vaar.toLowerCase()) + 1;
  if (vaarIdx <= 0) vaarIdx = 1;
  const vaarOk = selected.vaar.includes(vaarIdx);
  const vaarScore = vaarOk ? 15 : 3;

  // 4. Yoga Evaluation (15%)
  const YOGA_ORDER = [
    'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 
    'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 
    'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Aindra', 'Vaidhriti'
  ];
  let yogaIdx = YOGA_ORDER.findIndex(y => input.yoga.toLowerCase().includes(y.toLowerCase())) + 1;
  if (yogaIdx <= 0) yogaIdx = 1;
  const yogaOk = selected.yoga.includes(yogaIdx);
  const yogaScore = yogaOk ? 15 : 3;

  // 5. Karan Evaluation (15%)
  let karanScore = 15;
  let karanOk = true;
  let karanAnalysisStr = `${input.karan} — Auspicious Karan.`;

  if (input.karan.includes("Vishti") || input.karan.includes("Bhadra")) {
    karanScore = 0;
    karanOk = false;
    karanAnalysisStr = `${input.karan} — Strictly Avoided (Malefic Bhadra Period).`;
  } else {
    const KARAN_ORDER = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
    let karanIdx = KARAN_ORDER.findIndex(k => input.karan.toLowerCase().includes(k.toLowerCase())) + 1;
    if (karanIdx <= 0) karanIdx = 1;
    karanOk = selected.karan.includes(karanIdx) || selected.karan.length === 0;
    karanScore = karanOk ? 15 : 7;
    karanAnalysisStr = karanOk 
      ? `${input.karan} — Auspicious Karan.`
      : `${input.karan} — Average Karan alignment.`;
  }

  const score = Math.min(100, Math.max(15, tithiScore + nakScore + vaarScore + yogaScore + karanScore));
  let verdict = "Auspicious";
  if (score >= 80) verdict = "Highly Auspicious";
  else if (score >= 65) verdict = "Auspicious";
  else if (score >= 45) verdict = "Proceed with Caution";
  else verdict = "Avoid - Malefic Parameters";

  return {
    auspiciousnessScore: score,
    verdict,
    tithi: input.tithi,
    nakshatra: input.nakshatra,
    vaar: input.vaar,
    yoga: input.yoga,
    karan: input.karan,
    tithiAnalysis: `${input.tithi} — ${tithiOk ? 'Approved Tithi' : 'Inauspicious Tithi'} for ${input.muhurtNameEn}.`,
    nakshatraAnalysis: `${input.nakshatra} — ${nakOk ? 'Favored Star' : 'Unfavorable Star'} for ${input.muhurtNameEn}.`,
    vaarAnalysis: `${input.vaar} — ${vaarOk ? 'Benefic Weekday Alignment' : 'Restricted Weekday Alignment'}.`,
    yogaAnalysis: `${input.yoga} — ${yogaOk ? 'Benefic Yoga' : 'Inauspicious Yoga'}.`,
    karanAnalysis: karanAnalysisStr,
    overallAnalysis: `Evaluated Panchang parameters for ${input.muhurtNameEn} (${input.muhurtNameGu}). Score: ${score}%. Verdict: ${verdict}.`,
    remedies: [
      `Perform Lord Ganesha and Kula Devata invocations prior to starting ${input.muhurtNameEn}.`,
      "Place sacred Kalasha filled with pure water in North-East direction for divine energy."
    ]
  };
}

export async function fetchVastuPrediction(
  input: MuhuratInput,
  _apiKey: string
): Promise<PredictionResult> {
  return evaluateLocalCustomPrediction(input);
}

export async function fetchVastuPredictionForDate(
  targetDate: string,
  input: MuhuratInput,
  apiKey: string
): Promise<PredictionResult> {
  const currentMode = getPredictionApiMode();
  
  if (currentMode === 'gemini' && apiKey) {
    try {
      // Gemini API call when enabled in admin panel
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a professional Vedic Astrologer. Predict auspiciousness score (0-100), verdict, tithiAnalysis, nakshatraAnalysis, vaarAnalysis, yogaAnalysis, karanAnalysis, overallAnalysis, and remedies for date ${targetDate} and ceremony ${input.muhurtNameEn}. Return ONLY raw JSON without markdown codeblocks.`
              }]
            }]
          })
        }
      );
      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
          return {
            ...parsed,
            date: targetDate
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local engine:", err);
    }
  }

  // GitHub API / Local FastAPI engine mode (Default)
  try {
    const localResult = await apiPredictDate({
      target_date: targetDate,
      muhurt_type_id: input.muhurtTypeId,
      muhurt_name_en: input.muhurtNameEn,
      muhurt_name_gu: input.muhurtNameGu
    });
    if (localResult && localResult.auspiciousnessScore !== undefined) {
      return localResult as PredictionResult;
    }
  } catch (backendError) {
    console.info("Local FastAPI backend offline, using local engine fallback:", backendError);
  }

  const targetDt = new Date(targetDate + 'T00:00:00');
  const dayInput = getPanchangForDateOffset(targetDt, 0, input);
  const res = evaluateLocalCustomPrediction(dayInput);
  const formattedDate = targetDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  res.date = formattedDate;
  return res;
}

export interface BestDayPrediction {
  rank: number;
  date: string;
  dateISO?: string;
  tithi: string;
  nakshatra: string;
  vaar: string;
  yoga: string;
  karan: string;
  auspiciousnessScore: number;
  verdict: string;
  overallAnalysis: string;
  tithiAnalysis: string;
  nakshatraAnalysis: string;
  vaarAnalysis: string;
  yogaAnalysis: string;
  karanAnalysis: string;
  remedies: string[];
}

export interface Best5DaysPredictionResult {
  predictions: BestDayPrediction[];
}

export async function fetchVastuBest5DaysPrediction(
  startDate: string,
  endDate: string,
  startInput: MuhuratInput,
  apiKey: string
): Promise<Best5DaysPredictionResult> {
  const currentMode = getPredictionApiMode();

  if (currentMode === 'gemini' && apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Predict best auspicious days between ${startDate} and ${endDate} for ${startInput.muhurtNameEn}. Return raw JSON with key predictions: array of BestDayPrediction objects.`
              }]
            }]
          })
        }
      );
      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
          if (parsed && Array.isArray(parsed.predictions)) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API forecast failed, falling back to local engine:", err);
    }
  }

  // GitHub API / Local FastAPI engine mode (Default)
  try {
    const localForecast = await apiPredictForecast({
      start_date: startDate,
      end_date: endDate,
      muhurt_type_id: startInput.muhurtTypeId,
      muhurt_name_en: startInput.muhurtNameEn,
      muhurt_name_gu: startInput.muhurtNameGu
    });
    if (localForecast && Array.isArray(localForecast.predictions)) {
      return localForecast as Best5DaysPredictionResult;
    }
  } catch (backendError) {
    console.info("Local FastAPI backend offline, using local forecast fallback:", backendError);
  }

  // Fallback local forecast calculation
  const allDaysScored: BestDayPrediction[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const daysInRange = Math.floor(Math.max(0, end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < daysInRange; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dStr = d.toISOString().split('T')[0];

    const dayInput = getPanchangForDateOffset(d, i, startInput);
    const evalRes = evaluateLocalCustomPrediction(dayInput);

    const dateFormatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    allDaysScored.push({
      rank: 0,
      date: dateFormatted,
      dateISO: dStr,
      tithi: dayInput.tithi,
      nakshatra: dayInput.nakshatra,
      vaar: dayInput.vaar,
      yoga: dayInput.yoga,
      karan: dayInput.karan,
      auspiciousnessScore: evalRes.auspiciousnessScore,
      verdict: evalRes.verdict,
      overallAnalysis: evalRes.overallAnalysis,
      tithiAnalysis: evalRes.tithiAnalysis,
      nakshatraAnalysis: evalRes.nakshatraAnalysis,
      vaarAnalysis: evalRes.vaarAnalysis,
      yogaAnalysis: evalRes.yogaAnalysis,
      karanAnalysis: evalRes.karanAnalysis,
      remedies: evalRes.remedies
    });
  }

  // Sort descending by auspiciousness score
  allDaysScored.sort((a, b) => b.auspiciousnessScore - a.auspiciousnessScore);

  // Return top N (up to 5) predictions
  const maxToPredict = Math.min(5, Math.max(1, daysInRange));
  const predictions = allDaysScored.slice(0, maxToPredict).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  return { predictions };
}


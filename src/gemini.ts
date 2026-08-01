export interface MuhuratInput {
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
}

export async function fetchVastuPrediction(
  input: MuhuratInput,
  apiKey: string
): Promise<PredictionResult> {
  const systemPrompt = `You are a master Indian Vedic Astrologer and Vastu Shastra expert.
Your job is to analyze a Vastu Muhurat (timing suitability for starting house construction or moving into a new home / Griha Pravesh) based on the five limbs of Panchang provided: Tithi, Nakshatra, Vaar, Yoga, and Karan.

Analyze the inputs strictly against these classical rules:
1. **Tithi (Lunar Day)**:
   - Auspicious: Dwitiya (2), Tritiya (3), Panchami (5), Saptami (7), Dashami (10), Ekadashi (11), Dwadashi (12), Trayodashi (13) of Shukla Paksha (bright fortnight).
   - Inauspicious (Avoid): Amavasya, Rikta Tithis (4, 9, 14), and Krishna Paksha dates (except highly benefic ones).
2. **Nakshatra (Lunar Mansion)**:
   - Auspicious (Fixed/Sthira & Gentle/Mridu): Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Anuradha, Chitra, Dhanishta, Shatabhisha, Revati.
3. **Vaar (Solar Weekday)**:
   - Auspicious: Monday, Wednesday, Thursday, Friday.
   - Special/Conditional: Sunday.
   - Restricted (Avoid): Tuesday, Saturday.
4. **Yoga (Luni-solar Combination)**:
   - Auspicious: Siddhi, Amrita, Shubha, Shukla, Brahma, Aindra.
   - Malefic (Avoid): Visha, Vyatipata, Vaidhriti.
5. **Karan (Half of Tithi)**:
   - Auspicious: Bava, Balava, Kaulava, Taitila, Garaja, Vanija.
   - Restricted (Avoid): Vishti (Bhadra Karan).

Calculate an Auspiciousness Score from 0 to 100. Provide details for each limb and a final verdict.
You MUST respond ONLY with a raw JSON object containing these exact fields, with no markdown code blocks around it:
{
  "auspiciousnessScore": number,
  "verdict": "string",
  "tithiAnalysis": "string",
  "nakshatraAnalysis": "string",
  "vaarAnalysis": "string",
  "yogaAnalysis": "string",
  "karanAnalysis": "string",
  "overallAnalysis": "string",
  "remedies": ["string", "string", ...]
}
Ensure there is absolutely no text other than the raw JSON object. Do not wrap the JSON in \`\`\`json or similar blocks.`;

  const userMessage = `Inputs to analyze:
- Tithi: ${input.tithi}
- Nakshatra: ${input.nakshatra}
- Vaar: ${input.vaar}
- Yoga: ${input.yoga}
- Karan: ${input.karan}

Please generate the Vastu Muhurat prediction JSON.`;

  try {
    const apiVersions = ["v1beta", "v1"];
    let response: Response | null = null;

    for (const version of apiVersions) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\n${userMessage}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          break;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `API request failed with status ${response.status}`
        );
      } catch (error) {
        console.warn(`Gemini API call with ${version} failed:`, error);
        if (version === apiVersions[apiVersions.length - 1]) {
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error("No response received from Gemini API");
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response text returned from Gemini API");
    }

    // Clean up markdown block headers if Gemini returned them despite instructions
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedResult = JSON.parse(text) as PredictionResult;
    return parsedResult;
  } catch (error) {
    console.error("Vastu API error:", error);
    throw error;
  }
}

export interface BestDayPrediction {
  rank: number;
  date: string;
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
  startInput: MuhuratInput,
  apiKey: string
): Promise<Best5DaysPredictionResult> {
  const systemPrompt = `You are a master Indian Vedic Astrologer and Vastu Shastra expert.
Your job is to identify the 5 best Vastu Muhurats (auspicious dates and times for starting house construction or moving into a new home / Griha Pravesh) within the next 1 year starting from the reference calendar date provided, based on the starting Panchang details provided.

The reference calendar date is: ${startDate}.
The starting Panchang limbs for this reference date are:
- Tithi: ${startInput.tithi}
- Nakshatra: ${startInput.nakshatra}
- Vaar: ${startInput.vaar}
- Yoga: ${startInput.yoga}
- Karan: ${startInput.karan}

Using your knowledge of the Hindu calendar (Panchang) and planetary cycles, calculate and select the **5 most auspicious dates** for Vastu Muhurat in the next 1 year (from ${startDate} to 1 year later).
For each of these 5 days, determine their corresponding calendar date, day of week, and Panchang limbs (Tithi, Nakshatra, Vaar, Yoga, Karan) and calculate an Auspiciousness Score from 0 to 100 based on these rules:

1. **Tithi (Lunar Day)**:
   - Auspicious: Dwitiya (2), Tritiya (3), Panchami (5), Saptami (7), Dashami (10), Ekadashi (11), Dwadashi (12), Trayodashi (13) of Shukla Paksha (bright fortnight).
   - Inauspicious (Avoid): Amavasya, Rikta Tithis (4, 9, 14), and Krishna Paksha dates (except highly benefic ones).
2. **Nakshatra (Lunar Mansion)**:
   - Auspicious (Fixed/Sthira & Gentle/Mridu): Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Anuradha, Chitra, Dhanishta, Shatabhisha, Revati.
3. **Vaar (Solar Weekday)**:
   - Auspicious: Monday, Wednesday, Thursday, Friday.
   - Special/Conditional: Sunday.
   - Restricted (Avoid): Tuesday, Saturday.
4. **Yoga (Luni-solar Combination)**:
   - Auspicious: Siddhi, Amrita, Shubha, Shukla, Brahma, Aindra.
   - Malefic (Avoid): Visha, Vyatipata, Vaidhriti.
5. **Karan (Half of Tithi)**:
   - Auspicious: Bava, Balava, Kaulava, Taitila, Garaja, Vanija.
   - Restricted (Avoid): Vishti (Bhadra Karan).

You MUST respond ONLY with a raw JSON object containing an array of predictions for the 5 days, matching this exact TypeScript interface:
interface BestDayPrediction {
  rank: number; // 1 to 5, where 1 is the most auspicious recommended day
  date: string; // The exact calendar date, formatted like "7th August 2026"
  tithi: string; // The Tithi name for that date (e.g. "Shukla Dwitiya")
  nakshatra: string; // The Nakshatra name for that date (e.g. "Rohini")
  vaar: string; // The Weekday name for that date (e.g. "Monday")
  yoga: string; // The Yoga name for that date (e.g. "Siddhi")
  karan: string; // The Karan name for that date (e.g. "Bava")
  auspiciousnessScore: number; // 0 to 100
  verdict: string; // e.g. "Highly Auspicious", "Auspicious", "Proceed with Caution"
  overallAnalysis: string; // A synthesis of why this date is chosen
  tithiAnalysis: string;
  nakshatraAnalysis: string;
  vaarAnalysis: string;
  yogaAnalysis: string;
  karanAnalysis: string;
  remedies: string[];
}
interface Best5DaysPredictionResult {
  predictions: BestDayPrediction[];
}

Ensure there is absolutely no text other than the raw JSON object. Do not wrap the JSON in \`\`\`json or similar blocks.`;

  const userMessage = `Reference date: ${startDate}
Please calculate and identify the 5 best Vastu Muhurat dates in the next 1 year starting from this reference date. Generate the Vastu Muhurat prediction JSON matching the Best5DaysPredictionResult interface.`;

  try {
    const apiVersions = ["v1beta", "v1"];
    let response: Response | null = null;

    for (const version of apiVersions) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\n${userMessage}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          break;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error?.message || `API request failed with status ${response.status}`
        );
      } catch (error) {
        console.warn(`Gemini API call with ${version} failed:`, error);
        if (version === apiVersions[apiVersions.length - 1]) {
          throw error;
        }
      }
    }

    if (!response) {
      throw new Error("No response received from Gemini API");
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response text returned from Gemini API");
    }

    // Clean up markdown block headers if Gemini returned them despite instructions
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedResult = JSON.parse(text) as Best5DaysPredictionResult;
    
    // Sort predictions by rank to ensure order
    if (parsedResult && parsedResult.predictions) {
      parsedResult.predictions.sort((a, b) => a.rank - b.rank);
    }
    
    return parsedResult;
  } catch (error) {
    console.error("Vastu Best 5 Days API error:", error);
    throw error;
  }
}

import { getMuhurtRulesSummaryText } from './muhurtData';

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

export async function fetchVastuPrediction(
  input: MuhuratInput,
  apiKey: string
): Promise<PredictionResult> {
  const rulesSummary = getMuhurtRulesSummaryText(input.muhurtTypeId);

  const systemPrompt = `You are a master Indian Vedic Astrologer and Muhurt expert.
Your job is to analyze the Muhurt timing suitability for "${input.muhurtNameEn}" (${input.muhurtNameGu}) based on the five limbs of Panchang provided: Tithi, Nakshatra, Vaar, Yoga, and Karan.

Analyze the inputs strictly against these classical Vedic rules for ${input.muhurtNameEn}:
${rulesSummary}

Calculate an Auspiciousness Score from 0 to 100 specifically for performing ${input.muhurtNameEn} (${input.muhurtNameGu}). Provide details for each limb and a final verdict.
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

  const userMessage = `Inputs to analyze for ${input.muhurtNameEn} (${input.muhurtNameGu}):
- Tithi: ${input.tithi}
- Nakshatra: ${input.nakshatra}
- Vaar: ${input.vaar}
- Yoga: ${input.yoga}
- Karan: ${input.karan}

Please generate the Muhurt prediction JSON.`;

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

    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedResult = JSON.parse(text) as PredictionResult;
    return parsedResult;
  } catch (error) {
    console.error("Muhurt API error:", error);
    throw error;
  }
}

export async function fetchVastuPredictionForDate(
  targetDate: string,
  input: MuhuratInput,
  apiKey: string
): Promise<PredictionResult> {
  const rulesSummary = getMuhurtRulesSummaryText(input.muhurtTypeId);

  const systemPrompt = `You are a master Indian Vedic Astrologer and Muhurt expert.
Your job is to automatically compute and fetch the Indian Panchang (Tithi, Nakshatra, Vaar, Yoga, Karan for IST / India timezone) for the target date: ${targetDate}.
Then evaluate the Muhurt suitability score (0 to 100) and detailed analysis specifically for performing "${input.muhurtNameEn}" (${input.muhurtNameGu}) on ${targetDate}.

Astrological rules for ${input.muhurtNameEn}:
${rulesSummary}

You MUST respond ONLY with a raw JSON object containing these exact fields:
{
  "date": "${targetDate}",
  "tithi": "Calculated Tithi name (e.g. Shukla Panchami)",
  "nakshatra": "Calculated Nakshatra name (e.g. Rohini)",
  "vaar": "Calculated Weekday name (e.g. Monday)",
  "yoga": "Calculated Yoga name (e.g. Siddhi)",
  "karan": "Calculated Karan name (e.g. Bava)",
  "auspiciousnessScore": number,
  "verdict": "string (e.g. Highly Auspicious, Auspicious, Avoid)",
  "tithiAnalysis": "string",
  "nakshatraAnalysis": "string",
  "vaarAnalysis": "string",
  "yogaAnalysis": "string",
  "karanAnalysis": "string",
  "overallAnalysis": "string",
  "remedies": ["string", "string", ...]
}
Ensure there is absolutely no text other than the raw JSON object. Do not wrap the JSON in \`\`\`json or similar blocks.`;

  const userMessage = `Target Date: ${targetDate}
Target Ceremony: ${input.muhurtNameEn} (${input.muhurtNameGu})
Please calculate Indian Panchang for ${targetDate} and generate the Muhurt prediction JSON.`;

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

    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedResult = JSON.parse(text) as PredictionResult;
    return parsedResult;
  } catch (error) {
    console.error("Muhurt Date API error:", error);
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
  endDate: string,
  startInput: MuhuratInput,
  apiKey: string
): Promise<Best5DaysPredictionResult> {
  const rulesSummary = getMuhurtRulesSummaryText(startInput.muhurtTypeId);

  const systemPrompt = `You are a master Indian Vedic Astrologer and Muhurt expert.
Your job is to identify the 5 best Muhurats for "${startInput.muhurtNameEn}" (${startInput.muhurtNameGu}) strictly between the start date ${startDate} and end date ${endDate}, based on the Panchang details provided.

Target Date Window: ${startDate} to ${endDate}.
Target Muhurt Ceremony: ${startInput.muhurtNameEn} (${startInput.muhurtNameGu}).

The starting Panchang limbs for ${startDate} are:
- Tithi: ${startInput.tithi}
- Nakshatra: ${startInput.nakshatra}
- Vaar: ${startInput.vaar}
- Yoga: ${startInput.yoga}
- Karan: ${startInput.karan}

Astrological rules for ${startInput.muhurtNameEn}:
${rulesSummary}

Using your knowledge of the Hindu calendar (Panchang) and planetary cycles, calculate and select the **5 most auspicious dates** for ${startInput.muhurtNameEn} strictly within the specified window (from ${startDate} to ${endDate}).
For each of these 5 days, determine their corresponding calendar date, day of week, and Panchang limbs (Tithi, Nakshatra, Vaar, Yoga, Karan) and calculate an Auspiciousness Score from 0 to 100 based on the provided rules.

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

  const userMessage = `Date range: ${startDate} to ${endDate}
Please calculate and identify the 5 best Muhurt dates for ${startInput.muhurtNameEn} (${startInput.muhurtNameGu}) strictly within this date range (${startDate} to ${endDate}). Generate the Muhurt prediction JSON matching the Best5DaysPredictionResult interface.`;

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

    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    const parsedResult = JSON.parse(text) as Best5DaysPredictionResult;
    
    if (parsedResult && parsedResult.predictions) {
      parsedResult.predictions.sort((a, b) => a.rank - b.rank);
    }
    
    return parsedResult;
  } catch (error) {
    console.error("Muhurt Best 5 Days API error:", error);
    throw error;
  }
}

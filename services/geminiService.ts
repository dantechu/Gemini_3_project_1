import { GoogleGenAI } from "@google/genai";
import { GeminiAnalysisResult, NewsItem, SentimentSignal, MarketItemType, GeneralNewsData, MarketCalendarData } from "../types";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your environment configuration.");
    }
    return new GoogleGenAI({ apiKey });
}

export const fetchMarketNews = async (): Promise<GeneralNewsData> => {
    try {
        const ai = getAiClient();
        const modelId = 'gemini-2.5-flash';
        
        const prompt = `
            You are a real-time financial news aggregator.
            Task: Search for the absolute latest, breaking financial news headlines, stock market movements, and economic data from the last hour.
            
            Output Requirements:
            1. "market_pulse": A single, concise sentence summarizing the overall market mood right now (e.g., "Tech stocks rally on earnings beat while energy lags due to oil prices").
            
            Strictly output JSON:
            {
                "market_pulse": "string"
            }
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text || "";
        
        // Extract JSON
        let parsedData: any = {};
        try {
             const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
             parsedData = jsonMatch && jsonMatch[1] ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
        } catch (e) {
             parsedData = { market_pulse: "Market data currently unavailable." };
        }

        // Extract News from Grounding
        const newsItems: NewsItem[] = [];
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks) {
            groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    newsItems.push({
                        title: chunk.web.title,
                        url: chunk.web.uri,
                        source: new URL(chunk.web.uri).hostname.replace('www.', '')
                    });
                }
            });
        }
        
        // Dedup and limit
        const uniqueNews = Array.from(new Map(newsItems.map(item => [item.url, item])).values()).slice(0, 10);

        return {
            summary: parsedData.market_pulse || "Tracking market movements...",
            news: uniqueNews
        };

    } catch (error) {
        console.error("Error fetching market news:", error);
        return { summary: "Unable to load market stream.", news: [] };
    }
};

export const fetchMarketCalendar = async (): Promise<MarketCalendarData> => {
    try {
        const ai = getAiClient();
        const modelId = 'gemini-2.5-flash';
        const today = new Date().toDateString();

        const prompt = `
            Current Date: ${today}
            You are a senior financial analyst.
            Task: Using Google Search, find the most critical market events scheduled for the UPCOMING WEEK starting from today (${today}).
            
            CRITICAL INSTRUCTION: Ensure all dates are in the FUTURE relative to ${today}. Do NOT return historical data from previous years.
            
            Split your findings into two distinct categories:
            
            CATEGORY 1: ECONOMIC & POLITICAL
            Search for:
            - Major US Economic Data (CPI, PPI, Jobs, GDP, Fed Interest Rates) scheduled for this week.
            - Federal Reserve events (FOMC meetings, Powell speeches).
            - **CRITICAL**: Search specifically for UPCOMING speeches, interviews, truth social posts, or policy announcements by DONALD TRUMP scheduled for this week.
            
            CATEGORY 2: COMPANY EARNINGS
            Search for:
            - Major US companies (S&P 500) releasing earnings this week.
            - Provide a schedule that covers MULTIPLE DAYS of the week (e.g. Mon, Tue, Wed, Thu, Fri) if data exists.
            
            Strictly output JSON in this format:
            {
                "economic_events": [
                    {
                        "title": "Event Name (e.g. Trump Trade Policy Speech)",
                        "date": "Day, Date & Time (e.g. Tue, Nov 14 - 8:30 AM EST)",
                        "impact": "HIGH" | "MEDIUM",
                        "category": "ECONOMIC" | "POLITICAL",
                        "description": "Short explanation of why it matters."
                    }
                ],
                "earnings_events": [
                    {
                        "ticker": "AAPL",
                        "name": "Apple Inc.",
                        "date": "Day, Date (e.g. Thu, Nov 16)",
                        "time": "Pre-Market" | "After-Close" | "Unknown",
                        "estimate": "EPS Est: $1.20"
                    }
                ]
            }
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text || "";
        
        // Extract JSON
        let parsedData: any = {};
        try {
             const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
             parsedData = jsonMatch && jsonMatch[1] ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
        } catch (e) {
             console.error("Failed to parse market calendar JSON", e);
             return { economic: [], earnings: [] };
        }

        return {
            economic: Array.isArray(parsedData.economic_events) ? parsedData.economic_events : [],
            earnings: Array.isArray(parsedData.earnings_events) ? parsedData.earnings_events : []
        };

    } catch (error) {
        console.error("Error fetching market calendar:", error);
        return { economic: [], earnings: [] };
    }
};

export const analyzeMarketSentiment = async (targetName: string, type: MarketItemType): Promise<GeminiAnalysisResult> => {
  const ai = getAiClient();
  const modelId = 'gemini-2.5-flash';
  
  // Dynamic context based on type
  const contextDescription = type === 'SECTOR' 
    ? `the "${targetName}" market sector` 
    : `the stock/company associated with "${targetName}"`;

  const prompt = `
    You are a sophisticated financial market sentiment scanner. 
    
    Task: Search for the latest news, analyst reports, and social sentiment regarding ${contextDescription}.
    
    Based on the search results, provide:
    1. A clear sentiment signal: BUY (Bullish), SELL (Bearish), or HOLD (Neutral).
    2. A sentiment score from 0 to 100 (0 = Extreme Fear/Bearish, 50 = Neutral, 100 = Extreme Greed/Bullish).
    3. A brief 1-2 sentence summary of the current mood.
    4. 3 key positive catalysts/drivers.
    5. 3 key negative risks/headwinds.
    6. If the target is a Market Sector (e.g. Technology), provide UP TO 5 specific stocks in this sector to BUY and UP TO 5 to SELL/AVOID based on current sentiment. Include a tiny 3-5 word reason.
       If the target is a specific Stock (e.g. AAPL), you may leave these lists empty.
    
    Output format:
    Please strictly output the analysis in a JSON format wrapped in a code block. 
    The JSON structure must be:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "score": number,
      "summary": "string",
      "positive_catalysts": ["string", "string", "string"],
      "negative_risks": ["string", "string", "string"],
      "top_picks_buy": [ {"symbol": "TICKER", "name": "Name", "reason": "reason"} ],
      "top_picks_sell": [ {"symbol": "TICKER", "name": "Name", "reason": "reason"} ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "";
    
    // Extract JSON from code block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    let parsedData: any = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        throw new Error("Failed to parse sentiment analysis.");
      }
    } else {
        // Fallback: try parsing raw text if it happens to be just JSON
        try {
             parsedData = JSON.parse(text);
        } catch(e) {
             // If parsing fails, provide a safe fallback rather than crashing
             console.warn("Model did not return valid JSON, using fallback.");
             parsedData = {
                 signal: "UNKNOWN",
                 score: 50,
                 summary: "Data format error. Raw response: " + text.substring(0, 100) + "...",
                 positive_catalysts: [],
                 negative_risks: []
             };
        }
    }

    // Extract Grounding Metadata for News Links
    const newsItems: NewsItem[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          newsItems.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            source: new URL(chunk.web.uri).hostname.replace('www.', '')
          });
        }
      });
    }

    // Remove duplicate links based on URL
    const uniqueNews = Array.from(new Map(newsItems.map(item => [item.url, item])).values()).slice(0, 5);

    return {
      signal: (parsedData.signal as SentimentSignal) || 'UNKNOWN',
      score: typeof parsedData.score === 'number' ? parsedData.score : 50,
      summary: parsedData.summary || "No summary available.",
      catalysts: {
        positive: Array.isArray(parsedData.positive_catalysts) ? parsedData.positive_catalysts : [],
        negative: Array.isArray(parsedData.negative_risks) ? parsedData.negative_risks : [],
      },
      topStocks: {
        buy: Array.isArray(parsedData.top_picks_buy) ? parsedData.top_picks_buy : [],
        sell: Array.isArray(parsedData.top_picks_sell) ? parsedData.top_picks_sell : [],
      },
      news: uniqueNews
    };

  } catch (error) {
    console.error(`Error analyzing ${targetName}:`, error);
    throw error;
  }
};

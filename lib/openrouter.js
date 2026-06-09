const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3-0324';

export async function chatCompletion(messages, { model = DEFAULT_MODEL, temperature = 0.2 } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://shipment-insights-ai.app',
      'X-Title': 'Shipment Insights AI',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content returned from OpenRouter.');
  return content;
}

export async function getAnalysisPlan(question, columns, sample, stats) {
  const systemPrompt = `You are a data analysis planner for a logistics dashboard. Given a user question about a shipment dataset, return a single JSON object describing how to analyze it.

Dataset columns: ${columns.join(', ')}

Column statistics:
${JSON.stringify(stats, null, 2)}

Sample rows:
${JSON.stringify(sample, null, 2)}

VISUALIZATION RULES — follow exactly:
- Rankings / comparisons / top-N / bottom-N / "which X has most/least Y" → visualization: "bar"  (backend will return table + bar chart)
- Trends over time / month-by-month / day-by-day / "how has X changed" → visualization: "line"  (backend will return line chart only)
- Proportions / share / percentage breakdown / "what portion" → visualization: "pie"  (backend will return pie chart only)
- Summaries / lists / detail rows / "show me all" / single metric / counts without comparison → visualization: "table"  (backend will return table only)
- Single-number answer / yes-no / text-only → visualization: "none"

Return ONLY valid JSON, no markdown fences, no explanation. Shape:
{
  "visualization": "bar" | "line" | "pie" | "table" | "none",
  "groupBy": "<column to group by, or null>",
  "metric": "count" | "sum" | "avg" | "max" | "min",
  "column": "<numeric column to aggregate, or null>",
  "filter": "<substring to filter all columns by, or null>",
  "sortDir": "asc" | "desc",
  "limit": <integer or null>,
  "needsRawData": true | false
}

Rules:
- Only use data from this dataset. Never invent values.
- Set needsRawData: true only when the user wants individual row details, not aggregates.
- If groupBy is null and needsRawData is false, set visualization to "none".`;

  const content = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ]);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse analysis plan from AI response.');
  return JSON.parse(jsonMatch[0]);
}

export async function generateAnswer(question, columns, results, rowCount) {
  const systemPrompt = `You are a concise data analysis assistant for a logistics manager.
Answer questions based ONLY on the provided computed results. Do not invent data.
Dataset: ${rowCount} total rows. Columns: ${columns.join(', ')}.`;

  const userMessage = `Question: ${question}

Computed results:
${JSON.stringify(results, null, 2)}

Write a clear, direct 1-3 sentence explanation of these results. No markdown, no bullet points.`;

  return chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

export interface AIStreamOptions {
  systemPrompt: string;
  userPrompt: string;
}

export async function streamAIResponse(options: AIStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NINEROUTER_API_KEY ||
    process.env.OPENAI_API_KEY;

  const baseUrl =
    process.env.AI_BASE_URL ||
    process.env.NINEROUTER_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta';

  const model =
    process.env.AI_MODEL ||
    process.env.NINEROUTER_MODEL ||
    'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error(
      'AI_API_KEY belum dikonfigurasi pada server. Harap atur AI_API_KEY / GEMINI_API_KEY di file .env'
    );
  }

  // Determine if using OpenAI-compatible API or native Gemini API
  const isOpenAICompatible =
    baseUrl.includes('openai.com') ||
    baseUrl.includes('9router') ||
    baseUrl.endsWith('/v1');

  if (isOpenAICompatible) {
    return streamOpenAIStyle(baseUrl, apiKey, model, options);
  } else {
    return streamGeminiStyle(baseUrl, apiKey, model, options);
  }
}

async function streamOpenAIStyle(
  baseUrl: string,
  apiKey: string,
  model: string,
  options: AIStreamOptions
): Promise<ReadableStream<Uint8Array>> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userPrompt },
      ],
      stream: true,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API Error:', errorText);
    throw new Error(`AI Provider Error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const reader = response.body?.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.substring(6);
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

async function streamGeminiStyle(
  baseUrl: string,
  apiKey: string,
  model: string,
  options: AIStreamOptions
): Promise<ReadableStream<Uint8Array>> {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanModel = model.replace(/^models\//, '');
  const url = `${cleanBase}/models/${cleanModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const fullPrompt = `${options.systemPrompt}\n\n${options.userPrompt}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error(`Gemini Provider Error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const reader = response.body?.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.substring(6);
                const parsed = JSON.parse(jsonStr);
                const candidates = parsed.candidates;
                if (candidates && candidates[0]?.content?.parts) {
                  for (const part of candidates[0].content.parts) {
                    if (part.text) {
                      controller.enqueue(encoder.encode(part.text));
                    }
                  }
                }
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

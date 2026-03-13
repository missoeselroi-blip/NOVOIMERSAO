import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";

const getAI = () => {
  // Try to get from build-time env or runtime global
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let source = "Vite Env";
  
  // If it's a string "undefined", empty, or not set, try the window global
  if (!apiKey || apiKey === "undefined" || apiKey === "" || typeof apiKey === 'undefined') {
    apiKey = (window as any).GEMINI_API_KEY;
    source = "Window Global";
  }
  
  // Final check to see if we have a valid-looking key
  if (!apiKey || apiKey === "undefined" || apiKey === "" || typeof apiKey === 'undefined') {
    console.error("Gemini API Key not found in any source.");
    throw new Error("Configuração Necessária: A chave da API do Gemini não foi encontrada no sistema. Por favor, verifique o arquivo index.html. 🔑");
  }
  
  console.log(`Gemini API Key detected from ${source}.`);
  return new GoogleGenAI({ apiKey });
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = (error: any) => {
  const errorMessage = error?.message || String(error);
  
  if (error?.status === 429 || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    console.warn("Gemini API Quota Exceeded (429).");
    throw new Error("Limite de cota do Gemini excedido. Por favor, aguarde um momento ou tente novamente mais tarde. ⏳");
  }

  if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("key is not valid")) {
    throw new Error("Chave de API Inválida: A chave que você inseriu no index.html não é válida ou foi digitada incorretamente. 🔑");
  }

  if (errorMessage.includes("PERMISSION_DENIED")) {
    throw new Error("Acesso Negado: Verifique se a sua chave de API tem permissão para usar o Gemini (Generative Language API). 🚫");
  }

  console.error("Gemini API Error:", error);

  if (errorMessage.includes("Rpc failed due to xhr error") || errorMessage.includes("Failed to fetch")) {
    throw new Error("Erro de conexão: Não foi possível falar com o servidor do Gemini. Verifique sua internet. 🌐");
  }

  // Show the actual error message to help debugging
  throw new Error(`Erro na IA: ${errorMessage}`);
};

const withRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = 
      retries > 0 && (
        error?.message?.includes("Rpc failed") || 
        error?.status === 500 || 
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("RESOURCE_EXHAUSTED")
      );

    if (isRetryable) {
      console.warn(`Retrying API call due to ${error?.status || 'error'}... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      // Use exponential backoff for 429
      const delay = error?.status === 429 ? RETRY_DELAY * 2 * (MAX_RETRIES - retries + 1) : RETRY_DELAY * (MAX_RETRIES - retries + 1);
      await sleep(delay);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

export const geminiService = {
  async generateText(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
        });
        return response.text;
      } catch (error) {
        return handleApiError(error);
      }
    });
  },

  async generateTextWithThought(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
        });

        let thought = "";
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if ((part as any).thought) {
              thought = (part as any).text;
            }
          }
        }

        return {
          text: response.text || "",
          thought: thought
        };
      } catch (error) {
        return handleApiError(error);
      }
    });
  },

  async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });
        const text = response.text || "{}";
        // Clean up markdown code blocks if present
        let jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        
        if (!jsonStr) {
          jsonStr = "{}";
        }

        try {
          return JSON.parse(jsonStr) as T;
        } catch (parseError) {
          console.error("Failed to parse JSON from AI:", jsonStr);
          throw new Error("A IA retornou um formato inválido ou incompleto. Por favor, tente novamente.");
        }
      } catch (error) {
        return handleApiError(error);
      }
    });
  },

  async generateOutline(topic: string) {
    const prompt = `Gere um esboço de pregação completo para o tema ou versículo: "${topic}". 
    O esboço deve conter:
    1. Tema
    2. Versículo bíblico (NVI)
    3. Introdução
    4. Desenvolvimento (pelo menos 3 pontos)
    5. Conclusão
    6. Oração
    7. Apelo
    Retorne em formato Markdown estruturado.`;

    return this.generateText(prompt, "Você é um pastor experiente e teólogo bíblico.");
  },

  async generateOutlineWithThought(topic: string, deepThinking: boolean = false) {
    const prompt = `Gere um esboço de pregação completo para o tema ou versículo: "${topic}". 
    O esboço deve conter:
    1. Tema
    2. Versículo bíblico (NVI)
    3. Introdução
    4. Desenvolvimento (pelo menos 3 pontos)
    5. Conclusão
    6. Oração
    7. Apelo
    Retorne em formato Markdown estruturado.`;

    return this.generateTextWithThought(prompt, "Você é um pastor experiente e teólogo bíblico.", deepThinking);
  },

  async generateImage(prompt: string) {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        return null;
      } catch (error) {
        console.error("Gemini Image API Error:", error);
        return null;
      }
    });
  },

  async generateSpeech(text: string, voiceName: string = 'Kore') {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        return this.pcmToWav(base64Audio, 24000);
      } catch (error) {
        console.error("Gemini TTS API Error:", error);
        return null;
      }
    });
  },

  pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
    const pcmData = Uint8Array.from(atob(pcmBase64), c => c.charCodeAt(0));
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + pcmData.length, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true); // PCM
    // channel count
    view.setUint16(22, 1, true); // Mono
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, pcmData.length, true);

    const wavData = new Uint8Array(wavHeader.byteLength + pcmData.byteLength);
    wavData.set(new Uint8Array(wavHeader), 0);
    wavData.set(pcmData, wavHeader.byteLength);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(wavData);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:audio/wav;base64,${btoa(binary)}`;
  },

  async searchNews(query: string) {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Pesquise as notícias mais recentes sobre: "${query}". 
          Retorne um resumo estruturado com título, data e um breve resumo de cada notícia.
          Inclua links para as fontes se possível.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text;
      } catch (error) {
        return handleApiError(error);
      }
    });
  },

  async factCheck(content: string, isImage: boolean = false) {
    return withRetry(async () => {
      try {
        const ai = getAI();
        const prompt = isImage 
          ? "Analise esta imagem e verifique se as informações nela contidas são verdadeiras ou fake news. Use o Google Search para validar os fatos."
          : `Analise o seguinte texto e verifique se é verdade ou fake news: "${content}". Use o Google Search para validar os fatos.`;
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: isImage ? { parts: [{ inlineData: { data: content.split(',')[1], mimeType: 'image/png' } }, { text: prompt }] } : prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text;
      } catch (error) {
        return handleApiError(error);
      }
    });
  },
  
  async generateMeaning(query: string, model: string, deepThinking: boolean = false) {
    const systemInstruction = `Você é um especialista em linguística, teologia e história. 
    Sua tarefa é fornecer o significado e a explicação detalhada do termo solicitado.
    Adote o estilo e a perspectiva do modelo de IA: ${model}.
    Forneça etimologia, contexto bíblico, contexto histórico e aplicações práticas.`;
    
    return this.generateTextWithThought(`Explique o significado de: "${query}"`, systemInstruction, deepThinking);
  }
};

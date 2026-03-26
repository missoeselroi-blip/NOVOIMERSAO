import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";

const getAI = () => {
  // Priority:
  // 1. import.meta.env.VITE_GEMINI_API_KEY (Vite standard)
  // 2. process.env.GEMINI_API_KEY (Defined in vite.config.ts)
  // 3. window.GEMINI_API_KEY (Manual fallback)

  const getValidKey = (key: any) => {
    if (!key || typeof key !== 'string') return null;
    // Remove quotes, whitespace, and invisible zero-width characters
    const cleaned = key.trim()
      .replace(/['"]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, ''); 
    
    if (!cleaned || cleaned === "undefined" || cleaned === "null") return null;
    return cleaned;
  };

  // Try multiple sources for the API key, prioritizing runtime injection
  let apiKey = getValidKey((window as any).RUNTIME_ENV?.VITE_GEMINI_API_KEY);
  
  if (!apiKey) {
    apiKey = getValidKey(import.meta.env.VITE_GEMINI_API_KEY);
  }
  
  if (!apiKey) {
    apiKey = getValidKey((process.env as any).GEMINI_API_KEY);
  }

  if (!apiKey) {
    apiKey = getValidKey((process.env as any).VITE_GEMINI_API_KEY);
  }
  
  if (!apiKey) {
    apiKey = getValidKey((window as any).GEMINI_API_KEY);
  }
  
  if (!apiKey) {
    throw new Error("Chave de API não encontrada. Por favor, adicione GEMINI_API_KEY em 'Settings > Secrets' no seu painel de controle. 🔑");
  }

  // Debug log to help user verify the key (masked for security)
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`🔑 Gemini API Key detected (Masked): ${maskedKey} | Length: ${apiKey.length}`);
  
  return new GoogleGenAI({ apiKey });
};

const MAX_RETRIES = 5; // Increased from 3
const RETRY_DELAY = 2000; // Increased from 1000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = (error: any) => {
  const errorMessage = error?.message || String(error);
  
  if (error?.status === 429 || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    console.warn("Gemini API Quota Exceeded (429).");
    throw new Error("Limite de cota do Gemini excedido. Por favor, aguarde um momento ou tente novamente mais tarde. ⏳");
  }

  if (error?.status === 503 || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
    throw new Error("O Google Gemini está com alta demanda no momento. 📈 Por favor, tente novamente em alguns segundos. Isso é temporário!");
  }

  if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("key is not valid")) {
    throw new Error("Chave de API Inválida. Verifique se a chave GEMINI_API_KEY em 'Settings > Secrets' está correta. 🔑");
  }

  if (errorMessage.includes("PERMISSION_DENIED")) {
    throw new Error("Acesso Negado: Verifique se a sua chave de API tem permissão para usar o Gemini. 🚫");
  }

  console.error("Gemini API Error:", error);

  if (errorMessage.includes("Rpc failed due to xhr error") || errorMessage.includes("Failed to fetch")) {
    throw new Error("Erro de conexão: Não foi possível falar com o servidor do Gemini. Verifique sua internet. 🌐");
  }

  throw new Error(`Erro na IA: ${errorMessage}`);
};

const withRetry = async <T>(fn: (retries: number) => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn(retries);
  } catch (error: any) {
    const isRetryable = 
      retries > 0 && (
        error?.message?.includes("Rpc failed") || 
        error?.message?.includes("high demand") ||
        error?.message?.includes("UNAVAILABLE") ||
        error?.status === 500 || 
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("RESOURCE_EXHAUSTED")
      );

    if (isRetryable) {
      console.warn(`Retrying API call due to ${error?.status || 'error'}... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      const delay = error?.status === 429 ? RETRY_DELAY * 2 * (MAX_RETRIES - retries + 1) : RETRY_DELAY * (MAX_RETRIES - retries + 1);
      await sleep(delay);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

export const geminiService = {
  async generateText(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
        });
        return response.text || "";
      } catch (error: any) {
        return handleApiError(error);
      }
    });
  },

  async generateTextWithThought(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
        });

        let thought = "";
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && Array.isArray(parts)) {
          for (const part of parts) {
            if ((part as any).thought === true) {
              thought = (part as any).text || "";
            }
          }
        }

        return {
          text: response.text || "",
          thought: thought
        };
      } catch (error: any) {
        return handleApiError(error);
      }
    });
  },

  async generateJSON<T>(prompt: string, systemInstruction?: string, responseSchema?: any): Promise<T> {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        const text = response.text || "{}";
        let jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        
        // Robust cleanup for common LLM JSON errors
        // 1. Remove trailing commas before closing braces/brackets
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        
        if (!jsonStr) jsonStr = "{}";
        
        try {
          return JSON.parse(jsonStr) as T;
        } catch (parseError: any) {
          console.error("JSON Parse Error. Raw text:", text);
          // Attempt to fix common issues like unescaped newlines or quotes
          // This is a last resort
          try {
             // Try to escape unescaped newlines in strings
             const fixedJson = jsonStr.replace(/(?<=: \")([\s\S]*?)(?=\",?)/g, (match) => {
                return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
             });
             return JSON.parse(fixedJson) as T;
          } catch (e) {
             throw parseError;
          }
        }
      } catch (error: any) {
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
    return withRetry(async (currentRetry) => {
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
    try {
      const ai = getAI();
      // Clean text: remove markdown and limit length for stability
      const cleanText = text
        .replace(/#+\s/g, '') 
        .replace(/\*\*/g, '') 
        .replace(/\*/g, '')   
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') 
        .replace(/```[\s\S]*?```/g, '') 
        .replace(/`([^`]+)`/g, '$1') 
        .replace(/>\s/g, '') 
        .replace(/-\s/g, '') 
        .replace(/\n+/g, ' ') 
        .slice(0, 5000) 
        .trim();

      if (!cleanText) return null;

      console.log("Generating speech for:", { voiceName, textLength: cleanText.length });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      
      if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        console.warn("No audio data in Gemini TTS response:", response);
        return null;
      }

      const base64Audio = response.candidates[0].content.parts[0].inlineData.data;
      return this.pcmToWav(base64Audio, 24000);
    } catch (error: any) {
      console.error("Gemini TTS API Error:", error);
      // Handle the specific "disturbed or locked" error by suggesting a retry or providing a cleaner message
      if (error?.message?.includes("disturbed or locked")) {
        console.warn("Fetch stream was locked. This can happen in some browser environments.");
      }
      return null;
    }
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

    const blob = new Blob([wavData], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  },

  async searchNews(query: string) {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const response = await ai.models.generateContent({
          model: model,
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
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const prompt = isImage 
          ? "Analise esta imagem e verifique se as informações nela contidas são verdadeiras ou fake news. Use o Google Search para validar os fatos."
          : `Analise o seguinte texto e verifique se é verdade ou fake news: "${content}". Use o Google Search para validar os fatos.`;
        
        const response = await ai.models.generateContent({
          model: model,
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
  },

  async chat(message: string, history: any[] = [], systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        const chat = ai.chats.create({
          model: model,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
          history: history,
        });
        const response = await chat.sendMessage({ message });
        
        let thought = "";
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && Array.isArray(parts)) {
          for (const part of parts) {
            if ((part as any).thought === true) {
              thought = (part as any).text || "";
            }
          }
        }

        return {
          text: response.text || "",
          thought: thought
        };
      } catch (error: any) {
        return handleApiError(error);
      }
    });
  },

  async chatStream(message: string, history: any[] = [], systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      try {
        const ai = getAI();
        // Use a fallback model if we've already retried a few times
        const model = currentRetry <= 2 ? "gemini-3.1-flash-lite-preview" : "gemini-3-flash-preview";
        
        const chat = ai.chats.create({
          model: model,
          config: {
            systemInstruction,
            thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
          },
          history: history,
        });
        return await chat.sendMessageStream({ message });
      } catch (error: any) {
        return handleApiError(error);
      }
    });
  }
};

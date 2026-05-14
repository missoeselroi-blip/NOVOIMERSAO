import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";
export { GoogleGenAI, Modality, ThinkingLevel, Type };

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    throw new Error("Chave de API não encontrada. Por favor, adicione GEMINI_API_KEY em 'Settings > Secrets' no seu painel de controle. 🔑");
  }

  // Debug log to help user verify the key (masked for security)
  const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`🔑 Gemini API Key detected (Masked): ${maskedKey} | Length: ${apiKey.length}`);
  
  return new GoogleGenAI({ apiKey });
};

const MAX_RETRIES = 5; // Increased from 3
const RETRY_DELAY = 5000; // Increased to 5000ms to handle high demand better

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
    return handleApiError(error);
  }
};

export const geminiService = {
  getAI,
  async generateText(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = "gemini-flash-latest";
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        },
      });
      return response.text || "";
    });
  },

  async generateFastText(prompt: string, systemInstruction?: string) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = "gemini-3.1-flash-lite";
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
        },
      });
      return response.text || "";
    });
  },

  async generateTextWithThought(prompt: string, systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = "gemini-flash-latest";
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
    });
  },

  async generateJSON<T>(prompt: string, systemInstruction?: string, responseSchema?: any): Promise<T> {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = "gemini-flash-latest";
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
    });
  },

  async generateSpeech(text: string, voiceName: string = 'Kore', emotion?: string) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      
      // Prepend emotion/tone if provided
      const instruction = emotion ? `Say this with a ${emotion} tone: ` : '';
      
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
        .slice(0, 4000) // Increased from 3000 to 4000 for better stability
        .trim();

      if (!cleanText) return null;

      const fullText = instruction + cleanText;

      console.log("Generating speech for:", { voiceName, emotion, textLength: fullText.length, retry: MAX_RETRIES - currentRetry });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: fullText }] }],
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
        // If it's a 500 or empty response, we might want to throw to trigger retry
        throw new Error("Empty audio response from Gemini TTS");
      }

      const base64Audio = response.candidates[0].content.parts[0].inlineData.data;
      return this.pcmToWav(base64Audio, 24000);
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

    const blob = new Blob([wavData], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  },

  async searchNews(query: string) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = currentRetry <= 2 ? "gemini-3.1-flash-lite" : "gemini-flash-latest";
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
    });
  },

  async factCheck(content: string, isImage: boolean = false) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = currentRetry <= 2 ? "gemini-3.1-flash-lite" : "gemini-flash-latest";
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
    });
  },
  
  async generateMeaning(query: string, model: string, deepThinking: boolean = false) {
    const systemInstruction = `Você é um especialista em linguística, teologia e história. 
    Sua tarefa é fornecer o significado e a explicação detalhada do termo solicitado.
    Adote o estilo e a perspectiva do modelo de IA: ${model}.
    Forneça etimologia, contexto bíblico, contexto histórico e aplicações práticas.`;
    
    return this.generateTextWithThought(`Explique o significado de: "${query}"`, systemInstruction, deepThinking);
  },

  async transcribeAudio(base64Audio: string, mimeType: string = 'audio/webm') {
    return withRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          { inlineData: { data: base64Audio, mimeType } },
          { text: "Transcreva este áudio exatamente como foi dito. Retorne apenas a transcrição, sem comentários adicionais." }
        ]
      });
      return response.text;
    });
  },

  async chat(message: string, history: any[] = [], systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      const model = currentRetry <= 2 ? "gemini-3.1-flash-lite" : "gemini-flash-latest";
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
    });
  },

  async chatStream(message: string, history: any[] = [], systemInstruction?: string, deepThinking: boolean = false) {
    return withRetry(async (currentRetry) => {
      const ai = getAI();
      // Use a fallback model
      const model = currentRetry <= 2 ? "gemini-3.1-flash-lite" : "gemini-flash-latest";
      
      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction,
          thinkingConfig: deepThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        },
        history: history,
      });
      return await chat.sendMessageStream({ message });
    });
  },

  async identifyMusicRhythm(lyrics: string) {
    const prompt = `Analise a seguinte letra de música e identifique o ritmo mais provável entre: Worship, Gospel Pop, Rock Cristão, Folk, MPB Cristã, Sertanejo, Pentecostal, Instrumental.
    Letra: "${lyrics}"
    Retorne apenas o nome do ritmo.`;
    return this.generateFastText(prompt, "Você é um produtor musical especializado em música cristã.");
  },

  async generateLyricsTimestamps(lyrics: string, totalDurationSeconds: number) {
    const prompt = `Dada a seguinte letra de música e a duração total de ${totalDurationSeconds} segundos, gere timestamps (em segundos) sugeridos para cada linha da letra para sincronização "karaokê".
    Letra:
    ${lyrics}
    
    Retorne um array JSON de objetos: [{ "time": number, "text": string }] 
    Distribua os tempos de forma equilibrada.`;
    
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.NUMBER },
          text: { type: Type.STRING }
        },
        required: ["time", "text"]
      }
    };
    
    return (this as any).generateJSON(prompt, "Você é um editor de áudio especializado em letras sincronizadas.", schema);
  }
};

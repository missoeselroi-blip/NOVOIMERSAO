import { geminiService } from "./geminiService";
import { Type } from "@google/genai";

export const multiAiService = {
  async generateOpenAiImage(prompt: string) {
    try {
      const response = await fetch("/api/ai/openai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Erro ao gerar imagem com OpenAI");
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("OpenAI Image Error:", error);
      return null;
    }
  },

  async analyzeSentiment(text: string) {
    try {
      const response = await fetch("/api/ai/openai/sentiment-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Erro na análise de sentimento");
      return await response.json();
    } catch (error) {
      console.error("Sentiment Analysis Error:", error);
      return null;
    }
  },

  async getPersonalizedRecommendations(userProfile: any, studyHistory: any) {
    // Gemini is our primary engine for recommendations
    try {
      const prompt = `Based on this user profile: ${JSON.stringify(userProfile)} and study history: ${JSON.stringify(studyHistory)}, provide 3 personalized study recommendations for Biblical studies. Return ONLY a JSON object with a 'recommendations' array of strings.`;
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3 personalized recommendations"
          }
        },
        required: ["recommendations"]
      };

      const result = await geminiService.generateJSON<{ recommendations: string[] }>(
        prompt,
        "You are a helpful assistant providing Biblical study recommendations.",
        schema
      );

      return result.recommendations || [];
    } catch (geminiError) {
      console.error("Gemini recommendations failed:", geminiError);
      return [
        "Estude o livro de Gênesis para entender as origens.",
        "Leia os Salmos para inspiração diária.",
        "Analise a carta aos Romanos para profundidade teológica."
      ]; // Hardcoded fallback as last resort
    }
  },

  async generateStabilityImage(prompt: string) {
    try {
      const response = await fetch("/api/ai/stability/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Erro ao gerar imagem com Stability AI");
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Stability AI Image Error:", error);
      return null;
    }
  }
};

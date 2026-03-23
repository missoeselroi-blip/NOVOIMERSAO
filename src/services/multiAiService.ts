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
    try {
      const response = await fetch("/api/ai/anthropic/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, studyHistory }),
      });
      if (!response.ok) throw new Error("Erro ao obter recomendações do Anthropic");
      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error("Anthropic Recommendations Error:", error);
      return null;
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

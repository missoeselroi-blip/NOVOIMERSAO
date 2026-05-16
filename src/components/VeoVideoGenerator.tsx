import React, { useState } from 'react';
import { Loader2, Video, Sparkles, AlertCircle, Play } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useCredits } from '../contexts/CreditContext';
import { useToast } from './Toast';

export const VeoVideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { balance, consumeCredits } = useCredits();
  const { showToast } = useToast();
  const cost = 50;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Digite um tema para o vídeo! 🎥", "info");
      return;
    }

    if (balance < cost) {
      showToast("Saldo insuficiente para gerar vídeo! 💎", "error");
      return;
    }

    // Check API Key
    if (!(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      if (!(await window.aistudio.hasSelectedApiKey())) {
        showToast("É necessário selecionar uma chave de API para gerar vídeos.", "error");
        return;
      }
    }

    setIsGenerating(true);
    setVideoUrl(null);
    showToast("Gerando vídeo com Veo... Isso pode levar alguns minutos. 🎥⏳", "info");

    try {
      let operationRes = await fetch('/api/gemini/generateVideos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        })
      });
      let operation = await operationRes.json();

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        let opName = operation.name;
        if (opName.startsWith('operations/')) {
          opName = opName.substring(11);
        }
        const pollRes = await fetch(`/api/gemini/operations/${opName}`);
        operation = await pollRes.json();
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        // Fetch video via proxy API
        const response = await fetch(`/api/gemini/downloadVideo?uri=${encodeURIComponent(downloadLink)}`, {
          method: 'GET'
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        await consumeCredits(cost, `Geração de Vídeo Veo: ${prompt}`);
        showToast("Vídeo gerado com sucesso! 🎬✨", "success");
      } else {
        showToast("Erro ao gerar vídeo.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Erro ao gerar vídeo.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Video className="text-emerald-600" size={24} />
        Gerador de Vídeo (Veo)
      </h3>
      <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
        Crie vídeos cinematográficos a partir de textos. Custo: {cost} créditos.
      </p>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl mb-4 h-32"
        placeholder="Descreva a cena que deseja gerar..."
      />

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
        {isGenerating ? "Gerando..." : "Gerar Vídeo"}
      </button>

      {videoUrl && (
        <div className="mt-8">
          <video src={videoUrl} controls className="w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
};

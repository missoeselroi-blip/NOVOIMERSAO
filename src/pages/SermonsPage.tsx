import React, { useState } from 'react';
import { Play, Download, Video, Music } from 'lucide-react';

const mockSermons = [
  { id: 1, title: 'O Poder da Fé', speaker: 'Pr. João Silva', type: 'video', duration: '30:00' },
  { id: 2, title: 'A Graça de Deus', speaker: 'Dra. Maria Souza', type: 'audio', duration: '45:00' },
];

const SermonsPage = () => {
  const [sermons] = useState(mockSermons);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter uppercase mb-8">Sermões</h1>
      <div className="space-y-4">
        {sermons.map(sermon => (
          <div key={sermon.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                {sermon.type === 'video' ? <Video size={24} /> : <Music size={24} />}
              </div>
              <div>
                <h3 className="font-bold">{sermon.title}</h3>
                <p className="text-sm text-stone-500">{sermon.speaker} • {sermon.duration}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                <Play size={20} />
              </button>
              <button className="p-3 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl hover:bg-stone-200">
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SermonsPage;

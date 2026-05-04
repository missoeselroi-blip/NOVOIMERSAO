import React from 'react';
import { 
  Mail, 
  MessageCircle, 
  Globe,
  Instagram,
  Youtube,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhoAmIPage({ onNavigate }: { onNavigate?: (tab: string, state?: any) => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="text-center space-y-4">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/10">
          <Heart size={48} fill="currentColor" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">Quem Somos?</h1>
          <div className="h-1.5 w-24 bg-emerald-600 mx-auto rounded-full" />
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.3em] pt-2">NOSSA HISTÓRIA E MISSÃO</p>
        </div>
        <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
          Conheça a história e o propósito por trás do Imersão Bíblica IA.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-emerald-600/10 rounded-[3rem] blur-3xl" />
          <img 
            src="/wesley.jpg" 
            alt="Wesley Reis" 
            className="relative w-full h-auto rounded-[3rem] shadow-2xl border-8 border-white dark:border-zinc-800"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-xl leading-relaxed text-stone-700 dark:text-zinc-300 font-medium">
              Olá! Meu nome é <strong>Wesley Reis</strong>. Sou pastor auxiliar e missionário da Igreja Evangélica Betânia de Ipatinga-MG.
            </p>
            <p className="text-lg leading-relaxed text-stone-600 dark:text-zinc-400">
              Sou o idealizador e desenvolvedor do <strong>Imersão Bíblica IA</strong>. Este projeto nasceu de um desejo profundo de democratizar o acesso ao conhecimento teológico de qualidade, utilizando as ferramentas mais modernas de Inteligência Artificial para auxiliar no estudo das Escrituras.
            </p>
            <p className="text-lg leading-relaxed text-stone-600 dark:text-zinc-400">
              Minha missão é fornecer recursos que inspirem, eduquem e fortaleçam a fé de cada cristão, desde o iniciante até o estudante avançado. Acreditamos que a tecnologia, quando usada com sabedoria, pode ser uma grande aliada na propagação do Evangelho.
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/30 space-y-6">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <Globe size={24} />
              Trabalho Missionário
            </h3>
            <p className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed">
              Realizamos impactos evangelísticos, teatro em escolas, caravanas missionárias com foco no social e espiritual, apoiando comunidades carentes e igrejas por meio de um Grupo chamado <strong>GRUPAMI - Grupo de Amigos Missionários</strong>. Siga-nos em nossas redes sociais e faça parte também desse grupo de amigos.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://www.grupami.net" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-100 dark:border-zinc-800 text-emerald-600 hover:bg-emerald-50 transition-all hover:scale-110"
                title="Site Oficial"
              >
                <Globe size={24} />
              </a>
              <a 
                href="https://www.instagram.com/grupami.missoes?igsh=NHJpN3MybnhyYWVq" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-100 dark:border-zinc-800 text-pink-600 hover:bg-pink-50 transition-all hover:scale-110"
                title="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://www.youtube.com/channel/UCgtcECZWTx3pr4j0Pm0hlyQ" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-100 dark:border-zinc-800 text-red-600 hover:bg-red-50 transition-all hover:scale-110"
                title="Youtube"
              >
                <Youtube size={24} />
              </a>
              <a 
                href="mailto:imersaobiblicapp@gmail.com" 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-100 dark:border-zinc-800 text-stone-800 dark:text-white hover:bg-stone-50 transition-all hover:scale-110"
                title="E-mail"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => onNavigate?.('contact')}
              className="w-full py-5 bg-emerald-600 text-white font-bold rounded-[2rem] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 group uppercase"
            >
              <Mail size={24} className="group-hover:scale-110 transition-transform" />
              Contato
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

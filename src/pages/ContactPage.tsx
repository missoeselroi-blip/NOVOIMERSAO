import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send,
  Loader2,
  CheckCircle2,
  Globe,
  Instagram,
  Youtube,
  QrCode,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { cn } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from '../components/Toast';

export default function ContactPage() {
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      showToast("Glória a Deus! Mensagem enviada com sucesso! 🙏✨");
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const contactInfo: any[] = [];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          {contactInfo.map((info) => (
            <div 
              key={info.label}
              className={`p-6 rounded-3xl border border-transparent hover:border-stone-200 dark:hover:border-zinc-800 transition-all ${info.color}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                  {info.icon}
                </div>
                <span className="font-bold text-lg">{info.label}</span>
              </div>
              <p className="text-stone-600 dark:text-zinc-400 mb-4">{info.value}</p>
              {info.action && (
                <button 
                  onClick={info.action}
                  className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-2"
                >
                  Entrar em contato <Send size={14} />
                </button>
              )}
            </div>
          ))}

          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">Apoio Ministerial</h3>
            <p className="opacity-80 text-sm leading-relaxed">
              Nosso objetivo é servir ao corpo de Cristo através do suporte aos pregadores e líderes. 
              Sua mensagem será lida com carinho e respondida assim que possível.
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
            <h3 className="text-xl font-bold mb-4 text-emerald-800 dark:text-emerald-400">Conheça Nosso Trabalho Missionário</h3>
            <p className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed mb-6">
              Realizamos impactos evangelísticos, teatro em escolas, caravanas missionárias com foco no social e espiritual, apoiando comunidades carentes e igrejas por meio de um Grupo chamado GRUPAMI - Grupo de Amigos Missionários. Siga-nos em nossas redes sociais. E faça parte também desse grupo de amigos.
            </p>
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Siga nossas redes sociais</span>
                <div className="flex gap-2">
                  <a href="https://www.grupami.net" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-stone-100 dark:border-zinc-800 text-emerald-600 hover:bg-emerald-50 transition-colors" title="Site">
                    <Globe size={18} />
                  </a>
                  <a href="https://www.instagram.com/grupami.missoes?igsh=NHJpN3MybnhyYWVq" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-stone-100 dark:border-zinc-800 text-pink-600 hover:bg-pink-50 transition-colors" title="Instagram">
                    <Instagram size={18} />
                  </a>
                  <a href="https://www.youtube.com/channel/UCgtcECZWTx3pr4j0Pm0hlyQ" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-stone-100 dark:border-zinc-800 text-red-600 hover:bg-red-50 transition-colors" title="Youtube">
                    <Youtube size={18} />
                  </a>
                  <a href="https://www.tiktok.com/@grupamikids?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-stone-100 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 transition-colors" title="Tiktok">
                    <svg 
                      viewBox="0 0 24 24" 
                      width="18" 
                      height="18" 
                      fill="currentColor"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13 3.1-.12 6.2-.13 9.3 0 1.29-.27 2.61-.95 3.71-.68 1.11-1.74 1.99-2.96 2.43-1.22.44-2.58.53-3.86.27-1.28-.27-2.48-.94-3.37-1.9-.89-.96-1.46-2.22-1.61-3.51-.15-1.29.11-2.63.75-3.77.64-1.14 1.69-2.06 2.93-2.55 1.24-.49 2.64-.58 3.94-.25.12.03.24.07.36.11v4.11c-.81-.24-1.7-.23-2.49.03-.79.26-1.48.81-1.9 1.52-.42.71-.56 1.57-.39 2.38.17.81.65 1.54 1.32 2.01.67.47 1.51.68 2.33.59.82-.09 1.59-.49 2.12-1.13.53-.64.8-1.47.76-2.31-.04-3.4-.02-6.81-.03-10.21-.01-4.53-.01-9.06-.01-13.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
            {isSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 relative"
              >
                <button 
                  onClick={() => setIsSent(false)}
                  className="absolute top-0 right-0 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mensagem Enviada!</h3>
                <p className="text-stone-500 dark:text-zinc-400 mb-8">
                  Obrigado por entrar em contato. Responderemos o mais breve possível.
                </p>
                <button 
                  onClick={() => setIsSent(false)}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Seu Nome</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="⚓ Ex: João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Seu E-mail</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="⚓ Ex: joao@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Assunto</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="Quero receber oração!">Quero receber oração!</option>
                    <option value="Quero receber um estudo bíblico!">Quero receber um estudo bíblico!</option>
                    <option value="Quero tirar uma dúvida bíblica!">Quero tirar uma dúvida bíblica!</option>
                    <option value="Quero pedir um conselho!">Quero pedir um conselho!</option>
                    <option value="Quero dar uma sugestão!">Quero dar uma sugestão!</option>
                    <option value="Não posso pagar pelo certificado">Não posso pagar pelo certificado</option>
                    <option value="Outro assunto">Outro assunto</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-500 uppercase tracking-wider">Mensagem</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={cn(
                      "w-full p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none",
                      fontFamily === 'dyslexic' ? 'font-dyslexic' : 
                      fontFamily === 'serif' ? 'font-serif' : 
                      fontFamily === 'mono' ? 'font-mono' : 'font-sans',
                      fontSize === 'xs' ? 'text-xs' :
                      fontSize === 'sm' ? 'text-sm' :
                      fontSize === 'base' ? 'text-base' :
                      fontSize === 'lg' ? 'text-lg' :
                      fontSize === 'xl' ? 'text-xl' :
                      fontSize === '2xl' ? 'text-2xl' : 'text-3xl'
                    )}
                    style={{ lineHeight }}
                    placeholder="⚓ Escreva sua mensagem aqui..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

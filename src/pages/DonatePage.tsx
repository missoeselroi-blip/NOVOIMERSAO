import React, { useState } from 'react';
import { 
  Heart, 
  DollarSign, 
  Calendar, 
  Check, 
  CreditCard, 
  ArrowRight,
  Globe,
  Instagram,
  Youtube,
  QrCode,
  Copy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '../utils/clipboard';
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from '../components/Toast';
import { cn } from '../types';

const PRESET_VALUES = [10, 30, 50, 100];
const FREQUENCIES = [
  { id: 'once', label: 'Única' },
  { id: 'monthly', label: 'Mensal' },
  { id: 'quarterly', label: 'Trimestral' },
  { id: 'semiannual', label: 'Semestral' },
  { id: 'annual', label: 'Anual' }
];

export default function DonatePage() {
  const { showToast } = useToast();
  const [amount, setAmount] = useState<number | string>(30);
  const [frequency, setFrequency] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);

  const handleCopyPix = () => {
    const pixKey = "22981588428";
    copyToClipboard(pixKey);
    showToast("Chave PIX copiada! 🙌✨");
  };

  const handleDonate = () => {
    setShowPaypalModal(true);
  };

  const confirmPaypalRedirect = () => {
    setShowPaypalModal(false);
    setIsProcessing(true);
    showToast("Redirecionando para o PayPal... 🙏✨", 'info');
    
    setTimeout(() => {
      setIsProcessing(false);
      window.open('https://www.paypal.com/donate', '_blank');
      showToast("Obrigado pela sua generosidade! Que Deus o abençoe ricamente. 🙌❤️");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Heart size={40} fill="currentColor" />
        </div>
        <div className="flex items-center justify-center gap-4">
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-4xl font-display font-bold">Contribua com a Obra</h2>
          <img 
            src="https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-stone-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Olá meu querido(a), meu nome é Wesley Francisco Reis, sou pastor auxiliar e missionário da Igreja Evangélica Betânia de Ipatinga-MG e o idealizador desse App. Saiba que a sua contribuição nos ajudará a manter as ferramentas gratuitas e a levar a Palavras de Deus a mais pessoas através da presença digital. Deus retribua cem vezes mais. Obrigado! ❤️
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={24} />
              Escolha o Valor
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {PRESET_VALUES.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={cn(
                    "py-4 rounded-2xl font-bold text-lg transition-all border-2",
                    amount === val 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                      : "bg-stone-50 dark:bg-zinc-800 border-transparent text-stone-600 dark:text-zinc-300 hover:border-emerald-200"
                  )}
                >
                  R$ {val},00
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">R$</span>
              <input 
                type="number"
                placeholder="⚓ Outro valor"
                value={typeof amount === 'number' && PRESET_VALUES.includes(amount) ? '' : amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-zinc-800 border-2 border-transparent rounded-2xl focus:border-emerald-500 outline-none font-bold text-lg"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              Frequência
            </h3>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setFrequency(freq.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-sm transition-all border",
                    frequency === freq.id 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-500"
                  )}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6">
            <h3 className="text-2xl font-bold">Resumo da Doação</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <span className="opacity-80">Valor</span>
                <span className="text-2xl font-bold">R$ {amount || 0},00</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <span className="opacity-80">Frequência</span>
                <span className="font-bold">{FREQUENCIES.find(f => f.id === frequency)?.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Método</span>
                <span className="flex items-center gap-2 font-bold">
                  <CreditCard size={18} /> PayPal
                </span>
              </div>
            </div>

            <button 
              onClick={handleDonate}
              disabled={isProcessing || !amount}
              className="w-full py-5 bg-white text-emerald-600 font-bold rounded-2xl hover:bg-stone-100 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? "Processando..." : "Doar com PayPal"}
              <ArrowRight size={20} />
            </button>

            <button 
              onClick={() => setShowPix(!showPix)}
              className="w-full py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <QrCode size={20} />
              Contribuir via PIX?
            </button>

            {showPix && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl text-zinc-900 space-y-4 shadow-inner"
              >
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold text-stone-400 uppercase">Valor da Doação</p>
                  <p className="text-2xl font-bold text-emerald-600">R$ {amount || 0},00</p>
                </div>

                <div className="flex justify-center p-4 bg-stone-50 rounded-2xl">
                  <QRCodeCanvas 
                    value={`00020126330014BR.GOV.BCB.PIX0111229815884285204000053039865405${amount}.005802BR5901*6001*62070503***6304`} 
                    size={160}
                    level="H"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Chave PIX (Celular)</p>
                  <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="flex-1 font-mono font-bold text-sm">22981588428</span>
                    <button 
                      onClick={handleCopyPix}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Copiar Chave"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                  Escaneie o QR Code acima ou copie a chave para realizar sua contribuição.
                </p>
              </motion.div>
            )}
          </div>

          <div className="p-6 bg-stone-100 dark:bg-zinc-800 rounded-3xl space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-stone-600 dark:text-zinc-300">
              <Check className="text-emerald-500" size={20} />
              Transparência
            </h4>
            <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
              Todas as doações são processadas de forma segura. Você receberá um recibo por e-mail e pode gerenciar suas contribuições a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaypalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-stone-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <CreditCard className="text-blue-500" size={24} />
                  Doação via PayPal
                </h3>
                <button 
                  onClick={() => setShowPaypalModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300 bg-stone-100 dark:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl text-sm leading-relaxed">
                  <p className="font-bold mb-2">Dica: Vincule sua conta Google ao PayPal!</p>
                  <p>Para uma experiência mais rápida e segura nas próximas vezes, você pode vincular sua conta do Google ao seu PayPal durante o processo de pagamento.</p>
                </div>

                <p className="text-stone-600 dark:text-zinc-400 text-sm">
                  Você será redirecionado para o ambiente seguro do PayPal para concluir sua doação de <strong className="text-emerald-600 dark:text-emerald-400">R$ {amount || 0},00</strong>.
                </p>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowPaypalModal(false)}
                    className="flex-1 py-4 font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmPaypalRedirect}
                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    Continuar <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

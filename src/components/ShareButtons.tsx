import React from 'react';
import { Share2, Instagram, MessageCircle, Facebook, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';
import { copyToClipboard } from '../utils/clipboard';

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, text, url = window.location.href, className = "" }) => {
  const { showToast } = useToast();

  const shareData = {
    title,
    text,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const message = `${text}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  const handleInstagram = () => {
    copyToClipboard(`${text}\n\n${url}`);
    showToast("Texto copiado! Abra o Instagram e cole no seu Story ou Post. 📸", "info");
  };

  const handleCopyLink = () => {
    copyToClipboard(`${text}\n\n${url}`);
    showToast("Link e texto copiados para a área de transferência! 📋", "success");
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsApp}
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
        title="Compartilhar no WhatsApp"
      >
        <MessageCircle size={18} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFacebook}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
        title="Compartilhar no Facebook"
      >
        <Facebook size={18} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleInstagram}
        className="p-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-sm"
        title="Compartilhar no Instagram"
      >
        <Instagram size={18} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNativeShare}
        className="p-2 bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-full hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors shadow-sm"
        title="Mais opções"
      >
        <Share2 size={18} />
      </motion.button>
    </div>
  );
};

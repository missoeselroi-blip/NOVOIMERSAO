import { useToast } from '../components/Toast';
import { copyToClipboard } from './clipboard';

export const useShare = () => {
  const { showToast } = useToast();

  const share = async (data: { title: string; text: string; url?: string }) => {
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err: any) {
      // If user canceled, don't show error or fallback
      if (err.name === 'AbortError') {
        return false;
      }
      
      // Fallback to clipboard
      try {
        const copyText = `${data.title}\n\n${data.text}${data.url ? '\n\n' + data.url : ''}`;
        const successful = await copyToClipboard(copyText);
        if (successful) {
          showToast('Link e conteúdo copiados para a área de transferência!', 'success');
          return true;
        } else {
          throw new Error('Clipboard fallback failed');
        }
      } catch (clipErr) {
        console.error('Clipboard error:', clipErr);
        showToast('Não foi possível compartilhar ou copiar o conteúdo.', 'error');
        return false;
      }
    }
  };

  return { share };
};

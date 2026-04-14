import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Clock, Check, AlertTriangle } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationSettings } from '../types';
import { useToast } from './Toast';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermissionGranted(
        typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
      );
    }
  }, [isOpen]);

  const handleToggleEnabled = async () => {
    if (typeof window !== 'undefined' && !('Notification' in window)) {
      showToast('Seu navegador não suporta notificações desktop.', 'error');
      return;
    }

    if (!permissionGranted) {
      try {
        const granted = await notificationService.requestPermission();
        setPermissionGranted(granted);
        if (!granted) {
          showToast('Permissão de notificação negada. Por favor, ative nas configurações do seu navegador.', 'error');
          return;
        }
        showToast('Notificações ativadas com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao solicitar permissão de notificação.', 'error');
        return;
      }
    }
    
    const newEnabled = !settings.enabled;
    const newSettings = { ...settings, enabled: newEnabled };
    setSettings(newSettings);
    notificationService.updateSettings({ enabled: newEnabled });
    
    if (newEnabled) {
      showToast('Lembretes ativados!', 'success');
    } else {
      showToast('Lembretes desativados.', 'info');
    }
  };

  const handleTimeChange = (key: keyof NotificationSettings, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings({ [key]: value });
  };

  const handleSave = () => {
    showToast('Configurações de notificações salvas!', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E2725B]/10 flex items-center justify-center">
                  <Bell className="text-[#E2725B]" size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-stone-800 dark:text-white">Notificações</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X size={20} className="text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-zinc-800/50 rounded-2xl border border-stone-100 dark:border-zinc-800">
                <div>
                  <p className="font-bold text-stone-800 dark:text-white">Ativar Notificações</p>
                  <p className="text-xs text-stone-500">Receba lembretes e o versículo do dia</p>
                </div>
                <button
                  onClick={handleToggleEnabled}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-[#E2725B]' : 'bg-stone-300 dark:bg-zinc-700'}`}
                >
                  <motion.div
                    animate={{ x: settings.enabled ? 24 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className={`space-y-4 transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <TimeSetting
                  label="Versículo do Dia"
                  value={settings.dailyVerseTime}
                  onChange={(val) => handleTimeChange('dailyVerseTime', val)}
                />
                <TimeSetting
                  label="Lembrete de Leitura"
                  value={settings.readingReminderTime}
                  onChange={(val) => handleTimeChange('readingReminderTime', val)}
                />
                <TimeSetting
                  label="Lembrete de Oração"
                  value={settings.prayerReminderTime}
                  onChange={(val) => handleTimeChange('prayerReminderTime', val)}
                />
                <TimeSetting
                  label="Estudos Bíblicos"
                  value={settings.studyReminderTime}
                  onChange={(val) => handleTimeChange('studyReminderTime', val)}
                />

                <button
                  onClick={() => {
                    notificationService.sendNotification('Teste de Notificação', 'As notificações estão funcionando corretamente! 🙌');
                    showToast('Notificação de teste enviada!', 'info');
                  }}
                  className="w-full py-2 bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Enviar Notificação de Teste
                </button>
              </div>

              {!permissionGranted && (
                <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                  <AlertTriangle className="text-amber-600 shrink-0" size={16} />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
                    Atenção: A permissão do navegador é necessária. Se você estiver usando o App dentro de outro site (iframe), as notificações podem ser bloqueadas pelo navegador por segurança.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-stone-50 dark:bg-zinc-900/50 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-[#E2725B] text-white rounded-2xl font-bold hover:bg-[#D2624B] transition-colors shadow-lg shadow-[#E2725B]/20"
              >
                Salvar Configurações
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface TimeSettingProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeSetting: React.FC<TimeSettingProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-stone-400" />
      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
    </div>
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-stone-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-sm font-bold text-[#E2725B] focus:ring-2 focus:ring-[#E2725B]/20 transition-all"
    />
  </div>
);

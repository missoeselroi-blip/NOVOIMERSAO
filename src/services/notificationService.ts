import { NotificationSettings } from '../types';

class NotificationService {
  private settings: NotificationSettings = {
    enabled: false,
    dailyVerseTime: '08:00',
    readingReminderTime: '09:00',
    prayerReminderTime: '20:00',
    studyReminderTime: '15:00',
  };

  constructor() {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações desktop');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.settings.enabled = permission === 'granted';
    this.saveSettings();
    return this.settings.enabled;
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  sendNotification(title: string, body: string) {
    if (this.settings.enabled && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png',
        });
      } catch (e) {
        console.warn('Erro ao disparar notificação nativa:', e);
        this.fallbackNotify(title, body);
      }
    } else {
      console.log('Notificação (Simulada/Inativa):', title, body);
      if (this.settings.enabled) {
        this.fallbackNotify(title, body);
      }
    }
  }

  private fallbackNotify(title: string, body: string) {
    // Internal event or simple console log for now
    // We can dispatch a custom event that UI can listen to show Toast
    window.dispatchEvent(new CustomEvent('app_notification', { detail: { title, body } }));
  }

  // This would normally be handled by a service worker for real push
  // Here we simulate a check that could run while the app is open
  checkAndNotify(dailyVerse: { text: string; reference: string }) {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const lastNotified = localStorage.getItem('last_notified_date');
    const today = now.toDateString();

    // Daily Verse
    if (currentTime === this.settings.dailyVerseTime && lastNotified !== today) {
      this.sendNotification('Versículo do Dia', `"${dailyVerse.text}" — ${dailyVerse.reference}`);
      localStorage.setItem('last_notified_date', today);
    }

    // Reminders (simplified check to avoid multiple notifications in the same minute)
    const lastReminderMinute = localStorage.getItem('last_reminder_minute');
    const currentMinute = `${today}_${currentTime}`;

    if (lastReminderMinute !== currentMinute) {
      if (currentTime === this.settings.readingReminderTime) {
        this.sendNotification('Lembrete de Leitura', 'É hora da sua leitura bíblica diária!');
        localStorage.setItem('last_reminder_minute', currentMinute);
      } else if (currentTime === this.settings.prayerReminderTime) {
        this.sendNotification('Lembrete de Oração', 'Separe um momento para falar com Deus agora.');
        localStorage.setItem('last_reminder_minute', currentMinute);
      } else if (currentTime === this.settings.studyReminderTime) {
        this.sendNotification('Lembrete de Estudo', 'Que tal mergulhar em um estudo bíblico agora?');
        localStorage.setItem('last_reminder_minute', currentMinute);
      }
    }
  }
}

export const notificationService = new NotificationService();

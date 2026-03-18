export const playBeep = (frequency: number = 440, duration: number = 0.1, type: OscillatorType = 'sine') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.error('Error playing beep:', error);
  }
};

export const playAcceptedBeep = () => {
  playBeep(880, 0.1, 'sine');
};

export const playCompletedBeep = () => {
  playBeep(1320, 0.1, 'sine');
  setTimeout(() => playBeep(1760, 0.1, 'sine'), 150);
};

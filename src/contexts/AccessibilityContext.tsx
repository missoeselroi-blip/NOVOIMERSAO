import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontFamily = 'sans' | 'serif' | 'mono' | 'dyslexic';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

interface AccessibilityContextType {
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem('acc-font-family') as FontFamily) || 'sans';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('acc-font-size') as FontSize) || 'base';
  });
  const [lineHeight, setLineHeight] = useState<number>(() => {
    return Number(localStorage.getItem('acc-line-height')) || 1.6;
  });

  useEffect(() => {
    localStorage.setItem('acc-font-family', fontFamily);
    localStorage.setItem('acc-font-size', fontSize);
    localStorage.setItem('acc-line-height', lineHeight.toString());
  }, [fontFamily, fontSize, lineHeight]);

  return (
    <AccessibilityContext.Provider value={{ 
      fontFamily, setFontFamily, 
      fontSize, setFontSize,
      lineHeight, setLineHeight
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

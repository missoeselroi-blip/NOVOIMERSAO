import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SectionTimer: React.FC = () => {
  const { user, updateSectionTime } = useAuth();
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    if (!user) return;

    const handleSectionChange = async () => {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);
      
      if (durationSeconds > 0) {
        const sectionId = getSectionId(currentPathRef.current);
        await updateSectionTime(sectionId, durationSeconds);
      }

      startTimeRef.current = Date.now();
      currentPathRef.current = location.pathname;
    };

    // When location changes, update time for the previous section
    handleSectionChange();

    // Also handle page hide/unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSectionChange();
      } else {
        startTimeRef.current = Date.now();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleSectionChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleSectionChange);
    };
  }, [location.pathname, user]);

  const getSectionId = (path: string): string => {
    if (path === '/') return 'Home';
    if (path.startsWith('/estudo')) return 'Estudo Bíblico';
    if (path.startsWith('/imersao')) return 'Imersão';
    if (path.startsWith('/teologia')) return 'Teologia';
    if (path.startsWith('/carreira')) return 'Carreira';
    if (path.startsWith('/comunidade')) return 'Comunidade';
    if (path.startsWith('/perfil')) return 'Perfil';
    if (path.startsWith('/configuracoes')) return 'Configurações';
    return 'Outros';
  };

  return null;
};

export default SectionTimer;

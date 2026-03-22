import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Image as ImageIcon, 
  Mail, 
  Moon, 
  Sun, 
  Menu, 
  X,
  ExternalLink,
  Share2,
  Heart,
  HeartHandshake,
  Library,
  Gift,
  MessageSquare,
  Trophy,
  DollarSign,
  Newspaper,
  Brain,
  Zap,
  StickyNote,
  HelpCircle,
  Loader2,
  Search,
  User,
  Globe,
  Calendar,
  Pencil,
  LogIn,
  Volume2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './types';
import { NavigationMenu } from './components/NavigationMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { useAccessibility } from './contexts/AccessibilityContext';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BibleStudyPage = lazy(() => import('./pages/BibleStudyPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const CreditPage = lazy(() => import('./pages/CreditPage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ForumPage = lazy(() => import('./pages/ForumPage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const DonatePage = lazy(() => import('./pages/DonatePage'));
const NotebookPage = lazy(() => import('./pages/NotebookPage'));
const DevotionalPage = lazy(() => import('./pages/DevotionalPage'));
const RedacaoPage = lazy(() => import('./pages/RedacaoPage'));
const StudentPage = lazy(() => import('./pages/StudentPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TheologySearchPage = lazy(() => import('./pages/TheologySearchPage'));
import TheologyPage from './pages/TheologyPage';
const MissionaryPage = lazy(() => import('./pages/MissionaryPage'));

const MissionaryBulkResults = lazy(() => import('./pages/MissionaryBulkResults'));
const AudioBoxPage = lazy(() => import('./pages/AudioBoxPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

import { ToastProvider, useToast } from './components/Toast';
import { CreditProvider, useCredits } from './contexts/CreditContext';
import { OfflineProvider, useOffline } from './contexts/OfflineContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AudioBoxProvider } from './contexts/AudioBoxContext';
import { AccessibilityControls } from './components/AccessibilityControls';
import { VoiceCommandCenter } from './components/VoiceCommandCenter';
import AuthModal from './components/AuthModal';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { Coins, WifiOff, Coffee, LogOut } from 'lucide-react';

function AppContent() {
  const { user, logout, isInitialLoading } = useAuth();
  const { showToast } = useToast();
  const { isOffline } = useOffline();
  const { theme, setTheme } = useTheme();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.substring(1) || 'home';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    if (user && pendingTab) {
      navigate(pendingTab);
      setPendingTab(null);
    }
  }, [user, pendingTab, navigate]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="text-center space-y-6">
          <img 
            src="https://i.postimg.cc/qq3vPB49/1000105226-removebg-preview.png" 
            alt="Logo" 
            className="w-20 h-20 object-contain mx-auto animate-pulse"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-2">
            <Loader2 className="animate-spin text-emerald-600 mx-auto" size={32} />
            <p className="text-stone-500 font-medium uppercase tracking-[0.3em] text-[10px]">
              Carregando Imersão Bíblica IA...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNavigate = (tabId: string) => {
    const protectedTabs = ['theology', 'career', 'notebook'];
    if (protectedTabs.includes(tabId) && !user) {
      setPendingTab(tabId);
      setIsAuthModalOpen(true);
      showToast("Faça login para acessar este recurso.", "info");
      return;
    }
    setPendingTab(null);
    navigate(tabId === 'home' ? '/' : `/${tabId}`);
    setIsMenuOpen(false);
  };

  const isDarkMode = theme === 'dark';
  const isDevotionalMode = theme === 'devotional';

  const mainNavItems = [
    { id: 'home', label: 'Início', icon: <Home size={22} /> },
    { id: 'devotional', label: 'Devocional', icon: <Heart size={22} /> },
    { id: 'audio-box', label: 'Áudios', icon: <Volume2 size={22} /> },
    { id: 'study', label: 'Imersão', icon: <BookOpen size={22} /> },
    { id: 'notebook', label: 'Caderno', icon: <StickyNote size={22} /> },
  ];  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={20} />, component: <HomePage onNavigate={handleNavigate} deepThinking={deepThinking} setDeepThinking={setDeepThinking} /> },
    { id: 'devotional', label: 'Devocional', subtitle: 'Alimento para a sua alma', icon: <Heart size={20} />, component: <DevotionalPage onNavigate={handleNavigate} /> },
    { id: 'audio-box', label: 'Áudios', subtitle: 'Sua biblioteca de áudios', icon: <Volume2 size={20} />, component: <AudioBoxPage /> },
    { id: 'study', label: 'Imersão', subtitle: 'Mergulhando na Palavra Viva', icon: <BookOpen size={20} />, component: <BibleStudyPage deepThinking={deepThinking} setDeepThinking={setDeepThinking} onNavigate={handleNavigate} /> },
    { id: 'theology', label: 'Teologia', subtitle: 'Conhecimento Profundo', icon: <GraduationCap size={20} />, component: <TheologyPage onNavigate={handleNavigate} /> },
    { id: 'notebook', label: 'Caderno', subtitle: 'Suas anotações e estudos', icon: <StickyNote size={20} />, component: <NotebookPage onSearchWiki={(query) => { handleNavigate('study'); }} /> },
    { id: 'store', label: 'Livros', subtitle: 'Livros e recursos', icon: <Library size={20} />, component: <StorePage /> },
    { id: 'credits', label: 'Créditos', subtitle: 'Gerencie seus créditos', icon: <Coins size={20} />, component: <CreditPage /> },
    { id: 'donate', label: 'Doe', subtitle: 'Apoie este ministério', icon: <HeartHandshake size={20} />, component: <DonatePage /> },
    { id: 'forum', label: 'Fórum', subtitle: 'Comunhão e Debate', icon: <MessageSquare size={20} />, component: <ForumPage /> },
    { id: 'career', label: 'Carreira', subtitle: 'Sua jornada ministerial', icon: <Trophy size={20} />, component: <CareerPage /> },
    { id: 'contact', label: 'Contato', subtitle: 'Fale conosco', icon: <Mail size={20} />, component: <ContactPage /> },
    { id: 'login-nav', label: 'Entrar', icon: <LogIn size={20} />, component: <div />, hidden: true },
    { id: 'student-profile', label: 'Página do Aluno', subtitle: 'Seu progresso', icon: <User size={20} />, component: <StudentPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'theology-search', label: 'Busca de Teologia', subtitle: 'Pesquisa avançada', icon: <Search size={20} />, component: <TheologySearchPage />, hidden: true },
    { id: 'missionary', label: 'Missões', subtitle: 'Impacto Global', icon: <Globe size={20} />, component: <MissionaryPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'missionary-results', label: 'Resultados Missões', subtitle: 'Relatórios de campo', icon: <Calendar size={20} />, component: <MissionaryBulkResults onBack={() => handleNavigate('missionary')} />, hidden: true },
    { id: 'redacao', label: 'Redação', subtitle: 'Escrita inspirada', icon: <Pencil size={20} />, component: <RedacaoPage />, hidden: true },
    { id: 'profile', label: 'Perfil', subtitle: 'Sua conta e preferências', icon: <User size={20} />, component: <ProfilePage />, hidden: true },
    { id: 'admin', label: 'Painel ADM', subtitle: 'Administração do Sistema', icon: <ShieldCheck size={20} />, component: <AdminPage />, hidden: true },
  ];

  const activeItem = navItems.find(item => item.id === activeTab);
  const activeComponent = activeItem?.component || <HomePage onNavigate={handleNavigate} deepThinking={deepThinking} setDeepThinking={setDeepThinking} />;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 relative overflow-hidden",
      isDarkMode ? "bg-app-bg text-app-text" : "bg-app-bg text-app-text",
      fontFamily === 'dyslexic' ? 'font-dyslexic' : 
      fontFamily === 'serif' ? 'font-serif' : 
      fontFamily === 'mono' ? 'font-mono' : 'font-sans',
      fontSize === 'xs' ? 'text-xs' :
      fontSize === 'sm' ? 'text-sm' :
      fontSize === 'base' ? 'text-base' :
      fontSize === 'lg' ? 'text-lg' :
      fontSize === 'xl' ? 'text-xl' :
      fontSize === '2xl' ? 'text-2xl' : 'text-3xl'
    )} style={{ lineHeight: lineHeight }}>
      {/* Background Image for non-home pages */}
      {activeTab !== 'home' && (
        <div 
          className="fixed inset-0 pointer-events-none z-[-1] opacity-20"
          style={{ 
            backgroundImage: 'url("https://i.postimg.cc/Jzf9BJfF/1773015053108.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
      )}

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-20 transition-all duration-1000",
          isDarkMode ? "bg-emerald-900/40" : "bg-emerald-100"
        )} />
        <div className={cn(
          "absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[160px] opacity-10 transition-all duration-1000",
          isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
        )} />
        <div className={cn(
          "absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[160px] opacity-15 transition-all duration-1000",
          isDarkMode ? "bg-purple-900/20" : "bg-purple-50"
        )} />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 border-b backdrop-blur-md",
        isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white/80 border-stone-200"
      )}>
        {isOffline && (
          <div className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <WifiOff size={12} />
              Modo Offline Ativo • Apenas conteúdos baixados disponíveis
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.postimg.cc/qq3vPB49/1000105226-removebg-preview.png" 
              alt="App Icon" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400">Imersão Bíblica IA</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.filter(item => !item.hidden || item.id === 'login-nav').map((item) => {
              if (item.id === 'login-nav') {
                if (user) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-600 text-zinc-500 py-2"
                  >
                    <LogIn size={18} />
                    <span>Entrar</span>
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-600 relative py-2 group",
                    activeTab === item.id ? "text-emerald-600" : "text-zinc-500"
                  )}
                >
                  <div className="relative">
                    {item.icon}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-xl border border-white/10 translate-y-2 group-hover:translate-y-0 uppercase tracking-widest">
                      {item.label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
                    </div>
                  </div>
                  <span className="hidden lg:block">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="activeTabDesktop"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
            
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-zinc-800 p-1 rounded-full">
              <button
                onClick={() => setTheme('light')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'light' ? "bg-white shadow-sm text-amber-500" : "text-stone-400 hover:text-stone-600")}
                title="Modo Claro"
              >
                <Sun size={18} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'dark' ? "bg-zinc-700 shadow-sm text-blue-400" : "text-stone-400 hover:text-stone-600")}
                title="Modo Escuro"
              >
                <Moon size={18} />
              </button>
              <button
                onClick={() => setTheme('devotional')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'devotional' ? "bg-amber-100 shadow-sm text-amber-700" : "text-stone-400 hover:text-stone-600")}
                title="Momento Devocional"
              >
                <Coffee size={18} />
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-stone-200 dark:border-zinc-800">
                <button
                  onClick={() => handleNavigate('profile')}
                  className="flex items-center gap-2 group"
                >
                  <img 
                    src={user.photoURL} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border-2 border-emerald-500 group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold leading-none">{user.name}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Membro</p>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('student-profile')}
                  className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
                  title="Página do Aluno"
                >
                  <GraduationCap size={18} />
                </button>
                <button
                  onClick={() => {
                    logout();
                    showToast("Sessão encerrada. Até logo! 👋");
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="ml-4 px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <LogIn size={18} />
                Entrar
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle - Simplified */}
          <div className="md:hidden flex items-center">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Menu size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className={cn(
          "flex items-center justify-around h-16 border-t backdrop-blur-lg px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]",
          isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white/90 border-stone-200"
        )}>
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative",
                activeTab === item.id 
                  ? "text-emerald-600" 
                  : isDarkMode ? "text-zinc-500" : "text-stone-400"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute top-0 w-12 h-1 bg-emerald-600 rounded-b-full"
                />
              )}
              <div className={cn(
                "transition-transform duration-200",
                activeTab === item.id ? "scale-110" : "scale-100"
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all",
              isMenuOpen 
                ? "text-emerald-600" 
                : isDarkMode ? "text-zinc-500" : "text-stone-400"
            )}
          >
            <div className={cn(
              "transition-transform duration-200",
              isMenuOpen ? "scale-110 rotate-90" : "scale-100"
            )}>
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-[60] md:hidden shadow-2xl flex flex-col",
                isDarkMode ? "bg-zinc-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <img 
                      src="https://i.postimg.cc/fy0xzPn4/android-chrome-512x512.png" 
                      alt="App Icon" 
                      className="w-6 h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Navegação
                </div>
                {navItems.filter(item => !item.hidden).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all",
                      activeTab === item.id 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                        : isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-stone-50 text-stone-600"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      activeTab === item.id ? "bg-white/20" : isDarkMode ? "bg-zinc-800" : "bg-stone-100"
                    )}>
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-6 px-3 py-2 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Temas
                </div>
                <div className="grid grid-cols-3 gap-2 p-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                      theme === 'light' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Sun size={20} />
                    <span className="text-[10px] font-bold">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                      theme === 'dark' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Moon size={20} />
                    <span className="text-[10px] font-bold">Escuro</span>
                  </button>
                  <button
                    onClick={() => setTheme('devotional')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                      theme === 'devotional' ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Coffee size={20} />
                    <span className="text-[10px] font-bold">Devocional</span>
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.photoURL} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full border-2 border-emerald-500"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Membro da Marinha</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        showToast("Sessão encerrada. 👋");
                      }}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    Entrar na Conta
                  </button>
                )}
                <p className="text-[10px] text-stone-400 dark:text-zinc-500 text-center uppercase tracking-widest mt-6">
                  Imersão Bíblica IA v2.5
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-24 md:pb-12 px-4 max-w-7xl mx-auto">
        {activeTab !== 'home' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 relative flex justify-center overflow-hidden rounded-[2.5rem] group shadow-2xl"
          >
            <img 
              src="https://i.postimg.cc/1Rqjh4bB/Screenshot-2026-03-09-12-08-27-022-com-google-android-googlequicksearchbox-edit.jpg" 
              alt="Banner" 
              className="w-full h-auto max-h-[350px] object-cover rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter drop-shadow-2xl uppercase">
                  {activeItem?.label || 'Página'}
                </h2>
                <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full shadow-lg shadow-emerald-500/50" />
                <p className="text-white/90 text-xs md:text-base font-black tracking-[0.4em] uppercase drop-shadow-lg">
                  {activeItem?.subtitle || 'Imersão Bíblica IA'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        }>
          <ErrorBoundary>
            <Routes>
              {navItems.map((item) => (
                <Route 
                  key={item.id} 
                  path={item.id === 'home' ? '/' : `/${item.id}`} 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.component}
                    </motion.div>
                  } 
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <AccessibilityControls />
      <VoiceCommandCenter />
      <MicrophonePermissionModal />

      <footer className={cn(
        "py-8 border-t text-center text-sm",
        isDarkMode ? "border-zinc-800 text-zinc-500" : "border-stone-200 text-stone-500"
      )}>
        <div className="flex items-center justify-center gap-3">
          <img 
            src="https://i.postimg.cc/qq3vPB49/1000105226-removebg-preview.png" 
            alt="Logo" 
            className="w-5 h-5 object-contain"
            referrerPolicy="no-referrer"
          />
          <p>© {new Date().getFullYear()} Imersão Bíblica IA • Mergulhando na Palavra</p>
          <img 
            src="https://i.postimg.cc/qq3vPB49/1000105226-removebg-preview.png" 
            alt="Logo" 
            className="w-5 h-5 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <OfflineProvider>
              <ToastProvider>
                <CreditProvider>
                  <AudioBoxProvider>
                    <AppContent />
                  </AudioBoxProvider>
                </CreditProvider>
              </ToastProvider>
            </OfflineProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

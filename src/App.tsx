import React, { useState, useEffect, Suspense } from 'react';
import { lazyWithRetry } from './utils/lazyWithRetry';
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
  Book,
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
  ShieldCheck,
  RefreshCw,
  Medal,
  Flame,
  PlayCircle,
  Glasses,
  Sparkles,
  Headphones,
  Anchor,
  Layout,
  ChevronDown
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
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const BibleStudyPage = lazyWithRetry(() => import('./pages/BibleStudyPage'));
const StorePage = lazyWithRetry(() => import('./pages/StorePage'));
const PostsPage = lazyWithRetry(() => import('./pages/PostsPage'));
const ForumPage = lazyWithRetry(() => import('./pages/ForumPage'));
const CareerPage = lazyWithRetry(() => import('./pages/CareerPage'));
const WhoAmIPage = lazyWithRetry(() => import('./pages/WhoAmIPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const NotebookPage = lazyWithRetry(() => import('./pages/NotebookPage'));
const JournalPage = lazyWithRetry(() => import('./pages/JournalPage'));
const DevotionalPage = lazyWithRetry(() => import('./pages/DevotionalPage'));
const RedacaoPage = lazyWithRetry(() => import('./pages/RedacaoPage'));
const StudentPage = lazyWithRetry(() => import('./pages/StudentPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const TheologySearchPage = lazyWithRetry(() => import('./pages/TheologySearchPage'));
const EvangelismSearchPage = lazyWithRetry(() => import('./pages/EvangelismSearchPage'));
const CoursesPage = lazyWithRetry(() => import('./pages/CoursesPage'));
import TheologyPage from './pages/TheologyPage';
import EvangelismPage from './pages/EvangelismPage';
import StorytellingPage from './pages/StorytellingPage';
import CreditPage from './pages/CreditPage';
import MissionaryPage from './pages/MissionaryPage';
import DonatePage from './pages/DonatePage';

const MissionaryBulkResults = lazyWithRetry(() => import('./pages/MissionaryBulkResults'));
const AudioBoxPage = lazyWithRetry(() => import('./pages/AudioBoxPage'));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'));
const BibleRacePage = lazyWithRetry(() => import('./pages/BibleRacePage'));
const GamesPage = lazyWithRetry(() => import('./pages/GamesPage'));
const BiblePage = lazyWithRetry(() => import('./pages/BiblePage'));
const SermonsPage = lazyWithRetry(() => import('./pages/SermonsPage'));
const LessonPage = lazyWithRetry(() => import('./pages/LessonPage'));
const OfflinePage = lazyWithRetry(() => import('./pages/OfflinePage'));
const StoryGame = lazyWithRetry(() => import('./pages/StoryGame'));
const NewsPage = lazyWithRetry(() => import('./pages/NewsPage'));
const TruthDetectorPage = lazyWithRetry(() => import('./pages/TruthDetectorPage'));
const SpokenBiblePage = lazyWithRetry(() => import('./pages/SpokenBiblePage'));

import { ToastProvider, useToast } from './components/Toast';
import { CreditProvider, useCredits } from './contexts/CreditContext';
import { OfflineProvider, useOffline } from './contexts/OfflineContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AudioBoxProvider } from './contexts/AudioBoxContext';
import { BibleProvider } from './contexts/BibleContext';
import { NotebookProvider } from './contexts/NotebookContext';
import { AudioBibleProvider } from './contexts/AudioBibleContext';
import { DraggableAudioPlayer } from './components/DraggableAudioPlayer';
import { AccessibilityControls } from './components/AccessibilityControls';
import { VoiceCommandCenter } from './components/VoiceCommandCenter';
import { SpiritualTutor } from './components/SpiritualTutor';
import { VoiceChat } from './components/VoiceChat';
import { FloatingBible } from './components/FloatingBible';
import AuthModal from './components/AuthModal';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import SectionTimer from './components/SectionTimer';
import { Coins, WifiOff, Coffee, LogOut } from 'lucide-react';
import { LoginPage } from './pages/LoginPage';

import { notificationService } from './services/notificationService';
import { verses } from './constants/verses';
import { isProjectSuspended } from './lib/firebase';

function AppContent() {
  const { user, logout, isInitialLoading } = useAuth();
  const { showToast } = useToast();
  const { isOffline } = useOffline();
  const { theme, setTheme } = useTheme();
  const { fontFamily, fontSize, lineHeight } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.substring(1) || 'home';
  const effectiveActiveTab = (activeTab === 'study' && location.state?.tab === 'significado') ? 'significado' : activeTab;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const [isFirebaseUnavailable, setIsFirebaseUnavailable] = useState(isProjectSuspended.value);

  useEffect(() => {
    // Inscreve-se para mudanças no status do Firebase
    const unsubscribe = isProjectSuspended.subscribe((isSuspended) => {
      setIsFirebaseUnavailable(isSuspended);
      if (isSuspended) {
        showToast("O servidor do Banco de Dados está indisponível no momento. O App funcionará em modo limitado.", "error");
      } else {
        showToast("Conexão com o servidor restabelecida!", "success");
      }
    });

    return unsubscribe;
  }, [showToast]);

  useEffect(() => {
    if (user && pendingTab) {
      navigate(pendingTab);
      setPendingTab(null);
    }
  }, [user, pendingTab, navigate]);

  useEffect(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY não detectada no frontend. Verifique 'Settings > Secrets'.");
    }
  }, []);

  useEffect(() => {
    const handleAppNotification = (e: any) => {
      const { title, body } = e.detail;
      showToast(`${title}: ${body}`, 'info');
    };
    window.addEventListener('app_notification', handleAppNotification);
    return () => window.removeEventListener('app_notification', handleAppNotification);
  }, [showToast]);

  useEffect(() => {
    // Shared notification check that runs on any page while app is open
    const interval = setInterval(() => {
      // Use a random verse for the daily verse notification
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      notificationService.checkAndNotify(randomVerse);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="text-center space-y-6">
          <img 
            src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
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

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (tabId: string, state?: any) => {
    const protectedTabs = ['theology', 'career', 'notebook', 'journal'];
    if (protectedTabs.includes(tabId) && !user) {
      setPendingTab(tabId);
      setIsAuthModalOpen(true);
      showToast("Faça login para acessar este recurso.", "info");
      return;
    }
    setPendingTab(null);
    
    if (tabId === 'significado') {
      navigate('/study', { state: { tab: 'significado', ...state } });
    } else {
      navigate(tabId === 'home' ? '/' : `/${tabId}`, { state });
    }
    
    setIsMenuOpen(false);
  };

  const isDarkMode = theme === 'dark';
  const isDevotionalMode = theme === 'devotional';
  const isDark = isDarkMode; // Devotional is now light (cream)

  const mainNavItems = [
    { id: 'home', label: 'Início', icon: <Home size={22} /> },
    { id: 'audio-bible', label: 'Bíblia Áudio', icon: <Headphones size={22} /> },
    { id: 'lesson', label: 'Lições', icon: <BookOpen size={22} /> },
    { id: 'devotional', label: 'Devocional', icon: <Heart size={22} /> },
    { id: 'audio-box', label: 'Áudios', icon: <Volume2 size={22} /> },
    { id: 'courses', label: 'Cursos', icon: <GraduationCap size={22} /> },
    { id: 'bible', label: 'Bíblia', icon: <Book size={22} /> },
    { id: 'news', label: 'Sinais', icon: <Newspaper size={22} /> },
    { id: 'truth-detector', label: 'Fato ou Fake', icon: <ShieldCheck size={22} /> },
    { id: 'study', label: 'Imersão', icon: <Anchor size={22} /> },
    { id: 'notebook', label: 'Caderno', icon: <StickyNote size={22} /> },
  ];
  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={20} />, component: <HomePage onNavigate={handleNavigate} deepThinking={deepThinking} setDeepThinking={setDeepThinking} /> },
    { id: 'bible', label: 'Bíblia', subtitle: 'A Palavra de Deus', icon: <Book size={20} />, component: <BiblePage /> },
    { id: 'audio-bible', label: 'Bíblia Áudio', subtitle: 'Ouça a Palavra', icon: <Headphones size={20} />, component: <SpokenBiblePage /> },
    { id: 'lesson', label: 'Lições', subtitle: '50 Lições Bíblicas', icon: <Glasses size={20} />, component: <LessonPage /> },
    { id: 'devotional', label: 'Devocional', subtitle: 'Alimento para a sua alma', icon: <Heart size={20} />, component: <DevotionalPage onNavigate={handleNavigate} /> },
    { id: 'significado', label: 'Compare significados e religiões', subtitle: 'Léxico e Comparativo', icon: <Search size={20} />, component: <Navigate to="/study" state={{ tab: 'significado' }} replace />, hidden: true },
    { id: 'study', label: 'Imersão', subtitle: 'Mergulhando na Palavra Viva', icon: <Anchor size={20} />, component: <BibleStudyPage deepThinking={deepThinking} setDeepThinking={setDeepThinking} onNavigate={handleNavigate} /> },
    { id: 'courses', label: 'Cursos', subtitle: 'Jornada de aprendizado', icon: <GraduationCap size={20} />, component: <CoursesPage onNavigate={handleNavigate} /> },
    { id: 'notebook', label: 'Caderno', subtitle: 'Suas anotações e estudos', icon: <StickyNote size={20} />, component: <NotebookPage onSearchWiki={(query) => { handleNavigate('study'); }} /> },
    { id: 'sermons', label: 'Sermões', subtitle: 'Sermões em áudio e vídeo', icon: <PlayCircle size={20} />, component: <SermonsPage /> },
    { id: 'audio-box', label: 'Áudios', subtitle: 'Sua biblioteca de áudios', icon: <Volume2 size={20} />, component: <AudioBoxPage /> },
    { id: 'forum', label: 'Fórum', subtitle: 'Comunhão e Debate', icon: <MessageSquare size={20} />, component: <ForumPage /> },
    { id: 'credits', label: 'Créditos', subtitle: 'Gerencie seus créditos', icon: <Coins size={20} />, component: <CreditPage /> },
    { id: 'news', label: 'Sinais', subtitle: 'Sinais da Vinda de Cristo', icon: <Newspaper size={20} />, component: <NewsPage /> },
    { id: 'truth-detector', label: 'Fato ou Fake', subtitle: 'Detector de Verdade', icon: <ShieldCheck size={20} />, component: <TruthDetectorPage /> },
    { id: 'quiz', label: 'JOGOS', subtitle: 'Desafios Bíblicos', icon: <Zap size={20} />, component: <GamesPage /> },
    { id: 'bible-race', label: 'Corrida Bíblica', subtitle: 'A Jornada da Palavra', icon: <Trophy size={20} />, component: <BibleRacePage /> },
    { id: 'career', label: 'Carreira', subtitle: 'Sua jornada ministerial', icon: <Medal size={20} />, component: <CareerPage /> },
    { id: 'store', label: 'Livros', subtitle: 'Livros e recursos', icon: <Library size={20} />, component: <StorePage /> },
    { id: 'who-am-i', label: 'Quem Somos?', subtitle: 'Nossa história', icon: <User size={20} />, component: <WhoAmIPage onNavigate={handleNavigate} /> },
    { id: 'donate', label: 'Doe', subtitle: 'Apoie a obra', icon: <Heart size={20} />, component: <DonatePage /> },
    { id: 'offline', label: 'Downloads', subtitle: 'Conteúdo Offline', icon: <WifiOff size={20} />, component: <OfflinePage onNavigate={handleNavigate} /> },
    { id: 'theology', label: 'Teologia', subtitle: 'Conhecimento Profundo', icon: <GraduationCap size={20} />, component: <TheologyPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'evangelism', label: 'Evangelismo', subtitle: 'Ide por todo o mundo', icon: <Flame size={20} />, component: <EvangelismPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'storytelling', label: 'Contação de Estórias', subtitle: 'A arte de narrar', icon: <BookOpen size={20} />, component: <StorytellingPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'contact', label: 'Contato', subtitle: 'Fale conosco', icon: <Mail size={20} />, component: <ContactPage />, hidden: true },
    { id: 'student-profile', label: 'Página do Aluno', subtitle: 'Seu progresso', icon: <User size={20} />, component: <StudentPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'theology-search', label: 'Busca de Teologia', subtitle: 'Pesquisa avançada', icon: <Search size={20} />, component: <TheologySearchPage />, hidden: true },
    { id: 'evangelism-search', label: 'Busca de Evangelismo', subtitle: 'Pesquisa missionária', icon: <Search size={20} />, component: <EvangelismSearchPage />, hidden: true },
    { id: 'missionary', label: 'Missões', subtitle: 'Impacto Global', icon: <Globe size={20} />, component: <MissionaryPage onNavigate={handleNavigate} />, hidden: true },
    { id: 'missionary-results', label: 'Resultados Missões', subtitle: 'Relatórios de campo', icon: <Calendar size={20} />, component: <MissionaryBulkResults onBack={() => handleNavigate('missionary')} />, hidden: true },
    { id: 'redacao', label: 'Redação', subtitle: 'Escrita inspirada', icon: <Pencil size={20} />, component: <RedacaoPage />, hidden: true },
    { id: 'profile', label: 'Perfil', subtitle: 'Sua conta e preferências', icon: <User size={20} />, component: <ProfilePage /> },
    { id: 'admin', label: 'Painel ADM', subtitle: 'Administração do Sistema', icon: <ShieldCheck size={20} />, component: <AdminPage />, hidden: true },
    { id: 'greatest-story', label: 'Jogo das Histórias', subtitle: 'Uma Jornada Imersiva', icon: <Sparkles size={20} />, component: <StoryGame />, hidden: true },
  ];

  const activeItem = navItems.find(item => item.id === activeTab);
  const activeComponent = activeItem?.component || <HomePage onNavigate={handleNavigate} deepThinking={deepThinking} setDeepThinking={setDeepThinking} />;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 relative overflow-hidden bg-app-bg text-app-text",
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
      <SectionTimer />
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

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-20 transition-all duration-1000",
          isDarkMode ? "bg-emerald-900/40" : (isDevotionalMode ? "bg-amber-200/40" : "bg-emerald-100")
        )} />
        <div className={cn(
          "absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[160px] opacity-10 transition-all duration-1000",
          isDarkMode ? "bg-blue-900/30" : (isDevotionalMode ? "bg-orange-200/30" : "bg-blue-50")
        )} />
        <div className={cn(
          "absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[160px] opacity-15 transition-all duration-1000",
          isDarkMode ? "bg-purple-900/20" : (isDevotionalMode ? "bg-stone-200/20" : "bg-purple-50")
        )} />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 border-b backdrop-blur-md",
        isDark ? "bg-app-surface/80 border-app-border" : "bg-white/80 border-stone-200"
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
              src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
              alt="App Icon" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400">Início</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navItems.filter(item => !item.hidden).slice(0, 6).map((item) => {
              return (
                <button
                  key={`desktop-${item.id}`}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors hover:text-emerald-600 relative py-2 group whitespace-nowrap",
                    effectiveActiveTab === item.id ? "text-emerald-600" : "text-zinc-500"
                  )}
                >
                  <div className="relative">
                    {item.icon}
                  </div>
                  <span className="hidden xl:block">{item.label}</span>
                  {effectiveActiveTab === item.id && (
                    <motion.div 
                      layoutId="activeTabDesktop"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
            
            {/* More Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-600 py-2 transition-colors">
                <Layout size={18} />
                <span className="hidden xl:block">Explorar</span>
                <ChevronDown size={14} />
              </button>
              
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 p-2 min-w-[240px] grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[70vh] overflow-y-auto">
                  {navItems.filter(item => !item.hidden).slice(6).concat(navItems.filter(item => item.hidden && !['admin'].includes(item.id))).map((item) => (
                    <button
                      key={`dropdown-${item.id}`}
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all",
                        effectiveActiveTab === item.id 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" 
                          : "text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      {item.icon}
                      <div className="text-left">
                        <p className="leading-none mb-1">{item.label}</p>
                        {item.subtitle && <p className="text-[9px] opacity-60 font-normal">{item.subtitle}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-app-surface/50 border border-app-border p-1 rounded-full">
              <button
                onClick={() => setTheme('light')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'light' ? "bg-white shadow-sm text-amber-500" : "text-app-muted hover:text-app-text")}
                title="Modo Claro"
              >
                <Sun size={18} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'dark' ? "bg-zinc-700 shadow-sm text-blue-400" : "text-app-muted hover:text-app-text")}
                title="Modo Escuro"
              >
                <Moon size={18} />
              </button>
              <button
                onClick={() => setTheme('devotional')}
                className={cn("p-1.5 rounded-full transition-all", theme === 'devotional' ? "bg-amber-900/30 shadow-sm text-amber-400" : "text-app-muted hover:text-app-text")}
                title="Momento Devocional"
              >
                <Coffee size={18} />
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 md:gap-3 p-1 md:pr-4 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-stone-200 dark:hover:border-zinc-700"
                >
                  <div className="relative">
                    <img 
                      src={user.avatar || user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      alt="Profile" 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-emerald-500 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-sm" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold leading-none">{user.name}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Membro</p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileMenuOpen(false)} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden z-50"
                      >
                        <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 border-b border-stone-100 dark:border-zinc-800">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Sua Conta</p>
                          <p className="text-sm font-bold truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => {
                              handleNavigate('profile');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                          >
                            <User size={18} className="text-emerald-600" />
                            Abrir Perfil
                          </button>
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => {
                                handleNavigate('admin');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                            >
                              <ShieldCheck size={18} className="text-purple-600" />
                              Painel ADM
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              handleNavigate('offline');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                          >
                            <WifiOff size={18} className="text-amber-600" />
                            Downloads Offline
                          </button>
                          <button 
                            onClick={() => {
                              setIsAuthModalOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                          >
                            <RefreshCw size={18} className="text-blue-600" />
                            Trocar de Perfil
                          </button>
                          <div className="h-px bg-stone-100 dark:bg-zinc-800 my-2 mx-2" />
                          <button 
                            onClick={() => {
                              logout();
                              setIsProfileMenuOpen(false);
                              showToast("Sessão encerrada. Até logo! 👋");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                          >
                            <LogOut size={18} />
                            Sair
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
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
          isDark ? "bg-app-surface/90 border-app-border" : "bg-white/90 border-stone-200"
        )}>
          {mainNavItems.map((item) => (
            <button
              key={`mobile-${item.id}`}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative",
                effectiveActiveTab === item.id 
                  ? "text-emerald-600" 
                  : isDark ? "text-zinc-500" : "text-stone-400"
              )}
            >
              {effectiveActiveTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute top-0 w-12 h-1 bg-emerald-600 rounded-b-full"
                />
              )}
              <div className={cn(
                "transition-transform duration-200",
                effectiveActiveTab === item.id ? "scale-110" : "scale-100"
              )}>
                {item.icon}
              </div>
            </button>
          ))}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all",
              isMenuOpen 
                ? "text-[#8A9A5B]" 
                : isDarkMode ? "text-zinc-500" : "text-stone-400"
            )}
          >
            <div className={cn(
              "transition-transform duration-200",
              isMenuOpen ? "scale-110 rotate-90" : "scale-100"
            )}>
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </div>
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
                isDark ? "bg-app-surface" : "bg-white"
              )}
            >
              <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <img 
                      src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
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
                    key={`drawer-${item.id}`}
                    onClick={() => handleNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all",
                      effectiveActiveTab === item.id 
                        ? "bg-[#8A9A5B] text-white shadow-lg shadow-[#8A9A5B]/20" 
                        : isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-stone-50 text-stone-600"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      effectiveActiveTab === item.id ? "bg-white/20" : isDarkMode ? "bg-zinc-800" : "bg-stone-100"
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
                      theme === 'light' ? "bg-[#8A9A5B] text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Sun size={20} />
                    <span className="text-[10px] font-bold">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                      theme === 'dark' ? "bg-[#8A9A5B] text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Moon size={20} />
                    <span className="text-[10px] font-bold">Escuro</span>
                  </button>
                  <button
                    onClick={() => setTheme('devotional')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                      theme === 'devotional' ? "bg-[#8A9A5B] text-white" : "bg-stone-100 dark:bg-zinc-800 text-stone-500"
                    )}
                  >
                    <Coffee size={20} />
                    <span className="text-[10px] font-bold">Devocional</span>
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
                {user ? (
                  <div className="space-y-4">
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavigate('admin')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-2xl font-bold transition-colors"
                      >
                        <ShieldCheck size={20} />
                        Painel ADM
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || user.photoURL} 
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
            className="mb-8 md:mb-12 relative flex justify-center overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] group shadow-2xl"
          >
            <img 
              src="https://i.postimg.cc/1Rqjh4bB/Screenshot-2026-03-09-12-08-27-022-com-google-android-googlequicksearchbox-edit.jpg" 
              alt="Banner" 
              className="w-full h-auto max-h-[200px] md:max-h-[350px] object-cover rounded-[1.5rem] md:rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-center p-4 md:p-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2 md:space-y-3"
              >
                <h2 className="text-2xl sm:text-4xl md:text-7xl font-display font-black text-white tracking-tighter drop-shadow-2xl uppercase">
                  {activeItem?.label || 'Página'}
                </h2>
                <div className="h-1 w-16 md:h-1.5 md:w-24 bg-emerald-500 mx-auto rounded-full shadow-lg shadow-emerald-500/50" />
                <p className="text-white/90 text-[10px] md:text-base font-black tracking-[0.2em] md:tracking-[0.4em] uppercase drop-shadow-lg">
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
              {navItems.map((item, index) => (
                <Route 
                  key={`route-${item.id}-${index}`} 
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

      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTermsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-200 dark:border-zinc-800"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                      <FileText size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter uppercase">Termos de Uso</h2>
                  </div>
                  <button 
                    onClick={() => setIsTermsModalOpen(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-800">
                  <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                    1. Este é um Curso Livre de Teologia Básica gerada por IA e sem nenhum vínculo com escolas, faculdades, seminários ou igrejas.
                  </p>
                  <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                    2. As fontes, estruturas, atividades e avaliações são pré-estabelecidas por meio de prompts pelo desenvolvedor do App, mas que conferem certa liberdade de criação pela IA, o que pode gerar erros.
                  </p>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mt-6 mb-4">Observações Importantes:</h3>
                  <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                    3. Os cursos livres online no Brasil são amparados pela Lei nº 9.394/1996 (LDB - Diretrizes e Bases da Educação Nacional) e regulamentados pelo Decreto nº 5.154/2004.
                  </p>
                  <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                    4. Esta modalidade não exige autorização do MEC, por serem cursos de capacitação e atualização, e possuírem natureza de educação não-formal. Como não intitulam nível superior ou técnico, não precisam de reconhecimento ou autorização do MEC.
                  </p>
                  <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                    5. A Certificação: Os certificados têm valor meramente de comprovação de aprendizado, mas não conferem títulos acadêmicos ou eclesiásticos.
                  </p>
                </div>

                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="w-full mt-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AccessibilityControls />
      <VoiceCommandCenter />
      <SpiritualTutor />
      <DraggableAudioPlayer />
      <VoiceChat />
      <FloatingBible />
      <MicrophonePermissionModal />

      <footer className={cn(
        "py-12 border-t text-center",
        isDark ? "border-app-border text-app-muted" : "border-stone-200 text-stone-500"
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-3">
              <img 
                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain opacity-50"
                referrerPolicy="no-referrer"
              />
              <p className="font-bold tracking-tight">© {new Date().getFullYear()} Imersão Bíblica IA • Mergulhando na Palavra</p>
              <img 
                src="https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png" 
                alt="Logo" 
                className="w-6 h-6 object-contain opacity-50"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <AccessibilityProvider>
              <OfflineProvider>
                <ToastProvider>
                  <CreditProvider>
                    <AudioBoxProvider>
                      <BibleProvider>
                        <NotebookProvider>
                          <AudioBibleProvider>
                            <AppContent />
                          </AudioBibleProvider>
                        </NotebookProvider>
                      </BibleProvider>
                    </AudioBoxProvider>
                  </CreditProvider>
                </ToastProvider>
              </OfflineProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

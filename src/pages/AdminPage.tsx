import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trophy, 
  GraduationCap, 
  Mail, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { cn } from '../types';
import { useToast } from '../components/Toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  role: string;
  photoURL?: string;
  metrics?: any;
  career?: any;
  theology?: any;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { showToast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'ADM' && adminPassword === 'kerley77') {
      setIsAuthenticated(true);
      fetchAllData();
      showToast("Acesso administrativo concedido.", "success");
    } else {
      showToast("Credenciais administrativas incorretas.", "error");
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [usersSnap, careerSnap, theologySnap, metricsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'careerProgress')),
        getDocs(collection(db, 'theologyProgress')),
        getDocs(collection(db, 'metrics'))
      ]);

      const careerMap = new Map();
      careerSnap.forEach(doc => careerMap.set(doc.id, doc.data()));

      const theologyMap = new Map();
      theologySnap.forEach(doc => theologyMap.set(doc.id, doc.data()));

      const metricsMap = new Map();
      metricsSnap.forEach(doc => metricsMap.set(doc.id, doc.data()));

      const allUsers: UserData[] = [];
      usersSnap.forEach(doc => {
        const data = doc.data();
        allUsers.push({
          id: doc.id,
          name: data.name || 'Sem nome',
          email: data.email || 'Sem email',
          joinDate: data.joinDate || '',
          role: data.role || 'user',
          photoURL: data.photoURL,
          career: careerMap.get(doc.id),
          theology: theologyMap.get(doc.id),
          metrics: metricsMap.get(doc.id)
        });
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showToast("Erro ao carregar dados dos usuários.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-zinc-100">Área do Administrador</h1>
            <p className="text-stone-500 dark:text-zinc-400 text-sm mt-2">Insira suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-4">Chave ADM</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  placeholder="Digite a chave"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-4">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-stone-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  placeholder="Digite a senha"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4"
            >
              <Lock size={18} />
              Acessar Painel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900 dark:text-zinc-100">Painel de Controle</h1>
          <p className="text-stone-500 dark:text-zinc-400">Gerenciamento de usuários e performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAllData}
            className="p-3 bg-stone-100 dark:bg-zinc-800 rounded-xl hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
            title="Atualizar Dados"
          >
            <BarChart3 size={20} />
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Total de Usuários</p>
          <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <GraduationCap size={20} />
          </div>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Inscritos Teologia</p>
          <h3 className="text-2xl font-bold mt-1">{users.filter(u => u.theology?.enrolled).length}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Trophy size={20} />
          </div>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Pontos Totais</p>
          <h3 className="text-2xl font-bold mt-1">
            {users.reduce((acc, u) => acc + (u.career?.points || 0), 0).toLocaleString()}
          </h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Clock size={20} />
          </div>
          <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">Tempo de Uso Total</p>
          <h3 className="text-2xl font-bold mt-1">
            {formatTime(users.reduce((acc, u) => acc + (u.metrics?.totalTime || 0), 0))}
          </h3>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors">
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Carreira</th>
                <th className="px-6 py-4">Teologia</th>
                <th className="px-6 py-4">Tempo de Uso</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
                    <p className="text-stone-500 text-sm">Carregando dados...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-stone-500">Nenhum usuário encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full border-2 border-emerald-500/20"
                        />
                        <div>
                          <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">{user.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">Desde {new Date(user.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-zinc-400">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-lg">
                          {user.career?.points || 0} pts
                        </div>
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-lg">
                          Rank {user.career?.rankId || 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.theology?.enrolled ? (
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                            Inscrito
                          </div>
                          <div className="text-[10px] text-stone-400 font-bold">
                            {Object.keys(user.theology).filter(k => user.theology[k]?.completed).length} Matérias
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Não Inscrito</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-600 dark:text-zinc-300">
                        <Clock size={14} className="text-stone-400" />
                        {formatTime(user.metrics?.totalTime || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} 
                    alt={selectedUser.name} 
                    className="w-16 h-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-display font-bold">{selectedUser.name}</h2>
                    <p className="text-stone-500 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Career Stats */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                      <Trophy size={14} />
                      Performance Carreira
                    </h3>
                    <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Pontos</span>
                        <span className="font-bold">{selectedUser.career?.points || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Rank</span>
                        <span className="font-bold">{selectedUser.career?.rankId || 1}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Estrelas</span>
                        <span className="font-bold">{selectedUser.career?.stars || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Theology Stats */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                      <GraduationCap size={14} />
                      Performance Teologia
                    </h3>
                    <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Status</span>
                        <span className="font-bold text-emerald-600">{selectedUser.theology?.enrolled ? 'Inscrito' : 'Não Inscrito'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Matérias Concluídas</span>
                        <span className="font-bold">{Object.keys(selectedUser.theology || {}).filter(k => selectedUser.theology[k]?.completed).length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Tempo de Estudo</span>
                        <span className="font-bold">{formatTime(Object.keys(selectedUser.theology || {}).reduce((acc, k) => acc + (selectedUser.theology[k]?.studyTime || 0), 0))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 flex items-center gap-2">
                      <Clock size={14} />
                      Métricas de Uso
                    </h3>
                    <div className="bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Acessos</span>
                        <span className="font-bold">{selectedUser.metrics?.accesses || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Tempo Total</span>
                        <span className="font-bold">{formatTime(selectedUser.metrics?.totalTime || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Participações</span>
                        <span className="font-bold">{selectedUser.metrics?.forumParticipations || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Times */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                    <BarChart3 size={14} />
                    Tempo por Seção
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedUser.metrics?.sectionMetrics || {}).map(([section, time]: [string, any]) => (
                      <div key={section} className="bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">{section.replace('_', ' ')}</p>
                        <p className="text-lg font-bold mt-1">{formatTime(time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/50 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-8 py-3 bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-stone-300 dark:hover:bg-zinc-700 transition-all"
                >
                  Fechar
                </button>
                <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                  Enviar Mensagem
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  MousePointer2, 
  DollarSign, 
  LogOut,
  BarChart3, 
  Loader2,
  RefreshCw,
  Search,
  ArrowRight,
  User as UserIcon,
  MousePointerClick,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Trash2,
  UserPlus,
  X,
  EyeOff,
  Mail,
  Languages,
  Settings as SettingsIcon,
  Send,
  BrainCircuit,
  Radio,
  ScanEye,
  Cpu,
  Fingerprint,
  Plus,
  ShieldCheck,
  ZapOff,
  Bell,
  CheckCircle2,
  Target,
  AlertCircle
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';

// --- Types & Interfaces ---

interface LinkedCampaign {
  adAccountId: string;
  campaignId: string;
  campaignName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'CLIENT';
  linkedCampaigns: LinkedCampaign[];
  lastSync?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  adAccountId?: string;
}

interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  currency: string;
}

interface DailyData {
  date: string;
  spend: number;
  conversions: number;
  clicks: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

type Lang = 'fr' | 'ar';

// --- Translations ---

const translations = {
  fr: {
    perf: 'Performance',
    console: 'Console Agence',
    campaigns: 'Campagnes',
    partners: 'Partenaires',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    accessHub: 'Accéder au Hub',
    email: 'E-mail',
    password: 'Mot de passe',
    fluxInvesti: 'FLUX INVESTI',
    roiIndex: 'ROI INDEX',
    cpcMoyen: 'C.P.C MOYEN',
    traficTotal: 'TRAFIC TOTAL',
    optiFlux: 'OPTIMISATION DES FLUX',
    liveMetrics: 'LIVE METRICS',
    searchFlux: 'Rechercher un flux...',
    activeCampaigns: 'CAMPAGNES ACTIVES',
    partnerPortfolio: 'PORTEFEUILLE PARTENAIRES',
    addPartner: 'Ajouter Partenaire',
    explore: 'EXPLORER',
    initNode: 'INITIALISER NODE',
    socialReason: 'Raison Sociale',
    techEmail: 'E-mail Technique',
    passphrase: 'Passphrase Sécurisée',
    deployConfig: 'Déployer la Configuration',
    quitView: 'Quitter Vue Client',
    welcome: 'Bienvenue',
    admin: 'Administrateur',
    client: 'Client',
    status: 'Statut',
    metaConfig: 'Configuration Meta API',
    tokenValid: 'Jeton Valide',
    tokenInvalid: 'Jeton Invalide',
    tokenStatus: 'Statut du Jeton',
    saveConfig: 'Sauvegarder la Config',
    placeholderToken: 'Collez votre System User Token ici...',
    manageCamps: 'Gérer les campagnes',
    adAccountId: 'ID Compte Publicitaire',
    availableCamps: 'Campagnes Disponibles',
    linkedCamps: 'Campagnes liées',
    noCamps: 'Aucune campagne',
    aiPlaceholder: 'Transmettre une instruction...',
    aiGreeting: 'Analyse neuronale terminée. Prête pour l\'exécution.',
    aiStatusScanning: 'SCANNING...',
    aiStatusTyping: 'THINKING...',
    invested: 'Investi',
    loadingAccounts: 'Sync des comptes...',
    selectAccount: 'Sélectionner un compte',
    errorFetch: 'Erreur de connexion Meta API'
  },
  ar: {
    perf: 'الأداء',
    console: 'لوحة تحكم الوكالة',
    campaigns: 'الحملات',
    partners: 'الشركاء',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    accessHub: 'الدخول إلى المركز',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fluxInvesti: 'التدفق المستثمر',
    roiIndex: 'مؤشر العائد',
    cpcMoyen: 'متوسط التكلفة للنقرة',
    traficTotal: 'إجمالي الزيارات',
    optiFlux: 'تحسين التدفقات',
    liveMetrics: 'المقاييس الحية',
    searchFlux: 'البحث عن تدفق...',
    activeCampaigns: 'الحملات النشطة',
    partnerPortfolio: 'محفظة الشركاء',
    addPartner: 'إضافة شريك',
    explore: 'استكشاف',
    initNode: 'تهيئة العقدة',
    socialReason: 'الاسم التجاري',
    techEmail: 'البريد التقني',
    passphrase: 'عبارة المرور الآمنة',
    deployConfig: 'نشر الإعدادات',
    quitView: 'خروج من عرض العميل',
    welcome: 'مرحباً',
    admin: 'مدير',
    client: 'عميل',
    status: 'الحالة',
    metaConfig: 'إعدادات Meta API',
    tokenValid: 'الرمز صالح',
    tokenInvalid: 'الرمز غير صالح',
    tokenStatus: 'حالة الرمز',
    saveConfig: 'حفظ الإعدادات',
    placeholderToken: 'الصق رمز مستخدم النظام هنا...',
    manageCamps: 'إدارة الحملات',
    adAccountId: 'معرف الحساب الإعلاني',
    availableCamps: 'الحملات المتاحة',
    linkedCamps: 'الحملات المرتبطة',
    noCamps: 'لم يتم العثور على حملات',
    aiPlaceholder: 'إرسال تعليمات...',
    aiGreeting: 'اكتمل التحليل العصبي. جاهزة للتنفيذ.',
    aiStatusScanning: 'جاري المسح...',
    aiStatusTyping: 'جاري التفكير...',
    invested: 'المستثمر',
    loadingAccounts: 'جاري مزامنة الحسابات...',
    selectAccount: 'اختر حساباً',
    errorFetch: 'خطأ في الاتصال بـ Meta API'
  }
};

// --- API Service ---

const META_API_VERSION = 'v19.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const MetaApiService = {
  isValidToken: (token: string | null) => !!token && token.length > 30,
  
  async testConnection(token: string) {
    if (!token) return { success: false, message: "Aucun jeton fourni." };
    try {
      const response = await fetch(`${META_BASE_URL}/me?access_token=${token}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.error) return { success: false, message: data.error.message };
      return { success: true, message: data.name || 'Utilisateur Système' };
    } catch (e) {
      return { success: false, message: "Impossible de contacter Meta. Vérifiez votre connexion." };
    }
  },

  async fetchAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
    try {
      const response = await fetch(`${META_BASE_URL}/me/adaccounts?access_token=${accessToken}&fields=id,name,account_id,currency`);
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.data || [];
    } catch (err) {
      console.error("fetchAdAccounts error:", err);
      throw err;
    }
  },

  async fetchCampaigns(adAccountId: string, accessToken: string): Promise<Campaign[]> {
    try {
      const cleanId = adAccountId.trim().replace('act_', '');
      const url = `${META_BASE_URL}/act_${cleanId}/campaigns?access_token=${accessToken}&fields=id,name,status,objective,insights{spend,impressions,clicks,actions,ctr,cpc}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Meta API error');
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      return (data.data || []).map((c: any) => {
        const insights = c.insights?.data?.[0] || {};
        const convs = insights.actions?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0;
        const spend = parseFloat(insights.spend || 0);
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          spend,
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          conversions: parseInt(convs),
          ctr: parseFloat(insights.ctr || 0) * 100,
          cpc: parseFloat(insights.cpc || 0),
          roas: spend > 0 ? (convs * 65) / spend : 0, 
          adAccountId: `act_${cleanId}`
        };
      });
    } catch (err) {
      console.error("fetchCampaigns error:", err);
      throw err;
    }
  }
};

// --- Mocking ---

const getMockDailyData = (): DailyData[] => Array.from({ length: 14 }).map((_, i) => ({
  date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
  spend: Math.floor(Math.random() * 250) + 180,
  conversions: Math.floor(Math.random() * 25) + 12,
  clicks: Math.floor(Math.random() * 400) + 200,
}));

// --- Main App Component ---

const MetaAdsSaaS = () => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('ADSFLOW_LANG') as Lang) || 'fr');
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<User[]>(() => {
    const saved = localStorage.getItem('ADSFLOW_CLIENTS');
    return saved ? JSON.parse(saved) : [
      { id: 'admin-0', name: 'Super Admin', email: 'admin@adsflow.io', password: 'admin123', role: 'ADMIN', linkedCampaigns: [] },
      { id: 'client-1', name: 'Luxe & Couture Paris', email: 'contact@maisonluxe.fr', password: 'password123', role: 'CLIENT', linkedCampaigns: [] },
    ];
  });
  
  const [view, setView] = useState<'dashboard' | 'admin_dashboard' | 'admin' | 'campaigns' | 'admin_settings'>('dashboard');
  const [metaToken, setMetaToken] = useState(localStorage.getItem('META_SYSTEM_TOKEN') || '');
  const [loginState, setLoginState] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Lexa AI State
  const [isNeuralLinkOpen, setIsNeuralLinkOpen] = useState(false);
  const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'SCANNING' | 'TYPING'>('IDLE');

  // Lists & Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isManageCampsModalOpen, setIsManageCampsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<User | null>(null);
  const [tempAdAccountId, setTempAdAccountId] = useState('');
  const [discoveredCamps, setDiscoveredCamps] = useState<Campaign[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<MetaAdAccount[]>([]);
  
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalAdmin, setOriginalAdmin] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // Persistence & Effects
  useEffect(() => {
    localStorage.setItem('ADSFLOW_LANG', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ADSFLOW_CLIENTS', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const loadData = useCallback(async (targetUser: User) => {
    const activeToken = localStorage.getItem('META_SYSTEM_TOKEN');
    if (!MetaApiService.isValidToken(activeToken)) {
      setCampaigns([]);
      setDailyStats(getMockDailyData());
      return;
    }

    const linked = targetUser.linkedCampaigns;
    if (linked?.length > 0) {
      try {
        const accountIds = Array.from(new Set(linked.map(l => l.adAccountId)));
        const allFetched = (await Promise.all(
          accountIds.map(id => MetaApiService.fetchCampaigns(id, activeToken!).catch(() => []))
        )).flat();
        
        const filtered = allFetched.filter(c => linked.some(l => l.campaignId === c.id));
        setCampaigns(filtered);
        setDailyStats(getMockDailyData());
      } catch (err) {
        console.error("loadData main catch:", err);
        setCampaigns([]);
        setDailyStats(getMockDailyData());
      }
    } else {
      setCampaigns([]);
      setDailyStats(getMockDailyData());
    }
  }, []);

  useEffect(() => { 
    if (user) loadData(user); 
  }, [user, loadData, refreshTrigger]);

  // --- Lexa AI Core ---
  const handleAiCall = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const userMsg = (customMsg || aiInput).trim();
    if (!userMsg || aiStatus !== 'IDLE') return;
    
    if (!customMsg) setAiInput('');
    setAiHistory(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setAiStatus('SCANNING');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const snapshot = {
        kpis: dashboardKPIs,
        campaigns: campaigns.map(c => ({ name: c.name, roas: c.roas, spend: c.spend })),
        current_view: view,
        lang
      };

      const navigateTo = {
        name: 'navigateTo',
        parameters: {
          type: Type.OBJECT,
          description: 'Naviguer vers une page spécifique.',
          properties: { viewName: { type: Type.STRING, enum: ['dashboard', 'campaigns', 'admin', 'admin_settings'] } },
          required: ['viewName']
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `CONTEXTE SYSTÈME: ${JSON.stringify(snapshot)}. REQUÊTE UTILISATEUR: ${userMsg}`,
        config: {
          systemInstruction: `Tu es LEXA, l'intelligence exécutive de AdsFlow. Style: Direct, expert, tech, sans politesse inutile. Tes analyses portent sur le ROAS et les dépenses. Tu peux changer de vue via navigateTo. Langue: ${lang}.`,
          tools: [{ functionDeclarations: [navigateTo] }]
        }
      });

      setAiStatus('TYPING');
      
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'navigateTo') {
            const nextView = (call.args as any).viewName;
            setView(nextView as any);
            setAiHistory(prev => [...prev, { role: 'model', text: `Switch nodal vers **${nextView}** activé.`, timestamp: new Date() }]);
          }
        }
      } else {
        setAiHistory(prev => [...prev, { role: 'model', text: response.text || "Communication instable.", timestamp: new Date() }]);
      }
    } catch (err) {
      console.error("AI error:", err);
      setAiHistory(prev => [...prev, { role: 'model', text: "Erreur de liaison neuronale. Vérifiez votre clé API Gemini.", timestamp: new Date() }]);
    } finally {
      setAiStatus('IDLE');
    }
  };

  const dashboardKPIs = useMemo(() => {
    const totalSpend = campaigns.reduce((a, c) => a + (c.spend || 0), 0);
    const totalConversions = campaigns.reduce((a, c) => a + (c.conversions || 0), 0);
    const avgRoas = totalSpend > 0 ? (totalConversions * 65) / totalSpend : 0;
    const totalClicks = campaigns.reduce((a, c) => a + (c.clicks || 0), 0);
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    return [
      { label: t.fluxInvesti, value: `${totalSpend.toLocaleString()} €`, icon: DollarSign, color: 'text-blue-400' },
      { label: t.roiIndex, value: `${avgRoas.toFixed(2)}x`, icon: Zap, color: 'text-white', bg: 'bg-blue-600' },
      { label: t.cpcMoyen, value: `${avgCpc.toFixed(2)} €`, icon: MousePointerClick, color: 'text-red-500' },
      { label: t.traficTotal, value: totalClicks.toLocaleString(), icon: MousePointer2, color: 'text-white', bg: 'bg-black' },
    ];
  }, [campaigns, t]);

  const filteredCampaigns = useMemo(() => campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())), [campaigns, searchTerm]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('LOADING');
    setTimeout(() => {
      const found = clients.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password === passwordInput);
      if (found) {
        setUser(found);
        setView(found.role === 'ADMIN' ? 'admin_dashboard' : 'dashboard');
        setLoginState('SUCCESS');
      } else {
        alert("Credentials invalides.");
        setLoginState('IDLE');
      }
    }, 800);
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: User = { 
      id: `cl-${Date.now()}`, 
      name: newClientName, 
      email: newClientEmail, 
      password: newClientPassword, 
      role: 'CLIENT', 
      linkedCampaigns: [] 
    };
    setClients(prev => [...prev, newClient]);
    setIsAddClientModalOpen(false);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPassword('');
  };

  const handleSyncAccounts = async () => {
    if (!MetaApiService.isValidToken(metaToken)) {
      alert("Veuillez d'abord configurer un Token valide dans les Paramètres.");
      return;
    }
    setIsLoadingAccounts(true);
    try {
      const accounts = await MetaApiService.fetchAdAccounts(metaToken);
      setAvailableAccounts(accounts);
    } catch (e) {
      alert(t.errorFetch);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleDiscoverCamps = async (accountId: string) => {
    if (!MetaApiService.isValidToken(metaToken)) return;
    const cleanId = accountId.trim().replace('act_', '');
    setTempAdAccountId(`act_${cleanId}`);
    setIsDiscovering(true);
    try {
      const camps = await MetaApiService.fetchCampaigns(`act_${cleanId}`, metaToken);
      setDiscoveredCamps(camps);
    } catch (e) {
      alert("Erreur de découverte. Vérifiez l'ID et le Token.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleLinkCampaign = (camp: Partial<Campaign>) => {
    if (!clientToEdit) return;
    const isLinked = clientToEdit.linkedCampaigns.some(l => l.campaignId === camp.id);
    const nextLinked = isLinked 
      ? clientToEdit.linkedCampaigns.filter(l => l.campaignId !== camp.id) 
      : [...clientToEdit.linkedCampaigns, { adAccountId: tempAdAccountId, campaignId: camp.id!, campaignName: camp.name! }];
    
    const updated = { ...clientToEdit, linkedCampaigns: nextLinked };
    setClientToEdit(updated);
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    
    // Si c'est l'utilisateur actuel qu'on modifie (en mode impersonation), on refresh
    if (user && user.id === updated.id) {
      setUser(updated);
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const impersonate = (client: User) => { 
    setOriginalAdmin(user); 
    setIsImpersonating(true); 
    setUser(client); 
    setView('dashboard'); 
  };
  
  const stopImpersonation = () => { 
    setUser(originalAdmin); 
    setOriginalAdmin(null); 
    setIsImpersonating(false); 
    setView('admin'); 
  };

  const handleTokenUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.trim();
    setMetaToken(val);
    localStorage.setItem('META_SYSTEM_TOKEN', val);
  };

  // --- Views ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)] opacity-40" />
        <div className="max-w-md w-full space-y-12 relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex p-5 bg-blue-600 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.5)]">
              <BarChart3 className="text-white w-10 h-10" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">ADSFLOW</h1>
          </div>
          <div className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/30 ml-2">{t.email}</label>
                <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="contact@agency.com" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/30 ml-2">{t.password}</label>
                <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
              </div>
              <button type="submit" disabled={loginState !== 'IDLE'} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-[12px] uppercase shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                {loginState === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />} {t.accessHub}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950 font-jakarta text-white relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 blur-[180px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Sidebar - Neo-Sleek */}
      <aside className={`w-24 lg:w-[280px] bg-black/30 backdrop-blur-3xl border-${lang === 'ar' ? 'l' : 'r'} border-white/5 flex flex-col z-40 relative transition-all duration-500`}>
        <div className="p-10 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <span className="hidden lg:inline font-black text-xl uppercase tracking-tighter italic">ADSflow</span>
        </div>
        <nav className="flex-1 px-4 lg:px-6 space-y-2 pt-10">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-white text-black font-black shadow-xl shadow-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="hidden lg:inline text-[10px] uppercase font-black">{t.perf}</span>
          </button>
          <button onClick={() => setView('campaigns')} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all ${view === 'campaigns' ? 'bg-white text-black font-black shadow-xl shadow-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
            <TrendingUp className="w-5 h-5" /> <span className="hidden lg:inline text-[10px] uppercase font-black">{t.campaigns}</span>
          </button>
          {user.role === 'ADMIN' && (
            <>
              <button onClick={() => setView('admin')} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all ${view === 'admin' ? 'bg-white text-black font-black shadow-xl shadow-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                <Users className="w-5 h-5" /> <span className="hidden lg:inline text-[10px] uppercase font-black">{t.partners}</span>
              </button>
              <button onClick={() => setView('admin_settings')} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all ${view === 'admin_settings' ? 'bg-white text-black font-black shadow-xl shadow-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                <SettingsIcon className="w-5 h-5" /> <span className="hidden lg:inline text-[10px] uppercase font-black">{t.settings}</span>
              </button>
            </>
          )}
        </nav>
        <div className="p-8 border-t border-white/5">
          <button onClick={() => setUser(null)} className="w-full flex items-center justify-center gap-3 p-4 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">
              {view === 'dashboard' ? t.perf : view === 'campaigns' ? t.campaigns : view === 'admin' ? t.partners : t.settings}
            </h2>
            {isImpersonating && (
              <div className="flex items-center gap-4 bg-red-600/10 border border-red-500/20 px-5 py-2.5 rounded-2xl animate-pulse">
                 <ScanEye className="w-4 h-4 text-red-500" />
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{user.name}</span>
                 <button onClick={stopImpersonation} className="text-red-500 hover:scale-125 transition-transform"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} className="glass-card px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border border-white/10 hover:bg-white/10 transition-all">{lang === 'fr' ? 'AR' : 'FR'}</button>
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-tight">{user.name}</p>
                  <p className="text-[9px] font-bold text-white/30 uppercase">{user.role}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black shadow-xl border border-white/10 text-lg">
                  {user.name.charAt(0)}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar animate-in slide-in-from-bottom-4 duration-1000">
          
          {/* Settings / Config */}
          {view === 'admin_settings' && (
             <div className="max-w-4xl mx-auto space-y-10">
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-12">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-500"><SettingsIcon className="w-8 h-8" /></div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter">{t.metaConfig}</h3>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-white/30 ml-4">System User Access Token</label>
                      <textarea 
                        value={metaToken} 
                        onChange={handleTokenUpdate} 
                        placeholder={t.placeholderToken}
                        rows={5}
                        className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-8 py-6 text-sm font-mono text-white outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                      />
                   </div>
                   <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${MetaApiService.isValidToken(metaToken) ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                         <span className="text-sm font-black uppercase">{MetaApiService.isValidToken(metaToken) ? t.tokenValid : t.tokenInvalid}</span>
                      </div>
                      <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-[11px] uppercase hover:bg-blue-600 hover:text-white transition-all">
                        {t.saveConfig}
                      </button>
                   </div>
                </div>
             </div>
          )}

          {/* Dashboard */}
          {view === 'dashboard' && (
            <div className="max-w-[1400px] mx-auto space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {dashboardKPIs.map((kpi, i) => (
                    <div key={i} className={`glass-card p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group transition-all hover:scale-105 ${kpi.bg || ''}`}>
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform group-hover:scale-150 duration-1000">
                          <kpi.icon className="w-32 h-32" />
                       </div>
                       <p className={`text-[10px] font-black uppercase mb-10 tracking-widest ${kpi.bg ? 'text-white/70' : 'text-white/20'}`}>{kpi.label}</p>
                       <h3 className="text-4xl font-black tabular-nums tracking-tighter">{kpi.value}</h3>
                    </div>
                 ))}
              </div>
              <div className="glass-card p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{t.optiFlux}</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-500/20">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                       <span className="text-[9px] font-black text-blue-500 uppercase">Live Node 0x92</span>
                    </div>
                 </div>
                 <div className="h-[450px]" key={lang}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyStats}>
                        <defs>
                          <linearGradient id="lexaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.02)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900}} reversed={lang === 'ar'} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900}} orientation={lang === 'ar' ? 'right' : 'left'} />
                        <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', fontWeight: 900, fontSize: '12px' }} />
                        <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={5} fill="url(#lexaGrad)" animationDuration={1500} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          )}

          {/* Campaigns */}
          {view === 'campaigns' && (
            <div className="max-w-[1400px] mx-auto space-y-10">
               <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-16">
                  <h3 className="text-5xl font-black uppercase tracking-tighter italic">{t.activeCampaigns}</h3>
                  <div className="relative w-full xl:w-[450px] group">
                    <div className="absolute -inset-1 bg-blue-600/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-all" />
                    <Search className={`absolute ${lang === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-white/20 w-5 h-5`} />
                    <input type="text" placeholder={t.searchFlux} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full bg-white/5 border border-white/10 rounded-2xl py-6 ${lang === 'ar' ? 'pr-16 pl-8' : 'pl-16 pr-8'} text-sm font-black outline-none focus:border-blue-500 transition-all relative z-10`} />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {filteredCampaigns.length === 0 ? (
                    <div className="py-20 text-center text-white/20 flex flex-col items-center gap-6">
                       <Radio className="w-16 h-16 animate-pulse" />
                       <p className="text-xl font-black uppercase tracking-widest">{t.noCamps}</p>
                    </div>
                  ) : filteredCampaigns.map(c => (
                    <div key={c.id} className="glass-card p-10 rounded-[3rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between hover:bg-white/5 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                       <div className="flex items-center gap-10 mb-6 sm:mb-0 w-full sm:w-auto">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                             <Activity className="w-7 h-7" />
                          </div>
                          <div className="text-start">
                            <h4 className="font-black text-xl uppercase tracking-tight truncate max-w-[280px] lg:max-w-[400px]">{c.name}</h4>
                            <p className="text-[10px] font-black text-white/20 uppercase mt-2 tracking-widest">{c.objective} • {c.status}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-12 lg:gap-20 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-center">
                             <p className="text-[9px] font-black text-white/20 uppercase mb-2 tracking-widest">ROAS</p>
                             <p className="text-2xl font-black text-emerald-400 tabular-nums">{c.roas.toFixed(2)}x</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[9px] font-black text-white/20 uppercase mb-2 tracking-widest">{t.invested}</p>
                             <p className="text-2xl font-black tabular-nums">{c.spend.toLocaleString()} €</p>
                          </div>
                          <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-white/20 hover:text-white transition-all hidden lg:block">
                             <ChevronRight className={`w-6 h-6 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Admin / Partners */}
          {view === 'admin' && (
             <div className="max-w-[1400px] mx-auto space-y-12">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-8">
                   <h2 className="text-5xl font-black uppercase tracking-tighter italic">{t.partnerPortfolio}</h2>
                   <button onClick={() => setIsAddClientModalOpen(true)} className="bg-white text-black px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
                      <UserPlus className="w-6 h-6" /> {t.addPartner}
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {clients.filter(c => c.role === 'CLIENT').map(client => (
                      <div key={client.id} className="glass-card p-12 rounded-[3.5rem] border border-white/5 flex flex-col gap-12 group transition-all hover:bg-white/[0.04]">
                         <div className="flex items-center gap-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center font-black text-4xl uppercase shadow-2xl border border-white/10 group-hover:rotate-3 transition-transform">{client.name.charAt(0)}</div>
                            <div className="text-start">
                               <h4 className="text-3xl font-black uppercase tracking-tighter italic">{client.name}</h4>
                               <div className="flex items-center gap-3 mt-3 text-white/30">
                                 <Mail className="w-4 h-4" />
                                 <p className="text-xs font-bold truncate max-w-[200px]">{client.email}</p>
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <button onClick={() => { 
                              setClientToEdit(client); 
                              setIsManageCampsModalOpen(true); 
                              handleSyncAccounts(); // Trigger sync automatically when opening
                            }} className="flex-1 bg-white/5 border border-white/5 p-6 rounded-[1.8rem] font-black text-[10px] uppercase hover:bg-blue-600/20 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95">
                               <Layers className="w-5 h-5" /> {t.manageCamps}
                            </button>
                            <button onClick={() => impersonate(client)} className="flex-1 bg-white text-black p-6 rounded-[1.8rem] font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl">
                               <ScanEye className="w-5 h-5" /> {t.explore}
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </main>
      </div>

      {/* --- LEXA NEURAL LINK --- */}
      <div className={`fixed bottom-12 ${lang === 'ar' ? 'left-12' : 'right-12'} z-[100] flex flex-col items-end gap-6`}>
         
         {aiStatus !== 'IDLE' && (
           <div className="glass-card px-8 py-5 rounded-[2rem] border border-blue-500/30 animate-in slide-in-from-bottom-6 duration-500 shadow-[0_0_60px_rgba(59,130,246,0.3)] bg-slate-950/80">
              <div className="flex items-center gap-4">
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                 </div>
                 <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">{aiStatus === 'SCANNING' ? 'NODAL SCAN' : 'NEURAL CORE THINKING'}</span>
              </div>
           </div>
         )}

         <button 
           onClick={() => setIsNeuralLinkOpen(!isNeuralLinkOpen)}
           className={`relative group w-24 h-24 rounded-full transition-all duration-700 hover:scale-110 active:scale-90 ${isNeuralLinkOpen ? 'scale-110 shadow-[0_0_80px_rgba(59,130,246,0.4)] ring-4 ring-blue-500/50' : 'shadow-[0_0_50px_rgba(0,0,0,0.7)]'}`}
         >
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-white/10 bg-slate-900">
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
                 alt="Lexa Avatar" 
                 className={`w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 ${isNeuralLinkOpen ? 'grayscale-0 brightness-110 scale-110' : ''}`}
               />
            </div>
            <div className="absolute inset-[-10px] border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-lg">
               <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
         </button>

         {isNeuralLinkOpen && (
           <div className={`absolute bottom-32 ${lang === 'ar' ? 'left-0' : 'right-0'} w-[400px] h-[650px] glass-card rounded-[3.5rem] border border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in-90 slide-in-from-bottom-10 duration-500 origin-bottom-right z-[110] bg-slate-950/60`}>
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Cpu className="w-6 h-6 animate-pulse" /></div>
                    <div className="text-start">
                       <h4 className="text-sm font-black uppercase tracking-widest italic">NEURAL LINK 0.4</h4>
                       <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">SECURE UPLINK ACTIVE</p>
                    </div>
                 </div>
                 <button onClick={() => setIsNeuralLinkOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
                 {aiHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-10 opacity-30">
                       <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center animate-pulse">
                          <Fingerprint className="w-12 h-12 text-blue-500" />
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-loose">{t.aiGreeting}</p>
                    </div>
                 ) : (
                    aiHistory.map((msg, i) => (
                       <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                          <div className={`max-w-[85%] p-6 rounded-[2.2rem] text-[13px] font-bold leading-relaxed shadow-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-3xl'}`}>
                             {msg.text}
                          </div>
                          <span className="text-[7px] font-black text-white/10 uppercase mt-3 tracking-[0.2em] px-2">{msg.role === 'user' ? 'UPLINK_USER' : 'LEXA_CORE_0x9'}</span>
                       </div>
                    ))
                 )}
                 <div ref={chatEndRef} />
              </div>

              <div className="p-10 border-t border-white/5">
                 <form onSubmit={handleAiCall} className="relative group">
                    <div className="absolute -inset-1 bg-blue-600/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder={t.aiPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 pr-20 text-sm font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/10 relative z-10"
                    />
                    <button type="submit" disabled={!aiInput.trim() || aiStatus !== 'IDLE'} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-20 shadow-2xl z-20 hover:scale-105 active:scale-90 transition-all">
                       <Send className="w-5 h-5" />
                    </button>
                 </form>
              </div>
           </div>
         )}
      </div>

      {/* --- MODALS --- */}
      
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setIsAddClientModalOpen(false)} />
           <div className="glass-card w-full max-w-lg rounded-[4rem] border border-white/10 shadow-2xl relative p-12 space-y-12 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic">{t.initNode}</h3>
                 <button onClick={() => setIsAddClientModalOpen(false)} className="text-white/20 hover:text-white"><X className="w-7 h-7" /></button>
              </div>
              <form onSubmit={handleAddClient} className="space-y-6">
                 <input required type="text" placeholder={t.socialReason} value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[1.8rem] px-8 py-5 text-sm font-black text-white outline-none focus:border-blue-500 transition-all" />
                 <input required type="email" placeholder={t.techEmail} value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[1.8rem] px-8 py-5 text-sm font-black text-white outline-none focus:border-blue-500 transition-all" />
                 <input required type="text" placeholder={t.passphrase} value={newClientPassword} onChange={(e) => setNewClientPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[1.8rem] px-8 py-5 text-sm font-black text-white outline-none focus:border-blue-500 transition-all" />
                 <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[1.8rem] font-black text-[12px] uppercase shadow-2xl active:scale-95 transition-transform">{t.deployConfig}</button>
              </form>
           </div>
        </div>
      )}

      {isManageCampsModalOpen && clientToEdit && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setIsManageCampsModalOpen(false)} />
            <div className="glass-card w-full max-w-6xl rounded-[4rem] border border-white/10 shadow-2xl relative p-12 space-y-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between">
                  <div className="text-start">
                     <h3 className="text-4xl font-black uppercase tracking-tighter italic">{t.manageCamps}</h3>
                     <p className="text-blue-500 font-black text-xs uppercase tracking-widest mt-2">{clientToEdit.name}</p>
                  </div>
                  <button onClick={() => setIsManageCampsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/20 hover:text-white"><X className="w-7 h-7" /></button>
               </div>

               <div className="space-y-6">
                 <div className="flex items-center justify-between ml-4">
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">{t.selectAccount}</p>
                    <button onClick={handleSyncAccounts} className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                       <RefreshCw className={`w-3 h-3 ${isLoadingAccounts ? 'animate-spin' : ''}`} /> Synchronisation en direct
                    </button>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {isLoadingAccounts ? (
                       <div className="w-full py-10 flex items-center justify-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                          <span className="ml-4 text-[10px] font-black uppercase text-white/20 tracking-widest">{t.loadingAccounts}</span>
                       </div>
                    ) : availableAccounts.length === 0 ? (
                       <div className="w-full py-10 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/5 border-dashed cursor-pointer hover:bg-white/10 transition-all group" onClick={handleSyncAccounts}>
                          <CheckCircle2 className="w-8 h-8 text-white/10 group-hover:text-blue-500 transition-colors" />
                          <span className="mt-4 text-[10px] font-black uppercase text-white/20 tracking-widest">Connecter avec Meta Business Manager</span>
                       </div>
                    ) : availableAccounts.map(acc => (
                       <button 
                         key={acc.id} 
                         onClick={() => handleDiscoverCamps(acc.id)}
                         className={`shrink-0 p-6 rounded-3xl border transition-all flex flex-col gap-3 min-w-[220px] text-start ${tempAdAccountId === acc.id ? 'bg-blue-600 border-blue-500 shadow-xl scale-105' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                       >
                          <div className="flex items-center justify-between">
                             <Target className={`w-4 h-4 ${tempAdAccountId === acc.id ? 'text-white' : 'text-blue-500'}`} />
                             <span className="text-[8px] font-black uppercase opacity-40">{acc.currency}</span>
                          </div>
                          <p className="text-[10px] font-black uppercase truncate w-full">{acc.name}</p>
                          <p className="text-[8px] font-bold opacity-30">act_{acc.account_id}</p>
                       </button>
                    ))}
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
                  <div className="space-y-8">
                     <p className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-4">Mapping Node Meta API</p>
                     <div className="flex gap-4">
                        <input 
                           type="text" 
                           placeholder="act_..." 
                           value={tempAdAccountId} 
                           onChange={(e) => setTempAdAccountId(e.target.value)} 
                           className="flex-1 bg-black/40 border border-white/10 rounded-[1.8rem] px-8 py-5 text-sm font-black text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
                        />
                        <button onClick={() => handleDiscoverCamps(tempAdAccountId)} disabled={isDiscovering} className="bg-white/5 border border-white/10 px-8 rounded-[1.8rem] flex items-center justify-center hover:bg-white hover:text-black transition-all">
                           {isDiscovering ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        </button>
                     </div>
                     <div className="h-[350px] overflow-y-auto space-y-3 bg-black/20 rounded-[2.5rem] p-6 border border-white/5 custom-scrollbar">
                        {discoveredCamps.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                              <AlertCircle className="w-10 h-10" />
                              <p className="text-[10px] font-black uppercase">{t.noCamps}</p>
                           </div>
                        ) : discoveredCamps.map(c => (
                          <button key={c.id} onClick={() => toggleLinkCampaign(c)} className={`w-full p-5 rounded-2xl text-left text-[11px] font-black uppercase flex items-center justify-between border transition-all ${clientToEdit.linkedCampaigns.some(l => l.campaignId === c.id) ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}>
                             <span className="truncate max-w-[200px]">{c.name}</span>
                             {clientToEdit.linkedCampaigns.some(l => l.campaignId === c.id) ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <p className="text-[10px] font-black uppercase text-white/30 tracking-widest ml-4">Flux Associés ({clientToEdit.linkedCampaigns.length})</p>
                     <div className="h-[430px] overflow-y-auto space-y-3 bg-black/40 rounded-[2.5rem] p-6 border border-white/10 custom-scrollbar">
                        {clientToEdit.linkedCampaigns.map(l => (
                          <div key={l.campaignId} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group animate-in slide-in-from-right-4">
                             <div className="text-start truncate flex-1 pr-4">
                                <p className="text-[11px] font-black text-white uppercase truncate">{l.campaignName}</p>
                                <p className="text-[8px] font-bold text-white/20 uppercase mt-1">ID: {l.campaignId}</p>
                             </div>
                             <button onClick={() => toggleLinkCampaign({ id: l.campaignId })} className="text-red-500/30 hover:text-red-500 p-2 transition-all">
                                <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .font-jakarta { font-family: 'Plus Jakarta Sans', 'IBM Plex Sans Arabic', sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.1); }
        * { letter-spacing: -0.03em; }

        .tabular-nums { font-variant-numeric: tabular-nums; }
        
        [dir="rtl"] .text-start { text-align: right; }
        [dir="rtl"] .text-end { text-align: left; }
        
        .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke-opacity: 0.1; }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<MetaAdsSaaS />);
}

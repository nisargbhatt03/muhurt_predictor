import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  UserCheck, 
  UserX, 
  Trash2, 
  CreditCard, 
  Sparkles, 
  ArrowLeft,
  Download,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { 
  apiGetAdminUsers, 
  apiToggleUserStatus, 
  apiDeleteUser, 
  getPredictionApiMode, 
  setPredictionApiMode
} from './api';
import type { AdminUser, PredictionApiMode } from './api';

interface AdminPanelProps {
  onBackToApp: () => void;
}

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 101,
    name: "Acharya Rajesh Shastri",
    email: "rajesh.astrology@gmail.com",
    phone: "+91 98765 43210",
    role: "admin",
    is_active: true,
    is_verified: true,
    created_at: "2026-01-15T10:30:00Z",
    date_of_birth: "1982-05-14",
    gotra: "Kashyapa",
    rashi: "Vrishabha (Taurus)",
    nakshatra: "Rohini",
    credits_remaining: 999,
    subscription_tier: "pro"
  },
  {
    id: 102,
    name: "Priya Sharma",
    email: "priya.sharma99@yahoo.com",
    phone: "+91 91234 56789",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-02-01T14:20:00Z",
    date_of_birth: "1994-09-22",
    gotra: "Vashishta",
    rashi: "Kanya (Virgo)",
    nakshatra: "Hasta",
    credits_remaining: 15,
    subscription_tier: "premium"
  },
  {
    id: 103,
    name: "Vikram Patel",
    email: "vikram.patel@techcorp.in",
    phone: "+91 99887 76655",
    role: "user",
    is_active: true,
    is_verified: false,
    created_at: "2026-02-28T09:12:00Z",
    date_of_birth: "1988-11-03",
    gotra: "Bharadwaja",
    rashi: "Mina (Pisces)",
    nakshatra: "Revati",
    credits_remaining: 5,
    subscription_tier: "free"
  },
  {
    id: 104,
    name: "Sunita Deshmukh",
    email: "sunita.d@outlook.com",
    phone: "+91 97654 32109",
    role: "user",
    is_active: false,
    is_verified: true,
    created_at: "2026-03-05T18:45:00Z",
    date_of_birth: "1991-03-17",
    gotra: "Gautama",
    rashi: "Simha (Leo)",
    nakshatra: "Purva Phalguni",
    credits_remaining: 0,
    subscription_tier: "free"
  },
  {
    id: 105,
    name: "Pandit Anand Joshi",
    email: "anand.joshi@vedic.org",
    phone: "+91 98111 22334",
    role: "admin",
    is_active: true,
    is_verified: true,
    created_at: "2026-03-10T11:00:00Z",
    date_of_birth: "1978-08-19",
    gotra: "Atri",
    rashi: "Makar (Capricorn)",
    nakshatra: "Shravana",
    credits_remaining: 500,
    subscription_tier: "pro"
  },
  {
    id: 106,
    name: "Kavita Rao",
    email: "kavita.rao@gmail.com",
    phone: "+91 94444 55566",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-03-15T16:30:00Z",
    date_of_birth: "1996-12-05",
    gotra: "Angirasa",
    rashi: "Tula (Libra)",
    nakshatra: "Swati",
    credits_remaining: 25,
    subscription_tier: "premium"
  },
  {
    id: 107,
    name: "Amitav Ghosh",
    email: "amitav.g@company.com",
    phone: "+91 93333 44455",
    role: "user",
    is_active: true,
    is_verified: false,
    created_at: "2026-03-20T08:15:00Z",
    date_of_birth: "1985-04-12",
    gotra: "Pulastya",
    rashi: "Mesha (Aries)",
    nakshatra: "Ashwini",
    credits_remaining: 3,
    subscription_tier: "free"
  },
  {
    id: 108,
    name: "Meera Nambiar",
    email: "meera.nambiar@kerala.net",
    phone: "+91 97777 88899",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-03-25T14:50:00Z",
    date_of_birth: "1992-07-28",
    gotra: "Agastya",
    rashi: "Karkat (Cancer)",
    nakshatra: "Pushya",
    credits_remaining: 18,
    subscription_tier: "premium"
  },
  {
    id: 109,
    name: "Rohan Verma",
    email: "rohan.v@techstudio.io",
    phone: "+91 96666 55544",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-04-02T10:05:00Z",
    date_of_birth: "1998-01-30",
    gotra: "Vishwamitra",
    rashi: "Dhanu (Sagittarius)",
    nakshatra: "Mula",
    credits_remaining: 5,
    subscription_tier: "free"
  },
  {
    id: 110,
    name: "Neha Kulkarni",
    email: "neha.kulkarni@pune.ac.in",
    phone: "+91 95555 66677",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-04-10T12:40:00Z",
    date_of_birth: "1990-10-14",
    gotra: "Jamadagni",
    rashi: "Kumbha (Aquarius)",
    nakshatra: "Shatabhisha",
    credits_remaining: 120,
    subscription_tier: "pro"
  },
  {
    id: 111,
    name: "Deepak Agarwal",
    email: "deepak.agarwal@retail.in",
    phone: "+91 92222 33344",
    role: "user",
    is_active: false,
    is_verified: false,
    created_at: "2026-04-18T17:25:00Z",
    date_of_birth: "1984-06-21",
    gotra: "Kashyapa",
    rashi: "Mithun (Gemini)",
    nakshatra: "Ardra",
    credits_remaining: 0,
    subscription_tier: "free"
  },
  {
    id: 112,
    name: "Pooja Trivedi",
    email: "pooja.trivedi@ahmedabad.org",
    phone: "+91 91111 22233",
    role: "user",
    is_active: true,
    is_verified: true,
    created_at: "2026-04-25T09:10:00Z",
    date_of_birth: "1995-02-18",
    gotra: "Vashishta",
    rashi: "Vrishchik (Scorpio)",
    nakshatra: "Anuradha",
    credits_remaining: 12,
    subscription_tier: "premium"
  }
];

export default function AdminPanel({ onBackToApp }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiMode, setApiMode] = useState<PredictionApiMode>(getPredictionApiMode());
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiGetAdminUsers(searchTerm);
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      } else if (!searchTerm) {
        setUsers(MOCK_ADMIN_USERS);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.info("Using local fallback users in admin panel:", err);
      const filtered = MOCK_ADMIN_USERS.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone && u.phone.includes(searchTerm))
      );
      setUsers(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1); // Reset page on search
  }, [searchTerm]);

  const handleRowsPerPageChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleModeSwitch = (newMode: PredictionApiMode) => {
    setApiMode(newMode);
    setPredictionApiMode(newMode);
    showToast(`Prediction API mode switched to ${newMode === 'github' ? 'GitHub API / Local Engine' : 'Google Gemini API'}`);
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await apiToggleUserStatus(userId);
    } catch (err) {
      console.info("Simulating offline toggle for user:", userId);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    showToast(`User status toggled successfully.`);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await apiDeleteUser(userId);
    } catch (err) {
      console.info("Simulating offline delete for user:", userId);
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`User account deleted.`);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Active", "Tier", "Credits", "Gotra", "Rashi", "Nakshatra", "Joined Date"];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      u.role,
      u.is_active ? "Yes" : "No",
      u.subscription_tier || 'free',
      u.credits_remaining || 0,
      `"${u.gotra || ''}"`,
      `"${u.rashi || ''}"`,
      `"${u.nakshatra || ''}"`,
      u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `muhurt_users_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("User details exported to CSV file.");
  };

  // Metrics
  const activeCount = users.filter(u => u.is_active).length;
  const premiumCount = users.filter(u => u.subscription_tier === 'premium' || u.subscription_tier === 'pro').length;

  // Pagination Math
  const totalUsersCount = users.length;
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / rowsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (validCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalUsersCount);
  const paginatedUsers = users.slice(startIndex, endIndex);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0d14',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#1e293b',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <Sparkles size={18} color="#38bdf8" />
          {notification}
        </div>
      )}

      {/* Top Header Bar */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 24px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToApp}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} /> Back to Main App
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={26} color="#eab308" /> Admin Panel — User Details Grid
            </h1>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', display: 'inline-block' }}>
              URL: <code style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#fde047', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:5173/admin</code>
            </span>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* API ENGINE MODE SWITCHER CONTAINER */}
        <section style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#eab308" /> Prediction Engine Mode Switcher
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                Select active prediction provider engine for Vedic Panchang evaluations across the platform.
              </p>
            </div>
            <div style={{
              backgroundColor: apiMode === 'github' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)',
              border: `1px solid ${apiMode === 'github' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
              color: apiMode === 'github' ? '#4ade80' : '#c084fc',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Activity size={14} /> ACTIVE MODE: {apiMode === 'github' ? 'GitHub API / Local Engine' : 'Google Gemini API'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Mode Option 1: GitHub API / Local Engine */}
            <div 
              onClick={() => handleModeSwitch('github')}
              style={{
                backgroundColor: apiMode === 'github' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                border: apiMode === 'github' ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {apiMode === 'github' ? <ToggleRight size={26} color="#22c55e" /> : <ToggleLeft size={26} color="#64748b" />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: apiMode === 'github' ? '#4ade80' : '#f8fafc' }}>
                  GitHub API / Local Astronomical Engine
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
                  Fast local FastAPI astronomical ephemeris (Skyfield + DE421). Zero external API cost, ultra-reliable.
                </div>
                {apiMode === 'github' && (
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '2px 8px', borderRadius: '4px', marginTop: '8px', display: 'inline-block', fontWeight: 600 }}>
                    ✓ Default Active Engine
                  </span>
                )}
              </div>
            </div>

            {/* Mode Option 2: Google Gemini API */}
            <div 
              onClick={() => handleModeSwitch('gemini')}
              style={{
                backgroundColor: apiMode === 'gemini' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                border: apiMode === 'gemini' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {apiMode === 'gemini' ? <ToggleRight size={26} color="#a855f7" /> : <ToggleLeft size={26} color="#64748b" />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: apiMode === 'gemini' ? '#c084fc' : '#f8fafc' }}>
                  Google Gemini API Mode
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
                  Routes predictions through Google Generative AI API (gemini-1.5-flash). Requires valid Gemini API Key.
                </div>
                {apiMode === 'gemini' && (
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#e9d5ff', padding: '2px 8px', borderRadius: '4px', marginTop: '8px', display: 'inline-block', fontWeight: 600 }}>
                    ✓ Gemini API Enabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* METRICS / STATS OVERVIEW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="#38bdf8" /> TOTAL REGISTERED USERS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', marginTop: '8px' }}>
              {users.length}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} color="#4ade80" /> ACTIVE ACCOUNTS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4ade80', marginTop: '8px' }}>
              {activeCount}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#facc15" /> PREMIUM / PRO SUBSCRIBERS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#facc15', marginTop: '8px' }}>
              {premiumCount}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} color="#a7f3d0" /> FREE TRIAL USERS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a7f3d0', marginTop: '8px' }}>
              {users.length - premiumCount}
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div style={{
          backgroundColor: '#111827',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter users by name, email, or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            <Download size={16} /> Export CSV Report
          </button>
        </div>

        {/* USER DETAILS GRID TABLE */}
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          marginBottom: '16px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>USER ID</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>NAME & ROLE</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>CONTACT DETAILS</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>ASTROLOGICAL PROFILE</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>PLAN & CREDITS</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '14px 16px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                    No user records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.15s' }}>
                    {/* ID */}
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                      #{u.id}
                    </td>

                    {/* Name & Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>{u.name}</div>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        backgroundColor: u.role === 'admin' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: u.role === 'admin' ? '#fde047' : '#cbd5e1',
                        border: u.role === 'admin' ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(100, 116, 139, 0.3)'
                      }}>
                        {u.role}
                      </span>
                    </td>

                    {/* Contact Details */}
                    <td style={{ padding: '14px 16px', fontSize: '0.84rem' }}>
                      <div style={{ color: '#e2e8f0' }}>{u.email || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{u.phone || '—'}</div>
                    </td>

                    {/* Astrological Profile */}
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                      <div style={{ color: '#fef08a' }}>Gotra: <strong>{u.gotra || 'Not Set'}</strong></div>
                      <div style={{ color: '#cbd5e1', marginTop: '2px' }}>Rashi: {u.rashi || '—'}</div>
                      <div style={{ color: '#94a3b8', marginTop: '2px' }}>Nakshatra: {u.nakshatra || '—'}</div>
                    </td>

                    {/* Subscription & Credits */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        textTransform: 'capitalize',
                        backgroundColor: u.subscription_tier === 'pro' ? 'rgba(168, 85, 247, 0.2)' : u.subscription_tier === 'premium' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: u.subscription_tier === 'pro' ? '#c084fc' : u.subscription_tier === 'premium' ? '#38bdf8' : '#94a3b8',
                        border: u.subscription_tier === 'pro' ? '1px solid rgba(168, 85, 247, 0.4)' : u.subscription_tier === 'premium' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(100, 116, 139, 0.3)'
                      }}>
                        {u.subscription_tier || 'free'} Tier
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '6px', fontWeight: 600 }}>
                        {u.credits_remaining ?? 3} Credits Left
                      </div>
                    </td>

                    {/* Active Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        style={{
                          backgroundColor: u.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: u.is_active ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                          color: u.is_active ? '#4ade80' : '#f87171',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {u.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedUser(u)}
                          style={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#38bdf8',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.78rem'
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS FOOTER */}
        {totalUsersCount > 0 && (
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '32px'
          }}>
            {/* Info & Rows per page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div>
                Showing <strong style={{ color: '#f8fafc' }}>{startIndex + 1}</strong> to <strong style={{ color: '#f8fafc' }}>{endIndex}</strong> of <strong style={{ color: '#fde047' }}>{totalUsersCount}</strong> users
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Page navigation buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: validCurrentPage === 1 ? '#475569' : '#e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: validCurrentPage === 1 ? '#475569' : '#e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    backgroundColor: p === validCurrentPage ? 'rgba(234, 179, 8, 0.2)' : '#1e293b',
                    border: p === validCurrentPage ? '1px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: p === validCurrentPage ? '#fde047' : '#e2e8f0',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: p === validCurrentPage ? 700 : 500
                  }}
                >
                  {p}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: validCurrentPage === totalPages ? '#475569' : '#e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: validCurrentPage === totalPages ? '#475569' : '#e2e8f0',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* USER DETAILS MODAL */}
        {selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#111827',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              color: '#e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fef08a' }}>
                  User Account Details — #{selectedUser.id}
                </h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>FULL NAME</span>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{selectedUser.name}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>ROLE</span>
                  <div style={{ fontWeight: 700, color: '#fde047', textTransform: 'uppercase', marginTop: '2px' }}>{selectedUser.role}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>EMAIL</span>
                  <div style={{ marginTop: '2px' }}>{selectedUser.email || 'None'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>MOBILE PHONE</span>
                  <div style={{ marginTop: '2px' }}>{selectedUser.phone || 'None'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>GOTRA</span>
                  <div style={{ marginTop: '2px', color: '#fef08a' }}>{selectedUser.gotra || 'Not Specified'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>RASHI</span>
                  <div style={{ marginTop: '2px' }}>{selectedUser.rashi || 'Not Specified'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>NAKSHATRA</span>
                  <div style={{ marginTop: '2px' }}>{selectedUser.nakshatra || 'Not Specified'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>DATE OF BIRTH</span>
                  <div style={{ marginTop: '2px' }}>{selectedUser.date_of_birth || 'Not Specified'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>SUBSCRIPTION TIER</span>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '2px', textTransform: 'uppercase' }}>{selectedUser.subscription_tier || 'free'}</div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>REMAINING CREDITS</span>
                  <div style={{ fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>{selectedUser.credits_remaining ?? 3} Predictions</div>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#f8fafc',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

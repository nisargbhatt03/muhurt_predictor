import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Star, 
  Home,
  Sun,
  Moon,
  MoreVertical,
  Settings,
  Check,
  User,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  LogIn
} from 'lucide-react';
import { 
  fetchVastuPrediction, 
  fetchVastuBest5DaysPrediction, 
  fetchVastuPredictionForDate 
} from './gemini';
import type { PredictionResult, MuhuratInput, Best5DaysPredictionResult } from './gemini';
import { 
  ALL_MUHURTS, 
  filterTithis, 
  filterNakshatras, 
  filterVaars, 
  filterYogas, 
  filterKarans 
} from './muhurtData';
import { VedicDatePicker } from './VedicDatePicker';
import { ProfileModal } from './ProfileModal';
import { AuthModal } from './AuthModal';
import AdminPanel from './AdminPanel';
import type { UserAccount } from './AuthModal';
import { apiGetMe, removeAuthToken, getAuthToken } from './api';

// Options definitions with details
const tithiNumbers = [
  { value: '1', label: 'Pratipada (1)' },
  { value: '2', label: 'Dwitiya (2)' },
  { value: '3', label: 'Tritiya (3)' },
  { value: '4', label: 'Chaturthi (4) - Rikta' },
  { value: '5', label: 'Panchami (5)' },
  { value: '6', label: 'Shasthi (6)' },
  { value: '7', label: 'Saptami (7)' },
  { value: '8', label: 'Ashtami (8)' },
  { value: '9', label: 'Navami (9) - Rikta' },
  { value: '10', label: 'Dashami (10)' },
  { value: '11', label: 'Ekadashi (11)' },
  { value: '12', label: 'Dwadashi (12)' },
  { value: '13', label: 'Trayodashi (13)' },
  { value: '14', label: 'Chaturdashi (14) - Rikta' },
  { value: 'Purnima', label: 'Purnima (Full Moon)' },
  { value: 'Amavasya', label: 'Amavasya (New Moon)' }
];

const pakshaOptions = [
  { value: 'Shukla', label: 'Shukla Paksha (Bright Fortnight)' },
  { value: 'Krishna', label: 'Krishna Paksha (Dark Fortnight)' }
];

const getFullTithiString = (num: string, paksha: string) => {
  if (num === 'Purnima') return 'Purnima (15)';
  if (num === 'Amavasya') return 'Amavasya (30)';
  
  const found = tithiNumbers.find(t => t.value === num);
  const name = found ? found.label.split(' - ')[0] : num;
  return `${paksha} ${name}`;
};

const getShortTabDate = (fullDate: string) => {
  const parts = fullDate.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1].substring(0, 3)}`;
  }
  return fullDate;
};

const checkTithiAuspicious = (num: string, paksha: string) => {
  if (num === 'Purnima') return true;
  if (num === 'Amavasya') return false;
  
  const val = parseInt(num, 10);
  if (paksha === 'Shukla') {
    return [2, 3, 5, 7, 10, 11, 12, 13].includes(val);
  } else {
    return [2, 3, 5].includes(val);
  }
};

const nakshatraOptions = [
  { value: 'Ashwini', label: 'Ashwini - Mixed (Kshipra)', isAuspicious: false, desc: 'Quick actions, average for Vastu' },
  { value: 'Bharani', label: 'Bharani - Strictly Avoid (Ugra)', isAuspicious: false, desc: 'Fiery/Fierce star, brings disputes' },
  { value: 'Krittika', label: 'Krittika - Strictly Avoid (Mishra)', isAuspicious: false, desc: 'Sharp star, fire element dominant' },
  { value: 'Rohini', label: 'Rohini - Highly Favored (Sthira)', isAuspicious: true, desc: 'Fixed star, excellent stability' },
  { value: 'Mrigashirsha', label: 'Mrigashirsha - Good (Mridu)', isAuspicious: true, desc: 'Highly creative and peaceful' },
  { value: 'Ardra', label: 'Ardra - Strictly Avoid (Teekshna)', isAuspicious: false, desc: 'Sharp, chaotic energy' },
  { value: 'Punarvasu', label: 'Punarvasu - Mixed (Char)', isAuspicious: false, desc: 'Repetitive nature' },
  { value: 'Pushya', label: 'Pushya - Auspicious (Kshipra)', isAuspicious: true, desc: 'Excellent for all prosperity' },
  { value: 'Ashlesha', label: 'Ashlesha - Strictly Avoid (Teekshna)', isAuspicious: false, desc: 'Serpents energy, harmful' },
  { value: 'Magha', label: 'Magha - Strictly Avoid (Ugra)', isAuspicious: false, desc: 'Ancestral connection, avoid entry' },
  { value: 'Purva Phalguni', label: 'Purva Phalguni - Strictly Avoid (Ugra)', isAuspicious: false, desc: 'Fierce, bad for permanent stay' },
  { value: 'Uttara Phalguni', label: 'Uttara Phalguni - Highly Favored (Sthira)', isAuspicious: true, desc: 'Fixed star, excellent stability' },
  { value: 'Hasta', label: 'Hasta - Auspicious (Kshipra)', isAuspicious: true, desc: 'Skill and prosperity' },
  { value: 'Chitra', label: 'Chitra - Highly Favored (Mridu)', isAuspicious: true, desc: 'Gentle star, beautiful design' },
  { value: 'Swati', label: 'Swati - Mixed (Char)', isAuspicious: false, desc: 'Windy, average stability' },
  { value: 'Vishakha', label: 'Vishakha - Strictly Avoid (Mishra)', isAuspicious: false, desc: 'Splitting energies' },
  { value: 'Anuradha', label: 'Anuradha - Highly Favored (Mridu)', isAuspicious: true, desc: 'Gentle star, brings prosperity' },
  { value: 'Jyeshtha', label: 'Jyeshtha - Strictly Avoid (Teekshna)', isAuspicious: false, desc: 'Elder sister star, heavy karma' },
  { value: 'Mula', label: 'Mula - Strictly Avoid (Teekshna)', isAuspicious: false, desc: 'Root destroyer, highly delicate' },
  { value: 'Purva Ashadha', label: 'Purva Ashadha - Strictly Avoid (Ugra)', isAuspicious: false, desc: 'Fierce, bad for entry' },
  { value: 'Uttara Ashadha', label: 'Uttara Ashadha - Highly Favored (Sthira)', isAuspicious: true, desc: 'Fixed star, excellent stability' },
  { value: 'Shravana', label: 'Shravana - Auspicious (Char)', isAuspicious: true, desc: 'Knowledge and victory' },
  { value: 'Dhanishta', label: 'Dhanishta - Highly Favored (Sthira)', isAuspicious: true, desc: 'Wealth and progress' },
  { value: 'Shatabhisha', label: 'Shatabhisha - Highly Favored (Char)', isAuspicious: true, desc: 'Auspicious for initial entry' },
  { value: 'Purva Bhadrapada', label: 'Purva Bhadrapada - Strictly Avoid (Ugra)', isAuspicious: false, desc: 'Fierce, unstable' },
  { value: 'Uttara Bhadrapada', label: 'Uttara Bhadrapada - Highly Favored (Sthira)', isAuspicious: true, desc: 'Fixed star, excellent stability' },
  { value: 'Revati', label: 'Revati - Highly Favored (Mridu)', isAuspicious: true, desc: 'Gentle star, peaceful transition' }
];

const vaarOptions = [
  { value: 'Sunday', label: 'Sunday - Special cases only', isAuspicious: true, desc: 'Sun day, average; requires strong chart' },
  { value: 'Monday', label: 'Monday - Preferred', isAuspicious: true, desc: 'Moon day, peace and growth' },
  { value: 'Tuesday', label: 'Tuesday - Restricted (Avoid)', isAuspicious: false, desc: 'Mars day, fire, anger, and disputes' },
  { value: 'Wednesday', label: 'Wednesday - Preferred', isAuspicious: true, desc: 'Mercury day, intelligence and trade' },
  { value: 'Thursday', label: 'Thursday - Preferred', isAuspicious: true, desc: 'Jupiter day, wisdom and gold' },
  { value: 'Friday', label: 'Friday - Preferred', isAuspicious: true, desc: 'Venus day, luxury and family joy' },
  { value: 'Saturday', label: 'Saturday - Restricted (Avoid)', isAuspicious: false, desc: 'Saturn day, delays and cold energy' }
];

const yogaOptions = [
  { value: 'Vishkumbha', label: 'Vishkumbha - Avoid', isAuspicious: false, desc: 'Malefic first Yoga' },
  { value: 'Preeti', label: 'Preeti - Auspicious', isAuspicious: true, desc: 'Benefic, loving energy' },
  { value: 'Ayushman', label: 'Ayushman - Auspicious', isAuspicious: true, desc: 'Benefic, long life' },
  { value: 'Saubhagya', label: 'Saubhagya - Auspicious', isAuspicious: true, desc: 'Benefic, good fortune' },
  { value: 'Shobhana', label: 'Shobhana - Auspicious', isAuspicious: true, desc: 'Benefic, bright beauty' },
  { value: 'Atiganda', label: 'Atiganda - Avoid', isAuspicious: false, desc: 'Malefic, severe obstacles' },
  { value: 'Sukarma', label: 'Sukarma - Auspicious', isAuspicious: true, desc: 'Benefic, noble deeds' },
  { value: 'Dhriti', label: 'Dhriti - Auspicious', isAuspicious: true, desc: 'Benefic, determination' },
  { value: 'Shoola', label: 'Shoola - Avoid', isAuspicious: false, desc: 'Malefic, sharp pain/hurdle' },
  { value: 'Ganda', label: 'Ganda - Avoid', isAuspicious: false, desc: 'Malefic, chaotic entry' },
  { value: 'Vriddhi', label: 'Vriddhi - Auspicious', isAuspicious: true, desc: 'Benefic, growth and progress' },
  { value: 'Dhruva', label: 'Dhruva - Auspicious', isAuspicious: true, desc: 'Benefic, fixed and stable' },
  { value: 'Vyaghata', label: 'Vyaghata - Avoid', isAuspicious: false, desc: 'Malefic, threat/obstacle' },
  { value: 'Harshana', label: 'Harshana - Auspicious', isAuspicious: true, desc: 'Benefic, happiness/delight' },
  { value: 'Vajra', label: 'Vajra - Avoid', isAuspicious: false, desc: 'Malefic, lightning/severe force' },
  { value: 'Siddhi', label: 'Siddhi - Auspicious', isAuspicious: true, desc: 'Benefic, success and siddhi' },
  { value: 'Vyatipata', label: 'Vyatipata - Avoid', isAuspicious: false, desc: 'Malefic, severe calamities' },
  { value: 'Variyan', label: 'Variyan - Auspicious', isAuspicious: true, desc: 'Benefic, excellent comforts' },
  { value: 'Parigha', label: 'Parigha - Avoid', isAuspicious: false, desc: 'Malefic, iron bar obstacle' },
  { value: 'Shiva', label: 'Shiva - Auspicious', isAuspicious: true, desc: 'Benefic, pure and auspicious' },
  { value: 'Siddha', label: 'Siddha - Auspicious', isAuspicious: true, desc: 'Benefic, accomplished state' },
  { value: 'Sadhya', label: 'Sadhya - Auspicious', isAuspicious: true, desc: 'Benefic, high achievement' },
  { value: 'Shubha', label: 'Shubha - Auspicious', isAuspicious: true, desc: 'Benefic, auspicious glow' },
  { value: 'Shukla', label: 'Shukla - Auspicious', isAuspicious: true, desc: 'Benefic, pure light' },
  { value: 'Brahma', label: 'Brahma - Auspicious', isAuspicious: true, desc: 'Benefic, expansion of mind' },
  { value: 'Aindra', label: 'Aindra - Auspicious', isAuspicious: true, desc: 'Benefic, royal dignity' },
  { value: 'Vaidhriti', label: 'Vaidhriti - Avoid', isAuspicious: false, desc: 'Malefic, severe losses' }
];

const karanOptions = [
  { value: 'Bava', label: 'Bava - Auspicious', isAuspicious: true, desc: 'Creative, auspicious first Karan' },
  { value: 'Balava', label: 'Balava - Auspicious', isAuspicious: true, desc: 'Strength and good health' },
  { value: 'Kaulava', label: 'Kaulava - Auspicious', isAuspicious: true, desc: 'Family lineage and love' },
  { value: 'Taitila', label: 'Taitila - Auspicious', isAuspicious: true, desc: 'Wealth and victory' },
  { value: 'Garaja', label: 'Garaja - Auspicious', isAuspicious: true, desc: 'Agricultural and construction gain' },
  { value: 'Vanija', label: 'Vanija - Auspicious', isAuspicious: true, desc: 'Trade, wealth, and exchange' },
  { value: 'Vishti (Bhadra)', label: 'Vishti (Bhadra) - Strictly Avoided', isAuspicious: false, desc: 'Highly malefic period' },
  { value: 'Shakuni', label: 'Shakuni - Mixed/Inauspicious', isAuspicious: false, desc: 'Unstable, avoid starting construction' },
  { value: 'Chatushpada', label: 'Chatushpada - Mixed/Inauspicious', isAuspicious: false, desc: 'Animal welfare/heavy labor' },
  { value: 'Naga', label: 'Naga - Mixed/Inauspicious', isAuspicious: false, desc: 'Hidden enemies, avoid foundation' },
  { value: 'Kimstughna', label: 'Kimstughna - Mixed/Inauspicious', isAuspicious: false, desc: 'Uncertain outcomes' }
];

const DEFAULT_API_KEY = "";

const loadingTexts = [
  "Aligning directional parameters of Vedic Shastra...",
  "Querying cosmic positions of the Nakshatras...",
  "Analyzing interaction between Tithi and Karan...",
  "Consulting the ancient laws of Vedic Panchang...",
  "Evaluating suitability score for your ceremony..."
];
export default function App() {
  // Dark / Light Theme Mode State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vastu_muhurat_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('vastu_muhurat_theme', themeMode);
  }, [themeMode]);

  // Admin Panel Route View State
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // App Mode State: 'predict_date' (Single Date) vs 'predict_panchang' (Custom Limbs) vs 'predict_5days' (5-Day Range)
  const [appMode, setAppMode] = useState<'predict_date' | 'predict_panchang' | 'predict_5days'>('predict_5days');

  // Astrologer Profile Modal State (Closed by default, opens only on profile icon click)
  const [showProfileModal, setShowProfileModal] = useState(false);

  // User Account & Auth Modal State
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('muhurt_user_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPredictAction, setPendingPredictAction] = useState<'single' | 'date' | '5days' | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token === 'dummy_muhurt_token') {
      const dummyUser: UserAccount = {
        name: "Muhurt User",
        email: "muhurtp@gmail.com",
        phone: "+91 98765 43210",
        isLoggedIn: true,
      };
      setUserAccount(dummyUser);
      localStorage.setItem('muhurt_user_account', JSON.stringify(dummyUser));
      return;
    }

    if (token) {
      apiGetMe()
        .then((userData) => {
          const user: UserAccount = {
            name: userData.name,
            email: userData.email || '',
            phone: userData.phone || '',
            isLoggedIn: true,
          };
          setUserAccount(user);
          localStorage.setItem('muhurt_user_account', JSON.stringify(user));
        })
        .catch(() => {
          const saved = localStorage.getItem('muhurt_user_account');
          if (saved) {
            setUserAccount(JSON.parse(saved));
          } else {
            removeAuthToken();
            setUserAccount(null);
            localStorage.removeItem('muhurt_user_account');
          }
        });
    }
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setUserAccount(user);
    localStorage.setItem('muhurt_user_account', JSON.stringify(user));
    setShowAuthModal(false);

    // Auto-trigger prediction if user clicked Predict prior to logging in
    if (pendingPredictAction === 'single') {
      setTimeout(() => triggerSinglePredictionCore(), 100);
    } else if (pendingPredictAction === 'date') {
      setTimeout(() => triggerDateAutoPredictionCore(startDate), 100);
    } else if (pendingPredictAction === '5days') {
      setTimeout(() => handlePredict5DaysCore(), 100);
    }
    setPendingPredictAction(null);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUserAccount(null);
    localStorage.removeItem('muhurt_user_account');
  };

  // Top Popups State
  const [showMuhurtMenu, setShowMuhurtMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Muhurt Type Selection State
  const [selectedMuhurtId, setSelectedMuhurtId] = useState<number>(1);
  const selectedMuhurt = ALL_MUHURTS.find(m => m.id === selectedMuhurtId) || ALL_MUHURTS[0];

  // Dropdown Filtering Toggle State (true = show only selected options for active Muhurt)
  const [filterOnlySelected, setFilterOnlySelected] = useState<boolean>(true);

  // Helper to calculate total days in date range
  const getDaysInRange = (s: string, e: string) => {
    const start = new Date(s + 'T00:00:00');
    const end = new Date(e + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diff = Math.max(0, end.getTime() - start.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Input State: Custom Start and End Date
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const next5Days = new Date(today);
    next5Days.setDate(today.getDate() + 5);
    return next5Days.toISOString().split('T')[0];
  });

  const daysInRange = getDaysInRange(startDate, endDate);
  const maxPredictionsCount = Math.min(5, Math.max(1, daysInRange));

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    if (newEnd < startDate) {
      setStartDate(newEnd);
      setEndDate(newEnd);
    } else {
      setEndDate(newEnd);
    }
  };

  const [selectedTithiNum, setSelectedTithiNum] = useState('5');
  const [selectedTithiPaksha, setSelectedTithiPaksha] = useState('Shukla');
  const selectedTithi = getFullTithiString(selectedTithiNum, selectedTithiPaksha);
  const [selectedNakshatra, setSelectedNakshatra] = useState(nakshatraOptions[0].value);
  const [selectedVaar, setSelectedVaar] = useState(vaarOptions[1].value); // Monday
  const [selectedYoga, setSelectedYoga] = useState(yogaOptions[1].value);
  const [selectedKaran, setSelectedKaran] = useState(karanOptions[0].value);

  // API Key State
  const [apiKey] = useState<string>(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    return localStorage.getItem('vastu_muhurat_api_key') || DEFAULT_API_KEY;
  });

  // Dynamically Filtered Options Lists
  const availableTithis = filterOnlySelected 
    ? filterTithis(selectedMuhurtId, selectedTithiPaksha, tithiNumbers)
    : tithiNumbers;

  const availableNakshatras = filterOnlySelected 
    ? filterNakshatras(selectedMuhurtId, nakshatraOptions)
    : nakshatraOptions;

  const availableVaars = filterOnlySelected 
    ? filterVaars(selectedMuhurtId, vaarOptions)
    : vaarOptions;

  const availableYogas = filterOnlySelected 
    ? filterYogas(selectedMuhurtId, yogaOptions)
    : yogaOptions;

  const availableKarans = filterOnlySelected 
    ? filterKarans(selectedMuhurtId, karanOptions)
    : karanOptions;

  // Auto-adjust selected values if currently selected item is not in filtered options list
  useEffect(() => {
    if (filterOnlySelected) {
      const validTithis = filterTithis(selectedMuhurtId, selectedTithiPaksha, tithiNumbers);
      if (validTithis.length > 0 && !validTithis.some(t => t.value === selectedTithiNum)) {
        setSelectedTithiNum(validTithis[0].value);
      }

      const validNakshatras = filterNakshatras(selectedMuhurtId, nakshatraOptions);
      if (validNakshatras.length > 0 && !validNakshatras.some(n => n.value === selectedNakshatra)) {
        setSelectedNakshatra(validNakshatras[0].value);
      }

      const validVaars = filterVaars(selectedMuhurtId, vaarOptions);
      if (validVaars.length > 0 && !validVaars.some(v => v.value === selectedVaar)) {
        setSelectedVaar(validVaars[0].value);
      }

      const validYogas = filterYogas(selectedMuhurtId, yogaOptions);
      if (validYogas.length > 0 && !validYogas.some(y => y.value === selectedYoga)) {
        setSelectedYoga(validYogas[0].value);
      }

      const validKarans = filterKarans(selectedMuhurtId, karanOptions);
      if (validKarans.length > 0 && !validKarans.some(k => k.value === selectedKaran)) {
        setSelectedKaran(validKarans[0].value);
      }
    }
  }, [selectedMuhurtId, selectedTithiPaksha, filterOnlySelected]);

  // Predictions state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [predictionMode, setPredictionMode] = useState<'single' | 'multi'>('single');
  const [multiResult, setMultiResult] = useState<Best5DaysPredictionResult | null>(null);
  const [activeMultiTab, setActiveMultiTab] = useState<string>('overview');

  // Loading text rotation
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingTexts.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const checkUserLoggedIn = (actionType: 'single' | 'date' | '5days'): boolean => {
    if (!userAccount || !userAccount.isLoggedIn) {
      setPendingPredictAction(actionType);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const triggerSinglePrediction = async () => {
    if (!checkUserLoggedIn('single')) return;
    await triggerSinglePredictionCore();
  };

  const triggerSinglePredictionCore = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setMultiResult(null);
    setPredictionMode('single');

    const input: MuhuratInput = {
      muhurtTypeId: selectedMuhurt.id,
      muhurtNameEn: selectedMuhurt.nameEn,
      muhurtNameGu: selectedMuhurt.nameGu,
      tithi: selectedTithi,
      nakshatra: selectedNakshatra,
      vaar: selectedVaar,
      yoga: selectedYoga,
      karan: selectedKaran
    };

    try {
      const prediction = await fetchVastuPrediction(input, apiKey);
      setResult(prediction);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to contact the astrological server. Please check your internet connection and API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDateAutoPrediction = async (targetDateStr: string) => {
    if (!checkUserLoggedIn('date')) return;
    await triggerDateAutoPredictionCore(targetDateStr);
  };

  const triggerDateAutoPredictionCore = async (targetDateStr: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setMultiResult(null);
    setPredictionMode('single');

    const input: MuhuratInput = {
      muhurtTypeId: selectedMuhurt.id,
      muhurtNameEn: selectedMuhurt.nameEn,
      muhurtNameGu: selectedMuhurt.nameGu,
      tithi: selectedTithi,
      nakshatra: selectedNakshatra,
      vaar: selectedVaar,
      yoga: selectedYoga,
      karan: selectedKaran
    };

    try {
      const prediction = await fetchVastuPredictionForDate(targetDateStr, input, apiKey);
      setResult(prediction);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to contact the astrological server. Please check your internet connection and API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict5Days = async () => {
    if (!checkUserLoggedIn('5days')) return;
    await handlePredict5DaysCore();
  };

  const handlePredict5DaysCore = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setMultiResult(null);
    setPredictionMode('multi');
    setActiveMultiTab('overview');

    const input: MuhuratInput = {
      muhurtTypeId: selectedMuhurt.id,
      muhurtNameEn: selectedMuhurt.nameEn,
      muhurtNameGu: selectedMuhurt.nameGu,
      tithi: selectedTithi,
      nakshatra: selectedNakshatra,
      vaar: selectedVaar,
      yoga: selectedYoga,
      karan: selectedKaran
    };

    try {
      const forecast = await fetchVastuBest5DaysPrediction(startDate, endDate, input, apiKey);
      setMultiResult(forecast);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to contact the astrological server. Please check your internet connection and API key.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get status metadata of current inputs
  const currentNakshatraObj = nakshatraOptions.find(o => o.value === selectedNakshatra);
  const currentVaarObj = vaarOptions.find(o => o.value === selectedVaar);
  const currentYogaObj = yogaOptions.find(o => o.value === selectedYoga);
  const currentKaranObj = karanOptions.find(o => o.value === selectedKaran);

  // Circumference for the radial score
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result
    ? circumference - (result.auspiciousnessScore / 100) * circumference
    : circumference;

  if (isAdminView) {
    return (
      <AdminPanel 
        onBackToApp={() => {
          window.history.pushState({}, '', '/');
          setIsAdminView(false);
        }} 
      />
    );
  }

  return (
    <>
      <div className="stars-overlay"></div>

      {/* Astrologer Profile Modal Popup (Initially Open Every Time) */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* User Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={userAccount}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
      
      <div className="app-container">
        
        {/* Global SVG gradients definition */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#df9f28" />
              <stop offset="100%" stopColor="#ffd700" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Header */}
        <header className="app-header">
          {/* Header Top Right Controls */}
          <div className="header-top-actions">
            
            {/* User Account / Sign In & Sign Up Button */}
            <button 
              type="button" 
              className="icon-action-btn"
              onClick={() => setShowAuthModal(true)}
              title={userAccount?.isLoggedIn ? `Account (${userAccount.name})` : "Sign In / Sign Up"}
              aria-label="User Account"
              style={userAccount?.isLoggedIn ? { background: 'rgba(255, 215, 0, 0.2)', border: '1px solid var(--gold-primary)' } : {}}
            >
              {userAccount?.isLoggedIn ? (
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold-primary)' }}>
                  {userAccount.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <LogIn size={18} />
              )}
            </button>

            {/* Consultant Profile Icon Button */}
            <button 
              type="button" 
              className="icon-action-btn"
              onClick={() => setShowProfileModal(true)}
              title="Astrologer Profile Card"
              aria-label="Astrologer Profile"
            >
              <User size={20} />
            </button>

            {/* Settings Icon Button */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="icon-action-btn"
                onClick={() => {
                  setShowSettingsMenu(prev => !prev);
                  setShowMuhurtMenu(false);
                }}
                title="Settings & Options"
                aria-label="Settings Menu"
              >
                <Settings size={20} />
              </button>

              {/* Settings Dropdown Popup Menu */}
              {showSettingsMenu && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 190 }}
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  <div className="muhurt-popup-menu" style={{ width: '320px' }}>
                    <div className="muhurt-menu-header">
                      Settings & Options
                    </div>

                    <div className="muhurt-menu-list" style={{ padding: '8px' }}>
                      


                      {/* Theme Toggle */}
                      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                          APPEARANCE THEME
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className={`muhurt-menu-item ${themeMode === 'dark' ? 'active' : ''}`}
                            style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: '0.82rem' }}
                            onClick={() => setThemeMode('dark')}
                          >
                            <Moon size={14} style={{ marginRight: '4px' }} /> Dark Mode
                          </button>
                          <button
                            type="button"
                            className={`muhurt-menu-item ${themeMode === 'light' ? 'active' : ''}`}
                            style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: '0.82rem' }}
                            onClick={() => setThemeMode('light')}
                          >
                            <Sun size={14} style={{ marginRight: '4px' }} /> Light Mode
                          </button>
                        </div>
                      </div>

                      {/* Prediction Mode Switcher */}
                      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                          PREDICTION MODE
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            type="button"
                            className={`muhurt-menu-item ${appMode === 'predict_date' ? 'active' : ''}`}
                            onClick={() => {
                              setAppMode('predict_date');
                              setShowSettingsMenu(false);
                            }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>1. Predict by Specific Date</div>
                              <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>Auto-calculates Panchang for a target date</div>
                            </div>
                            {appMode === 'predict_date' && <Check size={16} color="#ffd700" />}
                          </button>
                          <button
                            type="button"
                            className={`muhurt-menu-item ${appMode === 'predict_panchang' ? 'active' : ''}`}
                            onClick={() => {
                              setAppMode('predict_panchang');
                              setShowSettingsMenu(false);
                            }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>2. Predict by Custom Panchang</div>
                              <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>Evaluate Tithi, Nakshatra, Vaar, Yoga, Karan</div>
                            </div>
                            {appMode === 'predict_panchang' && <Check size={16} color="#ffd700" />}
                          </button>
                          <button
                            type="button"
                            className={`muhurt-menu-item ${appMode === 'predict_5days' ? 'active' : ''}`}
                            onClick={() => {
                              setAppMode('predict_5days');
                              setShowSettingsMenu(false);
                            }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>3. Date Range Forecast</div>
                              <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>Forecast top auspicious dates in range (up to 5)</div>
                            </div>
                            {appMode === 'predict_5days' && <Check size={16} color="#ffd700" />}
                          </button>
                        </div>
                      </div>

                      {/* Options Filter Switch */}
                      <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                          OPTIONS FILTER
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="checkbox" 
                            checked={filterOnlySelected}
                            onChange={(e) => setFilterOnlySelected(e.target.checked)}
                            style={{ accentColor: '#ffd700', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>Display only Muhurt-approved options</span>
                        </label>
                      </div>



                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3-Dot Menu Button */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="icon-action-btn"
                onClick={() => {
                  setShowMuhurtMenu(prev => !prev);
                  setShowSettingsMenu(false);
                }}
                title="Select Muhurt Ceremony"
                aria-label="Muhurt Options Menu"
              >
                <MoreVertical size={20} />
              </button>

              {/* Ceremony Popup Menu Dropdown */}
              {showMuhurtMenu && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 190 }}
                    onClick={() => setShowMuhurtMenu(false)}
                  />
                  <div className="muhurt-popup-menu">
                    <div className="muhurt-menu-header">Select Muhurt Ceremony</div>
                    <div className="muhurt-menu-list">
                      {ALL_MUHURTS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`muhurt-menu-item ${selectedMuhurtId === m.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedMuhurtId(m.id);
                            setShowMuhurtMenu(false);
                          }}
                        >
                          <span>{m.nameGu} — {m.nameEn}</span>
                          {selectedMuhurtId === m.id && <Check size={16} color="#ffd700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          <div className="logo-icon">
            <Compass size={40} className="placeholder-icon" style={{ animationDuration: '30s' }} />
          </div>
          <h1 className="app-title">अथ शुभमुहूर्त्तम्</h1>
          <p className="app-subtitle">
            Calculate and predict auspicious astrological alignment for Griha Pravesha, Udgatana, Vidyarambha, Vastu Shanti, and all 9 sacred ceremonies using classical Indian Vedic Astrology.
          </p>



        </header>

        {/* Main Interface Grid */}
        <main className="main-grid">
          
          {/* Form Side */}
          <section className="predictor-card" aria-labelledby="form-section-title">
            <h2 id="form-section-title" className="section-title">
              <Sparkles size={20} /> 
              {appMode === 'predict_date' && `${selectedMuhurt.nameEn} (${selectedMuhurt.nameGu}) Date Predict`}
              {appMode === 'predict_panchang' && `${selectedMuhurt.nameEn} (${selectedMuhurt.nameGu}) Custom Panchang Predict`}
              {appMode === 'predict_5days' && `${selectedMuhurt.nameEn} (${selectedMuhurt.nameGu}) Range Forecast`}
            </h2>

            {/* Option 1: Single Date Auto-Fetch Mode */}
            {appMode === 'predict_date' && (
              <div className="input-group">
                <VedicDatePicker
                  label={`Target Date for ${selectedMuhurt.nameEn} Auto-Panchang Predict`}
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                />
                <p className="rule-highlight" style={{ marginTop: '10px' }}>
                  <strong>Option 1 (Predict by Date):</strong> Pick any date to automatically calculate its complete Indian Panchang (Tithi, Nakshatra, Vaar, Yoga, Karan) and predict suitability for {selectedMuhurt.nameEn}.
                </p>
              </div>
            )}

            {/* Option 2: Custom Panchang Limbs Mode */}
            {appMode === 'predict_panchang' && (
              <>
                <p className="rule-highlight" style={{ marginBottom: '16px' }}>
                  <strong>Option 2 (Custom Panchang):</strong> Select specific Tithi, Nakshatra, Vaar, Yoga, and Karan to evaluate suitability score for custom Panchang parameters.
                </p>

                {/* Tithi */}
                <div className="input-group">
                  <label htmlFor="tithi-select" className="input-label">
                    Tithi (Lunar Day)
                    <span className="input-info-hint">
                      {checkTithiAuspicious(selectedTithiNum, selectedTithiPaksha) ? "✓ Good" : "✗ Avoid"}
                    </span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="select-wrapper">
                      <select 
                        id="tithi-select"
                        className="custom-select"
                        value={selectedTithiNum}
                        onChange={(e) => setSelectedTithiNum(e.target.value)}
                      >
                        {availableTithis.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTithiNum !== 'Purnima' && selectedTithiNum !== 'Amavasya' && (
                      <div className="select-wrapper">
                        <select 
                          id="tithi-paksha-select"
                          className="custom-select"
                          value={selectedTithiPaksha}
                          onChange={(e) => setSelectedTithiPaksha(e.target.value)}
                          aria-label="Select Paksha"
                        >
                          {pakshaOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nakshatra */}
                <div className="input-group">
                  <label htmlFor="nakshatra-select" className="input-label">
                    Nakshatra (Lunar Mansion)
                    <span className="input-info-hint">
                      {currentNakshatraObj?.isAuspicious ? "✓ Good" : "✗ Avoid"}
                    </span>
                  </label>
                  <div className="select-wrapper">
                    <select 
                      id="nakshatra-select"
                      className="custom-select"
                      value={selectedNakshatra}
                      onChange={(e) => setSelectedNakshatra(e.target.value)}
                    >
                      {availableNakshatras.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vaar */}
                <div className="input-group">
                  <label htmlFor="vaar-select" className="input-label">
                    Vaar (Weekday)
                    <span className="input-info-hint">
                      {currentVaarObj?.isAuspicious ? "✓ Good" : "✗ Avoid"}
                    </span>
                  </label>
                  <div className="select-wrapper">
                    <select 
                      id="vaar-select"
                      className="custom-select"
                      value={selectedVaar}
                      onChange={(e) => setSelectedVaar(e.target.value)}
                    >
                      {availableVaars.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Yoga */}
                <div className="input-group">
                  <label htmlFor="yoga-select" className="input-label">
                    Yoga (Luni-Solar Combo)
                    <span className="input-info-hint">
                      {currentYogaObj?.isAuspicious ? "✓ Good" : "✗ Avoid"}
                    </span>
                  </label>
                  <div className="select-wrapper">
                    <select 
                      id="yoga-select"
                      className="custom-select"
                      value={selectedYoga}
                      onChange={(e) => setSelectedYoga(e.target.value)}
                    >
                      {availableYogas.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Karan */}
                <div className="input-group">
                  <label htmlFor="karan-select" className="input-label">
                    Karan (Half of Tithi)
                    <span className="input-info-hint">
                      {currentKaranObj?.isAuspicious ? "✓ Good" : "✗ Avoid"}
                    </span>
                  </label>
                  <div className="select-wrapper">
                    <select 
                      id="karan-select"
                      className="custom-select"
                      value={selectedKaran}
                      onChange={(e) => setSelectedKaran(e.target.value)}
                    >
                      {availableKarans.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Option 3: Date Range Forecast Mode */}
            {appMode === 'predict_5days' && (
              <div className="input-group">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <VedicDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => handleStartDateChange(newDate)}
                  />
                  <VedicDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newDate) => handleEndDateChange(newDate)}
                    alignRight={true}
                  />
                </div>
                <p className="rule-highlight" style={{ marginTop: '14px' }}>
                  <strong>Option 3 (Range Forecast):</strong> Scans selected range ({startDate} to {endDate}, {daysInRange} day{daysInRange > 1 ? 's' : ''}) to calculate and rank up to {maxPredictionsCount} best auspicious date{maxPredictionsCount > 1 ? 's' : ''} strictly within your selected range.
                </p>
              </div>
            )}

            {/* Predict Trigger Button */}
            <div className="predict-buttons-container" style={{ gridTemplateColumns: '1fr', marginTop: '20px' }}>
              {appMode === 'predict_date' && (
                <button 
                  type="button" 
                  className="predict-button"
                  onClick={() => triggerDateAutoPrediction(startDate)}
                  disabled={isLoading}
                >
                  <Compass size={20} />
                  {isLoading && predictionMode === 'single'
                    ? "Predicting Muhurt..."
                    : "Predict Muhurt"
                  }
                </button>
              )}

              {appMode === 'predict_panchang' && (
                <button 
                  type="button" 
                  className="predict-button"
                  onClick={triggerSinglePrediction}
                  disabled={isLoading}
                >
                  <Compass size={20} />
                  {isLoading && predictionMode === 'single'
                    ? "Predicting Muhurt..."
                    : "Predict Muhurt"
                  }
                </button>
              )}

              {appMode === 'predict_5days' && (
                <button 
                  type="button" 
                  className="predict-button"
                  onClick={handlePredict5Days}
                  disabled={isLoading}
                >
                  <Sparkles size={20} style={{ color: 'inherit' }} />
                  {isLoading && predictionMode === 'multi'
                    ? "Predicting Muhurt..."
                    : "Predict Muhurt"
                  }
                </button>
              )}
            </div>
          </section>

          {/* Results Side */}
          <section className="predictor-card" aria-labelledby="results-section-title">
            <h2 id="results-section-title" className="section-title">
              <Home size={20} /> {selectedMuhurt.nameEn} ({selectedMuhurt.nameGu}) Report
            </h2>

            {/* Loading state */}
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">{loadingTexts[loadingMsgIdx]}</p>
              </div>
            )}

            {/* Error Message / Device Credit Limit Notice */}
            {errorMsg && !isLoading && (
              <div className="credit-exhausted-card" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 className="credit-exhausted-title" style={{ color: '#ef4444' }}>
                  <ShieldAlert size={20} /> Prediction Notice
                </h3>
                <p className="credit-exhausted-desc" style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {errorMsg}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <a 
                    href="tel:+919924848727"
                    className="dev-btn"
                    style={{ textDecoration: 'none', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <PhoneCall size={14} /> Call Astrologer Yashesh Joshi (+91 99248 48727)
                  </a>
                </div>
              </div>
            )}

            {/* No result yet */}
            {!isLoading && !result && !multiResult && !errorMsg && (
              <div className="results-placeholder">
                <Compass size={64} className="placeholder-icon" />
                <p style={{ fontFamily: 'var(--heading-font)', fontSize: '1.2rem', color: 'var(--gold-primary)', marginBottom: '8px' }}>
                  Awaiting Stellar Input
                </p>
                <p style={{ fontSize: '0.85rem', maxWidth: '280px' }}>
                  Select your Panchang parameters and click Predict to view detailed {selectedMuhurt.nameEn} ({selectedMuhurt.nameGu}) astrological suitability scores, limb analysis, and Vedic remedies.
                </p>
              </div>
            )}

            {/* Single Day Result Found */}
            {!isLoading && result && predictionMode === 'single' && (
              <div className="results-card">
                
                {/* Score section */}
                <div className="score-section">
                  <div className="score-radial">
                    <svg className="score-svg">
                      <circle 
                        className="score-circle-bg" 
                        cx="70" 
                        cy="70" 
                        r={radius} 
                      />
                      <circle 
                        className="score-circle-val" 
                        cx="70" 
                        cy="70" 
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <div className="score-text">
                      <span className="score-number">{result.auspiciousnessScore}%</span>
                      <span className="score-label">Score</span>
                    </div>
                  </div>
                  {result.date && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--gold-secondary)', fontWeight: 700, marginBottom: '4px' }}>
                      Date: {result.date}
                    </div>
                  )}
                  <div className="verdict-badge">{result.verdict}</div>
                  <p className="verdict-desc">{result.overallAnalysis}</p>
                </div>

                {/* Breakdown by Limb */}
                <div className="limbs-report">
                  
                  {/* Tithi */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Tithi (Lunar Day)</span>
                      <span className="limb-value-badge">{result.tithi || selectedTithi}</span>
                    </div>
                    <p className="limb-detail-text">{result.tithiAnalysis}</p>
                  </div>

                  {/* Nakshatra */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Nakshatra</span>
                      <span className="limb-value-badge">{result.nakshatra || selectedNakshatra}</span>
                    </div>
                    <p className="limb-detail-text">{result.nakshatraAnalysis}</p>
                  </div>

                  {/* Vaar */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Vaar (Weekday)</span>
                      <span className="limb-value-badge">{result.vaar || selectedVaar}</span>
                    </div>
                    <p className="limb-detail-text">{result.vaarAnalysis}</p>
                  </div>

                  {/* Yoga */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Yoga</span>
                      <span className="limb-value-badge">{result.yoga || selectedYoga}</span>
                    </div>
                    <p className="limb-detail-text">{result.yogaAnalysis}</p>
                  </div>

                  {/* Karan */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Karan</span>
                      <span className="limb-value-badge">{result.karan || selectedKaran}</span>
                    </div>
                    <p className="limb-detail-text">{result.karanAnalysis}</p>
                  </div>

                </div>

                {/* Vastu Remedies / Safeguards */}
                {result.remedies && result.remedies.length > 0 && (
                  <div className="remedies-section">
                    <h3 className="remedies-title">
                      <Star size={16} /> Astrological {selectedMuhurt.nameEn} Remedies
                    </h3>
                    <ul className="remedies-list">
                      {result.remedies.map((remedy, i) => (
                        <li key={i} className="remedy-item">
                          <Sparkles size={12} style={{ marginTop: '3px' }} />
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}

            {/* Multi-Day Results Found */}
            {!isLoading && multiResult && predictionMode === 'multi' && (
              <div className="multi-results-container">
                {/* Tabs Bar */}
                <div className="tabs-bar">
                  <button 
                    type="button" 
                    className={`tab-btn ${activeMultiTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveMultiTab('overview')}
                  >
                    Timeline Overview
                  </button>
                  {multiResult.predictions.map((pred) => (
                    <button 
                      key={pred.rank}
                      type="button" 
                      className={`tab-btn ${activeMultiTab === `rank-${pred.rank}` ? 'active' : ''}`}
                      onClick={() => setActiveMultiTab(`rank-${pred.rank}`)}
                    >
                      #{pred.rank} ({getShortTabDate(pred.date)})
                    </button>
                  ))}
                </div>

                {/* Tab Content: Overview */}
                {activeMultiTab === 'overview' && (
                  <div className="timeline-overview">
                    <p className="timeline-subtitle">
                      Top {multiResult.predictions.length} {selectedMuhurt.nameEn} ({selectedMuhurt.nameGu}) recommendation{multiResult.predictions.length > 1 ? 's' : ''} strictly between {startDate} and {endDate}:
                    </p>
                    <div className="timeline-list">
                      {multiResult.predictions.map((pred) => {
                        let healthClass = 'status-low';
                        if (pred.auspiciousnessScore >= 75) {
                          healthClass = 'status-high';
                        } else if (pred.auspiciousnessScore >= 50) {
                          healthClass = 'status-medium';
                        }

                        return (
                          <div 
                            key={pred.rank} 
                            className={`timeline-card ${healthClass}`}
                            onClick={() => setActiveMultiTab(`rank-${pred.rank}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setActiveMultiTab(`rank-${pred.rank}`);
                              }
                            }}
                          >
                            <div className="timeline-card-header">
                              <span className="timeline-day-label">Rank {pred.rank}: {pred.date} ({pred.vaar})</span>
                              <span className="timeline-score-badge">{pred.auspiciousnessScore}%</span>
                            </div>
                            <div className="timeline-card-meta">
                              <span className="timeline-meta-item">Tithi: {pred.tithi}</span>
                              <span className="timeline-meta-item">Nakshatra: {pred.nakshatra}</span>
                              <span className="timeline-meta-item">Yoga: {pred.yoga}</span>
                            </div>
                            <div className="timeline-progress-bar-bg">
                              <div 
                                className="timeline-progress-bar-fill" 
                                style={{ width: `${pred.auspiciousnessScore}%` }}
                              ></div>
                            </div>
                            <div className="timeline-verdict">{pred.verdict}</div>
                            <p className="timeline-summary">{pred.overallAnalysis}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab Content: Individual Day Details */}
                {multiResult.predictions.map((pred) => {
                  if (activeMultiTab !== `rank-${pred.rank}`) return null;
                  const scoreOffset = circumference - (pred.auspiciousnessScore / 100) * circumference;

                  return (
                    <div key={pred.rank} className="results-card animated fadeIn">
                      
                      {/* Score section */}
                      <div className="score-section">
                        <h3 style={{ fontFamily: 'var(--heading-font)', color: 'var(--gold-primary)', margin: '0 0 16px', fontSize: '1.2rem' }}>
                          Recommendation Rank #{pred.rank}
                        </h3>
                        <div className="score-radial">
                          <svg className="score-svg">
                            <circle 
                              className="score-circle-bg" 
                              cx="70" 
                              cy="70" 
                              r={radius} 
                            />
                            <circle 
                              className="score-circle-val" 
                              cx="70" 
                              cy="70" 
                              r={radius}
                              strokeDasharray={circumference}
                              strokeDashoffset={scoreOffset}
                            />
                          </svg>
                          <div className="score-text">
                            <span className="score-number">{pred.auspiciousnessScore}%</span>
                            <span className="score-label">Score</span>
                          </div>
                        </div>
                        <div className="verdict-badge" style={{ fontSize: '1.1rem' }}>{pred.date} ({pred.vaar})</div>
                        <div className="verdict-badge" style={{ color: 'var(--text-primary)', textShadow: 'none', fontSize: '1.1rem', marginTop: '4px' }}>
                          {pred.verdict}
                        </div>
                        <p className="verdict-desc" style={{ marginTop: '12px' }}>{pred.overallAnalysis}</p>
                      </div>

                      {/* Breakdown by Limb */}
                      <div className="limbs-report">
                        <div className="limb-detail-item">
                          <div className="limb-detail-header">
                            <span className="limb-detail-name">Tithi (Lunar Day)</span>
                            <span className="limb-value-badge">{pred.tithi}</span>
                          </div>
                          <p className="limb-detail-text">{pred.tithiAnalysis}</p>
                        </div>

                        <div className="limb-detail-item">
                          <div className="limb-detail-header">
                            <span className="limb-detail-name">Nakshatra</span>
                            <span className="limb-value-badge">{pred.nakshatra}</span>
                          </div>
                          <p className="limb-detail-text">{pred.nakshatraAnalysis}</p>
                        </div>

                        <div className="limb-detail-item">
                          <div className="limb-detail-header">
                            <span className="limb-detail-name">Vaar (Weekday)</span>
                            <span className="limb-value-badge">{pred.vaar}</span>
                          </div>
                          <p className="limb-detail-text">{pred.vaarAnalysis}</p>
                        </div>

                        <div className="limb-detail-item">
                          <div className="limb-detail-header">
                            <span className="limb-detail-name">Yoga</span>
                            <span className="limb-value-badge">{pred.yoga}</span>
                          </div>
                          <p className="limb-detail-text">{pred.yogaAnalysis}</p>
                        </div>

                        <div className="limb-detail-item">
                          <div className="limb-detail-header">
                            <span className="limb-detail-name">Karan</span>
                            <span className="limb-value-badge">{pred.karan}</span>
                          </div>
                          <p className="limb-detail-text">{pred.karanAnalysis}</p>
                        </div>
                      </div>

                      {/* Remedies */}
                      {pred.remedies && pred.remedies.length > 0 && (
                        <div className="remedies-section">
                          <h3 className="remedies-title">
                            <Star size={16} /> Astrological {selectedMuhurt.nameEn} Remedies
                          </h3>
                          <ul className="remedies-list">
                            {pred.remedies.map((remedy, i) => (
                              <li key={i} className="remedy-item">
                                <Sparkles size={12} style={{ marginTop: '3px' }} />
                                <span>{remedy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}
            
          </section>

        </main>

        {/* Footer info */}
        <footer style={{ marginTop: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <p>© {new Date().getFullYear()} Vedic Muhurt Predictor. Multi-Muhurt Astrological System.</p>
        </footer>

      </div>
    </>
  );
}

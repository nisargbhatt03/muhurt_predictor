import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  AlertTriangle, 
  Settings, 
  Star, 
  Home
} from 'lucide-react';
import { fetchVastuPrediction, fetchVastuBest5DaysPrediction } from './gemini';
import type { PredictionResult, MuhuratInput, Best5DaysPredictionResult } from './gemini';

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
  { value: 'Monday', label: 'Monday - Preferred', isAuspicious: true, desc: 'Moon day, peace and growth' },
  { value: 'Tuesday', label: 'Tuesday - Restricted (Avoid)', isAuspicious: false, desc: 'Mars day, fire, anger, and disputes' },
  { value: 'Wednesday', label: 'Wednesday - Preferred', isAuspicious: true, desc: 'Mercury day, intelligence and trade' },
  { value: 'Thursday', label: 'Thursday - Preferred', isAuspicious: true, desc: 'Jupiter day, wisdom and gold' },
  { value: 'Friday', label: 'Friday - Preferred', isAuspicious: true, desc: 'Venus day, luxury and family joy' },
  { value: 'Saturday', label: 'Saturday - Restricted (Avoid)', isAuspicious: false, desc: 'Saturn day, delays and cold energy' },
  { value: 'Sunday', label: 'Sunday - Special cases only', isAuspicious: true, desc: 'Sun day, average; requires strong chart' }
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
  "Aligning directional parameters of Vastu Shastra...",
  "Querying cosmic positions of the Nakshatras...",
  "Analyzing interaction between Tithi and Karan...",
  "Consulting the ancient laws of Vedic Panchang...",
  "Evaluating suitability score for your home..."
];

export default function App() {
  // Input State
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTithiNum, setSelectedTithiNum] = useState('2');
  const [selectedTithiPaksha, setSelectedTithiPaksha] = useState('Shukla');
  const selectedTithi = getFullTithiString(selectedTithiNum, selectedTithiPaksha);
  const [selectedNakshatra, setSelectedNakshatra] = useState(nakshatraOptions[0].value);
  const [selectedVaar, setSelectedVaar] = useState(vaarOptions[0].value);
  const [selectedYoga, setSelectedYoga] = useState(yogaOptions[0].value);
  const [selectedKaran, setSelectedKaran] = useState(karanOptions[0].value);

  // App & Device state
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('vastu_muhurat_credits');
    if (saved === null) return 3;
    const parsed = parseInt(saved, 10);
    if (isNaN(parsed) || parsed > 3) return 3;
    return parsed;
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    return localStorage.getItem('vastu_muhurat_api_key') || DEFAULT_API_KEY;
  });

  // Predictions state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [predictionMode, setPredictionMode] = useState<'single' | 'multi'>('single');
  const [multiResult, setMultiResult] = useState<Best5DaysPredictionResult | null>(null);
  const [activeMultiTab, setActiveMultiTab] = useState<string>('overview');

  // Modals state
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

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

  const handlePredict = async () => {
    if (credits <= 0) {
      setErrorMsg("You have run out of prediction credits on this device.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setMultiResult(null);
    setPredictionMode('single');

    const input: MuhuratInput = {
      tithi: selectedTithi,
      nakshatra: selectedNakshatra,
      vaar: selectedVaar,
      yoga: selectedYoga,
      karan: selectedKaran
    };

    try {
      const prediction = await fetchVastuPrediction(input, apiKey);
      setResult(prediction);
      
      // Deduct credit
      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem('vastu_muhurat_credits', newCredits.toString());
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to contact the astrological server. Please check your internet connection and API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict5Days = async () => {
    if (credits <= 0) {
      setErrorMsg("You have run out of prediction credits on this device.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setMultiResult(null);
    setPredictionMode('multi');
    setActiveMultiTab('overview');

    const input: MuhuratInput = {
      tithi: selectedTithi,
      nakshatra: selectedNakshatra,
      vaar: selectedVaar,
      yoga: selectedYoga,
      karan: selectedKaran
    };

    try {
      const forecast = await fetchVastuBest5DaysPrediction(startDate, input, apiKey);
      setMultiResult(forecast);
      
      // Deduct credit
      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem('vastu_muhurat_credits', newCredits.toString());
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to contact the astrological server. Please check your internet connection and API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setApiKey(tempKey);
    localStorage.setItem('vastu_muhurat_api_key', tempKey);
    setShowDevPanel(false);
  };

  const handleResetCredits = () => {
    setCredits(3);
    localStorage.setItem('vastu_muhurat_credits', '3');
    setErrorMsg(null);
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

  return (
    <>
      <div className="stars-overlay"></div>
      
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
          <div className="logo-icon">
            <Compass size={40} className="placeholder-icon" style={{ animationDuration: '30s' }} />
          </div>
          <h1 className="app-title">Vastu Muhurat Predictor</h1>
          <p className="app-subtitle">
            Calculate and predict auspicious astrological alignment for house construction and Griha Pravesh using classical Indian Vedic Astrology.
          </p>
        </header>

        {/* Device Credits Indicator */}
        <div className="credits-bar">
          <div className="credits-info">
            <Star size={16} color="#ffd700" />
            <span>Device Credits Remaining: <span className="credits-count">{credits} / 3</span></span>
          </div>
          <div className="credits-dots">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`dot ${credits >= i + 1 ? 'active' : ''}`}></div>
            ))}
          </div>
        </div>

        {/* Main Interface Grid */}
        <main className="main-grid">
          
          {/* Form Side */}
          <section className="predictor-card" aria-labelledby="form-section-title">
            <h2 id="form-section-title" className="section-title">
              <Sparkles size={20} /> Select Panchang Limbs
            </h2>
            
            {/* Start Date */}
            <div className="input-group">
              <label htmlFor="start-date-input" className="input-label">
                Start Calendar Date
              </label>
              <input 
                id="start-date-input"
                type="date" 
                className="text-input-field" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ marginTop: '0' }}
              />
              <p className="rule-highlight">
                <strong>Reference Date:</strong> Reference starting calendar date to find the 5 best Vastu Muhurats in the next 1 year.
              </p>
            </div>

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
                    {tithiNumbers.map(option => (
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
              <p className="rule-highlight">
                <strong>Astrology Rule:</strong> Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Dwadashi, and Shukla Trayodashi are favored. Avoid Rikta (4, 9, 14) and Amavasya.
              </p>
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
                  {nakshatraOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rule-highlight">
                <strong>Astrology Rule:</strong> Fixed (Sthira) stars (Rohini, Uttaras) & Gentle (Mridu) stars (Anuradha, Chitra, Revati, Dhanishta, Shatabhisha) bring long-term stability.
              </p>
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
                  {vaarOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rule-highlight">
                <strong>Astrology Rule:</strong> Monday, Wednesday, Thursday, and Friday are highly preferred. Strictly restrict Tuesdays and Saturdays.
              </p>
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
                  {yogaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rule-highlight">
                <strong>Astrology Rule:</strong> Siddhi, Amrita, Shubha, Shukla, Brahma, and Aindra enhance prosperity. Avoid malefic Vyatipata, Vaidhriti, and Visha.
              </p>
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
                  {karanOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rule-highlight">
                <strong>Astrology Rule:</strong> Benefic Karans like Bava, Balava, Kaulava, Taitila, Garaja, and Vanija are suitable. Vishti (Bhadra Karan) must be strictly avoided.
              </p>
            </div>

            {/* Predict Trigger buttons */}
            <div className="predict-buttons-container">
              <button 
                type="button" 
                className="predict-button"
                onClick={handlePredict}
                disabled={isLoading || credits <= 0}
              >
                <Compass size={20} />
                {isLoading && predictionMode === 'single' ? "Consulting Stars..." : "Predict Day"}
              </button>

              <button 
                type="button" 
                className="predict-button secondary"
                onClick={handlePredict5Days}
                disabled={isLoading || credits <= 0}
              >
                <Sparkles size={20} style={{ color: 'inherit' }} />
                {isLoading && predictionMode === 'multi' ? "Generating Forecast..." : "Predict 5 Days"}
              </button>
            </div>

            {/* Credits Exhausted Alert */}
            {credits <= 0 && (
              <div className="credit-exhausted-card">
                <h3 className="credit-exhausted-title">
                  <AlertTriangle size={18} /> Credit Limit Reached
                </h3>
                <p className="credit-exhausted-desc">
                  This device has run out of its 3 free credits. If you are testing the app, please use the configuration settings icon in the bottom-right corner to reset your credits.
                </p>
              </div>
            )}
          </section>

          {/* Results Side */}
          <section className="predictor-card" aria-labelledby="results-section-title">
            <h2 id="results-section-title" className="section-title">
              <Home size={20} /> Vastu Suitability Report
            </h2>

            {/* Loading state */}
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">{loadingTexts[loadingMsgIdx]}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && !isLoading && (
              <div className="credit-exhausted-card" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 className="credit-exhausted-title" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={18} /> Prediction Error
                </h3>
                <p className="credit-exhausted-desc" style={{ color: '#fca5a5' }}>
                  {errorMsg}
                </p>
              </div>
            )}

            {/* No result yet */}
            {!isLoading && !result && !multiResult && !errorMsg && (
              <div className="results-placeholder">
                <Compass size={64} className="placeholder-icon" />
                <p style={{ fontFamily: 'var(--heading-font)', fontSize: '1.2rem', color: '#ffd700', marginBottom: '8px' }}>
                  Awaiting Stellar Input
                </p>
                <p style={{ fontSize: '0.85rem', maxWidth: '280px' }}>
                  Select the desired limbs of the Panchang on the left, then click predict to generate the Vastu reading.
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
                  <div className="verdict-badge">{result.verdict}</div>
                  <p className="verdict-desc">{result.overallAnalysis}</p>
                </div>

                {/* Breakdown by Limb */}
                <div className="limbs-report">
                  
                  {/* Tithi */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Tithi (Lunar Day)</span>
                      <span className="limb-value-badge">{selectedTithi}</span>
                    </div>
                    <p className="limb-detail-text">{result.tithiAnalysis}</p>
                  </div>

                  {/* Nakshatra */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Nakshatra</span>
                      <span className="limb-value-badge">{selectedNakshatra}</span>
                    </div>
                    <p className="limb-detail-text">{result.nakshatraAnalysis}</p>
                  </div>

                  {/* Vaar */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Vaar (Weekday)</span>
                      <span className="limb-value-badge">{selectedVaar}</span>
                    </div>
                    <p className="limb-detail-text">{result.vaarAnalysis}</p>
                  </div>

                  {/* Yoga */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Yoga</span>
                      <span className="limb-value-badge">{selectedYoga}</span>
                    </div>
                    <p className="limb-detail-text">{result.yogaAnalysis}</p>
                  </div>

                  {/* Karan */}
                  <div className="limb-detail-item">
                    <div className="limb-detail-header">
                      <span className="limb-detail-name">Karan</span>
                      <span className="limb-value-badge">{selectedKaran}</span>
                    </div>
                    <p className="limb-detail-text">{result.karanAnalysis}</p>
                  </div>

                </div>

                {/* Vastu Remedies / Safeguards */}
                {result.remedies && result.remedies.length > 0 && (
                  <div className="remedies-section">
                    <h3 className="remedies-title">
                      <Star size={16} /> Astrological Vastu Remedies
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
                      Top 5 Vastu Muhurat recommendations for the next 1 year (from {startDate}):
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
                            <Star size={16} /> Astrological Vastu Remedies
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
          <p>© {new Date().getFullYear()} Vastu Astrological Engine. Built for auspicious home planning.</p>
        </footer>

        {/* Dev settings trigger button */}
        <button 
          type="button"
          className="dev-trigger-btn"
          onClick={() => setShowDevPanel(true)}
          title="Developer Settings"
          aria-label="Developer Settings"
        >
          <Settings size={18} />
        </button>

        {/* Developer Settings Modal */}
        {showDevPanel && (
          <>
            <div className="dev-backdrop" onClick={() => setShowDevPanel(false)}></div>
            <div className="dev-panel" role="dialog" aria-labelledby="dev-modal-title">
              <div className="dev-title" id="dev-modal-title">
                <span>Developer / Admin Panel</span>
                <button type="button" className="dev-close-btn" onClick={() => setShowDevPanel(false)}>×</button>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Reset Device Credits:</strong> Reset the localStorage counter back to 3 credits for this device.
                </p>
                <button 
                  type="button" 
                  className="dev-btn"
                  onClick={handleResetCredits}
                >
                  Reset Credits to 3
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <label className="input-label" htmlFor="dev-api-key" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span>Gemini API Key:</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    Configure the client-side API Key to generate predictions.
                  </span>
                </label>
                <input 
                  id="dev-api-key"
                  type="text" 
                  className="text-input-field" 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onClick={() => setShowDevPanel(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="dev-btn"
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}

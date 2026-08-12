import type { MuhuratInput } from './gemini';

const TITHI_LABELS: Record<string, string> = {
  '1': 'Pratipada (1)',
  '2': 'Dwitiya (2)',
  '3': 'Tritiya (3)',
  '4': 'Chaturthi (4)',
  '5': 'Panchami (5)',
  '6': 'Shasthi (6)',
  '7': 'Saptami (7)',
  '8': 'Ashtami (8)',
  '9': 'Navami (9)',
  '10': 'Dashami (10)',
  '11': 'Ekadashi (11)',
  '12': 'Dwadashi (12)',
  '13': 'Trayodashi (13)',
  '14': 'Chaturdashi (14)',
  'Purnima': 'Purnima (15)',
  'Amavasya': 'Amavasya (30)'
};

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const YOGAS = [
  'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 
  'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 
  'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Aindra', 'Vaidhriti'
];

const MOVABLE_KARANS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti (Bhadra)'];

function formatTithi(num: string, paksha: string): string {
  if (num === 'Purnima') return 'Purnima (15)';
  if (num === 'Amavasya') return 'Amavasya (30)';
  const label = TITHI_LABELS[num] || num;
  return `${paksha} ${label}`;
}

export function getNextTithi(num: string, paksha: string): { num: string; paksha: string } {
  if (num === 'Purnima') {
    return { num: '1', paksha: 'Krishna' };
  }
  if (num === 'Amavasya') {
    return { num: '1', paksha: 'Shukla' };
  }
  
  const val = parseInt(num, 10);
  if (val === 14) {
    if (paksha === 'Shukla') {
      return { num: 'Purnima', paksha: 'Shukla' };
    } else {
      return { num: 'Amavasya', paksha: 'Krishna' };
    }
  }
  
  return { num: (val + 1).toString(), paksha };
}

export function getNextNakshatra(current: string): string {
  const idx = NAKSHATRAS.indexOf(current);
  if (idx === -1) return NAKSHATRAS[0];
  return NAKSHATRAS[(idx + 1) % 27];
}

export function getNextVaar(current: string): string {
  const idx = WEEKDAYS.indexOf(current);
  if (idx === -1) return WEEKDAYS[0];
  return WEEKDAYS[(idx + 1) % 7];
}

export function getNextYoga(current: string): string {
  const idx = YOGAS.indexOf(current);
  if (idx === -1) return YOGAS[0];
  return YOGAS[(idx + 1) % 27];
}

export function getNextKaran(current: string): string {
  const movableIdx = MOVABLE_KARANS.indexOf(current);
  if (movableIdx !== -1) {
    return MOVABLE_KARANS[(movableIdx + 2) % 7];
  }
  
  if (current === 'Shakuni') return 'Chatushpada';
  if (current === 'Chatushpada') return 'Naga';
  if (current === 'Naga') return 'Kimstughna';
  if (current === 'Kimstughna') return 'Bava';
  
  return 'Bava';
}

export function generateNext5Days(
  startTithiNum: string,
  startTithiPaksha: string,
  startNakshatra: string,
  startVaar: string,
  startYoga: string,
  startKaran: string,
  muhurtTypeId: number = 1,
  muhurtNameEn: string = "Griha Pravesha",
  muhurtNameGu: string = "ગૃહપ્રવેશ"
): MuhuratInput[] {
  const result: MuhuratInput[] = [];
  
  let tithiNum = startTithiNum;
  let tithiPaksha = startTithiPaksha;
  let nakshatra = startNakshatra;
  let vaar = startVaar;
  let yoga = startYoga;
  let karan = startKaran;
  
  // Day 1 is the starting day
  result.push({
    muhurtTypeId,
    muhurtNameEn,
    muhurtNameGu,
    tithi: formatTithi(tithiNum, tithiPaksha),
    nakshatra,
    vaar,
    yoga,
    karan
  });
  
  // Days 2 to 5 are sequential
  for (let i = 1; i < 5; i++) {
    const nextTithiObj = getNextTithi(tithiNum, tithiPaksha);
    tithiNum = nextTithiObj.num;
    tithiPaksha = nextTithiObj.paksha;
    
    nakshatra = getNextNakshatra(nakshatra);
    vaar = getNextVaar(vaar);
    yoga = getNextYoga(yoga);
    karan = getNextKaran(karan);
    
    result.push({
      muhurtTypeId,
      muhurtNameEn,
      muhurtNameGu,
      tithi: formatTithi(tithiNum, tithiPaksha),
      nakshatra,
      vaar,
      yoga,
      karan
    });
  }
  
  return result;
}

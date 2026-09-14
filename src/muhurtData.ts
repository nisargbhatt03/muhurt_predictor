import masterDataJson from '../master-data.json';
import selectedIndicesJson from '../astrology_muhurt_selected_indices_only.json';

export interface MuhurtTypeItem {
  id: number;
  nameEn: string;
  nameHi: string;
  nameSa: string;
  nameGu: string;
}

export interface MuhurtRules {
  tithiShukla: { id: number; name: string }[];
  tithiKrishna: { id: number; name: string }[];
  nakshatra: { id: number; name: string }[];
  yoga: { id: number; name: string }[];
  vaar: { id: number; name: string }[];
  karan: { id: number; name: string }[];
}

export const ALL_MUHURTS: MuhurtTypeItem[] = [
  {
    id: 1,
    nameEn: "Griha Pravesha",
    nameHi: "गृह प्रवेश",
    nameSa: "गृहप्रवेशः",
    nameGu: "ગૃહપ્રવેશ"
  },
  {
    id: 2,
    nameEn: "Annaprashana",
    nameHi: "अन्नप्राशन",
    nameSa: "अन्नप्राशनम्",
    nameGu: "અન્નપ્રાશન"
  },
  {
    id: 3,
    nameEn: "Karnavedha",
    nameHi: "कर्णवेध",
    nameSa: "कर्णवेधः",
    nameGu: "કર્ણવેધ"
  },
  {
    id: 4,
    nameEn: "Udgatana",
    nameHi: "उद्घाटन",
    nameSa: "उद्घाटनम्",
    nameGu: "ઉદ્ઘાટન"
  },
  {
    id: 5,
    nameEn: "Keshakartana",
    nameHi: "केशकर्तन (मुंडन)",
    nameSa: "केशकर्तनम्",
    nameGu: "કેશકર્તન"
  },
  {
    id: 6,
    nameEn: "Vidyarambha",
    nameHi: "विद्यारंभ",
    nameSa: "विद्यारम्भः",
    nameGu: "વિદ્યારંભ"
  },
  {
    id: 7,
    nameEn: "Simantonnayana",
    nameHi: "सीमन्तोन्नयन",
    nameSa: "सीमन्तोन्नयनम्",
    nameGu: "સીમંત"
  },
  {
    id: 8,
    nameEn: "Upanayana",
    nameHi: "उपनयन (जनेऊ)",
    nameSa: "उपनयनम्",
    nameGu: "ઉપનયન"
  },
  {
    id: 9,
    nameEn: "Vastu Shanti",
    nameHi: "वास्तु शांति",
    nameSa: "वास्तुशान्तिः",
    nameGu: "વાસ્તુશાંતિ"
  }
];

export function getMuhurtRecord(id: number) {
  return selectedIndicesJson.records.find(r => r.record_id === id) || selectedIndicesJson.records[0];
}

export function getMuhurtRules(id: number): MuhurtRules {
  const record = getMuhurtRecord(id);
  const sel = record.selected;

  const tithiShukla = masterDataJson.tithi_shukla_paksha.filter(t => sel.tithi_shukla_paksha.includes(t.id));
  const tithiKrishna = masterDataJson.tithi_krishna_paksha.filter(t => sel.tithi_krishna_paksha.includes(t.id));
  const nakshatra = masterDataJson.nakshatra.filter(n => sel.nakshatra.includes(n.id));
  const yoga = masterDataJson.yoga.filter(y => sel.yoga.includes(y.id));
  const vaar = masterDataJson.vaar.filter(v => sel.vaar.includes(v.id));
  const karan = masterDataJson.karan.filter(k => sel.karan.includes(k.id));

  return {
    tithiShukla,
    tithiKrishna,
    nakshatra,
    yoga,
    vaar,
    karan,
  };
}

export function filterTithis<T extends { value: string }>(
  muhurtId: number, 
  paksha: string, 
  allTithiNumbers: T[]
): T[] {
  const record = getMuhurtRecord(muhurtId);
  const selectedIndices = paksha === 'Shukla' 
    ? record.selected.tithi_shukla_paksha 
    : record.selected.tithi_krishna_paksha;
    
  return allTithiNumbers.filter(t => {
    let tithiId: number;
    if (t.value === 'Purnima') tithiId = 15;
    else if (t.value === 'Amavasya') tithiId = 15;
    else tithiId = parseInt(t.value, 10);
    
    return selectedIndices.includes(tithiId);
  });
}

export function filterNakshatras<T>(muhurtId: number, allNakshatras: T[]): T[] {
  const record = getMuhurtRecord(muhurtId);
  const selectedIndices = record.selected.nakshatra;
  return allNakshatras.filter((_, idx) => selectedIndices.includes(idx + 1));
}

export function filterVaars<T>(muhurtId: number, allVaars: T[]): T[] {
  const record = getMuhurtRecord(muhurtId);
  const selectedIndices = record.selected.vaar;
  return allVaars.filter((_, idx) => selectedIndices.includes(idx + 1));
}

export function filterYogas<T>(muhurtId: number, allYogas: T[]): T[] {
  const record = getMuhurtRecord(muhurtId);
  const selectedIndices = record.selected.yoga;
  return allYogas.filter((_, idx) => selectedIndices.includes(idx + 1));
}

export function filterKarans<T>(muhurtId: number, allKarans: T[]): T[] {
  const record = getMuhurtRecord(muhurtId);
  const selectedIndices = record.selected.karan;
  return allKarans.filter((_, idx) => selectedIndices.includes(idx + 1));
}

export function getMuhurtRulesSummaryText(id: number): string {
  const rules = getMuhurtRules(id);
  const record = getMuhurtRecord(id);
  
  const shuklaNames = rules.tithiShukla.map(t => t.name).join(', ');
  const krishnaNames = rules.tithiKrishna.map(t => t.name).join(', ');
  const nakshatraNames = rules.nakshatra.map(n => n.name).join(', ');
  const vaarNames = rules.vaar.map(v => v.name).join(', ');
  const yogaNames = rules.yoga.map(y => y.name).join(', ');
  const karanNames = rules.karan.map(k => k.name).join(', ');

  return `Rules for ${record.muhurt_name_indian} (${record.muhurt_name_handwritten}):
- Auspicious Shukla Paksha Tithis: ${shuklaNames || 'None'}
- Auspicious Krishna Paksha Tithis: ${krishnaNames || 'None'}
- Auspicious Nakshatras: ${nakshatraNames || 'None'}
- Auspicious Weekdays (Vaar): ${vaarNames || 'None'}
- Auspicious Yogas: ${yogaNames || 'None'}
- Auspicious Karans: ${karanNames || 'None'}`;
}

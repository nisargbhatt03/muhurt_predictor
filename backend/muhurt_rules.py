import os
import json

_DIR = os.path.dirname(os.path.dirname(__file__))
_INDICES_PATH = os.path.join(_DIR, "astrology_muhurt_selected_indices_only.json")

# Load selected rules JSON
try:
    with open(_INDICES_PATH, "r", encoding="utf-8") as f:
        RULES_DATA = json.load(f)
except Exception as e:
    print(f"Warning: Failed to load selected indices rules JSON: {e}")
    RULES_DATA = {"records": []}


NAKSHATRA_ORDER = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

VAAR_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

YOGA_ORDER = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
    "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
    "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Aindra", "Vaidhriti"
]

KARAN_ORDER = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]


def get_muhurt_record(muhurt_id: int) -> dict:
    for rec in RULES_DATA.get("records", []):
        if rec.get("record_id") == muhurt_id:
            return rec
    return RULES_DATA["records"][0] if RULES_DATA.get("records") else {}


def evaluate_muhurt_score(panchang: dict, muhurt_id: int) -> dict:
    """
    Evaluates Panchang parameters against exact Vedic Muhurt rules for all 9 ceremonies.
    """
    record = get_muhurt_record(muhurt_id)
    selected = record.get("selected", {})
    ceremony_name = record.get("muhurt_name_indian", "Ceremony")

    tithi_str = panchang.get("tithi", "")
    nakshatra_str = panchang.get("nakshatra", "")
    vaar_str = panchang.get("vaar", "")
    yoga_str = panchang.get("yoga", "")
    karan_str = panchang.get("karan", "")

    # 1. Tithi Evaluation (Weight 25%)
    tithi_ok = False
    shukla_selected = selected.get("tithi_shukla_paksha", [])
    krishna_selected = selected.get("tithi_krishna_paksha", [])

    if "Shukla" in tithi_str or "Purnima" in tithi_str:
        if "Purnima" in tithi_str:
            tithi_ok = 15 in shukla_selected
        else:
            tithi_ok = any(f"({i})" in tithi_str or f" {i} " in tithi_str for i in shukla_selected)
    elif "Krishna" in tithi_str or "Amavasya" in tithi_str:
        if "Amavasya" in tithi_str:
            tithi_ok = 30 in krishna_selected or 15 in krishna_selected
        else:
            tithi_ok = any(f"({i})" in tithi_str or f" {i} " in tithi_str for i in krishna_selected)
    
    tithi_score = 25 if tithi_ok else 5

    # 2. Nakshatra Evaluation (Weight 30%)
    nak_idx = 1
    for idx, name in enumerate(NAKSHATRA_ORDER, start=1):
        if name.lower() in nakshatra_str.lower():
            nak_idx = idx
            break
    
    nak_ok = nak_idx in selected.get("nakshatra", [])
    nak_score = 30 if nak_ok else 8

    # 3. Vaar Evaluation (Weight 15%)
    vaar_idx = 1
    for idx, name in enumerate(VAAR_ORDER, start=1):
        if name.lower() == vaar_str.lower():
            vaar_idx = idx
            break

    vaar_ok = vaar_idx in selected.get("vaar", [])
    vaar_score = 15 if vaar_ok else 3

    # 4. Yoga Evaluation (Weight 15%)
    yoga_idx = 1
    for idx, name in enumerate(YOGA_ORDER, start=1):
        if name.lower() in yoga_str.lower():
            yoga_idx = idx
            break

    yoga_ok = yoga_idx in selected.get("yoga", [])
    yoga_score = 15 if yoga_ok else 3

    # 5. Karan Evaluation (Weight 15%)
    if "Vishti" in karan_str or "Bhadra" in karan_str:
        karan_score = 0
        karan_ok = False
        karan_status = "Strictly Avoided (Bhadra Period)"
    else:
        karan_idx = 1
        for idx, name in enumerate(KARAN_ORDER, start=1):
            if name.lower() in karan_str.lower():
                karan_idx = idx
                break
        karan_ok = karan_idx in selected.get("karan", []) or len(selected.get("karan", [])) == 0
        karan_score = 15 if karan_ok else 7
        karan_status = "Favorable Karan" if karan_ok else "Average Karan"

    total_score = min(100, max(15, tithi_score + nak_score + vaar_score + yoga_score + karan_score))

    if total_score >= 80:
        verdict = "Highly Auspicious"
    elif total_score >= 65:
        verdict = "Auspicious"
    elif total_score >= 45:
        verdict = "Proceed with Caution"
    else:
        verdict = "Inauspicious - Avoid"

    return {
        "score": total_score,
        "verdict": verdict,
        "limb_evaluations": {
            "tithi": f"Approved Tithi for {ceremony_name}" if tithi_ok else f"Inauspicious Tithi for {ceremony_name}",
            "nakshatra": f"Favored star ({nakshatra_str}) for {ceremony_name}" if nak_ok else f"Avoid star ({nakshatra_str}) for {ceremony_name}",
            "vaar": f"Benefic {vaar_str} for {ceremony_name}" if vaar_ok else f"Restricted {vaar_str} for {ceremony_name}",
            "yoga": f"Benefic {yoga_str} Yoga" if yoga_ok else f"Inauspicious {yoga_str} Yoga",
            "karan": karan_status
        }
    }


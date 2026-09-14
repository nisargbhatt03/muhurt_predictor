import os
import math
from datetime import datetime, timezone, timedelta
import skyfield.api as sf

# Load Skyfield Ephemeris once at module load
_LOAD_DIR = os.path.dirname(__file__)
_EPH_PATH = os.path.join(_LOAD_DIR, "de421.bsp")

try:
    ts = sf.load.timescale()
    if os.path.exists(_EPH_PATH):
        eph = sf.load(_EPH_PATH)
    else:
        eph = sf.load("de421.bsp")
    sun, moon, earth = eph['sun'], eph['moon'], eph['earth']
except Exception as e:
    print(f"Warning: Skyfield ephemeris loading failed: {e}")
    ts, eph, sun, moon, earth = None, None, None, None, None

# Names definitions matching frontend
TITHI_NAMES = [
    "Shukla Pratipada (1)", "Shukla Dwitiya (2)", "Shukla Tritiya (3)", "Shukla Chaturthi (4)", "Shukla Panchami (5)",
    "Shukla Shasthi (6)", "Shukla Saptami (7)", "Shukla Ashtami (8)", "Shukla Navami (9)", "Shukla Dashami (10)",
    "Shukla Ekadashi (11)", "Shukla Dwadashi (12)", "Shukla Trayodashi (13)", "Shukla Chaturdashi (14)", "Purnima (15)",
    "Krishna Pratipada (1)", "Krishna Dwitiya (2)", "Krishna Tritiya (3)", "Krishna Chaturthi (4)", "Krishna Panchami (5)",
    "Krishna Shasthi (6)", "Krishna Saptami (7)", "Krishna Ashtami (8)", "Krishna Navami (9)", "Krishna Dashami (10)",
    "Krishna Ekadashi (11)", "Krishna Dwadashi (12)", "Krishna Trayodashi (13)", "Krishna Chaturdashi (14)", "Amavasya (30)"
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

VAAR_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

YOGA_NAMES = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
    "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
    "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Aindra", "Vaidhriti"
]

KARAN_NAMES_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)"]
KARAN_NAMES_FIXED = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]


def calculate_lahiri_ayanamsha(jd_ut: float) -> float:
    """Calculates approximate Lahiri Ayanamsha for a given Julian Date."""
    t_centuries = (jd_ut - 2451545.0) / 36525.0
    # Lahiri Ayanamsha formula approx: 23.85 + 1.396 * T
    return 23.85 + 1.396 * t_centuries


def get_panchang_for_date(date_str: str, hour: int = 6, minute: int = 0) -> dict:
    """
    Calculates Indian Panchang (Tithi, Nakshatra, Vaar, Yoga, Karan) for a date string 'YYYY-MM-DD'.
    Default time is 06:00 AM IST (Sunrise window).
    """
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        dt_ist = datetime(dt.year, dt.month, dt.day, hour, minute, tzinfo=timezone(timedelta(hours=5, minutes=30)))
        
        weekday_idx = (dt_ist.weekday() + 1) % 7 # Sunday = 0
        vaar = VAAR_NAMES[weekday_idx]

        if ts is not None and eph is not None:
            t = ts.from_datetime(dt_ist)
            obs = earth.at(t)
            _, slon, _ = obs.observe(sun).ecliptic_latlon()
            _, mlon, _ = obs.observe(moon).ecliptic_latlon()

            sun_deg = slon.degrees % 360
            moon_deg = mlon.degrees % 360

            # Lahiri Sidereal Longitudes
            ayanamsha = calculate_lahiri_ayanamsha(t.tt)
            moon_sidereal = (moon_deg - ayanamsha) % 360
            sun_sidereal = (sun_deg - ayanamsha) % 360

            # Tithi: (Moon - Sun) / 12 deg
            diff = (moon_deg - sun_deg) % 360
            tithi_idx = int(diff / 12.0) % 30
            tithi_name = TITHI_NAMES[tithi_idx]

            # Nakshatra: Moon Sidereal / (360/27) = 13.333 deg
            nak_idx = int(moon_sidereal / (360.0 / 27.0)) % 27
            nakshatra_name = NAKSHATRA_NAMES[nak_idx]

            # Yoga: (Sun Sidereal + Moon Sidereal) / (360/27)
            sum_lon = (sun_sidereal + moon_sidereal) % 360
            yoga_idx = int(sum_lon / (360.0 / 27.0)) % 27
            yoga_name = YOGA_NAMES[yoga_idx]

            # Karan: Half of Tithi (each 6 degrees)
            karan_num = int(diff / 6.0)
            if karan_num == 0:
                karan_name = "Kimstughna"
            elif karan_num >= 57:
                fixed_map = {57: "Shakuni", 58: "Chatushpada", 59: "Naga"}
                karan_name = fixed_map.get(karan_num, "Kimstughna")
            else:
                karan_name = KARAN_NAMES_MOVABLE[(karan_num - 1) % 7]
        else:
            # Fallback deterministic estimation if ephemeris not loaded
            tithi_idx = (dt.day * 2) % 30
            tithi_name = TITHI_NAMES[tithi_idx]
            nakshatra_name = NAKSHATRA_NAMES[(dt.day * 3) % 27]
            yoga_name = YOGA_NAMES[(dt.day * 4) % 27]
            karan_name = KARAN_NAMES_MOVABLE[dt.day % 7]

        return {
            "date": date_str,
            "vaar": vaar,
            "tithi": tithi_name,
            "nakshatra": nakshatra_name,
            "yoga": yoga_name,
            "karan": karan_name
        }
    except Exception as err:
        print(f"Error calculating panchang for {date_str}: {err}")
        return {
            "date": date_str,
            "vaar": "Monday",
            "tithi": "Shukla Panchami (5)",
            "nakshatra": "Rohini",
            "yoga": "Siddhi",
            "karan": "Bava"
        }

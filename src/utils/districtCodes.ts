// Tamil Nadu District English Abbreviation Mapping
export const TAMILNADU_DISTRICT_CODES: Record<string, string> = {
  "மதுரை": "MDU",
  "madurai": "MDU",
  "சென்னை": "CHE",
  "chennai": "CHE",
  "திருச்சி": "TRY",
  "திருச்சிராப்பள்ளி": "TRY",
  "trichy": "TRY",
  "tiruchirappalli": "TRY",
  "கோயம்புத்தூர்": "CBE",
  "கோவை": "CBE",
  "coimbatore": "CBE",
  "சேலம்": "SLM",
  "salem": "SLM",
  "திருநெல்வேலி": "TNV",
  "tirunelveli": "TNV",
  "ஈரோடு": "ERD",
  "erode": "ERD",
  "வேலூர்": "VEL",
  "vellore": "VEL",
  "தூத்துக்குடி": "TUT",
  "thoothukudi": "TUT",
  "tuticorin": "TUT",
  "தஞ்சாவூர்": "TNJ",
  "thanjavur": "TNJ",
  "திண்டுக்கல்": "DGL",
  "dindigul": "DGL",
  "கன்னியாகுமரி": "KKM",
  "kanyakumari": "KKM",
  "விருதுநகர்": "VNR",
  "virudhunagar": "VNR",
  "சிவகங்கை": "SVG",
  "sivagangai": "SVG",
  "தேனி": "TNI",
  "theni": "TNI",
  "இராமநாதபுரம்": "RMD",
  "ராமநாதபுரம்": "RMD",
  "ramanathapuram": "RMD",
  "திருப்பூர்": "TPR",
  "tiruppur": "TPR",
  "கிருஷ்ணகிரி": "KGI",
  "krishnagiri": "KGI",
  "தர்மபுரி": "DPI",
  "dharmapuri": "DPI",
  "திருவள்ளூர்": "TLR",
  "tiruvallur": "TLR",
  "காஞ்சிபுரம்": "KPM",
  "kanchipuram": "KPM",
  "செங்கல்பட்டு": "CGL",
  "chengalpattu": "CGL",
  "விழுப்புரம்": "VPM",
  "viluppuram": "VPM",
  "கடலூர்": "CDL",
  "cuddalore": "CDL",
  "கள்ளக்குறிச்சி": "KKI",
  "kallakurichi": "KKI",
  "பெரம்பலூர்": "PBL",
  "perambalur": "PBL",
  "அரியலூர்": "ALR",
  "ariyalur": "ALR",
  "கரூர்": "KRR",
  "karur": "KRR",
  "புதுக்கோட்டை": "PDK",
  "pudukkottai": "PDK",
  "நாகப்பட்டினம்": "NGP",
  "nagapattinam": "NGP",
  "திருவாரூர்": "TVR",
  "tiruvarur": "TVR",
  "மயிலாடுதுறை": "MYD",
  "mayiladuthurai": "MYD",
  "திருப்பத்தூர்": "TPT",
  "tirupathur": "TPT",
  "ராணிப்பேட்டை": "RPT",
  "ranipet": "RPT",
  "திருவண்ணாமலை": "TVM",
  "tiruvannamalai": "TVM",
  "நீலகிரி": "NLG",
  "nilgiris": "NLG",
  "தென்காசி": "TKS",
  "tenkasi": "TKS"
};

/**
 * Returns 3-letter English District Code for a given district string
 */
export function getDistrictCode(district: string = ""): string {
  if (!district) return "MDU";
  const trimmed = district.trim();
  const lower = trimmed.toLowerCase();

  for (const [key, code] of Object.entries(TAMILNADU_DISTRICT_CODES)) {
    if (lower.includes(key)) {
      return code;
    }
  }

  // Fallback: search English letters
  const cleanEng = trimmed.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleanEng.length >= 3) {
    return cleanEng.substring(0, 3);
  }

  return "MDU";
}

/**
 * Formats Member Number with English District Code prefix
 * e.g., MDU-4016 or MDU - 4016
 */
export function formatMemberNumber(regNo: string = "", district: string = ""): string {
  const code = getDistrictCode(district);
  
  if (!regNo) {
    return `${code}-4016`;
  }

  // If regNo already starts with a district code (e.g. MDU-4016 or TNMDUJ-4016)
  if (regNo.toUpperCase().startsWith(`${code}-`) || regNo.toUpperCase().startsWith(`${code} -`)) {
    return regNo;
  }

  // Extract clean number digits or numeric tail
  const digitsMatch = regNo.match(/\d+$/);
  if (digitsMatch) {
    return `${code}-${digitsMatch[0]}`;
  }

  // If regNo is like 4016 or 0042
  const simpleDigits = regNo.replace(/\D/g, "");
  if (simpleDigits) {
    return `${code}-${simpleDigits}`;
  }

  return `${code}-${regNo}`;
}

/**
 * Generates a unique district-prefixed member registration number
 * e.g., MDU-2026-4821
 */
export function generateDistrictRegNumber(district: string = ""): string {
  const code = getDistrictCode(district);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${code}-2026-${randomNum}`;
}


import { Leader, NewsItem, WelfareScheme, DistrictAdmin, SystemStats, MemberRegistration, PaymentRecord } from "./types";

export const initialLeaders: Leader[] = [
  {
    id: "l1",
    name: "S. மைக்கேல் ஆல்வின்",
    nameEn: "S. Michael Alwin",
    role: "மாநில தலைவர்",
    roleEn: "State President",
    phone: "+919789331681",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400",
    district: "தமிழ்நாடு",
    districtEn: "Tamil Nadu"
  },
  {
    id: "l2",
    name: "ரா. சேவியர் பாபு",
    nameEn: "R. Xavier Babu",
    role: "மாநில பொதுச்செயலாளர்",
    roleEn: "State General Secretary",
    phone: "+917010131915",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400",
    district: "தமிழ்நாடு",
    districtEn: "Tamil Nadu"
  }
];

export const initialNews: NewsItem[] = [];

export const initialWelfareSchemes: WelfareScheme[] = [
  {
    id: "ws1",
    title: "தமிழ்நாடு கட்டுமானத் தொழிலாளர்கள் நலவாரிய ஓய்வூதியம்",
    titleEn: "TN Construction Workers Welfare Board Pension",
    description: "60 வயது நிறைவடைந்த பதிவு பெற்ற பெண் மற்றும் ஆண் பெயிண்டர்களுக்கு மாதந்தோறும் ₹1,000 ஓய்வூதியம் வழங்கும் திட்டம்.",
    descriptionEn: "A monthly pension scheme of ₹1,000 for registered male and female painters who have completed 60 years of age.",
    amount: "₹1,000 / மாதம் (Monthly)",
    eligibility: "நலவாரியத்தில் 3 ஆண்டுகள் தொடர்ந்து பதிவு செய்திருக்க வேண்டும். 60 வயது பூர்த்தியடைந்திருக்க வேண்டும்.",
    eligibilityEn: "Must have been registered with the Welfare Board for at least 3 years. Minimum age of 60.",
    steps: [
      "ஆதார் மற்றும் நலவாரிய அட்டை நகல்களை தயார் செய்யவும்.",
      "வாழ்க்கைச் சான்றிதழ் (Life Certificate) பெறவும்.",
      "மாவட்ட சங்கச் செயலாளர் மூலம் விண்ணப்பத்தை பதிவேற்றவும்."
    ],
    stepsEn: [
      "Prepare copies of Aadhaar and Welfare Board ID card.",
      "Obtain a certified Life Certificate.",
      "Submit the application via your district union secretary."
    ]
  },
  {
    id: "ws2",
    title: "விபத்து மரண மற்றும் ஊன நிவாரண உதவித் தொகை",
    titleEn: "Accident Death & Disability Financial Assistance",
    description: "பணியின் போது எதிர்பாராத விதமாக விபத்து ஏற்பட்டு மரணம் அடைய நேரிட்டால் குடும்பத்திற்கு வழங்கப்படும் பெரும் நிதியுதவி.",
    descriptionEn: "Financial support provided to families in the unfortunate event of on-duty accidental death or permanent disability.",
    amount: "₹5,00,000 வரை (Up to ₹5,00,000)",
    eligibility: "சங்கத்திலும் நலவாரியத்திலும் பதிவு செய்து, நடப்பு சந்தா செலுத்தியிருக்க வேண்டும்.",
    eligibilityEn: "Must be a registered active member of both the Union and the Welfare Board with paid subscription.",
    steps: [
      "விபத்து நேரிட்ட 30 நாட்களுக்குள் காவல் துறை முதல் தகவல் அறிக்கை (FIR) நகல் பெற வேண்டும்.",
      "மருத்துவமனை மரண சான்றிதழ் அல்லது ஊன சான்றிதழ் பெறவும்.",
      "சங்கத்தின் அவசர உதவிக்குழுவை (+917010131915) உடனடியாக தொடர்பு கொள்ளவும்."
    ],
    stepsEn: [
      "Obtain Police FIR copy within 30 days of the accident.",
      "Secure Hospital Death Certificate or certified Disability Certificate.",
      "Immediately contact the Union Emergency Relief Cell (+917010131915)."
    ]
  },
  {
    id: "ws3",
    title: "கல்வி மற்றும் திருமண நிதியுதவித் திட்டம்",
    titleEn: "Children's Education & Marriage Assistance Scheme",
    description: "உறுப்பினர்களின் பிள்ளைகளின் உயர் கல்விக்கும் மற்றும் திருமண செலவிற்கும் வழங்கப்படும் அரசு மற்றும் சங்க நிதியுதவிகள்.",
    descriptionEn: "Financial grants for the higher education of members' children and marriage assistance for registered daughters and sons.",
    amount: "₹10,000 - ₹50,000",
    eligibility: "சங்கத்தில் குறைந்தபட்சம் 1 வருடம் உறுப்பினராக இருக்க வேண்டும்.",
    eligibilityEn: "Minimum of 1 year active union membership required.",
    steps: [
      "பள்ளி அல்லது கல்லூரி மாற்றுச் சான்றிதழ் மற்றும் கட்டண ரசீதுகளை சமர்ப்பிக்கவும்.",
      "திருமண அழைப்பிதழ் மற்றும் மண்டப ரசீது நகல் இணைக்கவும்.",
      "விண்ணப்பத்தை மாவட்ட அலுவலகத்தில் நேரில் சமர்ப்பிக்கவும்."
    ],
    stepsEn: [
      "Submit school/college transfer certificate and fee receipt copies.",
      "Attach wedding invitation and hall receipt copies.",
      "Submit application physically at your local district office."
    ]
  }
];

export const initialDistricts: DistrictAdmin[] = [];

export const initialStats: SystemStats = {
  totalMembers: 0,
  districtsActive: 38,
  totalFundsRaised: 0,
  welfareDisbursed: 0,
  solvedCases: 0
};

export const sampleRegistrations: MemberRegistration[] = [];

export const samplePayments: PaymentRecord[] = [];

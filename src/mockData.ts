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

export const initialNews: NewsItem[] = [
  {
    id: "n1",
    title: "மாவட்ட வாரியாக பெயிண்டர்கள் அடையாள அட்டை வழங்கும் முகாம்",
    titleEn: "District-level Painter ID Card Registration Campaign Launched",
    content: "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் முன்னேற்ற சங்கம் சார்பில் ஆகஸ்ட் மாதம் முழுவதும் அனைத்து மாவட்ட தலைநகரங்களிலும் புதிய அடையாள அட்டை மற்றும் அரசு நலவாரிய பதிவு சிறப்பு முகாம் நடைபெற உள்ளது. உறுப்பினர்கள் தங்களின் ஆதார் மற்றும் வங்கி கணக்குடன் கலந்து கொள்ளுமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.",
    contentEn: "On behalf of the Tamil Nadu Painters and Artists Progressive Association, special registration camps for Union ID cards and Government Welfare Board registration will be held across all district headquarters throughout August. Members are requested to bring their Aadhaar and Bank accounts.",
    date: "2026-08-01",
    category: "news",
    categoryTa: "செய்தி",
    imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "n2",
    title: "விபத்து காப்பீட்டுத் தொகை உயர்வு - புதிய சுற்றறிக்கை",
    titleEn: "Accident Insurance Claim Amount Increased - New Circular",
    content: "மாநில பொதுக்குழு கூட்டத்தில் எடுக்கப்பட்ட முடிவின்படி, பணியின் போது விபத்தில் சிக்கி உயிரிழக்கும் அல்லது ஊனமுறும் சங்க உறுப்பினர்களுக்கான உடனடி நிவாரண நிதி ₹50,000 இலிருந்து ₹1,00,000 ஆக உயர்த்தப்பட்டுள்ளது. இதற்கான விண்ணப்பங்களை மாவட்ட செயலாளர்கள் மூலமாக சமர்ப்பிக்கலாம்.",
    contentEn: "As per the decision made in the State General Body Meeting, the immediate relief fund for union members deceased or disabled due to on-duty accidents has been increased from ₹50,000 to ₹1,00,000. Applications can be submitted through district secretaries.",
    date: "2026-07-28",
    category: "circular",
    categoryTa: "சுற்றறிக்கை"
  },
  {
    id: "n3",
    title: "மாநில அளவிலான வண்ண ஓவியக் கண்காட்சி மற்றும் கருத்தரங்கம்",
    titleEn: "State-level Colorful Art Exhibition and Technical Seminar",
    content: "வருகின்ற செப்டம்பர் 15 மற்றும் 16 தேதிகளில் திருச்சிராப்பள்ளியில் அதிநவீன பெயிண்டிங் தொழில்நுட்பங்கள் மற்றும் ஸ்ப்ரே பெயிண்டிங் முறைகள் குறித்த இலவச பயிற்சி முகாம் மற்றும் ஓவிய கண்காட்சி நடைபெறுகிறது. வெளிநாட்டு நிபுணர்கள் கலந்து கொண்டு நேரடி விளக்கம் அளிக்க உள்ளனர்.",
    contentEn: "A free training workshop on modern painting technologies, spray painting methods, and an art exhibition will be held in Tiruchirappalli on September 15 and 16. International experts will give live demonstrations.",
    date: "2026-08-03",
    category: "event",
    categoryTa: "நிகழ்வு",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600"
  }
];

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

export const initialDistricts: DistrictAdmin[] = [
  {
    id: "d1",
    district: "சென்னை",
    districtEn: "Chennai",
    president: "ஏ. லோகநாதன்",
    presidentPhone: "+919840123456",
    secretary: "எஸ். ரமேஷ் குமார்",
    secretaryPhone: "+919840987654"
  },
  {
    id: "d2",
    district: "மதுரை",
    districtEn: "Madurai",
    president: "பி. மாரியப்பன்",
    presidentPhone: "+919841123456",
    secretary: "ஆர். காளிதாஸ்",
    secretaryPhone: "+919841987654"
  },
  {
    id: "d3",
    district: "கோயம்புத்தூர்",
    districtEn: "Coimbatore",
    president: "வி. சுந்தரமூர்த்தி",
    presidentPhone: "+919842123456",
    secretary: "எம். ஜெகதீசன்",
    secretaryPhone: "+919842987654"
  },
  {
    id: "d4",
    district: "திருச்சிராப்பள்ளி",
    districtEn: "Tiruchirappalli",
    president: "டி. இராஜேந்திரன்",
    presidentPhone: "+919843123456",
    secretary: "கே. சண்முகம்",
    secretaryPhone: "+919843987654"
  },
  {
    id: "d5",
    district: "சேலம்",
    districtEn: "Salem",
    president: "எஸ். பெருமாள்",
    presidentPhone: "+919844123456",
    secretary: "ஜி. தர்மலிங்கம்",
    secretaryPhone: "+919844987654"
  }
];

export const initialStats: SystemStats = {
  totalMembers: 45620,
  districtsActive: 38,
  totalFundsRaised: 2450000,
  welfareDisbursed: 1850000,
  solvedCases: 1420
};

export const sampleRegistrations: MemberRegistration[] = [
  {
    id: "reg_1",
    regNumber: "TNP-2026-0034",
    name: "ரா. கார்த்திகேயன்",
    fatherName: "ராமசாமி",
    dob: "1992-05-15",
    gender: "ஆண் (Male)",
    bloodGroup: "O+",
    phone: "9876543210",
    aadhaar: "1234-5678-9012",
    district: "சென்னை",
    address: "கண்ணகி நகர், துரைப்பாக்கம், சென்னை - 600097",
    experienceYears: 8,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    status: "approved",
    createdAt: "2026-08-01T10:30:00Z"
  },
  {
    id: "reg_2",
    regNumber: "TNP-2026-0035",
    name: "ம. சித்ரா",
    fatherName: "மணிவேல்",
    dob: "1996-11-20",
    gender: "பெண் (Female)",
    bloodGroup: "B+",
    phone: "9876543211",
    aadhaar: "9876-5432-1098",
    district: "மதுரை",
    address: "அண்ணா நகர், மதுரை - 625020",
    experienceYears: 5,
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    status: "pending",
    createdAt: "2026-08-03T14:15:00Z"
  }
];

export const samplePayments: PaymentRecord[] = [
  {
    id: "pay_1",
    memberId: "TNP-2026-0034",
    memberName: "ரா. கார்த்திகேயன்",
    amount: 500,
    paymentDate: "2026-08-01 10:45 AM",
    paymentType: "membership",
    paymentTypeTa: "உறுப்பினர் கட்டணம்",
    transactionId: "TXN983274981",
    status: "success"
  },
  {
    id: "pay_2",
    memberId: "TNP-2026-0035",
    memberName: "ம. சித்ரா",
    amount: 1000,
    paymentDate: "2026-08-03 02:30 PM",
    paymentType: "welfare_fund",
    paymentTypeTa: "நல நிதி",
    transactionId: "TXN823749283",
    status: "pending"
  }
];

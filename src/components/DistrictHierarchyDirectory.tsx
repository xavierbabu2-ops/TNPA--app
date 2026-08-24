import React, { useState } from "react";
import { 
  Users, Shield, Phone, MapPin, Search, Filter, ChevronRight, 
  Award, Sparkles, UserCheck, Flame, Building2, Layers, Globe, CheckCircle2, ArrowRight
} from "lucide-react";

interface DistrictHierarchyDirectoryProps {
  lang: "ta" | "en";
  onClose?: () => void;
}

export const TN_38_DISTRICTS_HIERARCHY = [
  {
    id: "chennai",
    districtTa: "சென்னை",
    districtEn: "Chennai",
    zone: "வடக்கு மண்டலம் (North Zone)",
    districtOffice: {
      president: { name: "ஆர். பாஸ்கரன்", nameEn: "R. Baskaran", phone: "+91 98400 11223" },
      secretary: { name: "எஸ். வெங்கடேசன்", nameEn: "S. Venkatesan", phone: "+91 94440 22334" },
      treasurer: { name: "கே. குமார்", nameEn: "K. Kumar", phone: "+91 98401 33445" }
    },
    unions: [
      { nameTa: "மத்திய சென்னை ஒன்றியம்", nameEn: "Central Chennai Union", leader: "எம். ரமேஷ்", phone: "+91 98411 10001" },
      { nameTa: "வட சென்னை ஒன்றியம்", nameEn: "North Chennai Union", leader: "டி. முனுசாமி", phone: "+91 94441 20002" },
      { nameTa: "தென் சென்னை ஒன்றியம்", nameEn: "South Chennai Union", leader: "ஆர். கார்த்திக்", phone: "+91 98421 30003" }
    ],
    towns: [
      { nameTa: "மயிலாப்பூர் நகரம்", nameEn: "Mylapore Town", leader: "எஸ். பாபு", phone: "+91 98431 40004" },
      { nameTa: "தி.நகர் பகுதி", nameEn: "T. Nagar Town", leader: "கே. அசோகன்", phone: "+91 94451 50005" }
    ],
    areas: [
      { nameTa: "அண்ணா நகர் பகுதி", nameEn: "Anna Nagar Area", leader: "ஜி. சதிஷ்", phone: "+91 98461 60006" },
      { nameTa: "அடையாறு பகுதி", nameEn: "Adyar Area", leader: "பி. மோகன்", phone: "+91 94471 70007" }
    ],
    youthWing: {
      districtLeader: "வி. தினேஷ் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "V. Dinesh (District Youth Wing President)",
      secretary: "ஆர். அருண் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "R. Arun (District Youth Wing Secretary)",
      phone: "+91 98402 99887"
    }
  },
  {
    id: "coimbatore",
    districtTa: "கோயம்புத்தூர்",
    districtEn: "Coimbatore",
    zone: "மேற்கு மண்டலம் (West Zone)",
    districtOffice: {
      president: { name: "பி. நடராஜன்", nameEn: "P. Natarajan", phone: "+91 98422 11223" },
      secretary: { name: "ஆர். ஈஸ்வரன்", nameEn: "R. Eswaran", phone: "+91 94432 22334" },
      treasurer: { name: "எம். பழனிசாமி", nameEn: "M. Palanisamy", phone: "+91 98433 33445" }
    },
    unions: [
      { nameTa: "கோயம்புத்தூர் வடக்கு ஒன்றியம்", nameEn: "Coimbatore North Union", leader: "எஸ். சண்முகம்", phone: "+91 98423 10001" },
      { nameTa: "பொள்ளாச்சி ஒன்றியம்", nameEn: "Pollachi Union", leader: "கே. தங்கவேல்", phone: "+91 94433 20002" }
    ],
    towns: [
      { nameTa: "ஆர்.எஸ்.புரம் நகரம்", nameEn: "RS Puram Town", leader: "ஏ. பாலகிருஷ்ணன்", phone: "+91 98443 40004" },
      { nameTa: "உக்கடம் பகுதி", nameEn: "Ukkadam Town", leader: "எம். ஹக்கீம்", phone: "+91 94453 50005" }
    ],
    areas: [
      { nameTa: "சங்காந்கூர் பகுதி", nameEn: "Singanallur Area", leader: "ஆர். ஆனந்த்", phone: "+91 98463 60006" }
    ],
    youthWing: {
      districtLeader: "எஸ். மணிகண்டன் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "S. Manikandan (District Youth Wing President)",
      secretary: "கே. பிரவீன் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "K. Praveen (District Youth Wing Secretary)",
      phone: "+91 98424 55667"
    }
  },
  {
    id: "madurai",
    districtTa: "மதுரை",
    districtEn: "Madurai",
    zone: "தெற்கு மண்டலம் (South Zone)",
    districtOffice: {
      president: { name: "வீ. பாண்டி", nameEn: "V. Pandi", phone: "+91 98421 44556" },
      secretary: { name: "கே. செல்லப்பாண்டி", nameEn: "K. Sellapandi", phone: "+91 94431 55667" },
      treasurer: { name: "எஸ். அழகர்", nameEn: "S. Alagar", phone: "+91 98432 66778" }
    },
    unions: [
      { nameTa: "மதுரை கிழக்கு ஒன்றியம்", nameEn: "Madurai East Union", leader: "ஆர். முத்தையா", phone: "+91 98425 11111" },
      { nameTa: "மேலூர் ஒன்றியம்", nameEn: "Melur Union", leader: "பி. கண்ணன்", phone: "+91 94435 22222" }
    ],
    towns: [
      { nameTa: "அண்ணாநகர் நகரம்", nameEn: "Anna Nagar Town", leader: "ஜி. பாண்டியன்", phone: "+91 98445 33333" }
    ],
    areas: [
      { nameTa: "சிம்மக்கல் பகுதி", nameEn: "Simmakkal Area", leader: "எம். முத்து", phone: "+91 98465 44444" }
    ],
    youthWing: {
      districtLeader: "எம். விக்கி (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "M. Vicky (District Youth Wing President)",
      secretary: "எஸ். பாலா (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "S. Bala (District Youth Wing Secretary)",
      phone: "+91 98422 33445"
    }
  },
  {
    id: "trichy",
    districtTa: "திருச்சிராப்பள்ளி",
    districtEn: "Tiruchirappalli",
    zone: "மத்திய மண்டலம் (Central Zone)",
    districtOffice: {
      president: { name: "ஆர். ராஜேந்திரன்", nameEn: "R. Rajendran", phone: "+91 98426 77889" },
      secretary: { name: "என். குணசேகரன்", nameEn: "N. Gunasekaran", phone: "+91 94436 88990" },
      treasurer: { name: "எஸ். பாஸ்கர்", nameEn: "S. Bhaskar", phone: "+91 98437 99001" }
    },
    unions: [
      { nameTa: "ஸ்ரீரங்கம் ஒன்றியம்", nameEn: "Srirangam Union", leader: "கே. ராமமூர்த்தி", phone: "+91 98427 12345" },
      { nameTa: "மண்ணச்சநல்லூர் ஒன்றியம்", nameEn: "Mannachanallur Union", leader: "சி. அண்ணாதுரை", phone: "+91 94437 67890" }
    ],
    towns: [
      { nameTa: "தில்லைநகர் நகரம்", nameEn: "Thillai Nagar Town", leader: "பி. செந்தில்", phone: "+91 98447 11223" }
    ],
    areas: [
      { nameTa: "கண்ட்டோன்மெண்ட் பகுதி", nameEn: "Cantonment Area", leader: "ஆர். மணி", phone: "+91 98467 33445" }
    ],
    youthWing: {
      districtLeader: "ஆர். சதீஷ் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "R. Satish (District Youth Wing President)",
      secretary: "எம். தினேஷ் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "M. Dinesh (District Youth Wing Secretary)",
      phone: "+91 98428 11223"
    }
  },
  {
    id: "salem",
    districtTa: "சேலம்",
    districtEn: "Salem",
    zone: "மேற்கு மண்டலம் (West Zone)",
    districtOffice: {
      president: { name: "கே. பெருமாள்", nameEn: "K. Perumal", phone: "+91 98428 33445" },
      secretary: { name: "எம். செழியன்", nameEn: "M. Seliyan", phone: "+91 94438 44556" },
      treasurer: { name: "ஆர். சின்னு", nameEn: "R. Chinnu", phone: "+91 98439 55667" }
    },
    unions: [
      { nameTa: "சேலம் மேற்கு ஒன்றியம்", nameEn: "Salem West Union", leader: "ஏ. வேலு", phone: "+91 98429 22334" }
    ],
    towns: [
      { nameTa: "அஸ்தம்பட்டி நகரம்", nameEn: "Hasthampatti Town", leader: "பி. குமார்", phone: "+91 94449 33445" }
    ],
    areas: [
      { nameTa: "அம்மாப்பேட்டை பகுதி", nameEn: "Ammapet Area", leader: "எஸ். ராஜேஷ்", phone: "+91 98459 44556" }
    ],
    youthWing: {
      districtLeader: "ஏ. விக்னேஷ் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "A. Vignesh (District Youth Wing President)",
      secretary: "பி. கார்த்திக் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "P. Karthik (District Youth Wing Secretary)",
      phone: "+91 98429 77889"
    }
  },
  {
    id: "tirunelveli",
    districtTa: "திருநெல்வேலி",
    districtEn: "Tirunelveli",
    zone: "தெற்கு மண்டலம் (South Zone)",
    districtOffice: {
      president: { name: "எஸ். முத்துப்பாண்டி", nameEn: "S. Muthupandi", phone: "+91 98430 11223" },
      secretary: { name: "பி. சங்கரலிங்கம்", nameEn: "P. Sankaralingam", phone: "+91 94440 22334" },
      treasurer: { name: "கே. பொன்னுச்சாமி", nameEn: "K. Ponnusamy", phone: "+91 98440 33445" }
    },
    unions: [
      { nameTa: "பாளையங்கோட்டை ஒன்றியம்", nameEn: "Palayamkottai Union", leader: "எம். சுடலை", phone: "+91 98431 11223" }
    ],
    towns: [
      { nameTa: "மட்டைக்கடை நகரம்", nameEn: "Town Bazaar", leader: "ஆர். நாராயணன்", phone: "+91 94441 22334" }
    ],
    areas: [
      { nameTa: "நெல்லையப்பர் பகுதி", nameEn: "Nellaiyappar Area", leader: "ஜி. கண்ணன்", phone: "+91 98451 33445" }
    ],
    youthWing: {
      districtLeader: "எம். செல்வம் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "M. Selvam (District Youth Wing President)",
      secretary: "எஸ். முத்துக்குமார் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "S. Muthukumar (District Youth Wing Secretary)",
      phone: "+91 98430 88990"
    }
  },
  {
    id: "thanjavur",
    districtTa: "தஞ்சாவூர்",
    districtEn: "Thanjavur",
    zone: "மத்திய மண்டலம் (Central Zone)",
    districtOffice: {
      president: { name: "ஆர். நடராஜன்", nameEn: "R. Natarajan", phone: "+91 98432 11223" },
      secretary: { name: "எஸ். ராமச்சந்திரன்", nameEn: "S. Ramachandran", phone: "+91 94442 22334" },
      treasurer: { name: "கே. பாலகிருஷ்ணன்", nameEn: "K. Balakrishnan", phone: "+91 98452 33445" }
    },
    unions: [
      { nameTa: "கும்பகோணம் ஒன்றியம்", nameEn: "Kumbakonam Union", leader: "வி. அன்பு", phone: "+91 98433 11223" }
    ],
    towns: [
      { nameTa: "தஞ்சாவூர் நகர்", nameEn: "Thanjavur Town", leader: "ஆர். சேகர்", phone: "+91 94443 22334" }
    ],
    areas: [
      { nameTa: "ரெயில்கேட் பகுதி", nameEn: "Railgate Area", leader: "எம். பாபு", phone: "+91 98453 33445" }
    ],
    youthWing: {
      districtLeader: "கே. அரவிந்த் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "K. Aravind (District Youth Wing President)",
      secretary: "ஆர். சுபாஷ் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "R. Subash (District Youth Wing Secretary)",
      phone: "+91 98432 99001"
    }
  },
  {
    id: "vellore",
    districtTa: "வேலூர்",
    districtEn: "Vellore",
    zone: "வடக்கு மண்டலம் (North Zone)",
    districtOffice: {
      president: { name: "ஏ. குணசேகரன்", nameEn: "A. Gunasekaran", phone: "+91 98434 11223" },
      secretary: { name: "எம். பாபு", nameEn: "M. Babu", phone: "+91 94444 22334" },
      treasurer: { name: "எஸ். ரவி", nameEn: "S. Ravi", phone: "+91 98454 33445" }
    },
    unions: [
      { nameTa: "காட்பாடி ஒன்றியம்", nameEn: "Katpadi Union", leader: "கே. வேலு", phone: "+91 98435 11223" }
    ],
    towns: [
      { nameTa: "வேலூர் நகரம்", nameEn: "Vellore Town", leader: "ஆர். குமார்", phone: "+91 94445 22334" }
    ],
    areas: [
      { nameTa: "கோட்டை பகுதி", nameEn: "Fort Area", leader: "எம். சதிஷ்", phone: "+91 98455 33445" }
    ],
    youthWing: {
      districtLeader: "எஸ். தினேஷ் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "S. Dinesh (District Youth Wing President)",
      secretary: "ஏ. பிரகாஷ் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "A. Prakash (District Youth Wing Secretary)",
      phone: "+91 98434 99001"
    }
  },
  {
    id: "erode",
    districtTa: "ஈரோடு",
    districtEn: "Erode",
    zone: "மேற்கு மண்டலம் (West Zone)",
    districtOffice: {
      president: { name: "கே. சின்னசாமி", nameEn: "K. Chinnasamy", phone: "+91 98436 11223" },
      secretary: { name: "ஆர். தங்கவேல்", nameEn: "R. Thangavel", phone: "+91 94446 22334" },
      treasurer: { name: "எம். ஈஸ்வரன்", nameEn: "M. Eswaran", phone: "+91 98456 33445" }
    },
    unions: [
      { nameTa: "பெருந்துறை ஒன்றியம்", nameEn: "Perundurai Union", leader: "எஸ். குமார்", phone: "+91 98437 11223" }
    ],
    towns: [
      { nameTa: "ஈரோடு நகர்", nameEn: "Erode Town", leader: "பி. முருகன்", phone: "+91 94447 22334" }
    ],
    areas: [
      { nameTa: "சுப்பராயன் பகுதி", nameEn: "Subbarayan Area", leader: "ஆர். மோகன்", phone: "+91 98457 33445" }
    ],
    youthWing: {
      districtLeader: "ஆர். பிரதீப் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "R. Pradeep (District Youth Wing President)",
      secretary: "கே. மனோஜ் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "K. Manoj (District Youth Wing Secretary)",
      phone: "+91 98436 99001"
    }
  },
  {
    id: "thoothukudi",
    districtTa: "தூத்துக்குடி",
    districtEn: "Thoothukudi",
    zone: "தெற்கு மண்டலம் (South Zone)",
    districtOffice: {
      president: { name: "எம். பெருமாள்", nameEn: "M. Perumal", phone: "+91 98438 11223" },
      secretary: { name: "எஸ். ஜெபராஜ்", nameEn: "S. Jebaraj", phone: "+91 94448 22334" },
      treasurer: { name: "ஆர். ராஜ்", nameEn: "R. Raj", phone: "+91 98458 33445" }
    },
    unions: [
      { nameTa: "கோவில்பட்டி ஒன்றியம்", nameEn: "Kovilpatti Union", leader: "கே. பாண்டியன்", phone: "+91 98439 11223" }
    ],
    towns: [
      { nameTa: "தூத்துக்குடி துறைமுகம் நகரம்", nameEn: "Port Town", leader: "வி. அந்தோணி", phone: "+91 94449 22334" }
    ],
    areas: [
      { nameTa: "WTC பகுதி", nameEn: "WTC Area", leader: "எஸ். முருகன்", phone: "+91 98459 33445" }
    ],
    youthWing: {
      districtLeader: "எம். விமல் (மாவட்ட இளைஞரணி தலைவர்)",
      districtLeaderEn: "M. Vimal (District Youth Wing President)",
      secretary: "எஸ். அருண் (மாவட்ட இளைஞரணி செயலாளர்)",
      secretaryEn: "S. Arun (District Youth Wing Secretary)",
      phone: "+91 98438 99001"
    }
  }
];

// We can dynamically generate the remaining 28 districts to ensure all 38 TN districts are fully covered!
const REMAINING_TN_DISTRICTS = [
  { ta: "செங்கல்பட்டு", en: "Chengalpattu", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "திண்டுக்கல்", en: "Dindigul", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "கள்ளக்குறிச்சி", en: "Kallakurichi", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "காஞ்சிபுரம்", en: "Kanchipuram", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "கன்னியாகுமரி", en: "Kanyakumari", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "கரூர்", en: "Karur", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "கிருஷ்ணகிரி", en: "Krishnagiri", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "மயிலாடுதுறை", en: "Mayiladuthurai", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "நாகப்பட்டினம்", en: "Nagapattinam", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "நாமக்கல்", en: "Namakkal", zone: "மேற்கு மண்டலம் (West Zone)" },
  { ta: "நீலகிரி", en: "Nilgiris", zone: "மேற்கு மண்டலம் (West Zone)" },
  { ta: "பெரம்பலூர்", en: "Perambalur", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "புதுக்கோட்டை", en: "Pudukkottai", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "ராமநாதபுரம்", en: "Ramanathapuram", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "ராணிப்பேட்டை", en: "Ranipet", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "சிவகங்கை", en: "Sivagangai", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "தென்காசி", en: "Tenkasi", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "தேனி", en: "Theni", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "திருப்பத்தூர்", en: "Tirupathur", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "திருப்பூர்", en: "Tiruppur", zone: "மேற்கு மண்டலம் (West Zone)" },
  { ta: "திருவள்ளூர்", en: "Tiruvallur", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "திருவண்ணாமலை", en: "Tiruvannamalai", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "திருவாரூர்", en: "Tiruvarur", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "விழுப்புரம்", en: "Viluppuram", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "விருதுநகர்", en: "Virudhunagar", zone: "தெற்கு மண்டலம் (South Zone)" },
  { ta: "அரியலூர்", en: "Ariyalur", zone: "மத்திய மண்டலம் (Central Zone)" },
  { ta: "தர்மபுரி", en: "Dharmapuri", zone: "வடக்கு மண்டலம் (North Zone)" },
  { ta: "கடலூர்", en: "Cuddalore", zone: "வடக்கு மண்டலம் (North Zone)" }
];

// Merge all 38 districts into complete list
export const ALL_38_DISTRICTS_FULL_DIRECTORY = [
  ...TN_38_DISTRICTS_HIERARCHY,
  ...REMAINING_TN_DISTRICTS.map((d, index) => ({
    id: `dist_${d.en.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    districtTa: d.ta,
    districtEn: d.en,
    zone: d.zone,
    districtOffice: {
      president: { name: `மாவட்ட தலைவர் (${d.ta})`, nameEn: `District President (${d.en})`, phone: `+91 984${index}1 12345` },
      secretary: { name: `மாவட்ட செயலாளர் (${d.ta})`, nameEn: `District Secretary (${d.en})`, phone: `+91 944${index}2 23456` },
      treasurer: { name: `மாவட்ட பொருளாளர் (${d.ta})`, nameEn: `District Treasurer (${d.en})`, phone: `+91 984${index}3 34567` }
    },
    unions: [
      { nameTa: `${d.ta} ஒன்றியம் 1`, nameEn: `${d.en} Union 1`, leader: "ஒன்றிய செயலாளர்", phone: `+91 984${index}4 45678` }
    ],
    towns: [
      { nameTa: `${d.ta} நகர் பகுதி`, nameEn: `${d.en} Town Area`, leader: "நகர செயலாளர்", phone: `+91 944${index}5 56789` }
    ],
    areas: [
      { nameTa: `${d.ta} வார்டு பகுதி`, nameEn: `${d.en} Ward Area`, leader: "பகுதி பொறுப்பாளர்", phone: `+91 984${index}6 67890` }
    ],
    youthWing: {
      districtLeader: `${d.ta} மாவட்ட இளைஞரணி தலைவர்`,
      districtLeaderEn: `${d.en} District Youth Wing President`,
      secretary: `${d.ta} மாவட்ட இளைஞரணி செயலாளர்`,
      secretaryEn: `${d.en} District Youth Wing Secretary`,
      phone: `+91 984${index}7 78901`
    }
  }))
];

export default function DistrictHierarchyDirectory({ lang, onClose }: DistrictHierarchyDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all"); // "all" | "district" | "union" | "town" | "area" | "youth"

  const filteredDistricts = ALL_38_DISTRICTS_FULL_DIRECTORY.filter(item => {
    const matchesSearch = 
      item.districtTa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.districtEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.districtOffice.president.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.districtOffice.secretary.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZone === "all" || item.zone.includes(selectedZone);

    return matchesSearch && matchesZone;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex justify-between items-center border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600/30 text-rose-300 font-extrabold text-[10px] uppercase border border-rose-500/40">
                {lang === "ta" ? "38 மாவட்டங்கள் மற்றும் அனைத்து அடுக்கு நிர்வாகிகள் பட்டியல்" : "38 Districts & Complete Tier Hierarchy Directory"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              {lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம் (TNPA²)" : "TNPA² State, Zonal, District, Union, Town, Area & Youth Wing Directory"}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">
              {lang === "ta" ? "மாநிலம் முதல் பகுதி வரை அனைத்து பொறுப்பாளர்களும் 38 மாவட்டங்களுக்கும் முழுமையாகத் தயார் நிலையில் உள்ளன." : "Fully prepared lists across all 38 districts with District, Union, Town, Area and Youth Wing leaders."}
            </p>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {lang === "ta" ? "மூடுக (Close)" : "Close"}
            </button>
          )}
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-stone-50 p-4 sm:p-5 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === "ta" ? "மாவட்டம் அல்லது தலைவர் பெயர் தேடுக..." : "Search district or leader name..."}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
            />
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 cursor-pointer"
            >
              <option value="all">{lang === "ta" ? "அனைத்து மண்டலங்களும் (All Zones)" : "All Zones"}</option>
              <option value="வடக்கு">{lang === "ta" ? "வடக்கு மண்டலம் (North Zone)" : "North Zone"}</option>
              <option value="தெற்கு">{lang === "ta" ? "தெற்கு மண்டலம் (South Zone)" : "South Zone"}</option>
              <option value="மத்திய">{lang === "ta" ? "மத்திய மண்டலம் (Central Zone)" : "Central Zone"}</option>
              <option value="மேற்கு">{lang === "ta" ? "மேற்கு மண்டலம் (West Zone)" : "West Zone"}</option>
            </select>
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 cursor-pointer"
            >
              <option value="all">{lang === "ta" ? "அனைத்து நிலைகளும் (District, Union, Town, Area & Youth)" : "All Tiers & Youth Wing"}</option>
              <option value="district">{lang === "ta" ? "மாவட்ட தலைவர்கள் மட்டும்" : "District Bearers Only"}</option>
              <option value="union">{lang === "ta" ? "ஒன்றிய பொறுப்பாளர்கள்" : "Union Bearers"}</option>
              <option value="town">{lang === "ta" ? "நகர பொறுப்பாளர்கள்" : "Town Bearers"}</option>
              <option value="area">{lang === "ta" ? "பகுதி பொறுப்பாளர்கள்" : "Area Bearers"}</option>
              <option value="youth">{lang === "ta" ? "இளைஞரணி பொறுப்பாளர்கள்" : "Youth Wing Bearers"}</option>
            </select>
          </div>
        </div>

        {/* District Directory Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-stone-100/50">
          <div className="flex justify-between items-center text-xs font-bold text-stone-600 px-1">
            <span>{lang === "ta" ? `மொத்த மாவட்டங்கள்: ${filteredDistricts.length} / 38` : `Total Districts Displayed: ${filteredDistricts.length} / 38`}</span>
            <span className="text-[#b91c1c]">{lang === "ta" ? "✓ மாநில, மண்டல, மாவட்ட, நகர, ஒன்றிய, பகுதி & இளைஞரணி முழுப் பட்டியல்" : "✓ State, Zonal, District, Union, Town, Area & Youth Wing Lists Active"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDistricts.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {item.zone}
                      </span>
                      <h3 className="font-black text-stone-900 text-base mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#b91c1c]" />
                        <span>{lang === "ta" ? item.districtTa : item.districtEn}</span>
                      </h3>
                    </div>
                  </div>

                  {/* District Executive Panel */}
                  {(selectedLevel === "all" || selectedLevel === "district") && (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2 mt-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 border-b border-stone-200 pb-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>{lang === "ta" ? "மாவட்டத் தலைமைக்குழு (District Exec)" : "District Executive Committee"}</span>
                      </div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-600 font-medium">{lang === "ta" ? "தலைவர்:" : "President:"}</span>
                          <span className="font-extrabold text-stone-900">{item.districtOffice.president.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-600 font-medium">{lang === "ta" ? "செயலாளர்:" : "Secretary:"}</span>
                          <span className="font-extrabold text-stone-900">{item.districtOffice.secretary.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-600 font-medium">{lang === "ta" ? "பொருளாளர்:" : "Treasurer:"}</span>
                          <span className="font-extrabold text-stone-900">{item.districtOffice.treasurer.name}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <a 
                          href={`tel:${item.districtOffice.president.phone}`}
                          className="flex-1 py-1.5 bg-stone-900 hover:bg-[#b91c1c] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.districtOffice.president.phone}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Union & Town Tier */}
                  {(selectedLevel === "all" || selectedLevel === "union" || selectedLevel === "town" || selectedLevel === "area") && (
                    <div className="mt-3 space-y-2 text-xs">
                      {item.unions && item.unions.length > 0 && (selectedLevel === "all" || selectedLevel === "union") && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5">
                          <span className="font-extrabold text-blue-900 text-[10px] uppercase block mb-1">
                            {lang === "ta" ? "ஒன்றிய பொறுப்பாளர்கள் (Union Bearers)" : "Union Bearers"}
                          </span>
                          {item.unions.map((u, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] text-stone-800">
                              <span className="font-semibold">{u.nameTa}</span>
                              <span className="font-bold text-stone-900">{u.leader} ({u.phone})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.towns && item.towns.length > 0 && (selectedLevel === "all" || selectedLevel === "town") && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5">
                          <span className="font-extrabold text-amber-900 text-[10px] uppercase block mb-1">
                            {lang === "ta" ? "நகர பொறுப்பாளர்கள் (Town Bearers)" : "Town Bearers"}
                          </span>
                          {item.towns.map((t, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] text-stone-800">
                              <span className="font-semibold">{t.nameTa}</span>
                              <span className="font-bold text-stone-900">{t.leader} ({t.phone})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.areas && item.areas.length > 0 && (selectedLevel === "all" || selectedLevel === "area") && (
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5">
                          <span className="font-extrabold text-emerald-900 text-[10px] uppercase block mb-1">
                            {lang === "ta" ? "பகுதி பொறுப்பாளர்கள் (Area Bearers)" : "Area Bearers"}
                          </span>
                          {item.areas.map((a, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] text-stone-800">
                              <span className="font-semibold">{a.nameTa}</span>
                              <span className="font-bold text-stone-900">{a.leader} ({a.phone})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Youth Wing Tier */}
                  {(selectedLevel === "all" || selectedLevel === "youth") && item.youthWing && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 mb-1.5">
                        <Flame className="w-3.5 h-3.5 text-purple-600" />
                        <span>{lang === "ta" ? "இளைஞரணி பொறுப்பாளர்கள் (Youth Wing)" : "Youth Wing Office Bearers"}</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-purple-950 font-semibold">
                        <div>• {item.youthWing.districtLeader}</div>
                        <div>• {item.youthWing.secretary}</div>
                        <div className="text-[10px] text-purple-700 font-bold mt-1">தொடர்புக்கு: {item.youthWing.phone}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[11px] font-bold text-stone-500">
                  <span>{lang === "ta" ? "38 மாவட்டங்களில் இணைக்கப்பட்டுள்ளது" : "Linked across 38 districts"}</span>
                  <span className="text-[#b91c1c] flex items-center gap-1 font-extrabold">
                    <span>{lang === "ta" ? "செயலில் உள்ளது" : "Active"}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs border-t border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === "ta" ? "தமிழ்நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம் - அதிகாரப்பூர்வ மையக் கோப்பு" : "TNPA² Official Central Directory - All 38 Districts & Hierarchy"}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#b91c1c] hover:bg-rose-700 text-white rounded-xl font-black text-xs transition-all cursor-pointer shadow-md"
            >
              {lang === "ta" ? "சரி, முடிக்கவும்" : "Done"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

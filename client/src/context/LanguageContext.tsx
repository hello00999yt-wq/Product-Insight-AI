import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Help AI
  "ai.title": { en: "Help AI", hi: "सहायक AI" },
  "ai.subtitle": { en: "Product Authenticity Assistant", hi: "उत्पाद प्रामाणिकता सहायक" },
  "ai.welcome": {
    en: "Hello 👋 I am Help AI. Ask me anything about products — I can help you detect fakes, understand MRP, check market prices, and protect yourself as a consumer!",
    hi: "नमस्ते 👋 मैं सहायक AI हूँ। उत्पादों के बारे में कुछ भी पूछें — मैं नकली उत्पाद पहचानने, MRP समझने, बाजार मूल्य जांचने और उपभोक्ता के रूप में आपकी सुरक्षा में मदद कर सकता हूँ!",
  },
  "ai.placeholder": { en: "Ask about any product...", hi: "किसी भी उत्पाद के बारे में पूछें..." },
  "ai.btn": { en: "Help AI", hi: "सहायक AI" },
  "ai.quick1": { en: "How to detect fake products?", hi: "नकली उत्पाद कैसे पहचानें?" },
  "ai.quick2": { en: "What is MRP?", hi: "MRP क्या है?" },
  "ai.quick3": { en: "How to check brand authenticity?", hi: "ब्रांड की असलियत कैसे जांचें?" },
  "ai.quick4": { en: "Consumer safety tips", hi: "उपभोक्ता सुरक्षा सुझाव" },

  // Navbar
  "nav.toggle_hi": { en: "हिंदी", hi: "हिंदी" },
  "nav.toggle_en": { en: "English", hi: "English" },
  "nav.home": { en: "Home", hi: "होम" },
  "nav.about": { en: "About Me", hi: "मेरे बारे में" },

  // Home Hero
  "home.badge": { en: "AI-Powered Transparency", hi: "AI-संचालित पारदर्शिता" },
  "home.title1": { en: "Identify", hi: "पहचानें" },
  "home.title2": { en: "Real vs Fake", hi: "असली vs नकली" },
  "home.title3": { en: "Products Instantly", hi: "उत्पाद तुरंत" },
  "home.subtitle": {
    en: "Upload a photo of any product to get instant details, price comparisons, and AI-driven authenticity checks.",
    hi: "किसी भी उत्पाद की फोटो अपलोड करें और तुरंत विवरण, मूल्य तुलना, और AI-आधारित प्रामाणिकता जांच पाएं।",
  },
  "home.about_btn": { en: "About Me", hi: "मेरे बारे में" },

  // Features
  "feature.recognition.title": { en: "Instant Recognition", hi: "तुरंत पहचान" },
  "feature.recognition.desc": {
    en: "Our AI instantly identifies brand, model, and variant from a single photo.",
    hi: "हमारा AI एक फोटो से ब्रांड, मॉडल और वेरिएंट को तुरंत पहचानता है।",
  },
  "feature.fake.title": { en: "Fake Detection", hi: "नकली उत्पाद की पहचान" },
  "feature.fake.desc": {
    en: "Advanced algorithms analyze visual cues to estimate the risk of a counterfeit product.",
    hi: "उन्नत एल्गोरिदम दृश्य संकेतों का विश्लेषण कर नकली उत्पाद के जोखिम का अनुमान लगाते हैं।",
  },
  "feature.price.title": { en: "Price Check", hi: "मूल्य जांच" },
  "feature.price.desc": {
    en: "Compare MRP with real market rates to ensure you're paying a fair price.",
    hi: "MRP को बाजार मूल्य से तुलना करें और सुनिश्चित करें कि आप उचित मूल्य दे रहे हैं।",
  },

  // Recent Scans
  "home.recent": { en: "Recent Scans", hi: "हाल की स्कैन" },
  "home.no_scans": {
    en: "No recent scans yet. Upload your first product!",
    hi: "अभी कोई स्कैन नहीं है। अपना पहला उत्पाद अपलोड करें!",
  },

  // Upload
  "upload.title": { en: "Upload Product Image", hi: "उत्पाद की फोटो अपलोड करें" },
  "upload.subtitle": {
    en: "Drag & drop or click to select a photo of the product you want to verify.",
    hi: "जिस उत्पाद की जांच करनी हो उसकी फोटो खींचें और छोड़ें या क्लिक करें।",
  },

  // About
  "about.title": { en: "MY INFORMATION", hi: "मेरी जानकारी" },
  "about.name": { en: "Name", hi: "नाम" },
  "about.age": { en: "Age", hi: "आयु" },
  "about.age_val": { en: "14 Years", hi: "14 वर्ष" },
  "about.school": { en: "School", hi: "विद्यालय" },
  "about.father": { en: "Father", hi: "पिता" },
  "about.mother": { en: "Mother", hi: "माता" },
  "about.edu.title": { en: "My Education", hi: "मेरी शिक्षा" },
  "about.edu.content": {
    en: "I am currently studying in Class 10 at Selda Mal High School, and along with my studies, I have also worked under CodeYogi, where I learned web development.",
    hi: "मैं वर्तमान में सेल्डा माल हाई स्कूल में कक्षा 10 में पढ़ रहा हूँ, और अपनी पढ़ाई के साथ-साथ मैंने CodeYogi के अंतर्गत वेब डेवलपमेंट भी सीखा है।",
  },
  "about.location.title": { en: "My Current Location", hi: "मेरा वर्तमान स्थान" },
  "about.location.content": { en: "Selda Mal, District Khandwa", hi: "सेल्डा माल, जिला खंडवा" },
  "about.interests.title": { en: "Interests", hi: "रुचियाँ" },
  "about.interests.content": {
    en: "I have been interested in cricket since childhood, and when I came to know about CodeYogi through my school, I also started it and developed a great interest in it.",
    hi: "मुझे बचपन से क्रिकेट में रुचि है, और जब मुझे अपने स्कूल के माध्यम से CodeYogi के बारे में पता चला, तो मैंने इसे भी शुरू किया और इसमें बहुत रुचि विकसित की।",
  },
  "about.hobbies.title": { en: "Hobbies", hi: "शौक" },
  "about.hobbies.content": {
    en: "My hobbies are drawing, playing cricket, coding, and learning about new technologies.",
    hi: "मेरे शौक हैं: चित्र बनाना, क्रिकेट खेलना, कोडिंग करना और नई तकनीकों के बारे में सीखना।",
  },
  "about.journey.title": { en: "Journey to Coding", hi: "कोडिंग की यात्रा" },
  "about.journey.content": {
    en: "I came to know about CodeYogi through my High School Selda Mal. With the help of CodeYogi, I learned how to code, gained knowledge about the new technological world, and also learned web development.",
    hi: "मुझे हाई स्कूल सेल्डा माल के माध्यम से CodeYogi के बारे में पता चला। CodeYogi की मदद से मैंने कोड करना सीखा, नई तकनीकी दुनिया के बारे में ज्ञान प्राप्त किया और वेब डेवलपमेंट भी सीखा।",
  },
  "about.project.title": { en: "Project Overview", hi: "परियोजना अवलोकन" },
  "about.project.content": {
    en: "This Project is an Image Recognition + Product Transparency Platform. On this platform, customers can upload a photo of any product. With the help of advanced image recognition technology, the system identifies the product and displays complete, verified, and reliable information related to it.\n\nThe main objective of this platform is to provide customers with accurate, transparent, and trustworthy information so that they can:\n• Avoid purchasing counterfeit products,\n• Avoid paying unnecessarily high prices,\n• Stay protected from fraud and exploitation,\n• Make informed and conscious purchasing decisions.\n\nBy providing verified product information, this platform aims to prevent consumer exploitation and promote transparency and fairness in the marketplace.",
    hi: "यह परियोजना एक इमेज रिकग्निशन + उत्पाद पारदर्शिता मंच है। इस मंच पर ग्राहक किसी भी उत्पाद की फोटो अपलोड कर सकते हैं। उन्नत इमेज रिकग्निशन तकनीक की मदद से सिस्टम उत्पाद की पहचान करता है और उससे संबंधित पूर्ण, सत्यापित और विश्वसनीय जानकारी प्रदर्शित करता है।\n\nइस मंच का मुख्य उद्देश्य ग्राहकों को सटीक, पारदर्शी और भरोसेमंद जानकारी प्रदान करना है ताकि वे:\n• नकली उत्पाद खरीदने से बच सकें,\n• अनावश्यक रूप से अधिक कीमत चुकाने से बच सकें,\n• धोखाधड़ी और शोषण से सुरक्षित रह सकें,\n• सूचित और सचेत खरीद निर्णय ले सकें।\n\nसत्यापित उत्पाद जानकारी प्रदान करके यह मंच उपभोक्ता शोषण को रोकने और बाज़ार में पारदर्शिता एवं निष्पक्षता को बढ़ावा देने का लक्ष्य रखता है।",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "en";
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("lang", next);
      return next;
    });
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

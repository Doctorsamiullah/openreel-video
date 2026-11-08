import React, { useState } from "react";
import { BookOpen, ExternalLink, Search, Sparkles, Volume2, Film, Globe, Bot, Keyboard, ShieldCheck } from "@/icons/lucide-compat";

interface HelpSection {
  id: string;
  title: string;
  icon: typeof BookOpen;
  summary: string;
  points: string[];
}

const SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "1. परिचय एवं मुख्य विशेषताएँ (Overview)",
    icon: Sparkles,
    summary: "सामी वीडियो एडिटर एक लोकल-फर्स्ट, सुरक्षित और आधुनिक वीडियो एडिटर है।",
    points: [
      "नॉन-डिस्ट्रक्टिव एडिटिंग: आपकी मूल वीडियो या ऑडियो फ़ाइल कभी डिलीट या ओवरराइट नहीं होती।",
      "100% डेटा गोपनीयता: सारा प्रोजेक्ट डेटा आपके कंप्यूटर पर ही रहता है।",
      "हार्डवेयर एक्सेलेरेशन: Intel UHD और NVIDIA RTX 5050 (WebGPU, WebCodecs) का पूर्ण समर्थन।",
      "ऑफलाइन मोड: इंटरनेट के बिना भी कटिंग, ट्रांजिशन, इफेक्ट्स और ऑडियो सिंथेसिस पूरी तरह चालू रहता है।",
    ],
  },
  {
    id: "modes",
    title: "2. ऐप शुरू करने के तरीके (Launch Modes)",
    icon: Film,
    summary: "डेस्कटॉप ऐप मोड या नेटिव इलेक्ट्रॉन शेल में चलाने के आसान विकल्प।",
    points: [
      "Windows App Mode: डेस्कटॉप पर 'Video Studio.lnk' या 'Run-Video-Studio.bat' पर क्लिक करें। यह बिना किसी ब्राउज़र बार के एक शुद्ध स्टैंडअलोन ऐप की तरह खुलता है।",
      "Electron Native Mode: 'Video Studio (Electron).lnk' या 'Run-Video-Studio-Electron.bat' पर क्लिक करें।",
      "वेब ब्राउज़र: किसी भी ब्राउज़र में http://localhost:5173/#/editor खोलें।",
    ],
  },
  {
    id: "stem-separation",
    title: "3. ऑडियो एवं वोकल सेपरेशन (Music vs Voice)",
    icon: Volume2,
    summary: "किसी भी गाने या वीडियो में से आवाज (Voice) और बैकग्राउंड म्यूजिक को अलग-अलग करें।",
    points: [
      "टाइमलाइन पर किसी भी क्लिप को सेलेक्ट करें और Inspector में 'Audio' पर जाएं।",
      "'Separate Vocals & Music' बटन पर क्लिक करें।",
      "Voice Volume Slider (0% - 150%) से गायक या बोलने वाले की आवाज़ एडजस्ट करें।",
      "Music Volume Slider (0% - 150%) से बैकग्राउंड म्यूज़िक को कम या म्यूट करें।",
      "वेवफॉर्म विजुअलाइज़र और Solo/Mute बटन का उपयोग करें।",
    ],
  },
  {
    id: "auto-captions",
    title: "4. AI ऑटो-कैप्शन और सबटाइटल (Auto-Captions)",
    icon: Bot,
    summary: "Whisper AI द्वारा बोले गए शब्दों को पहचानकर सटीक सबटाइटल जोड़ना व हटाना।",
    points: [
      "क्लिप सेलेक्ट करके Inspector ➔ 'AI' ➔ 'Auto Caption' पर जाएं।",
      "भाषा चुनें (हिंदी, इंग्लिश, उर्दू RTL आदि) और 'Generate Captions' पर क्लिक करें।",
      "कैप्शन स्टाइलिंग: फॉन्ट, टेक्स्ट रंग, बैकग्राउंड बॉक्स और एनीमेशन कस्टमाइज़ करें।",
      "एक क्लिक में सभी कैप्शन हटाएं: लाल रंग के 'Remove All Captions from Timeline' बटन पर क्लिक करें।",
    ],
  },
  {
    id: "voice-translation",
    title: "5. आवाज अनुवाद और बहुभाषी डबिंग (Voice Translation)",
    icon: Globe,
    summary: "वीडियो की आवाज को 20+ भाषाओं में ट्रांसलेट करके नई डबिंग ट्रैक बनाएं।",
    points: [
      "Inspector में 'Voice Translation' पर जाएं और लक्षित भाषा (Target Language) चुनें।",
      "कनेक्टेड AI (Google Gemini या Local Ollama) से तुरंत अनुवाद करवाएं।",
      "'Add Dubbing to Timeline' बटन दबाकर अनुवादित आवाज़ को नए ट्रैक पर जोड़ें।",
    ],
  },
  {
    id: "presets",
    title: "6. वीडियो इफ़ेक्ट्स, टेक्स्ट और एडिटिंग प्रीसेट्स",
    icon: Sparkles,
    summary: "30+ से अधिक रेडीमेड प्रीसेट्स जो मैनुअल एडिटिंग को एक-क्लिक AI जैसा बनाते हैं।",
    points: [
      "कलर प्रीसेट्स: Cinematic Teal & Orange, Vintage 90s Film, Warm Golden Hour, Cyberpunk Neon।",
      "टेक्स्ट प्रीसेट्स: Lower Thirds, Kinetic Typography, Gradient Glow Titles।",
      "ट्रांजिशन प्रीसेट्स: Whip Pan, Zoom In/Out, Glitch Dissolve।",
    ],
  },
  {
    id: "online-effects",
    title: "7. ऑनलाइन इफ़ेक्ट्स और रॉयल्टी-फ्री मीडिया (🌐)",
    icon: Globe,
    summary: "Jitter, Pixabay, VideoEffects, Renderforest, Uppbeat से डायरेक्ट रिसोर्सेज।",
    points: [
      "लेफ्ट साइडबार में ग्लोब (🌐) आइकन पर क्लिक करें।",
      "Jitter Motion Templates, Pixabay Video/Audio Effects, VideoEffects.com ब्राउज़ करें।",
      "डायरेक्ट डाउनलोडर: किसी भी MP4/MP3 लिंक को पेस्ट करके तुरंत प्रोजेक्ट में इम्पोर्ट करें।",
      "ऑफलाइन वेब ऑडियो सिंथेसाइज़र से 44.1kHz टोन व बीप जनरेट करें।",
    ],
  },
  {
    id: "ai-hub",
    title: "8. मुफ़्त AI मॉडल कनेक्शन हब (Free AI Setup)",
    icon: ShieldCheck,
    summary: "Google Gemini (1M TPM फ्री), Local Ollama, Groq को आसानी से जोड़ें।",
    points: [
      "Google Gemini: aistudio.google.com से फ्री API Key जोड़ें (10 लाख टोकन/मिनट फ्री)।",
      "Local Ollama: localhost:11434 पर 100% ऑफ़लाइन बिना किसी API Key के चलाएं।",
      "Groq / OpenRouter: सुपर-फास्ट प्रोसेसिंग के लिए फ्री कनेक्शन।",
      "सुरक्षा: API Key कभी भी असुरक्षित लोकल स्टोरेज में सेव नहीं होती।",
    ],
  },
  {
    id: "shortcuts",
    title: "9. मुख्य कीबोर्ड शॉर्टकट (Keyboard Shortcuts)",
    icon: Keyboard,
    summary: "तेज़ और सुगम संपादन के लिए आवश्यक शॉर्टकट कीज।",
    points: [
      "Space: प्ले (Play) / पॉज़ (Pause)",
      "S: प्लेहेड पर क्लिप को काटें (Split Clip)",
      "Delete: चुनी हुई क्लिप हटाएं (Delete)",
      "Ctrl + Z / Ctrl + Y: पूर्ववत (Undo) / पुनः (Redo)",
      "Ctrl + D: क्लिप डुप्लीकेट करें (Duplicate)",
      "Ctrl + Scroll: टाइमलाइन ज़ूम इन / ज़ूम आउट",
      "Home / End: शुरुआत / अंत में जाएं",
    ],
  },
];

export const HelpGuidePanel: React.FC = () => {
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string>("overview");

  const filtered = SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase()) ||
      s.points.some((p) => p.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4 py-2 text-sm text-foreground">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base text-foreground">सामी वीडियो एडिटर — उपयोगकर्ता सहायता एवं गाइड</span>
          </div>
          <a
            href="/HELP_HINDI.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-2 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-bg-3"
          >
            <span>पूर्ण गाइड खोलें</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          यहाँ ऐप के सभी प्रमुख फीचर्स, ऑडियो सेपरेशन, AI ऑटो-कैप्शन, वॉइस अनुवाद, और कीबोर्ड शॉर्टकट की संपूर्ण जानकारी हिंदी में दी गई है।
        </p>

        {/* Search Input */}
        <div className="relative mt-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="फ़ीचर या शॉर्टकट खोजें (जैसे: कैप्शन, ऑडियो, सेपरेशन, शॉर्टकट)..."
            className="w-full rounded-md border border-border bg-bg-1 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-2">
        {filtered.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id || search.length > 0;
          return (
            <div
              key={section.id}
              className="rounded-lg border border-border bg-bg-1 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenSection(isOpen && !search ? "" : section.id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-bg-2 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{section.title}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{section.summary}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border bg-bg-0/50 px-4 py-3">
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {section.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Volume2, VolumeX } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LANG_VOICE_MAP: Record<string, string> = {
  en: "en-US", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN",
  bn: "bn-IN", pa: "pa-IN", te: "te-IN", ur: "ur-PK",
};

export default function HelpAI() {
  const { t, lang } = useLang();
  const QUICK_REPLIES = [
    t("ai.quick1"), t("ai.quick2"), t("ai.quick3"), t("ai.quick4"),
  ];

  const [isOpen, setIsOpen]         = useState(false);
  const [messages, setMessages]     = useState<Message[]>([{ role: "assistant", content: t("ai.welcome") }]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [ttsSupported]              = useState(() => "speechSynthesis" in window);
  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null);

  /* ── Scroll to bottom on new message ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Focus input on open ── */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  /* ── Open via custom event (from inline button) ── */
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openHelpAI", handler);
    return () => window.removeEventListener("openHelpAI", handler);
  }, []);

  /* ── Reset welcome message & stop speech on lang change ── */
  useEffect(() => {
    stopSpeaking();
    setMessages([{ role: "assistant", content: t("ai.welcome") }]);
  }, [lang]);

  /* ── Stop speech when chat is closed ── */
  useEffect(() => {
    if (!isOpen) stopSpeaking();
  }, [isOpen]);

  /* ── Stop speech on unmount ── */
  useEffect(() => () => stopSpeaking(), []);

  /* ── TTS helpers ── */
  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingIdx(null);
  }, [ttsSupported]);

  const speak = useCallback((text: string, msgIndex: number) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingIdx(msgIndex);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = LANG_VOICE_MAP[lang] ?? "hi-IN";
    utterance.rate  = 0.92;
    utterance.pitch = 1.05;

    /* Pick the best matching voice, fall back to en-US */
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const targetLang = (LANG_VOICE_MAP[lang] ?? "hi-IN").split("-")[0];
      const matched =
        voices.find((v) => v.lang === utterance.lang) ||
        voices.find((v) => v.lang.startsWith(targetLang)) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (matched) utterance.voice = matched;

      utterance.onend   = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", setVoiceAndSpeak, { once: true });
    }
  }, [lang, ttsSupported]);

  /* ── Send message ── */
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    stopSpeaking();

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          lang,
        }),
      });
      const data = await res.json();
      const reply = data.message as string;

      setMessages((prev) => {
        const updated = [...prev, { role: "assistant" as const, content: reply }];
        /* Auto-speak after state settles */
        setTimeout(() => speak(reply, updated.length - 1), 80);
        return updated;
      });
    } catch {
      const errMsg = "Sorry, something went wrong. Please try again.";
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant" as const, content: errMsg }];
        setTimeout(() => speak(errMsg, updated.length - 1), 80);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 z-50 flex flex-col"
            style={{
              width: "min(100vw, 380px)",
              height: "min(100vh, 580px)",
              background: "#0a0a0a",
              border: "1px solid #00ff8830",
              borderRadius: "16px 16px 0 0",
              boxShadow: "0 0 40px #00ff8820, -4px 0 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-t-2xl flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00ff88, #00cc6a)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="font-bold text-black text-sm">{t("ai.title")}</p>
                  <p className="text-black/70 text-xs">{t("ai.subtitle")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Global mute / stop speaking button */}
                {ttsSupported && speakingIdx !== null && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={stopSpeaking}
                    data-testid="button-stop-tts"
                    className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
                    title="Stop speaking"
                  >
                    <VolumeX className="w-4 h-4 text-black" />
                  </motion.button>
                )}
                <button
                  data-testid="button-close-chat"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot avatar */}
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: "#00ff8820", border: "1px solid #00ff8840" }}
                    >
                      <Bot className="w-4 h-4" style={{ color: "#00ff88" }} />
                    </div>
                  )}

                  {/* Bubble + speaker */}
                  <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[78%]`}>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? { background: "linear-gradient(135deg,#00ff88,#00cc6a)", color: "#000", borderBottomRightRadius: "4px" }
                          : { background: "#1a1a1a", color: "#e0e0e0", border: "1px solid #00ff8820", borderBottomLeftRadius: "4px" }
                      }
                    >
                      {msg.role === "assistant"
                        ? <FormattedMessage text={msg.content} />
                        : msg.content}
                    </div>

                    {/* Speaker replay button — only for assistant messages */}
                    {msg.role === "assistant" && ttsSupported && (
                      <motion.button
                        data-testid={`button-tts-${i}`}
                        onClick={() =>
                          speakingIdx === i ? stopSpeaking() : speak(msg.content, i)
                        }
                        whileTap={{ scale: 0.9 }}
                        className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: speakingIdx === i ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${speakingIdx === i ? "#00ff8860" : "rgba(255,255,255,0.08)"}`,
                          color: speakingIdx === i ? "#00ff88" : "#555",
                        }}
                        title={speakingIdx === i ? "Stop" : "Play aloud"}
                      >
                        {speakingIdx === i ? (
                          <>
                            <SpeakingWave />
                            <span style={{ color: "#00ff88" }}>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Play</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#00ff8820", border: "1px solid #00ff8840" }}
                  >
                    <Bot className="w-4 h-4" style={{ color: "#00ff88" }} />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{ background: "#1a1a1a", border: "1px solid #00ff8820" }}
                  >
                    {[0, 0.2, 0.4].map((delay, idx) => (
                      <motion.div
                        key={idx}
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#00ff88" }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Replies ── */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: "#00ff8810", border: "1px solid #00ff8840", color: "#00ff88" }}
                    onMouseOver={(e) => { (e.currentTarget).style.background = "#00ff8825"; }}
                    onMouseOut={(e)  => { (e.currentTarget).style.background = "#00ff8810"; }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid #00ff8820" }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "#1a1a1a", border: "1px solid #00ff8830" }}
              >
                <input
                  ref={inputRef}
                  data-testid="input-chat"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
                  style={{ color: "#e0e0e0" }}
                />
                <button
                  data-testid="button-send-chat"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: input.trim() && !isLoading ? "linear-gradient(135deg,#00ff88,#00cc6a)" : "#1a1a1a",
                  }}
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    : <Send className="w-4 h-4" style={{ color: input.trim() ? "#000" : "#555" }} />
                  }
                </button>
              </div>

              {/* TTS indicator bar */}
              {ttsSupported && speakingIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center justify-center gap-2 text-xs"
                  style={{ color: "#00ff88" }}
                >
                  <SpeakingWave />
                  <span>Speaking…</span>
                  <button
                    onClick={stopSpeaking}
                    className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Stop
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Formatted message renderer ──
   Handles:
   • \n  → line break with spacing
   • **text** → highlighted bold span
   • bullet lines (•  -  *  or 1.) → indented bullet row
*/
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");

  const isBullet = (line: string) =>
    /^(\s*[•\-\*]|\s*\d+[.)]) /.test(line);

  const renderInline = (line: string, key: number) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={key}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const inner = part.slice(2, -2);
            return (
              <strong
                key={j}
                style={{
                  color: "#00ff88",
                  fontWeight: 700,
                  background: "rgba(0,255,136,0.1)",
                  borderRadius: "3px",
                  padding: "0 3px",
                }}
              >
                {inner}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </Fragment>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      {lines.map((line, i) => {
        if (line.trim() === "") {
          return <div key={i} style={{ height: "6px" }} />;
        }

        if (isBullet(line)) {
          const clean = line.replace(/^(\s*[•\-\*]|\s*\d+[.)]) ?/, "").trimStart();
          const marker = line.match(/^(\s*[•\-\*]|\s*(\d+)[.)]) ?/)?.[0]?.trim() ?? "•";
          return (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: "7px", lineHeight: 1.5 }}
            >
              <span
                style={{
                  flexShrink: 0,
                  color: "#00ff88",
                  fontWeight: 700,
                  marginTop: "1px",
                  fontSize: "0.8em",
                }}
              >
                {marker}
              </span>
              <span>{renderInline(clean, i)}</span>
            </div>
          );
        }

        return (
          <div key={i} style={{ lineHeight: 1.55 }}>
            {renderInline(line, i)}
          </div>
        );
      })}
    </div>
  );
}

/* Animated sound-wave bars shown while TTS is active */
function SpeakingWave() {
  return (
    <span className="flex items-end gap-[2px]" style={{ height: "12px" }}>
      {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: "#00ff88", display: "inline-block" }}
          animate={{ height: ["4px", "10px", "4px"] }}
          transition={{ duration: 0.7, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

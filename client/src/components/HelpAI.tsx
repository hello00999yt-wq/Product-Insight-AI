import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function HelpAI() {
  const { t, lang } = useLang();
  const QUICK_REPLIES = [
    t("ai.quick1"),
    t("ai.quick2"),
    t("ai.quick3"),
    t("ai.quick4"),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("ai.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Allow other parts of the page to open the chat
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openHelpAI", handler);
    return () => window.removeEventListener("openHelpAI", handler);
  }, []);

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("ai.welcome") }]);
  }, [lang]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

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
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
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
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-t-2xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
              }}
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
              <button
                data-testid="button-close-chat"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                      style={{ background: "#00ff8820", border: "1px solid #00ff8840" }}
                    >
                      <Bot className="w-4 h-4" style={{ color: "#00ff88" }} />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                            color: "#000",
                            borderBottomRightRadius: "4px",
                          }
                        : {
                            background: "#1a1a1a",
                            color: "#e0e0e0",
                            border: "1px solid #00ff8820",
                            borderBottomLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

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
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
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

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      background: "#00ff8810",
                      border: "1px solid #00ff8840",
                      color: "#00ff88",
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLButtonElement).style.background = "#00ff8825";
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLButtonElement).style.background = "#00ff8810";
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid #00ff8820" }}
            >
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
                    background: input.trim() && !isLoading ? "linear-gradient(135deg, #00ff88, #00cc6a)" : "#1a1a1a",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <Send className="w-4 h-4" style={{ color: input.trim() ? "#000" : "#555" }} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Plus, ImageIcon, VideoIcon, XCircle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

interface PendingMedia {
  dataUrl: string;
  type: "image" | "video";
  name: string;
}

export default function HelpAI() {
  const { t, lang } = useLang();
  const QUICK_REPLIES = [
    t("ai.quick1"), t("ai.quick2"), t("ai.quick3"), t("ai.quick4"),
  ];

  const [isOpen, setIsOpen]             = useState(false);
  const [messages, setMessages]         = useState<Message[]>([{ role: "assistant", content: t("ai.welcome") }]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [attachMenu, setAttachMenu]     = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const imageInputRef  = useRef<HTMLInputElement>(null);
  const videoInputRef  = useRef<HTMLInputElement>(null);
  const attachMenuRef  = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll to latest message ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Focus input when chat opens ── */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  /* ── Open via custom event (from home page button) ── */
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openHelpAI", handler);
    return () => window.removeEventListener("openHelpAI", handler);
  }, []);

  /* ── Reset messages when language changes ── */
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("ai.welcome") }]);
  }, [lang]);

  /* ── Close attach menu when clicking outside ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setAttachMenu(false);
      }
    };
    if (attachMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [attachMenu]);

  /* ── File pick handler ── */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachMenu(false);

    const reader = new FileReader();
    reader.onload = () => {
      setPendingMedia({ dataUrl: reader.result as string, type, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  /* ── Send message ── */
  const sendMessage = async (text: string, media?: PendingMedia) => {
    const hasText  = text.trim().length > 0;
    const hasMedia = !!media;
    if ((!hasText && !hasMedia) || isLoading) return;

    setPendingMedia(null);
    setInput("");

    const userMsg: Message = {
      role: "user",
      content: hasText ? text : (media!.type === "image" ? "What can you see in this image?" : `I uploaded a video: ${media!.name}`),
      ...(hasMedia && media!.type === "image" ? { mediaUrl: media!.dataUrl, mediaType: "image" } : {}),
      ...(hasMedia && media!.type === "video" ? { mediaUrl: media!.dataUrl, mediaType: "video" } : {}),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            mediaUrl:  m.mediaType === "image" ? m.mediaUrl : undefined,
            mediaType: m.mediaType,
          })),
          lang,
        }),
      });
      const data  = await res.json();
      const reply = data.message as string;
      setMessages((prev) => [...prev, { role: "assistant" as const, content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = (input.trim().length > 0 || !!pendingMedia) && !isLoading;

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
        data-testid="input-image-upload"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
        data-testid="input-video-upload"
      />

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

              <button
                data-testid="button-close-chat"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
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
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: "#00ff8820", border: "1px solid #00ff8840" }}
                    >
                      <Bot className="w-4 h-4" style={{ color: "#00ff88" }} />
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[78%]`}>
                    {/* Media preview inside bubble */}
                    {msg.mediaType === "image" && msg.mediaUrl && (
                      <div className="mb-1 rounded-2xl overflow-hidden" style={{ maxWidth: "200px" }}>
                        <img
                          src={msg.mediaUrl}
                          alt="uploaded"
                          className="w-full object-cover rounded-2xl"
                          style={{ maxHeight: "160px" }}
                        />
                      </div>
                    )}
                    {msg.mediaType === "video" && msg.mediaUrl && (
                      <div className="mb-1 rounded-2xl overflow-hidden" style={{ maxWidth: "200px" }}>
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="w-full rounded-2xl"
                          style={{ maxHeight: "160px" }}
                        />
                      </div>
                    )}

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
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
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

            {/* ── Pending media preview strip ── */}
            <AnimatePresence>
              {pendingMedia && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-2 flex-shrink-0"
                >
                  <div
                    className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "#1a1a1a", border: "1px solid #00ff8840" }}
                  >
                    {pendingMedia.type === "image" ? (
                      <img
                        src={pendingMedia.dataUrl}
                        alt="preview"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: "#00ff8815" }}
                      >
                        <VideoIcon className="w-5 h-5" style={{ color: "#00ff88" }} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-medium" style={{ color: "#e0e0e0" }}>
                        {pendingMedia.type === "image" ? "Image" : "Video"}
                      </span>
                      <span className="text-xs max-w-[120px] truncate" style={{ color: "#666" }}>
                        {pendingMedia.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setPendingMedia(null)}
                      className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                      data-testid="button-remove-media"
                    >
                      <XCircle className="w-4 h-4" style={{ color: "#666" }} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input area ── */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid #00ff8820" }}>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "#1a1a1a", border: "1px solid #00ff8830" }}
              >
                {/* "+" attach button with dropdown */}
                <div className="relative flex-shrink-0" ref={attachMenuRef}>
                  <button
                    data-testid="button-attach"
                    onClick={() => setAttachMenu((v) => !v)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: attachMenu ? "#00ff8820" : "transparent",
                      border: `1px solid ${attachMenu ? "#00ff8860" : "#333"}`,
                      color: attachMenu ? "#00ff88" : "#666",
                    }}
                    title="Attach file"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {attachMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 rounded-xl overflow-hidden z-10"
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #00ff8840",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                          minWidth: "150px",
                        }}
                      >
                        <button
                          data-testid="button-upload-image"
                          onClick={() => { setAttachMenu(false); imageInputRef.current?.click(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                          style={{ color: "#e0e0e0" }}
                          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#00ff8812"; }}
                          onMouseOut={(e)  => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "#00ff8815" }}
                          >
                            <ImageIcon className="w-4 h-4" style={{ color: "#00ff88" }} />
                          </div>
                          <span>Upload Image</span>
                        </button>

                        <div style={{ height: "1px", background: "#00ff8815" }} />

                        <button
                          data-testid="button-upload-video"
                          onClick={() => { setAttachMenu(false); videoInputRef.current?.click(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                          style={{ color: "#e0e0e0" }}
                          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#00ff8812"; }}
                          onMouseOut={(e)  => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "#00ff8815" }}
                          >
                            <VideoIcon className="w-4 h-4" style={{ color: "#00ff88" }} />
                          </div>
                          <span>Upload Video</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Text input */}
                <input
                  ref={inputRef}
                  data-testid="input-chat"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input, pendingMedia ?? undefined)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-600"
                  style={{ color: "#e0e0e0" }}
                />

                {/* Send button */}
                <button
                  data-testid="button-send-chat"
                  onClick={() => sendMessage(input, pendingMedia ?? undefined)}
                  disabled={!canSend}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: canSend ? "linear-gradient(135deg,#00ff88,#00cc6a)" : "#1a1a1a",
                  }}
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    : <Send className="w-4 h-4" style={{ color: canSend ? "#000" : "#555" }} />
                  }
                </button>
              </div>

              {/* Supported formats hint */}
              {!attachMenu && !pendingMedia && (
                <p className="text-center text-xs mt-1.5" style={{ color: "#444" }}>
                  JPG, PNG, MP4 supported
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Formatted message renderer ── */
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
          const clean  = line.replace(/^(\s*[•\-\*]|\s*\d+[.)]) ?/, "").trimStart();
          const marker = line.match(/^(\s*[•\-\*]|\s*(\d+)[.)]) ?/)?.[0]?.trim() ?? "•";
          return (
            <div
              key={i}
              style={{ display: "flex", alignItems: "flex-start", gap: "7px", lineHeight: 1.5 }}
            >
              <span style={{ flexShrink: 0, color: "#00ff88", fontWeight: 700, marginTop: "1px", fontSize: "0.8em" }}>
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

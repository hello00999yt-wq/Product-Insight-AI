import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, GraduationCap, MapPin, Trophy, Heart, Code, Search } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function About() {
  const { t } = useLang();

  const sections = [
    {
      key: "edu",
      title: t("about.edu.title"),
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      content: t("about.edu.content"),
    },
    {
      key: "location",
      title: t("about.location.title"),
      icon: <MapPin className="h-6 w-6 text-primary" />,
      content: t("about.location.content"),
    },
    {
      key: "interests",
      title: t("about.interests.title"),
      icon: <Trophy className="h-6 w-6 text-primary" />,
      content: t("about.interests.content"),
    },
    {
      key: "hobbies",
      title: t("about.hobbies.title"),
      icon: <Heart className="h-6 w-6 text-primary" />,
      content: t("about.hobbies.content"),
    },
    {
      key: "journey",
      title: t("about.journey.title"),
      icon: <Code className="h-6 w-6 text-primary" />,
      content: t("about.journey.content"),
    },
    {
      key: "project",
      title: t("about.project.title"),
      icon: <Search className="h-6 w-6 text-primary" />,
      content: t("about.project.content"),
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(50%) brightness(0.5)'
        }}
      />

      {/* Gradient Overlay for better readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            {t("about.title")}
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 border-blue-500/50 bg-primary/5" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.15)" }}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="flex items-center gap-3">
                  <User className="text-primary" />
                  <span><strong>{t("about.name")}:</strong> Manish chandel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs">14</div>
                  <span><strong>{t("about.age")}:</strong> {t("about.age_val")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-primary" />
                  <span><strong>{t("about.school")}:</strong> H.S selda mal</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-primary/60" />
                  <span><strong>{t("about.father")}:</strong> Mr. Ramprsad chandel</span>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <User className="text-primary/60" />
                  <span><strong>{t("about.mother")}:</strong> Mrs. Meena chandel</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={section.key === "project" ? "md:col-span-2" : ""}
            >
              <Card className="h-full border border-blue-500/40 hover:border-blue-400/70 transition-all duration-300" style={{ boxShadow: "0 0 14px rgba(59,130,246,0.1)" }}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    {section.icon}
                    <h2 className="text-2xl font-semibold text-primary">{section.title}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

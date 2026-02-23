import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, GraduationCap, MapPin, Trophy, Heart, Code, Search } from "lucide-react";

export default function About() {
  const sections = [
    {
      title: "My Education",
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      content: "I am currently studying in Class 10 at Selda Mal High School, and along with my studies, I have also worked under CodeYogi, where I learned web development."
    },
    {
      title: "My Current Location",
      icon: <MapPin className="h-6 w-6 text-primary" />,
      content: "Selda Mal, District Khandwa"
    },
    {
      title: "Interests",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      content: "I have been interested in cricket since childhood, and when I came to know about CodeYogi through my school, I also started it and developed a great interest in it."
    },
    {
      title: "Hobbies",
      icon: <Heart className="h-6 w-6 text-primary" />,
      content: "My hobbies are drawing, playing cricket, coding, and learning about new technologies."
    },
    {
      title: "Journey to Coding",
      icon: <Code className="h-6 w-6 text-primary" />,
      content: "I came to know about CodeYogi through my High School Selda Mal. With the help of CodeYogi, I learned how to code, gained knowledge about the new technological world, and also learned web development."
    },
    {
      title: "Project Overview",
      icon: <Search className="h-6 w-6 text-primary" />,
      content: "This Project is an Image Recognition + Product Transparency Platform. On this platform, customers can upload a photo of any product. With the help of advanced image recognition technology, the system identifies the product and displays complete, verified, and reliable information related to it.\n\nThe main objective of this platform is to provide customers with accurate, transparent, and trustworthy information so that they can:\n• Avoid purchasing counterfeit products,\n• Avoid paying unnecessarily high prices,\n• Stay protected from fraud and exploitation,\n• Make informed and conscious purchasing decisions.\n\nBy providing verified product information, this platform aims to prevent consumer exploitation and promote transparency and fairness in the marketplace."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            MY INFORMATION
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="flex items-center gap-3">
                  <User className="text-primary" />
                  <span><strong>Name:</strong> Manish chandel</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs">14</div>
                  <span><strong>Age:</strong> 14 Years</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-primary" />
                  <span><strong>School:</strong> H.S selda mal</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="text-primary/60" />
                  <span><strong>Father:</strong> Mr. Ramprsad chandel</span>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                  <User className="text-primary/60" />
                  <span><strong>Mother:</strong> Mrs. Meena chandel</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={section.title === "Project Overview" ? "md:col-span-2" : ""}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
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

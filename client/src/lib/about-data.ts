import { LucideIcon } from "lucide-react";
import { User, GraduationCap, MapPin, Trophy, Sparkles, Code, Info } from "lucide-react";

export interface AboutSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string | Record<string, string>;
}

export const aboutData: AboutSection[] = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    content: {
      "Name": "Manish chandel",
      "Age": "14 Years",
      "School": "H.S selda mal",
      "Father's Name": "Mr. Ramprsad chandel",
      "Mother's Name": "Mrs. Meena chandel"
    }
  },
  {
    id: "education",
    title: "My Education",
    icon: GraduationCap,
    content: "I am currently studying in Class 10 at Selda Mal High School, and along with my studies, I have also worked under CodeYogi, where I learned web development."
  },
  {
    id: "location",
    title: "My Current Location",
    icon: MapPin,
    content: "Selda Mal, District Khandwa"
  },
  {
    id: "interests",
    title: "Interests",
    icon: Trophy,
    content: "I have been interested in cricket since childhood, and when I came to know about CodeYogi through my school, I also started it and developed a great interest in it."
  },
  {
    id: "hobbies",
    title: "Hobbies",
    icon: Sparkles,
    content: "My hobbies are drawing, playing cricket, coding, and learning about new technologies."
  },
  {
    id: "journey",
    title: "Journey to Coding",
    icon: Code,
    content: "I came to know about CodeYogi through my High School Selda Mal. With the help of CodeYogi, I learned how to code, gained knowledge about the new technological world, and also learned web development."
  },
  {
    id: "project",
    title: "Project Overview",
    icon: Info,
    content: "This Project is an Image Recognition + Product Transparency Platform. On this platform, customers can upload a photo of any product. With the help of advanced image recognition technology, the system identifies the product and displays complete, verified, and reliable information related to it. The main objective of this platform is to provide customers with accurate, transparent, and trustworthy information so that they can avoid purchasing counterfeit products, avoid paying unnecessarily high prices, stay protected from fraud and exploitation, and make informed and conscious purchasing decisions. By providing verified product information, this platform aims to prevent consumer exploitation and promote transparency and fairness in the marketplace."
  }
];

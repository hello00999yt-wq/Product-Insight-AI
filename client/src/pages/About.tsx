import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aboutData } from "@/lib/about-data";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-mesh relative overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary mb-4 uppercase tracking-tight">
            My Information
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid gap-6">
          {aboutData.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-primary">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeof section.content === 'string' ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(section.content).map(([label, value]) => (
                        <div key={label} className="flex flex-col">
                          <dt className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
                            {label}
                          </dt>
                          <dd className="text-base text-muted-foreground">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

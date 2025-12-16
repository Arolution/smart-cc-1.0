import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, BarChart3, TrendingUp, ShieldAlert, ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Disclaimer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [accepted, setAccepted] = useState(false);

  const paragraphs = [
    { icon: Info, text: t("disclaimer.text1") },
    { icon: BarChart3, text: t("disclaimer.text2") },
    { icon: TrendingUp, text: t("disclaimer.text3") },
    { icon: ShieldAlert, text: t("disclaimer.text4") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-8">
            {t("disclaimer.title")}
          </h1>

          <Card className="mb-8">
            <CardContent className="p-6 space-y-6">
              {paragraphs.map((paragraph, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <paragraph.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground">{paragraph.text}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
              />
              <span className="text-foreground">{t("disclaimer.checkbox")}</span>
            </label>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary"
            >
              <ArrowDown className="h-6 w-6" />
            </motion.div>

            <Button
              variant="gold"
              size="lg"
              onClick={() => navigate("/calculator")}
              disabled={!accepted}
              className="px-12 py-6 text-lg"
            >
              {t("disclaimer.accept")}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Disclaimer;

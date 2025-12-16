import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-primary mb-4">
          {t("landing.title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          {t("landing.subtitle")}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full mb-12">
        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-display font-semibold mb-4 text-center">
              {t("landing.selectTheme")}
            </h2>
            <div className="flex gap-4 justify-center">
              <Button
                variant={theme === "light" ? "gold" : "outline"}
                size="lg"
                onClick={() => setTheme("light")}
                className="flex-1 flex flex-col items-center gap-2 h-auto py-4"
              >
                <Sun className="h-6 w-6" />
                <span>{t("landing.day")}</span>
              </Button>
              <Button
                variant={theme === "dark" ? "gold" : "outline"}
                size="lg"
                onClick={() => setTheme("dark")}
                className="flex-1 flex flex-col items-center gap-2 h-auto py-4"
              >
                <Moon className="h-6 w-6" />
                <span>{t("landing.night")}</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-display font-semibold mb-4 text-center">
              {t("landing.selectLanguage")}
            </h2>
            <div className="flex gap-4 justify-center">
              <Button
                variant={language === "de" ? "gold" : "outline"}
                size="lg"
                onClick={() => setLanguage("de")}
                className="flex-1 flex flex-col items-center gap-2 h-auto py-4"
              >
                <span className="text-2xl">🇩🇪</span>
                <span>Deutsch</span>
              </Button>
              <Button
                variant={language === "en" ? "gold" : "outline"}
                size="lg"
                onClick={() => setLanguage("en")}
                className="flex-1 flex flex-col items-center gap-2 h-auto py-4"
              >
                <span className="text-2xl">🇬🇧</span>
                <span>English</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Button
          variant="gold"
          size="lg"
          onClick={() => navigate("/welcome")}
          className="px-12 py-6 text-lg"
        >
          {t("landing.continue")}
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;

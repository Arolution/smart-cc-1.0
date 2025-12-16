import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Users, Calendar, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: TrendingUp,
      title: t("welcome.feature1.title"),
      description: t("welcome.feature1.desc"),
    },
    {
      icon: Users,
      title: t("welcome.feature2.title"),
      description: t("welcome.feature2.desc"),
    },
    {
      icon: Calendar,
      title: t("welcome.feature3.title"),
      description: t("welcome.feature3.desc"),
    },
    {
      icon: FileText,
      title: t("welcome.feature4.title"),
      description: t("welcome.feature4.desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-4">
            {t("welcome.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("welcome.description")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-gold transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="gold"
            size="lg"
            onClick={() => navigate("/disclaimer")}
            className="px-12 py-6 text-lg"
          >
            {t("welcome.cta")}
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Welcome;

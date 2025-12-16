import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";

const Calculator = () => {
  const { t } = useLanguage();
  const [stake, setStake] = useState<string>("1000");
  const [years, setYears] = useState<string>("1");
  const [months, setMonths] = useState<string>("0");
  const [results, setResults] = useState<{ finalStake: number; profit: number } | null>(null);

  const handleCalculate = () => {
    const initialStake = parseFloat(stake) || 0;
    const totalMonths = (parseInt(years) || 0) * 12 + (parseInt(months) || 0);
    
    // Simple compound calculation with 16% monthly gross profit
    // and 30% profit share (assuming $1000-$9999 tier)
    const monthlyRate = 0.16 * 0.30; // 4.8% net monthly
    const finalStake = initialStake * Math.pow(1 + monthlyRate, totalMonths);
    const profit = finalStake - initialStake;

    setResults({ finalStake, profit });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-8">
            {t("calculator.title")}
          </h1>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.initialStake")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("calculator.initialStake")} ($)
                  </label>
                  <Input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    min="200"
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("calculator.years")}
                    </label>
                    <Input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      min="0"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("calculator.months")}
                    </label>
                    <Input
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      min="0"
                      max="11"
                    />
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleCalculate}
                  className="w-full"
                >
                  {t("calculator.calculate")}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t("calculator.results")}</CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Final Stake</p>
                      <p className="text-3xl font-display font-bold text-primary">
                        ${results.finalStake.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Profit</p>
                      <p className="text-2xl font-display font-semibold text-green-500">
                        +${results.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t("calculator.calculate")} to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Calculator;

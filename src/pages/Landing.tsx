import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import logo from '@/assets/logo.png';
const Landing = () => {
  const navigate = useNavigate();
  const {
    i18n
  } = useTranslation();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header with controls */}
      <header className="p-4 flex justify-end gap-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeLanguage('de')} className={i18n.language === 'de' ? 'bg-accent' : ''}>
            🇩🇪
          </Button>
          <Button variant="ghost" size="sm" onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'bg-accent' : ''}>EN</Button>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-1000">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Compound Calculator Logo" className="w-48 h-48 object-contain drop-shadow-2xl animate-in zoom-in duration-700" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent animate-in slide-in-from-bottom duration-700">Compound Calculator</h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-in slide-in-from-bottom duration-700 delay-100">Investment-Management Tool</p>
          </div>

          {/* CTA Button */}
          <div className="pt-8 animate-in slide-in-from-bottom duration-700 delay-200">
            <Button size="lg" onClick={() => navigate('/welcome')} className="bg-gradient-to-r from-gold via-gold-dark to-gold hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 text-lg px-8 py-6 font-semibold">
              Jetzt starten
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">© 2025 Compound Calculator. Alle Rechte vorbehalten.</footer>
    </div>;
};
export default Landing;
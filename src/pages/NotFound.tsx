import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <div className="container mx-auto px-8 pt-[200px] pb-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-[72px] md:text-[96px] font-bold text-[#D4AF37] leading-none mb-6">
            {t('notFound.title')}
          </h1>
          <p className="text-slate-400 text-[14px] md:text-[16px] mb-10">
            {t('notFound.message')}
          </p>
          <Link
            to="/"
            className="inline-block bg-[#D4AF37] text-black px-10 py-4 rounded-none font-tech text-[11px] font-black tracking-[0.25em] uppercase hover:bg-white transition-all duration-500"
          >
            {t('notFound.returnHome')}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;

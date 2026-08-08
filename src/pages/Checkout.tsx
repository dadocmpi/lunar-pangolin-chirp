"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  ShieldAlert,
  Activity,
  CreditCard,
  User,
  Bitcoin,
  Wallet,
  Lock,
  Search,
  Phone,
  Copy,
  ExternalLink,
  Building2,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LogoVisa, LogoMastercard } from '@/components/LogoVault';
import { getCurrencyByCountry, convertFromUSD, formatCurrency, countryCurrencyMap } from '@/services/currencyService';

// Lista completa de países do mundo com DDI e traduções
const countries = [
  // English names (default)
  { code: 'BR', name: 'Brazil', name_pt: 'Brasil', name_es: 'Brasil', name_it: 'Brasile', name_fr: 'Brésil', name_de: 'Brasilien', name_ru: 'Бразилия', name_zh: '巴西', name_ja: 'ブラジル', name_ar: 'البرازيل', name_he: 'ברזיל', ddi: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', name_pt: 'Argentina', name_es: 'Argentina', name_it: 'Argentina', name_fr: 'Argentine', name_de: 'Argentinien', name_ru: 'Аргентина', name_zh: '阿根廷', name_ja: 'アルゼンチン', name_ar: 'الأرجنتين', name_he: 'ארגנטינה', ddi: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', name_pt: 'Chile', name_es: 'Chile', name_it: 'Cile', name_fr: 'Chili', name_de: 'Chile', name_ru: 'Чили', name_zh: '智利', name_ja: 'チリ', name_ar: 'تشيلي', name_he: 'צ\'ילה', ddi: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', name_pt: 'Colômbia', name_es: 'Colombia', name_it: 'Colombia', name_fr: 'Colombie', name_de: 'Kolumbien', name_ru: 'Колумбия', name_zh: '哥伦比亚', name_ja: 'コロンビア', name_ar: 'كولومبيا', name_he: 'קולומביה', ddi: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', name_pt: 'Peru', name_es: 'Perú', name_it: 'Perù', name_fr: 'Pérou', name_de: 'Peru', name_ru: 'Перу', name_zh: '秘鲁', name_ja: 'ペルー', name_ar: 'بيرو', name_he: 'פרו', ddi: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', name_pt: 'Venezuela', name_es: 'Venezuela', name_it: 'Venezuela', name_fr: 'Venezuela', name_de: 'Venezuela', name_ru: 'Венесуэла', name_zh: '委内瑞拉', name_ja: 'ベネズエラ', name_ar: 'فنزويلا', name_he: 'ונצואלה', ddi: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', name_pt: 'Equador', name_es: 'Ecuador', name_it: 'Ecuador', name_fr: 'Équateur', name_de: 'Ecuador', name_ru: 'Эквадор', name_zh: '厄瓜多尔', name_ja: 'エクアドル', name_ar: 'الإكوادور', name_he: 'אקוודור', ddi: '+593', flag: '🇪🇨' },
  { code: 'UY', name: 'Uruguay', name_pt: 'Uruguai', name_es: 'Uruguay', name_it: 'Uruguay', name_fr: 'Uruguay', name_de: 'Uruguay', name_ru: 'Уругвай', name_zh: '乌拉圭', name_ja: 'ウルグアイ', name_ar: 'أوروغواي', name_he: 'אורוגוואי', ddi: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', name_pt: 'Paraguai', name_es: 'Paraguay', name_it: 'Paraguay', name_fr: 'Paraguay', name_de: 'Paraguay', name_ru: 'Парагвай', name_zh: '巴拉圭', name_ja: 'パラグアイ', name_ar: 'باراغواي', name_he: 'פרגוואי', ddi: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', name_pt: 'Bolívia', name_es: 'Bolivia', name_it: 'Bolivia', name_fr: 'Bolivie', name_de: 'Bolivien', name_ru: 'Боливия', name_zh: '玻利维亚', name_ja: 'ボリビア', name_ar: 'بوليفيا', name_he: 'בוליביה', ddi: '+591', flag: '🇧🇴' },
  { code: 'US', name: 'United States', name_pt: 'Estados Unidos', name_es: 'Estados Unidos', name_it: 'Stati Uniti', name_fr: 'États-Unis', name_de: 'Vereinigte Staaten', name_ru: 'Соединенные Штаты', name_zh: '美国', name_ja: 'アメリカ', name_ar: 'الولايات المتحدة', name_he: 'ארצות הברית', ddi: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', name_pt: 'Canadá', name_es: 'Canadá', name_it: 'Canada', name_fr: 'Canada', name_de: 'Kanada', name_ru: 'Канада', name_zh: '加拿大', name_ja: 'カナダ', name_ar: 'كندا', name_he: 'קנדה', ddi: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', name_pt: 'México', name_es: 'México', name_it: 'Messico', name_fr: 'Mexique', name_de: 'Mexiko', name_ru: 'Мексика', name_zh: '墨西哥', name_ja: 'メキシコ', name_ar: 'المكسيك', name_he: 'מקסיקו', ddi: '+52', flag: '🇲🇽' },
  { code: 'GB', name: 'United Kingdom', name_pt: 'Reino Unido', name_es: 'Reino Unido', name_it: 'Regno Unito', name_fr: 'Royaume-Uni', name_de: 'Vereinigtes Königreich', name_ru: 'Великобритания', name_zh: '英国', name_ja: 'イギリス', name_ar: 'المملكة المتحدة', name_he: 'בריטניה', ddi: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', name_pt: 'Alemanha', name_es: 'Alemania', name_it: 'Germania', name_fr: 'Allemagne', name_de: 'Deutschland', name_ru: 'Германия', name_zh: '德国', name_ja: 'ドイツ', name_ar: 'ألمانيا', name_he: 'גרמניה', ddi: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', name_pt: 'França', name_es: 'Francia', name_it: 'Francia', name_fr: 'France', name_de: 'Frankreich', name_ru: 'Франция', name_zh: '法国', name_ja: 'フランス', name_ar: 'فرنسا', name_he: 'צרפת', ddi: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', name_pt: 'Itália', name_es: 'Italia', name_it: 'Italia', name_fr: 'Italie', name_de: 'Italien', name_ru: 'Италия', name_zh: '意大利', name_ja: 'イタリア', name_ar: 'إيطاليا', name_he: 'איטליה', ddi: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', name_pt: 'Espanha', name_es: 'España', name_it: 'Spagna', name_fr: 'Espagne', name_de: 'Spanien', name_ru: 'Испания', name_zh: '西班牙', name_ja: 'スペイン', name_ar: 'إسبانيا', name_he: 'ספרד', ddi: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', name_pt: 'Portugal', name_es: 'Portugal', name_it: 'Portogallo', name_fr: 'Portugal', name_de: 'Portugal', name_ru: 'Португалия', name_zh: '葡萄牙', name_ja: 'ポルトガル', name_ar: 'البرتغال', name_he: 'פורטוגל', ddi: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', name_pt: 'Países Baixos', name_es: 'Países Bajos', name_it: 'Paesi Bassi', name_fr: 'Pays-Bas', name_de: 'Niederlande', name_ru: 'Нидерланды', name_zh: '荷兰', name_ja: 'オランダ', name_ar: 'هولندا', name_he: 'הולנד', ddi: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', name_pt: 'Bélgica', name_es: 'Bélgica', name_it: 'Belgio', name_fr: 'Belgique', name_de: 'Belgien', name_ru: 'Бельгия', name_zh: '比利时', name_ja: 'ベルギー', name_ar: 'بلجيكا', name_he: 'בלגיה', ddi: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', name_pt: 'Suíça', name_es: 'Suiza', name_it: 'Svizzera', name_fr: 'Suisse', name_de: 'Schweiz', name_ru: 'Швейцария', name_zh: '瑞士', name_ja: 'スイス', name_ar: 'سويسرا', name_he: 'שווייץ', ddi: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', name_pt: 'Áustria', name_es: 'Austria', name_it: 'Austria', name_fr: 'Autriche', name_de: 'Österreich', name_ru: 'Австрия', name_zh: '奥地利', name_ja: 'オーストリア', name_ar: 'النمسا', name_he: 'אוסטריה', ddi: '+43', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', name_pt: 'Polônia', name_es: 'Polonia', name_it: 'Polonia', name_fr: 'Pologne', name_de: 'Polen', name_ru: 'Польша', name_zh: '波兰', name_ja: 'ポーランド', name_ar: 'بولندا', name_he: 'פולין', ddi: '+48', flag: '🇵🇱' },
  { code: 'SE', name: 'Sweden', name_pt: 'Suécia', name_es: 'Suecia', name_it: 'Svezia', name_fr: 'Suède', name_de: 'Schweden', name_ru: 'Швеция', name_zh: '瑞典', name_ja: 'スウェーデン', name_ar: 'السويد', name_he: 'שוודיה', ddi: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', name_pt: 'Noruega', name_es: 'Noruega', name_it: 'Norvegia', name_fr: 'Norvège', name_de: 'Norwegen', name_ru: 'Норвегия', name_zh: '挪威', name_ja: 'ノルウェー', name_ar: 'النرويج', name_he: 'נורווגיה', ddi: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', name_pt: 'Dinamarca', name_es: 'Dinamarca', name_it: 'Danimarca', name_fr: 'Danemark', name_de: 'Dänemark', name_ru: 'Дания', name_zh: '丹麦', name_ja: 'デンマーク', name_ar: 'الدنمارك', name_he: 'דנמרק', ddi: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', name_pt: 'Finlândia', name_es: 'Finlandia', name_it: 'Finlandia', name_fr: 'Finlande', name_de: 'Finnland', name_ru: 'Финляндия', name_zh: '芬兰', name_ja: 'フィンランド', name_ar: 'فنلندا', name_he: 'פינלנד', ddi: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', name_pt: 'Irlanda', name_es: 'Irlanda', name_it: 'Irlanda', name_fr: 'Irlande', name_de: 'Irland', name_ru: 'Ирландия', name_zh: '爱尔兰', name_ja: 'アイルランド', name_ar: 'أيرلندا', name_he: 'אירלנד', ddi: '+353', flag: '🇮🇪' },
  { code: 'GR', name: 'Greece', name_pt: 'Grécia', name_es: 'Grecia', name_it: 'Grecia', name_fr: 'Grèce', name_de: 'Griechenland', name_ru: 'Греция', name_zh: '希腊', name_ja: 'ギリシャ', name_ar: 'اليونان', name_he: 'יוון', ddi: '+30', flag: '🇬🇷' },
  { code: 'RU', name: 'Russia', name_pt: 'Rússia', name_es: 'Rusia', name_it: 'Russia', name_fr: 'Russie', name_de: 'Russland', name_ru: 'Россия', name_zh: '俄罗斯', name_ja: 'ロシア', name_ar: 'روسيا', name_he: 'רוסיה', ddi: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', name_pt: 'Ucrânia', name_es: 'Ucrania', name_it: 'Ucraina', name_fr: 'Ukraine', name_de: 'Ukraine', name_ru: 'Украина', name_zh: '乌克兰', name_ja: 'ウクライナ', name_ar: 'أوكرانيا', name_he: 'אוקראינה', ddi: '+380', flag: '🇺🇦' },
  { code: 'TR', name: 'Turkey', name_pt: 'Turquia', name_es: 'Turquía', name_it: 'Turchia', name_fr: 'Turquie', name_de: 'Türkei', name_ru: 'Турция', name_zh: '土耳其', name_ja: 'トルコ', name_ar: 'تركيا', name_he: 'טורקיה', ddi: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', name_pt: 'Israel', name_es: 'Israel', name_it: 'Israele', name_fr: 'Israël', name_de: 'Israel', name_ru: 'Израиль', name_zh: '以色列', name_ja: 'イスラエル', name_ar: 'إسرائيل', name_he: 'ישראל', ddi: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'UAE', name_pt: 'Emirados Árabes', name_es: 'Emiratos Árabes', name_it: 'Emirati Arabi', name_fr: 'Émirats Arabes', name_de: 'VAE', name_ru: 'ОАЭ', name_zh: '阿联酋', name_ja: 'アラブ首長国連邦', name_ar: 'الإمارات', name_he: 'איחוד האמירויות', ddi: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', name_pt: 'Arábia Saudita', name_es: 'Arabia Saudita', name_it: 'Arabia Saudita', name_fr: 'Arabie Saoudite', name_de: 'Saudi-Arabien', name_ru: 'Саудовская Аравия', name_zh: '沙特阿拉伯', name_ja: 'サウジアラビア', name_ar: 'السعودية', name_he: 'ערב הסעודית', ddi: '+966', flag: '🇸🇦' },
  { code: 'IN', name: 'India', name_pt: 'Índia', name_es: 'India', name_it: 'India', name_fr: 'Inde', name_de: 'Indien', name_ru: 'Индия', name_zh: '印度', name_ja: 'インド', name_ar: 'الهند', name_he: 'הודו', ddi: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', name_pt: 'China', name_es: 'China', name_it: 'Cina', name_fr: 'Chine', name_de: 'China', name_ru: 'Китай', name_zh: '中国', name_ja: '中国', name_ar: 'الصين', name_he: 'סין', ddi: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', name_pt: 'Japão', name_es: 'Japón', name_it: 'Giappone', name_fr: 'Japon', name_de: 'Japan', name_ru: 'Япония', name_zh: '日本', name_ja: '日本', name_ar: 'اليابان', name_he: 'יפן', ddi: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', name_pt: 'Coreia do Sul', name_es: 'Corea del Sur', name_it: 'Corea del Sud', name_fr: 'Corée du Sud', name_de: 'Südkorea', name_ru: 'Южная Корея', name_zh: '韩国', name_ja: '韓国', name_ar: 'كوريا الجنوبية', name_he: 'דרום קוריאה', ddi: '+82', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', name_pt: 'Austrália', name_es: 'Australia', name_it: 'Australia', name_fr: 'Australie', name_de: 'Australien', name_ru: 'Австралия', name_zh: '澳大利亚', name_ja: 'オーストラリア', name_ar: 'أستراليا', name_he: 'אוסטרליה', ddi: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', name_pt: 'Nova Zelândia', name_es: 'Nueva Zelanda', name_it: 'Nuova Zelanda', name_fr: 'Nouvelle-Zélande', name_de: 'Neuseeland', name_ru: 'Новая Зеландия', name_zh: '新西兰', name_ja: 'ニュージーランド', name_ar: 'نيوزيلندا', name_he: 'ניו זילנד', ddi: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', name_pt: 'África do Sul', name_es: 'Sudáfrica', name_it: 'Sud Africa', name_fr: 'Afrique du Sud', name_de: 'Südafrika', name_ru: 'Южная Африка', name_zh: '南非', name_ja: '南アフリカ', name_ar: 'جنوب أفريقيا', name_he: 'דרום אפריקה', ddi: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', name_pt: 'Egito', name_es: 'Egipto', name_it: 'Egitto', name_fr: 'Égypte', name_de: 'Ägypten', name_ru: 'Египет', name_zh: '埃及', name_ja: 'エジプト', name_ar: 'مصر', name_he: 'מצרים', ddi: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', name_pt: 'Nigéria', name_es: 'Nigeria', name_it: 'Nigeria', name_fr: 'Nigeria', name_de: 'Nigeria', name_ru: 'Нигерия', name_zh: '尼日利亚', name_ja: 'ナイジェリア', name_ar: 'نيجيريا', name_he: 'ניגריה', ddi: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', name_pt: 'Quênia', name_es: 'Kenia', name_it: 'Kenya', name_fr: 'Kenya', name_de: 'Kenia', name_ru: 'Кения', name_zh: '肯尼亚', name_ja: 'ケニア', name_ar: 'كينيا', name_he: 'קניה', ddi: '+254', flag: '🇰🇪' },
  // Mais países podem ser adicionados...
];

// Redes de criptomoedas suportadas com suas carteiras
const cryptoNetworks = [
  { id: 'TRC20', name: 'TRON (TRC20)', symbol: 'USDT', address: 'TJZARrDbBjTjjUvEb7BwqD3AoFsVNyShtm', explorer: 'https://tronscan.org' },
  { id: 'BTC', name: 'Bitcoin (BTC)', symbol: 'BTC', address: 'bc1qfhkwc02k58h0q8yq9tqcyvja7cnrq57hwygm76', explorer: 'https://blockstream.info' },
  { id: 'ETH', name: 'Ethereum (ERC20)', symbol: 'ETH', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://etherscan.io' },
  { id: 'BNB', name: 'BNB Chain (BEP20)', symbol: 'BNB', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://bscscan.io' },
  { id: 'POLYGON', name: 'Polygon (MATIC)', symbol: 'MATIC', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://polygonscan.com' },
  { id: 'SOL', name: 'Solana (SOL)', symbol: 'SOL', address: '6Hj6JfMDhSBJuPcX7keB6pPcVXsojEwqdgPt7HKcwxjQ', explorer: 'https://solscan.io' },
];

// Obter nome do país no idioma correto
const getCountryName = (country: any, lang: string): string => {
  const nameKey = `name_${lang}`;
  return country[nameKey] || country.name;
};

// Dados bancários Wise por moeda (detetada via IP do cliente)
// Cada conta tem: holder, bankName, address, swift, e campos variáveis conforme a moeda
interface WiseAccount {
  currency: string;
  holderName: string;
  bankName: string;
  address: string;
  swift: string;
  iban?: string;
  accountNumber?: string;
  sortCode?: string;      // GBP
  routingNumber?: string; // USD
  bsbCode?: string;       // AUD
  institutionNumber?: string; // CAD
  transitNumber?: string;     // CAD
  bankCode?: string;          // SGD
}

const WISE_HOLDER = "Jorge Antonio Soares de Moura Sedeh";

const wiseAccountsByCurrency: Record<string, WiseAccount> = {
  EUR: {
    currency: 'EUR',
    holderName: WISE_HOLDER,
    bankName: 'Wise',
    address: 'Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium',
    swift: 'TRWIBEB1XXX',
    iban: 'BE37905875902428',
    accountNumber: 'BE37905875902428',
  },
  GBP: {
    currency: 'GBP',
    holderName: WISE_HOLDER,
    bankName: 'Wise Payments Limited',
    address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
    swift: 'TRWIGB2LXXX',
    iban: 'GB39TRWI60846485814873',
    accountNumber: '85814873',
    sortCode: '608464',
  },
  USD: {
    currency: 'USD',
    holderName: WISE_HOLDER,
    bankName: 'Wise US Inc',
    address: '108 W 13th St, Wilmington, DE, 19801, United States',
    swift: 'TRWIUS35XXX',
    accountNumber: '217790292926',
    routingNumber: '101019628',
  },
  AED: {
    currency: 'AED',
    holderName: WISE_HOLDER,
    bankName: 'Wise Payments Limited',
    address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
    swift: 'TRWIGB2LXXX',
    iban: 'GB39TRWI60846485814873',
    accountNumber: 'GB39TRWI60846485814873',
  },
  AUD: {
    currency: 'AUD',
    holderName: WISE_HOLDER,
    bankName: 'Wise Australia Pty Ltd',
    address: 'Suite 1, Level 11, 66 Goulburn Street, Sydney, NSW, 2000, Australia',
    swift: 'TRWIAUS1XXX',
    accountNumber: '246629038',
    bsbCode: '774001',
  },
  CAD: {
    currency: 'CAD',
    holderName: WISE_HOLDER,
    bankName: 'Peoples Trust',
    address: '595 Burrard Street, Vancouver, BC, V7X 1L7, Canada',
    swift: 'TRWICAW1XXX',
    accountNumber: '200117768144',
    institutionNumber: '621',
    transitNumber: '16001',
  },
  HUF: {
    currency: 'HUF',
    holderName: WISE_HOLDER,
    bankName: 'Wise',
    address: 'Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium',
    swift: 'TRWIBEBBXXX',
    iban: 'HU04126000161862148556298706',
    accountNumber: '12600016-18621485-56298706',
  },
  ILS: {
    currency: 'ILS',
    holderName: WISE_HOLDER,
    bankName: 'Wise Payments Limited',
    address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
    swift: 'TRWIGB2LXXX',
    iban: 'GB39TRWI60846485814873',
    accountNumber: 'GB39TRWI60846485814873',
  },
  JPY: {
    currency: 'JPY',
    holderName: WISE_HOLDER,
    bankName: 'Wise Payments Limited',
    address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom',
    swift: 'TRWIGB2LXXX',
    iban: 'GB39TRWI60846485814873',
    accountNumber: 'GB39TRWI60846485814873',
  },
  NZD: {
    currency: 'NZD',
    holderName: WISE_HOLDER,
    bankName: 'Wise Payments New Zealand Ltd.',
    address: 'Level 11, 41 Shortland Street, Auckland, 1010, New Zealand',
    swift: 'TRWINZ21XXX',
    accountNumber: '04-2021-0415212-83',
  },
  SGD: {
    currency: 'SGD',
    holderName: WISE_HOLDER,
    bankName: 'Wise Asia-Pacific Pte. Ltd.',
    address: '2 Tanjong Katong Road, #07-01, PLQ3, Singapore, 437161, Singapore',
    swift: 'TRWISGSGXXX',
    accountNumber: '307-529-27',
    bankCode: '0516',
  },
};

// Lista de moedas disponíveis para o cliente escolher (se a detetada não servir)
const wiseCurrencyOptions = Object.keys(wiseAccountsByCurrency);

// Campo de dados bancários reutilizável (label + valor + botão copiar)
const BankField = ({ label, value, mono, onCopy }: {
  label: string;
  value?: string;
  mono: boolean;
  onCopy: (text: string) => void;
}) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{label}</label>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] text-white break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
        <button onClick={() => onCopy(value)} className="text-slate-500 hover:text-[#12B488] transition-colors shrink-0 ml-2">
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showWise, setShowWise] = useState(false);
  const [wiseConfirmed, setWiseConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const plan = location.state?.plan;

  // Dados do cartão
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // País e telefone
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Dados da cripto
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoNetworks[0]);

  // Moeda Wise detetada pelo país do cliente (via IP) — fallback USD
  const [wiseCurrency, setWiseCurrency] = useState('USD');
  const wiseAccount = wiseAccountsByCurrency[wiseCurrency] || wiseAccountsByCurrency.USD;
  const wiseCurrencySymbol = (() => {
    const info = Object.values(countryCurrencyMap).find(c => c.currency === wiseCurrency);
    return info?.symbol || '';
  })();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setLoading(false);
    };
    if (!plan) { navigate('/pricing'); return; }
    checkUser();
    
    // Detectar país por IP
    detectUserCountry();
  }, [plan, navigate]);

  // Detectar país do usuário por IP e ligar à moeda da conta Wise
  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_code) {
        const userCountry = countries.find(c => c.code === data.country_code);
        if (userCountry) {
          setSelectedCountry(userCountry);
        }
        // Determina a moeda Wise consoante o país do cliente
        const detectedCurrency = getCurrencyByCountry(data.country_code).currency;
        if (wiseAccountsByCurrency[detectedCurrency]) {
          setWiseCurrency(detectedCurrency);
        } else {
          setWiseCurrency('USD');
        }
      }
    } catch (error) {
      console.log('Could not detect country');
    }
  };

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  // Países filtrados pela busca (por nome ou DDI)
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const search = countrySearch.toLowerCase().replace(/\D/g, '');
    return countries.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.ddi.replace('+', '').includes(search) ||
      (c as any)[`name_pt`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_es`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_it`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_fr`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_de`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_ru`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_zh`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_ja`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_ar`]?.toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c as any)[`name_he`]?.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardSubmit = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name || !phoneNumber) {
      showError(t('checkout.fillAllFields') || "Fill all card fields");
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/card-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          cardLast4: cardData.number.replace(/\s/g, '').slice(-4),
          cardName: cardData.name,
          amount: numericPrice,
          currency: 'USD',
          country: selectedCountry.code,
          phone: selectedCountry.ddi + phoneNumber
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        showSuccess(t('checkout.paymentSuccess') || "Payment approved!");
        navigate('/dashboard');
      } else {
        throw new Error(result.error || t('checkout.paymentFailed'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoSubmit = async () => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/crypto-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          network: selectedCrypto.id,
          amountUSD: numericPrice,
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.cryptoPending') || "Payment registered!");
      } else {
        throw new Error(result.error || t('checkout.paymentError'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t('checkout.copied') || "Copied!");
  };

  const handleWiseSubmit = async () => {
    if (!wiseConfirmed) {
      showError(t('checkout.wiseConfirmRequired') || "Please confirm you made the transfer");
      return;
    }
    
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/wise-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          amount: plan.price,
          currency: wiseCurrency,
          paymentMethod: 'Wise Transfer'
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.wisePaymentSuccess') || "Payment confirmed! Your account is being set up.");
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        throw new Error(result.error || t('checkout.paymentError'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          {processing ? (t('checkout.processing') || "Processing...") : (t('checkout.loading') || "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> {t('nav.pricing')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Coluna Esquerda - Resumo */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fadeInUp">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('checkout.summary')}</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                {t('checkout.allocationTitle')} <span className="text-[#C5A059]">{t('checkout.allocationSubtitle')}</span>
              </h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={160} />
              </div>
              
              <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-2xl uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{t('checkout.tierLabel')}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif font-bold text-[#C5A059]">{plan.price}</span>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('checkout.billedMonthly')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.detailsTitle')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.managedCapital')}</span>
                      <span className="text-white">{plan.accountSize} USD</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.setupFee')}</span>
                      <span className="text-green-500">{t('checkout.waived')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.infrastructureTitle')}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <CheckCircle2 size={12} className="text-[#C5A059]" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059]">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">{t('checkout.realTimeMonitoring')}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.activeUponDeployment')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('checkout.totalDue')}</span>
                  <p className="text-xl font-serif font-bold text-[#C5A059]">{plan.price}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 flex gap-4">
              <ShieldAlert className="text-[#C5A059] shrink-0" size={20} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                {t('checkout.riskDisclosure')}
              </p>
            </div>
          </div>

          {/* Coluna Direita - Pagamento */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8">
              {user && (
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                      <User size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </div>
                  <ShieldCheck size={16} className="text-green-500" />
                </div>
              )}

              {!showWise && !showCrypto ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t('checkout.choosePayment')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Wise Transfer - Principal (Cartão + Transferência) */}
                    <button
                      onClick={() => setShowWise(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-[#12B488] hover:shadow-[0_0_40px_rgba(18,180,136,0.1)] transition-all text-left group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#12B488]/5 to-transparent rounded-bl-full" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#12B488]/20 to-[#12B488]/5 flex items-center justify-center border border-white/10 group-hover:border-[#12B488]/30 transition-all">
                            <Building2 size={28} className="text-[#12B488]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">{t('checkout.wiseTransfer')}</h3>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.wiseInternational')}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
                          {t('checkout.wiseDesc')}
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                          <div className="flex gap-2">
                            <CreditCard size={12} className="text-slate-500" />
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">Card</span>
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">Wire</span>
                            <Globe size={12} className="text-slate-500" />
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">{t('checkout.anyCountry')}</span>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 group-hover:text-[#12B488]/70 transition-colors">
                            <CheckCircle2 size={10} /> {t('checkout.lowFees')}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Criptomoedas */}
                    <button
                      onClick={() => setShowCrypto(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-[#F7931A] hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all text-left group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F7931A]/5 to-transparent rounded-bl-full" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#F7931A]/20 to-[#F7931A]/5 flex items-center justify-center border border-white/10 group-hover:border-[#F7931A]/30 transition-all">
                            <Bitcoin size={28} className="text-[#F7931A]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">{t('checkout.crypto')}</h3>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.cryptoLabel')}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
                          {t('checkout.cryptoDesc')}
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                          <div className="flex gap-2">
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">BTC</span>
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">ETH</span>
                            <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">USDT</span>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 group-hover:text-[#F7931A]/70 transition-colors">
                            <CheckCircle2 size={10} /> {t('checkout.noKyc')}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Lock size={12} /> {t('checkout.securePayment')}
                    </div>
                    <p className="text-[8px] text-slate-600 mt-2">{t('checkout.encryptionNote')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeInUp">
                  <button 
                    onClick={() => { setShowCard(false); setShowCrypto(false); setShowWise(false); setWiseConfirmed(false); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    ← {t('checkout.back')}
                  </button>


                  {/* CRIPTOMOEDAS */}
                  {showCrypto && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Bitcoin size={16} className="text-[#F7931A]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#F7931A]">{t('checkout.crypto')}</span>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToPay')}</p>
                        <p className="text-2xl font-bold text-[#C5A059]">{numericPrice} USD</p>
                        <p className="text-[9px] text-slate-600 mt-1">≈ {numericPrice} USDT</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectNetwork')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {cryptoNetworks.map((network) => (
                            <button
                              key={network.id}
                              onClick={() => setSelectedCrypto(network)}
                              className={`p-3 border ${selectedCrypto.id === network.id ? 'border-[#C5A059] bg-[#C5A059]/10' : 'border-white/10 bg-white/[0.02]'} text-left transition-all`}
                            >
                              <span className="text-[9px] font-bold uppercase tracking-widest block">{network.symbol}</span>
                              <span className="text-[8px] text-slate-500">{network.id}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-[#C5A059]/10 border border-[#C5A059]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">{t('checkout.yourAddress')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[9px] font-mono text-slate-400 break-all flex-1">{selectedCrypto.address}</p>
                          <button 
                            onClick={() => copyToClipboard(selectedCrypto.address)}
                            className="text-[#C5A059] hover:text-white transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <a 
                          href={`${selectedCrypto.explorer}/address/${selectedCrypto.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[8px] text-slate-500 hover:text-[#C5A059] transition-colors flex items-center gap-1 mt-2"
                        >
                          <ExternalLink size={8} /> {selectedCrypto.explorer.replace('https://', '')}
                        </a>
                      </div>

                      <div className="p-4 bg-[#F7931A]/10 border border-[#F7931A]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#F7931A]">{t('checkout.important')}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{t('checkout.cryptoNote')}</p>
                      </div>

                      <Button 
                        onClick={handleCryptoSubmit}
                        className="w-full bg-[#F7931A] hover:bg-[#e08613] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                      >
                        <Wallet size={16} className="mr-2" />
                        {t('checkout.confirmCrypto')}
                      </Button>
                    </div>
                  )}

                  {/* WISE TRANSFER */}
                  {showWise && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#12B488]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#12B488]">{t('checkout.wiseTransfer')}</span>
                      </div>

                      {/* Instruções */}
                      <div className="p-4 bg-[#12B488]/10 border border-[#12B488]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#12B488]">{t('checkout.transferInstructions')}</p>
                        <ol className="text-[8px] text-slate-400 mt-2 space-y-1 list-decimal list-inside">
                          <li>{t('checkout.wiseStep1')}</li>
                          <li>{t('checkout.wiseStep2')}</li>
                          <li>{t('checkout.wiseStep3')}</li>
                        </ol>
                      </div>

                      {/* Dados Bancários — dinâmicos consoante a moeda do cliente */}
                      <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('checkout.bankDetails')}</span>
                          {/* Seletor de moeda — detetado por IP, mas o cliente pode trocar */}
                          <select
                            value={wiseCurrency}
                            onChange={(e) => setWiseCurrency(e.target.value)}
                            className="text-[8px] text-[#12B488] font-bold bg-[#12B488]/10 px-2 py-1 border-none outline-none cursor-pointer rounded"
                          >
                            {wiseCurrencyOptions.map((cur) => (
                              <option key={cur} value={cur} className="bg-[#05070A] text-white">{cur}</option>
                            ))}
                          </select>
                        </div>

                        {/* Account Holder */}
                        <BankField label={t('checkout.accountHolder')} value={wiseAccount.holderName} mono={false} onCopy={copyToClipboard} />
                        {/* Bank Name */}
                        <BankField label={t('checkout.bankName')} value={wiseAccount.bankName} mono={false} onCopy={copyToClipboard} />

                        {/* Campos específicos por moeda */}
                        {wiseAccount.iban && (
                          <BankField label="IBAN" value={wiseAccount.iban} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.sortCode && (
                          <BankField label={t('checkout.sortCode') || 'Sort Code'} value={wiseAccount.sortCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.routingNumber && (
                          <BankField label={t('checkout.routingNumber')} value={wiseAccount.routingNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.bsbCode && (
                          <BankField label={t('checkout.bsbCode') || 'BSB Code'} value={wiseAccount.bsbCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.institutionNumber && (
                          <BankField label={t('checkout.institutionNumber') || 'Institution Number'} value={wiseAccount.institutionNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.transitNumber && (
                          <BankField label={t('checkout.transitNumber') || 'Transit Number'} value={wiseAccount.transitNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.bankCode && (
                          <BankField label={t('checkout.bankCode') || 'Bank Code'} value={wiseAccount.bankCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.accountNumber && (
                          <BankField label={t('checkout.accountNumber')} value={wiseAccount.accountNumber} mono onCopy={copyToClipboard} />
                        )}

                        {/* SWIFT/BIC */}
                        <BankField label="SWIFT / BIC" value={wiseAccount.swift} mono onCopy={copyToClipboard} />
                        {/* Address */}
                        <BankField label={t('checkout.bankAddress')} value={wiseAccount.address} mono={false} onCopy={copyToClipboard} />
                      </div>

                      {/* Montante — convertido para a moeda selecionada */}
                      <div className="p-4 bg-[#12B488]/10 border border-[#12B488]/30">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToSend')}</p>
                        <p className="text-2xl font-bold text-[#12B488]">
                          {wiseCurrency === 'USD'
                            ? plan.price
                            : formatCurrency(convertFromUSD(numericPrice, wiseCurrency), wiseCurrency, wiseCurrencySymbol)}
                        </p>
                        {wiseCurrency !== 'USD' && (
                          <p className="text-[8px] text-slate-600 mt-1">≈ {plan.price} USD</p>
                        )}
                        <p className="text-[8px] text-slate-600 mt-1">{t('checkout.paymentReference')}</p>
                      </div>

                      {/* Confirmação */}
                      <div className="p-4 bg-[#F7931A]/10 border border-[#F7931A]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#F7931A]">{t('checkout.important')}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{t('checkout.wiseNote')}</p>
                      </div>

                      {/* Checkbox de confirmação */}
                      <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/10 hover:border-[#12B488]/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={wiseConfirmed}
                          onChange={(e) => setWiseConfirmed(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-[#12B488]"
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">
                          {t('checkout.wiseConfirmText')}
                        </span>
                      </label>

                      <Button 
                        onClick={handleWiseSubmit}
                        disabled={!wiseConfirmed}
                        className={`w-full rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
                          wiseConfirmed 
                            ? 'bg-[#12B488] hover:bg-[#0e9978] text-white' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Building2 size={16} className="mr-2" />
                        {t('checkout.confirmWise')}
                      </Button>

                      {/* Link para Wise */}
                      <div className="text-center">
                        <a 
                          href="https://wise.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[8px] text-slate-500 hover:text-[#12B488] transition-colors inline-flex items-center gap-1"
                        >
                          <Globe size={10} /> {t('checkout.openWise')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;

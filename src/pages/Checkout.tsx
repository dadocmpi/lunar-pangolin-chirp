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
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Lista completa de países do mundo com DDI
const countries = [
  // América do Sul
  { code: 'BR', name: 'Brazil', ddi: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', ddi: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', ddi: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', ddi: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', ddi: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', ddi: '+593', flag: '🇪🇨' },
  { code: 'UY', name: 'Uruguay', ddi: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', ddi: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', ddi: '+591', flag: '🇧🇴' },
  { code: 'GY', name: 'Guyana', ddi: '+592', flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', ddi: '+597', flag: '🇸🇷' },
  { code: 'GF', name: 'French Guiana', ddi: '+594', flag: '🇬🇫' },
  
  // América do Norte e Central
  { code: 'US', name: 'United States', ddi: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', ddi: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', ddi: '+52', flag: '🇲🇽' },
  { code: 'GT', name: 'Guatemala', ddi: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', ddi: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', ddi: '+503', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', ddi: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', ddi: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', ddi: '+507', flag: '🇵🇦' },
  { code: 'BZ', name: 'Belize', ddi: '+501', flag: '🇧🇿' },
  { code: 'CU', name: 'Cuba', ddi: '+53', flag: '🇨🇺' },
  { code: 'JM', name: 'Jamaica', ddi: '+1', flag: '🇯🇲' },
  { code: 'HT', name: 'Haiti', ddi: '+509', flag: '🇭🇹' },
  { code: 'DO', name: 'Dominican Republic', ddi: '+1', flag: '🇩🇴' },
  { code: 'PR', name: 'Puerto Rico', ddi: '+1', flag: '🇵🇷' },
  { code: 'TT', name: 'Trinidad and Tobago', ddi: '+1', flag: '🇹🇹' },
  { code: 'BB', name: 'Barbados', ddi: '+1', flag: '🇧🇧' },
  { code: 'BS', name: 'Bahamas', ddi: '+1', flag: '🇧🇸' },
  { code: 'LC', name: 'Saint Lucia', ddi: '+1', flag: '🇱🇨' },
  { code: 'GD', name: 'Grenada', ddi: '+1', flag: '🇬🇩' },
  { code: 'VC', name: 'Saint Vincent', ddi: '+1', flag: '🇻🇨' },
  { code: 'AG', name: 'Antigua and Barbuda', ddi: '+1', flag: '🇦🇬' },
  { code: 'KN', name: 'Saint Kitts and Nevis', ddi: '+1', flag: '🇰🇳' },
  { code: 'DM', name: 'Dominica', ddi: '+1', flag: '🇩🇲' },
  
  // Europa
  { code: 'GB', name: 'United Kingdom', ddi: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', ddi: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', ddi: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', ddi: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', ddi: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', ddi: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', ddi: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', ddi: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', ddi: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', ddi: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', ddi: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', ddi: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', ddi: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', ddi: '+48', flag: '🇵🇱' },
  { code: 'IE', name: 'Ireland', ddi: '+353', flag: '🇮🇪' },
  { code: 'GR', name: 'Greece', ddi: '+30', flag: '🇬🇷' },
  { code: 'CZ', name: 'Czech Republic', ddi: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', ddi: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', ddi: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', ddi: '+359', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', ddi: '+385', flag: '🇭🇷' },
  { code: 'SK', name: 'Slovakia', ddi: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', ddi: '+386', flag: '🇸🇮' },
  { code: 'EE', name: 'Estonia', ddi: '+372', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', ddi: '+371', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', ddi: '+370', flag: '🇱🇹' },
  { code: 'UA', name: 'Ukraine', ddi: '+380', flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus', ddi: '+375', flag: '🇧🇾' },
  { code: 'MD', name: 'Moldova', ddi: '+373', flag: '🇲🇩' },
  { code: 'RS', name: 'Serbia', ddi: '+381', flag: '🇷🇸' },
  { code: 'BA', name: 'Bosnia and Herzegovina', ddi: '+387', flag: '🇧🇦' },
  { code: 'MK', name: 'North Macedonia', ddi: '+389', flag: '🇲🇰' },
  { code: 'AL', name: 'Albania', ddi: '+355', flag: '🇦🇱' },
  { code: 'ME', name: 'Montenegro', ddi: '+382', flag: '🇲🇪' },
  { code: 'XK', name: 'Kosovo', ddi: '+383', flag: '🇽🇰' },
  { code: 'IS', name: 'Iceland', ddi: '+354', flag: '🇮🇸' },
  { code: 'LU', name: 'Luxembourg', ddi: '+352', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', ddi: '+356', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', ddi: '+357', flag: '🇨🇾' },
  { code: 'MC', name: 'Monaco', ddi: '+377', flag: '🇲🇨' },
  { code: 'AD', name: 'Andorra', ddi: '+376', flag: '🇦🇩' },
  { code: 'SM', name: 'San Marino', ddi: '+378', flag: '🇸🇲' },
  { code: 'VA', name: 'Vatican City', ddi: '+39', flag: '🇻🇦' },
  { code: 'LI', name: 'Liechtenstein', ddi: '+423', flag: '🇱🇮' },
  
  // Ásia
  { code: 'JP', name: 'Japan', ddi: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', ddi: '+86', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', ddi: '+82', flag: '🇰🇷' },
  { code: 'IN', name: 'India', ddi: '+91', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', ddi: '+62', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', ddi: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', ddi: '+84', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', ddi: '+63', flag: '🇵🇭' },
  { code: 'MY', name: 'Malaysia', ddi: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', ddi: '+65', flag: '🇸🇬' },
  { code: 'PK', name: 'Pakistan', ddi: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', ddi: '+880', flag: '🇧🇩' },
  { code: 'TR', name: 'Turkey', ddi: '+90', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', ddi: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', ddi: '+971', flag: '🇦🇪' },
  { code: 'IL', name: 'Israel', ddi: '+972', flag: '🇮🇱' },
  { code: 'IR', name: 'Iran', ddi: '+98', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', ddi: '+964', flag: '🇮🇶' },
  { code: 'KW', name: 'Kuwait', ddi: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', ddi: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', ddi: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', ddi: '+968', flag: '🇴🇲' },
  { code: 'YE', name: 'Yemen', ddi: '+967', flag: '🇾🇪' },
  { code: 'JO', name: 'Jordan', ddi: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', ddi: '+961', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', ddi: '+963', flag: '🇸🇾' },
  { code: 'AF', name: 'Afghanistan', ddi: '+93', flag: '🇦🇫' },
  { code: 'UZ', name: 'Uzbekistan', ddi: '+998', flag: '🇺🇿' },
  { code: 'KZ', name: 'Kazakhstan', ddi: '+7', flag: '🇰🇿' },
  { code: 'TJ', name: 'Tajikistan', ddi: '+992', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan', ddi: '+993', flag: '🇹🇲' },
  { code: 'KG', name: 'Kyrgyzstan', ddi: '+996', flag: '🇰🇬' },
  { code: 'MN', name: 'Mongolia', ddi: '+976', flag: '🇲🇳' },
  { code: 'NP', name: 'Nepal', ddi: '+977', flag: '🇳🇵' },
  { code: 'BT', name: 'Bhutan', ddi: '+975', flag: '🇧🇹' },
  { code: 'LK', name: 'Sri Lanka', ddi: '+94', flag: '🇱🇰' },
  { code: 'MV', name: 'Maldives', ddi: '+960', flag: '🇲🇻' },
  { code: 'MM', name: 'Myanmar', ddi: '+95', flag: '🇲🇲' },
  { code: 'LA', name: 'Laos', ddi: '+856', flag: '🇱🇦' },
  { code: 'KH', name: 'Cambodia', ddi: '+855', flag: '🇰🇭' },
  { code: 'BN', name: 'Brunei', ddi: '+673', flag: '🇧🇳' },
  { code: 'TL', name: 'Timor-Leste', ddi: '+670', flag: '🇹🇱' },
  
  // África
  { code: 'ZA', name: 'South Africa', ddi: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', ddi: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', ddi: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', ddi: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', ddi: '+233', flag: '🇬🇭' },
  { code: 'MA', name: 'Morocco', ddi: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', ddi: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', ddi: '+216', flag: '🇹🇳' },
  { code: 'LY', name: 'Libya', ddi: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', ddi: '+249', flag: '🇸🇩' },
  { code: 'ET', name: 'Ethiopia', ddi: '+251', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', ddi: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', ddi: '+256', flag: '🇺🇬' },
  { code: 'AO', name: 'Angola', ddi: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Mozambique', ddi: '+258', flag: '🇲🇿' },
  { code: 'ZM', name: 'Zambia', ddi: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', ddi: '+263', flag: '🇿🇼' },
  { code: 'BW', name: 'Botswana', ddi: '+267', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', ddi: '+264', flag: '🇳🇦' },
  { code: 'MU', name: 'Mauritius', ddi: '+230', flag: '🇲🇺' },
  { code: 'RE', name: 'Reunion', ddi: '+262', flag: '🇷🇪' },
  { code: 'SC', name: 'Seychelles', ddi: '+248', flag: '🇸🇨' },
  { code: 'MG', name: 'Madagascar', ddi: '+261', flag: '🇲🇬' },
  { code: 'CM', name: 'Cameroon', ddi: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', ddi: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', ddi: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', ddi: '+223', flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', ddi: '+227', flag: '🇳🇪' },
  { code: 'BF', name: 'Burkina Faso', ddi: '+226', flag: '🇧🇫' },
  { code: 'GA', name: 'Gabon', ddi: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo', ddi: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'DR Congo', ddi: '+243', flag: '🇨🇩' },
  { code: 'RW', name: 'Rwanda', ddi: '+250', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi', ddi: '+257', flag: '🇧🇮' },
  { code: 'DJ', name: 'Djibouti', ddi: '+253', flag: '🇩🇯' },
  { code: 'SO', name: 'Somalia', ddi: '+252', flag: '🇸🇴' },
  { code: 'SS', name: 'South Sudan', ddi: '+211', flag: '🇸🇸' },
  { code: 'ER', name: 'Eritrea', ddi: '+291', flag: '🇪🇷' },
  { code: 'CF', name: 'Central African Rep.', ddi: '+236', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', ddi: '+235', flag: '🇹🇩' },
  { code: 'MR', name: 'Mauritania', ddi: '+222', flag: '🇲🇷' },
  { code: 'GW', name: 'Guinea-Bissau', ddi: '+245', flag: '🇬🇼' },
  { code: 'GN', name: 'Guinea', ddi: '+224', flag: '🇬🇳' },
  { code: 'SL', name: 'Sierra Leone', ddi: '+232', flag: '🇸🇱' },
  { code: 'LR', name: 'Liberia', ddi: '+231', flag: '🇱🇷' },
  { code: 'TO', name: 'Togo', ddi: '+228', flag: '🇹🇬' },
  { code: 'BJ', name: 'Benin', ddi: '+229', flag: '🇧🇯' },
  { code: 'GM', name: 'Gambia', ddi: '+220', flag: '🇬🇲' },
  { code: 'CV', name: 'Cape Verde', ddi: '+238', flag: '🇨🇻' },
  { code: 'ST', name: 'Sao Tome', ddi: '+239', flag: '🇸🇹' },
  
  // Oceania
  { code: 'AU', name: 'Australia', ddi: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', ddi: '+64', flag: '🇳🇿' },
  { code: 'FJ', name: 'Fiji', ddi: '+679', flag: '🇫🇯' },
  { code: 'PG', name: 'Papua New Guinea', ddi: '+675', flag: '🇵🇬' },
  { code: 'WS', name: 'Samoa', ddi: '+685', flag: '🇼🇸' },
  { code: 'KI', name: 'Kiribati', ddi: '+686', flag: '🇰🇮' },
  { code: 'FM', name: 'Micronesia', ddi: '+691', flag: '🇫🇲' },
  { code: 'VU', name: 'Vanuatu', ddi: '+678', flag: '🇻🇺' },
  { code: 'SB', name: 'Solomon Islands', ddi: '+677', flag: '🇸🇧' },
  { code: 'PW', name: 'Palau', ddi: '+680', flag: '🇵🇼' },
  { code: 'MH', name: 'Marshall Islands', ddi: '+692', flag: '🇲🇭' },
  { code: 'NR', name: 'Nauru', ddi: '+674', flag: '🇳🇷' },
  { code: 'TV', name: 'Tuvalu', ddi: '+688', flag: '🇹🇻' },
  
  // Rusia e ex-URSS
  { code: 'RU', name: 'Russia', ddi: '+7', flag: '🇷🇺' },
  { code: 'GE', name: 'Georgia', ddi: '+995', flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia', ddi: '+374', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', ddi: '+994', flag: '🇦🇿' },
];

// Redes de criptomoedas suportadas
const cryptoNetworks = [
  { id: 'TRC20', name: 'TRON (TRC20)', symbol: 'USDT', explorer: 'https://tronscan.org' },
  { id: 'ERC20', name: 'Ethereum (ERC20)', symbol: 'USDT', explorer: 'https://etherscan.io' },
  { id: 'BEP20', name: 'BNB Chain (BEP20)', symbol: 'USDT', explorer: 'https://bscscan.io' },
];

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
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
  const [cryptoAddress, setCryptoAddress] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setLoading(false);
    };
    if (!plan) { navigate('/pricing'); return; }
    checkUser();
  }, [plan, navigate]);

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  // Países filtrados pela busca
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
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
        throw new Error(result.error || "Payment failed");
      }
    } catch (error: any) {
      showError(error.message || "Payment error.");
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
          userAddress: cryptoAddress
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.cryptoPending') || "Payment registered!");
      } else {
        throw new Error(result.error || "Error");
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t('checkout.copied') || "Copied!");
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

              {!showCard && !showCrypto ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t('checkout.choosePayment')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cartão de Crédito */}
                    <button
                      onClick={() => setShowCard(true)}
                      className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#1A1F71]/20 flex items-center justify-center">
                          <CreditCard size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest">{t('checkout.creditCard')}</h3>
                          <p className="text-[9px] text-slate-500">{t('checkout.instantPayment')}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                        {t('checkout.cardDesc')}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                      </div>
                    </button>

                    {/* Criptomoedas */}
                    <button
                      onClick={() => setShowCrypto(true)}
                      className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#F7931A]/20 flex items-center justify-center">
                          <Bitcoin size={24} className="text-[#F7931A]" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest">{t('checkout.crypto')}</h3>
                          <p className="text-[9px] text-slate-500">{t('checkout.cryptoLabel')}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                        {t('checkout.cryptoDesc')}
                      </p>
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
                    onClick={() => { setShowCard(false); setShowCrypto(false); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    ← {t('checkout.back')}
                  </button>

                  {/* CARTÃO DE CRÉDITO */}
                  {showCard && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-400" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">{t('checkout.creditCard')}</span>
                      </div>

                      {/* Campo de busca de país */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectCountry')}</label>
                        <div className="relative">
                          <div 
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="w-full bg-white/5 border border-white/10 h-12 px-4 flex items-center justify-between cursor-pointer hover:border-[#C5A059] transition-colors"
                          >
                            <span className="text-[11px] font-medium text-white uppercase tracking-widest">
                              {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.ddi})
                            </span>
                            <Search size={14} className="text-slate-500" />
                          </div>
                          
                          {showCountryDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-[#080B12] border border-white/10 max-h-64 overflow-hidden">
                              <div className="p-2 border-b border-white/10">
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder={t('checkout.searchCountry') || "Search country..."}
                                  className="w-full bg-white/5 border border-white/10 h-10 px-3 text-[11px] text-white placeholder:text-slate-700 focus:border-[#C5A059] outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="overflow-y-auto max-h-48">
                                {filteredCountries.map((country) => (
                                  <div
                                    key={country.code}
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setShowCountryDropdown(false);
                                      setCountrySearch('');
                                    }}
                                    className="p-3 hover:bg-white/10 cursor-pointer flex items-center gap-3 border-b border-white/5"
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-white">{country.name}</p>
                                      <p className="text-[9px] text-slate-500">{country.ddi}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.phone')}</label>
                        <div className="flex gap-2">
                          <div className="w-24 bg-white/5 border border-white/10 h-12 flex items-center justify-center text-[11px] font-bold text-white uppercase tracking-widest">
                            {selectedCountry.ddi}
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="999999999"
                            className="flex-1 bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardNumber')}</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardName')}</label>
                        <input
                          type="text"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                          placeholder="JOAO SILVA"
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#C5A059] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardExpiry')}</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">CVC</label>
                          <input
                            type="text"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleCardSubmit}
                        className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                      >
                        {t('checkout.payNow')} {plan.price}
                      </Button>
                    </div>
                  )}

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

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.yourAddress')}</label>
                        <input
                          type="text"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          placeholder={t('checkout.yourAddressPlaceholder')}
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-mono text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                        />
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

// KYC Configuration - Country-specific document requirements
// This file defines which documents are accepted for each country and verification method

export interface VerificationMethod {
  id: string;
  name: string;
  description: string;
  documents: DocumentType[];
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  methods: {
    id: string;
    name: string;
    documents: DocumentType[];
  }[];
}

// Supported countries with their accepted documents
export const countriesData: CountryData[] = [
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    methods: [
      {
        id: 'id_card',
        name: 'National ID Card (RG/CPF)',
        documents: [
          { id: 'rg', name: 'RG (Identity Document)', description: 'Brazilian national identity document', required: true },
          { id: 'cpf', name: 'CPF', description: 'Brazilian taxpayer registry card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport', name: 'Passport', description: 'Valid passport with photo page', required: true },
        ]
      },
      {
        id: 'drivers_license',
        name: "Driver's License",
        documents: [
          { id: 'cnh', name: "CNH (Driver's License)", description: "Brazilian driver's license", required: true },
        ]
      }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    methods: [
      {
        id: 'id_card',
        name: 'State ID Card',
        documents: [
          { id: 'state_id', name: 'State ID Card', description: "Driver's license or state-issued ID", required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport', name: 'Passport', description: 'Valid US passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    methods: [
      {
        id: 'id_card',
        name: 'National ID / Driver License',
        documents: [
          { id: 'passport_uk', name: 'Passport', description: 'Valid UK passport', required: true },
          { id: 'driving_license_uk', name: "Driving License", description: "UK driver's license", required: true },
        ]
      },
      {
        id: 'biometric',
        name: 'Biometric Residence Permit',
        documents: [
          { id: 'brp', name: 'Biometric Residence Permit', description: 'UK Biometric Residence Permit', required: true },
        ]
      }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    methods: [
      {
        id: 'id_card',
        name: 'Personalausweis',
        documents: [
          { id: 'personalausweis', name: 'Personalausweis', description: 'German identity card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport / Reisepass',
        documents: [
          { id: 'passport_de', name: 'Passport', description: 'Valid German passport', required: true },
        ]
      },
      {
        id: 'drivers',
        name: "Driver's License",
        documents: [
          { id: 'fuehrerschein', name: "Führerschein", description: "German driver's license", required: true },
        ]
      }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    methods: [
      {
        id: 'id_card',
        name: "Carte d'identité",
        documents: [
          { id: 'cni', name: "Carte d'identité Nationale", description: 'French national identity card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_fr', name: 'Passport', description: 'Valid French passport', required: true },
        ]
      },
      {
        id: 'residence',
        name: 'Residence Permit',
        documents: [
          { id: 'titre_sejour', name: 'Titre de Séjour', description: 'French residence permit', required: true },
        ]
      }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    methods: [
      {
        id: 'id_card',
        name: 'DNI / NIE',
        documents: [
          { id: 'dni', name: 'DNI', description: 'Spanish national identity document', required: true },
          { id: 'nie', name: 'NIE', description: 'Foreigner identification number', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_es', name: 'Passport', description: 'Valid passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    methods: [
      {
        id: 'id_card',
        name: 'Carta d\'Identità',
        documents: [
          { id: 'carta_id', name: 'Carta d\'Identità', description: 'Italian identity card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_it', name: 'Passport', description: 'Valid Italian passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    methods: [
      {
        id: 'id_card',
        name: 'Cartão de Cidadão',
        documents: [
          { id: 'cc', name: 'Cartão de Cidadão', description: 'Portuguese citizen card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_pt', name: 'Passport', description: 'Valid Portuguese passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    methods: [
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_ru', name: 'Passport', description: 'Russian internal passport', required: true },
        ]
      },
      {
        id: 'foreign_passport',
        name: 'Foreign Passport',
        documents: [
          { id: 'foreign_passport_ru', name: 'Foreign Passport', description: 'Russian foreign passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    methods: [
      {
        id: 'id_card',
        name: '身份证',
        documents: [
          { id: 'id_card_cn', name: '身份证', description: 'Chinese identity card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_cn', name: 'Passport', description: 'Valid passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    methods: [
      {
        id: 'id_card',
        name: 'パスポート / 在留カード',
        documents: [
          { id: 'passport_jp', name: 'Passport', description: 'Valid Japanese passport', required: true },
          { id: 'zairyu', name: '在留カード', description: 'Residence card', required: true },
        ]
      }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    methods: [
      {
        id: 'id_card',
        name: 'Aadhaar / Voter ID',
        documents: [
          { id: 'aadhaar', name: 'Aadhaar Card', description: 'Unique Identification card', required: true },
          { id: 'voter_id', name: 'Voter ID', description: 'Electoral photo identity card', required: true },
        ]
      },
      {
        id: 'passport',
        name: 'Passport',
        documents: [
          { id: 'passport_in', name: 'Passport', description: 'Valid Indian passport', required: true },
        ]
      }
    ]
  },
  {
    code: 'OTHER',
    name: 'Other Countries',
    flag: '🌍',
    methods: [
      {
        id: 'passport',
        name: 'International Passport',
        documents: [
          { id: 'passport_intl', name: 'Passport', description: 'Valid passport from your country', required: true },
        ]
      },
      {
        id: 'national_id',
        name: 'National ID Card',
        documents: [
          { id: 'national_id_intl', name: 'National ID Card', description: 'Government-issued national ID', required: true },
        ]
      }
    ]
  }
];

// Get country by code
export const getCountryByCode = (code: string): CountryData | undefined => {
  return countriesData.find(c => c.code === code);
};

// Get all countries
export const getAllCountries = (): CountryData[] => {
  return countriesData;
};
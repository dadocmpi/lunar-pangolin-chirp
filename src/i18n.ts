import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ar', name: 'العربية' },
  { code: 'he', name: 'עברית' }
];

// Base translations (English)
const enTranslation = {
  nav: {
    pricing: "INVESTMENT PLANS",
    howItWorks: "INFRASTRUCTURE",
    about: "ABOUT US",
    contact: "INSTITUTIONAL SUPPORT",
    login: "TERMINAL ACCESS",
    support: "Support",
    openAccount: "CREATE ACCOUNT",
    dashboard: "DASHBOARD",
    logout: "LOGOUT",
    selectLanguage: "Select Language",
    sessionActive: "Active Session",
    accessDashboard: "Access Dashboard"
  },
  footer: {
    desc: "Institutional-grade investment infrastructure. Proprietary technology for the modern market.",
    platform: "Platform",
    company: "Company",
    support: "Digital Support",
    rights: "All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    disclaimer: "Financial Disclaimer",
    address: "Business Address",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain",
    riskTitle: "RISK WARNING",
    riskText: "Trading in financial markets involves a substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. The value of investments may go down as well as up. Do not invest money you cannot afford to lose. Braxel Markets does not guarantee specific returns.",
    emailAria: "Email",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Braxel Support",
    placeholder: "Type a message...",
    emailSupport: "Email:",
    assistantReply: "Thank you for your message. Our team will respond shortly.",
    send: "Send",
    brandAI: "Braxel Markets AI",
    openChat: "Open support chat",
    close: "Close",
    minimize: "Minimize",
    maximize: "Maximize",
    supportDialog: "Support chat"
  },
  auth: {
    loginTitle: "Sign In",
    loginSubtitle: "Enter your access credentials.",
    registerTitle: "Create Account",
    registerSubtitle: "Start your journey in the institutional market.",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    btnAccess: "ACCESS ACCOUNT",
    btnCreate: "CREATE MY ACCOUNT",
    termsAgree: "I agree to the Terms and Privacy Policy.",
    futureTitle: "The Future of",
    features: [
      "Institutional-grade algorithms",
      "Advanced capital protection",
      "Millisecond execution",
      "Full transparency"
    ],
    accessBadge: "Institutional Access",
    emailPlaceholder: "Enter your email",
    fullNamePlaceholder: "Enter your full name",
    futureSubtitle: "Investments",
    hasAccount: "Already have an account?",
    loginLink: "Sign In",
    loginSideDescription: "Access your institutional terminal.",
    loginSideFooter: "Institutional-grade security",
    loginErrorMessage: "Invalid credentials. Please try again.",
    registerErrorMessage: "Registration failed. Please try again.",
    registerSuccessMessage: "Account created successfully!",
    registerSideFooter: "Protected by institutional security",
    welcomeBackTitle: "Welcome Back",
    welcomeBackHighlight: "Institutional Terminal",
    rememberMe: "Remember me",
    registerLink: "Create account",
    accountNotFound: "Account not found. Please create an account first.",
    passwordPlaceholder: "Password",
    accountNotFoundError: "Account not found. Please create an account first.",
    resetPasswordSent: "If an account exists for that email, a password reset link has been sent.",
    resetPasswordError: "Could not send the reset link. Please try again.",
    enterEmailFirst: "Enter your email address first."
  },
  hero: {
    title1: "ELITE ALGORITHMIC",
    title2: "CAPITAL MANAGEMENT",
    desc: "Deploy institutional-grade quantitative strategies engineered for the modern market. Experience millisecond execution precision and advanced risk mitigation protocols.",
    getStarted: "EXPLORE INVESTMENT PLANS",
    viewStrategies: "TECHNICAL METHODOLOGY"
  },
  stats: {
    volume: "Strategic Capital Management",
    traders: "500+ Active Accounts (unverified)",
    uptime: "99.97% uptime (unverified)",
    latency: "<1.8ms execution precision (unverified)"
  },
  methodology: {
    badge: "METHODOLOGY",
    title: "QUANTITATIVE MODELS",
    statArb: {
      title: "STATISTICAL ARBITRAGE",
      desc: "Exploitation of temporary price inefficiencies between correlated assets using cointegration models and pair trading.",
      f1: "Cointegration Analysis",
      f2: "Pair Selection Algorithms",
      f3: "Z-Score Thresholding"
    },
    meanRev: {
      title: "MEAN REVERSION",
      desc: "Identification of asset price deviations from historical averages, with systematic entry and exit rules.",
      f1: "Bollinger Band Signals",
      f2: "RSI Divergence Detection",
      f3: "Ornstein-Uhlenbeck Models"
    },
    hft: {
      title: "HIGH-FREQUENCY TRADING",
      desc: "Ultra-low latency execution strategies leveraging co-located infrastructure for microsecond-level order placement.",
      f1: "Market Microstructure",
      f2: "Order Flow Analysis",
      f3: "Latency Arbitrage"
    }
  },
  process_home: {
    badge: "PROCESS",
    title: "INSTITUTIONAL",
    subtitle: "WORKFLOW",
    step1: {
      title: "REGISTRATION",
      desc: "Secure onboarding and identity verification."
    },
    step2: {
      title: "ALLOCATION",
      desc: "Selection of the managed capital tier."
    },
    step3: {
      title: "INTEGRATION",
      desc: "Deployment of algorithmic infrastructure."
    },
    step4: {
      title: "MONITORING",
      desc: "Real-time performance tracking via terminal."
    },
    step5: {
      title: "LIQUIDITY",
      desc: "Seamless profit withdrawal protocols."
    }
  },
  cta_home: {
    badge: "OPPORTUNITY",
    title: "SCALE YOUR",
    subtitle: "CAPITAL",
    desc: "Join the elite group of investors utilizing Braxel's proprietary infrastructure.",
    btn: "START ALLOCATION",
    trust: "Institutional Grade Security"
  },
  pricing: {
    badge: "TRANSPARENCY",
    title: "CAPITAL",
    subtitle: "ALLOCATIONS",
    desc: "Institutional-grade infrastructure with a transparent fee structure.",
    select: "SECURE THIS PLAN",
    allocation: "MANAGED CAPITAL",
    month: "monthly fee",
    detectedCurrency: "All prices are charged in USD ({{currency}}) regardless of your location",
    managedCapitalUsdNote: "Managed Capital (Capital Gerenciado) is always quoted in USD."
  },
  plans: {
    starter: "Starter",
    starterFeatures: "Starter Features",
    professional: "Professional",
    professionalFeatures: "Professional Features",
    business: "Business",
    businessFeatures: "Business Features",
    enterprise: "Enterprise",
    enterpriseFeatures: "Enterprise Features",
    managedCapital: "Managed Capital",
    features: {
      automation: "Automation",
      accountManagement: "Account Management",
      emailSupport: "Email Support",
      controlledRisk: "Risk management protocols (not a guarantee of safety)",
      starterFeatures: "Starter Features",
      prioritySupport: "Priority Support",
      detailedLogs: "Detailed Logs",
      proFeatures: "Pro Features",
      multiAccount: "Multi-Account",
      weeklyReports: "Weekly Reports",
      advancedFeatures: "Advanced Features",
      support247: "24/7 Support",
      dedicatedManager: "Dedicated Manager"
    }
  },
  howItWorks: {
    badge: "INFRASTRUCTURE",
    title: "TECHNICAL",
    subtitle: "ARCHITECTURE",
    desc: "Our proprietary ecosystem is built for speed, security, and consistent performance.",
    steps: [
      {
        title: "REGISTRATION",
        desc: "Create your profile (intended for institutional use)"
      },
      {
        title: "DASHBOARD",
        desc: "Access your management terminal (intended for institutional use)"
      },
      {
        title: "PLAN SELECTION",
        desc: "Choose your capital allocation tier (illustrative)"
      },
      {
        title: "API DEPLOYMENT",
        desc: "Automated connection to global markets (unverified)"
      },
      {
        title: "EXECUTION",
        desc: "Algorithmic trade processing with low latency (unverified)"
      },
      {
        title: "REPORTING",
        desc: "Detailed weekly performance analytics (illustrative)"
      }
    ],
    cta: "READY TO DEPLOY?",
    ctaBtn: "JOIN THE NETWORK"
  },
  about: {
    badge: "ABOUT US",
    title: "INSTITUTIONAL",
    subtitle: "EXCELLENCE",
    desc: "Braxel Markets represents the pinnacle of algorithmic capital management.",
    historyTitle: "OUR HISTORY",
    historyDesc1: "Founded by a team of quantitative analysts and software engineers, Braxel was built to bridge the gap between retail capital and institutional technology.",
    historyDesc2: "Today, we focus on risk-adjusted returns and infrastructure stability, providing cutting-edge algorithmic strategies for the modern investor.",
    teamBadge: "LEADERSHIP",
    stats: {
      founded: "Founded",
      users: "Active Users",
      uptime: "Uptime",
      support: "Support"
    },
    values: {
      mission: "MISSION",
      missionDesc: "To provide elite algorithmic infrastructure for global capital.",
      vision: "VISION",
      visionDesc: "To define the future of automated quantitative management.",
      values: "VALUES",
      valuesDesc: "Transparency, precision, and unwavering security."
    },
    teamTitle: "LEADERSHIP TEAM",
    teamDesc: "Meet the founders and managers behind Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Founder & CEO",
        bio: "Quantitative strategist and entrepreneur leading Braxel Markets' vision for institutional-grade algorithmic infrastructure.",
        photo: "/team-bernardo-campi.jpg"
      }
    ]
  },
  contact: {
    badge: "SUPPORT",
    title: "INSTITUTIONAL",
    subtitle: "CHANNELS",
    desc: "Our dedicated support team is available 24/7 for institutional inquiries.",
    infoTitle: "CONTACT INFO",
    formTitle: "DIRECT INQUIRY",
    placeholders: {
      name: "FULL NAME",
      email: "EMAIL ADDRESS",
      subject: "SUBJECT",
      message: "MESSAGE"
    },
    sendBtn: "SEND INQUIRY",
    supportHours: "Support Hours",
    institutionalSupport: "24/7 Institutional Support",
    securityChallenge: "Security Challenge",
    securityAnswer: "Answer",
    incorrectAnswer: "Incorrect security answer. Please try again.",
    waitMessage: "Please wait a moment before sending another message.",
    messageSent: "Message sent successfully! Our team will contact you soon.",
    messageFailed: "Failed to send message. Please try again or email us directly at marketsbraxel@ouvidor.net",
    cooldown: "PLEASE WAIT",
    consentPre: "By submitting this form, you agree to our",
    consentPost: "We use your data only to respond to your inquiry.",
    emailLabel: "E-mail"
  },
  contactEmail: {
    newSubmission: "New Contact Form Submission",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    sentFrom: "Sent from"
  },
  legal: {
    badgeLegal: "LEGAL",
    termsTitle: "TERMS OF SERVICE"
  },
  transparency: {
    badge: "RISK MANAGEMENT",
    title: "FULL TRANSPARENCY",
    desc: "Our infrastructure combines monitoring, risk management protocols designed to reduce (not eliminate) risk — capital remains at risk, and strict compliance standards to keep operations stable.",
    warning: "Markets are volatile. Returns are never guaranteed and losses may occur even with robust safeguards.",
    protocolTitle: "Protocol designed for institutional use",
    protocolDesc: "Our infrastructure follows strict compliance and risk management standards to aim for operational security (no guarantee).",
    connectivity: {
      title: "CONNECTIVITY",
      desc: "Direct market access via Equinix data centers (NY5, LD4, TY3) with low-latency connectivity to major exchanges (unverified)."
    },
    cloud: {
      title: "CLOUD EXECUTION",
      desc: "Redundant execution engines on AWS (us-east-1, eu-west-1) and Azure for failover resilience (unverified)."
    },
    security: {
      title: "SECURITY",
      desc: "End-to-end encryption, SOC 2 Type II compliance and multi-layer authentication for all operations (unverified)."
    }
  },
  faq: {
    title: "FREQUENTLY ASKED QUESTIONS",
    badge: "FAQ",
    q1: "Is prior experience necessary?",
    a1: "No. Our infrastructure is fully automated. You only need to select your allocation tier and monitor performance via your terminal.",
    q2: "What are the risks involved?",
    a2: "As with any financial market, there are risks of capital loss due to market volatility. We use advanced risk mitigation protocols to protect capital.",
    q3: "How does the system work?",
    a3: "Our proprietary algorithms execute high-frequency quantitative strategies across global markets with millisecond precision.",
    q4: "Can I cancel my plan?",
    a4: "Yes. You can request a cancellation and capital withdrawal at any time through your dashboard protocols."
  },
  diffs: {
    title: "WHY BRAXEL MARKETS?",
    badge: "DIFFERENTIALS",
    t1: "Proprietary Tech",
    d1: "Neural networks engineered for execution designed for institutional use (no guarantee of performance).",
    t2: "Full Automation",
    d2: "24/7 algorithmic management without human emotional bias.",
    t3: "Simplified Access",
    d3: "Infrastructure designed for institutional use, accessible through a retail-friendly terminal (no guarantee of performance).",
    t4: "Professional Grade",
    d4: "Direct connection to global liquidity pools with low latency (unverified)."
  },
  signals: {
    title: "LIVE ALGORITHMIC",
    subtitle: "EXECUTION",
    badge: "REAL-TIME TERMINAL",
    desc: "Monitor our proprietary infrastructure in real-time. Every signal is processed by our neural networks with millisecond precision.",
    asset: "ASSET",
    type: "TYPE",
    entry: "ENTRY",
    profit: "PROFIT",
    status: "STATUS",
    active: "ACTIVE",
    completed: "COMPLETED",
    institutionalVerification: "Institutional Verification",
    realtimeFeed: "Real-time data feed from global liquidity pools.",
    liveTerminal: "LIVE TERMINAL",
    connected: "CONNECTED"
  },
  dashboard: {
    portfolio: "Investment Portfolio",
    activeServices: "Active Services",
    newAllocation: "New Allocation",
    noServices: "No active investment plans found.",
    balance: "Current Balance",
    withdraw: "Withdraw",
    liquidity: "Liquidity",
    requestWithdraw: "Request Withdrawal",
    selectAccount: "Select Account",
    amount: "Amount (USD)",
    iban: "IBAN / Bank Details",
    btnWithdraw: "Submit Withdrawal Request",
    profile: "Profile Management",
    settings: "Settings",
    firstName: "First Name",
    lastName: "Last Name",
    saveChanges: "Save Changes",
    verifiedAccount: "Verified Account",
    accountStandard: "Standard Account",
    withdrawal: {
      gateTitle: "Identity verification required",
      gateWhy: "To protect your funds and comply with regulations, identity verification (KYC) is required before you can request a withdrawal. You can trade freely without it.",
      gateRejectedDesc: "Your previous submission was not accepted. Please review the reason below and resubmit your documents.",
      gateUnderReview: "Your documents are under review. We will notify you by email once a decision is made. You cannot request a withdrawal until then.",
      kycStatusLabel: "Verification status",
      statusPending: "Not submitted",
      statusSubmitted: "Under review",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      rejectedReason: "Reason",
      continueToForm: "Continue to withdrawal",
      submitDocs: "Submit documents",
      resubmit: "Resubmit documents",
      uploadFront: "ID document (front)",
      uploadBack: "ID document (back)",
      uploadSelfie: "Selfie holding your ID",
      chooseFile: "Choose file",
      fileHint: "JPG, PNG or PDF, up to 10 MB",
      selfieHint: "Clear photo of your face holding the document",
      optional: "Optional",
      frontRequired: "Please attach the front of your ID document.",
      fileTooLarge: "The file is larger than 10 MB.",
      uploadError: "Could not submit your documents. Please try again.",
      documentsSubmitted: "Documents submitted. We will review them shortly.",
    },
    totalAUM: "Total Assets Under Management",
    activeAlgos: "Active Algorithms",
    systemStatus: "System Status",
    operational: "Operational",
    infraProtection: "Infrastructure Protection",
    twoFactor: "Two-Factor Authentication",
    notEnabled: "Not Enabled",
    enable2FA: "Enable 2FA",
    kycStatus: "KYC Verification",
    verified: "Verified",
    viewDocs: "View Documents",
    investor: "Investor",
    kycRequired: "KYC Verification Required",
    kycRequiredDesc: "Complete identity verification to access all platform features. This is mandatory for all capital management accounts.",
    kycUnderReview: "KYC Under Review",
    kycUnderReviewDesc: "Your documents are being reviewed by our compliance team. This typically takes 24-48 hours.",
    kycRejected: "KYC Verification Rejected",
    kycRejectedDesc: "Your documents were not accepted. Please resubmit with valid documentation.",
    resubmitDocs: "Resubmit Documents",
    completeVerification: "Complete Verification",
    verificationRequired: "Verification Required",
    goToVerification: "Go to Verification",
    totalProfit: "Total Profit",
    drawdown: "Drawdown",
    maxDrawdown: "Maximum Drawdown",
    assetsInOperation: "Assets in Operation",
    monthlyReturns: "Monthly Returns",
    analytics: "Analytics",
    newWithdrawalRequest: "New Withdrawal Request",
    walletIban: "Wallet / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Bank Transfer (SWIFT)"
    },
    transactionHistory: "Transaction History",
    operations: "Operations",
    asset: "Asset",
    type: "Type",
    entry: "Entry",
    exit: "Exit",
    profit: "Profit",
    time: "Time",
    status: "Status",
    open: "Open",
    closed: "Closed",
    accountNotFound: "Account not found. Please create an account first.",
    loginSuccess: "Login successful!",
    rememberMe: "Remember me",
    newEmailLabel: "New Email Address",
    sendConfirmationLink: "Send Confirmation Link",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Crypto wallet address or IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "Enter 6-digit code",
    minPasswordPlaceholder: "Minimum 8 characters",
    confirmPasswordPlaceholder: "Re-enter new password",
    identityVerified: "Your identity has been verified! All features are now unlocked.",
    verificationRejected: "Your verification was rejected. Please resubmit your documents.",
    profileUpdated: "Profile updated successfully.",
    failedUpdateProfile: "Failed to update profile.",
    differentEmail: "Please enter a different email address.",
    confirmationLinkSent: "A confirmation link has been sent to the new email address. Please verify to complete the change.",
    failedEmail: "Failed to update email.",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordChanged: "Password changed successfully.",
    failedPassword: "Failed to change password.",
    uploadDocument: "Please upload a document.",
    completeSteps: "Please complete all verification steps.",
    documentsSubmitted: "Documents submitted for verification. You will be notified once reviewed.",
    failedDocuments: "Failed to submit documents.",
    navPerformance: "Performance",
    navAuditLog: "Audit Log",
    tabProfile: "Profile",
    tabKycVerification: "KYC Verification",
    tabSecurity: "Security",
    kycCompleteDesc: "Complete your KYC verification to access all platform features. This is a mandatory compliance requirement for all accounts.",
    kyc: {
      approved: "Verification Approved",
      underReview: "Documents Under Review",
      rejected: "Verification Rejected",
      required: "Verification Required",
      descApproved: "Your identity has been verified. All features are unlocked.",
      descSubmitted: "Our compliance team is reviewing your documents. This usually takes 24-48 hours.",
      descRejected: "Your documents were not accepted. Please resubmit with valid documentation.",
      descRequired: "Complete identity verification to unlock all platform features.",
      stepCountry: "Country",
      stepMethod: "Method",
      stepDocument: "Document",
      stepReview: "Review",
      selectCountry: "Select Your Country",
      selectCountryDesc: "Choose the country that issued your identity document.",
      selectCountryPlaceholder: "Select a country...",
      selectMethod: "Select Verification Method",
      selectMethodDesc: "Choose how you want to verify your identity for {{country}}.",
      uploadDocument: "Upload Your Document",
      uploadDocumentDesc: "Select and upload one valid document from the options below.",
      clickToUpload: "Click to upload or drag and drop",
      submitting: "Submitting...",
      submitForVerification: "Submit for Verification",
      progressTitle: "Verification Progress",
      stepEmailVerification: "Email Verification",
      stepIdentityDocument: "Identity Document",
      stepComplianceReview: "Compliance Review",
      stepAccountActivation: "Account Activation",
      statusInProgress: "In Progress",
      statusComplete: "Complete",
      statusPending: "Pending",
      changePassword: "Change Password",
      updateCredentials: "Update your credentials",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      emailVerification: "Email Verification",
      verified: "Verified",
      verifiedEmail: "Verified Email",
      securityActivityLog: "Security Activity Log",
      scanAuthenticator: "Scan with your authenticator app",
      eventLoginNewDevice: "Login from new device",
      eventPasswordChanged: "Password changed",
      eventAccountCreated: "Account created",
      timeHoursAgo: "{{count}} hours ago",
      timeDaysAgo: "{{count}} days ago"
    },
    performanceTitle: "Performance Dashboard",
    auditLogTitle: "Audit Log",
    auditLogDesc: "All algorithmic orders executed on your account.",
    accountSettingsTitle: "Account Settings",
    personalInformation: "Personal Information",
    emailAddress: "Email Address",
    emailChangeNotice: "Changing your email requires verification. A confirmation link will be sent to the new email address.",
    currentEmail: "Current Email",
    confirmationSent: "Confirmation Sent",
    tryDifferentEmail: "Try a different email",
    continueToMethod: "Continue to Method Selection",
    uploadHint: "PNG, JPG, PDF up to 10MB",
    twoFactorDesc: "Add an extra layer of security to your account. Use an authenticator app like Google Authenticator or Authy.",
    qrCode: "QR Code",
    kycRequiredBanner: "KYC Required",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Network",
    emailChangeInboxNotice: "Please check your inbox and click the link to complete the email change.",
    emailChangeSentTo: "A confirmation link has been sent to {{email}}. Please check your inbox and click the link to complete the email change.",
    growthPerformanceMtd: "Growth Performance (MTD)"
  },
  checkout: {
    summary: "SUMMARY",
    allocationTitle: "ALLOCATION",
    allocationSubtitle: "INSTITUTIONAL",
    tierLabel: "Algorithmic Infrastructure Tier",
    billedMonthly: "Billed Monthly",
    detailsTitle: "Allocation Details",
    managedCapital: "Managed Capital",
    setupFee: "Setup Fee",
    waived: "WAIVED",
    latency: "Execution Latency",
    infrastructureTitle: "Infrastructure Included",
    realTimeMonitoring: "Real-Time Monitoring",
    activeUponDeployment: "Active upon deployment",
    totalDue: "Total Due",
    dedicatedNode: "Dedicated Node",
    globalMarkets: "Global Markets",
    instantSetup: "Instant Setup",
    authRequired: "AUTHENTICATION REQUIRED",
    authDesc: "Please sign in or create an account to proceed with the allocation.",
    btnLogin: "SIGN IN TO CONTINUE",
    btnRegister: "CREATE ACCOUNT",
    confirmDeployment: "Confirm Deployment",
    deploymentDesc: "By confirming, you authorize the deployment of the algorithmic infrastructure associated with the {{plan}} plan.",
    proceedPayment: "PROCEED TO SECURE PAYMENT",
    secureGateway: "Secure Gateway",
    back: "Back",
    riskDisclosure: "Risk Disclosure: Algorithmic trading involves significant risk of loss. Past performance is not indicative of future results.",
    secureTransaction: "Secure Transaction",
    paypalNote: "Your payment details are securely processed by PayPal. Braxel Markets does not store your card details.",
    encryptionNote: "Encrypted with Institutional AES-256 Standards",
    verifying: "Verifying Institutional Transaction...",
    loading: "Loading Terminal...",
    globalInfra: "Global Payment Infrastructure",
    qrCode: "QR Code",
    allCards: "All Cards",
    selectPaymentMethod: "Select Payment Method",
    choosePayment: "Choose how you want to pay",
    creditCard: "Credit Card",
    instantPayment: "Instant Payment",
    card: "Credit / Debit Card",
    cardDesc: "Visa, Mastercard and other cards",
    crypto: "Cryptocurrency",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Fast and secure crypto transfer",
    wiseTransfer: "Bank Transfer",
    wiseInternational: "International Wire",
    wiseDesc: "Transfer directly to our bank account via Wise",
    anyCountry: "Any Country",
    lowFees: "Low Fees",
    transferInstructions: "Transfer Instructions",
    wiseStep1: "Copy the bank details below",
    wiseStep2: "Make a transfer from your bank or Wise account",
    wiseStep3: "Click confirm after making the transfer",
    bankDetails: "Bank Details",
    accountHolder: "Account Holder",
    bankName: "Bank Name",
    routingNumber: "Routing Number",
    accountNumber: "Account Number",
    bankAddress: "Bank Address",
    amountToSend: "Amount to Send",
    sendExactAmount: "Send EXACTLY this amount to avoid delays",
    paymentReference: "Include your email as payment reference",
    wiseNote: "After making the transfer, click confirm below. Your account will be activated after verification (1-3 business days).",
    wiseConfirmText: "I have made the bank transfer and confirm that the amount sent matches the plan price.",
    wiseConfirmRequired: "Please confirm you made the transfer",
    wisePaymentSuccess: "Payment confirmed! Your account is being set up.",
    confirmWise: "CONFIRM TRANSFER",
    openWise: "Open Wise Website",
    securePayment: "Secure Payment",
    cardNumber: "Card Number",
    cardName: "Name on Card",
    cardExpiry: "Expiry",
    payNow: "PAY NOW",
    amountToPay: "Amount to Pay",
    selectNetwork: "Select Network",
    yourAddress: "Deposit Address",
    yourAddressPlaceholder: "Enter your USDT address",
    important: "IMPORTANT",
    cryptoNote: "Send the exact amount to receive the plan",
    confirmCrypto: "CONFIRM WITH CRYPTO",
    copied: "Copied!",
    cryptoPending: "Payment recorded! Awaiting confirmation.",
    processing: "Processing...",
    paymentSuccess: "Payment approved!",
    selectCountry: "Select Country",
    searchCountry: "Search country...",
    phone: "Phone Number",
    fillAllFields: "Fill all fields",
    noKyc: "KYC Required",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "JOAO SILVA",
    cardExpiryPlaceholder: "MM/YY",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Payment failed",
    paymentError: "Payment error",
    subscriptionTitle: "SUBSCRIPTION",
    subscriptionSubtitle: "SERVICE PLAN",
    serviceAccess: "Service Access",
    confirmCard: "CONFIRM CARD",
    redirecting: "Redirecting to payment...",
    testModeBanner: "TEST MODE — No real money. No real bank. No real wallet. No real activation.",
    startFailed: "Could not start the payment. Please try again.",
    notConfigured: "Payments are not fully configured yet. Please try another method or contact support.",
    invalidPlanTitle: "INVALID PLAN",
    invalidPlanDesc: "The selected plan is no longer available. Please choose a plan again.",
    swiftLabel: "SWIFT",
    referenceLabel: "Reference",
  },
  application: {
    title: "APPLICATION",
    subtitle: "SUBMISSION",
    plan_selected: "Selected Plan",
    billed_monthly: "Billed monthly",
    plan_description: "You are about to purchase the {{plan}} service subscription.",
    plan_price_detail: "Monthly fee: {{price}} (paid monthly)",
    full_name: "Full Name",
    full_name_placeholder: "Enter your full name",
    email: "Email Address",
    email_placeholder: "Enter your email",
    address_line1: "Address Line 1",
    address_line1_placeholder: "Street address",
    address_line2: "Address Line 2",
    address_line2_placeholder: "Apartment, suite, unit, etc. (optional)",
    city: "City",
    city_placeholder: "City",
    region: "State / Region",
    region_placeholder: "State or region",
    postal_code: "Postal Code",
    postal_code_placeholder: "Postal code",
    country: "Country",
    country_placeholder: "Country",
    phone: "Phone Number",
    phone_placeholder: "Phone number",
    terms_accepted: "I accept the Terms of Service",
    privacy_accepted: "I accept the Privacy Policy",
    viewTerms: "View Terms",
    viewPrivacy: "View Privacy Policy",
    customer_note: "Customer Note (optional)",
    customer_note_placeholder: "Any additional information you would like us to know",
    note_limit: "Maximum {{count}} characters",
    characters: "characters",
    submitting: "Submitting...",
    submit: "SUBMIT APPLICATION",
    errors: {
      full_name_required: "Full name is required",
      email_required: "Email is required",
      email_invalid: "Invalid email address",
      address_line1_required: "Address is required",
      city_required: "City is required",
      country_required: "Country is required",
      terms_required: "You must accept the Terms of Service",
      privacy_required: "You must accept the Privacy Policy",
      note_too_long: "Note must be at most 500 characters",
      submit_failed: "Submission failed. Please try again."
    }
  },
  checkoutSuccess: {
    verifying: "Verifying payment…",
    backToPricing: "Back to pricing",
    couldNotVerify: "We could not verify your payment yet",
    couldNotVerifyDesc: "If you completed checkout, do not worry — your payment is being processed and your account will be activated shortly. Please refresh this page in a moment.",
    verifiedBadge: "Verified",
    paymentCompleted: "Payment completed",
    activationNotice: "Your account will be activated within a few minutes.",
    paymentId: "Payment ID",
    applicationId: "Application ID",
    securityNotice: "For your security, accounts are activated manually by an operator after payment verification. You will receive access as soon as the review is complete.",
    goToDashboard: "Go to dashboard",
    contactSupport: "Contact support",
    verifyingBadge: "Verifying",
    paymentReceived: "Payment received. We are verifying the payment.",
    beingVerified: "Your payment is being verified. This page will update automatically once your payment is confirmed. Do not close this window.",
    currentStatus: "Current status",
    urlSecurityNotice: "For your security, this page does not mark a payment as completed based on the URL alone. We wait for server-side confirmation."
  },
  privacyPage: {
    title: "Privacy Policy",
    privacy: "Privacy",
    dataCollectionTitle: "Data Collection",
    dataCollectionText: "We collect only the information necessary for the provision of our services, including name, email, and transaction data. Your data is protected by AES-256 encryption.",
    useOfInfoTitle: "Use of Information",
    useOfInfoText: "The information collected is used exclusively to manage your account, process payments, and send weekly performance reports.",
    securityTitle: "Security",
    securityText: "We implement rigorous security measures to protect against unauthorized access, alteration, or destruction of your personal data.",
    legalBasisTitle: "Legal Basis for Processing",
    legalBasisText: "Our legal basis for processing your personal data is [PLACEHOLDER: legal basis, e.g., consent, legitimate interest, contractual necessity].",
    retentionTitle: "Data Retention Period",
    retentionText: "We retain your personal data for [PLACEHOLDER: retention period] unless a longer period is required by law.",
    thirdPartiesTitle: "Third Parties and Processors",
    thirdPartiesText: "We may share your data with trusted third-party service providers such as [PLACEHOLDER: list of processors, e.g., payment processors, cloud hosting, email services] solely for the purposes outlined in this policy.",
    userRightsTitle: "Your Rights",
    userRightsText: "Under applicable data protection laws such as the LGPD (Brazil) and GDPR (EU), you have the right to access, rectify, delete, and port your personal data, as well as to object to or restrict processing. To exercise these rights, please contact us at [PLACEHOLDER: contact for rights requests].",
    cookiesTitle: "Cookies and Similar Technologies",
    cookiesText: "Our website uses cookies and similar technologies to enhance user experience, analyze traffic, and personalize content. You can manage your cookie preferences through your browser settings.",
    contactTitle: "Contact and Data Protection Officer",
    contactText: "For questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at [PLACEHOLDER: DPO email or contact]."
  },
  disclaimerPage: {
    title: "Financial Disclaimer",
    risk: "Risk",
    importantRiskTitle: "Important Risk Warning",
    importantRiskText: "Investment in financial markets involves substantial risks and can result in the total loss of invested capital. Past performance is no guarantee of future results.",
    noAdviceTitle: "No Advice",
    noAdviceText: "The content of this site and the services provided by Braxel Markets do not constitute financial, legal, or tax advice. We recommend that each investor seek independent professional guidance before making investment decisions.",
    limitationTitle: "Limitation of Liability",
    limitationText: "Braxel Markets is not responsible for financial losses resulting from the use of our automation technology or market fluctuations.",
    capitalAtRiskTitle: "Capital at Risk",
    capitalAtRiskText: "Your capital is at risk when using our services. You may lose some or all of your investment.",
    noGuaranteedReturnsTitle: "No Guaranteed Returns",
    noGuaranteedReturnsText: "We do not guarantee any returns or profits. Past performance is not indicative of future results.",
    pastPerformanceTitle: "Past Performance Not Indicative",
    pastPerformanceText: "Any historical performance shown is for illustrative purposes only and does not guarantee future results.",
    notLicensedTitle: "Regulatory Status",
    notLicensedText: "Braxel Markets is not currently represented as a licensed or regulated financial institution in [PLACEHOLDER: jurisdiction]. Please verify the regulatory status applicable to your location.",
    noCapitalProtectionTitle: "No Capital Protection Guarantee",
    noCapitalProtectionText: "We do not offer any capital protection or guarantee against losses.",
    algorithmicRisksTitle: "Algorithmic/Automated Trading Risks",
    algorithmicRisksText: "Automated and algorithmic trading strategies involve risks including, but not limited to, system failures, connectivity issues, model errors, and unexpected market conditions.",
    jurisdictionRestrictionsTitle: "Jurisdiction Restrictions",
    jurisdictionRestrictionsText: "Our services may not be available in all jurisdictions. Users are responsible for ensuring compliance with local laws and regulations before using our platform."
  },
  termsPage: {
    title: "Terms of Service",
    entityTitle: "Contracting Entity",
    entityText: "[Legal Entity Name, Registration Number, Jurisdiction]",
    descriptionTitle: "Service Description",
    descriptionText: "Braxel Markets provides institutional-grade algorithmic trading infrastructure and related services through its platform.",
    feesTitle: "Fees and Payments",
    feesText: "Fees for our services are as outlined on the Pricing page and are subject to change with prior notice. Payment methods include bank transfer, credit card, and cryptocurrency.",
    eligibilityTitle: "Eligibility",
    eligibilityText: "Our services are available to individuals and entities that are at least 18 years of age and comply with our Know Your Customer (KYC) and anti-money laundering (AML) requirements.",
    accountTerminationTitle: "Account Termination",
    accountTerminationText: "Either party may terminate the account upon [PLACEHOLDER: notice period, e.g., 30 days] written notice. Braxel Markets may terminate immediately for breach of terms, illegal activity, or regulatory requirements.",
    limitationOfLiabilityTitle: "Limitation of Liability",
    limitationOfLiabilityText: "To the maximum extent permitted by law, Braxel Markets shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of our services.",
    disputeResolutionTitle: "Dispute Resolution and Governing Law",
    disputeResolutionText: "These Terms shall be governed by and construed in accordance with the laws of [PLACEHOLDER: jurisdiction]. Any dispute arising out of or in connection with these Terms shall be submitted to the exclusive jurisdiction of the courts of [PLACEHOLDER: jurisdiction].",
    changesToTermsTitle: "Changes to These Terms",
    changesToTermsText: "We reserve the right to modify or replace these Terms at any time. If a revision is material we will provide at least [PLACEHOLDER: notice period, e.g., 30 days] notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
    effectiveDateTitle: "Effective Date",
    effectiveDateText: "Effective Date: [PLACEHOLDER: date]",
    contactTitle: "Contact",
    contactText: "For questions about these Terms, please contact us at [PLACEHOLDER: contact email or address]."
  },
  legalDraftBanner: "This page is a draft under legal review and is not yet final.",
  notFound: {
    title: "404",
    message: "Sorry, the page you are looking for does not exist.",
    returnHome: "Return to Home"
  },
  authCallback: {
    confirmingTitle: "Confirming your account...",
    confirmingDesc: "Please wait while we verify your email.",
    confirmedTitle: "Email Confirmed!",
    confirmedDesc: "Your account has been successfully verified.",
    redirecting: "Redirecting to login...",
    failedTitle: "Confirmation Failed",
    goToLogin: "Go to Login",
    invalidLink: "Invalid or expired confirmation link",
    failedConfirm: "Failed to confirm email"
  },
  paymentsDisabled: {
    title: "Payments are currently disabled.",
    desc: "The payment system is not yet active. To enable payments, contact the operator at",
    managedBy: "Payment processing is managed exclusively by the platform operator. If you have questions about a pending allocation, please contact support.",
    viewPlans: "View Investment Plans"
  },
  checkoutStatus: {
    created: "Created",
    pending: "Awaiting Payment",
    processing: "Verifying On-Chain",
    confirmed: "Confirmed",
    failed: "Failed",
    rejected: "Rejected",
    refunded: "Refunded",
    disputed: "Disputed",
    canceled: "Canceled",
    pending_manual: "Awaiting Manual Review"
  },
  legalReview: {
    title: "Draft under legal review"
  },
  operator: {
    title: "Operator",
    subtitle: "Dashboard",
    description: "Review and activate pending customer applications.",
    no_pending_applications: "No pending applications.",
    plan: "Plan",
    amount: "Amount",
    country: "Country",
    customer_note: "Customer note",
    activate_account: "Activate account",
    activating: "Activating...",
    reject_or_request_info: "Reject / request info",
    rejecting: "Rejecting...",
    reject_application: "Reject application",
    reject_reason_prompt: "Provide a reason for rejection or the information needed.",
    reject_reason_placeholder: "Reason...",
    cancel: "Cancel",
    reject: "Reject",
    errors: {
      activation_failed: "Failed to activate the application.",
      rejection_failed: "Failed to reject the application."
    },
    status: {
      activation_pending: "Activation pending",
      account_active: "Account active",
      rejected: "Rejected",
      manual_review: "Manual review"
    }
  },
  profitCalculator: {
    badge: "PROJECTION",
    titleA: "PROFIT",
    titleB: "CALCULATOR",
    initialAllocation: "Initial Allocation",
    monthlyProfit: "Est. Monthly Profit",
    annualProfit: "Est. Annual Profit",
    riskTitle: "Risk Management",
    riskDesc: "Projections based on historical algorithmic performance with strict drawdown limits.",
    instantTitle: "Instant Deployment",
    instantDesc: "Your capital starts working within minutes of infrastructure integration.",
    disclaimer: "* Disclaimer: Past performance does not guarantee future results. Projections are for illustrative purposes only."
  },
  meta: {
    home: {
      title: "Braxel Markets | Institutional Algorithmic Capital Management",
      description: "Institutional-grade algorithmic trading infrastructure, prop firm capital access, CopyTrade authorization and full MetaTrader automation for XAU/USD and US500."
    },
    pricing: {
      title: "Plans & Managed Capital | Braxel Markets",
      description: "Compare algorithmic trading plans and Capital Gerenciado (Managed Capital) allocations. Managed capital is always quoted in USD."
    },
    about: {
      title: "About Braxel Markets | Algorithmic Trading",
      description: "Braxel Markets builds institutional-grade algorithmic trading infrastructure and manages capital with strict risk controls."
    },
    howItWorks: {
      title: "How It Works | Braxel Markets",
      description: "See how Braxel Markets connects your capital to fully automated MetaTrader strategies for XAU/USD and US500."
    },
    contact: {
      title: "Contact | Braxel Markets",
      description: "Contact the Braxel Markets team about algorithmic trading infrastructure and managed capital."
    },
    terms: {
      title: "Terms of Service | Braxel Markets",
      description: "Read the Terms of Service for using Braxel Markets."
    },
    privacy: {
      title: "Privacy Policy | Braxel Markets",
      description: "Learn how Braxel Markets collects, uses and protects your personal data."
    },
    disclaimer: {
      title: "Risk Disclosure | Braxel Markets",
      description: "Important risk disclosure for algorithmic trading and managed capital with Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brazil",
      US: "United States",
      GB: "United Kingdom",
      DE: "Germany",
      FR: "France",
      ES: "Spain",
      IT: "Italy",
      PT: "Portugal",
      RU: "Russia",
      CN: "China",
      JP: "Japan",
      IN: "India",
      OTHER: "Other Countries"
    },
    method: {
      BR: {
        id_card: "National ID Card (RG/CPF)",
        drivers_license: "Driver's License"
      },
      US: {
        id_card: "State ID Card"
      },
      GB: {
        id_card: "National ID / Driver License",
        biometric: "Biometric Residence Permit"
      },
      DE: {
        drivers: "Driver's License",
        passport: "Passport / Reisepass"
      },
      FR: {
        residence: "Residence Permit"
      },
      RU: {
        foreign_passport: "Foreign Passport"
      },
      OTHER: {
        passport: "International Passport",
        national_id: "National ID Card"
      }
    },
    doc: {
      rg: {
        desc: "Brazilian national identity document"
      },
      cpf: {
        desc: "Brazilian taxpayer registry card"
      },
      passport: {
        desc: "Valid passport with photo page",
        name: "Passport"
      },
      cnh: {
        desc: "Brazilian driver's license",
        name: "CNH (Driver's License)"
      },
      state_id: {
        desc: "Driver's license or state-issued ID",
        name: "State ID Card"
      },
      passport_uk: {
        desc: "Valid UK passport"
      },
      driving_license_uk: {
        desc: "UK driver's license",
        name: "Driving License"
      },
      brp: {
        desc: "UK Biometric Residence Permit",
        name: "Biometric Residence Permit"
      },
      personalausweis: {
        desc: "German identity card"
      },
      passport_de: {
        desc: "Valid German passport"
      },
      fuehrerschein: {
        desc: "German driver's license"
      },
      cni: {
        desc: "French national identity card"
      },
      passport_fr: {
        desc: "Valid French passport"
      },
      titre_sejour: {
        desc: "French residence permit"
      },
      dni: {
        desc: "Spanish national identity document"
      },
      nie: {
        desc: "Foreigner identification number"
      },
      passport_es: {
        desc: "Valid passport"
      },
      carta_id: {
        desc: "Italian identity card"
      },
      passport_it: {
        desc: "Valid Italian passport"
      },
      cc: {
        desc: "Portuguese citizen card"
      },
      passport_pt: {
        desc: "Valid Portuguese passport"
      },
      passport_ru: {
        desc: "Russian internal passport"
      },
      foreign_passport_ru: {
        desc: "Russian foreign passport",
        name: "Foreign Passport"
      },
      id_card_cn: {
        desc: "Chinese identity card"
      },
      passport_cn: {
        desc: "Valid passport"
      },
      passport_jp: {
        desc: "Valid Japanese passport"
      },
      zairyu: {
        desc: "Residence card"
      },
      aadhaar: {
        desc: "Unique Identification card",
        name: "Aadhaar Card"
      },
      voter_id: {
        desc: "Electoral photo identity card",
        name: "Voter ID"
      },
      passport_in: {
        desc: "Valid Indian passport"
      },
      passport_intl: {
        desc: "Valid passport from your country"
      },
      national_id_intl: {
        desc: "Government-issued national ID",
        name: "National ID Card"
      }
    },
    methodName: {
      id_card: "National ID Card",
      passport: "Passport",
      drivers_license: "Driver's License",
      drivers: "Driver's License",
      biometric: "Biometric Residence Permit",
      residence: "Residence Permit",
      foreign_passport: "Foreign Passport",
      national_id: "National ID Card"
    }
  },
  errorBoundary: {
    title: "Something went wrong",
    message: "This page could not be loaded. Please try again.",
    retry: "Reload page",
    home: "Back to home"
  }
};

const ptTranslation = {
  disclaimerPage: {
    title: "Aviso Financeiro",
    risk: "Risco",
    importantRiskTitle: "Aviso Importante de Risco",
    importantRiskText: "O investimento em mercados financeiros envolve riscos substanciais e pode resultar na perda total do capital investido. O desempenho passado não é garantia de resultados futuros.",
    noAdviceTitle: "Não Constitui Aconselhamento",
    noAdviceText: "O conteúdo deste site e os serviços prestados pela Braxel Markets não constituem aconselhamento financeiro, jurídico ou tributário. Recomendamos que cada investidor busque orientação profissional independente antes de tomar decisões de investimento.",
    limitationTitle: "Limitação de Responsabilidade",
    limitationText: "A Braxel Markets não é responsável por perdas financeiras decorrentes do uso da nossa tecnologia de automação ou de flutuações de mercado.",
    capitalAtRiskTitle: "Capital em Risco",
    capitalAtRiskText: "Seu capital está em risco ao usar nossos serviços. Você pode perder parte ou a totalidade do seu investimento.",
    noGuaranteedReturnsTitle: "Sem Retornos Garantidos",
    noGuaranteedReturnsText: "Não garantimos quaisquer retornos ou lucros. O desempenho passado não é indicativo de resultados futuros.",
    pastPerformanceTitle: "Desempenho Passado Não é Indicativo",
    pastPerformanceText: "Qualquer desempenho histórico exibido é apenas para fins ilustrativos e não garante resultados futuros.",
    notLicensedTitle: "Status Regulatório",
    notLicensedText: "A Braxel Markets não é atualmente representada como instituição financeira licenciada ou regulada em [PLACEHOLDER: jurisdição]. Verifique o status regulatório aplicável à sua localização.",
    noCapitalProtectionTitle: "Sem Garantia de Proteção de Capital",
    noCapitalProtectionText: "Não oferecemos qualquer proteção de capital ou garantia contra perdas.",
    algorithmicRisksTitle: "Riscos de Negociação Algorítmica/Automatizada",
    algorithmicRisksText: "Estratégias de negociação automatizadas e algorítmicas envolvem riscos que incluem, entre outros, falhas de sistema, problemas de conectividade, erros de modelo e condições de mercado inesperadas.",
    jurisdictionRestrictionsTitle: "Restrições de Jurisdição",
    jurisdictionRestrictionsText: "Nossos serviços podem não estar disponíveis em todas as jurisdições. Os usuários são responsáveis por garantir a conformidade com as leis e regulamentos locais antes de usar nossa plataforma."
  },
  privacyPage: {
    title: "Política de Privacidade",
    privacy: "Privacidade",
    dataCollectionTitle: "Coleta de Dados",
    dataCollectionText: "Coletamos apenas as informações necessárias para a prestação dos nossos serviços, incluindo nome, e-mail e dados de transações. Seus dados são protegidos por criptografia AES-256.",
    useOfInfoTitle: "Uso das Informações",
    useOfInfoText: "As informações coletadas são usadas exclusivamente para gerenciar sua conta, processar pagamentos e enviar relatórios semanais de desempenho.",
    securityTitle: "Segurança",
    securityText: "Implementamos medidas de segurança rigorosas para proteger contra acesso não autorizado, alteração ou destruição dos seus dados pessoais.",
    legalBasisTitle: "Base Legal para o Tratamento",
    legalBasisText: "Nossa base legal para o tratamento dos seus dados pessoais é [PLACEHOLDER: base legal, ex.: consentimento, interesse legítimo, necessidade contratual].",
    retentionTitle: "Período de Retenção de Dados",
    retentionText: "Retemos seus dados pessoais por [PLACEHOLDER: período de retenção], a menos que um período mais longo seja exigido por lei.",
    thirdPartiesTitle: "Terceiros e Operadores",
    thirdPartiesText: "Podemos compartilhar seus dados com prestadores de serviços terceirizados de confiança, como [PLACEHOLDER: lista de operadores, ex.: processadores de pagamento, hospedagem em nuvem, serviços de e-mail], exclusivamente para os fins descritos nesta política.",
    userRightsTitle: "Seus Direitos",
    userRightsText: "Nos termos das leis de proteção de dados aplicáveis, como a LGPD (Brasil) e o GDPR (UE), você tem o direito de acessar, retificar, excluir e portar seus dados pessoais, bem como de se opor ou restringir o tratamento. Para exercer esses direitos, entre em contato conosco pelo [PLACEHOLDER: contato para solicitações de direitos].",
    cookiesTitle: "Cookies e Tecnologias Semelhantes",
    cookiesText: "Nosso site usa cookies e tecnologias semelhantes para melhorar a experiência do usuário, analisar o tráfego e personalizar o conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.",
    contactTitle: "Contato e Encarregado de Proteção de Dados",
    contactText: "Para dúvidas sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato com nosso Encarregado de Proteção de Dados pelo [PLACEHOLDER: e-mail ou contato do DPO]."
  },
  contactEmail: {
    newSubmission: "Novo Envio de Formulário de Contato",
    name: "Nome",
    email: "E-mail",
    subject: "Assunto",
    message: "Mensagem",
    sentFrom: "Enviado de"
  },
  nav: {
    pricing: "PLANOS DE INVESTIMENTO",
    howItWorks: "INFRAESTRUTURA",
    about: "SOBRE NÓS",
    contact: "SUPORTE INSTITUCIONAL",
    login: "ACESSO AO TERMINAL",
    support: "Suporte",
    openAccount: "CRIAR CONTA",
    dashboard: "PAINEL",
    logout: "SAIR",
    selectLanguage: "Selecionar Idioma",
    sessionActive: "Sessão Ativa",
    accessDashboard: "Acessar Painel"
  },
  footer: {
    desc: "Infraestrutura de investimento de nível institucional. Tecnologia proprietária para o mercado moderno.",
    platform: "Plataforma",
    company: "Empresa",
    support: "Suporte Digital",
    rights: "Todos os direitos reservados.",
    privacy: "Privacidade",
    terms: "Termos",
    disclaimer: "Aviso Financeiro",
    address: "Endereço Comercial",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, España",
    riskTitle: "AVISO DE RISCO",
    riskText: "A negociação nos mercados financeiros envolve risco substancial de perda e não é adequada para todos os investidores. Desempenhos passados não são indicativos de resultados futuros. O valor dos investimentos pode diminuir ou aumentar. Não invista dinheiro que você não pode se dar ao luxo de perder. Braxel Markets não garante retornos específicos.",
    emailAria: "E-mail",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Suporte Braxel",
    placeholder: "Digite uma mensagem...",
    emailSupport: "E-mail:",
    assistantReply: "Obrigado pela sua mensagem. Nossa equipe responderá em breve.",
    send: "Enviar",
    brandAI: "IA da Braxel Markets",
    openChat: "Abrir chat de suporte",
    close: "Fechar",
    minimize: "Minimizar",
    maximize: "Maximizar",
    supportDialog: "Chat de suporte"
  },
  auth: {
    loginTitle: "Entrar",
    loginSubtitle: "Insira suas credenciais de acesso.",
    registerTitle: "Criar Conta",
    registerSubtitle: "Comece sua jornada no mercado institucional.",
    email: "Endereço de E-mail",
    password: "Senha",
    fullName: "Nome Completo",
    forgotPassword: "Esqueceu a senha?",
    noAccount: "Não tem uma conta?",
    hasAccount: "Já tem acesso?",
    btnAccess: "ACESSAR CONTA",
    btnCreate: "CRIAR MINHA CONTA",
    termsAgree: "Aceito os Termos e a Privacidade.",
    futureTitle: "O Futuro dos",
    futureSubtitle: "Investimentos",
    features: [
      "Algoritmos de nível institucional",
      "Proteção avançada de capital",
      "Execução em milissegundos",
      "Transparência total"
    ],
    accessBadge: "Acesso Institucional",
    emailPlaceholder: "Digite seu e-mail",
    fullNamePlaceholder: "Digite seu nome completo",
    loginLink: "Entrar",
    loginSideDescription: "Acesse seu terminal institucional.",
    loginSideFooter: "Segurança de nível institucional",
    loginErrorMessage: "Credenciais inválidas. Por favor, tente novamente.",
    registerErrorMessage: "Falha no registro. Por favor, tente novamente.",
    registerSuccessMessage: "Conta criada com sucesso!",
    registerSideFooter: "Protegido por segurança institucional",
    welcomeBackTitle: "Bem-vindo de Volta",
    welcomeBackHighlight: "Terminal Institucional",
    accountNotFound: "Conta não encontrada. Por favor, crie uma conta primeiro.",
    rememberMe: "Lembrar-me",
    registerLink: "Criar conta",
    passwordPlaceholder: "Senha",
    accountNotFoundError: "Conta não encontrada. Crie uma conta primeiro.",
    resetPasswordSent: "Se existir uma conta para esse e-mail, um link de redefinição de senha foi enviado.",
    resetPasswordError: "Não foi possível enviar o link de redefinição. Tente novamente.",
    enterEmailFirst: "Digite seu endereço de e-mail primeiro."
  },
  hero: {
    title1: "GESTÃO ALGORÍTMICA",
    title2: "DE CAPITAL DE ELITE",
    desc: "Implemente estratégias quantitativas de nível institucional projetadas para o mercado moderno. Experimente precisão de execução em milissegundos e protocolos avançados de mitigação de riscos.",
    getStarted: "EXPLORAR PLANOS DE INVESTIMENTO",
    viewStrategies: "METODOLOGIA TÉCNICA"
  },
  stats: {
    volume: "Gestão Estratégica de Capital",
    traders: "Contas Ativas",
    uptime: "Tempo de Atividade da Infraestrutura",
    latency: "Precisão de Execução"
  },
  methodology: {
    badge: "METODOLOGIA",
    title: "MODELOS QUANTITATIVOS",
    statArb: {
      title: "ARBITRAGEM ESTATÍSTICA",
      desc: "Exploração de ineficiências temporárias de preço entre ativos correlacionados usando modelos de cointegração e negociação em pares.",
      f1: "Análise de Cointegração",
      f2: "Algoritmos de Seleção de Pares",
      f3: "Limiar Z-Score"
    },
    meanRev: {
      title: "REVERSÃO À MÉDIA",
      desc: "Identificação de desvios de preço de ativos em relação às médias históricas, com regras sistemáticas de entrada e saída.",
      f1: "Sinais de Bandas de Bollinger",
      f2: "Detecção de Divergência RSI",
      f3: "Modelos Ornstein-Uhlenbeck"
    },
    hft: {
      title: "NEGOCIAÇÃO DE ALTA FREQUÊNCIA",
      desc: "Estratégias de execução de latência ultra-baixa com infraestrutura co-localizada para ordens em nível de microssegundos.",
      f1: "Microestrutura de Mercado",
      f2: "Análise de Fluxo de Ordens",
      f3: "Arbitragem de Latência"
    }
  },
  process_home: {
    badge: "PROCESSO",
    title: "FLUXO",
    subtitle: "INSTITUCIONAL",
    step1: {
      title: "REGISTRO",
      desc: "Integração segura e verificação de identidade."
    },
    step2: {
      title: "ALOCAÇÃO",
      desc: "Seleção do nível de capital gerenciado."
    },
    step3: {
      title: "INTEGRAÇÃO",
      desc: "Implantação da infraestrutura algorítmica."
    },
    step4: {
      title: "MONITORAMENTO",
      desc: "Acompanhamento de desempenho em tempo real via terminal."
    },
    step5: {
      title: "LIQUIDEZ",
      desc: "Protocolos simplificados de saque de lucros."
    }
  },
  cta_home: {
    badge: "OPORTUNIDADE",
    title: "ESCALE SEU",
    subtitle: "CAPITAL",
    desc: "Junte-se ao grupo de elite de investidores que utilizam a infraestrutura proprietária da Braxel.",
    btn: "INICIAR ALOCAÇÃO",
    trust: "Segurança de Nível Institucional"
  },
  pricing: {
    badge: "TRANSPARÊNCIA",
    title: "ALOCAÇÃO",
    subtitle: "DE CAPITAL",
    desc: "Infraestrutura de nível institucional com uma estrutura de taxas transparente.",
    select: "GARANTIR ESTE PLANO",
    allocation: "CAPITAL GERENCIADO",
    month: "taxa mensal",
    detectedCurrency: "Todos os preços são cobrados em USD ({{currency}}), independentemente da sua localização",
    managedCapitalUsdNote: "O Capital Gerenciado é sempre cotado em USD."
  },
  plans: {
    starter: "Inicial",
    starterFeatures: "Recursos do plano Inicial",
    managedCapital: "Capital Gerenciado",
    features: {
      automation: "Automação",
      accountManagement: "Gestão de Conta",
      emailSupport: "Suporte por Email",
      controlledRisk: "Risco Controlado",
      starterFeatures: "Recursos do plano Inicial",
      prioritySupport: "Suporte Prioritário",
      detailedLogs: "Logs Detalhados",
      proFeatures: "Recursos Pro",
      multiAccount: "Multiconta",
      weeklyReports: "Relatórios Semanais",
      advancedFeatures: "Recursos Avançados",
      support247: "Suporte 24/7",
      dedicatedManager: "Gerente Dedicado"
    },
    professional: "Profissional",
    professionalFeatures: "Recursos do plano Profissional",
    business: "Empresarial",
    businessFeatures: "Recursos do plano Empresarial",
    enterprise: "Corporativo",
    enterpriseFeatures: "Recursos do plano Corporativo"
  },
  howItWorks: {
    badge: "INFRAESTRUTURA",
    title: "ARQUITETURA",
    subtitle: "TÉCNICA",
    desc: "Nosso ecossistema proprietário é construído para velocidade, segurança e desempenho consistente.",
    steps: [
      {
        title: "REGISTRO",
        desc: "Crie seu perfil institucional."
      },
      {
        title: "PAINEL",
        desc: "Acesse seu terminal privado de gestão."
      },
      {
        title: "SELEÇÃO DE PLANO",
        desc: "Escolha seu nível de alocação de capital."
      },
      {
        title: "IMPLANTAÇÃO DE API",
        desc: "Conexão automatizada aos mercados globais."
      },
      {
        title: "EXECUÇÃO",
        desc: "Processamento de ordens em milissegundos."
      },
      {
        title: "RELATÓRIOS",
        desc: "Análise detalhada de desempenho semanal."
      }
    ],
    cta: "PRONTO PARA COMEÇAR?",
    ctaBtn: "ENTRAR NA REDE"
  },
  about: {
    badge: "SOBRE NÓS",
    title: "EXCELÊNCIA",
    subtitle: "INSTITUCIONAL",
    desc: "Braxel Markets representa o auge da gestão algorítmica de capital.",
    historyTitle: "NOSSA HISTÓRIA",
    historyDesc1: "Fundada por uma equipe de analistas quantitativos e engenheiros de software, a Braxel foi criada para preencher a lacuna entre capital de varejo e tecnologia institucional.",
    historyDesc2: "Hoje, nos concentramos em retornos ajustados ao risco e estabilidade da infraestrutura, fornecendo estratégias algorítmicas de ponta para o investidor moderno.",
    stats: {
      founded: "Fundada",
      users: "Usuários Ativos",
      uptime: "Disponibilidade",
      support: "Suporte"
    },
    values: {
      mission: "MISSÃO",
      missionDesc: "Fornecer infraestrutura algorítmica de elite para capital global.",
      vision: "VISÃO",
      visionDesc: "Definir o futuro da gestão quantitativa automatizada.",
      values: "VALORES",
      valuesDesc: "Transparência, precisão e segurança inabalável."
    },
    teamTitle: "EQUIPE DE LIDERANÇA",
    teamDesc: "Conheça os fundadores e gestores por trás da Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Fundador & CEO",
        bio: "Estrategista quantitativo e empreendedor liderando a visão da Braxel Markets para infraestrutura algorítmica institucional.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "LIDERANÇA"
  },
  contact: {
    badge: "SUPORTE",
    title: "CANAIS",
    subtitle: "INSTITUCIONAIS",
    desc: "Nossa equipe de suporte dedicada está disponível 24/7 para consultas institucionais.",
    infoTitle: "INFORMAÇÕES DE CONTATO",
    formTitle: "CONSULTA DIRETA",
    placeholders: {
      name: "NOME COMPLETO",
      email: "ENDEREÇO DE E-MAIL",
      subject: "ASSUNTO",
      message: "MENSAGEM"
    },
    sendBtn: "ENVIAR CONSULTA",
    supportHours: "Horário de Suporte",
    institutionalSupport: "Suporte Institucional 24/7",
    securityChallenge: "Desafio de Segurança",
    securityAnswer: "Resposta",
    incorrectAnswer: "Resposta de segurança incorreta. Por favor, tente novamente.",
    waitMessage: "Por favor, aguarde um momento antes de enviar outra mensagem.",
    messageSent: "Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.",
    messageFailed: "Falha ao enviar mensagem. Por favor, tente novamente ou envie um e-mail diretamente para marketsbraxel@ouvidor.net",
    cooldown: "AGUARDE",
    consentPre: "Ao enviar este formulário, você concorda com nossa",
    consentPost: "Usamos seus dados apenas para responder à sua solicitação.",
    emailLabel: "E-mail"
  },
  dashboard: {
    portfolio: "Portfólio",
    activeServices: "Serviços Ativos",
    newAllocation: "Nova Alocação",
    noServices: "Nenhum plano de investimento ativo encontrado.",
    balance: "Saldo Atual",
    withdraw: "Saque",
    liquidity: "Liquidez",
    requestWithdraw: "Solicitar Saque",
    selectAccount: "Selecionar Conta",
    amount: "Valor (USD)",
    iban: "IBAN / Dados Bancários",
    btnWithdraw: "Enviar Solicitação de Saque",
    profile: "Gerenciamento de Perfil",
    settings: "Configurações",
    firstName: "Nome",
    lastName: "Sobrenome",
    saveChanges: "SALVAR ALTERAÇÕES",
    verifiedAccount: "Conta Verificada",
    accountStandard: "Conta Padrão",
    withdrawal: {
      gateTitle: "Verificação de identidade necessária",
      gateWhy: "Para proteger os seus fundos e cumprir a regulamentação, a verificação de identidade (KYC) é obrigatória antes de solicitar um levantamento. Pode negociar livremente sem ela.",
      gateRejectedDesc: "A sua submissão anterior não foi aceite. Reveja o motivo abaixo e reenvie os documentos.",
      gateUnderReview: "Os seus documentos estão em análise. Avisaremos por email assim que houver uma decisão. Até lá não pode solicitar levantamentos.",
      kycStatusLabel: "Estado da verificação",
      statusPending: "Não submetido",
      statusSubmitted: "Em análise",
      statusApproved: "Aprovado",
      statusRejected: "Recusado",
      rejectedReason: "Motivo",
      continueToForm: "Continuar para o levantamento",
      submitDocs: "Submeter documentos",
      resubmit: "Reenviar documentos",
      uploadFront: "Documento de identidade (frente)",
      uploadBack: "Documento de identidade (verso)",
      uploadSelfie: "Selfie com o documento",
      chooseFile: "Escolher ficheiro",
      fileHint: "JPG, PNG ou PDF, até 10 MB",
      selfieHint: "Foto nítida do rosto com o documento",
      optional: "Opcional",
      frontRequired: "Anexe a frente do seu documento de identidade.",
      fileTooLarge: "O ficheiro tem mais de 10 MB.",
      uploadError: "Não foi possível submeter os documentos. Tente novamente.",
      documentsSubmitted: "Documentos submetidos. Iremos analisá-los em breve.",
    },
    totalAUM: "Total de Ativos Gerenciados",
    activeAlgos: "Algoritmos Ativos",
    systemStatus: "Status do Sistema",
    operational: "Operacional",
    infraProtection: "Proteção de Infraestrutura",
    twoFactor: "Autenticação de Dois Fatores",
    notEnabled: "Não Ativado",
    enable2FA: "Ativar 2FA",
    kycStatus: "Verificação KYC",
    verified: "Verificado",
    viewDocs: "Ver Documentos",
    investor: "Investidor",
    kycRequired: "Verificação KYC Necessária",
    kycRequiredDesc: "Complete a verificação de identidade para acessar todos os recursos da plataforma. Isto é obrigatório para todas as contas que gerenciam capital.",
    kycUnderReview: "KYC em Análise",
    kycUnderReviewDesc: "Seus documentos estão sendo analisados pela nossa equipe de conformidade. Isso geralmente leva de 24 a 48 horas.",
    kycRejected: "Verificação KYC Recusada",
    kycRejectedDesc: "Seus documentos não foram aceitos. Por favor, reenvie com documentação válida.",
    resubmitDocs: "Reenviar Documentos",
    completeVerification: "Completar Verificação",
    verificationRequired: "Verificação Necessária",
    goToVerification: "Ir para Verificação",
    totalProfit: "Lucro Total",
    drawdown: "Drawdown",
    maxDrawdown: "Drawdown Máximo",
    assetsInOperation: "Ativos em Operação",
    monthlyReturns: "Retornos Mensais",
    analytics: "Análises",
    newWithdrawalRequest: "Nova Solicitação de Saque",
    walletIban: "Carteira / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Transferência Bancária (SWIFT)"
    },
    transactionHistory: "Histórico de Transações",
    operations: "Operações",
    asset: "Ativo",
    type: "Tipo",
    entry: "Entrada",
    exit: "Saída",
    profit: "Lucro",
    time: "Hora",
    status: "Status",
    open: "Aberto",
    closed: "Fechado",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Endereço de carteira cripto ou IBAN",
    newEmailPlaceholder: "novo@email.com",
    verificationCodePlaceholder: "Digite o código de 6 dígitos",
    minPasswordPlaceholder: "Mínimo de 8 caracteres",
    confirmPasswordPlaceholder: "Digite novamente a nova senha",
    accountNotFound: "Conta não encontrada. Por favor, crie uma conta primeiro.",
    loginSuccess: "Login realizado com sucesso!",
    rememberMe: "Lembrar-me",
    identityVerified: "Sua identidade foi verificada! Todos os recursos estão liberados.",
    verificationRejected: "Sua verificação foi rejeitada. Envie seus documentos novamente.",
    profileUpdated: "Perfil atualizado com sucesso.",
    failedUpdateProfile: "Falha ao atualizar o perfil.",
    differentEmail: "Insira um endereço de e-mail diferente.",
    confirmationLinkSent: "Um link de confirmação foi enviado para o novo endereço de e-mail. Verifique para concluir a alteração.",
    failedEmail: "Falha ao atualizar o e-mail.",
    passwordsDoNotMatch: "As senhas não coincidem.",
    passwordTooShort: "A senha deve ter pelo menos 8 caracteres.",
    passwordChanged: "Senha alterada com sucesso.",
    failedPassword: "Falha ao alterar a senha.",
    uploadDocument: "Envie um documento.",
    completeSteps: "Conclua todas as etapas de verificação.",
    documentsSubmitted: "Documentos enviados para verificação. Você será notificado após a análise.",
    failedDocuments: "Falha ao enviar os documentos.",
    newEmailLabel: "Novo Endereço de E-mail",
    sendConfirmationLink: "Enviar Link de Confirmação",
    navPerformance: "Desempenho",
    navAuditLog: "Registo de Auditoria",
    tabProfile: "Perfil",
    tabKycVerification: "Verificação KYC",
    tabSecurity: "Segurança",
    kycCompleteDesc: "Conclua a sua verificação KYC para aceder a todas as funcionalidades da plataforma. Este é um requisito de conformidade obrigatório para todas as contas.",
    kyc: {
      approved: "Verificação Aprovada",
      underReview: "Documentos em Análise",
      rejected: "Verificação Rejeitada",
      required: "Verificação Necessária",
      descApproved: "A sua identidade foi verificada. Todas as funcionalidades estão desbloqueadas.",
      descSubmitted: "A nossa equipa de conformidade está a analisar os seus documentos. Isto normalmente demora 24-48 horas.",
      descRejected: "Os seus documentos não foram aceites. Por favor reenvie com documentação válida.",
      descRequired: "Conclua a verificação de identidade para desbloquear todas as funcionalidades da plataforma.",
      stepCountry: "País",
      stepMethod: "Método",
      stepDocument: "Documento",
      stepReview: "Revisão",
      selectCountry: "Selecione o Seu País",
      selectCountryDesc: "Escolha o país que emitiu o seu documento de identidade.",
      selectCountryPlaceholder: "Selecione um país...",
      selectMethod: "Selecione o Método de Verificação",
      selectMethodDesc: "Escolha como pretende verificar a sua identidade para {{country}}.",
      uploadDocument: "Carregue o Seu Documento",
      uploadDocumentDesc: "Selecione e carregue um documento válido das opções abaixo.",
      clickToUpload: "Clique para carregar ou arraste e largue",
      submitting: "A enviar...",
      submitForVerification: "Enviar para Verificação",
      progressTitle: "Progresso da Verificação",
      stepEmailVerification: "Verificação de Email",
      stepIdentityDocument: "Documento de Identidade",
      stepComplianceReview: "Revisão de Conformidade",
      stepAccountActivation: "Ativação da Conta",
      statusInProgress: "Em Progresso",
      statusComplete: "Concluído",
      statusPending: "Pendente",
      changePassword: "Alterar Palavra-passe",
      updateCredentials: "Atualize as suas credenciais",
      newPassword: "Nova Palavra-passe",
      confirmNewPassword: "Confirmar Nova Palavra-passe",
      emailVerification: "Verificação de Email",
      verified: "Verificado",
      verifiedEmail: "Email Verificado",
      securityActivityLog: "Registo de Atividade de Segurança",
      scanAuthenticator: "Leia com a sua app de autenticação",
      eventLoginNewDevice: "Login a partir de um novo dispositivo",
      eventPasswordChanged: "Palavra-passe alterada",
      eventAccountCreated: "Conta criada",
      timeHoursAgo: "há {{count}} horas",
      timeDaysAgo: "há {{count}} dias"
    },
    performanceTitle: "Painel de Desempenho",
    auditLogTitle: "Registro de Auditoria",
    auditLogDesc: "Todas as ordens algorítmicas executadas na sua conta.",
    accountSettingsTitle: "Configurações da Conta",
    personalInformation: "Informações Pessoais",
    emailAddress: "Endereço de E-mail",
    emailChangeNotice: "Alterar seu e-mail exige verificação. Um link de confirmação será enviado ao novo endereço de e-mail.",
    currentEmail: "E-mail Atual",
    confirmationSent: "Confirmação Enviada",
    tryDifferentEmail: "Tentar outro e-mail",
    continueToMethod: "Continuar para Seleção de Método",
    uploadHint: "PNG, JPG, PDF até 10MB",
    twoFactorDesc: "Adicione uma camada extra de segurança à sua conta. Use um aplicativo autenticador como Google Authenticator ou Authy.",
    qrCode: "Código QR",
    kycRequiredBanner: "KYC Obrigatório",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Rede",
    emailChangeInboxNotice: "Verifique sua caixa de entrada e clique no link para concluir a alteração de e-mail.",
    emailChangeSentTo: "Um link de confirmação foi enviado para {{email}}. Verifique sua caixa de entrada e clique no link para concluir a alteração de e-mail.",
    growthPerformanceMtd: "Desempenho de Crescimento (no mês)"
  },
  checkout: {
    summary: "RESUMO",
    allocationTitle: "ALOCAÇÃO",
    allocationSubtitle: "INSTITUCIONAL",
    tierLabel: "Nível de Infraestrutura Algorítmica",
    billedMonthly: "Faturado Mensalmente",
    detailsTitle: "Detalhes da Alocação",
    managedCapital: "Capital Gerenciado",
    setupFee: "Taxa de Configuração",
    waived: "ISENTA",
    latency: "Latência de Execução",
    infrastructureTitle: "Infraestrutura Incluída",
    realTimeMonitoring: "Monitoramento em Tempo Real",
    activeUponDeployment: "Ativo após a implantação",
    totalDue: "Total a Pagar",
    dedicatedNode: "Nó Dedicado",
    globalMarkets: "Mercados Globais",
    instantSetup: "Configuração Instantânea",
    authRequired: "AUTENTICAÇÃO NECESSÁRIA",
    authDesc: "Por favor, entre ou crie uma conta para prosseguir com a alocação.",
    btnLogin: "ENTRAR PARA PROSSEGUIR",
    btnRegister: "CRIAR CONTA",
    confirmDeployment: "Confirmar Implantação",
    deploymentDesc: "Ao confirmar, você autoriza a implantação da infraestrutura algorítmica associada ao plano {{plan}}.",
    proceedPayment: "PROSSEGUIR PARA PAGAMENTO SEGURO",
    secureGateway: "Gateway Seguro",
    back: "Voltar",
    riskDisclosure: "Divulgação de Risco: A negociação algorítmica envolve risco substancial de perda. Desempenhos passados não são indicativos de resultados futuros.",
    secureTransaction: "Transação Segura",
    paypalNote: "Suas informações de pagamento são processadas com segurança pelo PayPal. Braxel Markets não armazena os dados do seu cartão.",
    encryptionNote: "Criptografado com Padrões Institucionais AES-256",
    verifying: "Verificando Transação Institucional...",
    loading: "Carregando Terminal...",
    globalInfra: "Infraestrutura Global de Pagamentos",
    qrCode: "Código QR",
    allCards: "Todos os Cartões",
    selectPaymentMethod: "Selecionar Método de Pagamento",
    choosePayment: "Escolha como deseja pagar",
    creditCard: "Cartão de Crédito",
    instantPayment: "Pagamento Instantâneo",
    cardDesc: "Visa, Mastercard e outros cartões",
    crypto: "Criptomoeda",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Transferência cripto rápida e segura",
    wiseTransfer: "Transferência Bancária",
    wiseInternational: "Transferência Internacional",
    wiseDesc: "Transfira diretamente para nossa conta bancária via Wise",
    anyCountry: "Qualquer País",
    lowFees: "Taxas Baixas",
    transferInstructions: "Instruções de Transferência",
    wiseStep1: "Copie os dados bancários abaixo",
    wiseStep2: "Faça uma transferência do seu banco ou conta Wise",
    wiseStep3: "Clique em confirmar após fazer a transferência",
    bankDetails: "Dados Bancários",
    accountHolder: "Titular da Conta",
    bankName: "Nome do Banco",
    routingNumber: "Código do Banco",
    accountNumber: "Número da Conta",
    bankAddress: "Endereço do Banco",
    amountToSend: "Valor a Transferir",
    sendExactAmount: "Envie EXATAMENTE este valor para evitar atrasos",
    paymentReference: "Inclua seu email como referência",
    wiseNote: "Após fazer a transferência, clique em confirmar abaixo. Sua conta será ativada após verificação (1-3 dias úteis).",
    wiseConfirmText: "Eu fiz a transferência bancária e confirmo que o valor enviado corresponde ao preço do plano.",
    wiseConfirmRequired: "Por favor, confirme que fez a transferência",
    wisePaymentSuccess: "Pagamento confirmado! Sua conta está sendo configurada.",
    confirmWise: "CONFIRMAR TRANSFERÊNCIA",
    openWise: "Abrir Site Wise",
    securePayment: "Pagamento Seguro",
    cardNumber: "Número do Cartão",
    cardName: "Nome no Cartão",
    cardExpiry: "Validade",
    payNow: "PAGAR AGORA",
    amountToPay: "Valor a Pagar",
    selectNetwork: "Selecionar Rede",
    yourAddress: "Endereço de Depósito",
    yourAddressPlaceholder: "Digite seu endereço USDT",
    important: "IMPORTANTE",
    cryptoNote: "Envie o valor exato para receber o plano",
    confirmCrypto: "CONFIRMAR COM CRIPTO",
    copied: "Copiado!",
    cryptoPending: "Pagamento registrado! Aguardando confirmação.",
    processing: "Processando...",
    paymentSuccess: "Pagamento aprovado!",
    selectCountry: "Selecionar País",
    searchCountry: "Buscar país...",
    phone: "Número de Telefone",
    fillAllFields: "Preencha todos os campos",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "NOME COMPLETO",
    cardExpiryPlaceholder: "MM/AA",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Pagamento falhou",
    paymentError: "Erro no pagamento",
    noKyc: "Verificação KYC Necessária",
    subscriptionTitle: "ASSINATURA",
    subscriptionSubtitle: "PLANO DE SERVIÇO",
    serviceAccess: "Acesso ao Serviço",
    confirmCard: "CONFIRMAR CARTÃO",
    redirecting: "Redirecionando para o pagamento...",
    card: "Cartão de Crédito / Débito",
    testModeBanner: "MODO DE TESTE — Sem dinheiro real. Sem banco real. Sem carteira real. Sem ativação real.",
    startFailed: "Não foi possível iniciar o pagamento. Tente novamente.",
    notConfigured: "Os pagamentos ainda não estão totalmente configurados. Tente outro método ou contacte o suporte.",
    invalidPlanTitle: "PLANO INVÁLIDO",
    invalidPlanDesc: "O plano selecionado não está mais disponível. Escolha um plano novamente.",
    swiftLabel: "SWIFT",
    referenceLabel: "Referência",
  },
  legal: {
    badgeLegal: "JURÍDICO",
    termsTitle: "TERMOS DE SERVIÇO"
  },
  transparency: {
    badge: "GESTÃO DE RISCO",
    title: "TRANSPARÊNCIA TOTAL",
    desc: "Nossa infraestrutura combina monitoramento, controles de risco e padrões rigorosos de conformidade para manter a operação estável e os protocolos de proteção de capital sempre ativos.",
    warning: "Os mercados são voláteis. Os retornos nunca são garantidos e podem ocorrer perdas mesmo com salvaguardas robustas.",
    protocolTitle: "Protocolo projetado para uso institucional",
    protocolDesc: "Nossa infraestrutura segue rigorosos padrões de conformidade e gestão de riscos para buscar segurança operacional (sem garantia).",
    connectivity: {
      title: "CONECTIVIDADE",
      desc: "Acesso direto ao mercado via data centers Equinix (NY5, LD4, TY3) com conectividade de baixa latência às principais bolsas (não verificado)."
    },
    cloud: {
      title: "EXECUÇÃO EM NUVEM",
      desc: "Motores de execução redundantes na AWS (us-east-1, eu-west-1) e Azure para resiliência de failover (não verificado)."
    },
    security: {
      title: "SEGURANÇA",
      desc: "Criptografia de ponta a ponta, conformidade SOC 2 Tipo II e autenticação em várias camadas para todas as operações (não verificado)."
    }
  },
  faq: {
    title: "PERGUNTAS FREQUENTES",
    badge: "PERGUNTAS FREQUENTES",
    q1: "É necessária experiência prévia?",
    a1: "Não. Nossa infraestrutura é totalmente automatizada. Você só precisa selecionar seu nível de alocação e monitorar o desempenho via terminal.",
    q2: "Quais são os riscos envolvidos?",
    a2: "Como em qualquer mercado financeiro, há riscos de perda de capital devido à volatilidade. Utilizamos protocolos avançados de mitigação para proteger o capital.",
    q3: "Como o sistema funciona?",
    a3: "Nossos algoritmos proprietários executam estratégias quantitativas de alta frequência nos mercados globais com precisão de milissegundos.",
    q4: "Posso cancelar meu plano?",
    a4: "Sim. Você pode solicitar o cancelamento e o saque do capital a qualquer momento através dos protocolos do seu painel."
  },
  diffs: {
    title: "POR QUE A BRAXEL MARKETS?",
    badge: "DIFERENCIAIS",
    t1: "Tecnologia Proprietária",
    d1: "Redes neurais projetadas para execução de nível institucional.",
    t2: "Automação Total",
    d2: "Gestão algorítmica 24/7 sem viés emocional humano.",
    t3: "Acesso Simplificado",
    d3: "Infraestrutura institucional acessível através de um terminal intuitivo.",
    t4: "Nível Profissional",
    d4: "Conexão direta a pools de liquidez globais com latência ultra-baixa."
  },
  signals: {
    title: "EXECUÇÃO",
    subtitle: "ALGORÍTMICA",
    badge: "TERMINAL EM TEMPO REAL",
    desc: "Monitore nossa infraestrutura proprietária em tempo real. Cada sinal é processado por nossas redes neurais com precisão de milissegundos.",
    asset: "ATIVO",
    type: "TIPO",
    entry: "ENTRADA",
    profit: "LUCRO",
    status: "STATUS",
    active: "ATIVO",
    completed: "CONCLUÍDO",
    institutionalVerification: "Verificação Institucional",
    realtimeFeed: "Feed de dados em tempo real de pools de liquidez globais.",
    liveTerminal: "TERMINAL AO VIVO",
    connected: "CONECTADO"
  },
  application: {
    title: "INSCRIÇÃO",
    subtitle: "ENVIO",
    plan_selected: "Plano Selecionado",
    billed_monthly: "Cobrado mensalmente",
    plan_description: "Você está prestes a comprar a assinatura do serviço {{plan}}.",
    plan_price_detail: "Taxa mensal: {{price}} (cobrada mensalmente)",
    full_name: "Nome Completo",
    full_name_placeholder: "Digite seu nome completo",
    email: "Endereço de E-mail",
    email_placeholder: "Digite seu e-mail",
    address_line1: "Endereço — Linha 1",
    address_line1_placeholder: "Rua, número e bairro",
    address_line2: "Complemento",
    address_line2_placeholder: "Apto, bloco, unidade, etc. (opcional)",
    city: "Cidade",
    city_placeholder: "Cidade",
    region: "Estado / Região",
    region_placeholder: "Estado ou região",
    postal_code: "CEP",
    postal_code_placeholder: "CEP",
    country: "País",
    country_placeholder: "País",
    phone: "Telefone",
    phone_placeholder: "Número de telefone",
    terms_accepted: "Aceito os Termos de Serviço",
    privacy_accepted: "Aceito a Política de Privacidade",
    viewTerms: "Ver Termos",
    viewPrivacy: "Ver Política de Privacidade",
    customer_note: "Observação do Cliente (opcional)",
    customer_note_placeholder: "Qualquer informação adicional que você queira que saibamos",
    note_limit: "Máximo de {{count}} caracteres",
    characters: "caracteres",
    submitting: "Enviando...",
    submit: "ENVIAR INSCRIÇÃO",
    errors: {
      full_name_required: "O nome completo é obrigatório",
      email_required: "O e-mail é obrigatório",
      email_invalid: "Endereço de e-mail inválido",
      address_line1_required: "O endereço é obrigatório",
      city_required: "A cidade é obrigatória",
      country_required: "O país é obrigatório",
      terms_required: "Você deve aceitar os Termos de Serviço",
      privacy_required: "Você deve aceitar a Política de Privacidade",
      note_too_long: "A observação deve ter no máximo 500 caracteres",
      submit_failed: "Falha no envio. Tente novamente."
    }
  },
  checkoutSuccess: {
    verifying: "Verificando pagamento…",
    backToPricing: "Voltar para os planos",
    couldNotVerify: "Ainda não foi possível verificar o seu pagamento",
    couldNotVerifyDesc: "Se você concluiu o checkout, não se preocupe — o seu pagamento está sendo processado e a sua conta será ativada em breve. Atualize esta página daqui a alguns instantes.",
    verifiedBadge: "Verificado",
    paymentCompleted: "Pagamento concluído",
    activationNotice: "A sua conta será ativada em poucos minutos.",
    paymentId: "ID do Pagamento",
    applicationId: "ID da Inscrição",
    securityNotice: "Por segurança, as contas são ativadas manualmente por um operador após a verificação do pagamento. Você receberá o acesso assim que a revisão for concluída.",
    goToDashboard: "Ir para o painel",
    contactSupport: "Falar com o suporte",
    verifyingBadge: "Verificando",
    paymentReceived: "Pagamento recebido. Estamos verificando o pagamento.",
    beingVerified: "O seu pagamento está sendo verificado. Esta página será atualizada automaticamente assim que o pagamento for confirmado. Não feche esta janela.",
    currentStatus: "Status atual",
    urlSecurityNotice: "Por segurança, esta página não marca um pagamento como concluído apenas pela URL. Aguardamos a confirmação no servidor."
  },
  termsPage: {
    title: "Termos de Serviço",
    entityTitle: "Entidade Contratante",
    entityText: "[Nome da Pessoa Jurídica, Número de Registro, Jurisdição]",
    descriptionTitle: "Descrição do Serviço",
    descriptionText: "A Braxel Markets fornece infraestrutura de negociação algorítmica de nível institucional e serviços relacionados por meio de sua plataforma.",
    feesTitle: "Taxas e Pagamentos",
    feesText: "As taxas pelos nossos serviços estão descritas na página de Preços e estão sujeitas a alterações com aviso prévio. Os métodos de pagamento incluem transferência bancária, cartão de crédito e criptomoeda.",
    eligibilityTitle: "Elegibilidade",
    eligibilityText: "Nossos serviços estão disponíveis para pessoas físicas e jurídicas com pelo menos 18 anos de idade e que cumpram nossos requisitos de Conheça Seu Cliente (KYC) e de prevenção à lavagem de dinheiro (AML).",
    accountTerminationTitle: "Encerramento da Conta",
    accountTerminationText: "Qualquer das partes pode encerrar a conta mediante aviso escrito de [PLACEHOLDER: prazo de aviso, ex.: 30 dias]. A Braxel Markets pode encerrar imediatamente em caso de violação dos termos, atividade ilegal ou exigências regulatórias.",
    limitationOfLiabilityTitle: "Limitação de Responsabilidade",
    limitationOfLiabilityText: "Na máxima extensão permitida por lei, a Braxel Markets não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, nem por qualquer perda de dados, uso, fundo de comércio ou outras perdas intangíveis decorrentes do seu acesso ou uso dos nossos serviços.",
    disputeResolutionTitle: "Resolução de Conflitos e Lei Aplicável",
    disputeResolutionText: "Estes Termos serão regidos e interpretados de acordo com as leis de [PLACEHOLDER: jurisdição]. Qualquer disputa decorrente ou relacionada a estes Termos será submetida à jurisdição exclusiva dos tribunais de [PLACEHOLDER: jurisdição].",
    changesToTermsTitle: "Alterações a Estes Termos",
    changesToTermsText: "Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for relevante, forneceremos um aviso de pelo menos [PLACEHOLDER: prazo de aviso, ex.: 30 dias] antes que os novos termos entrem em vigor. O que constitui uma alteração relevante será determinado a nosso exclusivo critério.",
    effectiveDateTitle: "Data de Vigência",
    effectiveDateText: "Data de Vigência: [PLACEHOLDER: data]",
    contactTitle: "Contato",
    contactText: "Para dúvidas sobre estes Termos, entre em contato conosco pelo [PLACEHOLDER: e-mail ou endereço de contato]."
  },
  legalDraftBanner: "Esta página é um rascunho em revisão jurídica e ainda não é final.",
  notFound: {
    title: "404",
    message: "Desculpe, a página que você procura não existe.",
    returnHome: "Voltar ao Início"
  },
  authCallback: {
    confirmingTitle: "Confirmando sua conta...",
    confirmingDesc: "Aguarde enquanto verificamos seu e-mail.",
    confirmedTitle: "E-mail Confirmado!",
    confirmedDesc: "Sua conta foi verificada com sucesso.",
    redirecting: "Redirecionando para o login...",
    failedTitle: "Falha na Confirmação",
    goToLogin: "Ir para o Login",
    invalidLink: "Link de confirmação inválido ou expirado",
    failedConfirm: "Falha ao confirmar o e-mail"
  },
  paymentsDisabled: {
    title: "Os pagamentos estão atualmente desativados.",
    desc: "O sistema de pagamento ainda não está ativo. Para ativar os pagamentos, entre em contato com o operador em",
    managedBy: "O processamento de pagamentos é gerenciado exclusivamente pelo operador da plataforma. Se você tiver dúvidas sobre uma alocação pendente, entre em contato com o suporte.",
    viewPlans: "Ver Planos de Investimento"
  },
  checkoutStatus: {
    created: "Criado",
    pending: "Aguardando Pagamento",
    processing: "Verificando On-Chain",
    confirmed: "Confirmado",
    failed: "Falhou",
    rejected: "Rejeitado",
    refunded: "Reembolsado",
    disputed: "Contestado",
    canceled: "Cancelado",
    pending_manual: "Aguardando Revisão Manual"
  },
  legalReview: {
    title: "Minuta em revisão jurídica"
  },
  operator: {
    title: "Operador",
    subtitle: "Painel",
    description: "Revise e ative as solicitações de clientes pendentes.",
    no_pending_applications: "Nenhuma solicitação pendente.",
    plan: "Plano",
    amount: "Valor",
    country: "País",
    customer_note: "Observação do cliente",
    activate_account: "Ativar conta",
    activating: "Ativando...",
    reject_or_request_info: "Rejeitar / solicitar informações",
    rejecting: "Rejeitando...",
    reject_application: "Rejeitar solicitação",
    reject_reason_prompt: "Informe o motivo da rejeição ou as informações necessárias.",
    reject_reason_placeholder: "Motivo...",
    cancel: "Cancelar",
    reject: "Rejeitar",
    errors: {
      activation_failed: "Falha ao ativar a solicitação.",
      rejection_failed: "Falha ao rejeitar a solicitação."
    },
    status: {
      activation_pending: "Ativação pendente",
      account_active: "Conta ativa",
      rejected: "Rejeitado",
      manual_review: "Revisão manual"
    }
  },
  profitCalculator: {
    badge: "PROJEÇÃO",
    titleA: "CALCULADORA",
    titleB: "DE LUCRO",
    initialAllocation: "Alocação Inicial",
    monthlyProfit: "Lucro Mensal Est.",
    annualProfit: "Lucro Anual Est.",
    riskTitle: "Gestão de Risco",
    riskDesc: "Projeções baseadas no desempenho algorítmico histórico com limites rigorosos de drawdown.",
    instantTitle: "Implantação Instantânea",
    instantDesc: "Seu capital começa a trabalhar minutos após a integração da infraestrutura.",
    disclaimer: "* Aviso: O desempenho passado não garante resultados futuros. As projeções são apenas ilustrativas."
  },
  meta: {
    home: {
      title: "Braxel Markets | Gestão de Capital Algorítmica Institucional",
      description: "Infraestrutura de negociação algorítmica de nível institucional, acesso a capital de prop firm, autorização de CopyTrade e automação completa do MetaTrader para XAU/USD e US500."
    },
    pricing: {
      title: "Planos e Capital Gerenciado | Braxel Markets",
      description: "Compare planos de negociação algorítmica e alocações de Capital Gerenciado. O Capital Gerenciado é sempre cotado em USD."
    },
    about: {
      title: "Sobre a Braxel Markets | Negociação Algorítmica",
      description: "A Braxel Markets desenvolve infraestrutura de negociação algorítmica de nível institucional e gerencia capital com controles de risco rigorosos."
    },
    howItWorks: {
      title: "Como Funciona | Braxel Markets",
      description: "Veja como a Braxel Markets conecta seu capital a estratégias totalmente automatizadas de MetaTrader para XAU/USD e US500."
    },
    contact: {
      title: "Contato | Braxel Markets",
      description: "Entre em contato com a equipe da Braxel Markets sobre infraestrutura de negociação algorítmica e capital gerenciado."
    },
    terms: {
      title: "Termos de Serviço | Braxel Markets",
      description: "Leia os Termos de Serviço para usar a Braxel Markets."
    },
    privacy: {
      title: "Política de Privacidade | Braxel Markets",
      description: "Saiba como a Braxel Markets coleta, usa e protege seus dados pessoais."
    },
    disclaimer: {
      title: "Aviso de Risco | Braxel Markets",
      description: "Aviso importante de risco para negociação algorítmica e capital gerenciado com a Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brasil",
      US: "Estados Unidos",
      GB: "Reino Unido",
      DE: "Alemanha",
      FR: "França",
      ES: "Espanha",
      IT: "Itália",
      PT: "Portugal",
      RU: "Rússia",
      CN: "China",
      JP: "Japão",
      IN: "Índia",
      OTHER: "Outros Países"
    },
    method: {
      BR: {
        id_card: "Documento de Identidade Nacional (RG/CPF)",
        drivers_license: "Carteira de Motorista"
      },
      US: {
        id_card: "Documento de Identidade Estadual"
      },
      GB: {
        id_card: "Documento Nacional / Carteira de Motorista",
        biometric: "Autorização de Residência Biométrica"
      },
      DE: {
        drivers: "Carteira de Motorista",
        passport: "Passaporte / Reisepass"
      },
      FR: {
        residence: "Autorização de Residência"
      },
      RU: {
        foreign_passport: "Passaporte Estrangeiro"
      },
      OTHER: {
        passport: "Passaporte Internacional",
        national_id: "Documento de Identidade Nacional"
      }
    },
    doc: {
      rg: {
        desc: "Documento nacional de identidade brasileiro"
      },
      cpf: {
        desc: "Cartão de registro de contribuinte brasileiro (CPF)"
      },
      passport: {
        desc: "Passaporte válido com página de foto",
        name: "Passaporte"
      },
      cnh: {
        desc: "Carteira de Motorista brasileira",
        name: "CNH (Carteira de Motorista)"
      },
      state_id: {
        desc: "Carteira de Motorista ou documento emitido pelo estado",
        name: "Documento de Identidade Estadual"
      },
      passport_uk: {
        desc: "Passaporte britânico válido"
      },
      driving_license_uk: {
        desc: "Carteira de Motorista britânica",
        name: "Carteira de Motorista"
      },
      brp: {
        desc: "Autorização de Residência Biométrica britânica",
        name: "Autorização de Residência Biométrica"
      },
      personalausweis: {
        desc: "Documento de identidade alemão"
      },
      passport_de: {
        desc: "Passaporte alemão válido"
      },
      fuehrerschein: {
        desc: "Carteira de Motorista alemã"
      },
      cni: {
        desc: "Documento nacional de identidade francês"
      },
      passport_fr: {
        desc: "Passaporte francês válido"
      },
      titre_sejour: {
        desc: "Autorização de residência francesa"
      },
      dni: {
        desc: "Documento nacional de identidade espanhol"
      },
      nie: {
        desc: "Número de identificação de estrangeiro"
      },
      passport_es: {
        desc: "Passaporte válido"
      },
      carta_id: {
        desc: "Documento de identidade italiano"
      },
      passport_it: {
        desc: "Passaporte italiano válido"
      },
      cc: {
        desc: "Cartão de Cidadão português"
      },
      passport_pt: {
        desc: "Passaporte português válido"
      },
      passport_ru: {
        desc: "Passaporte interno russo"
      },
      foreign_passport_ru: {
        desc: "Passaporte russo para o exterior",
        name: "Passaporte Estrangeiro"
      },
      id_card_cn: {
        desc: "Documento de identidade chinês"
      },
      passport_cn: {
        desc: "Passaporte válido"
      },
      passport_jp: {
        desc: "Passaporte japonês válido"
      },
      zairyu: {
        desc: "Cartão de residência"
      },
      aadhaar: {
        desc: "Cartão de Identificação Única",
        name: "Cartão Aadhaar"
      },
      voter_id: {
        desc: "Título de eleitor com foto",
        name: "Título de Eleitor"
      },
      passport_in: {
        desc: "Passaporte indiano válido"
      },
      passport_intl: {
        desc: "Passaporte válido do seu país"
      },
      national_id_intl: {
        desc: "Documento de identidade nacional emitido pelo governo",
        name: "Documento de Identidade Nacional"
      }
    },
    methodName: {
      id_card: "Documento de Identidade Nacional",
      passport: "Passaporte",
      drivers_license: "Carteira de Motorista",
      drivers: "Carteira de Motorista",
      biometric: "Autorização de Residência Biométrica",
      residence: "Autorização de Residência",
      foreign_passport: "Passaporte Estrangeiro",
      national_id: "Documento de Identidade Nacional"
    }
  },
  errorBoundary: {
    title: "Algo deu errado",
    message: "Não foi possível carregar esta página. Tente novamente.",
    retry: "Recarregar página",
    home: "Voltar ao início"
  }
};

const itTranslation = {
  disclaimerPage: {
    title: "Informativa finanziaria",
    risk: "Rischio",
    importantRiskTitle: "Avviso importante sui rischi",
    importantRiskText: "L’investimento nei mercati finanziari comporta rischi sostanziali e può comportare la perdita totale del capitale investito. I risultati passati non sono garanzia di quelli futuri.",
    noAdviceTitle: "Nessuna consulenza",
    noAdviceText: "Il contenuto di questo sito e i servizi forniti da Braxel Markets non costituiscono consulenza finanziaria, legale o fiscale. Consigliamo a ogni investitore di rivolgersi a un professionista indipendente prima di prendere decisioni di investimento.",
    limitationTitle: "Limitazione di responsabilità",
    limitationText: "Braxel Markets non è responsabile per perdite finanziarie derivanti dall’uso della nostra tecnologia di automazione o dalle fluttuazioni di mercato.",
    capitalAtRiskTitle: "Capitale a rischio",
    capitalAtRiskText: "Il tuo capitale è a rischio quando utilizzi i nostri servizi. Potresti perdere parte o tutto il tuo investimento.",
    noGuaranteedReturnsTitle: "Nessun rendimento garantito",
    noGuaranteedReturnsText: "Non garantiamo alcun rendimento o profitto. I risultati passati non sono indicativi di quelli futuri.",
    pastPerformanceTitle: "I risultati passati non sono indicativi",
    pastPerformanceText: "Qualsiasi risultato storico mostrato è solo a scopo illustrativo e non garantisce risultati futuri.",
    notLicensedTitle: "Status normativo",
    notLicensedText: "Braxel Markets non è attualmente rappresentata come istituzione finanziaria autorizzata o regolamentata in [PLACEHOLDER: giurisdizione]. Ti invitiamo a verificare lo status normativo applicabile alla tua località.",
    noCapitalProtectionTitle: "Nessuna garanzia di protezione del capitale",
    noCapitalProtectionText: "Non offriamo alcuna protezione del capitale né garanzia contro le perdite.",
    algorithmicRisksTitle: "Rischi del trading algoritmico/automatico",
    algorithmicRisksText: "Le strategie di trading automatizzate e algoritmiche comportano rischi tra cui, a titolo esemplificativo, guasti di sistema, problemi di connettività, errori di modello e condizioni di mercato impreviste.",
    jurisdictionRestrictionsTitle: "Restrizioni di giurisdizione",
    jurisdictionRestrictionsText: "I nostri servizi potrebbero non essere disponibili in tutte le giurisdizioni. Gli utenti sono responsabili di garantire la conformità alle leggi e ai regolamenti locali prima di utilizzare la nostra piattaforma."
  },
  privacyPage: {
    title: "Informativa sulla privacy",
    privacy: "Privacy",
    dataCollectionTitle: "Raccolta dei dati",
    dataCollectionText: "Raccogliamo solo le informazioni necessarie all’erogazione dei nostri servizi, tra cui nome, email e dati delle transazioni. I tuoi dati sono protetti con crittografia AES-256.",
    useOfInfoTitle: "Uso delle informazioni",
    useOfInfoText: "Le informazioni raccolte sono utilizzate esclusivamente per gestire il tuo account, elaborare i pagamenti e inviare report settimanali sulle prestazioni.",
    securityTitle: "Sicurezza",
    securityText: "Adottiamo rigorose misure di sicurezza per proteggere dall’accesso non autorizzato, dalla modifica o dalla distruzione dei tuoi dati personali.",
    legalBasisTitle: "Base giuridica del trattamento",
    legalBasisText: "La nostra base giuridica per il trattamento dei tuoi dati personali è [PLACEHOLDER: base giuridica, es. consenso, interesse legittimo, necessità contrattuale].",
    retentionTitle: "Periodo di conservazione dei dati",
    retentionText: "Conserviamo i tuoi dati personali per [PLACEHOLDER: periodo di conservazione], salvo che la legge richieda un periodo più lungo.",
    thirdPartiesTitle: "Terze parti e responsabili",
    thirdPartiesText: "Possiamo condividere i tuoi dati con fornitori di servizi terzi affidabili come [PLACEHOLDER: elenco dei responsabili, es. processori di pagamento, hosting cloud, servizi email], esclusivamente per le finalità descritte nella presente politica.",
    userRightsTitle: "I tuoi diritti",
    userRightsText: "Ai sensi delle leggi applicabili sulla protezione dei dati, come la LGPD (Brasile) e il GDPR (UE), hai il diritto di accedere, rettificare, cancellare e trasferire i tuoi dati personali, nonché di opporti o limitare il trattamento. Per esercitare tali diritti, contattaci all’indirizzo [PLACEHOLDER: contatto per richieste sui diritti].",
    cookiesTitle: "Cookie e tecnologie simili",
    cookiesText: "Il nostro sito utilizza cookie e tecnologie simili per migliorare l’esperienza utente, analizzare il traffico e personalizzare i contenuti. Puoi gestire le tue preferenze sui cookie tramite le impostazioni del browser.",
    contactTitle: "Contatti e responsabile della protezione dei dati",
    contactText: "Per domande sulla presente Informativa sulla privacy o sulle nostre pratiche sui dati, contatta il nostro Responsabile della protezione dei dati all’indirizzo [PLACEHOLDER: email o contatto del DPO]."
  },
  contactEmail: {
    newSubmission: "Nuovo invio dal modulo di contatto",
    name: "Nome",
    email: "Email",
    subject: "Oggetto",
    message: "Messaggio",
    sentFrom: "Inviato da"
  },
  nav: {
    pricing: "PIANI DI INVESTIMENTO",
    howItWorks: "INFRASTRUTTURA",
    about: "CHI SIAMO",
    contact: "SUPPORTO ISTITUZIONALE",
    login: "ACCESSO TERMINALE",
    support: "Supporto",
    openAccount: "CREA ACCOUNT",
    dashboard: "PANNELLO",
    logout: "ESCI",
    selectLanguage: "Seleziona Lingua",
    sessionActive: "Sessione attiva",
    accessDashboard: "Accedi alla dashboard"
  },
  footer: {
    desc: "Infrastruttura di investimento di livello istituzionale. Tecnologia proprietaria per il mercato moderno.",
    platform: "Piattaforma",
    company: "Azienda",
    support: "Supporto Digitale",
    rights: "Tutti i diritti riservati.",
    privacy: "Privacy",
    terms: "Termini",
    disclaimer: "Avviso Finanziario",
    address: "Indirizzo Commerciale",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, Spagna",
    riskTitle: "AVVISO DI RISCHIO",
    riskText: "Il trading nei mercati finanziari comporta un rischio sostanziale di perdita e non è adatto a tutti gli investitori. Le performance passate non sono indicative dei risultati futuri. Il valore degli investimenti può diminuire o aumentare. Non investire denaro che non puoi permetterti di perdere. Braxel Markets non garantisce rendimenti specifici.",
    emailAria: "Email",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Supporto Braxel",
    placeholder: "Scrivi un messaggio...",
    emailSupport: "Email:",
    assistantReply: "Grazie per il tuo messaggio. Il nostro team risponderà a breve.",
    send: "Invia",
    brandAI: "IA di Braxel Markets",
    openChat: "Apri chat di assistenza",
    close: "Chiudi",
    minimize: "Riduci",
    maximize: "Ingrandisci",
    supportDialog: "Chat di assistenza"
  },
  auth: {
    loginTitle: "Accesso",
    loginSubtitle: "Inserisci le tue credenziali di accesso.",
    registerTitle: "Crea Account",
    registerSubtitle: "Inizia il tuo percorso nel mercato istituzionale.",
    email: "Indirizzo E-mail",
    password: "Password",
    fullName: "Nome Completo",
    forgotPassword: "Password dimenticata?",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già accesso?",
    btnAccess: "ACCEDI ALL'ACCOUNT",
    btnCreate: "CREA IL MIO ACCOUNT",
    termsAgree: "Accetto i Termini e la Privacy.",
    futureTitle: "Il Futuro degli",
    futureSubtitle: "Investimenti",
    features: [
      "Algoritmi di livello istituzionale",
      "Protezione avanzata del capitale",
      "Esecuzione in millisecondi",
      "Trasparenza totale"
    ],
    accessBadge: "Accesso istituzionale",
    emailPlaceholder: "Inserisci la tua email",
    fullNamePlaceholder: "Inserisci il tuo nome completo",
    loginLink: "Accedi",
    loginSideDescription: "Accedi al tuo terminale istituzionale.",
    loginSideFooter: "Sicurezza di livello istituzionale",
    loginErrorMessage: "Credenziali non valide. Riprova.",
    registerErrorMessage: "Registrazione fallita. Riprova.",
    registerSuccessMessage: "Account creato con successo!",
    registerSideFooter: "Protetto da sicurezza istituzionale",
    welcomeBackTitle: "Bentornato",
    welcomeBackHighlight: "Terminale Istituzionale",
    accountNotFound: "Account non trovato. Crea un account prima.",
    rememberMe: "Ricordami",
    registerLink: "Crea account",
    passwordPlaceholder: "Password",
    accountNotFoundError: "Account non trovato. Crea prima un account.",
    resetPasswordSent: "Se esiste un account per quell’email, è stato inviato un link di reimpostazione della password.",
    resetPasswordError: "Impossibile inviare il link di reimpostazione. Riprova.",
    enterEmailFirst: "Inserisci prima il tuo indirizzo email."
  },
  hero: {
    title1: "GESTIONE ALGORITMICA",
    title2: "DEL CAPITALE D'ÉLITE",
    desc: "Implementa strategie quantitative di livello istituzionale progettate per il mercato moderno. Sperimenta precisione di esecuzione in millisecondi e protocolli avanzati di mitigazione del rischio.",
    getStarted: "ESPLORA I PIANI DI INVESTIMENTO",
    viewStrategies: "METODOLOGIA TECNICA"
  },
  stats: {
    volume: "Gestione Strategica del Capitale",
    traders: "Conti Attivi",
    uptime: "Uptime Infrastruttura",
    latency: "Precisione di Esecuzione"
  },
  methodology: {
    badge: "METODOLOGIA",
    title: "MODELLI QUANTITATIVI",
    statArb: {
      title: "ARBITRAGGIO STATISTICO",
      desc: "Sfruttamento delle inefficienze temporanee di prezzo tra asset correlati utilizzando modelli di cointegrazione e pair trading.",
      f1: "Analisi di Cointegrazione",
      f2: "Algoritmi di Selezione dei Pair",
      f3: "Soglia Z-Score"
    },
    meanRev: {
      title: "RITORNO ALLA MEDIA",
      desc: "Identificazione delle deviazioni di prezzo rispetto alle medie storiche, con regole sistematiche di ingresso e uscita.",
      f1: "Segnali Bande di Bollinger",
      f2: "Rilevamento Divergenza RSI",
      f3: "Modelli Ornstein-Uhlenbeck"
    },
    hft: {
      title: "TRADING AD ALTA FREQUENZA",
      desc: "Strategie di esecuzione a latenza ultra-bassa con infrastruttura co-localizzata per ordini a livello di microsecondi.",
      f1: "Microstruttura di Mercato",
      f2: "Analisi del Flusso Ordini",
      f3: "Arbitraggio di Latenza"
    }
  },
  transparency: {
    badge: "INFRASTRUTTURA",
    title: "TECNOLOGIA TRASPARENTE",
    desc: "La nostra infrastruttura è costruita su basi enterprise, garantendo affidabilità, velocità e sicurezza.",
    connectivity: {
      title: "CONNETTIVITÀ",
      desc: "Accesso diretto al mercato tramite data center Equinix (NY5, LD4, TY3) con connettività a bassa latenza verso i principali mercati (non verificato)."
    },
    cloud: {
      title: "ESECUZIONE CLOUD",
      desc: "Motori di esecuzione ridondanti su AWS (us-east-1, eu-west-1) e Azure per la resilienza al failover (non verificato)."
    },
    security: {
      title: "SICUREZZA",
      desc: "Crittografia end-to-end, conformità SOC 2 Type II e autenticazione a più livelli per tutte le operazioni (non verificato)."
    },
    warning: "I mercati sono volatili. I rendimenti non sono mai garantiti e possono verificarsi perdite anche con solide tutele.",
    protocolTitle: "Protocollo progettato per uso istituzionale",
    protocolDesc: "La nostra infrastruttura segue rigorosi standard di conformità e gestione del rischio per puntare alla sicurezza operativa (nessuna garanzia)."
  },
  process_home: {
    badge: "PROCESSO",
    title: "FLUSSO",
    subtitle: "ISTITUZIONALE",
    step1: {
      title: "REGISTRAZIONE",
      desc: "Onboarding sicuro e verifica dell'identità."
    },
    step2: {
      title: "ALLOCAZIONE",
      desc: "Selezione del livello di capitale gestito."
    },
    step3: {
      title: "INTEGRAZIONE",
      desc: "Implementazione dell'infrastruttura algoritmica."
    },
    step4: {
      title: "MONITORAGGIO",
      desc: "Tracciamento delle performance in tempo reale."
    },
    step5: {
      title: "LIQUIDITÀ",
      desc: "Protocolli di prelievo dei profitti semplificati."
    }
  },
  cta_home: {
    badge: "OPPORTUNITÀ",
    title: "SCALA IL TUO",
    subtitle: "CAPITALE",
    desc: "Unisciti al gruppo d'élite di investitori che utilizzano l'infrastruttura proprietaria di Braxel.",
    btn: "INIZIA L'ALLOCAZIONE",
    trust: "Sicurezza di Livello Istituzionale"
  },
  pricing: {
    badge: "TRASPARENZA",
    title: "ALLOCAZIONI DI",
    subtitle: "CAPITALE",
    desc: "Infrastruttura di livello istituzionale con una struttura tariffaria trasparente.",
    select: "GARANTISCI QUESTO PIANO",
    allocation: "CAPITALE GESTITO",
    month: "tariffa mensile",
    detectedCurrency: "Tutti i prezzi sono addebitati in USD ({{currency}}), indipendentemente dalla tua posizione",
    managedCapitalUsdNote: "Il capitale gestito (Capital Gerenciado) è sempre quotato in USD."
  },
  plans: {
    starter: "Base",
    starterFeatures: "Funzionalità del piano Base",
    managedCapital: "Capitale Gestito",
    features: {
      automation: "Automazione",
      accountManagement: "Gestione Account",
      emailSupport: "Supporto Email",
      controlledRisk: "Rischio Controllato",
      starterFeatures: "Funzionalità del piano Base",
      prioritySupport: "Supporto Prioritario",
      detailedLogs: "Log Dettagliati",
      proFeatures: "Funzionalità Pro",
      multiAccount: "Multi-account",
      weeklyReports: "Report Settimanali",
      advancedFeatures: "Funzionalità avanzate",
      support247: "Supporto 24/7",
      dedicatedManager: "Manager Dedicato"
    },
    professional: "Professionale",
    professionalFeatures: "Funzionalità del piano Professionale",
    business: "Business",
    businessFeatures: "Funzionalità del piano Business",
    enterprise: "Enterprise",
    enterpriseFeatures: "Funzionalità del piano Enterprise"
  },
  howItWorks: {
    badge: "INFRASTRUTTURA",
    title: "ARCHITETTURA",
    subtitle: "TECNICA",
    desc: "Il nostro ecosistema proprietario è costruito per velocità, sicurezza e performance costanti.",
    steps: [
      {
        title: "REGISTRAZIONE",
        desc: "Crea il tuo profilo istituzionale."
      },
      {
        title: "PANNELLO",
        desc: "Accedi al tuo terminale privato di gestione."
      },
      {
        title: "SELEZIONE PIANO",
        desc: "Scegli il tuo livello di allocazione del capitale."
      },
      {
        title: "IMPLEMENTAZIONE API",
        desc: "Connessione automatizzata ai mercati globali."
      },
      {
        title: "ESECUZIONE",
        desc: "Elaborazione ordini in millisecondi."
      },
      {
        title: "REPORTISTICA",
        desc: "Analisi dettagliata delle performance settimanali."
      }
    ],
    cta: "PRONTO PER INIZIARE?",
    ctaBtn: "UNISCITI ALLA RETE"
  },
  about: {
    badge: "CHI SIAMO",
    title: "ECCELLENZA",
    subtitle: "ISTITUZIONALE",
    desc: "Braxel Markets rappresenta l'apice della gestione algoritmica del capitale.",
    historyTitle: "LA NOSTRA STORIA",
    historyDesc1: "Fondata da un team di analisti quantitativi e ingegneri del software, Braxel è stata creata per colmare il divario tra capitale retail e tecnologia istituzionale.",
    historyDesc2: "Oggi ci concentriamo su rendimenti aggiustati per il rischio e stabilità infrastrutturale, fornendo strategie algoritmiche all'avanguardia per l'investitore moderno.",
    stats: {
      founded: "Fondata",
      users: "Utenti Attivi",
      uptime: "Uptime",
      support: "Supporto"
    },
    values: {
      mission: "MISSIONE",
      missionDesc: "Fornire infrastruttura algoritmica d'élite per il capitale globale.",
      vision: "VISIONE",
      visionDesc: "Definire il futuro della gestione quantitativa automatizzata.",
      values: "VALORI",
      valuesDesc: "Trasparenza, precisione e sicurezza incrollabile."
    },
    teamTitle: "TEAM DI LEADERSHIP",
    teamDesc: "Incontra i fondatori e i gestori dietro Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Fondatore & CEO",
        bio: "Stratega quantitativo e imprenditore che guida la visione di Braxel Markets per l'infrastruttura algoritmica istituzionale.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "LEADERSHIP"
  },
  contact: {
    badge: "SUPPORTO",
    title: "CANALI",
    subtitle: "ISTITUZIONALI",
    desc: "Il nostro team di supporto dedicato è disponibile 24/7 per richieste istituzionali.",
    infoTitle: "CONTATTI",
    formTitle: "RICHIESTA DIRETTA",
    placeholders: {
      name: "NOME COMPLETO",
      email: "INDIRIZZO E-MAIL",
      subject: "OGGETTO",
      message: "MESSAGGIO"
    },
    sendBtn: "INVIA RICHIESTA",
    supportHours: "Orario di Supporto",
    institutionalSupport: "Supporto Istituzionale 24/7",
    securityChallenge: "Sfida di Sicurezza",
    securityAnswer: "Risposta",
    incorrectAnswer: "Risposta di sicurezza errata. Per favore, riprova.",
    waitMessage: "Per favore, attendi un momento prima di inviare un altro messaggio.",
    messageSent: "Messaggio inviato con successo! Il nostro team ti contatterà presto.",
    messageFailed: "Invio del messaggio fallito. Per favore, riprova o inviaci un'email direttamente a marketsbraxel@ouvidor.net",
    cooldown: "ATTENDI",
    consentPre: "Inviando questo modulo, accetti la nostra",
    consentPost: "Utilizziamo i tuoi dati solo per rispondere alla tua richiesta.",
    emailLabel: "Email"
  },
  dashboard: {
    portfolio: "Portafoglio",
    activeServices: "Servizi Attivi",
    newAllocation: "Nuova Allocazione",
    noServices: "Nessun piano di investimento attivo trovato.",
    balance: "Saldo Attuale",
    withdraw: "Prelievo",
    liquidity: "Liquidità",
    requestWithdraw: "Richiedi Prelievo",
    selectAccount: "Seleziona Conto",
    amount: "Importo (USD)",
    iban: "IBAN / Dati Bancari",
    btnWithdraw: "INVIA RICHIESTA DI PRELIEVO",
    profile: "Gestione Profilo",
    settings: "Impostazioni",
    firstName: "Nome",
    lastName: "Cognome",
    saveChanges: "SALVA MODIFICHE",
    verifiedAccount: "Account Verificato",
    accountStandard: "Account Standard",
    withdrawal: {
      gateTitle: "Verifica dell'identità richiesta",
      gateWhy: "Per proteggere i tuoi fondi e rispettare le normative, la verifica dell'identità (KYC) è obbligatoria prima di richiedere un prelievo. Puoi operare liberamente senza di essa.",
      gateRejectedDesc: "La tua precedente richiesta non è stata accettata. Controlla il motivo qui sotto e invia di nuovo i documenti.",
      gateUnderReview: "I tuoi documenti sono in revisione. Ti avviseremo via email quando ci sarà una decisione. Fino ad allora non puoi richiedere prelievi.",
      kycStatusLabel: "Stato della verifica",
      statusPending: "Non inviato",
      statusSubmitted: "In revisione",
      statusApproved: "Approvato",
      statusRejected: "Rifiutato",
      rejectedReason: "Motivo",
      continueToForm: "Continua al prelievo",
      submitDocs: "Invia documenti",
      resubmit: "Invia di nuovo i documenti",
      uploadFront: "Documento d'identità (fronte)",
      uploadBack: "Documento d'identità (retro)",
      uploadSelfie: "Selfie con il documento",
      chooseFile: "Scegli file",
      fileHint: "JPG, PNG o PDF, fino a 10 MB",
      selfieHint: "Foto nitida del viso con il documento",
      optional: "Opzionale",
      frontRequired: "Allega il fronte del documento d'identità.",
      fileTooLarge: "Il file supera i 10 MB.",
      uploadError: "Impossibile inviare i documenti. Riprova.",
      documentsSubmitted: "Documenti inviati. Li esamineremo a breve.",
    },
    totalAUM: "Totale Asset in Gestione",
    activeAlgos: "Algoritmi Attivi",
    systemStatus: "Stato del Sistema",
    operational: "Operativo",
    infraProtection: "Protezione Infrastruttura",
    twoFactor: "Autenticazione a Due Fattori",
    notEnabled: "Non Attivata",
    enable2FA: "Attiva 2FA",
    kycStatus: "Verifica KYC",
    verified: "Verificato",
    viewDocs: "Vedi Documenti",
    investor: "Investitore",
    kycRequired: "Verifica KYC Richiesta",
    kycRequiredDesc: "Completa la verifica d'identità per accedere a tutte le funzionalità della piattaforma. Questo è obbligatorio per tutti gli account che gestiscono capitale.",
    kycUnderReview: "KYC in revisione",
    kycUnderReviewDesc: "I tuoi documenti sono in fase di revisione da parte del nostro team di conformità. Questo richiede generalmente 24-48 ore.",
    kycRejected: "Verifica KYC Rifiutata",
    kycRejectedDesc: "I tuoi documenti non sono stati accettati. Per favore, invia nuovamente con documentazione valida.",
    resubmitDocs: "Reinvia Documenti",
    completeVerification: "Completa Verifica",
    verificationRequired: "Verifica Richiesta",
    goToVerification: "Vai alla Verifica",
    totalProfit: "Profitto Totale",
    drawdown: "Drawdown",
    maxDrawdown: "Drawdown Massimo",
    assetsInOperation: "Asset in Operazione",
    monthlyReturns: "Rendimenti Mensili",
    analytics: "Analisi",
    newWithdrawalRequest: "Nuova Richiesta di Prelievo",
    walletIban: "Wallet / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Bonifico bancario (SWIFT)"
    },
    transactionHistory: "Storico Transazioni",
    operations: "Operazioni",
    asset: "Asset",
    type: "Tipo",
    entry: "Ingresso",
    exit: "Uscita",
    profit: "Profitto",
    time: "Ora",
    status: "Stato",
    open: "Aperto",
    closed: "Chiuso",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Indirizzo wallet crypto o IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "Inserisci il codice a 6 cifre",
    minPasswordPlaceholder: "Minimo 8 caratteri",
    confirmPasswordPlaceholder: "Reinserisci la nuova password",
    accountNotFound: "Account non trovato. Per favore, crea prima un account.",
    loginSuccess: "Accesso riuscito!",
    rememberMe: "Ricordami",
    navPerformance: "Prestazioni",
    navAuditLog: "Registro Audit",
    tabProfile: "Profilo",
    tabKycVerification: "Verifica KYC",
    tabSecurity: "Sicurezza",
    kycCompleteDesc: "Completa la verifica KYC per accedere a tutte le funzionalità della piattaforma. Questo è un requisito di conformità obbligatorio per tutti gli account.",
    kyc: {
      approved: "Verifica Approvata",
      underReview: "Documenti in Revisione",
      rejected: "Verifica Rifiutata",
      required: "Verifica Richiesta",
      descApproved: "La tua identità è stata verificata. Tutte le funzionalità sono sbloccate.",
      descSubmitted: "Il nostro team di conformità sta esaminando i tuoi documenti. Di solito richiede 24-48 ore.",
      descRejected: "I tuoi documenti non sono stati accettati. Si prega di reinviarli con documentazione valida.",
      descRequired: "Completa la verifica dell'identità per sbloccare tutte le funzionalità della piattaforma.",
      stepCountry: "Paese",
      stepMethod: "Metodo",
      stepDocument: "Documento",
      stepReview: "Revisione",
      selectCountry: "Seleziona il Tuo Paese",
      selectCountryDesc: "Scegli il paese che ha rilasciato il tuo documento d'identità.",
      selectCountryPlaceholder: "Seleziona un paese...",
      selectMethod: "Seleziona il Metodo di Verifica",
      selectMethodDesc: "Scegli come vuoi verificare la tua identità per {{country}}.",
      uploadDocument: "Carica il Tuo Documento",
      uploadDocumentDesc: "Seleziona e carica un documento valido tra le opzioni seguenti.",
      clickToUpload: "Clicca per caricare o trascina e rilascia",
      submitting: "Invio in corso...",
      submitForVerification: "Invia per Verifica",
      progressTitle: "Avanzamento Verifica",
      stepEmailVerification: "Verifica Email",
      stepIdentityDocument: "Documento d'Identità",
      stepComplianceReview: "Revisione di Conformità",
      stepAccountActivation: "Attivazione Account",
      statusInProgress: "In Corso",
      statusComplete: "Completato",
      statusPending: "In Attesa",
      changePassword: "Cambia Password",
      updateCredentials: "Aggiorna le tue credenziali",
      newPassword: "Nuova Password",
      confirmNewPassword: "Conferma Nuova Password",
      emailVerification: "Verifica Email",
      verified: "Verificato",
      verifiedEmail: "Email Verificata",
      securityActivityLog: "Registro Attività di Sicurezza",
      scanAuthenticator: "Scansiona con la tua app di autenticazione",
      eventLoginNewDevice: "Accesso da nuovo dispositivo",
      eventPasswordChanged: "Password modificata",
      eventAccountCreated: "Account creato",
      timeHoursAgo: "{{count}} ore fa",
      timeDaysAgo: "{{count}} giorni fa"
    },
    newEmailLabel: "Nuovo indirizzo email",
    sendConfirmationLink: "Invia link di conferma",
    identityVerified: "La tua identità è stata verificata! Tutte le funzioni sono ora disponibili.",
    verificationRejected: "La tua verifica è stata rifiutata. Invia di nuovo i documenti.",
    profileUpdated: "Profilo aggiornato con successo.",
    failedUpdateProfile: "Aggiornamento del profilo non riuscito.",
    differentEmail: "Inserisci un indirizzo email diverso.",
    confirmationLinkSent: "Un link di conferma è stato inviato al nuovo indirizzo email. Verifica per completare la modifica.",
    failedEmail: "Aggiornamento email non riuscito.",
    passwordsDoNotMatch: "Le password non corrispondono.",
    passwordTooShort: "La password deve contenere almeno 8 caratteri.",
    passwordChanged: "Password modificata con successo.",
    failedPassword: "Modifica della password non riuscita.",
    uploadDocument: "Carica un documento.",
    completeSteps: "Completa tutti i passaggi di verifica.",
    documentsSubmitted: "Documenti inviati per la verifica. Riceverai una notifica dopo la revisione.",
    failedDocuments: "Invio dei documenti non riuscito.",
    performanceTitle: "Dashboard delle prestazioni",
    auditLogTitle: "Registro di audit",
    auditLogDesc: "Tutti gli ordini algoritmici eseguiti sul tuo account.",
    accountSettingsTitle: "Impostazioni account",
    personalInformation: "Informazioni personali",
    emailAddress: "Indirizzo email",
    emailChangeNotice: "La modifica dell’email richiede una verifica. Un link di conferma verrà inviato al nuovo indirizzo email.",
    currentEmail: "Email attuale",
    confirmationSent: "Conferma inviata",
    tryDifferentEmail: "Prova un’altra email",
    continueToMethod: "Continua alla selezione del metodo",
    uploadHint: "PNG, JPG, PDF fino a 10MB",
    twoFactorDesc: "Aggiungi un ulteriore livello di sicurezza al tuo account. Usa un’app di autenticazione come Google Authenticator o Authy.",
    qrCode: "Codice QR",
    kycRequiredBanner: "KYC richiesto",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Rete",
    emailChangeInboxNotice: "Controlla la tua casella di posta e clicca sul link per completare la modifica dell’email.",
    emailChangeSentTo: "Un link di conferma è stato inviato a {{email}}. Controlla la tua casella di posta e clicca sul link per completare la modifica dell’email.",
    growthPerformanceMtd: "Performance di crescita (mese corrente)"
  },
  checkout: {
    summary: "RIEPILOGO",
    allocationTitle: "Allocazione",
    allocationSubtitle: "Istituzionale",
    tierLabel: "Livello Infrastruttura Algoritmica",
    billedMonthly: "Fatturato Mensilmente",
    detailsTitle: "Dettagli Allocazione",
    managedCapital: "Capitale Gestito",
    setupFee: "Costo di Configurazione",
    waived: "ESENTE",
    latency: "Latenza di Esecuzione",
    infrastructureTitle: "Infrastruttura Inclusa",
    realTimeMonitoring: "Monitoraggio in Tempo Reale",
    activeUponDeployment: "Attivo dopo l'implementazione",
    totalDue: "Totale Dovuto",
    dedicatedNode: "Nodo Dedicato",
    globalMarkets: "Mercati Globali",
    instantSetup: "Configurazione Istantanea",
    authRequired: "AUTENTICAZIONE RICHIESTA",
    authDesc: "Effettua il login o crea un account per procedere con l'allocazione.",
    btnLogin: "ACCEDI PER PROCEDERE",
    btnRegister: "CREA ACCOUNT",
    confirmDeployment: "Conferma Implementazione",
    deploymentDesc: "Confermando, autorizzi l'implementazione dell'infrastruttura algoritmica associata al piano {{plan}}.",
    proceedPayment: "PROCEDI AL PAGAMENTO SICURO",
    secureGateway: "Gateway Sicuro",
    back: "Indietro",
    riskDisclosure: "Divulgazione del Rischio: Il trading algoritmico comporta un rischio sostanziale di perdita. Le performance passate non sono indicative dei risultati futuri.",
    secureTransaction: "Transazione Sicura",
    paypalNote: "Le informazioni di pagamento sono elaborate in sicurezza da PayPal. Braxel Markets non archivia i dati della carta.",
    encryptionNote: "Crittografato con Standard Istituzionali AES-256",
    verifying: "Verifica della Transazione Istituzionale...",
    loading: "Caricamento Terminale...",
    globalInfra: "Infrastruttura di Pagamento Globale",
    qrCode: "Codice QR",
    allCards: "Tutte le Carte",
    selectPaymentMethod: "Seleziona metodo di pagamento",
    choosePayment: "Scegli come vuoi pagare",
    creditCard: "Carta di credito",
    instantPayment: "Pagamento istantaneo",
    cardDesc: "Visa, Mastercard e altre carte",
    crypto: "Criptovaluta",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Trasferimento cripto veloce e sicuro",
    securePayment: "Pagamento Sicuro",
    cardNumber: "Numero della carta",
    cardName: "Nome sulla carta",
    cardExpiry: "Scadenza",
    payNow: "PAGA ORA",
    amountToPay: "Importo da Pagare",
    selectNetwork: "Seleziona Rete",
    yourAddress: "Indirizzo di Deposito",
    yourAddressPlaceholder: "Inserisci il tuo indirizzo USDT",
    important: "IMPORTANTE",
    cryptoNote: "Invia l'importo esatto per ricevere il piano",
    sendExactAmount: "Invia ESATTAMENTE questo importo per evitare ritardi",
    confirmCrypto: "CONFERMA CON CRYPTO",
    copied: "Copiato!",
    cryptoPending: "Pagamento registrato! In attesa di conferma.",
    processing: "Elaborazione...",
    paymentSuccess: "Pagamento approvato!",
    selectCountry: "Seleziona paese",
    searchCountry: "Cerca paese...",
    phone: "Numero di telefono",
    fillAllFields: "Compila tutti i campi",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "NOME COMPLETO",
    cardExpiryPlaceholder: "MM/AA",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Pagamento fallito",
    paymentError: "Errore di pagamento",
    amountToSend: "Importo da Inviare",
    paymentReference: "Includi la tua email come riferimento del pagamento",
    wiseTransfer: "Bonifico Bancario",
    bankDetails: "Dati Bancari",
    accountHolder: "Titolare del Conto",
    accountNumber: "Numero di Conto",
    bankName: "Nome della Banca",
    bankAddress: "Indirizzo della Banca",
    routingNumber: "Numero di Routing",
    confirmWise: "CONFERMA TRANSFER",
    wiseDesc: "Trasferisci direttamente al nostro conto bancario via Wise",
    wiseNote: "Dopo aver effettuato il trasferimento, clicca conferma qui sotto. Il tuo account sarà attivato dopo la verifica (1-3 giorni lavorativi).",
    wiseInternational: "Bonifico Internazionale",
    openWise: "Apri Sito Wise",
    transferInstructions: "Istruzioni di Trasferimento",
    lowFees: "Commissioni Basse",
    noKyc: "KYC Richiesto",
    anyCountry: "Qualsiasi Paese",
    wiseConfirmRequired: "Si prega di confermare di aver effettuato il trasferimento",
    wiseConfirmText: "Ho effettuato il bonifico bancario e confermo che l'importo inviato corrisponde al prezzo del piano.",
    wisePaymentSuccess: "Pagamento confermato! Il tuo account è in configurazione.",
    wiseStep1: "Copia i dati bancari qui sotto",
    wiseStep2: "Effettua un bonifico dalla tua banca o dal conto Wise",
    wiseStep3: "Clicca su conferma dopo aver effettuato il bonifico",
    subscriptionTitle: "ABBONAMENTO",
    subscriptionSubtitle: "PIANO DI SERVIZIO",
    serviceAccess: "Accesso al servizio",
    confirmCard: "CONFERMA CARTA",
    redirecting: "Reindirizzamento al pagamento...",
    card: "Carta di credito / debito",
    testModeBanner: "MODALITÀ TEST — Niente denaro reale. Nessuna banca reale. Nessun wallet reale. Nessuna attivazione reale.",
    startFailed: "Impossibile avviare il pagamento. Riprova.",
    notConfigured: "I pagamenti non sono ancora completamente configurati. Prova un altro metodo o contatta l'assistenza.",
    invalidPlanTitle: "PIANO NON VALIDO",
    invalidPlanDesc: "Il piano selezionato non è più disponibile. Scegli di nuovo un piano.",
    swiftLabel: "SWIFT",
    referenceLabel: "Riferimento",
  },
  legal: {
    badgeLegal: "LEGALE",
    termsTitle: "TERMINI DI SERVIZIO"
  },
  faq: {
    title: "DOMANDE FREQUENTI",
    badge: "DOMANDE FREQUENTI",
    q1: "È necessaria esperienza pregressa?",
    a1: "No. La nostra infrastruttura è completamente automatizzata. Devi solo selezionare il livello di allocazione e monitorare le performance tramite il terminale.",
    q2: "Quali sono i rischi coinvolti?",
    a2: "Come in qualsiasi mercato finanziario, esistono rischi di perdita di capitale dovuti alla volatilità. Utilizziamo protocolli avanzati di mitigazione per proteggere il capitale.",
    q3: "Come funziona il sistema?",
    a3: "I nostri algoritmi proprietari eseguono strategie quantitative ad alta frequenza sui mercati globali con precisione di millisecondi.",
    q4: "Posso cancellare il mio piano?",
    a4: "Sì. Puoi richiedere la cancellazione e il prelievo del capitale in qualsiasi momento tramite i protocolli del pannello."
  },
  diffs: {
    title: "PERCHÉ BRAXEL MARKETS?",
    badge: "DIFFERENZIALI",
    t1: "Tecnologia Proprietaria",
    d1: "Reti neurali progettate per esecuzione di livello istituzionale.",
    t2: "Automazione Totale",
    d2: "Gestione algoritmica 24/7 senza bias emotivo umano.",
    t3: "Accesso Semplificato",
    d3: "Infrastruttura istituzionale accessibile tramite terminale intuitivo.",
    t4: "Livello Professionale",
    d4: "Connessione diretta a pool di liquidità globali con latenza ultra-bassa."
  },
  signals: {
    title: "ESECUZIONE",
    subtitle: "ALGORITMICA",
    badge: "TERMINALE IN TEMPO REALE",
    desc: "Monitora la nostra infrastruttura proprietaria in tempo reale. Ogni segnale è elaborato dalle nostre reti neurali con precisione di millisecondi.",
    asset: "ASSET",
    type: "TIPO",
    entry: "INGRESSO",
    profit: "PROFITTO",
    status: "STATO",
    active: "ATTIVO",
    completed: "COMPLETATO",
    institutionalVerification: "Verifica istituzionale",
    realtimeFeed: "Feed dati in tempo reale dai pool di liquidità globali.",
    liveTerminal: "TERMINALE LIVE",
    connected: "CONNESSO"
  },
  application: {
    title: "DOMANDA",
    subtitle: "INVIO",
    plan_selected: "Piano Selezionato",
    billed_monthly: "Fatturato mensilmente",
    plan_description: "Stai per acquistare l'abbonamento al servizio {{plan}}.",
    plan_price_detail: "Quota mensile: {{price}} (pagata mensilmente)",
    full_name: "Nome Completo",
    full_name_placeholder: "Inserisci il tuo nome completo",
    email: "Indirizzo Email",
    email_placeholder: "Inserisci la tua email",
    address_line1: "Indirizzo — Riga 1",
    address_line1_placeholder: "Via e numero civico",
    address_line2: "Interno / Altro",
    address_line2_placeholder: "Appartamento, scala, unità, ecc. (opzionale)",
    city: "Città",
    city_placeholder: "Città",
    region: "Provincia / Regione",
    region_placeholder: "Provincia o regione",
    postal_code: "CAP",
    postal_code_placeholder: "CAP",
    country: "Paese",
    country_placeholder: "Paese",
    phone: "Telefono",
    phone_placeholder: "Numero di telefono",
    terms_accepted: "Accetto i Termini di Servizio",
    privacy_accepted: "Accetto l'Informativa sulla Privacy",
    viewTerms: "Vedi Termini",
    viewPrivacy: "Vedi Informativa sulla Privacy",
    customer_note: "Nota del Cliente (opzionale)",
    customer_note_placeholder: "Qualsiasi informazione aggiuntiva che desideri farci sapere",
    note_limit: "Massimo {{count}} caratteri",
    characters: "caratteri",
    submitting: "Invio in corso...",
    submit: "INVIA DOMANDA",
    errors: {
      full_name_required: "Il nome completo è obbligatorio",
      email_required: "L'email è obbligatoria",
      email_invalid: "Indirizzo email non valido",
      address_line1_required: "L'indirizzo è obbligatorio",
      city_required: "La città è obbligatoria",
      country_required: "Il paese è obbligatorio",
      terms_required: "Devi accettare i Termini di Servizio",
      privacy_required: "Devi accettare l'Informativa sulla Privacy",
      note_too_long: "La nota deve contenere al massimo 500 caratteri",
      submit_failed: "Invio non riuscito. Riprova."
    }
  },
  checkoutSuccess: {
    verifying: "Verifica del pagamento…",
    backToPricing: "Torna ai piani",
    couldNotVerify: "Non è ancora stato possibile verificare il tuo pagamento",
    couldNotVerifyDesc: "Se hai completato il checkout, non preoccuparti: il pagamento è in elaborazione e il tuo account verrà attivato a breve. Ricarica questa pagina tra poco.",
    verifiedBadge: "Verificato",
    paymentCompleted: "Pagamento completato",
    activationNotice: "Il tuo account verrà attivato entro pochi minuti.",
    paymentId: "ID Pagamento",
    applicationId: "ID Domanda",
    securityNotice: "Per la tua sicurezza, gli account vengono attivati manualmente da un operatore dopo la verifica del pagamento. Riceverai l'accesso appena la revisione sarà completata.",
    goToDashboard: "Vai al pannello",
    contactSupport: "Contatta il supporto",
    verifyingBadge: "Verifica in corso",
    paymentReceived: "Pagamento ricevuto. Stiamo verificando il pagamento.",
    beingVerified: "Il tuo pagamento è in fase di verifica. Questa pagina si aggiornerà automaticamente una volta confermato il pagamento. Non chiudere questa finestra.",
    currentStatus: "Stato attuale",
    urlSecurityNotice: "Per la tua sicurezza, questa pagina non segna un pagamento come completato in base al solo URL. Attendiamo la conferma lato server."
  },
  termsPage: {
    title: "Termini di servizio",
    entityTitle: "Entità contraente",
    entityText: "[Ragione Sociale, Numero di Registrazione, Giurisdizione]",
    descriptionTitle: "Descrizione del servizio",
    descriptionText: "Braxel Markets fornisce infrastruttura di trading algoritmico di livello istituzionale e servizi correlati tramite la sua piattaforma.",
    feesTitle: "Commissioni e pagamenti",
    feesText: "Le commissioni per i nostri servizi sono indicate nella pagina dei prezzi e sono soggette a modifiche con preavviso. I metodi di pagamento includono bonifico bancario, carta di credito e criptovaluta.",
    eligibilityTitle: "Idoneità",
    eligibilityText: "I nostri servizi sono disponibili per persone fisiche e giuridiche di almeno 18 anni che rispettano i nostri requisiti Know Your Customer (KYC) e antiriciclaggio (AML).",
    accountTerminationTitle: "Chiusura dell’account",
    accountTerminationText: "Ciascuna parte può chiudere l’account con preavviso scritto di [PLACEHOLDER: periodo di preavviso, es. 30 giorni]. Braxel Markets può chiudere immediatamente in caso di violazione dei termini, attività illegale o requisiti normativi.",
    limitationOfLiabilityTitle: "Limitazione di responsabilità",
    limitationOfLiabilityText: "Nella misura massima consentita dalla legge, Braxel Markets non sarà responsabile per eventuali danni indiretti, incidentali, speciali, consequenziali o punitivi, né per qualsiasi perdita di dati, uso, avviamento o altre perdite immateriali derivanti dall’accesso o dall’uso dei nostri servizi.",
    disputeResolutionTitle: "Risoluzione delle controversie e legge applicabile",
    disputeResolutionText: "I presenti Termini sono regolati e interpretati in conformità con le leggi di [PLACEHOLDER: giurisdizione]. Qualsiasi controversia derivante o connessa ai presenti Termini sarà sottoposta alla giurisdizione esclusiva dei tribunali di [PLACEHOLDER: giurisdizione].",
    changesToTermsTitle: "Modifiche ai presenti Termini",
    changesToTermsText: "Ci riserviamo il diritto di modificare o sostituire i presenti Termini in qualsiasi momento. Se una revisione è sostanziale, forniremo un preavviso di almeno [PLACEHOLDER: periodo di preavviso, es. 30 giorni] prima dell’entrata in vigore dei nuovi termini. Ciò che costituisce una modifica sostanziale sarà determinato a nostra esclusiva discrezione.",
    effectiveDateTitle: "Data di entrata in vigore",
    effectiveDateText: "Data di entrata in vigore: [PLACEHOLDER: data]",
    contactTitle: "Contatti",
    contactText: "Per domande sui presenti Termini, contattaci all’indirizzo [PLACEHOLDER: email o indirizzo di contatto]."
  },
  legalDraftBanner: "Questa pagina è una bozza in revisione legale e non è ancora definitiva.",
  notFound: {
    title: "404",
    message: "Spiacenti, la pagina che stai cercando non esiste.",
    returnHome: "Torna alla home"
  },
  authCallback: {
    confirmingTitle: "Conferma del tuo account...",
    confirmingDesc: "Attendi mentre verifichiamo la tua email.",
    confirmedTitle: "Email confermata!",
    confirmedDesc: "Il tuo account è stato verificato con successo.",
    redirecting: "Reindirizzamento al login...",
    failedTitle: "Conferma non riuscita",
    goToLogin: "Vai al login",
    invalidLink: "Link di conferma non valido o scaduto",
    failedConfirm: "Conferma email non riuscita"
  },
  paymentsDisabled: {
    title: "I pagamenti sono attualmente disabilitati.",
    desc: "Il sistema di pagamento non è ancora attivo. Per abilitare i pagamenti, contatta l’operatore all’indirizzo",
    managedBy: "L’elaborazione dei pagamenti è gestita esclusivamente dall’operatore della piattaforma. Se hai domande su un’allocazione in sospeso, contatta l’assistenza.",
    viewPlans: "Vedi i piani di investimento"
  },
  checkoutStatus: {
    created: "Creato",
    pending: "In attesa di pagamento",
    processing: "Verifica on-chain",
    confirmed: "Confermato",
    failed: "Non riuscito",
    rejected: "Rifiutato",
    refunded: "Rimborsato",
    disputed: "Contestato",
    canceled: "Annullato",
    pending_manual: "In attesa di revisione manuale"
  },
  legalReview: {
    title: "Bozza in revisione legale"
  },
  operator: {
    title: "Operatore",
    subtitle: "Dashboard",
    description: "Esamina e attiva le richieste dei clienti in sospeso.",
    no_pending_applications: "Nessuna richiesta in sospeso.",
    plan: "Piano",
    amount: "Importo",
    country: "Paese",
    customer_note: "Nota del cliente",
    activate_account: "Attiva account",
    activating: "Attivazione...",
    reject_or_request_info: "Rifiuta / richiedi informazioni",
    rejecting: "Rifiuto...",
    reject_application: "Rifiuta richiesta",
    reject_reason_prompt: "Indica il motivo del rifiuto o le informazioni necessarie.",
    reject_reason_placeholder: "Motivo...",
    cancel: "Annulla",
    reject: "Rifiuta",
    errors: {
      activation_failed: "Attivazione della richiesta non riuscita.",
      rejection_failed: "Rifiuto della richiesta non riuscito."
    },
    status: {
      activation_pending: "Attivazione in sospeso",
      account_active: "Account attivo",
      rejected: "Rifiutato",
      manual_review: "Revisione manuale"
    }
  },
  profitCalculator: {
    badge: "PROIEZIONE",
    titleA: "CALCOLATORE",
    titleB: "DI PROFITTO",
    initialAllocation: "Allocazione iniziale",
    monthlyProfit: "Profitto mensile stimato",
    annualProfit: "Profitto annuale stimato",
    riskTitle: "Gestione del rischio",
    riskDesc: "Proiezioni basate sulle prestazioni algoritmiche storiche con rigorosi limiti di drawdown.",
    instantTitle: "Implementazione immediata",
    instantDesc: "Il tuo capitale inizia a lavorare pochi minuti dopo l’integrazione dell’infrastruttura.",
    disclaimer: "* Avvertenza: I risultati passati non garantiscono quelli futuri. Le proiezioni sono solo a scopo illustrativo."
  },
  meta: {
    home: {
      title: "Braxel Markets | Gestione algoritmica del capitale istituzionale",
      description: "Infrastruttura di trading algoritmico di livello istituzionale, accesso al capitale di prop firm, autorizzazione CopyTrade e automazione completa di MetaTrader per XAU/USD e US500."
    },
    pricing: {
      title: "Piani e capitale gestito | Braxel Markets",
      description: "Confronta i piani di trading algoritmico e le allocazioni di capitale gestito. Il capitale gestito è sempre quotato in USD."
    },
    about: {
      title: "Chi è Braxel Markets | Trading algoritmico",
      description: "Braxel Markets sviluppa infrastruttura di trading algoritmico di livello istituzionale e gestisce capitale con rigorosi controlli del rischio."
    },
    howItWorks: {
      title: "Come funziona | Braxel Markets",
      description: "Scopri come Braxel Markets collega il tuo capitale a strategie MetaTrader completamente automatizzate per XAU/USD e US500."
    },
    contact: {
      title: "Contatti | Braxel Markets",
      description: "Contatta il team di Braxel Markets per infrastruttura di trading algoritmico e capitale gestito."
    },
    terms: {
      title: "Termini di servizio | Braxel Markets",
      description: "Leggi i Termini di servizio per utilizzare Braxel Markets."
    },
    privacy: {
      title: "Informativa sulla privacy | Braxel Markets",
      description: "Scopri come Braxel Markets raccoglie, utilizza e protegge i tuoi dati personali."
    },
    disclaimer: {
      title: "Informativa sui rischi | Braxel Markets",
      description: "Importante informativa sui rischi per il trading algoritmico e il capitale gestito con Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brasile",
      US: "Stati Uniti",
      GB: "Regno Unito",
      DE: "Germania",
      FR: "Francia",
      ES: "Spagna",
      IT: "Italia",
      PT: "Portogallo",
      RU: "Russia",
      CN: "Cina",
      JP: "Giappone",
      IN: "India",
      OTHER: "Altri Paesi"
    },
    method: {
      BR: {
        id_card: "Carta d’identità nazionale (RG/CPF)",
        drivers_license: "Patente di guida"
      },
      US: {
        id_card: "Carta d’identità statale"
      },
      GB: {
        id_card: "Documento nazionale / Patente di guida",
        biometric: "Permesso di soggiorno biometrico"
      },
      DE: {
        drivers: "Patente di guida",
        passport: "Passaporto / Reisepass"
      },
      FR: {
        residence: "Permesso di soggiorno"
      },
      RU: {
        foreign_passport: "Passaporto straniero"
      },
      OTHER: {
        passport: "Passaporto internazionale",
        national_id: "Carta d’identità nazionale"
      }
    },
    doc: {
      rg: {
        desc: "Documento d’identità nazionale brasiliano"
      },
      cpf: {
        desc: "Tessera del contribuente brasiliano (CPF)"
      },
      passport: {
        desc: "Passaporto valido con pagina fotografica",
        name: "Passaporto"
      },
      cnh: {
        desc: "Patente di guida brasiliana",
        name: "CNH (Patente di guida)"
      },
      state_id: {
        desc: "Patente di guida o documento rilasciato dallo Stato",
        name: "Carta d’identità statale"
      },
      passport_uk: {
        desc: "Passaporto britannico valido"
      },
      driving_license_uk: {
        desc: "Patente di guida britannica",
        name: "Patente di guida"
      },
      brp: {
        desc: "Permesso di soggiorno biometrico britannico",
        name: "Permesso di soggiorno biometrico"
      },
      personalausweis: {
        desc: "Carta d’identità tedesca"
      },
      passport_de: {
        desc: "Passaporto tedesco valido"
      },
      fuehrerschein: {
        desc: "Patente di guida tedesca"
      },
      cni: {
        desc: "Carta d’identità nazionale francese"
      },
      passport_fr: {
        desc: "Passaporto francese valido"
      },
      titre_sejour: {
        desc: "Permesso di soggiorno francese"
      },
      dni: {
        desc: "Documento d’identità nazionale spagnolo"
      },
      nie: {
        desc: "Numero di identificazione per stranieri"
      },
      passport_es: {
        desc: "Passaporto valido"
      },
      carta_id: {
        desc: "Carta d’identità italiana"
      },
      passport_it: {
        desc: "Passaporto italiano valido"
      },
      cc: {
        desc: "Carta d’identità portoghese"
      },
      passport_pt: {
        desc: "Passaporto portoghese valido"
      },
      passport_ru: {
        desc: "Passaporto interno russo"
      },
      foreign_passport_ru: {
        desc: "Passaporto russo per l’estero",
        name: "Passaporto straniero"
      },
      id_card_cn: {
        desc: "Carta d’identità cinese"
      },
      passport_cn: {
        desc: "Passaporto valido"
      },
      passport_jp: {
        desc: "Passaporto giapponese valido"
      },
      zairyu: {
        desc: "Carta di soggiorno"
      },
      aadhaar: {
        desc: "Carta di identificazione unica",
        name: "Carta Aadhaar"
      },
      voter_id: {
        desc: "Tessera elettorale con foto",
        name: "Tessera elettorale"
      },
      passport_in: {
        desc: "Passaporto indiano valido"
      },
      passport_intl: {
        desc: "Passaporto valido del tuo Paese"
      },
      national_id_intl: {
        desc: "Documento d’identità nazionale rilasciato dal governo",
        name: "Carta d’identità nazionale"
      }
    },
    methodName: {
      id_card: "Carta d’identità nazionale",
      passport: "Passaporto",
      drivers_license: "Patente di guida",
      drivers: "Patente di guida",
      biometric: "Permesso di soggiorno biometrico",
      residence: "Permesso di soggiorno",
      foreign_passport: "Passaporto straniero",
      national_id: "Carta d’identità nazionale"
    }
  },
  errorBoundary: {
    title: "Qualcosa è andato storto",
    message: "Non è stato possibile caricare questa pagina. Riprova.",
    retry: "Ricarica pagina",
    home: "Torna alla home"
  }
};

const esTranslation = {
  disclaimerPage: {
    title: "Aviso financiero",
    risk: "Riesgo",
    importantRiskTitle: "Advertencia importante de riesgo",
    importantRiskText: "La inversión en los mercados financieros conlleva riesgos sustanciales y puede provocar la pérdida total del capital invertido. El rendimiento pasado no garantiza resultados futuros.",
    noAdviceTitle: "No constituye asesoramiento",
    noAdviceText: "El contenido de este sitio y los servicios prestados por Braxel Markets no constituyen asesoramiento financiero, legal o fiscal. Recomendamos que cada inversor busque asesoramiento profesional independiente antes de tomar decisiones de inversión.",
    limitationTitle: "Limitación de responsabilidad",
    limitationText: "Braxel Markets no es responsable de las pérdidas financieras derivadas del uso de nuestra tecnología de automatización o de las fluctuaciones del mercado.",
    capitalAtRiskTitle: "Capital en riesgo",
    capitalAtRiskText: "Tu capital está en riesgo al usar nuestros servicios. Puedes perder parte o la totalidad de tu inversión.",
    noGuaranteedReturnsTitle: "Sin rendimientos garantizados",
    noGuaranteedReturnsText: "No garantizamos ningún rendimiento ni beneficio. El rendimiento pasado no es indicativo de resultados futuros.",
    pastPerformanceTitle: "El rendimiento pasado no es indicativo",
    pastPerformanceText: "Cualquier rendimiento histórico mostrado es solo a título ilustrativo y no garantiza resultados futuros.",
    notLicensedTitle: "Estado regulatorio",
    notLicensedText: "Actualmente, Braxel Markets no está representada como una institución financiera autorizada o regulada en [PLACEHOLDER: jurisdicción]. Verifica el estado regulatorio aplicable a tu ubicación.",
    noCapitalProtectionTitle: "Sin garantía de protección del capital",
    noCapitalProtectionText: "No ofrecemos ninguna protección del capital ni garantía contra pérdidas.",
    algorithmicRisksTitle: "Riesgos de la negociación algorítmica/automatizada",
    algorithmicRisksText: "Las estrategias de negociación automatizadas y algorítmicas conllevan riesgos que incluyen, entre otros, fallos del sistema, problemas de conectividad, errores de modelo y condiciones de mercado inesperadas.",
    jurisdictionRestrictionsTitle: "Restricciones de jurisdicción",
    jurisdictionRestrictionsText: "Nuestros servicios pueden no estar disponibles en todas las jurisdicciones. Los usuarios son responsables de garantizar el cumplimiento de las leyes y regulaciones locales antes de usar nuestra plataforma."
  },
  privacyPage: {
    title: "Política de privacidad",
    privacy: "Privacidad",
    dataCollectionTitle: "Recopilación de datos",
    dataCollectionText: "Solo recopilamos la información necesaria para la prestación de nuestros servicios, incluidos nombre, correo y datos de transacciones. Tus datos están protegidos con cifrado AES-256.",
    useOfInfoTitle: "Uso de la información",
    useOfInfoText: "La información recopilada se utiliza exclusivamente para gestionar tu cuenta, procesar pagos y enviar informes semanales de rendimiento.",
    securityTitle: "Seguridad",
    securityText: "Implementamos rigurosas medidas de seguridad para proteger contra el acceso no autorizado, la alteración o la destrucción de tus datos personales.",
    legalBasisTitle: "Base legal del tratamiento",
    legalBasisText: "Nuestra base legal para el tratamiento de tus datos personales es [PLACEHOLDER: base legal, p. ej., consentimiento, interés legítimo, necesidad contractual].",
    retentionTitle: "Periodo de conservación de datos",
    retentionText: "Conservamos tus datos personales durante [PLACEHOLDER: periodo de conservación], salvo que la ley exija un periodo más largo.",
    thirdPartiesTitle: "Terceros y encargados",
    thirdPartiesText: "Podemos compartir tus datos con proveedores de servicios externos de confianza como [PLACEHOLDER: lista de encargados, p. ej., procesadores de pago, alojamiento en la nube, servicios de correo], exclusivamente para los fines descritos en esta política.",
    userRightsTitle: "Tus derechos",
    userRightsText: "En virtud de las leyes de protección de datos aplicables, como la LGPD (Brasil) y el RGPD (UE), tienes derecho a acceder, rectificar, suprimir y portar tus datos personales, así como a oponerte o restringir el tratamiento. Para ejercer estos derechos, contáctanos en [PLACEHOLDER: contacto para solicitudes de derechos].",
    cookiesTitle: "Cookies y tecnologías similares",
    cookiesText: "Nuestro sitio web utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido. Puedes gestionar tus preferencias de cookies en la configuración de tu navegador.",
    contactTitle: "Contacto y Delegado de Protección de Datos",
    contactText: "Para preguntas sobre esta Política de Privacidad o nuestras prácticas de datos, contacta con nuestro Delegado de Protección de Datos en [PLACEHOLDER: correo o contacto del DPO]."
  },
  contactEmail: {
    newSubmission: "Nuevo envío del formulario de contacto",
    name: "Nombre",
    email: "Correo electrónico",
    subject: "Asunto",
    message: "Mensaje",
    sentFrom: "Enviado desde"
  },
  nav: {
    pricing: "PLANES DE INVERSIÓN",
    howItWorks: "INFRAESTRUCTURA",
    about: "SOBRE NOSOTROS",
    contact: "SOPORTE INSTITUCIONAL",
    login: "ACCESO AL TERMINAL",
    support: "Soporte",
    openAccount: "CREAR CUENTA",
    dashboard: "PANEL",
    logout: "CERRAR SESIÓN",
    selectLanguage: "Seleccionar idioma",
    sessionActive: "Sesión activa",
    accessDashboard: "Acceder al panel"
  },
  footer: {
    desc: "Infraestructura de inversión de nivel institucional. Tecnología propietaria para el mercado moderno.",
    platform: "Plataforma",
    company: "Empresa",
    support: "Soporte Digital",
    rights: "Todos los derechos reservados.",
    privacy: "Privacidad",
    terms: "Términos",
    disclaimer: "Aviso Financiero",
    address: "Dirección Comercial",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, España",
    riskTitle: "AVISO DE RIESGO",
    riskText: "El trading en mercados financieros implica un riesgo sustancial de pérdida y no es apto para todos los inversores. El rendimiento pasado no es indicativo de resultados futuros. El valor de las inversiones puede disminuir o aumentar. No invierta dinero que no pueda permitirse perder. Braxel Markets no garantiza rendimientos específicos.",
    emailAria: "Correo electrónico",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Soporte Braxel",
    placeholder: "Escribe un mensaje...",
    emailSupport: "Correo:",
    assistantReply: "Gracias por tu mensaje. Nuestro equipo responderá en breve.",
    send: "Enviar",
    brandAI: "IA de Braxel Markets",
    openChat: "Abrir chat de soporte",
    close: "Cerrar",
    minimize: "Minimizar",
    maximize: "Maximizar",
    supportDialog: "Chat de soporte"
  },
  auth: {
    loginTitle: "Iniciar Sesión",
    loginSubtitle: "Ingrese sus credenciales de acceso.",
    registerTitle: "Crear Cuenta",
    registerSubtitle: "Comience su camino en el mercado institucional.",
    email: "Correo Electrónico",
    password: "Contraseña",
    fullName: "Nombre Completo",
    forgotPassword: "¿Olvidó su contraseña?",
    noAccount: "¿No tiene una cuenta?",
    hasAccount: "¿Ya tiene acceso?",
    btnAccess: "ACCEDER A LA CUENTA",
    btnCreate: "CREAR MI CUENTA",
    termsAgree: "Acepto los Términos y la Privacidad.",
    futureTitle: "El Futuro de la",
    futureSubtitle: "Inversión",
    features: [
      "Algoritmos de nivel institucional",
      "Protección avanzada del capital",
      "Ejecución en milisegundos",
      "Transparencia total"
    ],
    accessBadge: "Acceso institucional",
    emailPlaceholder: "Introduce tu correo",
    fullNamePlaceholder: "Introduce tu nombre completo",
    loginLink: "Iniciar Sesión",
    loginSideDescription: "Acceda a su terminal institucional.",
    loginSideFooter: "Seguridad de nivel institucional",
    loginErrorMessage: "Credenciales inválidas. Inténtelo de nuevo.",
    registerErrorMessage: "Error en el registro. Inténtelo de nuevo.",
    registerSuccessMessage: "¡Cuenta creada con éxito!",
    registerSideFooter: "Protegido por seguridad institucional",
    welcomeBackTitle: "Bienvenido de Nuevo",
    welcomeBackHighlight: "Terminal Institucional",
    accountNotFound: "Cuenta no encontrada. Cree una cuenta primero.",
    rememberMe: "Recordarme",
    registerLink: "Crear cuenta",
    passwordPlaceholder: "Contraseña",
    accountNotFoundError: "Cuenta no encontrada. Crea una cuenta primero.",
    resetPasswordSent: "Si existe una cuenta para ese correo, se ha enviado un enlace de restablecimiento de contraseña.",
    resetPasswordError: "No se pudo enviar el enlace de restablecimiento. Inténtalo de nuevo.",
    enterEmailFirst: "Introduce primero tu dirección de correo."
  },
  hero: {
    title1: "GESTIÓN ALGORÍTMICA",
    title2: "DE CAPITAL DE ÉLITE",
    desc: "Implemente estrategias cuantitativas de nivel institucional diseñadas para el mercado moderno. Experimente precisión de ejecución en milisegundos y protocolos avanzados de mitigación de riesgo.",
    getStarted: "EXPLORAR PLANES DE INVERSIÓN",
    viewStrategies: "METODOLOGÍA TÉCNICA"
  },
  stats: {
    volume: "Gestión Estratégica de Capital",
    traders: "Cuentas Activas",
    uptime: "Uptime de Infraestructura",
    latency: "Precisión de Ejecución"
  },
  methodology: {
    badge: "METODOLOGÍA",
    title: "MODELOS CUANTITATIVOS",
    statArb: {
      title: "ARBITRAJE ESTADÍSTICO",
      desc: "Explotación de ineficiencias temporales de precio entre activos correlacionados utilizando modelos de cointegración y pair trading.",
      f1: "Análisis de Cointegración",
      f2: "Algoritmos de Selección de Pares",
      f3: "Umbral Z-Score"
    },
    meanRev: {
      title: "REVERSIÓN A LA MEDIA",
      desc: "Identificación de desviaciones de precio respecto a promedios históricos, con reglas sistemáticas de entrada y salida.",
      f1: "Señales de Bandas de Bollinger",
      f2: "Detección de Divergencia RSI",
      f3: "Modelos Ornstein-Uhlenbeck"
    },
    hft: {
      title: "TRADING DE ALTA FRECUENCIA",
      desc: "Estrategias de ejecución de latencia ultra-baja con infraestructura co-localizada para órdenes a nivel de microsegundos.",
      f1: "Microestructura de Mercado",
      f2: "Análisis de Flujo de Órdenes",
      f3: "Arbitraje de Latencia"
    }
  },
  transparency: {
    badge: "INFRAESTRUCTURA",
    title: "TECNOLOGÍA TRANSPARENTE",
    desc: "Nuestra infraestructura está construida sobre bases enterprise, garantizando confiabilidad, velocidad y seguridad.",
    connectivity: {
      title: "CONECTIVIDAD",
      desc: "Acceso directo al mercado a través de centros de datos Equinix (NY5, LD4, TY3) con conectividad de baja latencia a los principales mercados (no verificado)."
    },
    cloud: {
      title: "EJECUCIÓN EN LA NUBE",
      desc: "Motores de ejecución redundantes en AWS (us-east-1, eu-west-1) y Azure para la resiliencia ante fallos (no verificado)."
    },
    security: {
      title: "SEGURIDAD",
      desc: "Cifrado de extremo a extremo, cumplimiento SOC 2 Tipo II y autenticación multicapa para todas las operaciones (no verificado)."
    },
    warning: "Los mercados son volátiles. Los rendimientos nunca están garantizados y pueden producirse pérdidas incluso con sólidas salvaguardas.",
    protocolTitle: "Protocolo diseñado para uso institucional",
    protocolDesc: "Nuestra infraestructura sigue estrictos estándares de cumplimiento y gestión de riesgos para buscar la seguridad operativa (sin garantía)."
  },
  process_home: {
    badge: "PROCESO",
    title: "FLUJO",
    subtitle: "INSTITUCIONAL",
    step1: {
      title: "REGISTRO",
      desc: "Onboarding seguro y verificación de identidad."
    },
    step2: {
      title: "ASIGNACIÓN",
      desc: "Selección del nivel de capital gestionado."
    },
    step3: {
      title: "INTEGRACIÓN",
      desc: "Implementación de la infraestructura algorítmica."
    },
    step4: {
      title: "MONITOREO",
      desc: "Seguimiento del rendimiento en tiempo real."
    },
    step5: {
      title: "LIQUIDEZ",
      desc: "Protocolos simplificados de retiro de ganancias."
    }
  },
  cta_home: {
    badge: "OPORTUNIDAD",
    title: "ESCALA TU",
    subtitle: "CAPITAL",
    desc: "Únete al grupo de élite de inversores que utilizan la infraestructura propietaria de Braxel.",
    btn: "INICIAR ASIGNACIÓN",
    trust: "Seguridad de Nivel Institucional"
  },
  pricing: {
    badge: "TRANSPARENCIA",
    title: "ASIGNACIONES DE",
    subtitle: "CAPITAL",
    desc: "Infraestructura de nivel institucional con una estructura de tarifas transparente.",
    select: "ASEGURAR ESTE PLAN",
    allocation: "CAPITAL GESTIONADO",
    month: "tarifa mensual",
    detectedCurrency: "Todos los precios se cobran en USD ({{currency}}), independientemente de tu ubicación",
    managedCapitalUsdNote: "El capital gestionado (Capital Gerenciado) siempre se cotiza en USD."
  },
  plans: {
    starter: "Inicial",
    starterFeatures: "Funciones del plan Inicial",
    managedCapital: "Capital Gestionado",
    features: {
      automation: "Automatización",
      accountManagement: "Gestión de Cuenta",
      emailSupport: "Soporte por Email",
      controlledRisk: "Riesgo Controlado",
      starterFeatures: "Funciones del plan Inicial",
      prioritySupport: "Soporte Prioritario",
      detailedLogs: "Logs Detallados",
      proFeatures: "Funciones Pro",
      multiAccount: "Multicuenta",
      weeklyReports: "Reportes Semanales",
      advancedFeatures: "Funciones avanzadas",
      support247: "Soporte 24/7",
      dedicatedManager: "Gestor Dedicado"
    },
    professional: "Profesional",
    professionalFeatures: "Funciones del plan Profesional",
    business: "Empresarial",
    businessFeatures: "Funciones del plan Empresarial",
    enterprise: "Corporativo",
    enterpriseFeatures: "Funciones del plan Corporativo"
  },
  howItWorks: {
    badge: "INFRAESTRUCTURA",
    title: "ARQUITECTURA",
    subtitle: "TÉCNICA",
    desc: "Nuestro ecosistema propietario está construido para velocidad, seguridad y rendimiento constante.",
    steps: [
      {
        title: "REGISTRO",
        desc: "Cree su perfil institucional."
      },
      {
        title: "PANEL",
        desc: "Acceda a su terminal privado de gestión."
      },
      {
        title: "SELECCIÓN DE PLAN",
        desc: "Elija su nivel de asignación de capital."
      },
      {
        title: "IMPLEMENTACIÓN API",
        desc: "Conexión automatizada a mercados globales."
      },
      {
        title: "EJECUCIÓN",
        desc: "Procesamiento de órdenes en milisegundos."
      },
      {
        title: "REPORTES",
        desc: "Análisis detallado de rendimiento semanal."
      }
    ],
    cta: "¿LISTO PARA COMENZAR?",
    ctaBtn: "UNIRSE A LA RED"
  },
  about: {
    badge: "SOBRE NOSOTROS",
    title: "EXCELENCIA",
    subtitle: "INSTITUCIONAL",
    desc: "Braxel Markets representa la cúspide de la gestión algorítmica de capital.",
    historyTitle: "NUESTRA HISTORIA",
    historyDesc1: "Fundada por un equipo de analistas cuantitativos e ingenieros de software, Braxel fue creada para cerrar la brecha entre el capital retail y la tecnología institucional.",
    historyDesc2: "Hoy nos enfocamos en rendimientos ajustados al riesgo y estabilidad de infraestructura, proporcionando estrategias algorítmicas de vanguardia para el inversor moderno.",
    stats: {
      founded: "Fundada",
      users: "Usuarios Activos",
      uptime: "Disponibilidad",
      support: "Soporte"
    },
    values: {
      mission: "MISIÓN",
      missionDesc: "Proporcionar infraestructura algorítmica de élite para el capital global.",
      vision: "VISIÓN",
      visionDesc: "Definir el futuro de la gestión cuantitativa automatizada.",
      values: "VALORES",
      valuesDesc: "Transparencia, precisión y seguridad inquebrantable."
    },
    teamTitle: "EQUIPO DE LIDERAZGO",
    teamDesc: "Conozca a los fundadores y gestores detrás de Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Fundador & CEO",
        bio: "Estratega cuantitativo y emprendedor liderando la visión de Braxel Markets para infraestructura algorítmica institucional.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "LIDERAZGO"
  },
  contact: {
    badge: "SOPORTE",
    title: "CANALES",
    subtitle: "INSTITUCIONALES",
    desc: "Nuestro equipo de soporte dedicado está disponible 24/7 para consultas institucionales.",
    infoTitle: "CONTACTO",
    formTitle: "CONSULTA DIRECTA",
    placeholders: {
      name: "NOMBRE COMPLETO",
      email: "CORREO ELECTRÓNICO",
      subject: "ASUNTO",
      message: "MENSAJE"
    },
    sendBtn: "ENVIAR CONSULTA",
    supportHours: "Horario de Soporte",
    institutionalSupport: "Soporte Institucional 24/7",
    securityChallenge: "Desafío de Seguridad",
    securityAnswer: "Respuesta",
    incorrectAnswer: "Respuesta de seguridad incorrecta. Por favor, inténtelo de nuevo.",
    waitMessage: "Por favor, espere un momento antes de enviar otro mensaje.",
    messageSent: "¡Mensaje enviado con éxito! Nuestro equipo le contactará pronto.",
    messageFailed: "Error al enviar el mensaje. Por favor, inténtelo de nuevo o envíenos un correo directamente a marketsbraxel@ouvidor.net",
    cooldown: "ESPERE",
    consentPre: "Al enviar este formulario, aceptas nuestra",
    consentPost: "Usamos tus datos solo para responder a tu consulta.",
    emailLabel: "Correo electrónico"
  },
  dashboard: {
    portfolio: "Portafolio",
    activeServices: "Servicios Activos",
    newAllocation: "Nueva Asignación",
    noServices: "No se encontraron planes de inversión activos.",
    balance: "Saldo Actual",
    withdraw: "Retiro",
    liquidity: "Liquidez",
    requestWithdraw: "Solicitar Retiro",
    selectAccount: "Seleccionar Cuenta",
    amount: "Monto (USD)",
    iban: "IBAN / Datos Bancarios",
    btnWithdraw: "ENVIAR SOLICITUD DE RETIRO",
    profile: "Gestión de Perfil",
    settings: "Configuración",
    firstName: "Nombre",
    lastName: "Apellido",
    saveChanges: "GUARDAR CAMBIOS",
    verifiedAccount: "Cuenta Verificada",
    accountStandard: "Cuenta Estándar",
    withdrawal: {
      gateTitle: "Verificación de identidad requerida",
      gateWhy: "Para proteger tus fondos y cumplir la normativa, la verificación de identidad (KYC) es obligatoria antes de solicitar un retiro. Puedes operar libremente sin ella.",
      gateRejectedDesc: "Tu envío anterior no fue aceptado. Revisa el motivo a continuación y vuelve a enviar los documentos.",
      gateUnderReview: "Tus documentos están en revisión. Te avisaremos por email cuando haya una decisión. Hasta entonces no puedes solicitar retiros.",
      kycStatusLabel: "Estado de la verificación",
      statusPending: "No enviado",
      statusSubmitted: "En revisión",
      statusApproved: "Aprobado",
      statusRejected: "Rechazado",
      rejectedReason: "Motivo",
      continueToForm: "Continuar al retiro",
      submitDocs: "Enviar documentos",
      resubmit: "Volver a enviar documentos",
      uploadFront: "Documento de identidad (anverso)",
      uploadBack: "Documento de identidad (reverso)",
      uploadSelfie: "Selfie con tu documento",
      chooseFile: "Elegir archivo",
      fileHint: "JPG, PNG o PDF, hasta 10 MB",
      selfieHint: "Foto clara de tu rostro con el documento",
      optional: "Opcional",
      frontRequired: "Adjunta el anverso de tu documento de identidad.",
      fileTooLarge: "El archivo supera los 10 MB.",
      uploadError: "No se pudieron enviar los documentos. Inténtalo de nuevo.",
      documentsSubmitted: "Documentos enviados. Los revisaremos en breve.",
    },
    totalAUM: "Total de Activos en Gestión",
    activeAlgos: "Algoritmos Activos",
    systemStatus: "Estado del Sistema",
    operational: "Operativo",
    infraProtection: "Protección de Infraestructura",
    twoFactor: "Autenticación de Dos Factores",
    notEnabled: "No Activada",
    enable2FA: "Activar 2FA",
    kycStatus: "Verificación KYC",
    verified: "Verificado",
    viewDocs: "Ver Documentos",
    investor: "Inversor",
    kycRequired: "Verificación KYC Requerida",
    kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.",
    kycUnderReview: "KYC en revisión",
    kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.",
    kycRejected: "Верификация KYC отклонена",
    kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.",
    resubmitDocs: "Повторно отправить документы",
    completeVerification: "Завершить верификацию",
    verificationRequired: "Требуется верификация",
    goToVerification: "Перейти к верификации",
    totalProfit: "Общая прибыль",
    drawdown: "Drawdown",
    maxDrawdown: "Макс. просадка",
    assetsInOperation: "Активы в работе",
    monthlyReturns: "Месячная доходность",
    analytics: "Аналитика",
    newWithdrawalRequest: "Новая заявка на вывод",
    walletIban: "Cartera / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Transferencia bancaria (SWIFT)"
    },
    transactionHistory: "История транзакций",
    operations: "Операции",
    asset: "Activo",
    type: "Тип",
    entry: "Вход",
    exit: "Выход",
    profit: "Прибыль",
    time: "Время",
    status: "Estado",
    open: "Открыт",
    closed: "Закрыт",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Dirección de cartera cripto o IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "Introduce el código de 6 dígitos",
    minPasswordPlaceholder: "Mínimo 8 caracteres",
    confirmPasswordPlaceholder: "Vuelve a introducir la nueva contraseña",
    accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.",
    loginSuccess: "Вход выполнен успешно!",
    rememberMe: "Запомнить меня",
    navPerformance: "Rendimiento",
    navAuditLog: "Registro de Auditoría",
    tabProfile: "Perfil",
    tabKycVerification: "Verificación KYC",
    tabSecurity: "Seguridad",
    kycCompleteDesc: "Completa tu verificación KYC para acceder a todas las funciones de la plataforma. Este es un requisito de cumplimiento obligatorio para todas las cuentas.",
    kyc: {
      approved: "Verificación Aprobada",
      underReview: "Documentos en Revisión",
      rejected: "Verificación Rechazada",
      required: "Verificación Requerida",
      descApproved: "Tu identidad ha sido verificada. Todas las funciones están desbloqueadas.",
      descSubmitted: "Nuestro equipo de cumplimiento está revisando tus documentos. Esto suele tardar 24-48 horas.",
      descRejected: "Tus documentos no fueron aceptados. Vuelve a enviarlos con documentación válida.",
      descRequired: "Completa la verificación de identidad para desbloquear todas las funciones de la plataforma.",
      stepCountry: "País",
      stepMethod: "Método",
      stepDocument: "Documento",
      stepReview: "Revisión",
      selectCountry: "Selecciona Tu País",
      selectCountryDesc: "Elige el país que emitió tu documento de identidad.",
      selectCountryPlaceholder: "Selecciona un país...",
      selectMethod: "Selecciona el Método de Verificación",
      selectMethodDesc: "Elige cómo quieres verificar tu identidad para {{country}}.",
      uploadDocument: "Sube Tu Documento",
      uploadDocumentDesc: "Selecciona y sube un documento válido de las opciones siguientes.",
      clickToUpload: "Haz clic para subir o arrastra y suelta",
      submitting: "Enviando...",
      submitForVerification: "Enviar para Verificación",
      progressTitle: "Progreso de Verificación",
      stepEmailVerification: "Verificación de Correo",
      stepIdentityDocument: "Documento de Identidad",
      stepComplianceReview: "Revisión de Cumplimiento",
      stepAccountActivation: "Activación de Cuenta",
      statusInProgress: "En Progreso",
      statusComplete: "Completo",
      statusPending: "Pendiente",
      changePassword: "Cambiar Contraseña",
      updateCredentials: "Actualiza tus credenciais",
      newPassword: "Nueva Contraseña",
      confirmNewPassword: "Confirmar Nueva Contraseña",
      emailVerification: "Verificación de Correo",
      verified: "Verificado",
      verifiedEmail: "Correo Verificado",
      securityActivityLog: "Registro de Actividad de Seguridad",
      scanAuthenticator: "Escanea con tu app de autenticación",
      eventLoginNewDevice: "Inicio de sesión desde nuevo dispositivo",
      eventPasswordChanged: "Contraseña cambiada",
      eventAccountCreated: "Cuenta creada",
      timeHoursAgo: "hace {{count}} horas",
      timeDaysAgo: "hace {{count}} días"
    },
    newEmailLabel: "Nueva dirección de correo",
    sendConfirmationLink: "Enviar enlace de confirmación",
    identityVerified: "¡Tu identidad ha sido verificada! Todas las funciones están desbloqueadas.",
    verificationRejected: "Tu verificación fue rechazada. Vuelve a enviar tus documentos.",
    profileUpdated: "Perfil actualizado correctamente.",
    failedUpdateProfile: "No se pudo actualizar el perfil.",
    differentEmail: "Introduce una dirección de correo diferente.",
    confirmationLinkSent: "Se ha enviado un enlace de confirmación a la nueva dirección de correo. Verifícalo para completar el cambio.",
    failedEmail: "No se pudo actualizar el correo.",
    passwordsDoNotMatch: "Las contraseñas no coinciden.",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
    passwordChanged: "Contraseña cambiada correctamente.",
    failedPassword: "No se pudo cambiar la contraseña.",
    uploadDocument: "Sube un documento.",
    completeSteps: "Completa todos los pasos de verificación.",
    documentsSubmitted: "Documentos enviados para verificación. Se te notificará una vez revisados.",
    failedDocuments: "No se pudieron enviar los documentos.",
    performanceTitle: "Panel de rendimiento",
    auditLogTitle: "Registro de auditoría",
    auditLogDesc: "Todas las órdenes algorítmicas ejecutadas en tu cuenta.",
    accountSettingsTitle: "Configuración de la cuenta",
    personalInformation: "Información personal",
    emailAddress: "Dirección de correo",
    emailChangeNotice: "Cambiar tu correo requiere verificación. Se enviará un enlace de confirmación a la nueva dirección.",
    currentEmail: "Correo actual",
    confirmationSent: "Confirmación enviada",
    tryDifferentEmail: "Probar otro correo",
    continueToMethod: "Continuar a la selección de método",
    uploadHint: "PNG, JPG, PDF hasta 10MB",
    twoFactorDesc: "Añade una capa adicional de seguridad a tu cuenta. Usa una app de autenticación como Google Authenticator o Authy.",
    qrCode: "Código QR",
    kycRequiredBanner: "KYC requerido",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Red",
    emailChangeInboxNotice: "Revisa tu bandeja de entrada y haz clic en el enlace para completar el cambio de correo electrónico.",
    emailChangeSentTo: "Se ha enviado un enlace de confirmación a {{email}}. Revisa tu bandeja de entrada y haz clic en el enlace para completar el cambio de correo electrónico.",
    growthPerformanceMtd: "Rendimiento de crecimiento (mes en curso)"
  },
  checkout: {
    summary: "RESUMEN",
    allocationTitle: "Asignación",
    allocationSubtitle: "Institucional",
    tierLabel: "Nivel de Infraestructura Algorítmica",
    billedMonthly: "Facturado Mensualmente",
    detailsTitle: "Detalles de Asignación",
    managedCapital: "Capital Gestionado",
    setupFee: "Tarifa de Configuración",
    waived: "EXENTA",
    latency: "Latencia de Ejecución",
    infrastructureTitle: "Infraestructura Incluida",
    realTimeMonitoring: "Monitoreo en Tiempo Real",
    activeUponDeployment: "Activo tras la implementación",
    totalDue: "Total Adeudado",
    dedicatedNode: "Nodo Dedicado",
    globalMarkets: "Mercados Globales",
    instantSetup: "Configuración Instantánea",
    authRequired: "AUTENTICACIÓN REQUERIDA",
    authDesc: "Inicie sesión o cree una cuenta para proceder con la asignación.",
    btnLogin: "INICIAR SESIÓN PARA PROCEDER",
    btnRegister: "CREAR CUENTA",
    confirmDeployment: "Confirmar Implementación",
    deploymentDesc: "Al confirmar, autoriza la implementación de la infraestructura algorítmica asociada al plan {{plan}}.",
    proceedPayment: "PROCEDER AL PAGO SEGURO",
    secureGateway: "Gateway Seguro",
    back: "Volver",
    riskDisclosure: "Divulgación de Riesgo: El trading algorítmico implica riesgo sustancial de pérdida. El rendimiento pasado no es indicativo de resultados futuros.",
    secureTransaction: "Transacción Segura",
    paypalNote: "Su información de pago es procesada de forma segura por PayPal. Braxel Markets no almacena los datos de su tarjeta.",
    encryptionNote: "Cifrado con Estándares Institucionales AES-256",
    verifying: "Verificando Transacción Institucional...",
    loading: "Cargando Terminal...",
    globalInfra: "Infraestructura Global de Pagos",
    qrCode: "Código QR",
    allCards: "Todas las Tarjetas",
    selectPaymentMethod: "Seleccionar método de pago",
    choosePayment: "Elige como quieres pagar",
    creditCard: "Tarjeta de crédito",
    instantPayment: "Pago instantáneo",
    cardDesc: "Visa, Mastercard y otras tarjetas",
    crypto: "Criptomoneda",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Transferencia cripto rapida y segura",
    securePayment: "Pago Seguro",
    cardNumber: "Número de tarjeta",
    cardName: "Nombre en la tarjeta",
    cardExpiry: "Vencimiento",
    payNow: "PAGAR AHORA",
    amountToPay: "Importe a Pagar",
    selectNetwork: "Seleccionar Red",
    yourAddress: "Dirección de Depósito",
    yourAddressPlaceholder: "Introduce tu dirección USDT",
    important: "IMPORTANTE",
    cryptoNote: "Envia el importe exacto para recibir el plan",
    sendExactAmount: "Envía EXACTAMENTE este monto para evitar retrasos",
    confirmCrypto: "CONFIRMAR CON CRYPTO",
    copied: "Copiado!",
    cryptoPending: "Pago registrado! Esperando confirmacion.",
    processing: "Procesando...",
    paymentSuccess: "Pago aprobado!",
    selectCountry: "Seleccionar país",
    searchCountry: "Buscar país...",
    phone: "Número de teléfono",
    fillAllFields: "Completa todos los campos",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "NOMBRE COMPLETO",
    cardExpiryPlaceholder: "MM/AA",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "El pago falló",
    paymentError: "Error de pago",
    amountToSend: "Monto a Enviar",
    paymentReference: "Incluye tu correo electrónico como referencia de pago",
    wiseTransfer: "Transferencia Bancaria",
    bankDetails: "Datos Bancarios",
    accountHolder: "Titular de la Cuenta",
    accountNumber: "Número de Cuenta",
    bankName: "Nombre del Banco",
    bankAddress: "Dirección del Banco",
    routingNumber: "Número de Ruta",
    confirmWise: "CONFIRMAR TRANSFERENCIA",
    wiseDesc: "Transfiere directamente a nuestra cuenta bancaria vía Wise",
    wiseNote: "Después de hacer la transferencia, haz clic en confirmar abajo. Tu cuenta se activará tras la verificación (1-3 días hábiles).",
    wiseInternational: "Transferencia Internacional",
    openWise: "Abrir Sitio de Wise",
    transferInstructions: "Instrucciones de Transferencia",
    lowFees: "Comisiones Bajas",
    noKyc: "KYC Requerido",
    anyCountry: "Cualquier País",
    wiseConfirmRequired: "Por favor confirma que hiciste la transferencia",
    wiseConfirmText: "He realizado la transferencia bancaria y confirmo que el monto enviado coincide con el precio del plan.",
    wisePaymentSuccess: "¡Pago confirmado! Tu cuenta está siendo configurada.",
    wiseStep1: "Copia los datos bancarios a continuación",
    wiseStep2: "Realiza una transferencia desde tu banco o cuenta de Wise",
    wiseStep3: "Haz clic en confirmar después de realizar la transferencia",
    subscriptionTitle: "SUSCRIPCIÓN",
    subscriptionSubtitle: "PLAN DE SERVICIO",
    serviceAccess: "Acceso al servicio",
    confirmCard: "CONFIRMAR TARJETA",
    redirecting: "Redirigiendo al pago...",
    card: "Tarjeta de crédito / débito",
    testModeBanner: "MODO PRUEBA — Sin dinero real. Sin banco real. Sin cartera real. Sin activación real.",
    startFailed: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    notConfigured: "Los pagos aún no están completamente configurados. Prueba otro método o contacta con soporte.",
    invalidPlanTitle: "PLAN NO VÁLIDO",
    invalidPlanDesc: "El plan seleccionado ya no está disponible. Elige un plan de nuevo.",
    swiftLabel: "SWIFT",
    referenceLabel: "Referencia",
  },
  legal: {
    badgeLegal: "LEGAL",
    termsTitle: "TÉRMINOS DE SERVICIO"
  },
  faq: {
    title: "PREGUNTAS FRECUENTES",
    badge: "PREGUNTAS FRECUENTES",
    q1: "¿Es necesaria experiencia previa?",
    a1: "No. Nuestra infraestructura está completamente automatizada. Solo necesita seleccionar su nivel de asignación y monitorear el rendimiento a través de su terminal.",
    q2: "¿Cuáles son los riesgos involucrados?",
    a2: "Como en cualquier mercado financiero, existen riesgos de pérdida de capital debido a la volatilidad. Utilizamos protocolos avanzados de mitigación para proteger el capital.",
    q3: "¿Cómo funciona el sistema?",
    a3: "Nuestros algoritmos propietarios ejecutan estrategias cuantitativas de alta frecuencia en mercados globales con precisión de milisegundos.",
    q4: "¿Puedo cancelar mi plan?",
    a4: "Sí. Puede solicitar la cancelación y el retiro del capital en cualquier momento a través de los protocolos de su panel."
  },
  diffs: {
    title: "¿POR QUÉ BRAXEL MARKETS?",
    badge: "DIFERENCIALES",
    t1: "Tecnología Propietaria",
    d1: "Redes neuronales diseñadas para ejecución de nivel institucional.",
    t2: "Automatización Total",
    d2: "Gestión algorítmica 24/7 sin sesgo emocional humano.",
    t3: "Acceso Simplificado",
    d3: "Infraestructura institucional accesible a través de un terminal intuitivo.",
    t4: "Nivel Profesional",
    d4: "Conexión directa a pools de liquidez globales con latencia ultra-baja."
  },
  signals: {
    title: "EJECUCIÓN",
    subtitle: "ALGORÍTMICA",
    badge: "TERMINAL EN TIEMPO REAL",
    desc: "Monitoree nuestra infraestructura propietaria en tiempo real. Cada señal es procesada por nuestras redes neuronales con precisión de milisegundos.",
    asset: "ACTIVO",
    type: "TIPO",
    entry: "ENTRADA",
    profit: "GANANCIA",
    status: "ESTADO",
    active: "ACTIVO",
    completed: "COMPLETADO",
    institutionalVerification: "Verificación institucional",
    realtimeFeed: "Fuente de datos en tiempo real de pools de liquidez globales.",
    liveTerminal: "TERMINAL EN VIVO",
    connected: "CONECTADO"
  },
  application: {
    title: "SOLICITUD",
    subtitle: "ENVÍO",
    plan_selected: "Plan Seleccionado",
    billed_monthly: "Facturado mensualmente",
    plan_description: "Está a punto de comprar la suscripción al servicio {{plan}}.",
    plan_price_detail: "Cuota mensual: {{price}} (se paga mensualmente)",
    full_name: "Nombre Completo",
    full_name_placeholder: "Introduzca su nombre completo",
    email: "Correo Electrónico",
    email_placeholder: "Introduzca su correo electrónico",
    address_line1: "Dirección — Línea 1",
    address_line1_placeholder: "Calle y número",
    address_line2: "Datos adicionales",
    address_line2_placeholder: "Apartamento, piso, unidad, etc. (opcional)",
    city: "Ciudad",
    city_placeholder: "Ciudad",
    region: "Estado / Región",
    region_placeholder: "Estado o región",
    postal_code: "Código Postal",
    postal_code_placeholder: "Código postal",
    country: "País",
    country_placeholder: "País",
    phone: "Teléfono",
    phone_placeholder: "Número de teléfono",
    terms_accepted: "Acepto los Términos de Servicio",
    privacy_accepted: "Acepto la Política de Privacidad",
    viewTerms: "Ver Términos",
    viewPrivacy: "Ver Política de Privacidad",
    customer_note: "Nota del Cliente (opcional)",
    customer_note_placeholder: "Cualquier información adicional que desee que conozcamos",
    note_limit: "Máximo {{count}} caracteres",
    characters: "caracteres",
    submitting: "Enviando...",
    submit: "ENVIAR SOLICITUD",
    errors: {
      full_name_required: "El nombre completo es obligatorio",
      email_required: "El correo electrónico es obligatorio",
      email_invalid: "Correo electrónico no válido",
      address_line1_required: "La dirección es obligatoria",
      city_required: "La ciudad es obligatoria",
      country_required: "El país es obligatorio",
      terms_required: "Debe aceptar los Términos de Servicio",
      privacy_required: "Debe aceptar la Política de Privacidad",
      note_too_long: "La nota debe tener como máximo 500 caracteres",
      submit_failed: "Error en el envío. Inténtelo de nuevo."
    }
  },
  checkoutSuccess: {
    verifying: "Verificando el pago…",
    backToPricing: "Volver a los planes",
    couldNotVerify: "Aún no hemos podido verificar su pago",
    couldNotVerifyDesc: "Si completó el pago, no se preocupe: su pago se está procesando y su cuenta se activará en breve. Actualice esta página en un momento.",
    verifiedBadge: "Verificado",
    paymentCompleted: "Pago completado",
    activationNotice: "Su cuenta se activará en unos minutos.",
    paymentId: "ID del Pago",
    applicationId: "ID de la Solicitud",
    securityNotice: "Por su seguridad, las cuentas se activan manualmente por un operador tras la verificación del pago. Recibirá el acceso en cuanto se complete la revisión.",
    goToDashboard: "Ir al panel",
    contactSupport: "Contactar con soporte",
    verifyingBadge: "Verificando",
    paymentReceived: "Pago recibido. Estamos verificando el pago.",
    beingVerified: "Su pago se está verificando. Esta página se actualizará automáticamente una vez se confirme el pago. No cierre esta ventana.",
    currentStatus: "Estado actual",
    urlSecurityNotice: "Por su seguridad, esta página no marca un pago como completado solo por la URL. Esperamos la confirmación del servidor."
  },
  termsPage: {
    title: "Términos de servicio",
    entityTitle: "Entidad contratante",
    entityText: "[Nombre de la Entidad Legal, Número de Registro, Jurisdicción]",
    descriptionTitle: "Descripción del servicio",
    descriptionText: "Braxel Markets proporciona infraestructura de negociación algorítmica de nivel institucional y servicios relacionados a través de su plataforma.",
    feesTitle: "Tarifas y pagos",
    feesText: "Las tarifas de nuestros servicios se detallan en la página de Precios y están sujetas a cambios con aviso previo. Los métodos de pago incluyen transferencia bancaria, tarjeta de crédito y criptomoneda.",
    eligibilityTitle: "Elegibilidad",
    eligibilityText: "Nuestros servicios están disponibles para personas físicas y jurídicas mayores de 18 años que cumplan con nuestros requisitos de Conoce a tu Cliente (KYC) y de prevención de blanqueo de capitales (AML).",
    accountTerminationTitle: "Cancelación de la cuenta",
    accountTerminationText: "Cualquiera de las partes puede cancelar la cuenta con un preaviso por escrito de [PLACEHOLDER: periodo de preaviso, p. ej., 30 días]. Braxel Markets puede cancelarla de inmediato por incumplimiento de los términos, actividad ilegal o requisitos regulatorios.",
    limitationOfLiabilityTitle: "Limitación de responsabilidad",
    limitationOfLiabilityText: "En la máxima medida permitida por la ley, Braxel Markets no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo, ni de ninguna pérdida de datos, uso, fondo de comercio u otras pérdidas intangibles derivadas de tu acceso o uso de nuestros servicios.",
    disputeResolutionTitle: "Resolución de conflictos y ley aplicable",
    disputeResolutionText: "Estos Términos se regirán e interpretarán de conformidad con las leyes de [PLACEHOLDER: jurisdicción]. Cualquier controversia derivada de o relacionada con estos Términos se someterá a la jurisdicción exclusiva de los tribunales de [PLACEHOLDER: jurisdicción].",
    changesToTermsTitle: "Cambios en estos Términos",
    changesToTermsText: "Nos reservamos el derecho de modificar o sustituir estos Términos en cualquier momento. Si una revisión es sustancial, avisaremos con al menos [PLACEHOLDER: periodo de preaviso, p. ej., 30 días] antes de que entren en vigor los nuevos términos. Lo que constituye un cambio sustancial se determinará a nuestra entera discreción.",
    effectiveDateTitle: "Fecha de entrada en vigor",
    effectiveDateText: "Fecha de entrada en vigor: [PLACEHOLDER: fecha]",
    contactTitle: "Contacto",
    contactText: "Para preguntas sobre estos Términos, contáctanos en [PLACEHOLDER: correo o dirección de contacto]."
  },
  legalDraftBanner: "Esta página es un borrador en revisión legal y aún no es definitiva.",
  notFound: {
    title: "404",
    message: "Lo sentimos, la página que buscas no existe.",
    returnHome: "Volver al inicio"
  },
  authCallback: {
    confirmingTitle: "Confirmando tu cuenta...",
    confirmingDesc: "Espera mientras verificamos tu correo.",
    confirmedTitle: "¡Correo confirmado!",
    confirmedDesc: "Tu cuenta se ha verificado correctamente.",
    redirecting: "Redirigiendo al inicio de sesión...",
    failedTitle: "Confirmación fallida",
    goToLogin: "Ir al inicio de sesión",
    invalidLink: "Enlace de confirmación no válido o caducado",
    failedConfirm: "No se pudo confirmar el correo"
  },
  paymentsDisabled: {
    title: "Los pagos están actualmente deshabilitados.",
    desc: "El sistema de pago aún no está activo. Para habilitar los pagos, contacta al operador en",
    managedBy: "El procesamiento de pagos es gestionado exclusivamente por el operador de la plataforma. Si tienes preguntas sobre una asignación pendiente, contacta con soporte.",
    viewPlans: "Ver planes de inversión"
  },
  checkoutStatus: {
    created: "Creado",
    pending: "Esperando pago",
    processing: "Verificando en cadena",
    confirmed: "Confirmado",
    failed: "Fallido",
    rejected: "Rechazado",
    refunded: "Reembolsado",
    disputed: "En disputa",
    canceled: "Cancelado",
    pending_manual: "Esperando revisión manual"
  },
  legalReview: {
    title: "Borrador en revisión legal"
  },
  operator: {
    title: "Operador",
    subtitle: "Panel",
    description: "Revisa y activa las solicitudes de clientes pendientes.",
    no_pending_applications: "No hay solicitudes pendientes.",
    plan: "Plan",
    amount: "Importe",
    country: "País",
    customer_note: "Nota del cliente",
    activate_account: "Activar cuenta",
    activating: "Activando...",
    reject_or_request_info: "Rechazar / solicitar información",
    rejecting: "Rechazando...",
    reject_application: "Rechazar solicitud",
    reject_reason_prompt: "Indica el motivo del rechazo o la información necesaria.",
    reject_reason_placeholder: "Motivo...",
    cancel: "Cancelar",
    reject: "Rechazar",
    errors: {
      activation_failed: "No se pudo activar la solicitud.",
      rejection_failed: "No se pudo rechazar la solicitud."
    },
    status: {
      activation_pending: "Activación pendiente",
      account_active: "Cuenta activa",
      rejected: "Rechazado",
      manual_review: "Revisión manual"
    }
  },
  profitCalculator: {
    badge: "PROYECCIÓN",
    titleA: "CALCULADORA",
    titleB: "DE GANANCIAS",
    initialAllocation: "Asignación inicial",
    monthlyProfit: "Ganancia mensual est.",
    annualProfit: "Ganancia anual est.",
    riskTitle: "Gestión de riesgos",
    riskDesc: "Proyecciones basadas en el rendimiento algorítmico histórico con estrictos límites de drawdown.",
    instantTitle: "Implementación instantánea",
    instantDesc: "Tu capital empieza a trabajar minutos después de la integración de la infraestructura.",
    disclaimer: "* Aviso: El rendimiento pasado no garantiza resultados futuros. Las proyecciones son solo ilustrativas."
  },
  meta: {
    home: {
      title: "Braxel Markets | Gestión algorítmica institucional de capital",
      description: "Infraestructura de negociación algorítmica de nivel institucional, acceso a capital de prop firm, autorización de CopyTrade y automatización completa de MetaTrader para XAU/USD y US500."
    },
    pricing: {
      title: "Planes y capital gestionado | Braxel Markets",
      description: "Compara planes de negociación algorítmica y asignaciones de capital gestionado. El capital gestionado siempre se cotiza en USD."
    },
    about: {
      title: "Sobre Braxel Markets | Negociación algorítmica",
      description: "Braxel Markets desarrolla infraestructura de negociación algorítmica de nivel institucional y gestiona capital con estrictos controles de riesgo."
    },
    howItWorks: {
      title: "Cómo funciona | Braxel Markets",
      description: "Descubre cómo Braxel Markets conecta tu capital a estrategias de MetaTrader totalmente automatizadas para XAU/USD y US500."
    },
    contact: {
      title: "Contacto | Braxel Markets",
      description: "Contacta con el equipo de Braxel Markets sobre infraestructura de negociación algorítmica y capital gestionado."
    },
    terms: {
      title: "Términos de servicio | Braxel Markets",
      description: "Lee los Términos de servicio para usar Braxel Markets."
    },
    privacy: {
      title: "Política de privacidad | Braxel Markets",
      description: "Descubre cómo Braxel Markets recopila, usa y protege tus datos personales."
    },
    disclaimer: {
      title: "Divulgación de riesgos | Braxel Markets",
      description: "Divulgación importante de riesgos para la negociación algorítmica y el capital gestionado con Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brasil",
      US: "Estados Unidos",
      GB: "Reino Unido",
      DE: "Alemania",
      FR: "Francia",
      ES: "España",
      IT: "Italia",
      PT: "Portugal",
      RU: "Rusia",
      CN: "China",
      JP: "Japón",
      IN: "India",
      OTHER: "Otros países"
    },
    method: {
      BR: {
        id_card: "Documento nacional de identidad (RG/CPF)",
        drivers_license: "Permiso de conducir"
      },
      US: {
        id_card: "Documento de identidad estatal"
      },
      GB: {
        id_card: "Documento nacional / Permiso de conducir",
        biometric: "Permiso de residencia biométrico"
      },
      DE: {
        drivers: "Permiso de conducir",
        passport: "Pasaporte / Reisepass"
      },
      FR: {
        residence: "Permiso de residencia"
      },
      RU: {
        foreign_passport: "Pasaporte extranjero"
      },
      OTHER: {
        passport: "Pasaporte internacional",
        national_id: "Documento nacional de identidad"
      }
    },
    doc: {
      rg: {
        desc: "Documento nacional de identidad brasileño"
      },
      cpf: {
        desc: "Tarjeta de registro de contribuyente brasileño (CPF)"
      },
      passport: {
        desc: "Pasaporte válido con página de fotografía",
        name: "Pasaporte"
      },
      cnh: {
        desc: "Permiso de conducir brasileño",
        name: "CNH (Permiso de conducir)"
      },
      state_id: {
        desc: "Permiso de conducir o identificación estatal",
        name: "Documento de identidad estatal"
      },
      passport_uk: {
        desc: "Pasaporte británico válido"
      },
      driving_license_uk: {
        desc: "Permiso de conducir británico",
        name: "Permiso de conducir"
      },
      brp: {
        desc: "Permiso de residencia biométrico británico",
        name: "Permiso de residencia biométrico"
      },
      personalausweis: {
        desc: "Documento de identidad alemán"
      },
      passport_de: {
        desc: "Pasaporte alemán válido"
      },
      fuehrerschein: {
        desc: "Permiso de conducir alemán"
      },
      cni: {
        desc: "Documento nacional de identidad francés"
      },
      passport_fr: {
        desc: "Pasaporte francés válido"
      },
      titre_sejour: {
        desc: "Permiso de residencia francés"
      },
      dni: {
        desc: "Documento nacional de identidad español"
      },
      nie: {
        desc: "Número de identificación de extranjero"
      },
      passport_es: {
        desc: "Pasaporte válido"
      },
      carta_id: {
        desc: "Documento de identidad italiano"
      },
      passport_it: {
        desc: "Pasaporte italiano válido"
      },
      cc: {
        desc: "Tarjeta de ciudadano portuguesa"
      },
      passport_pt: {
        desc: "Pasaporte portugués válido"
      },
      passport_ru: {
        desc: "Pasaporte interno ruso"
      },
      foreign_passport_ru: {
        desc: "Pasaporte ruso para el extranjero",
        name: "Pasaporte extranjero"
      },
      id_card_cn: {
        desc: "Documento de identidad chino"
      },
      passport_cn: {
        desc: "Pasaporte válido"
      },
      passport_jp: {
        desc: "Pasaporte japonés válido"
      },
      zairyu: {
        desc: "Tarjeta de residencia"
      },
      aadhaar: {
        desc: "Tarjeta de identificación única",
        name: "Tarjeta Aadhaar"
      },
      voter_id: {
        desc: "Credencial electoral con fotografía",
        name: "Credencial electoral"
      },
      passport_in: {
        desc: "Pasaporte indio válido"
      },
      passport_intl: {
        desc: "Pasaporte válido de tu país"
      },
      national_id_intl: {
        desc: "Identificación nacional emitida por el gobierno",
        name: "Documento nacional de identidad"
      }
    },
    methodName: {
      id_card: "Documento nacional de identidad",
      passport: "Pasaporte",
      drivers_license: "Permiso de conducir",
      drivers: "Permiso de conducir",
      biometric: "Permiso de residencia biométrico",
      residence: "Permiso de residencia",
      foreign_passport: "Pasaporte extranjero",
      national_id: "Documento nacional de identidad"
    }
  },
  errorBoundary: {
    title: "Algo salió mal",
    message: "No se pudo cargar esta página. Inténtalo de nuevo.",
    retry: "Recargar página",
    home: "Volver al inicio"
  }
};

const frTranslation = {
  disclaimerPage: {
    title: "Avertissement financier",
    risk: "Risque",
    importantRiskTitle: "Avertissement important sur les risques",
    importantRiskText: "L’investissement sur les marchés financiers comporte des risques substantiels et peut entraîner la perte totale du capital investi. Les performances passées ne garantissent pas les résultats futurs.",
    noAdviceTitle: "Aucun conseil",
    noAdviceText: "Le contenu de ce site et les services fournis par Braxel Markets ne constituent pas des conseils financiers, juridiques ou fiscaux. Nous recommandons à chaque investisseur de solliciter l’avis d’un professionnel indépendant avant toute décision d’investissement.",
    limitationTitle: "Limitation de responsabilité",
    limitationText: "Braxel Markets n’est pas responsable des pertes financières résultant de l’utilisation de notre technologie d’automatisation ou des fluctuations du marché.",
    capitalAtRiskTitle: "Capital à risque",
    capitalAtRiskText: "Votre capital est exposé à un risque lorsque vous utilisez nos services. Vous pouvez perdre tout ou partie de votre investissement.",
    noGuaranteedReturnsTitle: "Aucun rendement garanti",
    noGuaranteedReturnsText: "Nous ne garantissons aucun rendement ni profit. Les performances passées ne préjugent pas des résultats futurs.",
    pastPerformanceTitle: "Les performances passées ne sont pas indicatives",
    pastPerformanceText: "Toute performance historique présentée est fournie à titre indicatif uniquement et ne garantit pas les résultats futurs.",
    notLicensedTitle: "Statut réglementaire",
    notLicensedText: "Braxel Markets n’est actuellement pas présentée comme un établissement financier agréé ou réglementé en [PLACEHOLDER: juridiction]. Veuillez vérifier le statut réglementaire applicable à votre localisation.",
    noCapitalProtectionTitle: "Aucune garantie de protection du capital",
    noCapitalProtectionText: "Nous n’offrons aucune protection du capital ni garantie contre les pertes.",
    algorithmicRisksTitle: "Risques du trading algorithmique/automatisé",
    algorithmicRisksText: "Les stratégies de trading automatisées et algorithmiques comportent des risques incluant, sans s’y limiter, les défaillances système, les problèmes de connectivité, les erreurs de modèle et les conditions de marché imprévues.",
    jurisdictionRestrictionsTitle: "Restrictions de juridiction",
    jurisdictionRestrictionsText: "Nos services peuvent ne pas être disponibles dans toutes les juridictions. Il incombe aux utilisateurs de s’assurer du respect des lois et réglementations locales avant d’utiliser notre plateforme."
  },
  privacyPage: {
    title: "Politique de confidentialité",
    privacy: "Confidentialité",
    dataCollectionTitle: "Collecte des données",
    dataCollectionText: "Nous ne collectons que les informations nécessaires à la fourniture de nos services, notamment le nom, l’e-mail et les données de transaction. Vos données sont protégées par un chiffrement AES-256.",
    useOfInfoTitle: "Utilisation des informations",
    useOfInfoText: "Les informations collectées sont utilisées exclusivement pour gérer votre compte, traiter les paiements et envoyer des rapports de performance hebdomadaires.",
    securityTitle: "Sécurité",
    securityText: "Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos données personnelles contre tout accès, modification ou destruction non autorisés.",
    legalBasisTitle: "Base légale du traitement",
    legalBasisText: "Notre base légale pour le traitement de vos données personnelles est [PLACEHOLDER: base légale, p. ex. consentement, intérêt légitime, nécessité contractuelle].",
    retentionTitle: "Durée de conservation des données",
    retentionText: "Nous conservons vos données personnelles pendant [PLACEHOLDER: durée de conservation], sauf si la loi exige une durée plus longue.",
    thirdPartiesTitle: "Tiers et sous-traitants",
    thirdPartiesText: "Nous pouvons partager vos données avec des prestataires de services tiers de confiance tels que [PLACEHOLDER: liste des sous-traitants, p. ex. prestataires de paiement, hébergement cloud, services e-mail], uniquement aux fins décrites dans la présente politique.",
    userRightsTitle: "Vos droits",
    userRightsText: "En vertu des lois applicables sur la protection des données, telles que la LGPD (Brésil) et le RGPD (UE), vous avez le droit d’accéder à vos données personnelles, de les rectifier, de les supprimer et de les porter, ainsi que de vous opposer ou de restreindre leur traitement. Pour exercer ces droits, contactez-nous à [PLACEHOLDER: contact pour les demandes de droits].",
    cookiesTitle: "Cookies et technologies similaires",
    cookiesText: "Notre site web utilise des cookies et des technologies similaires pour améliorer l’expérience utilisateur, analyser le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences en matière de cookies dans les paramètres de votre navigateur.",
    contactTitle: "Contact et délégué à la protection des données",
    contactText: "Pour toute question concernant la présente Politique de confidentialité ou nos pratiques en matière de données, contactez notre Délégué à la protection des données à [PLACEHOLDER: e-mail ou contact du DPO]."
  },
  contactEmail: {
    newSubmission: "Nouvel envoi du formulaire de contact",
    name: "Nom",
    email: "E-mail",
    subject: "Objet",
    message: "Message",
    sentFrom: "Envoyé depuis"
  },
  nav: {
    pricing: "PLANS D'INVESTISSEMENT",
    howItWorks: "INFRASTRUCTURE",
    about: "À PROPOS",
    contact: "SUPPORT INSTITUTIONNEL",
    login: "ACCÈS TERMINAL",
    support: "Support",
    openAccount: "CRÉER UN COMPTE",
    dashboard: "TABLEAU DE BORD",
    logout: "DÉCONNEXION",
    selectLanguage: "Choisir la langue",
    sessionActive: "Session active",
    accessDashboard: "Accéder au tableau de bord"
  },
  footer: {
    desc: "Infrastructure d'investissement de niveau institutionnel. Technologie propriétaire pour le marché moderne.",
    platform: "Plateforme",
    company: "Entreprise",
    support: "Support Digital",
    rights: "Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
    disclaimer: "Avertissement Financier",
    address: "Adresse Commerciale",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, Espagne",
    riskTitle: "AVERTISSEMENT SUR LES RISQUES",
    riskText: "Le trading sur les marchés financiers comporte un risque substantiel de perte et ne convient pas à tous les investisseurs. Les performances passées ne préjugent pas des résultats futurs. La valeur des investissements peut baisser ou augmenter. N'investissez pas d'argent que vous ne pouvez pas vous permettre de perdre. Braxel Markets ne garantit aucun rendement spécifique.",
    emailAria: "E-mail",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Support Braxel",
    placeholder: "Tapez un message...",
    emailSupport: "E-mail :",
    assistantReply: "Merci pour votre message. Notre équipe vous répondra sous peu.",
    send: "Envoyer",
    brandAI: "IA de Braxel Markets",
    openChat: "Ouvrir le chat d’assistance",
    close: "Fermer",
    minimize: "Réduire",
    maximize: "Agrandir",
    supportDialog: "Chat d’assistance"
  },
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Entrez vos identifiants d'accès.",
    registerTitle: "Créer un Compte",
    registerSubtitle: "Commencez votre parcours sur le marché institutionnel.",
    email: "Adresse E-mail",
    password: "Mot de passe",
    fullName: "Nom Complet",
    forgotPassword: "Mot de passe oublié ?",
    noAccount: "Vous n'avez pas de compte ?",
    hasAccount: "Vous avez déjà accès ?",
    btnAccess: "ACCÉDER AU COMPTE",
    btnCreate: "CRÉER MON COMPTE",
    termsAgree: "J'accepte les Conditions et la Confidentialité.",
    futureTitle: "L'Avenir de",
    futureSubtitle: "l'Investissement",
    features: [
      "Algorithmes de niveau institutionnel",
      "Protection avancée du capital",
      "Exécution en millisecondes",
      "Transparence totale"
    ],
    accessBadge: "Accès institutionnel",
    emailPlaceholder: "Saisissez votre e-mail",
    fullNamePlaceholder: "Saisissez votre nom complet",
    loginLink: "Connexion",
    loginSideDescription: "Accédez à votre terminal institutionnel.",
    loginSideFooter: "Sécurité de niveau institutionnel",
    loginErrorMessage: "Identifiants invalides. Veuillez réessayer.",
    registerErrorMessage: "Échec de l'inscription. Veuillez réessayer.",
    registerSuccessMessage: "Compte créé avec succès !",
    registerSideFooter: "Protégé par sécurité institutionnelle",
    welcomeBackTitle: "Bon Retour",
    welcomeBackHighlight: "Terminal Institutionnel",
    accountNotFound: "Compte non trouvé. Veuillez créer un compte.",
    rememberMe: "Se souvenir de moi",
    registerLink: "Créer un compte",
    passwordPlaceholder: "Mot de passe",
    accountNotFoundError: "Compte introuvable. Veuillez d’abord créer un compte.",
    resetPasswordSent: "Si un compte existe pour cet e-mail, un lien de réinitialisation du mot de passe a été envoyé.",
    resetPasswordError: "Impossible d’envoyer le lien de réinitialisation. Veuillez réessayer.",
    enterEmailFirst: "Saisissez d’abord votre adresse e-mail."
  },
  hero: {
    title1: "GESTION ALGORITHMIQUE",
    title2: "DU CAPITAL D'ÉLITE",
    desc: "Déployez des stratégies quantitatives de niveau institutionnel conçues pour le marché moderne. Profitez d'une précision d'exécution en millisecondes et de protocoles avancés de mitigation des risques.",
    getStarted: "EXPLORER LES PLANS D'INVESTISSEMENT",
    viewStrategies: "MÉTHODOLOGIE TECHNIQUE"
  },
  stats: {
    volume: "Gestion Stratégique du Capital",
    traders: "Comptes Actifs",
    uptime: "Uptime Infrastructure",
    latency: "Précision d'Exécution"
  },
  methodology: {
    badge: "MÉTHODOLOGIE",
    title: "MODÈLES QUANTITATIFS",
    statArb: {
      title: "ARBITRAGE STATISTIQUE",
      desc: "Exploitation des inefficiences temporaires de prix entre actifs corrélés à l'aide de modèles de cointégration et de pair trading.",
      f1: "Analyse de Cointégration",
      f2: "Algorithmes de Sélection de Paires",
      f3: "Seuil Z-Score"
    },
    meanRev: {
      title: "RETOUR À LA MOYENNE",
      desc: "Identification des écarts de prix par rapport aux moyennes historiques, avec des règles systématiques d'entrée et de sortie.",
      f1: "Signaux Bandes de Bollinger",
      f2: "Détection de Divergence RSI",
      f3: "Modèles Ornstein-Uhlenbeck"
    },
    hft: {
      title: "TRADING HAUTE FRÉQUENCE",
      desc: "Stratégies d'exécution à latence ultra-faible avec infrastructure co-localisée pour des ordres au niveau de la microseconde.",
      f1: "Microstructure de Marché",
      f2: "Analyse du Flux d'Ordres",
      f3: "Arbitrage de Latence"
    }
  },
  transparency: {
    badge: "INFRASTRUCTURE",
    title: "TECHNOLOGIE TRANSPARENTE",
    desc: "Notre infrastructure est construite sur des bases enterprise, garantissant fiabilité, vitesse et sécurité.",
    connectivity: {
      title: "CONNECTIVITÉ",
      desc: "Accès direct au marché via des centres de données Equinix (NY5, LD4, TY3) avec une connectivité à faible latence vers les principales bourses (non vérifié)."
    },
    cloud: {
      title: "EXÉCUTION CLOUD",
      desc: "Moteurs d’exécution redondants sur AWS (us-east-1, eu-west-1) et Azure pour la résilience au basculement (non vérifié)."
    },
    security: {
      title: "SÉCURITÉ",
      desc: "Chiffrement de bout en bout, conformité SOC 2 Type II et authentification multicouche pour toutes les opérations (non vérifié)."
    },
    warning: "Les marchés sont volatils. Les rendements ne sont jamais garantis et des pertes peuvent survenir même avec des garde-fous solides.",
    protocolTitle: "Protocole conçu pour un usage institutionnel",
    protocolDesc: "Notre infrastructure suit des normes strictes de conformité et de gestion des risques visant la sécurité opérationnelle (sans garantie)."
  },
  process_home: {
    badge: "PROCESSUS",
    title: "FLUX",
    subtitle: "INSTITUTIONNEL",
    step1: {
      title: "INSCRIPTION",
      desc: "Intégration sécurisée et vérification d'identité."
    },
    step2: {
      title: "ALLOCATION",
      desc: "Sélection du niveau de capital géré."
    },
    step3: {
      title: "INTÉGRATION",
      desc: "Déploiement de l'infrastructure algorithmique."
    },
    step4: {
      title: "SURVEILLANCE",
      desc: "Suivi des performances en temps réel."
    },
    step5: {
      title: "LIQUIDITÉ",
      desc: "Protocoles simplifiés de retrait des bénéfices."
    }
  },
  cta_home: {
    badge: "OPPORTUNITÉ",
    title: "DÉVELOPPEZ VOTRE",
    subtitle: "CAPITAL",
    desc: "Rejoignez le groupe d'élite d'investisseurs utilisant l'infrastructure propriétaire de Braxel.",
    btn: "DÉMARRER L'ALLOCATION",
    trust: "Sécurité de Niveau Institutionnel"
  },
  pricing: {
    badge: "TRANSPARENCE",
    title: "ALLOCATIONS DE",
    subtitle: "CAPITAL",
    desc: "Infrastructure de niveau institutionnel avec une structure tarifaire transparente.",
    select: "SÉCURISER CE PLAN",
    allocation: "CAPITAL GÉRÉ",
    month: "frais mensuels",
    detectedCurrency: "Tous les prix sont facturés en USD ({{currency}}), quel que soit votre emplacement",
    managedCapitalUsdNote: "Le capital géré (Capital Gerenciado) est toujours coté en USD."
  },
  plans: {
    starter: "Débutant",
    starterFeatures: "Fonctionnalités du forfait Débutant",
    managedCapital: "Capital Géréré",
    features: {
      automation: "Automatisation",
      accountManagement: "Gestion de Compte",
      emailSupport: "Support Email",
      controlledRisk: "Risque Contrôlé",
      starterFeatures: "Fonctionnalités du forfait Débutant",
      prioritySupport: "Support Prioritaire",
      detailedLogs: "Logs Détaillés",
      proFeatures: "Fonctionnalités Pro",
      multiAccount: "Multi-comptes",
      weeklyReports: "Rapports Hebdomadaires",
      advancedFeatures: "Fonctionnalités avancées",
      support247: "Support 24/7",
      dedicatedManager: "Gestionnaire Dédié"
    },
    professional: "Professionnel",
    professionalFeatures: "Fonctionnalités du forfait Professionnel",
    business: "Entreprise",
    businessFeatures: "Fonctionnalités du forfait Entreprise",
    enterprise: "Entreprise Plus",
    enterpriseFeatures: "Fonctionnalités du forfait Entreprise Plus"
  },
  howItWorks: {
    badge: "INFRASTRUCTURE",
    title: "ARCHITECTURE",
    subtitle: "TECHNIQUE",
    desc: "Notre écosystème propriétaire est conçu pour la vitesse, la sécurité et des performances constantes.",
    steps: [
      {
        title: "INSCRIPTION",
        desc: "Créez votre profil institutionnel."
      },
      {
        title: "TABLEAU DE BORD",
        desc: "Accédez à votre terminal privé de gestion."
      },
      {
        title: "SÉLECTION DU PLAN",
        desc: "Choisissez votre niveau d'allocation de capital."
      },
      {
        title: "DÉPLOIEMENT API",
        desc: "Connexion automatisée aux marchés mondiaux."
      },
      {
        title: "EXÉCUTION",
        desc: "Traitement des ordres en millisecondes."
      },
      {
        title: "REPORTING",
        desc: "Analyse détaillée des performances hebdomadaires."
      }
    ],
    cta: "PRÊT À COMMENCER ?",
    ctaBtn: "REJOINDRE LE RÉSEAU"
  },
  about: {
    badge: "À PROPOS",
    title: "EXCELLENCE",
    subtitle: "INSTITUTIONNELLE",
    desc: "Braxel Markets représente le sommet de la gestion algorithmique du capital.",
    historyTitle: "NOTRE HISTOIRE",
    historyDesc1: "Fondée par une équipe d'analystes quantitatifs et d'ingénieurs logiciels, Braxel a été créée pour combler le fossé entre le capital retail et la technologie institutionnelle.",
    historyDesc2: "Aujourd'hui, nous nous concentrons sur les rendements ajustés au risque et la stabilité de l'infrastructure, offrant des stratégies algorithmiques de pointe pour l'investisseur moderne.",
    stats: {
      founded: "Fondée",
      users: "Utilisateurs Actifs",
      uptime: "Disponibilité",
      support: "Support"
    },
    values: {
      mission: "MISSION",
      missionDesc: "Fournir une infrastructure algorithmique d'élite pour le capital mondial.",
      vision: "VISION",
      visionDesc: "Définir l'avenir de la gestion quantitative automatisée.",
      values: "VALEURS",
      valuesDesc: "Transparence, précision et sécurité inébranlable."
    },
    teamTitle: "ÉQUIPE DE DIRECTION",
    teamDesc: "Découvrez les fondateurs et gestionnaires derrière Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Fondateur & CEO",
        bio: "Stratège quantitatif et entrepreneur dirigeant la vision de Braxel Markets pour l'infrastructure algorithmique institutionnelle.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "DIRECTION"
  },
  contact: {
    badge: "SUPPORT",
    title: "CANAUX",
    subtitle: "INSTITUTIONNELS",
    desc: "Notre équipe de support dédiée est disponible 24/7 pour les demandes institutionnelles.",
    infoTitle: "CONTACT",
    formTitle: "DEMANDE DIRECTE",
    placeholders: {
      name: "NOM COMPLET",
      email: "ADRESSE E-MAIL",
      subject: "OBJET",
      message: "MESSAGE"
    },
    sendBtn: "ENVOYER LA DEMANDE",
    supportHours: "Heures de Support",
    institutionalSupport: "Support Institutionnel 24/7",
    securityChallenge: "Défi de Sécurité",
    securityAnswer: "Réponse",
    incorrectAnswer: "Réponse de sécurité incorrecte. Veuillez réessayer.",
    waitMessage: "Veuillez patienter un moment avant d'envoyer un autre message.",
    messageSent: "Message envoyé avec succès! Notre équipe vous contactera bientôt.",
    messageFailed: "Échec de l'envoi du message. Veuillez réessayer ou nous envoyer un email directement à marketsbraxel@ouvidor.net",
    cooldown: "ATTENDEZ",
    consentPre: "En soumettant ce formulaire, vous acceptez notre",
    consentPost: "Nous utilisons vos données uniquement pour répondre à votre demande.",
    emailLabel: "E-mail"
  },
  dashboard: {
    portfolio: "Portefeuille",
    activeServices: "Services Actifs",
    newAllocation: "Nouvelle Allocation",
    noServices: "Aucun plan d'investissement actif trouvé.",
    balance: "Solde Actuel",
    withdraw: "Retrait",
    liquidity: "Liquidité",
    requestWithdraw: "Demander un Retrait",
    selectAccount: "Sélectionner le Compte",
    amount: "Montant (USD)",
    iban: "IBAN / Coordonnées Bancaires",
    btnWithdraw: "SOUMETTRE LA DEMANDE DE RETRAIT",
    profile: "Gestion du Profil",
    settings: "Paramètres",
    firstName: "Prénom",
    lastName: "Nom",
    saveChanges: "ENREGISTRER LES MODIFICATIONS",
    verifiedAccount: "Compte Vérifié",
    accountStandard: "Compte Standard",
    withdrawal: {
      gateTitle: "Vérification d'identité requise",
      gateWhy: "Pour protéger vos fonds et respecter la réglementation, la vérification d'identité (KYC) est obligatoire avant de demander un retrait. Vous pouvez trader librement sans elle.",
      gateRejectedDesc: "Votre précédente soumission n'a pas été acceptée. Vérifiez le motif ci-dessous et renvoyez vos documents.",
      gateUnderReview: "Vos documents sont en cours d'examen. Nous vous préviendrons par email dès qu'une décision sera prise. D'ici là, vous ne pouvez pas demander de retrait.",
      kycStatusLabel: "Statut de la vérification",
      statusPending: "Non soumis",
      statusSubmitted: "En cours d'examen",
      statusApproved: "Approuvé",
      statusRejected: "Refusé",
      rejectedReason: "Motif",
      continueToForm: "Continuer vers le retrait",
      submitDocs: "Soumettre les documents",
      resubmit: "Renvoyer les documents",
      uploadFront: "Pièce d'identité (recto)",
      uploadBack: "Pièce d'identité (verso)",
      uploadSelfie: "Selfie avec votre pièce d'identité",
      chooseFile: "Choisir un fichier",
      fileHint: "JPG, PNG ou PDF, jusqu'à 10 Mo",
      selfieHint: "Photo nette de votre visage avec le document",
      optional: "Facultatif",
      frontRequired: "Veuillez joindre le recto de votre pièce d'identité.",
      fileTooLarge: "Le fichier dépasse 10 Mo.",
      uploadError: "Impossible de soumettre vos documents. Réessayez.",
      documentsSubmitted: "Documents soumis. Nous les examinerons bientôt.",
    },
    totalAUM: "Total des Actifs sous Gestion",
    activeAlgos: "Algorithmes Actifs",
    systemStatus: "État du Système",
    operational: "Opérationnel",
    infraProtection: "Protection d'Infrastructure",
    twoFactor: "Authentification à Deux Facteurs",
    notEnabled: "Non Activée",
    enable2FA: "Activer 2FA",
    kycStatus: "Vérification KYC",
    verified: "Vérifié",
    viewDocs: "Voir les Documents",
    investor: "Investisseur",
    kycRequired: "Vérification KYC Requise",
    kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.",
    kycUnderReview: "KYC en cours de vérification",
    kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.",
    kycRejected: "Верификация KYC отклонена",
    kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.",
    resubmitDocs: "Повторно отправить документы",
    completeVerification: "Завершить верификацию",
    verificationRequired: "Требуется верификация",
    goToVerification: "Перейти к верификации",
    totalProfit: "Общая прибыль",
    drawdown: "Drawdown",
    maxDrawdown: "Макс. просадка",
    assetsInOperation: "Активы в работе",
    monthlyReturns: "Месячная доходность",
    analytics: "Аналитика",
    newWithdrawalRequest: "Новая заявка на вывод",
    walletIban: "Portefeuille / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Virement bancaire (SWIFT)"
    },
    transactionHistory: "История транзакций",
    operations: "Операции",
    asset: "Actif",
    type: "Тип",
    entry: "Вход",
    exit: "Выход",
    profit: "Прибыль",
    time: "Время",
    status: "Statut",
    open: "Открыт",
    closed: "Закрыт",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Adresse de portefeuille crypto ou IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "Saisissez le code à 6 chiffres",
    minPasswordPlaceholder: "Minimum 8 caractères",
    confirmPasswordPlaceholder: "Saisissez à nouveau le nouveau mot de passe",
    accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.",
    loginSuccess: "Вход выполнен успешно!",
    rememberMe: "Запомнить меня",
    navPerformance: "Performance",
    navAuditLog: "Journal d'Audit",
    tabProfile: "Profil",
    tabKycVerification: "Vérification KYC",
    tabSecurity: "Sécurité",
    kycCompleteDesc: "Complétez votre vérification KYC pour accéder à toutes les fonctionnalités de la plateforme. Il s'agit d'une exigence de conformité obligatoire pour tous les comptes.",
    kyc: {
      approved: "Vérification Approuvée",
      underReview: "Documents en Cours d'Examen",
      rejected: "Vérification Rejetée",
      required: "Vérification Requise",
      descApproved: "Votre identité a été vérifiée. Toutes les fonctionnalités sont déverrouillées.",
      descSubmitted: "Notre équipe de conformité examine vos documents. Cela prend généralement 24-48 heures.",
      descRejected: "Vos documents n'ont pas été acceptés. Veuillez les soumettre à nouveau avec une documentation valide.",
      descRequired: "Complétez la vérification d'identité pour déverrouiller toutes les fonctionnalités de la plateforme.",
      stepCountry: "Pays",
      stepMethod: "Méthode",
      stepDocument: "Document",
      stepReview: "Vérification",
      selectCountry: "Sélectionnez Votre Pays",
      selectCountryDesc: "Choisissez le pays qui a délivré votre pièce d'identité.",
      selectCountryPlaceholder: "Sélectionnez un pays...",
      selectMethod: "Sélectionnez la Méthode de Vérification",
      selectMethodDesc: "Choisissez comment vous souhaitez vérifier votre identité pour {{country}}.",
      uploadDocument: "Téléchargez Votre Document",
      uploadDocumentDesc: "Sélectionnez et téléchargez un document valide parmi les options ci-dessous.",
      clickToUpload: "Cliquez pour télécharger ou glissez-déposez",
      submitting: "Envoi en cours...",
      submitForVerification: "Soumettre pour Vérification",
      progressTitle: "Progression de la Vérification",
      stepEmailVerification: "Vérification Email",
      stepIdentityDocument: "Pièce d'Identité",
      stepComplianceReview: "Examen de Conformité",
      stepAccountActivation: "Activation du Compte",
      statusInProgress: "En Cours",
      statusComplete: "Complet",
      statusPending: "En Attente",
      changePassword: "Changer le Mot de Passe",
      updateCredentials: "Mettez à jour vos identifiants",
      newPassword: "Nouveau Mot de Passe",
      confirmNewPassword: "Confirmer le Nouveau Mot de Passe",
      emailVerification: "Vérification Email",
      verified: "Vérifié",
      verifiedEmail: "Email Vérifié",
      securityActivityLog: "Journal d'Activité de Sécurité",
      scanAuthenticator: "Scannez avec votre application d'authentification",
      eventLoginNewDevice: "Connexion depuis un nouvel appareil",
      eventPasswordChanged: "Mot de passe modifié",
      eventAccountCreated: "Compte créé",
      timeHoursAgo: "il y a {{count}} heures",
      timeDaysAgo: "il y a {{count}} jours"
    },
    newEmailLabel: "Nouvelle adresse e-mail",
    sendConfirmationLink: "Envoyer le lien de confirmation",
    identityVerified: "Votre identité a été vérifiée ! Toutes les fonctionnalités sont débloquées.",
    verificationRejected: "Votre vérification a été refusée. Veuillez renvoyer vos documents.",
    profileUpdated: "Profil mis à jour avec succès.",
    failedUpdateProfile: "Échec de la mise à jour du profil.",
    differentEmail: "Veuillez saisir une adresse e-mail différente.",
    confirmationLinkSent: "Un lien de confirmation a été envoyé à la nouvelle adresse e-mail. Vérifiez-le pour finaliser la modification.",
    failedEmail: "Échec de la mise à jour de l’e-mail.",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le mot de passe doit comporter au moins 8 caractères.",
    passwordChanged: "Mot de passe modifié avec succès.",
    failedPassword: "Échec de la modification du mot de passe.",
    uploadDocument: "Veuillez télécharger un document.",
    completeSteps: "Veuillez compléter toutes les étapes de vérification.",
    documentsSubmitted: "Documents soumis pour vérification. Vous serez notifié après examen.",
    failedDocuments: "Échec de l’envoi des documents.",
    performanceTitle: "Tableau de bord des performances",
    auditLogTitle: "Journal d’audit",
    auditLogDesc: "Tous les ordres algorithmiques exécutés sur votre compte.",
    accountSettingsTitle: "Paramètres du compte",
    personalInformation: "Informations personnelles",
    emailAddress: "Adresse e-mail",
    emailChangeNotice: "La modification de votre e-mail nécessite une vérification. Un lien de confirmation sera envoyé à la nouvelle adresse.",
    currentEmail: "E-mail actuel",
    confirmationSent: "Confirmation envoyée",
    tryDifferentEmail: "Essayer un autre e-mail",
    continueToMethod: "Continuer vers la sélection de la méthode",
    uploadHint: "PNG, JPG, PDF jusqu’à 10 Mo",
    twoFactorDesc: "Ajoutez une couche de sécurité supplémentaire à votre compte. Utilisez une application d’authentification comme Google Authenticator ou Authy.",
    qrCode: "Code QR",
    kycRequiredBanner: "KYC requis",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Réseau",
    emailChangeInboxNotice: "Vérifiez votre boîte de réception et cliquez sur le lien pour finaliser le changement d’adresse e-mail.",
    emailChangeSentTo: "Un lien de confirmation a été envoyé à {{email}}. Vérifiez votre boîte de réception et cliquez sur le lien pour finaliser le changement d’adresse e-mail.",
    growthPerformanceMtd: "Performance de croissance (mois en cours)"
  },
  checkout: {
    summary: "RÉCAPITULATIF",
    allocationTitle: "Allocation",
    allocationSubtitle: "Institutionnelle",
    tierLabel: "Niveau d'Infrastructure Algorithmique",
    billedMonthly: "Facturé Mensuellement",
    detailsTitle: "Détails de l'Allocation",
    managedCapital: "Capital Géré",
    setupFee: "Frais de Configuration",
    waived: "EXONÉRÉS",
    latency: "Latence d'Exécution",
    infrastructureTitle: "Infrastructure Incluse",
    realTimeMonitoring: "Surveillance en Temps Réel",
    activeUponDeployment: "Actif après déploiement",
    totalDue: "Total Dû",
    dedicatedNode: "Nœud Dédié",
    globalMarkets: "Marchés Mondiaux",
    instantSetup: "Configuration Instantanée",
    authRequired: "AUTHENTIFICATION REQUISE",
    authDesc: "Veuillez vous connecter ou créer un compte pour procéder à l'allocation.",
    btnLogin: "SE CONNECTER POUR PROCÉDER",
    btnRegister: "CRÉER UN COMPTE",
    confirmDeployment: "Confirmer le Déploiement",
    deploymentDesc: "En confirmant, vous autorisez le déploiement de l'infrastructure algorithmique associée au plan {{plan}}.",
    proceedPayment: "PROCÉDER AU PAIEMENT SÉCURISÉ",
    secureGateway: "Passerelle Sécurisée",
    back: "Retour",
    riskDisclosure: "Divulgation des Risques : Le trading algorithmique comporte un risque substantiel de perte. Les performances passées ne préjugent pas des résultats futurs.",
    secureTransaction: "Transaction Sécurisée",
    paypalNote: "Vos informations de paiement sont traitées en toute sécurité par PayPal. Braxel Markets ne stocke pas les données de votre carte.",
    encryptionNote: "Chiffré par Standards Institutionnels AES-256",
    verifying: "Vérification de la Transaction Institutionnelle...",
    loading: "Chargement du Terminal...",
    globalInfra: "Infrastructure de Paiement Mondiale",
    qrCode: "Code QR",
    allCards: "Toutes les Cartes",
    selectPaymentMethod: "Sélectionner le mode de paiement",
    choosePayment: "Choisissez comment vous voulez payer",
    creditCard: "Carte de crédit",
    instantPayment: "Paiement instantané",
    cardDesc: "Visa, Mastercard et autres cartes",
    crypto: "Cryptomonnaie",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Transfert cripto rapide et securise",
    securePayment: "Paiement Securise",
    cardNumber: "Numéro de carte",
    cardName: "Nom sur la carte",
    cardExpiry: "Expiration",
    payNow: "PAYER MAINTENANT",
    amountToPay: "Montant a Payer",
    selectNetwork: "Selectionner le Reseau",
    yourAddress: "Adresse de Dépôt",
    yourAddressPlaceholder: "Saisissez votre adresse USDT",
    important: "IMPORTANT",
    cryptoNote: "Envoyez le montant exact pour recevoir le plan",
    sendExactAmount: "Envoyez EXACTEMENT ce montant pour éviter les retards",
    confirmCrypto: "CONFIRMER AVEC CRYPTO",
    copied: "Copie!",
    cryptoPending: "Paiement enregistre! En attente de confirmation.",
    processing: "Traitement...",
    paymentSuccess: "Paiement approuve!",
    selectCountry: "Sélectionner le pays",
    searchCountry: "Rechercher un pays...",
    phone: "Numéro de téléphone",
    fillAllFields: "Remplissez tous les champs",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "NOM COMPLET",
    cardExpiryPlaceholder: "MM/AA",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Paiement échoué",
    paymentError: "Erreur de paiement",
    amountToSend: "Montant à Envoyer",
    paymentReference: "Incluez votre email comme référence de paiement",
    wiseTransfer: "Virement Bancaire",
    bankDetails: "Coordonnées Bancaires",
    accountHolder: "Titulaire du Compte",
    accountNumber: "Numéro de Compte",
    bankName: "Nom de la Banque",
    bankAddress: "Adresse de la Banque",
    routingNumber: "Numéro de Routage",
    confirmWise: "CONFIRMER VIREMENT",
    wiseDesc: "Transférez directement sur notre compte bancaire via Wise",
    wiseNote: "Après avoir effectué le virement, cliquez sur confirmer ci-dessous. Votre compte sera activé après vérification (1-3 jours ouvrables).",
    wiseInternational: "Virement International",
    openWise: "Ouvrir le Site Wise",
    transferInstructions: "Instructions de Virement",
    lowFees: "Frais Réduits",
    noKyc: "KYC Requis",
    anyCountry: "Tout Pays",
    wiseConfirmRequired: "Veuillez confirmer que vous avez effectué le virement",
    wiseConfirmText: "J'ai effectué le virement bancaire et je confirme que le montant envoyé correspond au prix du plan.",
    wisePaymentSuccess: "Paiement confirmé ! Votre compte est en cours de configuration.",
    wiseStep1: "Copiez les coordonnées bancaires ci-dessous",
    wiseStep2: "Effectuez un virement depuis votre banque ou votre compte Wise",
    wiseStep3: "Cliquez sur confirmer après avoir effectué le virement",
    subscriptionTitle: "ABONNEMENT",
    subscriptionSubtitle: "FORFAIT DE SERVICE",
    serviceAccess: "Accès au service",
    confirmCard: "CONFIRMER LA CARTE",
    redirecting: "Redirection vers le paiement...",
    card: "Carte de crédit / débit",
    testModeBanner: "MODE TEST — Pas d’argent réel. Pas de banque réelle. Pas de portefeuille réel. Pas d’activation réelle.",
    startFailed: "Impossible de démarrer le paiement. Veuillez réessayer.",
    notConfigured: "Les paiements ne sont pas encore entièrement configurés. Essayez un autre moyen ou contactez le support.",
    invalidPlanTitle: "FORFAIT INVALIDE",
    invalidPlanDesc: "Le forfait sélectionné n'est plus disponible. Veuillez en choisir un autre.",
    swiftLabel: "SWIFT",
    referenceLabel: "Référence",
  },
  legal: {
    badgeLegal: "JURIDIQUE",
    termsTitle: "CONDITIONS D'UTILISATION"
  },
  faq: {
    title: "QUESTIONS FRÉQUENTES",
    badge: "QUESTIONS FRÉQUENTES",
    q1: "Une expérience préalable est-elle nécessaire ?",
    a1: "Non. Notre infrastructure est entièrement automatisée. Il vous suffit de sélectionner votre niveau d'allocation et de suivre les performances via votre terminal.",
    q2: "Quels sont les risques impliqués ?",
    a2: "Comme sur tout marché financier, il existe des risques de perte en capital dus à la volatilité. Nous utilisons des protocoles avancés de mitigation pour protéger le capital.",
    q3: "Comment fonctionne le système ?",
    a3: "Nos algorithmes propriétaires exécutent des stratégies quantitatives à haute fréquence sur les marchés mondiaux avec une précision de l'ordre de la milliseconde.",
    q4: "Puis-je annuler mon plan ?",
    a4: "Oui. Vous pouvez demander l'annulation et le retrait du capital à tout moment via les protocoles de votre tableau de bord."
  },
  diffs: {
    title: "POURQUOI BRAXEL MARKETS ?",
    badge: "DIFFÉRENTIELS",
    t1: "Technologie Propriétaire",
    d1: "Réseaux neuronaux conçus pour une exécution de niveau institutionnel.",
    t2: "Automatisation Totale",
    d2: "Gestion algorithmique 24/7 sans biais émotionnel humain.",
    t3: "Accès Simplifié",
    d3: "Infrastructure institutionnelle accessible via un terminal intuitif.",
    t4: "Niveau Professionnel",
    d4: "Connexion directe aux pools de liquidité mondiaux avec latence ultra-faible."
  },
  signals: {
    title: "EXÉCUTION",
    subtitle: "ALGORITHMIQUE",
    badge: "TERMINAL EN TEMPS RÉEL",
    desc: "Surveillez notre infrastructure propriétaire en temps réel. Chaque signal est traité par nos réseaux neuronaux avec une précision de l'ordre de la milliseconde.",
    asset: "ACTIF",
    type: "TYPE",
    entry: "ENTRÉE",
    profit: "PROFIT",
    status: "STATUT",
    active: "ACTIF",
    completed: "TERMINÉ",
    institutionalVerification: "Vérification institutionnelle",
    realtimeFeed: "Flux de données en temps réel provenant de pools de liquidité mondiaux.",
    liveTerminal: "TERMINAL EN DIRECT",
    connected: "CONNECTÉ"
  },
  application: {
    title: "CANDIDATURE",
    subtitle: "SOUMISSION",
    plan_selected: "Formule sélectionnée",
    billed_monthly: "Facturé mensuellement",
    plan_description: "Vous êtes sur le point d'acheter l'abonnement au service {{plan}}.",
    plan_price_detail: "Frais mensuels : {{price}} (payés chaque mois)",
    full_name: "Nom complet",
    full_name_placeholder: "Saisissez votre nom complet",
    email: "Adresse e-mail",
    email_placeholder: "Saisissez votre e-mail",
    address_line1: "Adresse — Ligne 1",
    address_line1_placeholder: "Numéro et rue",
    address_line2: "Complément d'adresse",
    address_line2_placeholder: "Appartement, étage, unité, etc. (facultatif)",
    city: "Ville",
    city_placeholder: "Ville",
    region: "Région",
    region_placeholder: "Région ou département",
    postal_code: "Code postal",
    postal_code_placeholder: "Code postal",
    country: "Pays",
    country_placeholder: "Pays",
    phone: "Téléphone",
    phone_placeholder: "Numéro de téléphone",
    terms_accepted: "J'accepte les Conditions de Service",
    privacy_accepted: "J'accepte la Politique de Confidentialité",
    viewTerms: "Voir les Conditions",
    viewPrivacy: "Voir la Politique de Confidentialité",
    customer_note: "Remarque du client (facultatif)",
    customer_note_placeholder: "Toute information supplémentaire que vous souhaitez nous communiquer",
    note_limit: "Maximum {{count}} caractères",
    characters: "caractères",
    submitting: "Envoi en cours...",
    submit: "SOUMETTRE LA CANDIDATURE",
    errors: {
      full_name_required: "Le nom complet est obligatoire",
      email_required: "L'adresse e-mail est obligatoire",
      email_invalid: "Adresse e-mail invalide",
      address_line1_required: "L'adresse est obligatoire",
      city_required: "La ville est obligatoire",
      country_required: "Le pays est obligatoire",
      terms_required: "Vous devez accepter les Conditions de Service",
      privacy_required: "Vous devez accepter la Politique de Confidentialité",
      note_too_long: "La remarque doit comporter au maximum 500 caractères",
      submit_failed: "Échec de l'envoi. Veuillez réessayer."
    }
  },
  checkoutSuccess: {
    verifying: "Vérification du paiement…",
    backToPricing: "Retour aux formules",
    couldNotVerify: "Nous n'avons pas encore pu vérifier votre paiement",
    couldNotVerifyDesc: "Si vous avez terminé le paiement, ne vous inquiétez pas : votre paiement est en cours de traitement et votre compte sera activé sous peu. Veuillez actualiser cette page dans un instant.",
    verifiedBadge: "Vérifié",
    paymentCompleted: "Paiement terminé",
    activationNotice: "Votre compte sera activé dans quelques minutes.",
    paymentId: "ID de paiement",
    applicationId: "ID de candidature",
    securityNotice: "Pour votre sécurité, les comptes sont activés manuellement par un opérateur après vérification du paiement. Vous recevrez l'accès dès que la revue sera terminée.",
    goToDashboard: "Aller au tableau de bord",
    contactSupport: "Contacter le support",
    verifyingBadge: "Vérification",
    paymentReceived: "Paiement reçu. Nous vérifions le paiement.",
    beingVerified: "Votre paiement est en cours de vérification. Cette page se mettra à jour automatiquement dès que votre paiement sera confirmé. Ne fermez pas cette fenêtre.",
    currentStatus: "Statut actuel",
    urlSecurityNotice: "Pour votre sécurité, cette page ne marque pas un paiement comme terminé sur la seule base de l'URL. Nous attendons la confirmation côté serveur."
  },
  termsPage: {
    title: "Conditions d’utilisation",
    entityTitle: "Entité contractante",
    entityText: "[Nom de l’entité juridique, numéro d’enregistrement, juridiction]",
    descriptionTitle: "Description du service",
    descriptionText: "Braxel Markets fournit une infrastructure de trading algorithmique de niveau institutionnel et des services associés via sa plateforme.",
    feesTitle: "Frais et paiements",
    feesText: "Les frais de nos services sont indiqués sur la page Tarifs et sont susceptibles de changer avec préavis. Les moyens de paiement incluent le virement bancaire, la carte de crédit et la cryptomonnaie.",
    eligibilityTitle: "Éligibilité",
    eligibilityText: "Nos services sont accessibles aux personnes physiques et morales âgées d’au moins 18 ans et respectant nos exigences Know Your Customer (KYC) et de lutte contre le blanchiment d’argent (AML).",
    accountTerminationTitle: "Résiliation du compte",
    accountTerminationText: "Chaque partie peut résilier le compte moyennant un préavis écrit de [PLACEHOLDER: délai de préavis, p. ex. 30 jours]. Braxel Markets peut résilier immédiatement en cas de violation des conditions, d’activité illégale ou d’exigences réglementaires.",
    limitationOfLiabilityTitle: "Limitation de responsabilité",
    limitationOfLiabilityText: "Dans toute la mesure permise par la loi, Braxel Markets ne saurait être tenue responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni d’aucune perte de données, d’usage, de clientèle ou d’autres pertes immatérielles résultant de votre accès ou de votre utilisation de nos services.",
    disputeResolutionTitle: "Résolution des litiges et droit applicable",
    disputeResolutionText: "Les présentes Conditions sont régies par et interprétées conformément aux lois de [PLACEHOLDER: juridiction]. Tout litige découlant des présentes Conditions ou s’y rapportant sera soumis à la compétence exclusive des tribunaux de [PLACEHOLDER: juridiction].",
    changesToTermsTitle: "Modifications des présentes Conditions",
    changesToTermsText: "Nous nous réservons le droit de modifier ou de remplacer les présentes Conditions à tout moment. Si une révision est substantielle, nous fournirons un préavis d’au moins [PLACEHOLDER: délai de préavis, p. ex. 30 jours] avant l’entrée en vigueur des nouvelles conditions. Ce qui constitue une modification substantielle sera déterminé à notre seule discrétion.",
    effectiveDateTitle: "Date d’entrée en vigueur",
    effectiveDateText: "Date d’entrée en vigueur : [PLACEHOLDER: date]",
    contactTitle: "Contact",
    contactText: "Pour toute question concernant les présentes Conditions, contactez-nous à [PLACEHOLDER: e-mail ou adresse de contact]."
  },
  legalDraftBanner: "Cette page est un projet en cours de révision juridique et n’est pas encore définitive.",
  notFound: {
    title: "404",
    message: "Désolé, la page que vous recherchez n’existe pas.",
    returnHome: "Retour à l’accueil"
  },
  authCallback: {
    confirmingTitle: "Confirmation de votre compte...",
    confirmingDesc: "Veuillez patienter pendant la vérification de votre e-mail.",
    confirmedTitle: "E-mail confirmé !",
    confirmedDesc: "Votre compte a été vérifié avec succès.",
    redirecting: "Redirection vers la connexion...",
    failedTitle: "Échec de la confirmation",
    goToLogin: "Aller à la connexion",
    invalidLink: "Lien de confirmation invalide ou expiré",
    failedConfirm: "Échec de la confirmation de l’e-mail"
  },
  paymentsDisabled: {
    title: "Les paiements sont actuellement désactivés.",
    desc: "Le système de paiement n’est pas encore actif. Pour activer les paiements, contactez l’opérateur à",
    managedBy: "Le traitement des paiements est géré exclusivement par l’opérateur de la plateforme. Si vous avez des questions sur une allocation en attente, contactez le support.",
    viewPlans: "Voir les plans d’investissement"
  },
  checkoutStatus: {
    created: "Créé",
    pending: "En attente de paiement",
    processing: "Vérification on-chain",
    confirmed: "Confirmé",
    failed: "Échoué",
    rejected: "Rejeté",
    refunded: "Remboursé",
    disputed: "Contesté",
    canceled: "Annulé",
    pending_manual: "En attente de vérification manuelle"
  },
  legalReview: {
    title: "Projet en cours de révision juridique"
  },
  operator: {
    title: "Opérateur",
    subtitle: "Tableau de bord",
    description: "Examinez et activez les demandes clients en attente.",
    no_pending_applications: "Aucune demande en attente.",
    plan: "Forfait",
    amount: "Montant",
    country: "Pays",
    customer_note: "Note du client",
    activate_account: "Activer le compte",
    activating: "Activation...",
    reject_or_request_info: "Rejeter / demander des informations",
    rejecting: "Rejet...",
    reject_application: "Rejeter la demande",
    reject_reason_prompt: "Indiquez le motif du rejet ou les informations nécessaires.",
    reject_reason_placeholder: "Motif...",
    cancel: "Annuler",
    reject: "Rejeter",
    errors: {
      activation_failed: "Échec de l’activation de la demande.",
      rejection_failed: "Échec du rejet de la demande."
    },
    status: {
      activation_pending: "Activation en attente",
      account_active: "Compte actif",
      rejected: "Rejeté",
      manual_review: "Vérification manuelle"
    }
  },
  profitCalculator: {
    badge: "PROJECTION",
    titleA: "CALCULATEUR",
    titleB: "DE PROFIT",
    initialAllocation: "Allocation initiale",
    monthlyProfit: "Profit mensuel est.",
    annualProfit: "Profit annuel est.",
    riskTitle: "Gestion des risques",
    riskDesc: "Projections fondées sur les performances algorithmiques historiques avec des limites strictes de drawdown.",
    instantTitle: "Déploiement instantané",
    instantDesc: "Votre capital commence à travailler quelques minutes après l’intégration de l’infrastructure.",
    disclaimer: "* Avertissement : Les performances passées ne garantissent pas les résultats futurs. Les projections sont fournies à titre indicatif uniquement."
  },
  meta: {
    home: {
      title: "Braxel Markets | Gestion algorithmique institutionnelle du capital",
      description: "Infrastructure de trading algorithmique de niveau institutionnel, accès au capital de prop firm, autorisation CopyTrade et automatisation complète de MetaTrader pour XAU/USD et US500."
    },
    pricing: {
      title: "Forfaits et capital géré | Braxel Markets",
      description: "Comparez les forfaits de trading algorithmique et les allocations de capital géré. Le capital géré est toujours libellé en USD."
    },
    about: {
      title: "À propos de Braxel Markets | Trading algorithmique",
      description: "Braxel Markets conçoit une infrastructure de trading algorithmique de niveau institutionnel et gère le capital avec des contrôles de risque stricts."
    },
    howItWorks: {
      title: "Comment ça marche | Braxel Markets",
      description: "Découvrez comment Braxel Markets connecte votre capital à des stratégies MetaTrader entièrement automatisées pour XAU/USD et US500."
    },
    contact: {
      title: "Contact | Braxel Markets",
      description: "Contactez l’équipe Braxel Markets au sujet de l’infrastructure de trading algorithmique et du capital géré."
    },
    terms: {
      title: "Conditions d’utilisation | Braxel Markets",
      description: "Consultez les Conditions d’utilisation de Braxel Markets."
    },
    privacy: {
      title: "Politique de confidentialité | Braxel Markets",
      description: "Découvrez comment Braxel Markets collecte, utilise et protège vos données personnelles."
    },
    disclaimer: {
      title: "Avertissement sur les risques | Braxel Markets",
      description: "Avertissement important sur les risques liés au trading algorithmique et au capital géré avec Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brésil",
      US: "États-Unis",
      GB: "Royaume-Uni",
      DE: "Allemagne",
      FR: "France",
      ES: "Espagne",
      IT: "Italie",
      PT: "Portugal",
      RU: "Russie",
      CN: "Chine",
      JP: "Japon",
      IN: "Inde",
      OTHER: "Autres pays"
    },
    method: {
      BR: {
        id_card: "Carte d’identité nationale (RG/CPF)",
        drivers_license: "Permis de conduire"
      },
      US: {
        id_card: "Carte d’identité d’État"
      },
      GB: {
        id_card: "Carte d’identité nationale / Permis de conduire",
        biometric: "Titre de séjour biométrique"
      },
      DE: {
        drivers: "Permis de conduire",
        passport: "Passeport / Reisepass"
      },
      FR: {
        residence: "Titre de séjour"
      },
      RU: {
        foreign_passport: "Passeport étranger"
      },
      OTHER: {
        passport: "Passeport international",
        national_id: "Carte d’identité nationale"
      }
    },
    doc: {
      rg: {
        desc: "Document d’identité national brésilien"
      },
      cpf: {
        desc: "Carte de contribuable brésilien (CPF)"
      },
      passport: {
        desc: "Passeport valide avec page photo",
        name: "Passeport"
      },
      cnh: {
        desc: "Permis de conduire brésilien",
        name: "CNH (Permis de conduire)"
      },
      state_id: {
        desc: "Permis de conduire ou pièce d’identité délivrée par l’État",
        name: "Carte d’identité d’État"
      },
      passport_uk: {
        desc: "Passeport britannique valide"
      },
      driving_license_uk: {
        desc: "Permis de conduire britannique",
        name: "Permis de conduire"
      },
      brp: {
        desc: "Titre de séjour biométrique britannique",
        name: "Titre de séjour biométrique"
      },
      personalausweis: {
        desc: "Carte d’identité allemande"
      },
      passport_de: {
        desc: "Passeport allemand valide"
      },
      fuehrerschein: {
        desc: "Permis de conduire allemand"
      },
      cni: {
        desc: "Carte d’identité nationale française"
      },
      passport_fr: {
        desc: "Passeport français valide"
      },
      titre_sejour: {
        desc: "Titre de séjour français"
      },
      dni: {
        desc: "Document d’identité national espagnol"
      },
      nie: {
        desc: "Numéro d’identification des étrangers"
      },
      passport_es: {
        desc: "Passeport valide"
      },
      carta_id: {
        desc: "Carte d’identité italienne"
      },
      passport_it: {
        desc: "Passeport italien valide"
      },
      cc: {
        desc: "Carte de citoyen portugaise"
      },
      passport_pt: {
        desc: "Passeport portugais valide"
      },
      passport_ru: {
        desc: "Passeport interne russe"
      },
      foreign_passport_ru: {
        desc: "Passeport russe pour l’étranger",
        name: "Passeport étranger"
      },
      id_card_cn: {
        desc: "Carte d’identité chinoise"
      },
      passport_cn: {
        desc: "Passeport valide"
      },
      passport_jp: {
        desc: "Passeport japonais valide"
      },
      zairyu: {
        desc: "Carte de résident"
      },
      aadhaar: {
        desc: "Carte d’identification unique",
        name: "Carte Aadhaar"
      },
      voter_id: {
        desc: "Carte électorale avec photo",
        name: "Carte électorale"
      },
      passport_in: {
        desc: "Passeport indien valide"
      },
      passport_intl: {
        desc: "Passeport valide de votre pays"
      },
      national_id_intl: {
        desc: "Pièce d’identité nationale délivrée par le gouvernement",
        name: "Carte d’identité nationale"
      }
    },
    methodName: {
      id_card: "Carte d’identité nationale",
      passport: "Passeport",
      drivers_license: "Permis de conduire",
      drivers: "Permis de conduire",
      biometric: "Titre de séjour biométrique",
      residence: "Titre de séjour",
      foreign_passport: "Passeport étranger",
      national_id: "Carte d’identité nationale"
    }
  },
  errorBoundary: {
    title: "Une erreur est survenue",
    message: "Cette page n'a pas pu être chargée. Veuillez réessayer.",
    retry: "Recharger la page",
    home: "Retour à l'accueil"
  }
};

const deTranslation = {
  disclaimerPage: {
    title: "Finanzieller Hinweis",
    risk: "Risiko",
    importantRiskTitle: "Wichtiger Risikohinweis",
    importantRiskText: "Die Anlage an den Finanzmärkten birgt erhebliche Risiken und kann zum vollständigen Verlust des eingesetzten Kapitals führen. Frühere Ergebnisse sind kein Garant für zukünftige Resultate.",
    noAdviceTitle: "Keine Beratung",
    noAdviceText: "Die Inhalte dieser Website und die von Braxel Markets erbrachten Dienstleistungen stellen keine Finanz-, Rechts- oder Steuerberatung dar. Wir empfehlen jedem Anleger, vor Anlageentscheidungen unabhängigen professionellen Rat einzuholen.",
    limitationTitle: "Haftungsbeschränkung",
    limitationText: "Braxel Markets ist nicht verantwortlich für finanzielle Verluste, die aus der Nutzung unserer Automatisierungstechnologie oder aus Marktschwankungen entstehen.",
    capitalAtRiskTitle: "Kapitalrisiko",
    capitalAtRiskText: "Bei der Nutzung unserer Dienste ist Ihr Kapital einem Risiko ausgesetzt. Sie können einen Teil oder Ihr gesamtes Investment verlieren.",
    noGuaranteedReturnsTitle: "Keine garantierten Renditen",
    noGuaranteedReturnsText: "Wir garantieren keine Renditen oder Gewinne. Frühere Ergebnisse sind kein Hinweis auf zukünftige Resultate.",
    pastPerformanceTitle: "Frühere Ergebnisse nicht aussagekräftig",
    pastPerformanceText: "Jegliche dargestellte historische Performance dient nur zur Veranschaulichung und garantiert keine zukünftigen Ergebnisse.",
    notLicensedTitle: "Regulierungsstatus",
    notLicensedText: "Braxel Markets wird derzeit nicht als zugelassenes oder reguliertes Finanzinstitut in [PLACEHOLDER: Gerichtsstand] dargestellt. Bitte prüfen Sie den für Ihren Standort geltenden Regulierungsstatus.",
    noCapitalProtectionTitle: "Keine Kapitalschutzgarantie",
    noCapitalProtectionText: "Wir bieten keinen Kapitalschutz und keine Garantie gegen Verluste.",
    algorithmicRisksTitle: "Risiken des algorithmischen/automatisierten Handels",
    algorithmicRisksText: "Automatisierte und algorithmische Handelsstrategien bergen Risiken wie unter anderem Systemausfälle, Konnektivitätsprobleme, Modellfehler und unerwartete Marktbedingungen.",
    jurisdictionRestrictionsTitle: "Gerichtsbarkeitsbeschränkungen",
    jurisdictionRestrictionsText: "Unsere Dienste sind möglicherweise nicht in allen Gerichtsbarkeiten verfügbar. Nutzer sind dafür verantwortlich, vor der Nutzung unserer Plattform die Einhaltung lokaler Gesetze und Vorschriften sicherzustellen."
  },
  privacyPage: {
    title: "Datenschutzrichtlinie",
    privacy: "Datenschutz",
    dataCollectionTitle: "Datenerhebung",
    dataCollectionText: "Wir erheben nur die für die Erbringung unserer Dienste erforderlichen Informationen, darunter Name, E-Mail und Transaktionsdaten. Ihre Daten sind durch AES-256-Verschlüsselung geschützt.",
    useOfInfoTitle: "Verwendung der Informationen",
    useOfInfoText: "Die erhobenen Informationen werden ausschließlich zur Verwaltung Ihres Kontos, zur Abwicklung von Zahlungen und zum Versand wöchentlicher Performance-Berichte verwendet.",
    securityTitle: "Sicherheit",
    securityText: "Wir setzen strenge Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Veränderung oder Zerstörung zu schützen.",
    legalBasisTitle: "Rechtsgrundlage der Verarbeitung",
    legalBasisText: "Unsere Rechtsgrundlage für die Verarbeitung Ihrer personenbezogenen Daten ist [PLACEHOLDER: Rechtsgrundlage, z. B. Einwilligung, berechtigtes Interesse, Vertragserfüllung].",
    retentionTitle: "Speicherdauer",
    retentionText: "Wir speichern Ihre personenbezogenen Daten für [PLACEHOLDER: Speicherdauer], sofern nicht gesetzlich eine längere Frist vorgeschrieben ist.",
    thirdPartiesTitle: "Dritte und Auftragsverarbeiter",
    thirdPartiesText: "Wir können Ihre Daten mit vertrauenswürdigen Dienstleistern Dritter wie [PLACEHOLDER: Liste der Auftragsverarbeiter, z. B. Zahlungsdienstleister, Cloud-Hosting, E-Mail-Dienste] ausschließlich zu den in dieser Richtlinie genannten Zwecken teilen.",
    userRightsTitle: "Ihre Rechte",
    userRightsText: "Nach den geltenden Datenschutzgesetzen wie der LGPD (Brasilien) und der DSGVO (EU) haben Sie das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit Ihrer personenbezogenen Daten sowie auf Widerspruch gegen oder Einschränkung der Verarbeitung. Um diese Rechte auszuüben, kontaktieren Sie uns bitte unter [PLACEHOLDER: Kontakt für Rechteanfragen].",
    cookiesTitle: "Cookies und ähnliche Technologien",
    cookiesText: "Unsere Website verwendet Cookies und ähnliche Technologien, um die Nutzererfahrung zu verbessern, den Datenverkehr zu analysieren und Inhalte zu personalisieren. Sie können Ihre Cookie-Einstellungen in Ihren Browsereinstellungen verwalten.",
    contactTitle: "Kontakt und Datenschutzbeauftragter",
    contactText: "Bei Fragen zu dieser Datenschutzrichtlinie oder unseren Datenpraktiken wenden Sie sich bitte an unseren Datenschutzbeauftragten unter [PLACEHOLDER: E-Mail oder Kontakt des DSB]."
  },
  contactEmail: {
    newSubmission: "Neue Kontaktformular-Einsendung",
    name: "Name",
    email: "E-Mail",
    subject: "Betreff",
    message: "Nachricht",
    sentFrom: "Gesendet von"
  },
  nav: {
    pricing: "INVESTMENTPLÄNE",
    howItWorks: "INFRASTRUKTUR",
    about: "ÜBER UNS",
    contact: "INSTITUTIONELLER SUPPORT",
    login: "TERMINAL-ZUGANG",
    support: "Support",
    openAccount: "KONTO ERSTELLEN",
    dashboard: "DASHBOARD",
    logout: "ABMELDEN",
    selectLanguage: "Sprache wählen",
    sessionActive: "Aktive Sitzung",
    accessDashboard: "Zum Dashboard"
  },
  footer: {
    desc: "Institutionelle Investmentinfrastruktur. Proprietäre Technologie für den modernen Markt.",
    platform: "Plattform",
    company: "Unternehmen",
    support: "Digitaler Support",
    rights: "Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    disclaimer: "Finanzhinweis",
    address: "Geschäftsadresse",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, Spanien",
    riskTitle: "RISIKOHINWEIS",
    riskText: "Der Handel an Finanzmärkten birgt ein erhebliches Verlustrisiko und ist nicht für alle Anleger geeignet. Vergangene Ergebnisse sind kein Indikator für zukünftige Ergebnisse. Der Wert von Anlagen kann steigen oder fallen. Investieren Sie kein Geld, dessen Verlust Sie sich nicht leisten können. Braxel Markets garantiert keine bestimmten Renditen.",
    emailAria: "E-Mail",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Braxel Support",
    placeholder: "Nachricht eingeben...",
    emailSupport: "E-Mail:",
    assistantReply: "Vielen Dank für Ihre Nachricht. Unser Team wird sich in Kürze melden.",
    send: "Senden",
    brandAI: "Braxel Markets KI",
    openChat: "Support-Chat öffnen",
    close: "Schließen",
    minimize: "Minimieren",
    maximize: "Maximieren",
    supportDialog: "Support-Chat"
  },
  auth: {
    loginTitle: "Anmeldung",
    loginSubtitle: "Geben Sie Ihre Zugangsdaten ein.",
    registerTitle: "Konto erstellen",
    registerSubtitle: "Starten Sie Ihren Weg im institutionellen Markt.",
    email: "E-Mail-Adresse",
    password: "Passwort",
    fullName: "Vollständiger Name",
    forgotPassword: "Passwort vergessen?",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits Zugang?",
    btnAccess: "KONTO ZUGREIFEN",
    btnCreate: "MEIN KONTO ERSTELLEN",
    termsAgree: "Ich stimme den AGB und Datenschutzrichtlinien zu.",
    futureTitle: "Die Zukunft der",
    futureSubtitle: "Investition",
    features: [
      "Institutionelle Algorithmen",
      "Fortschrittlicher Kapitalschutz",
      "Ausführung in Millisekunden",
      "Vollständige Transparenz"
    ],
    accessBadge: "Institutioneller Zugang",
    emailPlaceholder: "E-Mail eingeben",
    fullNamePlaceholder: "Vollständigen Namen eingeben",
    loginLink: "Anmelden",
    loginSideDescription: "Zugang zu Ihrem institutionellen Terminal.",
    loginSideFooter: "Institutionelle Sicherheit",
    loginErrorMessage: "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.",
    registerErrorMessage: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    registerSuccessMessage: "Konto erfolgreich erstellt!",
    registerSideFooter: "Geschützt durch institutionelle Sicherheit",
    welcomeBackTitle: "Willkommen Zurück",
    welcomeBackHighlight: "Institutionelles Terminal",
    accountNotFound: "Konto nicht gefunden. Bitte erstellen Sie zuerst ein Konto.",
    rememberMe: "Angemeldet bleiben",
    registerLink: "Konto erstellen",
    passwordPlaceholder: "Passwort",
    accountNotFoundError: "Konto nicht gefunden. Bitte erstellen Sie zuerst ein Konto.",
    resetPasswordSent: "Falls ein Konto für diese E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
    resetPasswordError: "Der Link zum Zurücksetzen konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    enterEmailFirst: "Geben Sie zuerst Ihre E-Mail-Adresse ein."
  },
  hero: {
    title1: "ALGORITHMISCHES",
    title2: "ELITE-KAPITALMANAGEMENT",
    desc: "Setzen Sie institutionelle quantitative Strategien ein, die für den modernen Markt entwickelt wurden. Erleben Sie Ausführungspräzision im Millisekundenbereich und fortschrittliche Risikominderungsprotokolle.",
    getStarted: "INVESTMENTPLÄNE ERKUNDEN",
    viewStrategies: "TECHNISCHE METHODIK"
  },
  stats: {
    volume: "Strategisches Kapitalmanagement",
    traders: "Aktive Konten",
    uptime: "Infrastruktur-Uptime",
    latency: "Ausführungspräzision"
  },
  methodology: {
    badge: "METHODIK",
    title: "QUANTITATIVE MODELLE",
    statArb: {
      title: "STATISTISCHE ARBITRAGE",
      desc: "Ausnutzung temporärer Preisineffizienzen zwischen korrelierten Assets mittels Kointegrationsmodellen und Pair Trading.",
      f1: "Kointegrationsanalyse",
      f2: "Pair-Selection-Algorithmen",
      f3: "Z-Score-Schwellenwert"
    },
    meanRev: {
      title: "MEAN REVERSION",
      desc: "Identifikation von Preisabweichungen von historischen Durchschnitten mit systematischen Ein- und Ausstiegsregeln.",
      f1: "Bollinger-Band-Signale",
      f2: "RSI-Divergenz-Erkennung",
      f3: "Ornstein-Uhlenbeck-Modelle"
    },
    hft: {
      title: "HOCHFREQUENZHANDEL",
      desc: "Ultra-Low-Latency-Ausführungsstrategien mit co-lokalisierter Infrastruktur für Orderplatzierung im Mikrosekundenbereich.",
      f1: "Marktmikrostruktur",
      f2: "Order-Flow-Analyse",
      f3: "Latenz-Arbitrage"
    }
  },
  transparency: {
    badge: "INFRASTRUKTUR",
    title: "TRANSPARENTE TECHNOLOGIE",
    desc: "Unsere Infrastruktur basiert auf Enterprise-Grundlagen und gewährleistet Zuverlässigkeit, Geschwindigkeit und Sicherheit.",
    connectivity: {
      title: "KONNEKTIVITÄT",
      desc: "Direkter Marktzugang über Equinix-Rechenzentren (NY5, LD4, TY3) mit latenzarmer Anbindung an die wichtigsten Börsen (nicht verifiziert)."
    },
    cloud: {
      title: "CLOUD-AUSFÜHRUNG",
      desc: "Redundante Ausführungsengines auf AWS (us-east-1, eu-west-1) und Azure für Failover-Resilienz (nicht verifiziert)."
    },
    security: {
      title: "SICHERHEIT",
      desc: "Ende-zu-Ende-Verschlüsselung, SOC-2-Type-II-Konformität und mehrschichtige Authentifizierung für alle Vorgänge (nicht verifiziert)."
    },
    warning: "Märkte sind volatil. Renditen sind niemals garantiert, und Verluste können auch bei robusten Schutzmaßnahmen auftreten.",
    protocolTitle: "Für institutionelle Nutzung konzipiertes Protokoll",
    protocolDesc: "Unsere Infrastruktur folgt strengen Compliance- und Risikomanagementstandards, um operative Sicherheit anzustreben (keine Garantie)."
  },
  process_home: {
    badge: "PROZESS",
    title: "INSTITUTIONELLER",
    subtitle: "WORKFLOW",
    step1: {
      title: "REGISTRIERUNG",
      desc: "Sicheres Onboarding und Identitätsverifizierung."
    },
    step2: {
      title: "ALLOKATION",
      desc: "Auswahl der verwalteten Kapitalstufe."
    },
    step3: {
      title: "INTEGRATION",
      desc: "Bereitstellung der algorithmischen Infrastruktur."
    },
    step4: {
      title: "ÜBERWACHUNG",
      desc: "Echtzeit-Performance-Tracking über Terminal."
    },
    step5: {
      title: "LIQUIDITÄT",
      desc: "Vereinfachte Gewinnabhebungsprotokolle."
    }
  },
  cta_home: {
    badge: "CHANCE",
    title: "SKALIEREN SIE IHR",
    subtitle: "KAPITAL",
    desc: "Treten Sie der Elite-Gruppe von Investoren bei, die Braxels proprietäre Infrastruktur nutzen.",
    btn: "ALLOKATION STARTEN",
    trust: "Institutionelle Sicherheit"
  },
  pricing: {
    badge: "TRANSPARENZ",
    title: "KAPITAL-",
    subtitle: "ALLOKATIONEN",
    desc: "Institutionelle Infrastruktur mit transparenter Gebührenstruktur.",
    select: "DIESEN PLAN SICHERN",
    allocation: "VERWALTETES KAPITAL",
    month: "monatliche Gebühr",
    detectedCurrency: "Alle Preise werden in USD ({{currency}}) berechnet, unabhängig von Ihrem Standort",
    managedCapitalUsdNote: "Verwaltetes Kapital (Capital Gerenciado) wird immer in USD angegeben."
  },
  plans: {
    starter: "Einsteiger",
    starterFeatures: "Funktionen des Einsteiger-Pakets",
    managedCapital: "Verwaltetes Kapital",
    features: {
      automation: "Automatisierung",
      accountManagement: "Kontoverwaltung",
      emailSupport: "E-Mail-Support",
      controlledRisk: "Kontrolliertes Risiko",
      starterFeatures: "Funktionen des Einsteiger-Pakets",
      prioritySupport: "Prioritäts-Support",
      detailedLogs: "Detaillierte Protokolle",
      proFeatures: "Pro-Funktionen",
      multiAccount: "Multi-Konto",
      weeklyReports: "Wochenberichte",
      advancedFeatures: "Erweiterte Funktionen",
      support247: "24/7-Support",
      dedicatedManager: "Dedizierter Manager"
    },
    professional: "Professional",
    professionalFeatures: "Funktionen des Professional-Pakets",
    business: "Business",
    businessFeatures: "Funktionen des Business-Pakets",
    enterprise: "Enterprise",
    enterpriseFeatures: "Funktionen des Enterprise-Pakets"
  },
  howItWorks: {
    badge: "INFRASTRUKTUR",
    title: "TECHNISCHE",
    subtitle: "ARCHITEKTUR",
    desc: "Unser proprietäres Ökosystem ist auf Geschwindigkeit, Sicherheit und konsistente Performance ausgelegt.",
    steps: [
      {
        title: "REGISTRIERUNG",
        desc: "Erstellen Sie Ihr institutionelles Profil."
      },
      {
        title: "DASHBOARD",
        desc: "Zugang zu Ihrem privaten Management-Terminal."
      },
      {
        title: "PLANAUSWAHL",
        desc: "Wählen Sie Ihre Kapitalallokationsstufe."
      },
      {
        title: "API-BEREITSTELLUNG",
        desc: "Automatisierte Anbindung an globale Märkte."
      },
      {
        title: "AUSFÜHRUNG",
        desc: "Orderverarbeitung in Millisekunden."
      },
      {
        title: "REPORTING",
        desc: "Detaillierte wöchentliche Performance-Analysen."
      }
    ],
    cta: "BEREIT ZU STARTEN?",
    ctaBtn: "DEM NETZWERK BEITRETEN"
  },
  about: {
    badge: "ÜBER UNS",
    title: "INSTITUTIONELLE",
    subtitle: "EXZELLENZ",
    desc: "Braxel Markets repräsentiert den Gipfel des algorithmischen Kapitalmanagements.",
    historyTitle: "UNSERE GESCHICHTE",
    historyDesc1: "Gegründet von einem Team aus quantitativen Analysten und Software-Ingenieuren, wurde Braxel geschaffen, um die Lücke zwischen Retail-Kapital und institutioneller Technologie zu schließen.",
    historyDesc2: "Heute konzentrieren wir uns auf risikoadjustierte Renditen und Infrastrukturstabilität und bieten modernste algorithmische Strategien für den modernen Investor.",
    stats: {
      founded: "Gegründet",
      users: "Aktive Nutzer",
      uptime: "Verfügbarkeit",
      support: "Support"
    },
    values: {
      mission: "MISSION",
      missionDesc: "Elite-algorithmische Infrastruktur für globales Kapital bereitzustellen.",
      vision: "VISION",
      visionDesc: "Die Zukunft des automatisierten quantitativen Managements zu definieren.",
      values: "WERTE",
      valuesDesc: "Transparenz, Präzision und unerschütterliche Sicherheit."
    },
    teamTitle: "FÜHRUNGSTEAM",
    teamDesc: "Lernen Sie die Gründer und Manager hinter Braxel Markets kennen.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Gründer & CEO",
        bio: "Quantitativer Stratege und Unternehmer, der die Vision von Braxel Markets für institutionelle algorithmische Infrastruktur leitet.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "FÜHRUNG"
  },
  contact: {
    badge: "SUPPORT",
    title: "INSTITUTIONELLE",
    subtitle: "KANÄLE",
    desc: "Unser engagiertes Support-Team ist 24/7 für institutionelle Anfragen verfügbar.",
    infoTitle: "KONTAKT",
    formTitle: "DIREKTE ANFRAGE",
    placeholders: {
      name: "VOLLSTÄNDIGER NAME",
      email: "E-MAIL-ADRESSE",
      subject: "BETREFF",
      message: "NACHRICHT"
    },
    sendBtn: "ANFRAGE SENDEN",
    supportHours: "Supportzeiten",
    institutionalSupport: "24/7 Institutioneller Support",
    securityChallenge: "Sicherheitsfrage",
    securityAnswer: "Antwort",
    incorrectAnswer: "Falsche Sicherheitsantwort. Bitte versuchen Sie es erneut.",
    waitMessage: "Bitte warten Sie einen Moment, bevor Sie eine weitere Nachricht senden.",
    messageSent: "Nachricht erfolgreich gesendet! Unser Team wird Sie in Kürze kontaktieren.",
    messageFailed: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder senden Sie uns eine E-Mail direkt an marketsbraxel@ouvidor.net",
    cooldown: "BITTE WARTEN",
    consentPre: "Mit dem Absenden dieses Formulars stimmen Sie unserer",
    consentPost: "Wir verwenden Ihre Daten nur, um auf Ihre Anfrage zu antworten.",
    emailLabel: "E-Mail"
  },
  dashboard: {
    portfolio: "Portfolio",
    activeServices: "Aktive Dienste",
    newAllocation: "Neue Allokation",
    noServices: "Keine aktiven Investmentpläne gefunden.",
    balance: "Aktueller Saldo",
    withdraw: "Abhebung",
    liquidity: "Liquidität",
    requestWithdraw: "Abhebung beantragen",
    selectAccount: "Konto auswählen",
    amount: "Betrag (USD)",
    iban: "IBAN / Bankdaten",
    btnWithdraw: "ABHEBUNGSANTRAG EINREICHEN",
    profile: "Profilverwaltung",
    settings: "Einstellungen",
    firstName: "Vorname",
    lastName: "Nachname",
    saveChanges: "ÄNDERUNGEN SPEICHERN",
    verifiedAccount: "Verifiziertes Konto",
    accountStandard: "Standardkonto",
    withdrawal: {
      gateTitle: "Identitätsprüfung erforderlich",
      gateWhy: "Zum Schutz Ihrer Gelder und zur Einhaltung der Vorschriften ist vor einer Auszahlung eine Identitätsprüfung (KYC) erforderlich. Ohne sie können Sie weiterhin handeln.",
      gateRejectedDesc: "Ihre vorherige Einreichung wurde nicht akzeptiert. Prüfen Sie den Grund unten und reichen Sie Ihre Dokumente erneut ein.",
      gateUnderReview: "Ihre Dokumente werden geprüft. Wir benachrichtigen Sie per E-Mail, sobald eine Entscheidung vorliegt. Bis dahin können Sie keine Auszahlung beantragen.",
      kycStatusLabel: "Verifizierungsstatus",
      statusPending: "Nicht eingereicht",
      statusSubmitted: "In Prüfung",
      statusApproved: "Genehmigt",
      statusRejected: "Abgelehnt",
      rejectedReason: "Grund",
      continueToForm: "Weiter zur Auszahlung",
      submitDocs: "Dokumente einreichen",
      resubmit: "Dokumente erneut einreichen",
      uploadFront: "Ausweisdokument (Vorderseite)",
      uploadBack: "Ausweisdokument (Rückseite)",
      uploadSelfie: "Selfie mit Ausweis",
      chooseFile: "Datei wählen",
      fileHint: "JPG, PNG oder PDF, bis 10 MB",
      selfieHint: "Klares Foto Ihres Gesichts mit dem Dokument",
      optional: "Optional",
      frontRequired: "Bitte fügen Sie die Vorderseite Ihres Ausweises an.",
      fileTooLarge: "Die Datei ist größer als 10 MB.",
      uploadError: "Ihre Dokumente konnten nicht übermittelt werden. Bitte erneut versuchen.",
      documentsSubmitted: "Dokumente übermittelt. Wir prüfen sie in Kürze.",
    },
    totalAUM: "Gesamtes verwaltetes Vermögen",
    activeAlgos: "Aktive Algorithmen",
    systemStatus: "Systemstatus",
    operational: "Betriebsbereit",
    infraProtection: "Infrastrukturschutz",
    twoFactor: "Zwei-Faktor-Authentifizierung",
    notEnabled: "Nicht aktiviert",
    enable2FA: "2FA aktivieren",
    kycStatus: "KYC-Verifizierung",
    verified: "Verifiziert",
    viewDocs: "Dokumente anzeigen",
    investor: "Investor",
    kycRequired: "KYC-Verifizierung Erforderlich",
    kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.",
    kycUnderReview: "KYC in Prüfung",
    kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.",
    kycRejected: "Верификация KYC отклонена",
    kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.",
    resubmitDocs: "Повторно отправить документы",
    completeVerification: "Завершить верификацию",
    verificationRequired: "Требуется верификация",
    goToVerification: "Перейти к верификации",
    totalProfit: "Общая прибыль",
    drawdown: "Drawdown",
    maxDrawdown: "Макс. просадка",
    assetsInOperation: "Активы в работе",
    monthlyReturns: "Месячная доходность",
    analytics: "Аналитика",
    newWithdrawalRequest: "Новая заявка на вывод",
    walletIban: "Wallet / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Banküberweisung (SWIFT)"
    },
    transactionHistory: "История транзакций",
    operations: "Операции",
    asset: "Asset",
    type: "Тип",
    entry: "Вход",
    exit: "Выход",
    profit: "Прибыль",
    time: "Время",
    status: "Status",
    open: "Открыт",
    closed: "Закрыт",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Krypto-Wallet-Adresse oder IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "6-stelligen Code eingeben",
    minPasswordPlaceholder: "Mindestens 8 Zeichen",
    confirmPasswordPlaceholder: "Neues Passwort erneut eingeben",
    accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.",
    loginSuccess: "Вход выполнен успешно!",
    rememberMe: "Запомнить меня",
    navPerformance: "Leistung",
    navAuditLog: "Audit-Protokoll",
    tabProfile: "Profil",
    tabKycVerification: "KYC-Verifizierung",
    tabSecurity: "Sicherheit",
    kycCompleteDesc: "Schließen Sie Ihre KYC-Verifizierung ab, um auf alle Plattformfunktionen zuzugreifen. Dies ist eine obligatorische Compliance-Anforderung für alle Konten.",
    kyc: {
      approved: "Verifizierung Genehmigt",
      underReview: "Dokumente in Prüfung",
      rejected: "Verifizierung Abgelehnt",
      required: "Verifizierung Erforderlich",
      descApproved: "Ihre Identität wurde verifiziert. Alle Funktionen sind freigeschaltet.",
      descSubmitted: "Unser Compliance-Team prüft Ihre Dokumente. Dies dauert normalerweise 24-48 Stunden.",
      descRejected: "Ihre Dokumente wurden nicht akzeptiert. Bitte reichen Sie sie mit gültiger Dokumentation erneut ein.",
      descRequired: "Schließen Sie die Identitätsverifizierung ab, um alle Plattformfunktionen freizuschalten.",
      stepCountry: "Land",
      stepMethod: "Methode",
      stepDocument: "Dokument",
      stepReview: "Überprüfung",
      selectCountry: "Wählen Sie Ihr Land",
      selectCountryDesc: "Wählen Sie das Land, das Ihr Ausweisdokument ausgestellt hat.",
      selectCountryPlaceholder: "Wählen Sie ein Land...",
      selectMethod: "Verifizierungsmethode Wählen",
      selectMethodDesc: "Wählen Sie, wie Sie Ihre Identität für {{country}} verifizieren möchten.",
      uploadDocument: "Dokument Hochladen",
      uploadDocumentDesc: "Wählen Sie ein gültiges Dokument aus den Optionen unten und laden Sie es hoch.",
      clickToUpload: "Klicken Sie zum Hochladen oder ziehen und ablegen",
      submitting: "Wird gesendet...",
      submitForVerification: "Zur Verifizierung Einreichen",
      progressTitle: "Verifizierungsfortschritt",
      stepEmailVerification: "E-Mail-Verifizierung",
      stepIdentityDocument: "Ausweis",
      stepComplianceReview: "Compliance-Prüfung",
      stepAccountActivation: "Kontoaktivierung",
      statusInProgress: "In Bearbeitung",
      statusComplete: "Abgeschlossen",
      statusPending: "Ausstehend",
      changePassword: "Passwort Ändern",
      updateCredentials: "Aktualisieren Sie Ihre Anmeldedaten",
      newPassword: "Neues Passwort",
      confirmNewPassword: "Neues Passwort Bestätigen",
      emailVerification: "E-Mail-Verifizierung",
      verified: "Verifiziert",
      verifiedEmail: "Verifizierte E-Mail",
      securityActivityLog: "Sicherheitsaktivitätsprotokoll",
      scanAuthenticator: "Scannen Sie mit Ihrer Authenticator-App",
      eventLoginNewDevice: "Anmeldung von neuem Gerät",
      eventPasswordChanged: "Passwort geändert",
      eventAccountCreated: "Konto erstellt",
      timeHoursAgo: "vor {{count}} Stunden",
      timeDaysAgo: "vor {{count}} Tagen"
    },
    newEmailLabel: "Neue E-Mail-Adresse",
    sendConfirmationLink: "Bestätigungslink senden",
    identityVerified: "Ihre Identität wurde verifiziert! Alle Funktionen sind jetzt freigeschaltet.",
    verificationRejected: "Ihre Verifizierung wurde abgelehnt. Bitte reichen Sie Ihre Dokumente erneut ein.",
    profileUpdated: "Profil erfolgreich aktualisiert.",
    failedUpdateProfile: "Profilaktualisierung fehlgeschlagen.",
    differentEmail: "Bitte geben Sie eine andere E-Mail-Adresse ein.",
    confirmationLinkSent: "Ein Bestätigungslink wurde an die neue E-Mail-Adresse gesendet. Bitte bestätigen Sie, um die Änderung abzuschließen.",
    failedEmail: "E-Mail-Aktualisierung fehlgeschlagen.",
    passwordsDoNotMatch: "Die Passwörter stimmen nicht überein.",
    passwordTooShort: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    passwordChanged: "Passwort erfolgreich geändert.",
    failedPassword: "Passwortänderung fehlgeschlagen.",
    uploadDocument: "Bitte laden Sie ein Dokument hoch.",
    completeSteps: "Bitte schließen Sie alle Verifizierungsschritte ab.",
    documentsSubmitted: "Dokumente zur Verifizierung eingereicht. Sie werden nach der Prüfung benachrichtigt.",
    failedDocuments: "Dokumente konnten nicht eingereicht werden.",
    performanceTitle: "Performance-Dashboard",
    auditLogTitle: "Prüfprotokoll",
    auditLogDesc: "Alle algorithmischen Aufträge, die auf Ihrem Konto ausgeführt wurden.",
    accountSettingsTitle: "Kontoeinstellungen",
    personalInformation: "Persönliche Informationen",
    emailAddress: "E-Mail-Adresse",
    emailChangeNotice: "Das Ändern Ihrer E-Mail erfordert eine Verifizierung. Ein Bestätigungslink wird an die neue E-Mail-Adresse gesendet.",
    currentEmail: "Aktuelle E-Mail",
    confirmationSent: "Bestätigung gesendet",
    tryDifferentEmail: "Andere E-Mail versuchen",
    continueToMethod: "Weiter zur Methodenauswahl",
    uploadHint: "PNG, JPG, PDF bis 10 MB",
    twoFactorDesc: "Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu. Verwenden Sie eine Authentifizierungs-App wie Google Authenticator oder Authy.",
    qrCode: "QR-Code",
    kycRequiredBanner: "KYC erforderlich",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Netzwerk",
    emailChangeInboxNotice: "Bitte prüfen Sie Ihren Posteingang und klicken Sie auf den Link, um die E-Mail-Änderung abzuschließen.",
    emailChangeSentTo: "Ein Bestätigungslink wurde an {{email}} gesendet. Bitte prüfen Sie Ihren Posteingang und klicken Sie auf den Link, um die E-Mail-Änderung abzuschließen.",
    growthPerformanceMtd: "Wachstumsperformance (laufender Monat)"
  },
  checkout: {
    summary: "ZUSAMMENFASSUNG",
    allocationTitle: "Institutionelle",
    allocationSubtitle: "Allokation",
    tierLabel: "Algorithmische Infrastrukturstufe",
    billedMonthly: "Monatlich abgerechnet",
    detailsTitle: "Allokationsdetails",
    managedCapital: "Verwaltetes Kapital",
    setupFee: "Einrichtungsgebühr",
    waived: "ERLASSEN",
    latency: "Ausführungslatenz",
    infrastructureTitle: "Enthaltene Infrastruktur",
    realTimeMonitoring: "Echtzeitüberwachung",
    activeUponDeployment: "Aktiv nach Bereitstellung",
    totalDue: "Gesamtbetrag",
    dedicatedNode: "Dedizierter Knoten",
    globalMarkets: "Globale Märkte",
    instantSetup: "Sofortige Einrichtung",
    authRequired: "AUTHENTIFIZIERUNG ERFORDERLICH",
    authDesc: "Bitte melden Sie sich an oder erstellen Sie ein Konto, um mit der Allokation fortzufahren.",
    btnLogin: "ANMELDEN ZUM FORTFAHREN",
    btnRegister: "KONTO ERSTELLEN",
    confirmDeployment: "Bereitstellung bestätigen",
    deploymentDesc: "Mit der Bestätigung autorisieren Sie die Bereitstellung der algorithmischen Infrastruktur für den Plan {{plan}}.",
    proceedPayment: "ZUR SICHEREN ZAHLUNG",
    secureGateway: "Sicheres Gateway",
    back: "Zurück",
    riskDisclosure: "Risikohinweis: Algorithmischer Handel birgt erhebliches Verlustrisiko. Vergangene Performance ist kein Indikator für zukünftige Ergebnisse.",
    secureTransaction: "Sichere Transaktion",
    paypalNote: "Ihre Zahlungsinformationen werden sicher über PayPal verarbeitet. Braxel Markets speichert keine Kartendaten.",
    encryptionNote: "Verschlüsselt mit institutionellen AES-256-Standards",
    verifying: "Institutionelle Transaktion wird verifiziert...",
    loading: "Terminal wird geladen...",
    globalInfra: "Globale Zahlungsinfrastruktur",
    qrCode: "QR-Code",
    allCards: "Alle Karten",
    selectPaymentMethod: "Zahlungsmethode auswählen",
    choosePayment: "Wahlen Sie wie Sie zahlen mochten",
    creditCard: "Kreditkarte",
    instantPayment: "Sofortzahlung",
    cardDesc: "Visa, Mastercard und weitere Karten",
    crypto: "Kryptowahrung",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Schnelle und sichere Krypto-Transaktion",
    securePayment: "Sichere Zahlung",
    cardNumber: "Kartennummer",
    cardName: "Name auf der Karte",
    cardExpiry: "Ablaufdatum",
    payNow: "JETZT BEZAHLEN",
    amountToPay: "Zu zahlender Betrag",
    selectNetwork: "Netzwerk Wahlen",
    yourAddress: "Einzahlungsadresse",
    yourAddressPlaceholder: "USDT-Adresse eingeben",
    important: "WICHTIG",
    cryptoNote: "Senden Sie den genauen Betrag um den Plan zu erhalten",
    sendExactAmount: "Senden Sie GENAU diesen Betrag, um Verzögerungen zu vermeiden",
    confirmCrypto: "MIT CRYPTO BESTATIGEN",
    copied: "Kopiert!",
    cryptoPending: "Zahlung registriert! Bestatigung abwarten.",
    processing: "Verarbeitung...",
    paymentSuccess: "Zahlung genehmigt!",
    selectCountry: "Land auswählen",
    searchCountry: "Land suchen...",
    phone: "Telefonnummer",
    fillAllFields: "Fullen Sie alle Felder aus",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "VOLLSTÄNDIGER NAME",
    cardExpiryPlaceholder: "MM/JJ",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Zahlung fehlgeschlagen",
    paymentError: "Zahlungsfehler",
    amountToSend: "Zu sendender Betrag",
    paymentReference: "Geben Sie Ihre E-Mail als Zahlungsreferenz an",
    wiseTransfer: "Banküberweisung",
    bankDetails: "Bankdaten",
    accountHolder: "Kontoinhaber",
    accountNumber: "Kontonummer",
    bankName: "Bankname",
    bankAddress: "Bankadresse",
    routingNumber: "Routing-Nummer",
    confirmWise: "ÜBERWEISUNG BESTÄTIGEN",
    wiseDesc: "Überweisen Sie direkt auf unser Bankkonto über Wise",
    wiseNote: "Klicken Sie nach der Überweisung unten auf Bestätigen. Ihr Konto wird nach der Verifizierung aktiviert (1-3 Werktage).",
    wiseInternational: "Internationale Überweisung",
    openWise: "Wise-Website öffnen",
    transferInstructions: "Überweisungsanleitung",
    lowFees: "Niedrige Gebühren",
    noKyc: "KYC erforderlich",
    anyCountry: "Jedes Land",
    wiseConfirmRequired: "Bitte bestätigen Sie, dass Sie die Überweisung getätigt haben",
    wiseConfirmText: "Ich habe die Banküberweisung getätigt und bestätige, dass der gesendete Betrag dem Planpreis entspricht.",
    wisePaymentSuccess: "Zahlung bestätigt! Ihr Konto wird eingerichtet.",
    wiseStep1: "Kopieren Sie die Bankdaten unten",
    wiseStep2: "Führen Sie eine Überweisung von Ihrer Bank oder Ihrem Wise-Konto aus",
    wiseStep3: "Klicken Sie nach der Überweisung auf Bestätigen",
    subscriptionTitle: "ABONNEMENT",
    subscriptionSubtitle: "SERVICEPLAN",
    serviceAccess: "Servicezugang",
    confirmCard: "KARTE BESTÄTIGEN",
    redirecting: "Weiterleitung zur Zahlung...",
    card: "Kredit- / Debitkarte",
    testModeBanner: "TESTMODUS — Kein echtes Geld. Keine echte Bank. Keine echte Wallet. Keine echte Aktivierung.",
    startFailed: "Die Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.",
    notConfigured: "Zahlungen sind noch nicht vollständig konfiguriert. Versuchen Sie eine andere Methode oder kontaktieren Sie den Support.",
    invalidPlanTitle: "UNGÜLTIGER TARIF",
    invalidPlanDesc: "Der ausgewählte Tarif ist nicht mehr verfügbar. Bitte wählen Sie erneut einen Tarif.",
    swiftLabel: "SWIFT",
    referenceLabel: "Referenz",
  },
  legal: {
    badgeLegal: "RECHTLICHES",
    termsTitle: "NUTZUNGSBEDINGUNGEN"
  },
  faq: {
    title: "HÄUFIG GESTELLTE FRAGEN",
    badge: "HÄUFIGE FRAGEN",
    q1: "Ist Vorerfahrung notwendig?",
    a1: "Nein. Unsere Infrastruktur ist vollständig automatisiert. Sie müssen nur Ihre Allokationsstufe wählen und die Performance über Ihr Terminal überwachen.",
    q2: "Welche Risiken sind beteiligt?",
    a2: "Wie an jedem Finanzmarkt bestehen Risiken eines Kapitalverlusts durch Volatilität. Wir verwenden fortschrittliche Minderungsprotokolle zum Kapitalschutz.",
    q3: "Wie funktioniert das System?",
    a3: "Unsere proprietären Algorithmen führen hochfrequente quantitative Strategien an globalen Märkten mit Millisekundenpräzision aus.",
    q4: "Kann ich meinen Plan kündigen?",
    a4: "Ja. Sie können jederzeit die Kündigung und den Kapitalabzug über die Protokolle Ihres Dashboards beantragen."
  },
  diffs: {
    title: "WARUM BRAXEL MARKETS?",
    badge: "UNTERSCHEIDUNGSMERKMALE",
    t1: "Proprietäre Technologie",
    d1: "Neuronale Netze für institutionelle Ausführung entwickelt.",
    t2: "Vollständige Automatisierung",
    d2: "24/7 algorithmisches Management ohne menschliche emotionale Verzerrung.",
    t3: "Vereinfachter Zugang",
    d3: "Institutionelle Infrastruktur über ein intuitives Terminal zugänglich.",
    t4: "Professionelles Niveau",
    d4: "Direkte Verbindung zu globalen Liquiditätspools mit ultra-niedriger Latenz."
  },
  signals: {
    title: "ALGORITHMISCHE",
    subtitle: "AUSFÜHRUNG",
    badge: "ECHTZEIT-TERMINAL",
    desc: "Überwachen Sie unsere proprietäre Infrastruktur in Echtzeit. Jedes Signal wird von unseren neuronalen Netzen mit Millisekundenpräzision verarbeitet.",
    asset: "ASSET",
    type: "TYP",
    entry: "EINSTIEG",
    profit: "GEWINN",
    status: "STATUS",
    active: "AKTIV",
    completed: "ABGESCHLOSSEN",
    institutionalVerification: "Institutionelle Verifizierung",
    realtimeFeed: "Echtzeit-Datenfeed aus globalen Liquiditätspools.",
    liveTerminal: "LIVE-TERMINAL",
    connected: "VERBUNDEN"
  },
  application: {
    title: "ANTRAG",
    subtitle: "EINREICHUNG",
    plan_selected: "Ausgewählter Plan",
    billed_monthly: "Monatlich abgerechnet",
    plan_description: "Sie sind im Begriff, das Abonnement für den Dienst {{plan}} zu erwerben.",
    plan_price_detail: "Monatliche Gebühr: {{price}} (monatlich zu zahlen)",
    full_name: "Vollständiger Name",
    full_name_placeholder: "Geben Sie Ihren vollständigen Namen ein",
    email: "E-Mail-Adresse",
    email_placeholder: "Geben Sie Ihre E-Mail ein",
    address_line1: "Adresse — Zeile 1",
    address_line1_placeholder: "Straße und Hausnummer",
    address_line2: "Adresszusatz",
    address_line2_placeholder: "Wohnung, Etage, Einheit usw. (optional)",
    city: "Stadt",
    city_placeholder: "Stadt",
    region: "Bundesland / Region",
    region_placeholder: "Bundesland oder Region",
    postal_code: "PLZ",
    postal_code_placeholder: "Postleitzahl",
    country: "Land",
    country_placeholder: "Land",
    phone: "Telefon",
    phone_placeholder: "Telefonnummer",
    terms_accepted: "Ich akzeptiere die Nutzungsbedingungen",
    privacy_accepted: "Ich akzeptiere die Datenschutzerklärung",
    viewTerms: "AGB ansehen",
    viewPrivacy: "Datenschutzerklärung ansehen",
    customer_note: "Kundennotiz (optional)",
    customer_note_placeholder: "Zusätzliche Informationen, die Sie uns mitteilen möchten",
    note_limit: "Maximal {{count}} Zeichen",
    characters: "Zeichen",
    submitting: "Wird gesendet...",
    submit: "ANTRAG EINREICHEN",
    errors: {
      full_name_required: "Der vollständige Name ist erforderlich",
      email_required: "Die E-Mail-Adresse ist erforderlich",
      email_invalid: "Ungültige E-Mail-Adresse",
      address_line1_required: "Die Adresse ist erforderlich",
      city_required: "Die Stadt ist erforderlich",
      country_required: "Das Land ist erforderlich",
      terms_required: "Sie müssen die Nutzungsbedingungen akzeptieren",
      privacy_required: "Sie müssen die Datenschutzerklärung akzeptieren",
      note_too_long: "Die Notiz darf höchstens 500 Zeichen lang sein",
      submit_failed: "Übermittlung fehlgeschlagen. Bitte versuchen Sie es erneut."
    }
  },
  checkoutSuccess: {
    verifying: "Zahlung wird geprüft…",
    backToPricing: "Zurück zu den Plänen",
    couldNotVerify: "Ihre Zahlung konnte noch nicht verifiziert werden",
    couldNotVerifyDesc: "Wenn Sie den Checkout abgeschlossen haben, keine Sorge — Ihre Zahlung wird verarbeitet und Ihr Konto wird in Kürze aktiviert. Aktualisieren Sie diese Seite gleich.",
    verifiedBadge: "Verifiziert",
    paymentCompleted: "Zahlung abgeschlossen",
    activationNotice: "Ihr Konto wird in wenigen Minuten aktiviert.",
    paymentId: "Zahlungs-ID",
    applicationId: "Antrags-ID",
    securityNotice: "Aus Sicherheitsgründen werden Konten nach der Zahlungsprüfung manuell durch einen Operator aktiviert. Sie erhalten den Zugriff, sobald die Prüfung abgeschlossen ist.",
    goToDashboard: "Zum Dashboard",
    contactSupport: "Support kontaktieren",
    verifyingBadge: "Wird geprüft",
    paymentReceived: "Zahlung eingegangen. Wir prüfen die Zahlung.",
    beingVerified: "Ihre Zahlung wird geprüft. Diese Seite wird automatisch aktualisiert, sobald Ihre Zahlung bestätigt ist. Schließen Sie dieses Fenster nicht.",
    currentStatus: "Aktueller Status",
    urlSecurityNotice: "Aus Sicherheitsgründen wird eine Zahlung auf dieser Seite nicht allein anhand der URL als abgeschlossen markiert. Wir warten auf die serverseitige Bestätigung."
  },
  termsPage: {
    title: "Nutzungsbedingungen",
    entityTitle: "Vertragspartei",
    entityText: "[Name der juristischen Person, Registernummer, Gerichtsstand]",
    descriptionTitle: "Leistungsbeschreibung",
    descriptionText: "Braxel Markets stellt über seine Plattform algorithmische Handelsinfrastruktur auf institutionellem Niveau und damit verbundene Dienstleistungen bereit.",
    feesTitle: "Gebühren und Zahlungen",
    feesText: "Die Gebühren für unsere Dienstleistungen sind auf der Preisseite aufgeführt und können mit vorheriger Ankündigung geändert werden. Zu den Zahlungsmethoden gehören Banküberweisung, Kreditkarte und Kryptowährung.",
    eligibilityTitle: "Berechtigung",
    eligibilityText: "Unsere Dienstleistungen stehen natürlichen und juristischen Personen zur Verfügung, die mindestens 18 Jahre alt sind und unsere Know-Your-Customer- (KYC) und Anti-Geldwäsche-Anforderungen (AML) erfüllen.",
    accountTerminationTitle: "Kontokündigung",
    accountTerminationText: "Jede Partei kann das Konto mit einer schriftlichen Kündigungsfrist von [PLACEHOLDER: Kündigungsfrist, z. B. 30 Tage] kündigen. Braxel Markets kann bei Verstoß gegen die Bedingungen, illegaler Aktivität oder regulatorischen Anforderungen sofort kündigen.",
    limitationOfLiabilityTitle: "Haftungsbeschränkung",
    limitationOfLiabilityText: "Soweit gesetzlich zulässig, haftet Braxel Markets nicht für indirekte, zufällige, besondere, Folge- oder Strafschäden oder für Daten-, Nutzungs-, Geschäftswert- oder sonstige immaterielle Verluste, die aus Ihrem Zugriff auf oder Ihrer Nutzung unserer Dienste resultieren.",
    disputeResolutionTitle: "Streitbeilegung und anwendbares Recht",
    disputeResolutionText: "Diese Bedingungen unterliegen dem Recht von [PLACEHOLDER: Gerichtsstand] und werden nach diesem ausgelegt. Alle Streitigkeiten, die sich aus oder im Zusammenhang mit diesen Bedingungen ergeben, unterliegen der ausschließlichen Zuständigkeit der Gerichte von [PLACEHOLDER: Gerichtsstand].",
    changesToTermsTitle: "Änderungen dieser Bedingungen",
    changesToTermsText: "Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern oder zu ersetzen. Bei einer wesentlichen Änderung kündigen wir mindestens [PLACEHOLDER: Kündigungsfrist, z. B. 30 Tage] vor Inkrafttreten der neuen Bedingungen an. Was eine wesentliche Änderung darstellt, liegt in unserem alleinigen Ermessen.",
    effectiveDateTitle: "Datum des Inkrafttretens",
    effectiveDateText: "Datum des Inkrafttretens: [PLACEHOLDER: Datum]",
    contactTitle: "Kontakt",
    contactText: "Bei Fragen zu diesen Bedingungen kontaktieren Sie uns bitte unter [PLACEHOLDER: Kontakt-E-Mail oder Adresse]."
  },
  legalDraftBanner: "Diese Seite ist ein Entwurf in rechtlicher Prüfung und noch nicht endgültig.",
  notFound: {
    title: "404",
    message: "Entschuldigung, die gesuchte Seite existiert nicht.",
    returnHome: "Zur Startseite"
  },
  authCallback: {
    confirmingTitle: "Ihr Konto wird bestätigt...",
    confirmingDesc: "Bitte warten Sie, während wir Ihre E-Mail verifizieren.",
    confirmedTitle: "E-Mail bestätigt!",
    confirmedDesc: "Ihr Konto wurde erfolgreich verifiziert.",
    redirecting: "Weiterleitung zur Anmeldung...",
    failedTitle: "Bestätigung fehlgeschlagen",
    goToLogin: "Zur Anmeldung",
    invalidLink: "Ungültiger oder abgelaufener Bestätigungslink",
    failedConfirm: "E-Mail konnte nicht bestätigt werden"
  },
  paymentsDisabled: {
    title: "Zahlungen sind derzeit deaktiviert.",
    desc: "Das Zahlungssystem ist noch nicht aktiv. Um Zahlungen zu aktivieren, kontaktieren Sie den Betreiber unter",
    managedBy: "Die Zahlungsabwicklung wird ausschließlich vom Plattformbetreiber verwaltet. Bei Fragen zu einer ausstehenden Zuweisung wenden Sie sich bitte an den Support.",
    viewPlans: "Investmentpläne ansehen"
  },
  checkoutStatus: {
    created: "Erstellt",
    pending: "Zahlung ausstehend",
    processing: "On-Chain-Verifizierung",
    confirmed: "Bestätigt",
    failed: "Fehlgeschlagen",
    rejected: "Abgelehnt",
    refunded: "Erstattet",
    disputed: "Angefochten",
    canceled: "Storniert",
    pending_manual: "Manuelle Prüfung ausstehend"
  },
  legalReview: {
    title: "Entwurf in rechtlicher Prüfung"
  },
  operator: {
    title: "Betreiber",
    subtitle: "Dashboard",
    description: "Prüfen und aktivieren Sie ausstehende Kundenanträge.",
    no_pending_applications: "Keine ausstehenden Anträge.",
    plan: "Plan",
    amount: "Betrag",
    country: "Land",
    customer_note: "Kundennotiz",
    activate_account: "Konto aktivieren",
    activating: "Wird aktiviert...",
    reject_or_request_info: "Ablehnen / Infos anfordern",
    rejecting: "Wird abgelehnt...",
    reject_application: "Antrag ablehnen",
    reject_reason_prompt: "Geben Sie einen Ablehnungsgrund oder die benötigten Informationen an.",
    reject_reason_placeholder: "Grund...",
    cancel: "Abbrechen",
    reject: "Ablehnen",
    errors: {
      activation_failed: "Antrag konnte nicht aktiviert werden.",
      rejection_failed: "Antrag konnte nicht abgelehnt werden."
    },
    status: {
      activation_pending: "Aktivierung ausstehend",
      account_active: "Konto aktiv",
      rejected: "Abgelehnt",
      manual_review: "Manuelle Prüfung"
    }
  },
  profitCalculator: {
    badge: "PROJEKTION",
    titleA: "GEWINN",
    titleB: "RECHNER",
    initialAllocation: "Erstzuweisung",
    monthlyProfit: "Gesch. Monatsgewinn",
    annualProfit: "Gesch. Jahresgewinn",
    riskTitle: "Risikomanagement",
    riskDesc: "Projektionen basierend auf historischer algorithmischer Performance mit strengen Drawdown-Limits.",
    instantTitle: "Sofortige Bereitstellung",
    instantDesc: "Ihr Kapital beginnt wenige Minuten nach der Infrastrukturintegration zu arbeiten.",
    disclaimer: "* Hinweis: Frühere Ergebnisse sind kein Garant für zukünftige Resultate. Projektionen dienen nur zur Veranschaulichung."
  },
  meta: {
    home: {
      title: "Braxel Markets | Institutionelle algorithmische Kapitalverwaltung",
      description: "Algorithmische Handelsinfrastruktur auf institutionellem Niveau, Zugang zu Prop-Firm-Kapital, CopyTrade-Autorisierung und vollständige MetaTrader-Automatisierung für XAU/USD und US500."
    },
    pricing: {
      title: "Tarife und verwaltetes Kapital | Braxel Markets",
      description: "Vergleichen Sie algorithmische Handelspläne und Zuweisungen für verwaltetes Kapital. Verwaltetes Kapital wird stets in USD angegeben."
    },
    about: {
      title: "Über Braxel Markets | Algorithmischer Handel",
      description: "Braxel Markets entwickelt algorithmische Handelsinfrastruktur auf institutionellem Niveau und verwaltet Kapital mit strengen Risikokontrollen."
    },
    howItWorks: {
      title: "So funktioniert es | Braxel Markets",
      description: "Erfahren Sie, wie Braxel Markets Ihr Kapital mit vollständig automatisierten MetaTrader-Strategien für XAU/USD und US500 verbindet."
    },
    contact: {
      title: "Kontakt | Braxel Markets",
      description: "Kontaktieren Sie das Team von Braxel Markets zu algorithmischer Handelsinfrastruktur und verwaltetem Kapital."
    },
    terms: {
      title: "Nutzungsbedingungen | Braxel Markets",
      description: "Lesen Sie die Nutzungsbedingungen für Braxel Markets."
    },
    privacy: {
      title: "Datenschutzrichtlinie | Braxel Markets",
      description: "Erfahren Sie, wie Braxel Markets Ihre personenbezogenen Daten erhebt, verwendet und schützt."
    },
    disclaimer: {
      title: "Risikohinweis | Braxel Markets",
      description: "Wichtiger Risikohinweis für algorithmischen Handel und verwaltetes Kapital mit Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Brasilien",
      US: "Vereinigte Staaten",
      GB: "Vereinigtes Königreich",
      DE: "Deutschland",
      FR: "Frankreich",
      ES: "Spanien",
      IT: "Italien",
      PT: "Portugal",
      RU: "Russland",
      CN: "China",
      JP: "Japan",
      IN: "Indien",
      OTHER: "Andere Länder"
    },
    method: {
      BR: {
        id_card: "Nationaler Personalausweis (RG/CPF)",
        drivers_license: "Führerschein"
      },
      US: {
        id_card: "Staatlicher Personalausweis"
      },
      GB: {
        id_card: "Nationaler Ausweis / Führerschein",
        biometric: "Biometrischer Aufenthaltstitel"
      },
      DE: {
        drivers: "Führerschein",
        passport: "Pass / Reisepass"
      },
      FR: {
        residence: "Aufenthaltstitel"
      },
      RU: {
        foreign_passport: "Auslandspass"
      },
      OTHER: {
        passport: "Internationaler Pass",
        national_id: "Nationaler Personalausweis"
      }
    },
    doc: {
      rg: {
        desc: "Brasilianischer Personalausweis"
      },
      cpf: {
        desc: "Brasilianische Steuernummernkarte (CPF)"
      },
      passport: {
        desc: "Gültiger Reisepass mit Lichtbildseite",
        name: "Reisepass"
      },
      cnh: {
        desc: "Brasilianischer Führerschein",
        name: "CNH (Führerschein)"
      },
      state_id: {
        desc: "Führerschein oder staatlich ausgestellter Ausweis",
        name: "Staatlicher Personalausweis"
      },
      passport_uk: {
        desc: "Gültiger britischer Reisepass"
      },
      driving_license_uk: {
        desc: "Britischer Führerschein",
        name: "Führerschein"
      },
      brp: {
        desc: "Britischer biometrischer Aufenthaltstitel",
        name: "Biometrischer Aufenthaltstitel"
      },
      personalausweis: {
        desc: "Deutscher Personalausweis"
      },
      passport_de: {
        desc: "Gültiger deutscher Reisepass"
      },
      fuehrerschein: {
        desc: "Deutscher Führerschein"
      },
      cni: {
        desc: "Französischer Personalausweis"
      },
      passport_fr: {
        desc: "Gültiger französischer Reisepass"
      },
      titre_sejour: {
        desc: "Französischer Aufenthaltstitel"
      },
      dni: {
        desc: "Spanischer Personalausweis"
      },
      nie: {
        desc: "Ausländer-Identifikationsnummer"
      },
      passport_es: {
        desc: "Gültiger Reisepass"
      },
      carta_id: {
        desc: "Italienischer Personalausweis"
      },
      passport_it: {
        desc: "Gültiger italienischer Reisepass"
      },
      cc: {
        desc: "Portugiesische Bürgerkarte"
      },
      passport_pt: {
        desc: "Gültiger portugiesischer Reisepass"
      },
      passport_ru: {
        desc: "Russischer Inlandspass"
      },
      foreign_passport_ru: {
        desc: "Russischer Auslandspass",
        name: "Auslandspass"
      },
      id_card_cn: {
        desc: "Chinesischer Personalausweis"
      },
      passport_cn: {
        desc: "Gültiger Reisepass"
      },
      passport_jp: {
        desc: "Gültiger japanischer Reisepass"
      },
      zairyu: {
        desc: "Aufenthaltskarte"
      },
      aadhaar: {
        desc: "Eindeutige Identifikationskarte",
        name: "Aadhaar-Karte"
      },
      voter_id: {
        desc: "Wählerausweis mit Foto",
        name: "Wählerausweis"
      },
      passport_in: {
        desc: "Gültiger indischer Reisepass"
      },
      passport_intl: {
        desc: "Gültiger Reisepass Ihres Landes"
      },
      national_id_intl: {
        desc: "Staatlich ausgestellter nationaler Ausweis",
        name: "Nationaler Personalausweis"
      }
    },
    methodName: {
      id_card: "Nationaler Personalausweis",
      passport: "Reisepass",
      drivers_license: "Führerschein",
      drivers: "Führerschein",
      biometric: "Biometrischer Aufenthaltstitel",
      residence: "Aufenthaltstitel",
      foreign_passport: "Auslandspass",
      national_id: "Nationaler Personalausweis"
    }
  },
  errorBoundary: {
    title: "Etwas ist schiefgelaufen",
    message: "Diese Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    retry: "Seite neu laden",
    home: "Zurück zur Startseite"
  }
};

const ruTranslation = {
  disclaimerPage: {
    title: "Финансовый отказ от ответственности",
    risk: "Риск",
    importantRiskTitle: "Важное предупреждение о рисках",
    importantRiskText: "Инвестирование на финансовых рынках связано с существенными рисками и может привести к полной потере вложенного капитала. Прошлые результаты не гарантируют будущих.",
    noAdviceTitle: "Не является консультацией",
    noAdviceText: "Содержание этого сайта и услуги, предоставляемые Braxel Markets, не являются финансовой, юридической или налоговой консультацией. Мы рекомендуем каждому инвестору получить независимую профессиональную консультацию перед принятием инвестиционных решений.",
    limitationTitle: "Ограничение ответственности",
    limitationText: "Braxel Markets не несёт ответственности за финансовые потери, возникшие в результате использования нашей технологии автоматизации или рыночных колебаний.",
    capitalAtRiskTitle: "Капитал под риском",
    capitalAtRiskText: "При использовании наших услуг ваш капитал подвержен риску. Вы можете потерять часть или весь свой инвестированный капитал.",
    noGuaranteedReturnsTitle: "Без гарантированной доходности",
    noGuaranteedReturnsText: "Мы не гарантируем никакой доходности или прибыли. Прошлые результаты не показательны для будущих.",
    pastPerformanceTitle: "Прошлые результаты не показательны",
    pastPerformanceText: "Любые показанные исторические результаты приведены исключительно в иллюстративных целях и не гарантируют будущих результатов.",
    notLicensedTitle: "Регуляторный статус",
    notLicensedText: "Braxel Markets в настоящее время не представлена как лицензированное или регулируемое финансовое учреждение в [PLACEHOLDER: юрисдикция]. Пожалуйста, проверьте регуляторный статус, применимый к вашему местоположению.",
    noCapitalProtectionTitle: "Без гарантии защиты капитала",
    noCapitalProtectionText: "Мы не предлагаем защиту капитала или гарантию от убытков.",
    algorithmicRisksTitle: "Риски алгоритмической/автоматизированной торговли",
    algorithmicRisksText: "Автоматизированные и алгоритмические торговые стратегии связаны с рисками, включая, помимо прочего, сбои системы, проблемы с подключением, ошибки модели и непредвиденные рыночные условия.",
    jurisdictionRestrictionsTitle: "Ограничения по юрисдикции",
    jurisdictionRestrictionsText: "Наши услуги могут быть недоступны в некоторых юрисдикциях. Пользователи обязаны обеспечить соблюдение местных законов и нормативов перед использованием нашей платформы."
  },
  privacyPage: {
    title: "Политика конфиденциальности",
    privacy: "Конфиденциальность",
    dataCollectionTitle: "Сбор данных",
    dataCollectionText: "Мы собираем только информацию, необходимую для оказания наших услуг, включая имя, электронную почту и данные о транзакциях. Ваши данные защищены шифрованием AES-256.",
    useOfInfoTitle: "Использование информации",
    useOfInfoText: "Собранная информация используется исключительно для управления вашим аккаунтом, обработки платежей и отправки еженедельных отчётов о результатах.",
    securityTitle: "Безопасность",
    securityText: "Мы применяем строгие меры безопасности для защиты ваших персональных данных от несанкционированного доступа, изменения или уничтожения.",
    legalBasisTitle: "Правовое основание обработки",
    legalBasisText: "Нашим правовым основанием для обработки ваших персональных данных является [PLACEHOLDER: правовое основание, например согласие, законный интерес, необходимость исполнения договора].",
    retentionTitle: "Срок хранения данных",
    retentionText: "Мы храним ваши персональные данные в течение [PLACEHOLDER: срок хранения], если законом не требуется более длительный срок.",
    thirdPartiesTitle: "Третьи лица и обработчики",
    thirdPartiesText: "Мы можем передавать ваши данные надёжным сторонним поставщикам услуг, таким как [PLACEHOLDER: список обработчиков, например платёжные системы, облачный хостинг, почтовые сервисы], исключительно для целей, указанных в настоящей политике.",
    userRightsTitle: "Ваши права",
    userRightsText: "В соответствии с применимыми законами о защите данных, такими как LGPD (Бразилия) и GDPR (ЕС), вы имеете право на доступ, исправление, удаление и перенос ваших персональных данных, а также на возражение против обработки или её ограничение. Для реализации этих прав свяжитесь с нами по адресу [PLACEHOLDER: контакт для запросов о правах].",
    cookiesTitle: "Файлы cookie и аналогичные технологии",
    cookiesText: "Наш сайт использует файлы cookie и аналогичные технологии для улучшения пользовательского опыта, анализа трафика и персонализации контента. Вы можете управлять настройками cookie в параметрах браузера.",
    contactTitle: "Контакты и специалист по защите данных",
    contactText: "По вопросам об этой Политике конфиденциальности или наших методах работы с данными обращайтесь к нашему специалисту по защите данных по адресу [PLACEHOLDER: электронная почта или контакт DPO]."
  },
  contactEmail: {
    newSubmission: "Новая заявка из контактной формы",
    name: "Имя",
    email: "Эл. почта",
    subject: "Тема",
    message: "Сообщение",
    sentFrom: "Отправлено из"
  },
  nav: {
    pricing: "ИНВЕСТИЦИОННЫЕ ПЛАНЫ",
    howItWorks: "ИНФРАСТРУКТУРА",
    about: "О НАС",
    contact: "ИНСТИТУЦИОНАЛЬНАЯ ПОДДЕРЖКА",
    login: "ДОСТУП К ТЕРМИНАЛУ",
    support: "Поддержка",
    openAccount: "СОЗДАТЬ АККАУНТ",
    dashboard: "ПАНЕЛЬ УПРАВЛЕНИЯ",
    logout: "ВЫХОД",
    selectLanguage: "Выбрать язык",
    sessionActive: "Активная сессия",
    accessDashboard: "Перейти в панель"
  },
  footer: {
    desc: "Инвестиционная инфраструктура институционального уровня. Проприетарная технология для современного рынка.",
    platform: "Платформа",
    company: "Компания",
    support: "Цифровая Поддержка",
    rights: "Все права защищены.",
    privacy: "Конфиденциальность",
    terms: "Условия",
    disclaimer: "Финансовое Уведомление",
    address: "Коммерческий Адрес",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, Испания",
    riskTitle: "ПРЕДУПРЕЖДЕНИЕ О РИСКАХ",
    riskText: "Торговля на финансовых рынках сопряжена со значительным риском убытков и подходит не всем инвесторам. Прошлые результаты не гарантируют будущих. Стоимость инвестиций может как расти, так и падать. Не инвестируйте средства, потерю которых вы не можете себе позволить. Braxel Markets не гарантирует конкретной доходности.",
    emailAria: "Эл. почта",
    xAria: "X (Twitter)"
  },
  chatbot: {
    title: "Поддержка Braxel",
    placeholder: "Введите сообщение...",
    emailSupport: "Эл. почта:",
    assistantReply: "Спасибо за ваше сообщение. Наша команда скоро ответит.",
    send: "Отправить",
    brandAI: "ИИ Braxel Markets",
    openChat: "Открыть чат поддержки",
    close: "Закрыть",
    minimize: "Свернуть",
    maximize: "Развернуть",
    supportDialog: "Чат поддержки"
  },
  auth: {
    loginTitle: "Вход",
    loginSubtitle: "Введите ваши учётные данные.",
    registerTitle: "Создать Аккаунт",
    registerSubtitle: "Начните свой путь на институциональном рынке.",
    email: "Электронная Почта",
    password: "Пароль",
    fullName: "Полное Имя",
    forgotPassword: "Забыли пароль?",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть доступ?",
    btnAccess: "ВОЙТИ В АККАУНТ",
    btnCreate: "СОЗДАТЬ АККАУНТ",
    termsAgree: "Я принимаю Условия и Политику конфиденциальности.",
    futureTitle: "Будущее",
    futureSubtitle: "Инвестиций",
    features: [
      "Алгоритмы институционального уровня",
      "Продвинутая защита капитала",
      "Исполнение в миллисекундах",
      "Полная прозрачность"
    ],
    accessBadge: "Институциональный доступ",
    emailPlaceholder: "Введите вашу почту",
    fullNamePlaceholder: "Введите полное имя",
    loginLink: "Войти",
    loginSideDescription: "Доступ к вашему институциональному терминалу.",
    loginSideFooter: "Безопасность институционального уровня",
    loginErrorMessage: "Неверные данные. Пожалуйста, попробуйте снова.",
    registerErrorMessage: "Ошибка регистрации. Пожалуйста, попробуйте снова.",
    registerSuccessMessage: "Аккаунт успешно создан!",
    registerSideFooter: "Защищено институциональной безопасностью",
    welcomeBackTitle: "С Возвращением",
    welcomeBackHighlight: "Институциональный Терминал",
    accountNotFound: "Аккаунт не найден. Пожалуйста, создайте аккаунт.",
    rememberMe: "Запомнить меня",
    registerLink: "Создать аккаунт",
    passwordPlaceholder: "Пароль",
    accountNotFoundError: "Аккаунт не найден. Сначала создайте аккаунт.",
    resetPasswordSent: "Если аккаунт с такой почтой существует, ссылка для сброса пароля отправлена.",
    resetPasswordError: "Не удалось отправить ссылку для сброса. Попробуйте ещё раз.",
    enterEmailFirst: "Сначала введите адрес электронной почты."
  },
  hero: {
    title1: "ЭЛИТНОЕ АЛГОРИТМИЧЕСКОЕ",
    title2: "УПРАВЛЕНИЕ КАПИТАЛОМ",
    desc: "Применяйте количественные стратегии институционального уровня, разработанные для современного рынка. Испытайте точность исполнения в миллисекундах и продвинутые протоколы снижения рисков.",
    getStarted: "ИЗУЧИТЬ ИНВЕСТИЦИОННЫЕ ПЛАНЫ",
    viewStrategies: "ТЕХНИЧЕСКАЯ МЕТОДОЛОГИЯ"
  },
  stats: {
    volume: "Стратегическое Управление Капиталом",
    traders: "Активные Счета",
    uptime: "Время Безотказной Работы",
    latency: "Точность Исполнения"
  },
  methodology: {
    badge: "МЕТОДОЛОГИЯ",
    title: "КОЛИЧЕСТВЕННЫЕ МОДЕЛИ",
    statArb: {
      title: "СТАТИСТИЧЕСКИЙ АРБИТРАЖ",
      desc: "Использование временных ценовых неэффективностей между коррелированными активами с помощью моделей коинтеграции и парного трейдинга.",
      f1: "Анализ Коинтеграции",
      f2: "Алгоритмы Выбора Пар",
      f3: "Порог Z-Score"
    },
    meanRev: {
      title: "ВОЗВРАТ К СРЕДНЕМУ",
      desc: "Выявление отклонений цены от исторических средних с систематическими правилами входа и выхода.",
      f1: "Сигналы Полос Боллинджера",
      f2: "Обнаружение Дивергенции RSI",
      f3: "Модели Орнштейна-Уленбека"
    },
    hft: {
      title: "ВЫСОКОЧАСТОТНАЯ ТОРГОВЛЯ",
      desc: "Стратегии исполнения со сверхнизкой задержкой с использованием совмещённой инфраструктуры для размещения ордеров на уровне микросекунд.",
      f1: "Микроструктура Рынка",
      f2: "Анализ Потока Ордеров",
      f3: "Арбитраж Задержки"
    }
  },
  transparency: {
    badge: "ИНФРАСТРУКТУРА",
    title: "ПРОЗРАЧНАЯ ТЕХНОЛОГИЯ",
    desc: "Наша инфраструктура построена на корпоративных основаниях, обеспечивая надёжность, скорость и безопасность.",
    connectivity: {
      title: "СВЯЗНОСТЬ",
      desc: "Прямой доступ к рынку через дата-центры Equinix (NY5, LD4, TY3) с низколатентным подключением к крупнейшим биржам (не подтверждено)."
    },
    cloud: {
      title: "ОБЛАЧНОЕ ИСПОЛНЕНИЕ",
      desc: "Резервные движки исполнения на AWS (us-east-1, eu-west-1) и Azure для отказоустойчивости (не подтверждено)."
    },
    security: {
      title: "БЕЗОПАСНОСТЬ",
      desc: "Сквозное шифрование, соответствие SOC 2 Type II и многоуровневая аутентификация для всех операций (не подтверждено)."
    },
    warning: "Рынки волатильны. Доходность никогда не гарантируется, и убытки возможны даже при надёжных механизмах защиты.",
    protocolTitle: "Протокол, разработанный для институционального использования",
    protocolDesc: "Наша инфраструктура следует строгим стандартам соответствия и управления рисками, стремясь к операционной безопасности (без гарантий)."
  },
  process_home: {
    badge: "ПРОЦЕСС",
    title: "ИНСТИТУЦИОНАЛЬНЫЙ",
    subtitle: "ПРОЦЕСС",
    step1: {
      title: "РЕГИСТРАЦИЯ",
      desc: "Безопасная регистрация и верификация личности."
    },
    step2: {
      title: "АЛЛОКАЦИЯ",
      desc: "Выбор уровня управляемого капитала."
    },
    step3: {
      title: "ИНТЕГРАЦИЯ",
      desc: "Развёртывание алгоритмической инфраструктуры."
    },
    step4: {
      title: "МОНИТОРИНГ",
      desc: "Отслеживание результатов в реальном времени."
    },
    step5: {
      title: "ЛИКВИДНОСТЬ",
      desc: "Упрощённые протоколы вывода прибыли."
    }
  },
  cta_home: {
    badge: "ВОЗМОЖНОСТЬ",
    title: "МАСШТАБИРУЙТЕ СВОЙ",
    subtitle: "КАПИТАЛ",
    desc: "Присоединяйтесь к элитной группе инвесторов, использующих проприетарную инфраструктуру Braxel.",
    btn: "НАЧАТЬ АЛЛОКАЦИЮ",
    trust: "Безопасность Институционального Уровня"
  },
  pricing: {
    badge: "ПРОЗРАЧНОСТЬ",
    title: "АЛЛОКАЦИИ",
    subtitle: "КАПИТАЛА",
    desc: "Институциональная инфраструктура с прозрачной структурой комиссий.",
    select: "ВЫБРАТЬ ЭТОТ ПЛАН",
    allocation: "УПРАВЛЯЕМЫЙ КАПИТАЛ",
    month: "ежемесячная плата",
    detectedCurrency: "Все цены указываются в USD ({{currency}}) независимо от вашего местоположения",
    managedCapitalUsdNote: "Управляемый капитал (Capital Gerenciado) всегда указывается в USD."
  },
  plans: {
    starter: "Стартовый",
    starterFeatures: "Возможности стартового тарифа",
    managedCapital: "Управляемый Капитал",
    features: {
      automation: "Автоматизация",
      accountManagement: "Управление Аккаунтом",
      emailSupport: "Email-поддержка",
      controlledRisk: "Контролируемый Риск",
      starterFeatures: "Возможности стартового тарифа",
      prioritySupport: "Приоритетная Поддержка",
      detailedLogs: "Детальные Логи",
      proFeatures: "Возможности Pro",
      multiAccount: "Мультисчёт",
      weeklyReports: "Еженедельные Отчёты",
      advancedFeatures: "Расширенные возможности",
      support247: "Поддержка 24/7",
      dedicatedManager: "Выделенный Менеджер"
    },
    professional: "Профессиональный",
    professionalFeatures: "Возможности профессионального тарифа",
    business: "Бизнес",
    businessFeatures: "Возможности бизнес-тарифа",
    enterprise: "Корпоративный",
    enterpriseFeatures: "Возможности корпоративного тарифа"
  },
  howItWorks: {
    badge: "ИНФРАСТРУКТУРА",
    title: "ТЕХНИЧЕСКАЯ",
    subtitle: "АРХИТЕКТУРА",
    desc: "Наша проприетарная экосистема создана для скорости, безопасности и стабильной производительности.",
    steps: [
      {
        title: "РЕГИСТРАЦИЯ",
        desc: "Создайте институциональный профиль."
      },
      {
        title: "ПАНЕЛЬ",
        desc: "Доступ к приватному терминалу управления."
      },
      {
        title: "ВЫБОР ПЛАНА",
        desc: "Выберите уровень аллокации капитала."
      },
      {
        title: "РАЗВЁРТЫВАНИЕ API",
        desc: "Автоматическое подключение к мировым рынкам."
      },
      {
        title: "ИСПОЛНЕНИЕ",
        desc: "Обработка ордеров в миллисекундах."
      },
      {
        title: "ОТЧЁТНОСТЬ",
        desc: "Детальная аналитика результатов за неделю."
      }
    ],
    cta: "ГОТОВЫ НАЧАТЬ?",
    ctaBtn: "ПРИСОЕДИНИТЬСЯ К СЕТИ"
  },
  about: {
    badge: "О НАС",
    title: "ИНСТИТУЦИОНАЛЬНОЕ",
    subtitle: "ПРЕВОСХОДСТВО",
    desc: "Braxel Markets представляет вершину алгоритмического управления капиталом.",
    historyTitle: "НАША ИСТОРИЯ",
    historyDesc1: "Основанная командой количественных аналитиков и программных инженеров, Braxel была создана, чтобы объединить розничный капитал и институциональные технологии.",
    historyDesc2: "Сегодня мы фокусируемся на доходности с учётом рисков и стабильности инфраструктуры, предоставляя передовые алгоритмические стратегии для современного инвестора.",
    stats: {
      founded: "Основана",
      users: "Активные Пользователи",
      uptime: "Доступность",
      support: "Поддержка"
    },
    values: {
      mission: "МИССИЯ",
      missionDesc: "Предоставить элитную алгоритмическую инфраструктуру для глобального капитала.",
      vision: "ВИДЕНИЕ",
      visionDesc: "Определить будущее автоматизированного количественного управления.",
      values: "ЦЕННОСТИ",
      valuesDesc: "Прозрачность, точность и непоколебимая безопасность."
    },
    teamTitle: "КОМАНДА РУКОВОДСТВА",
    teamDesc: "Познакомьтесь с основателями и управляющими Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "Основатель и CEO",
        bio: "Количественный стратег и предприниматель, возглавляющий видение Braxel Markets в области институциональной алгоритмической инфраструктуры.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "РУКОВОДСТВО"
  },
  contact: {
    badge: "ПОДДЕРЖКА",
    title: "ИНСТИТУЦИОНАЛЬНЫЕ",
    subtitle: "КАНАЛЫ",
    desc: "Наша специализированная команда поддержки доступна 24/7 для институциональных запросов.",
    infoTitle: "КОНТАКТЫ",
    formTitle: "ПРЯМОЙ ЗАПРОС",
    placeholders: {
      name: "ПОЛНОЕ ИМЯ",
      email: "ЭЛЕКТРОННАЯ ПОЧТА",
      subject: "ТЕМА",
      message: "СООБЩЕНИЕ"
    },
    sendBtn: "ОТПРАВИТЬ ЗАПРОС",
    supportHours: "Часы Поддержки",
    institutionalSupport: "24/7 Институциональная Поддержка",
    securityChallenge: "Проверка Безопасности",
    securityAnswer: "Ответ",
    incorrectAnswer: "Неверный ответ безопасности. Пожалуйста, попробуйте снова.",
    waitMessage: "Пожалуйста, подождите перед отправкой следующего сообщения.",
    messageSent: "Сообщение успешно отправлено! Наша команда свяжется с вами в ближайшее время.",
    messageFailed: "Не удалось отправить сообщение. Пожалуйста, попробуйте снова или отправьте нам письмо напрямую на marketsbraxel@ouvidor.net",
    cooldown: "ПОДОЖДИТЕ",
    consentPre: "Отправляя эту форму, вы соглашаетесь с нашей",
    consentPost: "Мы используем ваши данные только для ответа на ваш запрос.",
    emailLabel: "Эл. почта"
  },
  dashboard: {
    portfolio: "Портфель",
    activeServices: "Активные Услуги",
    newAllocation: "Новая Аллокация",
    noServices: "Активные инвестиционные планы не найдены.",
    balance: "Текущий Баланс",
    withdraw: "Вывод",
    liquidity: "Ликвидность",
    requestWithdraw: "Запросить Вывод",
    selectAccount: "Выбрать Счёт",
    amount: "Сумма (USD)",
    iban: "IBAN / Банковские Реквизиты",
    btnWithdraw: "ОТПРАВИТЬ ЗАПРОС НА ВЫВОД",
    profile: "Управление Профилем",
    settings: "Настройки",
    firstName: "Имя",
    lastName: "Фамилия",
    saveChanges: "СОХРАНИТЬ ИЗМЕНЕНИЯ",
    verifiedAccount: "Верифицированный Аккаунт",
    accountStandard: "Стандартный аккаунт",
    withdrawal: {
      gateTitle: "Требуется подтверждение личности",
      gateWhy: "Для защиты ваших средств и соблюдения норм перед выводом средств требуется проверка личности (KYC). Торговать можно и без неё.",
      gateRejectedDesc: "Ваша предыдущая заявка не была принята. Проверьте причину ниже и отправьте документы снова.",
      gateUnderReview: "Ваши документы находятся на проверке. Мы уведомим вас по email после принятия решения. До этого вывод недоступен.",
      kycStatusLabel: "Статус проверки",
      statusPending: "Не отправлено",
      statusSubmitted: "На проверке",
      statusApproved: "Одобрено",
      statusRejected: "Отклонено",
      rejectedReason: "Причина",
      continueToForm: "Перейти к выводу",
      submitDocs: "Отправить документы",
      resubmit: "Отправить документы снова",
      uploadFront: "Документ (лицевая сторона)",
      uploadBack: "Документ (обратная сторона)",
      uploadSelfie: "Селфи с документом",
      chooseFile: "Выбрать файл",
      fileHint: "JPG, PNG или PDF, до 10 МБ",
      selfieHint: "Чёткое фото лица с документом",
      optional: "Необязательно",
      frontRequired: "Приложите лицевую сторону документа.",
      fileTooLarge: "Файл больше 10 МБ.",
      uploadError: "Не удалось отправить документы. Попробуйте ещё раз.",
      documentsSubmitted: "Документы отправлены. Мы скоро их рассмотрим.",
    },
    totalAUM: "Общие Активы под Управлением",
    activeAlgos: "Активные Алгоритмы",
    systemStatus: "Статус Системы",
    operational: "Работает",
    infraProtection: "Защита Инфраструктуры",
    twoFactor: "Двухфакторная Аутентификация",
    notEnabled: "Не Активирована",
    enable2FA: "Включить 2FA",
    kycStatus: "Верификация KYC",
    verified: "Верифицирован",
    viewDocs: "Просмотр Документов",
    investor: "Инвестор",
    kycRequired: "Требуется верификация KYC",
    kycRequiredDesc: "Пройдите проверку личности для доступа ко всем функциям платформы. Это обязательно для всех аккаунтов, управляющих капиталом.",
    kycUnderReview: "KYC на проверке",
    kycUnderReviewDesc: "Ваши документы проверяются нашей командой комплаенс. Обычно это занимает 24-48 часов.",
    kycRejected: "Верификация KYC отклонена",
    kycRejectedDesc: "Ваши документы не были приняты. Пожалуйста, отправьте действительные документы повторно.",
    resubmitDocs: "Повторно отправить документы",
    completeVerification: "Завершить верификацию",
    verificationRequired: "Требуется верификация",
    goToVerification: "Перейти к верификации",
    totalProfit: "Общая прибыль",
    drawdown: "Просадка",
    maxDrawdown: "Макс. просадка",
    assetsInOperation: "Активы в работе",
    monthlyReturns: "Месячная доходность",
    analytics: "Аналитика",
    newWithdrawalRequest: "Новая заявка на вывод",
    walletIban: "Кошелёк / IBAN",
    network: {
      erc20: "ERC-20 (Ethereum)",
      trc20: "TRC-20 (Tron)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "Банковский перевод (SWIFT)"
    },
    transactionHistory: "История транзакций",
    operations: "Операции",
    asset: "Актив",
    type: "Тип",
    entry: "Вход",
    exit: "Выход",
    profit: "Прибыль",
    time: "Время",
    status: "Статус",
    open: "Открыт",
    closed: "Закрыт",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "Адрес криптокошелька или IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "Введите 6-значный код",
    minPasswordPlaceholder: "Минимум 8 символов",
    confirmPasswordPlaceholder: "Повторно введите новый пароль",
    accountNotFound: "Аккаунт не найден. Пожалуйста, сначала создайте аккаунт.",
    loginSuccess: "Вход выполнен успешно!",
    rememberMe: "Запомнить меня",
    navPerformance: "Эффективность",
    navAuditLog: "Журнал аудита",
    tabProfile: "Профиль",
    tabKycVerification: "Верификация KYC",
    tabSecurity: "Безопасность",
    kycCompleteDesc: "Завершите верификацию KYC, чтобы получить доступ ко всем функциям платформы. Это обязательное требование для всех аккаунтов.",
    kyc: {
      approved: "Верификация одобрена",
      underReview: "Документы на проверке",
      rejected: "Верификация отклонена",
      required: "Требуется верификация",
      descApproved: "Ваша личность подтверждена. Все функции разблокированы.",
      descSubmitted: "Наша команда по комплаенсу проверяет ваши документы. Обычно это занимает 24-48 часов.",
      descRejected: "Ваши документы не были приняты. Пожалуйста, отправьте повторно с действительными документами.",
      descRequired: "Завершите верификацию личности, чтобы разблокировать все функции платформы.",
      stepCountry: "Страна",
      stepMethod: "Метод",
      stepDocument: "Документ",
      stepReview: "Проверка",
      selectCountry: "Выберите вашу страну",
      selectCountryDesc: "Выберите страну, выдавшую ваш документ, удостоверяющий личность.",
      selectCountryPlaceholder: "Выберите страну...",
      selectMethod: "Выберите метод верификации",
      selectMethodDesc: "Выберите способ верификации личности для {{country}}.",
      uploadDocument: "Загрузите ваш документ",
      uploadDocumentDesc: "Выберите и загрузите один действительный документ из вариантов ниже.",
      clickToUpload: "Нажмите для загрузки или перетащите",
      submitting: "Отправка...",
      submitForVerification: "Отправить на верификацию",
      progressTitle: "Прогресс верификации",
      stepEmailVerification: "Подтверждение Email",
      stepIdentityDocument: "Документ, удостоверяющий личность",
      stepComplianceReview: "Проверка комплаенса",
      stepAccountActivation: "Активация аккаунта",
      statusInProgress: "В процессе",
      statusComplete: "Завершено",
      statusPending: "Ожидание",
      changePassword: "Сменить пароль",
      updateCredentials: "Обновите ваши учетные данные",
      newPassword: "Новый пароль",
      confirmNewPassword: "Подтвердите новый пароль",
      emailVerification: "Подтверждение Email",
      verified: "Подтверждено",
      verifiedEmail: "Подтвержденный Email",
      securityActivityLog: "Журнал активности безопасности",
      scanAuthenticator: "Сканируйте вашим приложением аутентификатора",
      eventLoginNewDevice: "Вход с нового устройства",
      eventPasswordChanged: "Пароль изменен",
      eventAccountCreated: "Аккаунт создан",
      timeHoursAgo: "{{count}} часов назад",
      timeDaysAgo: "{{count}} дней назад"
    },
    newEmailLabel: "Новый адрес электронной почты",
    sendConfirmationLink: "Отправить ссылку для подтверждения",
    identityVerified: "Ваша личность подтверждена! Все функции разблокированы.",
    verificationRejected: "Ваша верификация отклонена. Пожалуйста, отправьте документы повторно.",
    profileUpdated: "Профиль успешно обновлён.",
    failedUpdateProfile: "Не удалось обновить профиль.",
    differentEmail: "Введите другой адрес электронной почты.",
    confirmationLinkSent: "Ссылка для подтверждения отправлена на новый адрес электронной почты. Подтвердите её, чтобы завершить изменение.",
    failedEmail: "Не удалось обновить электронную почту.",
    passwordsDoNotMatch: "Пароли не совпадают.",
    passwordTooShort: "Пароль должен содержать не менее 8 символов.",
    passwordChanged: "Пароль успешно изменён.",
    failedPassword: "Не удалось изменить пароль.",
    uploadDocument: "Загрузите документ.",
    completeSteps: "Пожалуйста, завершите все этапы верификации.",
    documentsSubmitted: "Документы отправлены на верификацию. Вы получите уведомление после проверки.",
    failedDocuments: "Не удалось отправить документы.",
    performanceTitle: "Панель производительности",
    auditLogTitle: "Журнал аудита",
    auditLogDesc: "Все алгоритмические ордера, исполненные на вашем аккаунте.",
    accountSettingsTitle: "Настройки аккаунта",
    personalInformation: "Личная информация",
    emailAddress: "Адрес электронной почты",
    emailChangeNotice: "Смена электронной почты требует подтверждения. Ссылка для подтверждения будет отправлена на новый адрес.",
    currentEmail: "Текущая почта",
    confirmationSent: "Подтверждение отправлено",
    tryDifferentEmail: "Попробовать другую почту",
    continueToMethod: "Перейти к выбору метода",
    uploadHint: "PNG, JPG, PDF до 10 МБ",
    twoFactorDesc: "Добавьте дополнительный уровень безопасности. Используйте приложение-аутентификатор, например Google Authenticator или Authy.",
    qrCode: "QR-код",
    kycRequiredBanner: "Требуется KYC",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "Сеть",
    emailChangeInboxNotice: "Проверьте входящие сообщения и перейдите по ссылке, чтобы завершить изменение адреса электронной почты.",
    emailChangeSentTo: "Ссылка для подтверждения отправлена на {{email}}. Проверьте входящие сообщения и перейдите по ссылке, чтобы завершить изменение адреса электронной почты.",
    growthPerformanceMtd: "Динамика роста (за месяц)"
  },
  checkout: {
    summary: "ИТОГО",
    allocationTitle: "Институциональная",
    allocationSubtitle: "Аллокация",
    tierLabel: "Уровень Алгоритмической Инфраструктуры",
    billedMonthly: "Ежемесячная Оплата",
    detailsTitle: "Детали Аллокации",
    managedCapital: "Управляемый Капитал",
    setupFee: "Плата за Настройку",
    waived: "ОТМЕНЕНА",
    latency: "Задержка Исполнения",
    infrastructureTitle: "Включённая Инфраструктура",
    realTimeMonitoring: "Мониторинг в Реальном Времени",
    activeUponDeployment: "Активно после развёртывания",
    totalDue: "Итого к Оплате",
    dedicatedNode: "Выделенный Узел",
    globalMarkets: "Глобальные Рынки",
    instantSetup: "Мгновенная Настройка",
    authRequired: "ТРЕБУЕТСЯ АУТЕНТИФИКАЦИЯ",
    authDesc: "Войдите или создайте аккаунт для продолжения аллокации.",
    btnLogin: "ВОЙТИ ДЛЯ ПРОДОЛЖЕНИЯ",
    btnRegister: "СОЗДАТЬ АККАУНТ",
    confirmDeployment: "Подтвердить Развёртывание",
    deploymentDesc: "Подтверждая, вы разрешаете развёртывание алгоритмической инфраструктуры плана {{plan}}.",
    proceedPayment: "ПЕРЕЙТИ К БЕЗОПАСНОЙ ОПЛАТЕ",
    secureGateway: "Безопасный Шлюз",
    back: "Назад",
    riskDisclosure: "Раскрытие Рисков: Алгоритмическая торговля сопряжена со значительным риском убытков. Прошлые результаты не гарантируют будущих.",
    secureTransaction: "Безопасная Транзакция",
    paypalNote: "Платёжная информация обрабатывается безопасно через PayPal. Braxel Markets не хранит данные вашей карты.",
    encryptionNote: "Зашифровано по Институциональным Стандартам AES-256",
    verifying: "Верификация Институциональной Транзакции...",
    loading: "Загрузка Терминала...",
    globalInfra: "Глобальная Платёжная Инфраструктура",
    qrCode: "QR-Код",
    allCards: "Все Карты",
    selectPaymentMethod: "Выберите способ оплаты",
    choosePayment: "Выберите способ оплаты",
    creditCard: "Кредитная карта",
    instantPayment: "Мгновенный платёж",
    cardDesc: "Visa, Mastercard и другие карты",
    crypto: "Криптовалюта",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "Быстрый и безопасный крипто-перевод",
    securePayment: "Безопасная Оплата",
    cardNumber: "Номер карты",
    cardName: "Имя на карте",
    cardExpiry: "Срок действия",
    payNow: "ОПЛАТИТЬ СЕЙЧАС",
    amountToPay: "Сумма к Оплате",
    selectNetwork: "Выбрать Сеть",
    yourAddress: "Адрес Депозита",
    yourAddressPlaceholder: "Введите ваш адрес USDT",
    important: "ВАЖНО",
    cryptoNote: "Отправьте точную сумму для получения плана",
    sendExactAmount: "Отправьте РОВНО эту сумму, чтобы избежать задержек",
    confirmCrypto: "ПОДТВЕРДИТЬ КРИПТО",
    copied: "Скопировано!",
    cryptoPending: "Оплата зарегистрирована! Ожидание подтверждения.",
    processing: "Обработка...",
    paymentSuccess: "Оплата одобрена!",
    selectCountry: "Выберите страну",
    searchCountry: "Поиск страны...",
    phone: "Номер телефона",
    fillAllFields: "Заполните все поля",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "ПОЛНОЕ ИМЯ",
    cardExpiryPlaceholder: "ММ/ГГ",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "Оплата не удалась",
    paymentError: "Ошибка оплаты",
    amountToSend: "Сумма к отправке",
    paymentReference: "Укажите ваш email как ссылку на платеж",
    wiseTransfer: "Банковский перевод",
    bankDetails: "Банковские реквизиты",
    accountHolder: "Владелец счета",
    accountNumber: "Номер счета",
    bankName: "Название банка",
    bankAddress: "Адрес банка",
    routingNumber: "Роутинговый номер",
    confirmWise: "ПОДТВЕРДИТЬ ПЕРЕВОД",
    wiseDesc: "Переводите напрямую на наш банковский счет через Wise",
    wiseNote: "После перевода нажмите подтвердить ниже. Ваш аккаунт будет активирован после проверки (1-3 рабочих дня).",
    wiseInternational: "Международный перевод",
    openWise: "Открыть сайт Wise",
    transferInstructions: "Инструкции по переводу",
    lowFees: "Низкие комиссии",
    noKyc: "Требуется KYC",
    anyCountry: "Любая страна",
    wiseConfirmRequired: "Пожалуйста, подтвердите, что вы сделали перевод",
    wiseConfirmText: "Я сделал банковский перевод и подтверждаю, что отправленная сумма соответствует цене плана.",
    wisePaymentSuccess: "Платеж подтвержден! Ваш аккаунт настраивается.",
    wiseStep1: "Скопируйте банковские реквизиты ниже",
    wiseStep2: "Сделайте перевод из вашего банка или аккаунта Wise",
    wiseStep3: "Нажмите «Подтвердить» после перевода",
    subscriptionTitle: "ПОДПИСКА",
    subscriptionSubtitle: "СЕРВИСНЫЙ ПЛАН",
    serviceAccess: "Доступ к сервису",
    confirmCard: "ПОДТВЕРДИТЬ КАРТУ",
    redirecting: "Перенаправление на оплату...",
    card: "Кредитная / дебетовая карта",
    testModeBanner: "ТЕСТОВЫЙ РЕЖИМ — Без реальных денег. Без реального банка. Без реального кошелька. Без реальной активации.",
    startFailed: "Не удалось начать оплату. Попробуйте снова.",
    notConfigured: "Платежи ещё не полностью настроены. Попробуйте другой способ или обратитесь в поддержку.",
    invalidPlanTitle: "НЕДЕЙСТВИТЕЛЬНЫЙ ТАРИФ",
    invalidPlanDesc: "Выбранный тариф больше недоступен. Выберите тариф заново.",
    swiftLabel: "SWIFT",
    referenceLabel: "Ссылка",
  },
  legal: {
    badgeLegal: "ПРАВОВАЯ ИНФОРМАЦИЯ",
    termsTitle: "УСЛОВИЯ ОБСЛУЖИВАНИЯ"
  },
  faq: {
    title: "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ",
    badge: "ЧАСТЫЕ ВОПРОСЫ",
    q1: "Нужен ли предварительный опыт?",
    a1: "Нет. Наша инфраструктура полностью автоматизирована. Вам нужно только выбрать уровень аллокации и отслеживать результаты через терминал.",
    q2: "Какие риски существуют?",
    a2: "Как и на любом финансовом рынке, существуют риски потери капитала из-за волатильности. Мы используем продвинутые протоколы для защиты капитала.",
    q3: "Как работает система?",
    a3: "Наши проприетарные алгоритмы исполняют высокочастотные количественные стратегии на мировых рынках с миллисекундной точностью.",
    q4: "Могу ли я отменить план?",
    a4: "Да. Вы можете запросить отмену и вывод капитала в любое время через протоколы панели управления."
  },
  diffs: {
    title: "ПОЧЕМУ BRAXEL MARKETS?",
    badge: "ПРЕИМУЩЕСТВА",
    t1: "Проприетарная Технология",
    d1: "Нейронные сети для исполнения институционального уровня.",
    t2: "Полная Автоматизация",
    d2: "Алгоритмическое управление 24/7 без человеческого эмоционального смещения.",
    t3: "Упрощённый Доступ",
    d3: "Институциональная инфраструктура через интуитивный терминал.",
    t4: "Профессиональный Уровень",
    d4: "Прямое подключение к глобальным пулам ликвидности со сверхнизкой задержкой."
  },
  signals: {
    title: "АЛГОРИТМИЧЕСКОЕ",
    subtitle: "ИСПОЛНЕНИЕ",
    badge: "ТЕРМИНАЛ РЕАЛЬНОГО ВРЕМЕНИ",
    desc: "Мониторьте нашу проприетарную инфраструктуру в реальном времени. Каждый сигнал обрабатывается нашими нейронными сетями с миллисекундной точностью.",
    asset: "АКТИВ",
    type: "ТИП",
    entry: "ВХОД",
    profit: "ПРИБЫЛЬ",
    status: "СТАТУС",
    active: "АКТИВНЫЙ",
    completed: "ЗАВЕРШЁН",
    institutionalVerification: "Институциональная верификация",
    realtimeFeed: "Поток данных в реальном времени из глобальных пулов ликвидности.",
    liveTerminal: "ТЕРМИНАЛ ОНЛАЙН",
    connected: "ПОДКЛЮЧЕНО"
  },
  application: {
    title: "ЗАЯВКА",
    subtitle: "ОТПРАВКА",
    plan_selected: "Выбранный план",
    billed_monthly: "Ежемесячная оплата",
    plan_description: "Вы собираетесь приобрести подписку на услугу {{plan}}.",
    plan_price_detail: "Ежемесячный взнос: {{price}} (оплачивается ежемесячно)",
    full_name: "Полное имя",
    full_name_placeholder: "Введите ваше полное имя",
    email: "Адрес электронной почты",
    email_placeholder: "Введите ваш e-mail",
    address_line1: "Адрес — строка 1",
    address_line1_placeholder: "Улица и номер дома",
    address_line2: "Дополнение к адресу",
    address_line2_placeholder: "Квартира, корпус, офис и т. д. (необязательно)",
    city: "Город",
    city_placeholder: "Город",
    region: "Регион",
    region_placeholder: "Область или регион",
    postal_code: "Почтовый индекс",
    postal_code_placeholder: "Почтовый индекс",
    country: "Страна",
    country_placeholder: "Страна",
    phone: "Телефон",
    phone_placeholder: "Номер телефона",
    terms_accepted: "Я принимаю Условия обслуживания",
    privacy_accepted: "Я принимаю Политику конфиденциальности",
    viewTerms: "Просмотреть условия",
    viewPrivacy: "Просмотреть политику конфиденциальности",
    customer_note: "Примечание клиента (необязательно)",
    customer_note_placeholder: "Любая дополнительная информация, которую вы хотите нам сообщить",
    note_limit: "Максимум {{count}} символов",
    characters: "символов",
    submitting: "Отправка...",
    submit: "ОТПРАВИТЬ ЗАЯВКУ",
    errors: {
      full_name_required: "Полное имя обязательно",
      email_required: "Электронная почта обязательна",
      email_invalid: "Неверный адрес электронной почты",
      address_line1_required: "Адрес обязателен",
      city_required: "Город обязателен",
      country_required: "Страна обязательна",
      terms_required: "Вы должны принять Условия обслуживания",
      privacy_required: "Вы должны принять Политику конфиденциальности",
      note_too_long: "Примечание должно быть не длиннее 500 символов",
      submit_failed: "Сбой отправки. Попробуйте ещё раз."
    }
  },
  checkoutSuccess: {
    verifying: "Проверка платежа…",
    backToPricing: "Вернуться к планам",
    couldNotVerify: "Нам пока не удалось подтвердить ваш платёж",
    couldNotVerifyDesc: "Если вы завершили оформление, не волнуйтесь — платёж обрабатывается, и ваша учётная запись будет активирована в ближайшее время. Обновите эту страницу через минуту.",
    verifiedBadge: "Подтверждено",
    paymentCompleted: "Платёж завершён",
    activationNotice: "Ваша учётная запись будет активирована в течение нескольких минут.",
    paymentId: "ID платежа",
    applicationId: "ID заявки",
    securityNotice: "В целях безопасности учётные записи активируются вручную оператором после проверки платежа. Вы получите доступ сразу после завершения проверки.",
    goToDashboard: "Перейти в панель",
    contactSupport: "Связаться с поддержкой",
    verifyingBadge: "Проводится проверка",
    paymentReceived: "Платёж получен. Мы проверяем платёж.",
    beingVerified: "Ваш платёж проверяется. Эта страница обновится автоматически, как только платёж будет подтверждён. Не закрывайте это окно.",
    currentStatus: "Текущий статус",
    urlSecurityNotice: "В целях безопасности эта страница не отмечает платёж как завершённый только на основании URL. Мы ожидаем подтверждения на сервере."
  },
  termsPage: {
    title: "Условия использования",
    entityTitle: "Договаривающаяся сторона",
    entityText: "[Наименование юридического лица, регистрационный номер, юрисдикция]",
    descriptionTitle: "Описание услуги",
    descriptionText: "Braxel Markets предоставляет инфраструктуру алгоритмической торговли институционального уровня и сопутствующие услуги через свою платформу.",
    feesTitle: "Сборы и платежи",
    feesText: "Стоимость наших услуг указана на странице «Тарифы» и может быть изменена с предварительным уведомлением. Способы оплаты включают банковский перевод, кредитную карту и криптовалюту.",
    eligibilityTitle: "Право на использование",
    eligibilityText: "Наши услуги доступны физическим и юридическим лицам не моложе 18 лет, соблюдающим наши требования по идентификации клиентов (KYC) и противодействию отмыванию денег (AML).",
    accountTerminationTitle: "Закрытие аккаунта",
    accountTerminationText: "Любая из сторон может закрыть аккаунт, уведомив письменно за [PLACEHOLDER: срок уведомления, например 30 дней]. Braxel Markets может закрыть аккаунт немедленно при нарушении условий, незаконной деятельности или требований регуляторов.",
    limitationOfLiabilityTitle: "Ограничение ответственности",
    limitationOfLiabilityText: "В максимально допустимой законом степени Braxel Markets не несёт ответственности за косвенные, случайные, специальные, последующие или штрафные убытки, а также за потерю данных, использования, деловой репутации или иные нематериальные потери, возникшие в результате доступа к нашим услугам или их использования.",
    disputeResolutionTitle: "Разрешение споров и применимое право",
    disputeResolutionText: "Настоящие Условия регулируются и толкуются в соответствии с законодательством [PLACEHOLDER: юрисдикция]. Любой спор, возникающий из настоящих Условий или в связи с ними, подлежит исключительной юрисдикции судов [PLACEHOLDER: юрисдикция].",
    changesToTermsTitle: "Изменения настоящих Условий",
    changesToTermsText: "Мы оставляем за собой право изменять или заменять настоящие Условия в любое время. При существенном изменении мы уведомим не менее чем за [PLACEHOLDER: срок уведомления, например 30 дней] до вступления новых условий в силу. Что считается существенным изменением, определяется нашим единоличным усмотрением.",
    effectiveDateTitle: "Дата вступления в силу",
    effectiveDateText: "Дата вступления в силу: [PLACEHOLDER: дата]",
    contactTitle: "Контакты",
    contactText: "По вопросам об этих Условиях обращайтесь к нам по адресу [PLACEHOLDER: контактная электронная почта или адрес]."
  },
  legalDraftBanner: "Эта страница является черновиком на юридической проверке и ещё не является окончательной.",
  notFound: {
    title: "404",
    message: "Извините, страница, которую вы ищете, не существует.",
    returnHome: "Вернуться на главную"
  },
  authCallback: {
    confirmingTitle: "Подтверждение вашего аккаунта...",
    confirmingDesc: "Пожалуйста, подождите, пока мы проверяем вашу почту.",
    confirmedTitle: "Электронная почта подтверждена!",
    confirmedDesc: "Ваш аккаунт успешно подтверждён.",
    redirecting: "Перенаправление на вход...",
    failedTitle: "Ошибка подтверждения",
    goToLogin: "Перейти к входу",
    invalidLink: "Недействительная или истёкшая ссылка подтверждения",
    failedConfirm: "Не удалось подтвердить почту"
  },
  paymentsDisabled: {
    title: "Платежи в настоящее время отключены.",
    desc: "Платёжная система ещё не активна. Чтобы включить платежи, свяжитесь с оператором по адресу",
    managedBy: "Обработка платежей осуществляется исключительно оператором платформы. Если у вас есть вопросы о pending-распределении, обратитесь в поддержку.",
    viewPlans: "Посмотреть инвестиционные планы"
  },
  checkoutStatus: {
    created: "Создан",
    pending: "Ожидание оплаты",
    processing: "Проверка в блокчейне",
    confirmed: "Подтверждён",
    failed: "Ошибка",
    rejected: "Отклонён",
    refunded: "Возвращён",
    disputed: "Оспорен",
    canceled: "Отменён",
    pending_manual: "Ожидание ручной проверки"
  },
  legalReview: {
    title: "Черновик на юридической проверке"
  },
  operator: {
    title: "Оператор",
    subtitle: "Панель",
    description: "Проверяйте и активируйте ожидающие заявки клиентов.",
    no_pending_applications: "Нет ожидающих заявок.",
    plan: "План",
    amount: "Сумма",
    country: "Страна",
    customer_note: "Примечание клиента",
    activate_account: "Активировать аккаунт",
    activating: "Активация...",
    reject_or_request_info: "Отклонить / запросить информацию",
    rejecting: "Отклонение...",
    reject_application: "Отклонить заявку",
    reject_reason_prompt: "Укажите причину отклонения или необходимую информацию.",
    reject_reason_placeholder: "Причина...",
    cancel: "Отмена",
    reject: "Отклонить",
    errors: {
      activation_failed: "Не удалось активировать заявку.",
      rejection_failed: "Не удалось отклонить заявку."
    },
    status: {
      activation_pending: "Ожидает активации",
      account_active: "Аккаунт активен",
      rejected: "Отклонён",
      manual_review: "Ручная проверка"
    }
  },
  profitCalculator: {
    badge: "ПРОГНОЗ",
    titleA: "КАЛЬКУЛЯТОР",
    titleB: "ПРИБЫЛИ",
    initialAllocation: "Начальное распределение",
    monthlyProfit: "Ожид. месячная прибыль",
    annualProfit: "Ожид. годовая прибыль",
    riskTitle: "Управление рисками",
    riskDesc: "Прогнозы основаны на исторической эффективности алгоритма со строгими лимитами просадки.",
    instantTitle: "Мгновенное развёртывание",
    instantDesc: "Ваш капитал начинает работать через несколько минут после интеграции инфраструктуры.",
    disclaimer: "* Отказ от ответственности: прошлые результаты не гарантируют будущих. Прогнозы приведены исключительно в иллюстративных целях."
  },
  meta: {
    home: {
      title: "Braxel Markets | Институциональное алгоритмическое управление капиталом",
      description: "Инфраструктура алгоритмической торговли институционального уровня, доступ к капиталу проп-фирм, авторизация CopyTrade и полная автоматизация MetaTrader для XAU/USD и US500."
    },
    pricing: {
      title: "Тарифы и управляемый капитал | Braxel Markets",
      description: "Сравните тарифы алгоритмической торговли и распределение управляемого капитала. Управляемый капитал всегда указывается в USD."
    },
    about: {
      title: "О Braxel Markets | Алгоритмическая торговля",
      description: "Braxel Markets создаёт инфраструктуру алгоритмической торговли институционального уровня и управляет капиталом со строгим контролем рисков."
    },
    howItWorks: {
      title: "Как это работает | Braxel Markets",
      description: "Узнайте, как Braxel Markets подключает ваш капитал к полностью автоматизированным стратегиям MetaTrader для XAU/USD и US500."
    },
    contact: {
      title: "Контакты | Braxel Markets",
      description: "Свяжитесь с командой Braxel Markets по вопросам инфраструктуры алгоритмической торговли и управляемого капитала."
    },
    terms: {
      title: "Условия использования | Braxel Markets",
      description: "Ознакомьтесь с Условиями использования Braxel Markets."
    },
    privacy: {
      title: "Политика конфиденциальности | Braxel Markets",
      description: "Узнайте, как Braxel Markets собирает, использует и защищает ваши персональные данные."
    },
    disclaimer: {
      title: "Раскрытие рисков | Braxel Markets",
      description: "Важное раскрытие рисков для алгоритмической торговли и управляемого капитала в Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "Бразилия",
      US: "США",
      GB: "Великобритания",
      DE: "Германия",
      FR: "Франция",
      ES: "Испания",
      IT: "Италия",
      PT: "Португалия",
      RU: "Россия",
      CN: "Китай",
      JP: "Япония",
      IN: "Индия",
      OTHER: "Другие страны"
    },
    method: {
      BR: {
        id_card: "Национальное удостоверение личности (RG/CPF)",
        drivers_license: "Водительское удостоверение"
      },
      US: {
        id_card: "Удостоверение личности штата"
      },
      GB: {
        id_card: "Национальное удостоверение / Водительские права",
        biometric: "Биометрическое разрешение на пребывание"
      },
      DE: {
        drivers: "Водительское удостоверение",
        passport: "Паспорт / Reisepass"
      },
      FR: {
        residence: "Разрешение на проживание"
      },
      RU: {
        foreign_passport: "Заграничный паспорт"
      },
      OTHER: {
        passport: "Международный паспорт",
        national_id: "Национальное удостоверение личности"
      }
    },
    doc: {
      rg: {
        desc: "Бразильское национальное удостоверение личности"
      },
      cpf: {
        desc: "Бразильская карта налогового учёта (CPF)"
      },
      passport: {
        desc: "Действующий паспорт со страницей с фотографией",
        name: "Паспорт"
      },
      cnh: {
        desc: "Бразильское водительское удостоверение",
        name: "CNH (водительское удостоверение)"
      },
      state_id: {
        desc: "Водительские права или удостоверение, выданное штатом",
        name: "Удостоверение личности штата"
      },
      passport_uk: {
        desc: "Действующий паспорт Великобритании"
      },
      driving_license_uk: {
        desc: "Водительское удостоверение Великобритании",
        name: "Водительское удостоверение"
      },
      brp: {
        desc: "Биометрическое разрешение на пребывание в Великобритании",
        name: "Биометрическое разрешение на пребывание"
      },
      personalausweis: {
        desc: "Немецкое удостоверение личности"
      },
      passport_de: {
        desc: "Действующий немецкий паспорт"
      },
      fuehrerschein: {
        desc: "Немецкое водительское удостоверение"
      },
      cni: {
        desc: "Французское национальное удостоверение личности"
      },
      passport_fr: {
        desc: "Действующий французский паспорт"
      },
      titre_sejour: {
        desc: "Французское разрешение на проживание"
      },
      dni: {
        desc: "Испанское национальное удостоверение личности"
      },
      nie: {
        desc: "Идентификационный номер иностранца"
      },
      passport_es: {
        desc: "Действующий паспорт"
      },
      carta_id: {
        desc: "Итальянское удостоверение личности"
      },
      passport_it: {
        desc: "Действующий итальянский паспорт"
      },
      cc: {
        desc: "Португальская карта гражданина"
      },
      passport_pt: {
        desc: "Действующий португальский паспорт"
      },
      passport_ru: {
        desc: "Российский внутренний паспорт"
      },
      foreign_passport_ru: {
        desc: "Российский заграничный паспорт",
        name: "Заграничный паспорт"
      },
      id_card_cn: {
        desc: "Китайское удостоверение личности"
      },
      passport_cn: {
        desc: "Действующий паспорт"
      },
      passport_jp: {
        desc: "Действующий японский паспорт"
      },
      zairyu: {
        desc: "Карта резидента"
      },
      aadhaar: {
        desc: "Карта уникальной идентификации",
        name: "Карта Aadhaar"
      },
      voter_id: {
        desc: "Избирательное удостоверение с фотографией",
        name: "Избирательное удостоверение"
      },
      passport_in: {
        desc: "Действующий индийский паспорт"
      },
      passport_intl: {
        desc: "Действующий паспорт вашей страны"
      },
      national_id_intl: {
        desc: "Национальное удостоверение, выданное государством",
        name: "Национальное удостоверение личности"
      }
    },
    methodName: {
      id_card: "Национальное удостоверение личности",
      passport: "Паспорт",
      drivers_license: "Водительское удостоверение",
      drivers: "Водительское удостоверение",
      biometric: "Биометрическое разрешение на пребывание",
      residence: "Разрешение на проживание",
      foreign_passport: "Заграничный паспорт",
      national_id: "Национальное удостоверение личности"
    }
  },
  errorBoundary: {
    title: "Что-то пошло не так",
    message: "Не удалось загрузить эту страницу. Попробуйте ещё раз.",
    retry: "Перезагрузить страницу",
    home: "На главную"
  }
};

const zhTranslation = {
  disclaimerPage: {
    title: "财务免责声明",
    risk: "风险",
    importantRiskTitle: "重要风险提示",
    importantRiskText: "投资金融市场存在重大风险，可能导致投资本金全部损失。过往表现并不保证未来结果。",
    noAdviceTitle: "不构成建议",
    noAdviceText: "本网站的内容及 Braxel Markets 提供的服务不构成财务、法律或税务建议。我们建议每位投资者在做出投资决策前寻求独立的专业意见。",
    limitationTitle: "责任限制",
    limitationText: "对于因使用我们的自动化技术或市场波动而造成的财务损失，Braxel Markets 概不负责。",
    capitalAtRiskTitle: "资金面临风险",
    capitalAtRiskText: "使用我们的服务时，您的资金面临风险。您可能损失部分或全部投资。",
    noGuaranteedReturnsTitle: "不保证回报",
    noGuaranteedReturnsText: "我们不保证任何回报或利润。过往表现并不预示未来结果。",
    pastPerformanceTitle: "过往表现不具指示性",
    pastPerformanceText: "所展示的任何历史表现仅供参考，并不保证未来结果。",
    notLicensedTitle: "监管状态",
    notLicensedText: "Braxel Markets 目前在 [PLACEHOLDER: 司法管辖区] 并未以持牌或受监管金融机构的身份出现。请核实适用于您所在地区的监管状态。",
    noCapitalProtectionTitle: "不提供本金保护担保",
    noCapitalProtectionText: "我们不提供任何本金保护或损失担保。",
    algorithmicRisksTitle: "算法/自动化交易风险",
    algorithmicRisksText: "自动化及算法交易策略涉及多种风险，包括但不限于系统故障、连接问题、模型错误以及意外的市场状况。",
    jurisdictionRestrictionsTitle: "司法管辖区限制",
    jurisdictionRestrictionsText: "我们的服务可能并非在所有司法管辖区均可提供。用户有责任在使用我们的平台前确保遵守当地法律法规。"
  },
  privacyPage: {
    title: "隐私政策",
    privacy: "隐私",
    dataCollectionTitle: "数据收集",
    dataCollectionText: "我们仅收集提供服务所必需的信息，包括姓名、电子邮件和交易数据。您的数据受 AES-256 加密保护。",
    useOfInfoTitle: "信息的使用",
    useOfInfoText: "所收集的信息仅用于管理您的账户、处理付款以及发送每周业绩报告。",
    securityTitle: "安全",
    securityText: "我们实施严格的安全措施，防止您的个人数据遭到未经授权的访问、篡改或销毁。",
    legalBasisTitle: "处理的法律依据",
    legalBasisText: "我们处理您个人数据的法律依据是 [PLACEHOLDER: 法律依据，例如同意、合法利益、合同必要性]。",
    retentionTitle: "数据保留期限",
    retentionText: "我们将您的个人数据保留 [PLACEHOLDER: 保留期限]，除非法律要求更长的期限。",
    thirdPartiesTitle: "第三方与处理者",
    thirdPartiesText: "我们可能将您的数据分享给值得信赖的第三方服务提供商，例如 [PLACEHOLDER: 处理者清单，例如支付处理商、云托管、电子邮件服务]，仅用于本政策所述的目的。",
    userRightsTitle: "您的权利",
    userRightsText: "根据适用的数据保护法律（如巴西 LGPD 和欧盟 GDPR），您有权访问、更正、删除和转移您的个人数据，并有权反对或限制处理。如需行使这些权利，请通过 [PLACEHOLDER: 权利请求联系方式] 与我们联系。",
    cookiesTitle: "Cookie 及类似技术",
    cookiesText: "我们的网站使用 Cookie 及类似技术来提升用户体验、分析流量并个性化内容。您可以通过浏览器设置管理您的 Cookie 偏好。",
    contactTitle: "联系方式与数据保护官",
    contactText: "如对本隐私政策或我们的数据实践有任何疑问，请通过 [PLACEHOLDER: DPO 邮箱或联系方式] 联系我们的数据保护官。"
  },
  contactEmail: {
    newSubmission: "新的联系表单提交",
    name: "姓名",
    email: "电子邮件",
    subject: "主题",
    message: "消息",
    sentFrom: "发送自"
  },
  nav: {
    pricing: "投资计划",
    howItWorks: "基础设施",
    about: "关于我们",
    contact: "机构支持",
    login: "终端访问",
    support: "支持",
    openAccount: "创建账户",
    dashboard: "控制面板",
    logout: "退出登录",
    selectLanguage: "选择语言",
    sessionActive: "活跃会话",
    accessDashboard: "访问控制面板"
  },
  footer: {
    desc: "机构级投资基础设施。为现代市场打造的专有技术。",
    platform: "平台",
    company: "公司",
    support: "数字支持",
    rights: "保留所有权利。",
    privacy: "隐私",
    terms: "条款",
    disclaimer: "金融免责声明",
    address: "商业地址",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, 西班牙",
    riskTitle: "风险免责声明",
    riskText: "金融市场交易涉及重大损失风险，并非适合所有投资者。过往业绩不代表未来表现。投资价值可能上升或下降。请勿投资您无法承受损失的资金。Braxel Markets不保证任何特定回报。",
    emailAria: "电子邮件",
    xAria: "X（推特）"
  },
  auth: {
    loginTitle: "登录",
    loginSubtitle: "请输入您的访问凭证。",
    registerTitle: "创建账户",
    registerSubtitle: "开启您的机构市场之旅。",
    email: "电子邮箱",
    password: "密码",
    fullName: "全名",
    forgotPassword: "忘记密码？",
    noAccount: "还没有账户？",
    hasAccount: "已有访问权限？",
    btnAccess: "访问账户",
    btnCreate: "创建我的账户",
    termsAgree: "我同意条款和隐私政策。",
    futureTitle: "投资的",
    futureSubtitle: "未来",
    features: [
      "机构级算法",
      "高级资本保护",
      "毫秒级执行",
      "完全透明"
    ],
    accessBadge: "机构访问",
    emailPlaceholder: "输入您的电子邮件",
    fullNamePlaceholder: "输入您的全名",
    loginLink: "登录",
    loginSideDescription: "访问您的机构终端。",
    loginSideFooter: "机构级安全性",
    loginErrorMessage: "无效的凭证。请重试。",
    registerErrorMessage: "注册失败。请重试。",
    registerSuccessMessage: "账户创建成功！",
    registerSideFooter: "受机构级安全保护",
    welcomeBackTitle: "欢迎回来",
    welcomeBackHighlight: "机构终端",
    accountNotFound: "未找到账户。请先创建账户。",
    rememberMe: "记住我",
    registerLink: "创建账户",
    passwordPlaceholder: "密码",
    accountNotFoundError: "未找到账户。请先创建账户。",
    resetPasswordSent: "如果该邮箱存在账户，已发送密码重置链接。",
    resetPasswordError: "无法发送重置链接。请重试。",
    enterEmailFirst: "请先输入您的电子邮件地址。"
  },
  hero: {
    title1: "精英算法",
    title2: "资本管理",
    desc: "部署专为现代市场设计的机构级量化策略。体验毫秒级执行精度和先进的风险缓解协议。",
    getStarted: "探索投资计划",
    viewStrategies: "技术方法论"
  },
  stats: {
    volume: "战略资本管理",
    traders: "活跃账户",
    uptime: "基础设施运行时间",
    latency: "执行精度"
  },
  methodology: {
    badge: "方法论",
    title: "量化模型",
    statArb: {
      title: "统计套利",
      desc: "利用协整模型和配对交易，开发相关资产间的临时价格低效。",
      f1: "协整分析",
      f2: "配对选择算法",
      f3: "Z-Score阈值"
    },
    meanRev: {
      title: "均值回归",
      desc: "识别资产价格偏离历史均值的情况，采用系统性的进出场规则。",
      f1: "布林带信号",
      f2: "RSI背离检测",
      f3: "Ornstein-Uhlenbeck模型"
    },
    hft: {
      title: "高频交易",
      desc: "利用共址基础设施实现超低延迟执行策略，微秒级下单。",
      f1: "市场微观结构",
      f2: "订单流分析",
      f3: "延迟套利"
    }
  },
  transparency: {
    badge: "基础设施",
    title: "透明技术",
    desc: "我们的基础设施建立在企业级基础之上，确保可靠性、速度和安全性。",
    connectivity: {
      title: "连接性",
      desc: "通过 Equinix 数据中心（NY5、LD4、TY3）直接接入市场，以低延迟连接主要交易所（未经证实）。"
    },
    cloud: {
      title: "云端执行",
      desc: "在 AWS（us-east-1、eu-west-1）和 Azure 上运行冗余执行引擎，以实现故障转移弹性（未经证实）。"
    },
    security: {
      title: "安全性",
      desc: "端到端加密、SOC 2 Type II 合规以及所有操作的多层身份验证（未经证实）。"
    },
    warning: "市场具有波动性。收益从无保证，即使有稳健的保障措施也可能发生亏损。",
    protocolTitle: "为机构使用而设计的协议",
    protocolDesc: "我们的基础设施遵循严格的合规与风险管理标准，力求实现运营安全（不作保证）。"
  },
  process_home: {
    badge: "流程",
    title: "机构级",
    subtitle: "工作流",
    step1: {
      title: "注册",
      desc: "安全入驻和身份验证。"
    },
    step2: {
      title: "配置",
      desc: "选择管理资本级别。"
    },
    step3: {
      title: "集成",
      desc: "部署算法基础设施。"
    },
    step4: {
      title: "监控",
      desc: "通过终端实时跟踪表现。"
    },
    step5: {
      title: "流动性",
      desc: "简化的利润提取协议。"
    }
  },
  cta_home: {
    badge: "机会",
    title: "扩展您的",
    subtitle: "资本",
    desc: "加入使用Braxel专有基础设施的精英投资者群体。",
    btn: "开始配置",
    trust: "机构级安全"
  },
  pricing: {
    badge: "透明度",
    title: "资本",
    subtitle: "配置",
    desc: "机构级基础设施，透明费率结构。",
    select: "选择此计划",
    allocation: "管理资本",
    month: "月费",
    detectedCurrency: "所有价格均以 USD ({{currency}}) 收取，与您所在的位置无关",
    managedCapitalUsdNote: "管理资本（Capital Gerenciado）始终以美元计价。"
  },
  plans: {
    starter: "入门版",
    starterFeatures: "入门版功能",
    managedCapital: "管理资本",
    features: {
      automation: "自动化",
      accountManagement: "账户管理",
      emailSupport: "邮件支持",
      controlledRisk: "风险控制",
      starterFeatures: "入门版功能",
      prioritySupport: "优先支持",
      detailedLogs: "详细日志",
      proFeatures: "Pro 功能",
      multiAccount: "多账户",
      weeklyReports: "周报",
      advancedFeatures: "高级功能",
      support247: "24/7支持",
      dedicatedManager: "专属经理"
    },
    professional: "专业版",
    professionalFeatures: "专业版功能",
    business: "商业版",
    businessFeatures: "商业版功能",
    enterprise: "企业版",
    enterpriseFeatures: "企业版功能"
  },
  howItWorks: {
    badge: "基础设施",
    title: "技术",
    subtitle: "架构",
    desc: "我们的专有生态系统专为速度、安全和稳定性能而构建。",
    steps: [
      {
        title: "注册",
        desc: "创建您的机构配置文件。"
      },
      {
        title: "控制面板",
        desc: "访问您的私人管理终端。"
      },
      {
        title: "选择计划",
        desc: "选择您的资本配置级别。"
      },
      {
        title: "API部署",
        desc: "自动连接全球市场。"
      },
      {
        title: "执行",
        desc: "毫秒级订单处理。"
      },
      {
        title: "报告",
        desc: "详细的每周绩效分析。"
      }
    ],
    cta: "准备好开始了吗？",
    ctaBtn: "加入网络"
  },
  about: {
    badge: "关于我们",
    title: "机构级",
    subtitle: "卓越",
    desc: "Braxel Markets代表了算法资本管理的巅峰。",
    historyTitle: "我们的历史",
    historyDesc1: "由量化分析师和软件工程师团队创立，Braxel旨在弥合零售资本与机构技术之间的差距。",
    historyDesc2: "今天，我们专注于风险调整回报和基础设施稳定性，为现代投资者提供尖端算法策略。",
    stats: {
      founded: "成立",
      users: "活跃用户",
      uptime: "正常运行时间",
      support: "支持"
    },
    values: {
      mission: "使命",
      missionDesc: "为全球资本提供精英算法基础设施。",
      vision: "愿景",
      visionDesc: "定义自动化量化管理的未来。",
      values: "价值观",
      valuesDesc: "透明、精确和坚定不移的安全。"
    },
    teamTitle: "领导团队",
    teamDesc: "认识Braxel Markets背后的创始人和管理者。",
    team: [
      {
        name: "Bernardo Campi",
        role: "创始人兼CEO",
        bio: "量化策略师和企业家，引领Braxel Markets在机构级算法基础设施方面的愿景。",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "领导团队"
  },
  contact: {
    badge: "支持",
    title: "机构",
    subtitle: "渠道",
    desc: "我们的专业支持团队全天候24/7为机构咨询提供服务。",
    infoTitle: "联系方式",
    formTitle: "直接咨询",
    placeholders: {
      name: "全名",
      email: "电子邮箱",
      subject: "主题",
      message: "留言"
    },
    sendBtn: "发送咨询",
    supportHours: "支持时间",
    institutionalSupport: "24/7机构支持",
    securityChallenge: "安全验证",
    securityAnswer: "答案",
    incorrectAnswer: "安全答案错误。请重试。",
    waitMessage: "请稍候再发送下一条消息。",
    messageSent: "消息发送成功！我们的团队将尽快与您联系。",
    messageFailed: "消息发送失败。请重试或直接发送邮件至 marketsbraxel@ouvidor.net",
    cooldown: "请等待",
    consentPre: "提交此表单即表示您同意我们的",
    consentPost: "我们仅使用您的数据来回复您的咨询。",
    emailLabel: "电子邮件"
  },
  dashboard: {
    portfolio: "投资组合",
    activeServices: "活跃服务",
    newAllocation: "新配置",
    noServices: "未找到活跃的投资计划。",
    balance: "当前余额",
    withdraw: "提款",
    liquidity: "流动性",
    requestWithdraw: "申请提款",
    selectAccount: "选择账户",
    amount: "金额 (USD)",
    iban: "IBAN / 银行信息",
    btnWithdraw: "提交提款申请",
    profile: "个人资料管理",
    settings: "设置",
    firstName: "名",
    lastName: "姓",
    saveChanges: "保存更改",
    verifiedAccount: "已验证账户",
    accountStandard: "标准账户",
    withdrawal: {
      gateTitle: "需要身份验证",
      gateWhy: "为保护您的资金并遵守法规，申请提现前必须完成身份验证（KYC）。未验证也可自由交易。",
      gateRejectedDesc: "您之前的提交未被接受。请查看下方原因并重新提交文件。",
      gateUnderReview: "您的文件正在审核中。做出决定后我们会通过电子邮件通知您。在此之前无法申请提现。",
      kycStatusLabel: "验证状态",
      statusPending: "未提交",
      statusSubmitted: "审核中",
      statusApproved: "已批准",
      statusRejected: "已拒绝",
      rejectedReason: "原因",
      continueToForm: "继续提现",
      submitDocs: "提交文件",
      resubmit: "重新提交文件",
      uploadFront: "身份证件（正面）",
      uploadBack: "身份证件（背面）",
      uploadSelfie: "手持证件自拍",
      chooseFile: "选择文件",
      fileHint: "JPG、PNG 或 PDF，最大 10 MB",
      selfieHint: "手持证件、面部清晰的合照",
      optional: "可选",
      frontRequired: "请附上身份证件正面。",
      fileTooLarge: "文件大于 10 MB。",
      uploadError: "无法提交文件，请重试。",
      documentsSubmitted: "文件已提交，我们将尽快审核。",
    },
    totalAUM: "管理资产总额",
    activeAlgos: "活跃算法",
    systemStatus: "系统状态",
    operational: "运行中",
    infraProtection: "基础设施保护",
    twoFactor: "双因素认证",
    notEnabled: "未启用",
    enable2FA: "启用2FA",
    kycStatus: "KYC验证",
    verified: "已验证",
    viewDocs: "查看文件",
    investor: "投资者",
    kycRequired: "需要KYC验证",
    kycRequiredDesc: "完成身份验证以访问平台的所有功能。这是所有管理资金的账户的必填项。",
    kycUnderReview: "KYC 审核中",
    kycUnderReviewDesc: "您的文件正在由我们的合规团队审核。这通常需要24-48小时。",
    kycRejected: "KYC验证被拒绝",
    kycRejectedDesc: "您的文件未被接受。请重新提交有效文件。",
    resubmitDocs: "重新提交文件",
    completeVerification: "完成验证",
    verificationRequired: "需要验证",
    goToVerification: "前往验证",
    totalProfit: "总利润",
    drawdown: "回撤",
    maxDrawdown: "最大回撤",
    assetsInOperation: "运行中的资产",
    monthlyReturns: "月度收益",
    analytics: "分析",
    newWithdrawalRequest: "新的取款请求",
    walletIban: "钱包 / IBAN",
    network: {
      erc20: "ERC-20（以太坊）",
      trc20: "TRC-20（波场）",
      bep20: "BEP-20（BSC）",
      bankSwift: "银行转账（SWIFT）"
    },
    transactionHistory: "交易历史",
    operations: "操作",
    asset: "资产",
    type: "类型",
    entry: "入场",
    exit: "出场",
    profit: "利润",
    time: "时间",
    status: "状态",
    open: "开",
    closed: "平",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "加密货币钱包地址或 IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "输入 6 位验证码",
    minPasswordPlaceholder: "至少 8 个字符",
    confirmPasswordPlaceholder: "再次输入新密码",
    accountNotFound: "未找到账户。请先创建一个账户。",
    loginSuccess: "登录成功！",
    rememberMe: "记住我",
    navPerformance: "业绩",
    navAuditLog: "审计日志",
    tabProfile: "个人资料",
    tabKycVerification: "KYC 认证",
    tabSecurity: "安全",
    kycCompleteDesc: "完成您的 KYC 认证以访问平台的所有功能。这是所有账户的强制合规要求。",
    kyc: {
      approved: "认证已批准",
      underReview: "文件审核中",
      rejected: "认证被拒绝",
      required: "需要认证",
      descApproved: "您的身份已验证。所有功能已解锁。",
      descSubmitted: "我们的合规团队正在审核您的文件。通常需要 24-48 小时。",
      descRejected: "您的文件未被接受。请使用有效文件重新提交。",
      descRequired: "完成身份验证以解锁平台的所有功能。",
      stepCountry: "国家",
      stepMethod: "方式",
      stepDocument: "文件",
      stepReview: "审核",
      selectCountry: "选择您的国家",
      selectCountryDesc: "选择签发您身份文件的国家。",
      selectCountryPlaceholder: "选择一个国家...",
      selectMethod: "选择验证方式",
      selectMethodDesc: "选择您要为 {{country}} 验证身份的方式。",
      uploadDocument: "上传您的文件",
      uploadDocumentDesc: "从以下选项中选择并上传一个有效文件。",
      clickToUpload: "点击上传或拖放",
      submitting: "提交中...",
      submitForVerification: "提交认证",
      progressTitle: "认证进度",
      stepEmailVerification: "邮箱验证",
      stepIdentityDocument: "身份证件",
      stepComplianceReview: "合规审核",
      stepAccountActivation: "账户激活",
      statusInProgress: "进行中",
      statusComplete: "已完成",
      statusPending: "待处理",
      changePassword: "修改密码",
      updateCredentials: "更新您的凭据",
      newPassword: "新密码",
      confirmNewPassword: "确认新密码",
      emailVerification: "邮箱验证",
      verified: "已验证",
      verifiedEmail: "已验证邮箱",
      securityActivityLog: "安全活动日志",
      scanAuthenticator: "用您的身份验证应用扫描",
      eventLoginNewDevice: "从新设备登录",
      eventPasswordChanged: "密码已更改",
      eventAccountCreated: "账户已创建",
      timeHoursAgo: "{{count}} 小时前",
      timeDaysAgo: "{{count}} 天前"
    },
    newEmailLabel: "新电子邮件地址",
    sendConfirmationLink: "发送确认链接",
    identityVerified: "您的身份已通过验证！所有功能现已解锁。",
    verificationRejected: "您的验证已被拒绝。请重新提交您的文件。",
    profileUpdated: "个人资料更新成功。",
    failedUpdateProfile: "更新个人资料失败。",
    differentEmail: "请输入不同的电子邮件地址。",
    confirmationLinkSent: "确认链接已发送至新的电子邮件地址。请验证以完成更改。",
    failedEmail: "更新电子邮件失败。",
    passwordsDoNotMatch: "密码不匹配。",
    passwordTooShort: "密码必须至少为 8 个字符。",
    passwordChanged: "密码修改成功。",
    failedPassword: "修改密码失败。",
    uploadDocument: "请上传文件。",
    completeSteps: "请完成所有验证步骤。",
    documentsSubmitted: "文件已提交以供验证。审核完成后您将收到通知。",
    failedDocuments: "提交文件失败。",
    performanceTitle: "业绩控制面板",
    auditLogTitle: "审计日志",
    auditLogDesc: "在您的账户上执行的所有算法订单。",
    accountSettingsTitle: "账户设置",
    personalInformation: "个人信息",
    emailAddress: "电子邮件地址",
    emailChangeNotice: "更改电子邮件需要验证。确认链接将发送到新的电子邮件地址。",
    currentEmail: "当前电子邮件",
    confirmationSent: "确认已发送",
    tryDifferentEmail: "尝试其他电子邮件",
    continueToMethod: "继续选择方式",
    uploadHint: "PNG、JPG、PDF，最大 10MB",
    twoFactorDesc: "为您的账户增加一层额外保护。使用 Google Authenticator 或 Authy 等身份验证器应用。",
    qrCode: "二维码",
    kycRequiredBanner: "需要 KYC",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "网络",
    emailChangeInboxNotice: "请查收您的收件箱，并点击链接以完成电子邮件地址的更改。",
    emailChangeSentTo: "确认链接已发送至 {{email}}。请查收您的收件箱，并点击链接以完成电子邮件地址的更改。",
    growthPerformanceMtd: "增长表现（本月至今）"
  },
  checkout: {
    summary: "摘要",
    allocationTitle: "机构",
    allocationSubtitle: "配置",
    tierLabel: "算法基础设施级别",
    billedMonthly: "按月计费",
    detailsTitle: "配置详情",
    managedCapital: "管理资本",
    setupFee: "设置费",
    waived: "免除",
    latency: "执行延迟",
    infrastructureTitle: "包含的基础设施",
    realTimeMonitoring: "实时监控",
    activeUponDeployment: "部署后激活",
    totalDue: "应付总额",
    dedicatedNode: "专用节点",
    globalMarkets: "全球市场",
    instantSetup: "即时设置",
    authRequired: "需要认证",
    authDesc: "请登录或创建账户以继续配置。",
    btnLogin: "登录以继续",
    btnRegister: "创建账户",
    confirmDeployment: "确认部署",
    deploymentDesc: "确认后，您授权部署与{{plan}}计划相关的算法基础设施。",
    proceedPayment: "继续安全支付",
    secureGateway: "安全网关",
    back: "返回",
    riskDisclosure: "风险披露：算法交易涉及重大损失风险。过往业绩不代表未来表现。",
    secureTransaction: "安全交易",
    paypalNote: "您的支付信息由PayPal安全处理。Braxel Markets不存储您的银行卡信息。",
    encryptionNote: "AES-256机构级加密标准",
    verifying: "正在验证机构交易...",
    loading: "正在加载终端...",
    globalInfra: "全球支付基础设施",
    qrCode: "二维码",
    allCards: "所有银行卡",
    selectPaymentMethod: "选择支付方式",
    choosePayment: "选择您想要的支付方式",
    creditCard: "信用卡",
    instantPayment: "即时支付",
    cardDesc: "Visa、Mastercard 及其他卡种",
    crypto: "加密货币",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "快速安全的加密转账",
    securePayment: "安全支付",
    cardNumber: "卡号",
    cardName: "持卡人姓名",
    cardExpiry: "有效期",
    payNow: "立即支付",
    amountToPay: "应付金额",
    selectNetwork: "选择网络",
    yourAddress: "存款地址",
    yourAddressPlaceholder: "输入您的 USDT 地址",
    important: "重要",
    cryptoNote: "发送准确金额以获取计划",
    sendExactAmount: "请准确发送此金额以避免延误",
    confirmCrypto: "确认交易",
    copied: "已复制！",
    cryptoPending: "支付已记录！等待确认。",
    processing: "处理中...",
    paymentSuccess: "支付通过！",
    selectCountry: "选择国家/地区",
    searchCountry: "搜索国家/地区...",
    phone: "电话号码",
    fillAllFields: "请填写所有字段",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "姓名",
    cardExpiryPlaceholder: "月/年",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "支付失败",
    paymentError: "支付错误",
    amountToSend: "发送金额",
    paymentReference: "请将您的邮箱作为付款参考",
    wiseTransfer: "银行转账",
    bankDetails: "银行信息",
    accountHolder: "账户持有人",
    accountNumber: "账号",
    bankName: "银行名称",
    bankAddress: "银行地址",
    routingNumber: "汇款路线号码",
    confirmWise: "确认转账",
    wiseDesc: "通过 Wise 直接转账到我们的银行账户",
    wiseNote: "完成转账后，点击下方确认。验证后您的账户将被激活（1-3个工作日）。",
    wiseInternational: "国际汇款",
    openWise: "打开 Wise 网站",
    transferInstructions: "转账说明",
    lowFees: "低手续费",
    noKyc: "需要 KYC",
    anyCountry: "任何国家",
    wiseConfirmRequired: "请确认您已完成转账",
    wiseConfirmText: "我已完成银行转账，并确认所发送金额与计划价格一致。",
    wisePaymentSuccess: "付款已确认！您的账户正在设置中。",
    wiseStep1: "复制下方的银行信息",
    wiseStep2: "从您的银行或 Wise 账户进行转账",
    wiseStep3: "完成转账后点击确认",
    subscriptionTitle: "订阅",
    subscriptionSubtitle: "服务计划",
    serviceAccess: "服务访问",
    confirmCard: "确认银行卡",
    redirecting: "正在跳转到支付页面...",
    card: "信用卡 / 借记卡",
    testModeBanner: "测试模式 — 无真实资金。无真实银行。无真实钱包。无真实激活。",
    startFailed: "无法开始支付，请重试。",
    notConfigured: "支付功能尚未完全配置。请尝试其他方式或联系客服。",
    invalidPlanTitle: "无效套餐",
    invalidPlanDesc: "所选套餐已不可用，请重新选择套餐。",
    swiftLabel: "SWIFT",
    referenceLabel: "参考",
  },
  legal: {
    badgeLegal: "法律",
    termsTitle: "服务条款"
  },
  faq: {
    title: "常见问题",
    badge: "常见问题",
    q1: "需要先前经验吗？",
    a1: "不需要。我们的基础设施完全自动化。您只需选择配置级别并通过终端监控表现。",
    q2: "涉及哪些风险？",
    a2: "与任何金融市场一样，存在因波动性导致的资本损失风险。我们使用先进的缓解协议来保护资本。",
    q3: "系统如何运作？",
    a3: "我们的专有算法在全球市场以毫秒精度执行高频量化策略。",
    q4: "我可以取消计划吗？",
    a4: "可以。您可以随时通过控制面板协议申请取消和资本提取。"
  },
  diffs: {
    title: "为什么选择BRAXEL MARKETS？",
    badge: "差异化优势",
    t1: "专有技术",
    d1: "为机构级执行设计的神经网络。",
    t2: "完全自动化",
    d2: "24/7算法管理，无人类情绪偏差。",
    t3: "简化访问",
    d3: "通过直观终端访问机构基础设施。",
    t4: "专业级别",
    d4: "以超低延迟直连全球流动性池。"
  },
  signals: {
    title: "实时算法",
    subtitle: "执行",
    badge: "实时终端",
    desc: "实时监控我们的专有基础设施。每个信号都由我们的神经网络以毫秒精度处理。",
    asset: "资产",
    type: "类型",
    entry: "入场",
    profit: "利润",
    status: "状态",
    active: "活跃",
    completed: "已完成",
    institutionalVerification: "机构验证",
    realtimeFeed: "来自全球流动性池的实时数据馈送。",
    liveTerminal: "实时终端",
    connected: "已连接"
  },
  chatbot: {
    title: "Braxel 支持",
    placeholder: "输入消息…",
    emailSupport: "邮箱：",
    assistantReply: "感谢您的留言。我们的团队将尽快回复。",
    send: "发送",
    brandAI: "Braxel Markets 人工智能",
    openChat: "打开支持聊天",
    close: "关闭",
    minimize: "最小化",
    maximize: "最大化",
    supportDialog: "支持聊天"
  },
  application: {
    title: "申请",
    subtitle: "提交",
    plan_selected: "已选择方案",
    billed_monthly: "按月计费",
    plan_description: "您即将购买{{plan}}服务订阅。",
    plan_price_detail: "月费：{{price}}（按月支付）",
    full_name: "全名",
    full_name_placeholder: "输入您的全名",
    email: "电子邮箱",
    email_placeholder: "输入您的电子邮箱",
    address_line1: "地址 — 第一行",
    address_line1_placeholder: "街道和门牌号",
    address_line2: "补充地址",
    address_line2_placeholder: "公寓、楼层、单元等（可选）",
    city: "城市",
    city_placeholder: "城市",
    region: "州 / 地区",
    region_placeholder: "州或地区",
    postal_code: "邮政编码",
    postal_code_placeholder: "邮政编码",
    country: "国家/地区",
    country_placeholder: "国家/地区",
    phone: "电话号码",
    phone_placeholder: "电话号码",
    terms_accepted: "我接受服务条款",
    privacy_accepted: "我接受隐私政策",
    viewTerms: "查看条款",
    viewPrivacy: "查看隐私政策",
    customer_note: "客户备注（可选）",
    customer_note_placeholder: "您希望我们了解的任何其他信息",
    note_limit: "最多 {{count}} 个字符",
    characters: "个字符",
    submitting: "正在提交...",
    submit: "提交申请",
    errors: {
      full_name_required: "全名为必填项",
      email_required: "电子邮箱为必填项",
      email_invalid: "电子邮箱无效",
      address_line1_required: "地址为必填项",
      city_required: "城市为必填项",
      country_required: "国家/地区为必填项",
      terms_required: "您必须接受服务条款",
      privacy_required: "您必须接受隐私政策",
      note_too_long: "备注最多 500 个字符",
      submit_failed: "提交失败，请重试。"
    }
  },
  checkoutSuccess: {
    verifying: "正在验证付款…",
    backToPricing: "返回方案",
    couldNotVerify: "我们暂时无法验证您的付款",
    couldNotVerifyDesc: "如果您已完成结账，请不必担心——您的付款正在处理中，您的账户即将激活。请稍后刷新此页面。",
    verifiedBadge: "已验证",
    paymentCompleted: "付款已完成",
    activationNotice: "您的账户将在几分钟内激活。",
    paymentId: "付款编号",
    applicationId: "申请编号",
    securityNotice: "出于安全考虑，账户在付款验证后由操作员手动激活。您将在审核完成后获得访问权限。",
    goToDashboard: "前往控制台",
    contactSupport: "联系支持",
    verifyingBadge: "正在验证",
    paymentReceived: "已收到付款。我们正在验证付款。",
    beingVerified: "您的付款正在验证中。付款确认后，此页面将自动更新。请勿关闭此窗口。",
    currentStatus: "当前状态",
    urlSecurityNotice: "出于安全考虑，此页面不会仅凭网址将付款标记为已完成。我们等待服务器端确认。"
  },
  termsPage: {
    title: "服务条款",
    entityTitle: "签约主体",
    entityText: "[法人名称、注册号、司法管辖区]",
    descriptionTitle: "服务说明",
    descriptionText: "Braxel Markets 通过其平台提供机构级算法交易基础设施及相关服务。",
    feesTitle: "费用与支付",
    feesText: "我们的服务费用载于定价页面，并可在事先通知后变更。支付方式包括银行转账、信用卡和加密货币。",
    eligibilityTitle: "资格",
    eligibilityText: "我们的服务面向年满 18 周岁且符合我们「了解你的客户」(KYC) 及反洗钱 (AML) 要求的个人和实体。",
    accountTerminationTitle: "账户终止",
    accountTerminationText: "任何一方均可提前 [PLACEHOLDER: 通知期限，例如 30 天] 书面通知后终止账户。若违反条款、从事非法活动或出于监管要求，Braxel Markets 可立即终止账户。",
    limitationOfLiabilityTitle: "责任限制",
    limitationOfLiabilityText: "在法律允许的最大范围内，对于因您访问或使用我们的服务而产生的任何间接、附带、特殊、后果性或惩罚性损害，或任何数据、使用、商誉或其他无形损失，Braxel Markets 概不承担责任。",
    disputeResolutionTitle: "争议解决与适用法律",
    disputeResolutionText: "本条款受 [PLACEHOLDER: 司法管辖区] 法律管辖并据其解释。因本条款产生或与之相关的任何争议，均提交 [PLACEHOLDER: 司法管辖区] 法院专属管辖。",
    changesToTermsTitle: "本条款的变更",
    changesToTermsText: "我们保留随时修改或替换本条款的权利。若修订为重大变更，我们将在新条款生效前至少提前 [PLACEHOLDER: 通知期限，例如 30 天] 通知。何为重大变更由我们全权决定。",
    effectiveDateTitle: "生效日期",
    effectiveDateText: "生效日期：[PLACEHOLDER: 日期]",
    contactTitle: "联系方式",
    contactText: "如对本条款有任何疑问，请通过 [PLACEHOLDER: 联系邮箱或地址] 与我们联系。"
  },
  legalDraftBanner: "本页面为法律审核中的草稿，尚未定稿。",
  notFound: {
    title: "404",
    message: "抱歉，您要查找的页面不存在。",
    returnHome: "返回首页"
  },
  authCallback: {
    confirmingTitle: "正在确认您的账户...",
    confirmingDesc: "请稍候，我们正在验证您的电子邮件。",
    confirmedTitle: "电子邮件已确认！",
    confirmedDesc: "您的账户已成功验证。",
    redirecting: "正在跳转到登录页面...",
    failedTitle: "确认失败",
    goToLogin: "前往登录",
    invalidLink: "确认链接无效或已过期",
    failedConfirm: "确认电子邮件失败"
  },
  paymentsDisabled: {
    title: "支付功能目前已禁用。",
    desc: "支付系统尚未启用。如需启用支付，请联系运营方：",
    managedBy: "支付处理仅由平台运营方管理。如果您对待处理的配资有疑问，请联系客服。",
    viewPlans: "查看投资计划"
  },
  checkoutStatus: {
    created: "已创建",
    pending: "等待支付",
    processing: "链上验证中",
    confirmed: "已确认",
    failed: "失败",
    rejected: "已拒绝",
    refunded: "已退款",
    disputed: "有争议",
    canceled: "已取消",
    pending_manual: "等待人工审核"
  },
  legalReview: {
    title: "法律审核中的草案"
  },
  operator: {
    title: "运营方",
    subtitle: "控制面板",
    description: "审核并激活待处理的客户申请。",
    no_pending_applications: "没有待处理的申请。",
    plan: "计划",
    amount: "金额",
    country: "国家/地区",
    customer_note: "客户备注",
    activate_account: "激活账户",
    activating: "正在激活...",
    reject_or_request_info: "拒绝 / 请求信息",
    rejecting: "正在拒绝...",
    reject_application: "拒绝申请",
    reject_reason_prompt: "请提供拒绝原因或所需信息。",
    reject_reason_placeholder: "原因...",
    cancel: "取消",
    reject: "拒绝",
    errors: {
      activation_failed: "激活申请失败。",
      rejection_failed: "拒绝申请失败。"
    },
    status: {
      activation_pending: "等待激活",
      account_active: "账户已激活",
      rejected: "已拒绝",
      manual_review: "人工审核"
    }
  },
  profitCalculator: {
    badge: "预测",
    titleA: "收益",
    titleB: "计算器",
    initialAllocation: "初始配资",
    monthlyProfit: "预计月收益",
    annualProfit: "预计年收益",
    riskTitle: "风险管理",
    riskDesc: "基于历史算法表现并设有严格回撤限制的预测。",
    instantTitle: "即时部署",
    instantDesc: "基础设施集成后几分钟内，您的资金即可开始运作。",
    disclaimer: "* 免责声明：过往表现并不保证未来结果。预测仅供参考。"
  },
  meta: {
    home: {
      title: "Braxel Markets | 机构级算法资本管理",
      description: "机构级算法交易基础设施、自营交易公司资金接入、CopyTrade 授权，以及针对 XAU/USD 和 US500 的完整 MetaTrader 自动化。"
    },
    pricing: {
      title: "方案与托管资金 | Braxel Markets",
      description: "比较算法交易方案与托管资金配资。托管资金始终以美元计价。"
    },
    about: {
      title: "关于 Braxel Markets | 算法交易",
      description: "Braxel Markets 构建机构级算法交易基础设施，并以严格的风险控制管理资金。"
    },
    howItWorks: {
      title: "运作方式 | Braxel Markets",
      description: "了解 Braxel Markets 如何将您的资金接入针对 XAU/USD 和 US500 的全自动 MetaTrader 策略。"
    },
    contact: {
      title: "联系我们 | Braxel Markets",
      description: "就算法交易基础设施和托管资金事宜联系 Braxel Markets 团队。"
    },
    terms: {
      title: "服务条款 | Braxel Markets",
      description: "阅读使用 Braxel Markets 的服务条款。"
    },
    privacy: {
      title: "隐私政策 | Braxel Markets",
      description: "了解 Braxel Markets 如何收集、使用和保护您的个人数据。"
    },
    disclaimer: {
      title: "风险披露 | Braxel Markets",
      description: "关于在 Braxel Markets 进行算法交易和托管资金的重要风险披露。"
    }
  },
  kyc: {
    country: {
      BR: "巴西",
      US: "美国",
      GB: "英国",
      DE: "德国",
      FR: "法国",
      ES: "西班牙",
      IT: "意大利",
      PT: "葡萄牙",
      RU: "俄罗斯",
      CN: "中国",
      JP: "日本",
      IN: "印度",
      OTHER: "其他国家"
    },
    method: {
      BR: {
        id_card: "国民身份证（RG/CPF）",
        drivers_license: "驾驶执照"
      },
      US: {
        id_card: "州身份证"
      },
      GB: {
        id_card: "国民身份证 / 驾驶执照",
        biometric: "生物识别居留许可"
      },
      DE: {
        drivers: "驾驶执照",
        passport: "护照 / Reisepass"
      },
      FR: {
        residence: "居留许可"
      },
      RU: {
        foreign_passport: "外国护照"
      },
      OTHER: {
        passport: "国际护照",
        national_id: "国民身份证"
      }
    },
    doc: {
      rg: {
        desc: "巴西国民身份证件"
      },
      cpf: {
        desc: "巴西纳税人登记卡"
      },
      passport: {
        desc: "有效护照（含照片页）",
        name: "护照"
      },
      cnh: {
        desc: "巴西驾驶执照",
        name: "CNH（驾驶执照）"
      },
      state_id: {
        desc: "驾驶执照或州政府签发的身份证件",
        name: "州身份证"
      },
      passport_uk: {
        desc: "有效英国护照"
      },
      driving_license_uk: {
        desc: "英国驾驶执照",
        name: "驾驶执照"
      },
      brp: {
        desc: "英国生物识别居留许可",
        name: "生物识别居留许可"
      },
      personalausweis: {
        desc: "德国身份证"
      },
      passport_de: {
        desc: "有效德国护照"
      },
      fuehrerschein: {
        desc: "德国驾驶执照"
      },
      cni: {
        desc: "法国国民身份证"
      },
      passport_fr: {
        desc: "有效法国护照"
      },
      titre_sejour: {
        desc: "法国居留许可"
      },
      dni: {
        desc: "西班牙国民身份证件"
      },
      nie: {
        desc: "外国人识别号码"
      },
      passport_es: {
        desc: "有效护照"
      },
      carta_id: {
        desc: "意大利身份证"
      },
      passport_it: {
        desc: "有效意大利护照"
      },
      cc: {
        desc: "葡萄牙公民卡"
      },
      passport_pt: {
        desc: "有效葡萄牙护照"
      },
      passport_ru: {
        desc: "俄罗斯国内护照"
      },
      foreign_passport_ru: {
        desc: "俄罗斯外国护照",
        name: "外国护照"
      },
      id_card_cn: {
        desc: "中国身份证"
      },
      passport_cn: {
        desc: "有效护照"
      },
      passport_jp: {
        desc: "有效日本护照"
      },
      zairyu: {
        desc: "居留卡"
      },
      aadhaar: {
        desc: "唯一身份识别卡",
        name: "Aadhaar 卡"
      },
      voter_id: {
        desc: "选民照片身份卡",
        name: "选民证"
      },
      passport_in: {
        desc: "有效印度护照"
      },
      passport_intl: {
        desc: "您所在国家的有效护照"
      },
      national_id_intl: {
        desc: "政府签发的国民身份证件",
        name: "国民身份证"
      }
    },
    methodName: {
      id_card: "国民身份证",
      passport: "护照",
      drivers_license: "驾驶执照",
      drivers: "驾驶执照",
      biometric: "生物识别居留许可",
      residence: "居留许可",
      foreign_passport: "外国护照",
      national_id: "国民身份证"
    }
  },
  errorBoundary: {
    title: "出了点问题",
    message: "无法加载此页面。请重试。",
    retry: "重新加载页面",
    home: "返回首页"
  }
};

const jaTranslation = {
  disclaimerPage: {
    title: "財務上の免責事項",
    risk: "リスク",
    importantRiskTitle: "重要なリスク警告",
    importantRiskText: "金融市場への投資には重大なリスクが伴い、投資元本の全額を失う可能性があります。過去の実績は将来の結果を保証するものではありません。",
    noAdviceTitle: "助言ではありません",
    noAdviceText: "本サイトの内容および Braxel Markets が提供するサービスは、金融・法律・税務上の助言を構成するものではありません。投資判断を行う前に、各投資家が独立した専門家の助言を求めることを推奨します。",
    limitationTitle: "責任の制限",
    limitationText: "Braxel Markets は、当社の自動化技術の使用または市場の変動に起因する金銭的損失について責任を負いません。",
    capitalAtRiskTitle: "資金のリスク",
    capitalAtRiskText: "当社のサービスを利用する際、お客様の資金はリスクにさらされます。投資額の一部または全部を失う可能性があります。",
    noGuaranteedReturnsTitle: "リターンの保証なし",
    noGuaranteedReturnsText: "当社は、いかなるリターンや利益も保証しません。過去の実績は将来の結果を示すものではありません。",
    pastPerformanceTitle: "過去の実績は指標となりません",
    pastPerformanceText: "表示される過去の実績はあくまで例示目的であり、将来の結果を保証するものではありません。",
    notLicensedTitle: "規制上の地位",
    notLicensedText: "Braxel Markets は現在、[PLACEHOLDER: 管轄区域] において免許を有するまたは規制された金融機関として表明されていません。お住まいの地域に適用される規制上の地位をご確認ください。",
    noCapitalProtectionTitle: "元本保護の保証なし",
    noCapitalProtectionText: "当社は、元本保護や損失に対する保証を一切提供しません。",
    algorithmicRisksTitle: "アルゴリズム/自動取引のリスク",
    algorithmicRisksText: "自動化およびアルゴリズム取引戦略には、システム障害、接続問題、モデルの誤り、予期しない市場状況などのリスクが含まれます（これらに限定されません）。",
    jurisdictionRestrictionsTitle: "管轄区域の制限",
    jurisdictionRestrictionsText: "当社のサービスはすべての管轄区域で提供されるものではありません。ユーザーは、当社プラットフォームを利用する前に、現地の法令を遵守していることを確認する責任を負います。"
  },
  privacyPage: {
    title: "プライバシーポリシー",
    privacy: "プライバシー",
    dataCollectionTitle: "データの収集",
    dataCollectionText: "当社は、サービス提供に必要な情報（氏名、メールアドレス、取引データなど）のみを収集します。お客様のデータは AES-256 暗号化により保護されます。",
    useOfInfoTitle: "情報の利用",
    useOfInfoText: "収集した情報は、お客様のアカウント管理、支払い処理、および週次の運用実績レポートの送信にのみ使用されます。",
    securityTitle: "セキュリティ",
    securityText: "当社は、お客様の個人データへの不正アクセス、改ざん、または破壊を防ぐため、厳格なセキュリティ対策を実施しています。",
    legalBasisTitle: "処理の法的根拠",
    legalBasisText: "お客様の個人データを処理する法的根拠は [PLACEHOLDER: 法的根拠、例：同意、正当な利益、契約上の必要性] です。",
    retentionTitle: "データ保持期間",
    retentionText: "当社は、法律により長期間が求められる場合を除き、お客様の個人データを [PLACEHOLDER: 保存期間] 保持します。",
    thirdPartiesTitle: "第三者および処理者",
    thirdPartiesText: "当社は、お客様のデータを、[PLACEHOLDER: 委託先の一覧、例：決済処理業者、クラウドホスティング、メールサービス] などの信頼できる第三者サービス提供者と、本ポリシーに記載された目的にのみ共有することがあります。",
    userRightsTitle: "お客様の権利",
    userRightsText: "ブラジルの LGPD や EU の GDPR など適用されるデータ保護法の下で、お客様は自身の個人データにアクセスし、訂正し、削除し、移行する権利、ならびに処理に異議を述べるまたは制限する権利を有します。これらの権利を行使するには、[PLACEHOLDER: 権利行使の連絡先] までお問い合わせください。",
    cookiesTitle: "Cookie および類似技術",
    cookiesText: "当社のウェブサイトは、ユーザー体験の向上、トラフィックの分析、コンテンツのパーソナライズのために Cookie および類似技術を使用しています。Cookie の設定はブラウザの設定から管理できます。",
    contactTitle: "お問い合わせとデータ保護責任者",
    contactText: "本プライバシーポリシーまたは当社のデータ取扱いに関するご質問は、[PLACEHOLDER: DPO のメールアドレスまたは連絡先] までお問い合わせください。"
  },
  contactEmail: {
    newSubmission: "新しいお問い合わせフォームの送信",
    name: "お名前",
    email: "メール",
    subject: "件名",
    message: "メッセージ",
    sentFrom: "送信元"
  },
  nav: {
    pricing: "投資プラン",
    howItWorks: "インフラストラクチャ",
    about: "会社概要",
    contact: "機関サポート",
    login: "ターミナルアクセス",
    support: "サポート",
    openAccount: "アカウント作成",
    dashboard: "ダッシュボード",
    logout: "ログアウト",
    selectLanguage: "言語を選択",
    sessionActive: "アクティブセッション",
    accessDashboard: "ダッシュボードへ"
  },
  footer: {
    desc: "機関投資家レベルの投資インフラ。現代の市場のための独自テクノロジー。",
    platform: "プラットフォーム",
    company: "会社",
    support: "デジタルサポート",
    rights: "全著作権所有。",
    privacy: "プライバシー",
    terms: "利用規約",
    disclaimer: "金融免責事項",
    address: "本社所在地",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, スペイン",
    riskTitle: "リスク免責事項",
    riskText: "金融市場での取引には重大な損失リスクが伴い、すべての投資家に適しているわけではありません。過去の実績は将来の結果を保証するものではありません。投資の価値は上下する可能性があります。失っても構わない資金以外は投資しないでください。Braxel Marketsは特定のリターンを保証しません。",
    emailAria: "メール",
    xAria: "X（旧Twitter）"
  },
  auth: {
    loginTitle: "ログイン",
    loginSubtitle: "アクセス認証情報を入力してください。",
    registerTitle: "アカウント作成",
    registerSubtitle: "機関市場での旅を始めましょう。",
    email: "メールアドレス",
    password: "パスワード",
    fullName: "氏名",
    forgotPassword: "パスワードをお忘れですか？",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "既にアクセス権をお持ちですか？",
    btnAccess: "アカウントにアクセス",
    btnCreate: "アカウントを作成",
    termsAgree: "利用規約とプライバシーポリシーに同意します。",
    futureTitle: "投資の",
    futureSubtitle: "未来",
    features: [
      "機関投資家レベルのアルゴリズム",
      "高度な資本保護",
      "ミリ秒単位の約定",
      "完全な透明性"
    ],
    accessBadge: "機関アクセス",
    emailPlaceholder: "メールアドレスを入力",
    fullNamePlaceholder: "氏名を入力",
    loginLink: "ログイン",
    loginSideDescription: "機関ターミナルにアクセス。",
    loginSideFooter: "機関レベルのセキュリティ",
    loginErrorMessage: "認証情報が無効です。再試行してください。",
    registerErrorMessage: "登録に失敗しました。再試行してください。",
    registerSuccessMessage: "アカウントが正常に作成されました！",
    registerSideFooter: "機関レベルのセキュリティで保護",
    welcomeBackTitle: "おかえりなさい",
    welcomeBackHighlight: "機関ターミナル",
    accountNotFound: "アカウントが見つかりません。まずアカウントを作成してください。",
    rememberMe: "ログイン状態を保持",
    registerLink: "アカウント作成",
    passwordPlaceholder: "パスワード",
    accountNotFoundError: "アカウントが見つかりません。先にアカウントを作成してください。",
    resetPasswordSent: "そのメールアドレスのアカウントが存在する場合、パスワード再設定リンクを送信しました。",
    resetPasswordError: "再設定リンクを送信できませんでした。もう一度お試しください。",
    enterEmailFirst: "先にメールアドレスを入力してください。"
  },
  hero: {
    title1: "エリートアルゴリズム",
    title2: "資本運用",
    desc: "現代の市場向けに設計された機関投資家レベルの定量戦略を展開。ミリ秒単位の約定精度と高度なリスク軽減プロトコルを体験してください。",
    getStarted: "投資プランを見る",
    viewStrategies: "技術的方法論"
  },
  stats: {
    volume: "戦略的資本管理",
    traders: "アクティブアカウント",
    uptime: "インフラ稼働率",
    latency: "約定精度"
  },
  methodology: {
    badge: "方法論",
    title: "定量モデル",
    statArb: {
      title: "統計的裁定取引",
      desc: "共和分モデルとペアトレーディングを用いた相関資産間の一時的な価格非効率性の活用。",
      f1: "共和分分析",
      f2: "ペア選択アルゴリズム",
      f3: "Zスコア閾値"
    },
    meanRev: {
      title: "平均回帰",
      desc: "過去の平均値からの資産価格偏差の特定と、体系的なエントリー・エグジットルール。",
      f1: "ボリンジャーバンドシグナル",
      f2: "RSIダイバージェンス検出",
      f3: "Ornstein-Uhlenbeckモデル"
    },
    hft: {
      title: "高頻度取引",
      desc: "コロケーションインフラを活用したマイクロ秒レベルの注文発注のための超低遅延執行戦略。",
      f1: "市場マイクロストラクチャー",
      f2: "注文フロー分析",
      f3: "レイテンシーアービトラージ"
    }
  },
  transparency: {
    badge: "インフラストラクチャ",
    title: "透明なテクノロジー",
    desc: "当社のインフラはエンタープライズグレードの基盤上に構築され、信頼性、速度、セキュリティを確保しています。",
    connectivity: {
      title: "接続性",
      desc: "Equinixデータセンター（NY5、LD4、TY3）を介した直接市場アクセスと、主要取引所への低遅延接続（未検証）。"
    },
    cloud: {
      title: "クラウド実行",
      desc: "AWS（us-east-1、eu-west-1）およびAzure上の冗長実行エンジンによるフェイルオーバー耐性（未検証）。"
    },
    security: {
      title: "セキュリティ",
      desc: "エンドツーエンド暗号化、SOC 2 Type II準拠、およびすべての操作における多層認証（未検証）。"
    },
    warning: "市場は変動します。リターンは決して保証されず、堅牢な保護措置があっても損失が生じる可能性があります。",
    protocolTitle: "機関利用向けに設計されたプロトコル",
    protocolDesc: "当社のインフラは厳格なコンプライアンスとリスク管理基準に従い、運用上の安全性を目指します（保証ではありません）。"
  },
  process_home: {
    badge: "プロセス",
    title: "機関投資家",
    subtitle: "ワークフロー",
    step1: {
      title: "登録",
      desc: "安全なオンボーディングと本人確認。"
    },
    step2: {
      title: "配分",
      desc: "運用資本レベルの選択。"
    },
    step3: {
      title: "統合",
      desc: "アルゴリズムインフラの展開。"
    },
    step4: {
      title: "監視",
      desc: "ターミナルによるリアルタイムパフォーマンス追跡。"
    },
    step5: {
      title: "流動性",
      desc: "簡素化された利益引出プロトコル。"
    }
  },
  cta_home: {
    badge: "機会",
    title: "資本を",
    subtitle: "資本",
    desc: "Braxelの独自インフラを活用するエリート投資家グループに参加しましょう。",
    btn: "配分を開始",
    trust: "機関投資家レベルのセキュリティ"
  },
  pricing: {
    badge: "透明性",
    title: "資本",
    subtitle: "配分",
    desc: "透明な手数料体系の機関投資家レベルインフラ。",
    select: "このプランを確保",
    allocation: "運用資本",
    month: "月額料金",
    detectedCurrency: "すべての価格はお客様の所在地に関わらず USD ({{currency}}) で請求されます",
    managedCapitalUsdNote: "運用資本（Capital Gerenciado）は常にUSDで表示されます。"
  },
  plans: {
    starter: "スターター",
    starterFeatures: "スタータープランの機能",
    managedCapital: "運用資本",
    features: {
      automation: "自動化",
      accountManagement: "口座管理",
      emailSupport: "メールサポート",
      controlledRisk: "リスク管理",
      starterFeatures: "スタータープランの機能",
      prioritySupport: "優先サポート",
      detailedLogs: "詳細ログ",
      proFeatures: "Pro 機能",
      multiAccount: "マルチアカウント",
      weeklyReports: "週次レポート",
      advancedFeatures: "高度な機能",
      support247: "24/7サポート",
      dedicatedManager: "専任マネージャー"
    },
    professional: "プロフェッショナル",
    professionalFeatures: "プロフェッショナルプランの機能",
    business: "ビジネス",
    businessFeatures: "ビジネスプランの機能",
    enterprise: "エンタープライズ",
    enterpriseFeatures: "エンタープライズプランの機能"
  },
  howItWorks: {
    badge: "インフラストラクチャ",
    title: "技術",
    subtitle: "アーキテクチャ",
    desc: "当社の独自エコシステムは、速度、セキュリティ、安定したパフォーマンスのために構築されています。",
    steps: [
      {
        title: "登録",
        desc: "機関プロファイルを作成。"
      },
      {
        title: "ダッシュボード",
        desc: "プライベート管理ターミナルにアクセス。"
      },
      {
        title: "プラン選択",
        desc: "資本配分レベルを選択。"
      },
      {
        title: "API展開",
        desc: "グローバル市場への自動接続。"
      },
      {
        title: "実行",
        desc: "ミリ秒単位の注文処理。"
      },
      {
        title: "レポート",
        desc: "詳細な週次パフォーマンス分析。"
      }
    ],
    cta: "始める準備はできましたか？",
    ctaBtn: "ネットワークに参加"
  },
  about: {
    badge: "会社概要",
    title: "機関投資家レベル",
    subtitle: "エクセレンス",
    desc: "Braxel Marketsはアルゴリズム資本管理の頂点を代表します。",
    historyTitle: "沿革",
    historyDesc1: "定量アナリストとソフトウェアエンジニアのチームによって設立されたBraxelは、リテール資本と機関テクノロジーの間のギャップを埋めるために作られました。",
    historyDesc2: "今日、私たちはリスク調整後リターンとインフラの安定性に焦点を当て、現代の投資家のために最先端のアルゴリズム戦略を提供しています。",
    stats: {
      founded: "設立",
      users: "アクティブユーザー",
      uptime: "稼働率",
      support: "サポート"
    },
    values: {
      mission: "ミッション",
      missionDesc: "グローバル資本のためのエリートアルゴリズムインフラを提供する。",
      vision: "ビジョン",
      visionDesc: "自動化された定量管理の未来を定義する。",
      values: "価値観",
      valuesDesc: "透明性、精度、揺るぎないセキュリティ。"
    },
    teamTitle: "リーダーシップチーム",
    teamDesc: "Braxel Marketsの創業者と経営陣をご紹介します。",
    team: [
      {
        name: "Bernardo Campi",
        role: "創業者兼CEO",
        bio: "機関投資家レベルのアルゴリズムインフラに向けたBraxel Marketsのビジョンを率いる定量ストラテジスト兼起業家。",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "リーダーシップ"
  },
  contact: {
    badge: "サポート",
    title: "機関投資家",
    subtitle: "チャネル",
    desc: "当社の専門サポートチームは、機関投資家のお問い合わせに24時間年中不休で対応しています。",
    infoTitle: "お問い合わせ",
    formTitle: "直接お問い合わせ",
    placeholders: {
      name: "氏名",
      email: "メールアドレス",
      subject: "件名",
      message: "メッセージ"
    },
    sendBtn: "お問い合わせを送信",
    supportHours: "サポート時間",
    institutionalSupport: "24/7機関投資家サポート",
    securityChallenge: "セキュリティチャレンジ",
    securityAnswer: "回答",
    incorrectAnswer: "セキュリティの回答が正しくありません。もう一度お試しください。",
    waitMessage: "次のメッセージを送信するまでしばらくお待ちください。",
    messageSent: "メッセージが正常に送信されました！まもなくチームよりご連絡いたします。",
    messageFailed: "メッセージの送信に失敗しました。もう一度お試しいただくか、marketsbraxel@ouvidor.netまで直接メールをお送りください。",
    cooldown: "お待ちください",
    consentPre: "このフォームを送信すると、以下に同意したことになります：",
    consentPost: "お客様のデータはお問い合わせへの回答にのみ使用します。",
    emailLabel: "メール"
  },
  dashboard: {
    portfolio: "ポートフォリオ",
    activeServices: "アクティブサービス",
    newAllocation: "新規配分",
    noServices: "アクティブな投資プランが見つかりません。",
    balance: "現在の残高",
    withdraw: "出金",
    liquidity: "流動性",
    requestWithdraw: "出金を申請",
    selectAccount: "アカウントを選択",
    amount: "金額 (USD)",
    iban: "IBAN / 銀行情報",
    btnWithdraw: "出金申請を送信",
    profile: "プロフィール管理",
    settings: "設定",
    firstName: "名",
    lastName: "姓",
    saveChanges: "変更を保存",
    verifiedAccount: "認証済みアカウント",
    accountStandard: "スタンダードアカウント",
    withdrawal: {
      gateTitle: "本人確認が必要です",
      gateWhy: "お客様の資金を保護し規制を遵守するため、出金申請の前に本人確認（KYC）が必要です。未確認でも取引は自由に行えます。",
      gateRejectedDesc: "前回の提出は受理されませんでした。下記の理由を確認し、書類を再提出してください。",
      gateUnderReview: "書類を審査中です。決定次第メールでお知らせします。それまで出金は申請できません。",
      kycStatusLabel: "確認状況",
      statusPending: "未提出",
      statusSubmitted: "審査中",
      statusApproved: "承認済み",
      statusRejected: "却下",
      rejectedReason: "理由",
      continueToForm: "出金へ進む",
      submitDocs: "書類を提出",
      resubmit: "書類を再提出",
      uploadFront: "本人確認書類（表面）",
      uploadBack: "本人確認書類（裏面）",
      uploadSelfie: "書類を持つ自撮り",
      chooseFile: "ファイルを選択",
      fileHint: "JPG、PNG、PDF、最大10MB",
      selfieHint: "書類を持つ顔がはっきり写った写真",
      optional: "任意",
      frontRequired: "本人確認書類の表面を添付してください。",
      fileTooLarge: "ファイルが10MBを超えています。",
      uploadError: "書類を送信できませんでした。もう一度お試しください。",
      documentsSubmitted: "書類を提出しました。まもなく審査します。",
    },
    totalAUM: "運用資産総額",
    activeAlgos: "アクティブアルゴリズム",
    systemStatus: "システム状態",
    operational: "稼働中",
    infraProtection: "インフラ保護",
    twoFactor: "二要素認証",
    notEnabled: "未有効",
    enable2FA: "2FAを有効化",
    kycStatus: "KYC認証",
    verified: "認証済み",
    viewDocs: "書類を表示",
    investor: "投資家",
    kycRequired: "KYC認証が必要です",
    kycRequiredDesc: "プラットフォームの全機能にアクセスするには、本人確認を完了してください。これは資本を管理するすべてのアカウントに義務付けられています。",
    kycUnderReview: "KYC 審査中",
    kycUnderReviewDesc: "書類はコンプライアンスチームによって審査中です。通常24〜48時間かかります。",
    kycRejected: "KYC認証が拒否されました",
    kycRejectedDesc: "書類は承認されませんでした。有効な書類を再度ご提出ください。",
    resubmitDocs: "書類を再提出",
    completeVerification: "認証を完了",
    verificationRequired: "認証が必要",
    goToVerification: "認証へ進む",
    totalProfit: "総利益",
    drawdown: "ドローダウン",
    maxDrawdown: "最大ドローダウン",
    assetsInOperation: "稼働中の資産",
    monthlyReturns: "月次リターン",
    analytics: "分析",
    newWithdrawalRequest: "新しい出金リクエスト",
    walletIban: "ウォレット / IBAN",
    network: {
      erc20: "ERC-20（イーサリアム）",
      trc20: "TRC-20（トロン）",
      bep20: "BEP-20（BSC）",
      bankSwift: "銀行振込（SWIFT）"
    },
    transactionHistory: "取引履歴",
    operations: "オペレーション",
    asset: "資産",
    type: "タイプ",
    entry: "エントリー",
    exit: "イグジット",
    profit: "利益",
    time: "時間",
    status: "ステータス",
    open: "オープン",
    closed: "クローズ",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "暗号資産ウォレットアドレスまたは IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "6桁のコードを入力",
    minPasswordPlaceholder: "8文字以上",
    confirmPasswordPlaceholder: "新しいパスワードを再入力",
    accountNotFound: "アカウントが見つかりません。まずアカウントを作成してください。",
    loginSuccess: "ログイン成功！",
    rememberMe: "ログイン情報を保存",
    navPerformance: "パフォーマンス",
    navAuditLog: "監査ログ",
    tabProfile: "プロフィール",
    tabKycVerification: "KYC認証",
    tabSecurity: "セキュリティ",
    kycCompleteDesc: "プラットフォームの全機能にアクセスするにはKYC認証を完了してください。これはすべてのアカウントに対する必須のコンプライアンス要件です。",
    kyc: {
      approved: "認証承認済み",
      underReview: "書類審査中",
      rejected: "認証却下",
      required: "認証が必要",
      descApproved: "本人確認が完了しました。すべての機能が利用可能です。",
      descSubmitted: "コンプライアンスチームが書類を確認中です。通常24〜48時間かかります。",
      descRejected: "書類が受理されませんでした。有効な書類で再提出してください。",
      descRequired: "すべてのプラットフォーム機能を利用するには本人確認を完了してください。",
      stepCountry: "国",
      stepMethod: "方法",
      stepDocument: "書類",
      stepReview: "確認",
      selectCountry: "国を選択",
      selectCountryDesc: "身分証明書を発行した国を選択してください。",
      selectCountryPlaceholder: "国を選択...",
      selectMethod: "認証方法を選択",
      selectMethodDesc: "{{country}} の本人確認方法を選択してください。",
      uploadDocument: "書類をアップロード",
      uploadDocumentDesc: "以下のオプションから有効な書類を1つ選択してアップロードしてください。",
      clickToUpload: "クリックしてアップロードまたはドラッグ＆ドロップ",
      submitting: "送信中...",
      submitForVerification: "認証に提出",
      progressTitle: "認証の進捗",
      stepEmailVerification: "メール認証",
      stepIdentityDocument: "身分証明書",
      stepComplianceReview: "コンプライアンス審査",
      stepAccountActivation: "アカウント有効化",
      statusInProgress: "進行中",
      statusComplete: "完了",
      statusPending: "保留中",
      changePassword: "パスワード変更",
      updateCredentials: "認証情報を更新",
      newPassword: "新しいパスワード",
      confirmNewPassword: "新しいパスワードを確認",
      emailVerification: "メール認証",
      verified: "認証済み",
      verifiedEmail: "認証済みメール",
      securityActivityLog: "セキュリティアクティビティログ",
      scanAuthenticator: "認証アプリでスキャン",
      eventLoginNewDevice: "新しいデバイスからのログイン",
      eventPasswordChanged: "パスワード変更",
      eventAccountCreated: "アカウント作成",
      timeHoursAgo: "{{count}}時間前",
      timeDaysAgo: "{{count}}日前"
    },
    newEmailLabel: "新しいメールアドレス",
    sendConfirmationLink: "確認リンクを送信",
    identityVerified: "本人確認が完了しました。すべての機能が利用可能になりました。",
    verificationRejected: "本人確認が拒否されました。書類を再提出してください。",
    profileUpdated: "プロフィールを更新しました。",
    failedUpdateProfile: "プロフィールの更新に失敗しました。",
    differentEmail: "別のメールアドレスを入力してください。",
    confirmationLinkSent: "確認リンクを新しいメールアドレスに送信しました。変更を完了するには確認してください。",
    failedEmail: "メールの更新に失敗しました。",
    passwordsDoNotMatch: "パスワードが一致しません。",
    passwordTooShort: "パスワードは8文字以上である必要があります。",
    passwordChanged: "パスワードを変更しました。",
    failedPassword: "パスワードの変更に失敗しました。",
    uploadDocument: "書類をアップロードしてください。",
    completeSteps: "すべての確認手順を完了してください。",
    documentsSubmitted: "書類を確認のために送信しました。審査完了後に通知されます。",
    failedDocuments: "書類の送信に失敗しました。",
    performanceTitle: "パフォーマンスダッシュボード",
    auditLogTitle: "監査ログ",
    auditLogDesc: "お客様のアカウントで実行されたすべてのアルゴリズム注文。",
    accountSettingsTitle: "アカウント設定",
    personalInformation: "個人情報",
    emailAddress: "メールアドレス",
    emailChangeNotice: "メールアドレスの変更には確認が必要です。確認リンクが新しいメールアドレスに送信されます。",
    currentEmail: "現在のメールアドレス",
    confirmationSent: "確認を送信しました",
    tryDifferentEmail: "別のメールアドレスを試す",
    continueToMethod: "方式の選択へ進む",
    uploadHint: "PNG、JPG、PDF（最大10MB）",
    twoFactorDesc: "アカウントにセキュリティを追加します。Google Authenticator や Authy などの認証アプリを使用してください。",
    qrCode: "QRコード",
    kycRequiredBanner: "KYC が必要です",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "ネットワーク",
    emailChangeInboxNotice: "受信トレイを確認し、リンクをクリックしてメールアドレスの変更を完了してください。",
    emailChangeSentTo: "確認リンクを {{email}} に送信しました。受信トレイを確認し、リンクをクリックしてメールアドレスの変更を完了してください。",
    growthPerformanceMtd: "成長パフォーマンス（月初来）"
  },
  checkout: {
    summary: "概要",
    allocationTitle: "機関",
    allocationSubtitle: "配分",
    tierLabel: "アルゴリズムインフラレベル",
    billedMonthly: "月次請求",
    detailsTitle: "配分詳細",
    managedCapital: "運用資本",
    setupFee: "セットアップ料",
    waived: "免除",
    latency: "約定遅延",
    infrastructureTitle: "含まれるインフラ",
    realTimeMonitoring: "リアルタイム監視",
    activeUponDeployment: "展開後にアクティブ",
    totalDue: "合計支払額",
    dedicatedNode: "専用ノード",
    globalMarkets: "グローバル市場",
    instantSetup: "即時セットアップ",
    authRequired: "認証が必要です",
    authDesc: "配分を進めるにはログインまたはアカウント作成が必要です。",
    btnLogin: "ログインして続行",
    btnRegister: "アカウント作成",
    confirmDeployment: "展開を確認",
    deploymentDesc: "確認することで、{{plan}}プランに関連するアルゴリズムインフラの展開を承認します。",
    proceedPayment: "安全な支払いに進む",
    secureGateway: "セキュアゲートウェイ",
    back: "戻る",
    riskDisclosure: "リスク開示：アルゴリズム取引には重大な損失リスクが伴います。過去の実績は将来の結果を保証しません。",
    secureTransaction: "安全な取引",
    paypalNote: "お支払い情報はPayPalにより安全に処理されます。Braxel Marketsはカード情報を保存しません。",
    encryptionNote: "AES-256機関グレード暗号化",
    sendExactAmount: "遅延を避けるため、この金額を正確に送金してください",
    verifying: "機関取引を確認中...",
    loading: "ターミナルを読み込み中...",
    globalInfra: "グローバル決済インフラ",
    qrCode: "QRコード",
    allCards: "全カード",
    cryptoNote: "プランを受け取るには正確な金額を送金してください",
    wiseTransfer: "銀行送金",
    bankDetails: "銀行詳細",
    accountHolder: "口座名義",
    accountNumber: "口座番号",
    bankName: "銀行名",
    bankAddress: "銀行住所",
    routingNumber: "ルーティング番号",
    confirmWise: "送金を確認",
    wiseDesc: "Wise経由で当社の銀行口座に直接送金",
    wiseNote: "送金後、下の確認をクリックしてください。確認後（1-3営業日）にアカウントが有効化されます。",
    wiseInternational: "国際送金",
    openWise: "Wiseサイトを開く",
    transferInstructions: "送金手順",
    lowFees: "低手数料",
    noKyc: "KYC必要",
    anyCountry: "任意の国",
    wiseConfirmRequired: "送金を完了したことを確認してください",
    wiseConfirmText: "銀行送金を完了し、送金額がプラン価格と一致することを確認します。",
    wisePaymentSuccess: "支払い確認完了！アカウントをセットアップしています。",
    amountToSend: "送金額",
    paymentReference: "支払いの参考としてメールアドレスを記入してください",
    amountToPay: "支払金額",
    choosePayment: "お支払い方法をお選びください",
    crypto: "暗号通貨",
    selectNetwork: "ネットワークを選択",
    yourAddress: "入金アドレス",
    cryptoLabel: "USDT、BTC、ETH",
    cryptoDesc: "高速で安全な暗号通貨送金",
    cryptoPending: "支払いを記録しました！確認待ちです。",
    confirmCrypto: "暗号通貨で確認",
    important: "重要",
    securePayment: "安全な決済",
    paymentSuccess: "支払いが承認されました！",
    paymentFailed: "支払い失敗",
    paymentError: "支払いエラー",
    processing: "処理中...",
    copied: "コピーしました！",
    fillAllFields: "全ての項目を入力してください",
    selectPaymentMethod: "支払い方法を選択",
    creditCard: "クレジットカード",
    instantPayment: "即時支払い",
    cardDesc: "Visa、Mastercard など",
    wiseStep1: "以下の銀行情報をコピーしてください",
    wiseStep2: "銀行またはWiseアカウントから送金します",
    wiseStep3: "送金後に確認をクリックしてください",
    cardNumber: "カード番号",
    cardName: "カード名義",
    cardExpiry: "有効期限",
    payNow: "今すぐ支払う",
    yourAddressPlaceholder: "USDTアドレスを入力",
    selectCountry: "国を選択",
    searchCountry: "国を検索...",
    phone: "電話番号",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "JOAO SILVA",
    cardExpiryPlaceholder: "MM/YY",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    subscriptionTitle: "サブスクリプション",
    subscriptionSubtitle: "サービスプラン",
    serviceAccess: "サービスアクセス",
    confirmCard: "カードを確認",
    redirecting: "支払いページへリダイレクト中...",
    card: "クレジット / デビットカード",
    testModeBanner: "テストモード — 実際の資金・銀行・ウォレット・有効化はありません。",
    startFailed: "支払いを開始できませんでした。もう一度お試しください。",
    notConfigured: "支払い機能はまだ完全に設定されていません。別の方法を試すか、サポートにお問い合わせください。",
    invalidPlanTitle: "無効なプラン",
    invalidPlanDesc: "選択したプランは利用できなくなりました。もう一度プランを選択してください。",
    swiftLabel: "SWIFT",
    referenceLabel: "参照",
  },
  legal: {
    badgeLegal: "法的情報",
    termsTitle: "利用規約"
  },
  faq: {
    title: "よくあるご質問",
    badge: "よくある質問",
    q1: "事前経験は必要ですか？",
    a1: "いいえ。当社のインフラは完全に自動化されています。配分レベルを選択し、ターミナルでパフォーマンスを監視するだけです。",
    q2: "どのようなリスクがありますか？",
    a2: "金融市場全般と同様、ボラティリティによる資本損失のリスクがあります。当社は資本保護のための高度な緩和プロトコルを使用しています。",
    q3: "システムはどのように機能しますか？",
    a3: "当社の独自アルゴリズムは、ミリ秒の精度でグローバル市場において高頻度定量戦略を実行します。",
    q4: "プランをキャンセルできますか？",
    a4: "はい。ダッシュボードのプロトコルを通じて、いつでもキャンセルと資本引出を申請できます。"
  },
  diffs: {
    title: "なぜBRAXEL MARKETSか？",
    badge: "差別化要因",
    t1: "独自テクノロジー",
    d1: "機関投資家レベルの約定のために設計されたニューラルネットワーク。",
    t2: "完全自動化",
    d2: "人間の感情バイアスのない24時間365日のアルゴリズム管理。",
    t3: "簡素化されたアクセス",
    d3: "直感的なターミナルを通じてアクセスする機関インフラ。",
    t4: "プロフェッショナルグレード",
    d4: "超低遅延でグローバル流動性プールに直接接続。"
  },
  signals: {
    title: "リアルタイム",
    subtitle: "アルゴリズム実行",
    badge: "リアルタイムターミナル",
    desc: "当社の独自インフラをリアルタイムで監視。すべてのシグナルはニューラルネットワークによりミリ秒の精度で処理されます。",
    asset: "資産",
    type: "タイプ",
    entry: "エントリー",
    profit: "利益",
    status: "ステータス",
    active: "アクティブ",
    completed: "完了",
    institutionalVerification: "機関検証",
    realtimeFeed: "グローバルな流動性プールからのリアルタイムデータフィード。",
    liveTerminal: "ライブターミナル",
    connected: "接続済み"
  },
  chatbot: {
    title: "Braxel サポート",
    placeholder: "メッセージを入力…",
    emailSupport: "メール：",
    assistantReply: "メッセージありがとうございます。担当チームがまもなく返信いたします。",
    send: "送信",
    brandAI: "Braxel Markets AI",
    openChat: "サポートチャットを開く",
    close: "閉じる",
    minimize: "最小化",
    maximize: "最大化",
    supportDialog: "サポートチャット"
  },
  application: {
    title: "申込",
    subtitle: "提出",
    plan_selected: "選択中のプラン",
    billed_monthly: "月額請求",
    plan_description: "{{plan}}サービスのサブスクリプションをご購入しようとしています。",
    plan_price_detail: "月額料金：{{price}}（毎月支払い）",
    full_name: "氏名",
    full_name_placeholder: "氏名を入力してください",
    email: "メールアドレス",
    email_placeholder: "メールアドレスを入力してください",
    address_line1: "住所 — 1行目",
    address_line1_placeholder: "番地と通り",
    address_line2: "住所追加情報",
    address_line2_placeholder: "部屋番号・階・建物など（任意）",
    city: "市区町村",
    city_placeholder: "市区町村",
    region: "都道府県 / 地域",
    region_placeholder: "都道府県または地域",
    postal_code: "郵便番号",
    postal_code_placeholder: "郵便番号",
    country: "国",
    country_placeholder: "国",
    phone: "電話番号",
    phone_placeholder: "電話番号",
    terms_accepted: "利用規約に同意します",
    privacy_accepted: "プライバシーポリシーに同意します",
    viewTerms: "利用規約を見る",
    viewPrivacy: "プライバシーポリシーを見る",
    customer_note: "お客様メモ（任意）",
    customer_note_placeholder: "当社に知らせたいその他の情報",
    note_limit: "最大{{count}}文字",
    characters: "文字",
    submitting: "送信中...",
    submit: "申込を送信",
    errors: {
      full_name_required: "氏名は必須です",
      email_required: "メールアドレスは必須です",
      email_invalid: "メールアドレスが無効です",
      address_line1_required: "住所は必須です",
      city_required: "市区町村は必須です",
      country_required: "国は必須です",
      terms_required: "利用規約に同意する必要があります",
      privacy_required: "プライバシーポリシーに同意する必要があります",
      note_too_long: "メモは最大500文字です",
      submit_failed: "送信に失敗しました。もう一度お試しください。"
    }
  },
  checkoutSuccess: {
    verifying: "お支払いを確認中…",
    backToPricing: "プランに戻る",
    couldNotVerify: "お支払いをまだ確認できません",
    couldNotVerifyDesc: "チェックアウトを完了された場合はご安心ください。お支払いは処理中であり、アカウントはまもなく有効化されます。このページを少ししてから更新してください。",
    verifiedBadge: "確認済み",
    paymentCompleted: "支払い完了",
    activationNotice: "アカウントは数分以内に有効化されます。",
    paymentId: "支払いID",
    applicationId: "申込ID",
    securityNotice: "安全のため、アカウントは支払い確認後に担当者が手動で有効化します。審査が完了次第、アクセスが付与されます。",
    goToDashboard: "ダッシュボードへ",
    contactSupport: "サポートに連絡",
    verifyingBadge: "確認中",
    paymentReceived: "支払いを受け取りました。確認しています。",
    beingVerified: "お支払いを確認中です。支払いが確認されると、このページは自動的に更新されます。このウィンドウを閉じないでください。",
    currentStatus: "現在のステータス",
    urlSecurityNotice: "安全のため、このページはURLだけで支払いを完了と判断しません。サーバー側の確認を待ちます。"
  },
  termsPage: {
    title: "利用規約",
    entityTitle: "契約主体",
    entityText: "[法人名、登録番号、管轄区域]",
    descriptionTitle: "サービスの説明",
    descriptionText: "Braxel Markets は、そのプラットフォームを通じて機関投資家水準のアルゴリズム取引インフラと関連サービスを提供します。",
    feesTitle: "手数料と支払い",
    feesText: "当社サービスの手数料は料金ページに記載されており、事前の通知により変更される場合があります。支払い方法には銀行振込、クレジットカード、暗号資産が含まれます。",
    eligibilityTitle: "利用資格",
    eligibilityText: "当社のサービスは、18 歳以上で、当社の本人確認（KYC）およびマネーロンダリング対策（AML）要件を満たす個人および法人がご利用いただけます。",
    accountTerminationTitle: "アカウントの解約",
    accountTerminationText: "いずれの当事者も、[PLACEHOLDER: 通知期間、例：30 日] の書面による通知をもってアカウントを解約できます。Braxel Markets は、規約違反、違法行為、または規制上の要件がある場合、直ちに解約することがあります。",
    limitationOfLiabilityTitle: "責任の制限",
    limitationOfLiabilityText: "法律で認められる最大限の範囲において、Braxel Markets は、当社サービスへのアクセスまたは利用に起因する間接的、偶発的、特別、結果的、または懲罰的損害、ならびにデータ、使用、のれん、その他の無形の損失について一切責任を負いません。",
    disputeResolutionTitle: "紛争解決および準拠法",
    disputeResolutionText: "本規約は [PLACEHOLDER: 管轄区域] の法律に準拠し、これに従って解釈されます。本規約に起因または関連して生じる紛争は、[PLACEHOLDER: 管轄区域] の裁判所の専属管轄に服します。",
    changesToTermsTitle: "本規約の変更",
    changesToTermsText: "当社は、いつでも本規約を変更または代替する権利を留保します。重要な改定の場合、新しい規約の発効前に少なくとも [PLACEHOLDER: 通知期間、例：30 日] の通知を行います。重要な変更に該当するか否かは、当社の単独の裁量により判断されます。",
    effectiveDateTitle: "発効日",
    effectiveDateText: "発効日：[PLACEHOLDER: 日付]",
    contactTitle: "お問い合わせ",
    contactText: "本規約に関するご質問は、[PLACEHOLDER: 連絡先メールアドレスまたは住所] までお問い合わせください。"
  },
  legalDraftBanner: "このページは法的審査中の草案であり、まだ最終版ではありません。",
  notFound: {
    title: "404",
    message: "申し訳ありません。お探しのページは存在しません。",
    returnHome: "ホームに戻る"
  },
  authCallback: {
    confirmingTitle: "アカウントを確認しています...",
    confirmingDesc: "メールアドレスを確認していますのでお待ちください。",
    confirmedTitle: "メールアドレスを確認しました！",
    confirmedDesc: "アカウントの確認が完了しました。",
    redirecting: "ログインへリダイレクト中...",
    failedTitle: "確認に失敗しました",
    goToLogin: "ログインへ",
    invalidLink: "確認リンクが無効または期限切れです",
    failedConfirm: "メールの確認に失敗しました"
  },
  paymentsDisabled: {
    title: "現在、支払い機能は無効になっています。",
    desc: "決済システムはまだ有効になっていません。支払いを有効にするには、運営者までお問い合わせください：",
    managedBy: "支払い処理はプラットフォーム運営者のみが管理しています。保留中の割り当てについてご質問がある場合は、サポートにお問い合わせください。",
    viewPlans: "投資プランを見る"
  },
  checkoutStatus: {
    created: "作成済み",
    pending: "支払い待ち",
    processing: "オンチェーン確認中",
    confirmed: "確認済み",
    failed: "失敗",
    rejected: "拒否",
    refunded: "返金済み",
    disputed: "係争中",
    canceled: "キャンセル済み",
    pending_manual: "手動レビュー待ち"
  },
  legalReview: {
    title: "法務レビュー中のドラフト"
  },
  operator: {
    title: "オペレーター",
    subtitle: "ダッシュボード",
    description: "保留中の顧客申請を確認して有効化します。",
    no_pending_applications: "保留中の申請はありません。",
    plan: "プラン",
    amount: "金額",
    country: "国",
    customer_note: "顧客メモ",
    activate_account: "アカウントを有効化",
    activating: "有効化中...",
    reject_or_request_info: "拒否 / 情報を要求",
    rejecting: "拒否中...",
    reject_application: "申請を拒否",
    reject_reason_prompt: "拒否理由または必要な情報を入力してください。",
    reject_reason_placeholder: "理由...",
    cancel: "キャンセル",
    reject: "拒否",
    errors: {
      activation_failed: "申請の有効化に失敗しました。",
      rejection_failed: "申請の拒否に失敗しました。"
    },
    status: {
      activation_pending: "有効化待ち",
      account_active: "アカウント有効",
      rejected: "拒否",
      manual_review: "手動レビュー"
    }
  },
  profitCalculator: {
    badge: "予測",
    titleA: "利益",
    titleB: "計算機",
    initialAllocation: "初期配分",
    monthlyProfit: "月間利益（予想）",
    annualProfit: "年間利益（予想）",
    riskTitle: "リスク管理",
    riskDesc: "厳格なドローダウン制限を伴う過去のアルゴリズム実績に基づく予測です。",
    instantTitle: "即時展開",
    instantDesc: "インフラ統合後、数分以内に資金が運用を開始します。",
    disclaimer: "* 免責事項：過去の実績は将来の結果を保証するものではありません。予測はあくまで例示目的です。"
  },
  meta: {
    home: {
      title: "Braxel Markets | 機関投資家向けアルゴリズム資本運用",
      description: "機関投資家水準のアルゴリズム取引インフラ、プロップファーム資金へのアクセス、CopyTrade 認証、XAU/USD と US500 の完全な MetaTrader 自動化。"
    },
    pricing: {
      title: "プランと運用資金 | Braxel Markets",
      description: "アルゴリズム取引プランと運用資金の配分を比較。運用資金は常に米ドルで表示されます。"
    },
    about: {
      title: "Braxel Markets について | アルゴリズム取引",
      description: "Braxel Markets は機関投資家水準のアルゴリズム取引インフラを構築し、厳格なリスク管理のもとで資金を運用します。"
    },
    howItWorks: {
      title: "仕組み | Braxel Markets",
      description: "Braxel Markets がお客様の資金を XAU/USD と US500 の完全自動 MetaTrader 戦略に接続する仕組みをご覧ください。"
    },
    contact: {
      title: "お問い合わせ | Braxel Markets",
      description: "アルゴリズム取引インフラと運用資金について、Braxel Markets チームにお問い合わせください。"
    },
    terms: {
      title: "利用規約 | Braxel Markets",
      description: "Braxel Markets の利用規約をご覧ください。"
    },
    privacy: {
      title: "プライバシーポリシー | Braxel Markets",
      description: "Braxel Markets がお客様の個人データをどのように収集・利用・保護するかをご覧ください。"
    },
    disclaimer: {
      title: "リスク開示 | Braxel Markets",
      description: "Braxel Markets でのアルゴリズム取引および運用資金に関する重要なリスク開示。"
    }
  },
  kyc: {
    country: {
      BR: "ブラジル",
      US: "アメリカ合衆国",
      GB: "イギリス",
      DE: "ドイツ",
      FR: "フランス",
      ES: "スペイン",
      IT: "イタリア",
      PT: "ポルトガル",
      RU: "ロシア",
      CN: "中国",
      JP: "日本",
      IN: "インド",
      OTHER: "その他の国"
    },
    method: {
      BR: {
        id_card: "国民IDカード（RG/CPF）",
        drivers_license: "運転免許証"
      },
      US: {
        id_card: "州発行IDカード"
      },
      GB: {
        id_card: "国民ID / 運転免許証",
        biometric: "生体認証在留許可"
      },
      DE: {
        drivers: "運転免許証",
        passport: "パスポート / Reisepass"
      },
      FR: {
        residence: "在留許可"
      },
      RU: {
        foreign_passport: "外国パスポート"
      },
      OTHER: {
        passport: "国際パスポート",
        national_id: "国民IDカード"
      }
    },
    doc: {
      rg: {
        desc: "ブラジルの国民身分証明書"
      },
      cpf: {
        desc: "ブラジルの納税者登録カード"
      },
      passport: {
        desc: "写真ページ付きの有効なパスポート",
        name: "パスポート"
      },
      cnh: {
        desc: "ブラジルの運転免許証",
        name: "CNH（運転免許証）"
      },
      state_id: {
        desc: "運転免許証または州発行のID",
        name: "州発行IDカード"
      },
      passport_uk: {
        desc: "有効な英国パスポート"
      },
      driving_license_uk: {
        desc: "英国の運転免許証",
        name: "運転免許証"
      },
      brp: {
        desc: "英国の生体認証在留許可",
        name: "生体認証在留許可"
      },
      personalausweis: {
        desc: "ドイツの身分証明書"
      },
      passport_de: {
        desc: "有効なドイツのパスポート"
      },
      fuehrerschein: {
        desc: "ドイツの運転免許証"
      },
      cni: {
        desc: "フランスの国民身分証明書"
      },
      passport_fr: {
        desc: "有効なフランスのパスポート"
      },
      titre_sejour: {
        desc: "フランスの在留許可"
      },
      dni: {
        desc: "スペインの国民身分証明書"
      },
      nie: {
        desc: "外国人識別番号"
      },
      passport_es: {
        desc: "有効なパスポート"
      },
      carta_id: {
        desc: "イタリアの身分証明書"
      },
      passport_it: {
        desc: "有効なイタリアのパスポート"
      },
      cc: {
        desc: "ポルトガルの市民カード"
      },
      passport_pt: {
        desc: "有効なポルトガルのパスポート"
      },
      passport_ru: {
        desc: "ロシアの国内パスポート"
      },
      foreign_passport_ru: {
        desc: "ロシアの外国パスポート",
        name: "外国パスポート"
      },
      id_card_cn: {
        desc: "中国の身分証明書"
      },
      passport_cn: {
        desc: "有効なパスポート"
      },
      passport_jp: {
        desc: "有効な日本のパスポート"
      },
      zairyu: {
        desc: "在留カード"
      },
      aadhaar: {
        desc: "固有識別カード",
        name: "Aadhaarカード"
      },
      voter_id: {
        desc: "選挙人写真付き身分証",
        name: "選挙人証"
      },
      passport_in: {
        desc: "有効なインドのパスポート"
      },
      passport_intl: {
        desc: "お住まいの国の有効なパスポート"
      },
      national_id_intl: {
        desc: "政府発行の国民ID",
        name: "国民IDカード"
      }
    },
    methodName: {
      id_card: "国民IDカード",
      passport: "パスポート",
      drivers_license: "運転免許証",
      drivers: "運転免許証",
      biometric: "生体認証在留許可",
      residence: "在留許可",
      foreign_passport: "外国パスポート",
      national_id: "国民IDカード"
    }
  },
  errorBoundary: {
    title: "問題が発生しました",
    message: "このページを読み込めませんでした。もう一度お試しください。",
    retry: "ページを再読み込み",
    home: "ホームに戻る"
  }
};

const arTranslation = {
  disclaimerPage: {
    title: "إخلاء المسؤولية المالية",
    risk: "المخاطر",
    importantRiskTitle: "تحذير مهم بشأن المخاطر",
    importantRiskText: "ينطوي الاستثمار في الأسواق المالية على مخاطر كبيرة وقد يؤدي إلى خسارة كاملة لرأس المال المستثمر. الأداء السابق ليس ضمانًا للنتائج المستقبلية.",
    noAdviceTitle: "ليس نصيحة",
    noAdviceText: "لا يُعدّ محتوى هذا الموقع والخدمات التي تقدّمها Braxel Markets نصيحة مالية أو قانونية أو ضريبية. نوصي كل مستثمر بالحصول على استشارة مهنية مستقلة قبل اتخاذ قرارات الاستثمار.",
    limitationTitle: "تحديد المسؤولية",
    limitationText: "لا تتحمّل Braxel Markets المسؤولية عن الخسائر المالية الناتجة عن استخدام تقنية الأتمتة لدينا أو عن تقلّبات السوق.",
    capitalAtRiskTitle: "رأس المال معرّض للخطر",
    capitalAtRiskText: "رأس مالك معرّض للخطر عند استخدام خدماتنا. قد تخسر جزءًا من استثمارك أو كله.",
    noGuaranteedReturnsTitle: "لا عوائد مضمونة",
    noGuaranteedReturnsText: "نحن لا نضمن أي عوائد أو أرباح. الأداء السابق ليس مؤشرًا على النتائج المستقبلية.",
    pastPerformanceTitle: "الأداء السابق غير مؤشر",
    pastPerformanceText: "أي أداء تاريخي معروض هو لأغراض توضيحية فقط ولا يضمن النتائج المستقبلية.",
    notLicensedTitle: "الوضع التنظيمي",
    notLicensedText: "لا تُمثَّل Braxel Markets حاليًا كمؤسسة مالية مرخّصة أو خاضعة للتنظيم في [PLACEHOLDER: الاختصاص القضائي]. يرجى التحقق من الوضع التنظيمي المطبّق على موقعك.",
    noCapitalProtectionTitle: "لا ضمان لحماية رأس المال",
    noCapitalProtectionText: "نحن لا نقدّم أي حماية لرأس المال أو ضمان ضد الخسائر.",
    algorithmicRisksTitle: "مخاطر التداول الخوارزمي/الآلي",
    algorithmicRisksText: "تنطوي استراتيجيات التداول الآلي والخوارزمي على مخاطر تشمل، على سبيل المثال لا الحصر، أعطال الأنظمة ومشكلات الاتصال وأخطاء النماذج وظروف السوق غير المتوقعة.",
    jurisdictionRestrictionsTitle: "قيود الاختصاص القضائي",
    jurisdictionRestrictionsText: "قد لا تتوفّر خدماتنا في جميع الاختصاصات القضائية. يتحمّل المستخدمون مسؤولية ضمان الامتثال للقوانين واللوائح المحلية قبل استخدام منصتنا."
  },
  privacyPage: {
    title: "سياسة الخصوصية",
    privacy: "الخصوصية",
    dataCollectionTitle: "جمع البيانات",
    dataCollectionText: "نجمع فقط المعلومات اللازمة لتقديم خدماتنا، بما في ذلك الاسم والبريد الإلكتروني وبيانات المعاملات. بياناتك محمية بتشفير AES-256.",
    useOfInfoTitle: "استخدام المعلومات",
    useOfInfoText: "تُستخدم المعلومات المجمّعة حصريًا لإدارة حسابك ومعالجة المدفوعات وإرسال تقارير الأداء الأسبوعية.",
    securityTitle: "الأمان",
    securityText: "نطبّق إجراءات أمنية صارمة للحماية من الوصول غير المصرّح به إلى بياناتك الشخصية أو تغييرها أو إتلافها.",
    legalBasisTitle: "الأساس القانوني للمعالجة",
    legalBasisText: "الأساس القانوني لدينا لمعالجة بياناتك الشخصية هو [PLACEHOLDER: الأساس القانوني، مثل الموافقة أو المصلحة المشروعة أو الضرورة التعاقدية].",
    retentionTitle: "فترة الاحتفاظ بالبيانات",
    retentionText: "نحتفظ ببياناتك الشخصية لمدة [PLACEHOLDER: فترة الاحتفاظ]، ما لم يتطلب القانون فترة أطول.",
    thirdPartiesTitle: "الأطراف الثالثة والمعالجون",
    thirdPartiesText: "قد نشارك بياناتك مع مزوّدي خدمات خارجيين موثوقين مثل [PLACEHOLDER: قائمة المعالجين، مثل معالجات الدفع والاستضافة السحابية وخدمات البريد الإلكتروني] حصريًا للأغراض الموضّحة في هذه السياسة.",
    userRightsTitle: "حقوقك",
    userRightsText: "بموجب قوانين حماية البيانات المعمول بها مثل LGPD (البرازيل) وGDPR (الاتحاد الأوروبي)، يحق لك الوصول إلى بياناتك الشخصية وتصحيحها وحذفها ونقلها، فضلاً عن الاعتراض على المعالجة أو تقييدها. لممارسة هذه الحقوق، يرجى التواصل معنا على [PLACEHOLDER: جهة الاتصال لطلبات الحقوق].",
    cookiesTitle: "ملفات تعريف الارتباط والتقنيات المشابهة",
    cookiesText: "يستخدم موقعنا ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربة المستخدم وتحليل الزيارات وتخصيص المحتوى. يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات متصفحك.",
    contactTitle: "جهة الاتصال ومسؤول حماية البيانات",
    contactText: "لأي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، يرجى التواصل مع مسؤول حماية البيانات لدينا على [PLACEHOLDER: بريد أو جهة اتصال مسؤول حماية البيانات]."
  },
  contactEmail: {
    newSubmission: "إرسال جديد لنموذج الاتصال",
    name: "الاسم",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    sentFrom: "أُرسل من"
  },
  nav: {
    pricing: "خطط الاستثمار",
    howItWorks: "البنية التحتية",
    about: "من نحن",
    contact: "الدعم المؤسسي",
    login: "الوصول إلى المحطة",
    support: "الدعم",
    openAccount: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    logout: "تسجيل الخروج",
    selectLanguage: "اختر اللغة",
    sessionActive: "الجلسة النشطة",
    accessDashboard: "الوصول إلى لوحة التحكم"
  },
  footer: {
    desc: "بنية تحتية استثمارية مؤسسية. تقنية مملوكة للسوق الحديث.",
    platform: "المنصة",
    company: "الشركة",
    support: "الدعم الرقمي",
    rights: "جميع الحقوق محفوظة.",
    privacy: "الخصوصية",
    terms: "الشروط",
    disclaimer: "إخلاء المسؤولية المالية",
    address: "العنوان التجاري",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, Madrid, إسبانيا",
    riskTitle: "إخلاء مسؤولية المخاطر",
    riskText: "التداول في الأسواق المالية ينطوي على مخاطر كبيرة للخسارة وليس مناسبًا لجميع المستثمرين. الأداء السابق لا يضمن النتائج المستقبلية. قيمة الاستثمارات قد ترتفع أو تنخفض. لا تستثمر أموالاً لا يمكنك تحمل خسارتها. Braxel Markets لا تضمن عوائد محددة.",
    emailAria: "البريد الإلكتروني",
    xAria: "إكس (تويتر)"
  },
  chatbot: {
    title: "دعم Braxel",
    placeholder: "اكتب رسالة...",
    emailSupport: "البريد الإلكتروني:",
    assistantReply: "شكرًا لرسالتك. سيرد فريقنا قريبًا.",
    send: "إرسال",
    brandAI: "ذكاء Braxel Markets الاصطناعي",
    openChat: "فتح محادثة الدعم",
    close: "إغلاق",
    minimize: "تصغير",
    maximize: "تكبير",
    supportDialog: "محادثة الدعم"
  },
  auth: {
    loginTitle: "تسجيل الدخول",
    loginSubtitle: "أدخل بيانات الوصول الخاصة بك.",
    registerTitle: "إنشاء حساب",
    registerSubtitle: "ابدأ رحلتك في السوق المؤسسي.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    fullName: "الاسم الكامل",
    forgotPassword: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك وصول بالفعل؟",
    btnAccess: "الوصول إلى الحساب",
    btnCreate: "إنشاء حسابي",
    termsAgree: "أوافق على الشروط والخصوصية.",
    futureTitle: "مستقبل",
    futureSubtitle: "الاستثمار",
    features: [
      "خوارزميات مؤسسية",
      "حماية رأس المال المتقدمة",
      "تنفيذ بالميلي ثانية",
      "شفافية كاملة"
    ],
    loginLink: "تسجيل الدخول",
    loginSideDescription: "الوصول إلى محطة الإدارة المؤسسية.",
    loginSideFooter: "أمان على المستوى المؤسسي",
    loginErrorMessage: "بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.",
    registerErrorMessage: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
    registerSuccessMessage: "تم إنشاء الحساب بنجاح!",
    registerSideFooter: "محمي بأمان مؤسسي",
    welcomeBackTitle: "مرحبا بعودتك",
    welcomeBackHighlight: "المحطة المؤسسية",
    accountNotFound: "الحساب غير موجود. يرجى إنشاء حساب أولا.",
    rememberMe: "تذكرني",
    registerLink: "إنشاء حساب",
    accessBadge: "وصول مؤسسي",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    fullNamePlaceholder: "أدخل اسمك الكامل",
    passwordPlaceholder: "كلمة المرور",
    accountNotFoundError: "لم يتم العثور على الحساب. يرجى إنشاء حساب أولاً.",
    resetPasswordSent: "إذا كان هناك حساب لهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة تعيين كلمة المرور.",
    resetPasswordError: "تعذّر إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.",
    enterEmailFirst: "أدخل عنوان بريدك الإلكتروني أولاً."
  },
  hero: {
    title1: "إدارة رأس المال",
    title2: "الخوارزمية النخبوية",
    desc: "انشر استراتيجيات كمية مؤسسية مصممة للسوق الحديث. اختبر دقة تنفيذ بالميلي ثانية وبروتوكولات متقدمة لتخفيف المخاطر.",
    getStarted: "استكشف خطط الاستثمار",
    viewStrategies: "المنهجية التقنية"
  },
  stats: {
    volume: "إدارة رأس المال الاستراتيجي",
    traders: "الحسابات النشطة",
    uptime: "وقت تشغيل البنية التحتية",
    latency: "دقة التنفيذ"
  },
  methodology: {
    badge: "المنهجية",
    title: "النماذج الكمية",
    statArb: {
      title: "المراجحة الإحصائية",
      desc: "استغلال عدم كفاءة الأسعار المؤقتة بين الأصول المرتبطة باستخدام نماذج التكامل المشترك وتداول الأزواج.",
      f1: "تحليل التكامل المشترك",
      f2: "خوارزميات اختيار الأزواج",
      f3: "عتبة Z-Score"
    },
    meanRev: {
      title: "العودة إلى المتوسط",
      desc: "تحديد انحرافات أسعار الأصول عن المتوسطات التاريخية مع قواعد دخول وخروج منهجية.",
      f1: "إشارات نطاقات بولينجر",
      f2: "كشف تباعد RSI",
      f3: "نماذج Ornstein-Uhlenbeck"
    },
    hft: {
      title: "التداول عالي التردد",
      desc: "استراتيجيات تنفيذ منخفضة الكمون جدًا مع بنية تحتية مشتركة لإرسال الأوامر بمستوى الميكروثانية.",
      f1: "البنية المجهرية للسوق",
      f2: "تحليل تدفق الأوامر",
      f3: "مراجحة الكمون"
    }
  },
  transparency: {
    badge: "البنية التحتية",
    title: "تقنية شفافة",
    desc: "بنيتنا التحتية مبنية على أسس مؤسسية تضمن الموثوقية والسرعة والأمان.",
    connectivity: {
      title: "الاتصال",
      desc: "وصول مباشر إلى السوق عبر مراكز بيانات Equinix (NY5, LD4, TY3) مع اتصال منخفض الكمون بالبورصات الرئيسية (غير مُتحقق منه)."
    },
    cloud: {
      title: "التنفيذ السحابي",
      desc: "محركات تنفيذ احتياطية على AWS (us-east-1, eu-west-1) وAzure لمرونة التجاوز عند الفشل (غير مُتحقق منه)."
    },
    security: {
      title: "الأمان",
      desc: "تشفير من طرف إلى طرف، والامتثال لـ SOC 2 Type II، ومصادقة متعددة الطبقات لجميع العمليات (غير مُتحقق منه)."
    },
    warning: "الأسواق متقلبة. العوائد غير مضمونة أبدًا وقد تحدث خسائر حتى مع ضمانات قوية.",
    protocolTitle: "بروتوكول مصمم للاستخدام المؤسسي",
    protocolDesc: "تتبع بنيتنا التحتية معايير صارمة للامتثال وإدارة المخاطر لتحقيق الأمان التشغيلي (دون ضمان)."
  },
  process_home: {
    badge: "العملية",
    title: "سير العمل",
    subtitle: "المؤسسي",
    step1: {
      title: "التسجيل",
      desc: "تسجيل آمن والتحقق من الهوية."
    },
    step2: {
      title: "التخصيص",
      desc: "اختيار مستوى رأس المال المُدار."
    },
    step3: {
      title: "التكامل",
      desc: "نشر البنية التحتية الخوارزمية."
    },
    step4: {
      title: "المراقبة",
      desc: "تتبع الأداء في الوقت الفعلي."
    },
    step5: {
      title: "السيولة",
      desc: "بروتوكولات مبسطة لسحب الأرباح."
    }
  },
  cta_home: {
    badge: "فرصة",
    title: "وسّع",
    subtitle: "رأس المال",
    desc: "انضم إلى مجموعة النخبة من المستثمرين الذين يستخدمون البنية التحتية المملوكة لـ Braxel.",
    btn: "ابدأ التخصيص",
    trust: "أمان مؤسسي"
  },
  pricing: {
    badge: "الشفافية",
    title: "تخصيصات",
    subtitle: "رأس المال",
    desc: "بنية تحتية مؤسسية بهيكل رسوم شفاف.",
    select: "احصل على هذا الخطة",
    allocation: "رأس المال المُدار",
    month: "رسوم شهرية",
    detectedCurrency: "يتم تحصيل جميع الأسعار بالدولار الأمريكي ({{currency}}) بغض النظر عن موقعك",
    managedCapitalUsdNote: "رأس المال المُدار (Capital Gerenciado) يُسعَّر دائمًا بالدولار الأمريكي."
  },
  plans: {
    starter: "المبتدئ",
    starterFeatures: "مزايا الخطة المبتدئة",
    managedCapital: "رأس المال المُدار",
    features: {
      automation: "أتمتة",
      accountManagement: "إدارة الحساب",
      emailSupport: "دعم البريد الإلكتروني",
      controlledRisk: "مخاطر محكومة",
      starterFeatures: "مزايا الخطة المبتدئة",
      prioritySupport: "دعم أولوي",
      detailedLogs: "سجلات مفصلة",
      proFeatures: "مزايا Pro",
      multiAccount: "حسابات متعددة",
      weeklyReports: "تقارير أسبوعية",
      advancedFeatures: "مزايا متقدمة",
      support247: "دعم على مدار الساعة",
      dedicatedManager: "مدير مخصص"
    },
    professional: "احترافي",
    professionalFeatures: "مزايا الخطة الاحترافية",
    business: "الأعمال",
    businessFeatures: "مزايا خطة الأعمال",
    enterprise: "المؤسسات",
    enterpriseFeatures: "مزايا خطة المؤسسات"
  },
  howItWorks: {
    badge: "البنية التحتية",
    title: "البنية",
    subtitle: "التقنية",
    desc: "نظامنا البيئي المملوك مصمم للسرعة والأمان والأداء المتسق.",
    steps: [
      {
        title: "التسجيل",
        desc: "أنشئ ملفك المؤسسي."
      },
      {
        title: "لوحة التحكم",
        desc: "الوصول إلى محطة الإدارة الخاصة."
      },
      {
        title: "اختيار الخطة",
        desc: "اختر مستوى تخصيص رأس المال."
      },
      {
        title: "نشر API",
        desc: "الاتصال التلقائي بالأسواق العالمية."
      },
      {
        title: "التنفيذ",
        desc: "معالجة الأوامر بالميلي ثانية."
      },
      {
        title: "التقارير",
        desc: "تحليل أداء أسبوعي مفصل."
      }
    ],
    cta: "مستعد للبدء؟",
    ctaBtn: "انضم إلى الشبكة"
  },
  about: {
    badge: "من نحن",
    title: "التميز",
    subtitle: "المؤسسي",
    desc: "Braxel Markets تمثل قمة إدارة رأس المال الخوارزمية.",
    historyTitle: "تاريخنا",
    historyDesc1: "أسسها فريق من المحللين الكميين ومهندسي البرمجيات، أُنشئت Braxel لسد الفجوة بين رأس المال الفردي والتقنية المؤسسية.",
    historyDesc2: "اليوم، نركز على العوائد المعدلة حسب المخاطر واستقرار البنية التحتية، مع تقديم استراتيجيات خوارزمية متطورة للمستثمر الحديث.",
    stats: {
      founded: "تأسست",
      users: "المستخدمون النشطون",
      uptime: "وقت التشغيل",
      support: "الدعم"
    },
    values: {
      mission: "المهمة",
      missionDesc: "تقديم بنية تحتية خوارزمية نخبوية لرأس المال العالمي.",
      vision: "الرؤية",
      visionDesc: "تحديد مستقبل الإدارة الكمية الآلية.",
      values: "القيم",
      valuesDesc: "الشفافية والدقة والأمان الراسخ."
    },
    teamTitle: "فريق القيادة",
    teamDesc: "تعرف على المؤسسين والمديرين وراء Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "المؤسس والرئيس التنفيذي",
        bio: "استراتيجي كمي ورائد أعمال يقود رؤية Braxel Markets للبنية التحتية الخوارزمية المؤسسية.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "القيادة"
  },
  contact: {
    badge: "الدعم",
    title: "القنوات",
    subtitle: "المؤسسية",
    desc: "فريق الدعم المتخصص لدينا متاح على مدار الساعة للاستفسارات المؤسسية.",
    infoTitle: "معلومات الاتصال",
    formTitle: "استفسار مباشر",
    placeholders: {
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      subject: "الموضوع",
      message: "الرسالة"
    },
    sendBtn: "إرسال الاستفسار",
    supportHours: "ساعات الدعم",
    institutionalSupport: "دعم مؤسسي 24/7",
    securityChallenge: "تحدي الأمان",
    securityAnswer: "الإجابة",
    incorrectAnswer: "إجابة الأمان غير صحيحة. يرجى المحاولة مرة أخرى.",
    waitMessage: "يرجى الانتظار لحظة قبل إرسال رسالة أخرى.",
    messageSent: "تم إرسال الرسالة بنجاح! سيتواصل معك فريقنا قريبًا.",
    messageFailed: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى أو مراسلتنا مباشرة على marketsbraxel@ouvidor.net",
    cooldown: "الرجاء الانتظار",
    consentPre: "بإرسال هذا النموذج، فإنك توافق على",
    consentPost: "نستخدم بياناتك فقط للرد على استفسارك.",
    emailLabel: "البريد الإلكتروني"
  },
  dashboard: {
    portfolio: "المحفظة",
    activeServices: "الخدمات النشطة",
    newAllocation: "تخصيص جديد",
    noServices: "لم يتم العثور على خطط استثمار نشطة.",
    balance: "الرصيد الحالي",
    withdraw: "سحب",
    liquidity: "السيولة",
    requestWithdraw: "طلب سحب",
    selectAccount: "اختر الحساب",
    amount: "المبلغ (USD)",
    iban: "IBAN / التفاصيل المصرفية",
    btnWithdraw: "إرسال طلب السحب",
    profile: "إدارة الملف",
    settings: "الإعدادات",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    saveChanges: "حفظ التغييرات",
    verifiedAccount: "حساب موثق",
    accountStandard: "حساب قياسي",
    withdrawal: {
      gateTitle: "التحقق من الهوية مطلوب",
      gateWhy: "لحماية أموالك والامتثال للوائح، يلزم التحقق من الهوية (KYC) قبل طلب السحب. يمكنك التداول بحرية بدونه.",
      gateRejectedDesc: "لم يتم قبول الإرسال السابق. يرجى مراجعة السبب أدناه وإعادة إرسال المستندات.",
      gateUnderReview: "مستنداتك قيد المراجعة. سنُعلمك عبر البريد الإلكتروني بمجرد اتخاذ قرار. حتى ذلك الحين لا يمكنك طلب السحب.",
      kycStatusLabel: "حالة التحقق",
      statusPending: "لم يُرسل",
      statusSubmitted: "قيد المراجعة",
      statusApproved: "مقبول",
      statusRejected: "مرفوض",
      rejectedReason: "السبب",
      continueToForm: "متابعة إلى السحب",
      submitDocs: "إرسال المستندات",
      resubmit: "إعادة إرسال المستندات",
      uploadFront: "مستند الهوية (الوجه)",
      uploadBack: "مستند الهوية (الظهر)",
      uploadSelfie: "صورة شخصية مع المستند",
      chooseFile: "اختر ملفًا",
      fileHint: "JPG أو PNG أو PDF، حتى 10 ميغابايت",
      selfieHint: "صورة واضحة لوجهك مع المستند",
      optional: "اختياري",
      frontRequired: "يرجى إرفاق الوجه الأمامي لمستند الهوية.",
      fileTooLarge: "حجم الملف يتجاوز 10 ميغابايت.",
      uploadError: "تعذّر إرسال المستندات. حاول مرة أخرى.",
      documentsSubmitted: "تم إرسال المستندات. سنراجعها قريبًا.",
    },
    totalAUM: "إجمالي الأصول المُدارة",
    activeAlgos: "الخوارزميات النشطة",
    systemStatus: "حالة النظام",
    operational: "يعمل",
    infraProtection: "حماية البنية التحتية",
    twoFactor: "المصادقة الثنائية",
    notEnabled: "غير مفعّلة",
    enable2FA: "تفعيل 2FA",
    kycStatus: "التحقق KYC",
    verified: "موثّق",
    viewDocs: "عرض المستندات",
    investor: "مستثمر",
    kycRequired: "التحقق من KYC مطلوب",
    kycRequiredDesc: "أكمل التحقق من الهوية للوصول إلى جميع ميزات المنصة. هذا إلزامي لجميع الحسابات التي تدير رأس المال.",
    kycUnderReview: "KYC قيد المراجعة",
    kycUnderReviewDesc: "يتم مراجعة مستنداتك من قبل فريق الامتثال لدينا. يستغرق هذا عادةً 24-48 ساعة.",
    kycRejected: "تم رفض التحقق من KYC",
    kycRejectedDesc: "لم يتم قبول مستنداتك. يرجى إعادة الإرسال بمستندات صالحة.",
    resubmitDocs: "إعادة إرسال المستندات",
    completeVerification: "إكمال التحقق",
    verificationRequired: "التحقق مطلوب",
    goToVerification: "الذهاب إلى التحقق",
    totalProfit: "إجمالي الربح",
    drawdown: "التراجع",
    maxDrawdown: "الحد الأقصى للسحب",
    assetsInOperation: "الأصول قيد التشغيل",
    monthlyReturns: "العوائد الشهرية",
    analytics: "التحليلات",
    newWithdrawalRequest: "طلب سحب جديد",
    walletIban: "المحفظة / IBAN",
    network: {
      erc20: "ERC-20 (إيثيريوم)",
      trc20: "TRC-20 (ترون)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "تحويل بنكي (SWIFT)"
    },
    transactionHistory: "سجل المعاملات",
    operations: "العمليات",
    asset: "الأصل",
    type: "النوع",
    entry: "الدخول",
    exit: "الخروج",
    profit: "الربح",
    time: "الوقت",
    status: "الحالة",
    open: "مفتوح",
    closed: "مغلق",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "عنوان محفظة العملات الرقمية أو IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "أدخل الرمز المكوّن من 6 أرقام",
    minPasswordPlaceholder: "8 أحرف على الأقل",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
    accountNotFound: "الحساب غير موجود. يرجى إنشاء حساب أولاً.",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    rememberMe: "تذكرني",
    navPerformance: "الأداء",
    navAuditLog: "سجل التدقيق",
    tabProfile: "الملف الشخصي",
    tabKycVerification: "التحقق KYC",
    tabSecurity: "الأمان",
    kycCompleteDesc: "أكمل التحقق KYC للوصول إلى جميع ميزات المنصة. هذا متطلب امتثال إلزامي لجميع الحسابات.",
    kyc: {
      approved: "تمت الموافقة على التحقق",
      underReview: "المستندات قيد المراجعة",
      rejected: "تم رفض التحقق",
      required: "التحقق مطلوب",
      descApproved: "تم التحقق من هويتك. جميع الميزات مفتوحة.",
      descSubmitted: "يقوم فريق الامتثال لدينا بمراجعة مستنداتك. يستغرق هذا عادةً 24-48 ساعة.",
      descRejected: "لم تُقبل مستنداتك. يرجى إعادة إرسالها مع وثائق صالحة.",
      descRequired: "أكمل التحقق من الهوية لفتح جميع ميزات المنصة.",
      stepCountry: "الدولة",
      stepMethod: "الطريقة",
      stepDocument: "المستند",
      stepReview: "المراجعة",
      selectCountry: "اختر دولتك",
      selectCountryDesc: "اختر الدولة التي أصدرت وثيقة هويتك.",
      selectCountryPlaceholder: "اختر دولة...",
      selectMethod: "اختر طريقة التحقق",
      selectMethodDesc: "اختر كيف تريد التحقق من هويتك لـ {{country}}.",
      uploadDocument: "ارفع مستندك",
      uploadDocumentDesc: "اختر وارفع مستندًا صالحًا واحدًا من الخيارات أدناه.",
      clickToUpload: "انقر للرفع أو اسحب وأفلت",
      submitting: "جارٍ الإرسال...",
      submitForVerification: "إرسال للتحقق",
      progressTitle: "تقدم التحقق",
      stepEmailVerification: "التحقق من البريد",
      stepIdentityDocument: "وثيقة الهوية",
      stepComplianceReview: "مراجعة الامتثال",
      stepAccountActivation: "تفعيل الحساب",
      statusInProgress: "قيد التقدم",
      statusComplete: "مكتمل",
      statusPending: "قيد الانتظار",
      changePassword: "تغيير كلمة المرور",
      updateCredentials: "حدّث بيانات الاعتماد",
      newPassword: "كلمة مرور جديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      emailVerification: "التحقق من البريد",
      verified: "موثّق",
      verifiedEmail: "بريد موثّق",
      securityActivityLog: "سجل نشاط الأمان",
      scanAuthenticator: "امسح بتطبيق المصادقة الخاص بك",
      eventLoginNewDevice: "تسجيل الدخول من جهاز جديد",
      eventPasswordChanged: "تم تغيير كلمة المرور",
      eventAccountCreated: "تم إنشاء الحساب",
      timeHoursAgo: "منذ {{count}} ساعة",
      timeDaysAgo: "منذ {{count}} يوم"
    },
    newEmailLabel: "عنوان البريد الإلكتروني الجديد",
    sendConfirmationLink: "إرسال رابط التأكيد",
    identityVerified: "تم التحقق من هويتك! جميع الميزات متاحة الآن.",
    verificationRejected: "تم رفض التحقق الخاص بك. يرجى إعادة إرسال مستنداتك.",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح.",
    failedUpdateProfile: "فشل تحديث الملف الشخصي.",
    differentEmail: "يرجى إدخال عنوان بريد إلكتروني مختلف.",
    confirmationLinkSent: "تم إرسال رابط تأكيد إلى عنوان البريد الإلكتروني الجديد. يرجى التحقق لإكمال التغيير.",
    failedEmail: "فشل تحديث البريد الإلكتروني.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    passwordTooShort: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    passwordChanged: "تم تغيير كلمة المرور بنجاح.",
    failedPassword: "فشل تغيير كلمة المرور.",
    uploadDocument: "يرجى تحميل مستند.",
    completeSteps: "يرجى إكمال جميع خطوات التحقق.",
    documentsSubmitted: "تم إرسال المستندات للتحقق. سيتم إخطارك بعد المراجعة.",
    failedDocuments: "فشل إرسال المستندات.",
    performanceTitle: "لوحة الأداء",
    auditLogTitle: "سجل التدقيق",
    auditLogDesc: "جميع الأوامر الخوارزمية المنفَّذة على حسابك.",
    accountSettingsTitle: "إعدادات الحساب",
    personalInformation: "المعلومات الشخصية",
    emailAddress: "عنوان البريد الإلكتروني",
    emailChangeNotice: "يتطلب تغيير بريدك الإلكتروني التحقق. سيتم إرسال رابط تأكيد إلى العنوان الجديد.",
    currentEmail: "البريد الإلكتروني الحالي",
    confirmationSent: "تم إرسال التأكيد",
    tryDifferentEmail: "جرّب بريدًا إلكترونيًا آخر",
    continueToMethod: "المتابعة إلى اختيار الطريقة",
    uploadHint: "PNG، JPG، PDF حتى 10 ميجابايت",
    twoFactorDesc: "أضف طبقة أمان إضافية لحسابك. استخدم تطبيق مصادقة مثل Google Authenticator أو Authy.",
    qrCode: "رمز QR",
    kycRequiredBanner: "KYC مطلوب",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "الشبكة",
    emailChangeInboxNotice: "يرجى التحقق من صندوق الوارد والنقر على الرابط لإتمام تغيير البريد الإلكتروني.",
    emailChangeSentTo: "تم إرسال رابط تأكيد إلى {{email}}. يرجى التحقق من صندوق الوارد والنقر على الرابط لإتمام تغيير البريد الإلكتروني.",
    growthPerformanceMtd: "أداء النمو (منذ بداية الشهر)"
  },
  checkout: {
    summary: "الملخص",
    allocationTitle: "تخصيص",
    allocationSubtitle: "مؤسسي",
    tierLabel: "مستوى البنية التحتية الخوارزمية",
    billedMonthly: "فوترة شهرية",
    detailsTitle: "تفاصيل التخصيص",
    managedCapital: "رأس المال المُدار",
    setupFee: "رسوم الإعداد",
    waived: "معفاة",
    latency: "كمون التنفيذ",
    infrastructureTitle: "البنية التحتية المشمولة",
    realTimeMonitoring: "مراقبة في الوقت الفعلي",
    activeUponDeployment: "نشط بعد النشر",
    totalDue: "المجموع المستحق",
    dedicatedNode: "عقدة مخصصة",
    globalMarkets: "أسواق عالمية",
    instantSetup: "إعداد فوري",
    authRequired: "المصادقة مطلوبة",
    authDesc: "يرجى تسجيل الدخول أو إنشاء حساب للمتابعة.",
    btnLogin: "تسجيل الدخول للمتابعة",
    btnRegister: "إنشاء حساب",
    confirmDeployment: "تأكيد النشر",
    deploymentDesc: "بالتأكيد، تُخوّل نشر البنية التحتية الخوارزمية المرتبطة بخطة {{plan}}.",
    proceedPayment: "المتابعة إلى الدفع الآمن",
    secureGateway: "بوابة آمنة",
    back: "رجوع",
    riskDisclosure: "إفصاح المخاطر: التداول الخوارزمي ينطوي على مخاطر كبيرة للخسارة. الأداء السابق لا يضمن النتائج المستقبلية.",
    secureTransaction: "معاملة آمنة",
    paypalNote: "تتم معالجة بيانات الدفع بأمان بواسطة PayPal. Braxel Markets لا تخزن بيانات بطاقتك.",
    encryptionNote: "مشفر بمعايير AES-256 المؤسسية",
    verifying: "جارٍ التحقق من المعاملة المؤسسية...",
    loading: "جارٍ تحميل المحطة...",
    globalInfra: "بنية تحتية للدفع العالمي",
    qrCode: "رمز QR",
    allCards: "جميع البطاقات",
    selectPaymentMethod: "اختر طريقة الدفع",
    choosePayment: "اختر كيف تريد الدفع",
    creditCard: "بطاقة ائتمان",
    instantPayment: "دفع فوري",
    cardDesc: "Visa وMastercard وبطاقات أخرى",
    crypto: "عملة رقمية",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "تحويل رقمي سريع وآمن",
    securePayment: "دفع آمن",
    cardNumber: "رقم البطاقة",
    cardName: "الاسم على البطاقة",
    cardExpiry: "تاريخ الانتهاء",
    payNow: "ادفع الآن",
    amountToPay: "المبلغ المستحق",
    selectNetwork: "اختر الشبكة",
    yourAddress: "عنوان الإيداع",
    yourAddressPlaceholder: "أدخل عنوان USDT الخاص بك",
    important: "مهم",
    cryptoNote: "أرسل المبلغ الدقيق لتلقي الخطة",
    sendExactAmount: "أرسل هذا المبلغ بالضبط لتجنب التأخير",
    confirmCrypto: "تأكيد بالعملة الرقمية",
    copied: "تم النسخ!",
    cryptoPending: "تم تسجيل الدفع! بانتظار التأكيد.",
    processing: "جارٍ المعالجة...",
    paymentSuccess: "تمت الموافقة على الدفع!",
    selectCountry: "اختر البلد",
    searchCountry: "ابحث عن بلد...",
    phone: "رقم الهاتف",
    fillAllFields: "املأ جميع الحقول",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "الاسم الكامل",
    cardExpiryPlaceholder: "ش/س",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "فشل الدفع",
    paymentError: "خطأ في الدفع",
    amountToSend: "المبلغ المطلوب إرساله",
    paymentReference: "أدرج بريدك الإلكتروني كمرجع للدفع",
    wiseTransfer: "تحويل بنكي",
    bankDetails: "البيانات البنكية",
    accountHolder: "صاحب الحساب",
    accountNumber: "رقم الحساب",
    bankName: "اسم البنك",
    bankAddress: "عنوان البنك",
    routingNumber: "رقم التوجيه",
    confirmWise: "تأكيد التحويل",
    wiseDesc: "حوّل مباشرة إلى حسابنا البنكي عبر Wise",
    wiseNote: "بعد إجراء التحويل، اضغط تأكيد بالأسفل. سيتم تفعيل حسابك بعد التحقق (1-3 أيام عمل).",
    wiseInternational: "تحويل دولي",
    openWise: "افتح موقع Wise",
    transferInstructions: "تعليمات التحويل",
    lowFees: "رسوم منخفضة",
    noKyc: "مطلوب KYC",
    anyCountry: "أي دولة",
    wiseConfirmRequired: "يرجى تأكيد أنك قمت بالتحويل",
    wiseConfirmText: "لقد قمت بالتحويل البنكي وأؤكد أن المبلغ المرسل يطابق سعر الخطة.",
    wisePaymentSuccess: "تم تأكيد الدفع! يتم إعداد حسابك.",
    wiseStep1: "انسخ التفاصيل البنكية أدناه",
    wiseStep2: "قم بإجراء تحويل من بنكك أو حساب Wise",
    wiseStep3: "انقر على تأكيد بعد إجراء التحويل",
    subscriptionTitle: "الاشتراك",
    subscriptionSubtitle: "خطة الخدمة",
    serviceAccess: "الوصول إلى الخدمة",
    confirmCard: "تأكيد البطاقة",
    redirecting: "جارٍ إعادة التوجيه إلى الدفع...",
    card: "بطاقة ائتمان / خصم",
    testModeBanner: "وضع الاختبار — لا أموال حقيقية. لا بنك حقيقي. لا محفظة حقيقية. لا تفعيل حقيقي.",
    startFailed: "تعذر بدء الدفع. يرجى المحاولة مرة أخرى.",
    notConfigured: "لم يتم إعداد المدفوعات بالكامل بعد. جرّب طريقة أخرى أو تواصل مع الدعم.",
    invalidPlanTitle: "خطة غير صالحة",
    invalidPlanDesc: "الخطة المحددة لم تعد متاحة. يرجى اختيار خطة مرة أخرى.",
    swiftLabel: "SWIFT",
    referenceLabel: "المرجع",
  },
  legal: {
    badgeLegal: "قانوني",
    termsTitle: "شروط الخدمة"
  },
  faq: {
    title: "الأسئلة الشائعة",
    badge: "الأسئلة الشائعة",
    q1: "هل الخبرة المسبقة ضرورية؟",
    a1: "لا. بنيتنا التحتية مؤتمتة بالكامل. ما عليك سوى اختيار مستوى التخصيص ومراقبة الأداء عبر المحطة.",
    q2: "ما هي المخاطر المتضمنة؟",
    a2: "كما في أي سوق مالي، توجد مخاطر خسارة رأس المال بسبب التقلبات. نستخدم بروتوكولات متقدمة لحماية رأس المال.",
    q3: "كيف يعمل النظام؟",
    a3: "خوارزمياتنا المملوكة تنفذ استراتيجيات كمية عالية التردد في الأسواق العالمية بدقة الميلي ثانية.",
    q4: "هل يمكنني إلغاء خطتي؟",
    a4: "نعم. يمكنك طلب الإلغاء وسحب رأس المال في أي وقت من خلال بروتوكولات لوحة التحكم."
  },
  diffs: {
    title: "لماذا BRAXEL MARKETS؟",
    badge: "المميزات",
    t1: "تقنية مملوكة",
    d1: "شبكات عصبية مصممة للتنفيذ المؤسسي.",
    t2: "أتمتة كاملة",
    d2: "إدارة خوارزمية على مدار الساعة بدون تحيز عاطفي بشري.",
    t3: "وصول مبسط",
    d3: "بنية تحتية مؤسسية يمكن الوصول إليها عبر محطة بديهية.",
    t4: "مستوى احترافي",
    d4: "اتصال مباشر بمجمعات السيولة العالمية بكمون منخفض جدًا."
  },
  signals: {
    title: "التنفيذ",
    subtitle: "الخوارزمي",
    badge: "المحطة في الوقت الفعلي",
    desc: "راقب بنيتنا التحتية المملوكة في الوقت الفعلي. كل إشارة تتم معالجتها بواسطة شبكاتنا العصبية بدقة الميلي ثانية.",
    asset: "الأصل",
    type: "النوع",
    entry: "الدخول",
    profit: "الربح",
    status: "الحالة",
    active: "نشط",
    completed: "مكتمل",
    institutionalVerification: "التحقق المؤسسي",
    realtimeFeed: "تدفق بيانات في الوقت الفعلي من مجمّعات السيولة العالمية.",
    liveTerminal: "الطرفية المباشرة",
    connected: "متصل"
  },
  application: {
    title: "الطلب",
    subtitle: "الإرسال",
    plan_selected: "الخطة المحددة",
    billed_monthly: "يُفوتر شهرياً",
    plan_description: "أنت على وشك شراء اشتراك خدمة {{plan}}.",
    plan_price_detail: "الرسوم الشهرية: {{price}} (تُدفع شهرياً)",
    full_name: "الاسم الكامل",
    full_name_placeholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    email_placeholder: "أدخل بريدك الإلكتروني",
    address_line1: "العنوان — السطر 1",
    address_line1_placeholder: "الشارع ورقم المبنى",
    address_line2: "تفاصيل إضافية",
    address_line2_placeholder: "الشقة، الطابق، الوحدة، إلخ (اختياري)",
    city: "المدينة",
    city_placeholder: "المدينة",
    region: "الولاية / المنطقة",
    region_placeholder: "الولاية أو المنطقة",
    postal_code: "الرمز البريدي",
    postal_code_placeholder: "الرمز البريدي",
    country: "البلد",
    country_placeholder: "البلد",
    phone: "رقم الهاتف",
    phone_placeholder: "رقم الهاتف",
    terms_accepted: "أوافق على شروط الخدمة",
    privacy_accepted: "أوافق على سياسة الخصوصية",
    viewTerms: "عرض الشروط",
    viewPrivacy: "عرض سياسة الخصوصية",
    customer_note: "ملاحظة العميل (اختياري)",
    customer_note_placeholder: "أي معلومات إضافية تود إطلاعنا عليها",
    note_limit: "الحد الأقصى {{count}} حرفاً",
    characters: "حروف",
    submitting: "جارٍ الإرسال...",
    submit: "إرسال الطلب",
    errors: {
      full_name_required: "الاسم الكامل مطلوب",
      email_required: "البريد الإلكتروني مطلوب",
      email_invalid: "بريد إلكتروني غير صالح",
      address_line1_required: "العنوان مطلوب",
      city_required: "المدينة مطلوبة",
      country_required: "البلد مطلوب",
      terms_required: "يجب الموافقة على شروط الخدمة",
      privacy_required: "يجب الموافقة على سياسة الخصوصية",
      note_too_long: "يجب ألا تتجاوز الملاحظة 500 حرف",
      submit_failed: "فشل الإرسال. يرجى المحاولة مرة أخرى."
    }
  },
  checkoutSuccess: {
    verifying: "جارٍ التحقق من الدفع…",
    backToPricing: "العودة إلى الخطط",
    couldNotVerify: "لم نتمكن بعد من التحقق من دفعتك",
    couldNotVerifyDesc: "إذا أكملت عملية الدفع، فلا تقلق — تتم معالجة دفعتك وسيتم تفعيل حسابك قريباً. يرجى تحديث هذه الصفحة بعد قليل.",
    verifiedBadge: "تم التحقق",
    paymentCompleted: "اكتمل الدفع",
    activationNotice: "سيتم تفعيل حسابك خلال بضع دقائق.",
    paymentId: "معرّف الدفع",
    applicationId: "معرّف الطلب",
    securityNotice: "لأمانك، يتم تفعيل الحسابات يدوياً بواسطة مشغّل بعد التحقق من الدفع. ستحصل على الوصول بمجرد اكتمال المراجعة.",
    goToDashboard: "الانتقال إلى لوحة التحكم",
    contactSupport: "الاتصال بالدعم",
    verifyingBadge: "جارٍ التحقق",
    paymentReceived: "تم استلام الدفع. نحن نتحقق من الدفع.",
    beingVerified: "جاري التحقق من دفعتك. سيتم تحديث هذه الصفحة تلقائياً بمجرد تأكيد دفعتك. لا تغلق هذه النافذة.",
    currentStatus: "الحالة الحالية",
    urlSecurityNotice: "لأمانك، لا تعتبر هذه الصفحة الدفع مكتملاً بناءً على الرابط وحده. نحن ننتظر التأكيد من الخادم."
  },
  termsPage: {
    title: "شروط الخدمة",
    entityTitle: "الكيان المتعاقد",
    entityText: "[اسم الكيان القانوني، رقم التسجيل، الاختصاص القضائي]",
    descriptionTitle: "وصف الخدمة",
    descriptionText: "تقدّم Braxel Markets بنية تحتية للتداول الخوارزمي بمستوى المؤسسات وخدمات ذات صلة عبر منصتها.",
    feesTitle: "الرسوم والمدفوعات",
    feesText: "تُحدَّد رسوم خدماتنا في صفحة الأسعار وتخضع للتغيير بإشعار مسبق. تشمل طرق الدفع التحويل البنكي وبطاقة الائتمان والعملات المشفّرة.",
    eligibilityTitle: "الأهلية",
    eligibilityText: "خدماتنا متاحة للأفراد والكيانات الذين بلغوا 18 عامًا على الأقل ويلتزمون بمتطلبات «اعرف عميلك» (KYC) ومكافحة غسل الأموال (AML).",
    accountTerminationTitle: "إنهاء الحساب",
    accountTerminationText: "يجوز لأي من الطرفين إنهاء الحساب بإشعار كتابي مدته [PLACEHOLDER: فترة الإشعار، مثل 30 يومًا]. ويجوز لـ Braxel Markets الإنهاء الفوري في حالة خرق الشروط أو النشاط غير القانوني أو المتطلبات التنظيمية.",
    limitationOfLiabilityTitle: "تحديد المسؤولية",
    limitationOfLiabilityText: "إلى أقصى حدّ يسمح به القانون، لا تتحمّل Braxel Markets المسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو تأديبية، أو أي خسارة في البيانات أو الاستخدام أو السمعة أو غيرها من الخسائر غير المادية الناتجة عن وصولك إلى خدماتنا أو استخدامك لها.",
    disputeResolutionTitle: "تسوية النزاعات والقانون الحاكم",
    disputeResolutionText: "تخضع هذه الشروط وتُفسَّر وفقًا لقوانين [PLACEHOLDER: الاختصاص القضائي]. ويُحال أي نزاع ينشأ عن هذه الشروط أو يتعلق بها إلى الاختصاص القضائي الحصري لمحاكم [PLACEHOLDER: الاختصاص القضائي].",
    changesToTermsTitle: "التغييرات على هذه الشروط",
    changesToTermsText: "نحتفظ بالحق في تعديل هذه الشروط أو استبدالها في أي وقت. وإذا كان التعديل جوهريًا، فسنقدّم إشعارًا لا يقل عن [PLACEHOLDER: فترة الإشعار، مثل 30 يومًا] قبل سريان الشروط الجديدة. ويُحدَّد ما يُعدّ تعديلًا جوهريًا وفقًا لتقديرنا المنفرد.",
    effectiveDateTitle: "تاريخ النفاذ",
    effectiveDateText: "تاريخ النفاذ: [PLACEHOLDER: التاريخ]",
    contactTitle: "اتصل بنا",
    contactText: "لأي أسئلة حول هذه الشروط، يرجى التواصل معنا على [PLACEHOLDER: البريد الإلكتروني أو العنوان]."
  },
  legalDraftBanner: "هذه الصفحة مسودة قيد المراجعة القانونية وليست نهائية بعد.",
  notFound: {
    title: "404",
    message: "عذرًا، الصفحة التي تبحث عنها غير موجودة.",
    returnHome: "العودة إلى الصفحة الرئيسية"
  },
  authCallback: {
    confirmingTitle: "جارٍ تأكيد حسابك...",
    confirmingDesc: "يرجى الانتظار بينما نتحقق من بريدك الإلكتروني.",
    confirmedTitle: "تم تأكيد البريد الإلكتروني!",
    confirmedDesc: "تم التحقق من حسابك بنجاح.",
    redirecting: "جارٍ إعادة التوجيه إلى تسجيل الدخول...",
    failedTitle: "فشل التأكيد",
    goToLogin: "الانتقال إلى تسجيل الدخول",
    invalidLink: "رابط التأكيد غير صالح أو منتهي الصلاحية",
    failedConfirm: "فشل تأكيد البريد الإلكتروني"
  },
  paymentsDisabled: {
    title: "المدفوعات معطّلة حاليًا.",
    desc: "نظام الدفع غير مُفعّل بعد. لتفعيل المدفوعات، تواصل مع المشغّل على",
    managedBy: "تتم إدارة معالجة المدفوعات حصريًا بواسطة مشغّل المنصة. إذا كانت لديك أسئلة حول تخصيص معلّق، يرجى التواصل مع الدعم.",
    viewPlans: "عرض خطط الاستثمار"
  },
  checkoutStatus: {
    created: "تم الإنشاء",
    pending: "في انتظار الدفع",
    processing: "التحقق على السلسلة",
    confirmed: "مؤكَّد",
    failed: "فشل",
    rejected: "مرفوض",
    refunded: "مُسترد",
    disputed: "متنازع عليه",
    canceled: "ملغى",
    pending_manual: "في انتظار المراجعة اليدوية"
  },
  legalReview: {
    title: "مسودة قيد المراجعة القانونية"
  },
  operator: {
    title: "المشغّل",
    subtitle: "لوحة التحكم",
    description: "راجع طلبات العملاء المعلّقة وقم بتفعيلها.",
    no_pending_applications: "لا توجد طلبات معلّقة.",
    plan: "الخطة",
    amount: "المبلغ",
    country: "البلد",
    customer_note: "ملاحظة العميل",
    activate_account: "تفعيل الحساب",
    activating: "جارٍ التفعيل...",
    reject_or_request_info: "رفض / طلب معلومات",
    rejecting: "جارٍ الرفض...",
    reject_application: "رفض الطلب",
    reject_reason_prompt: "قدّم سبب الرفض أو المعلومات المطلوبة.",
    reject_reason_placeholder: "السبب...",
    cancel: "إلغاء",
    reject: "رفض",
    errors: {
      activation_failed: "فشل تفعيل الطلب.",
      rejection_failed: "فشل رفض الطلب."
    },
    status: {
      activation_pending: "التفعيل معلّق",
      account_active: "الحساب نشط",
      rejected: "مرفوض",
      manual_review: "مراجعة يدوية"
    }
  },
  profitCalculator: {
    badge: "توقّع",
    titleA: "حاسبة",
    titleB: "الأرباح",
    initialAllocation: "التخصيص الأولي",
    monthlyProfit: "الربح الشهري المتوقع",
    annualProfit: "الربح السنوي المتوقع",
    riskTitle: "إدارة المخاطر",
    riskDesc: "توقعات مبنية على الأداء الخوارزمي التاريخي مع حدود صارمة للتراجع.",
    instantTitle: "نشر فوري",
    instantDesc: "يبدأ رأس مالك بالعمل خلال دقائق من دمج البنية التحتية.",
    disclaimer: "* إخلاء المسؤولية: الأداء السابق لا يضمن النتائج المستقبلية. التوقعات لأغراض توضيحية فقط."
  },
  meta: {
    home: {
      title: "Braxel Markets | إدارة رأس المال الخوارزمية للمؤسسات",
      description: "بنية تحتية للتداول الخوارزمي بمستوى المؤسسات، والوصول إلى رأس مال شركات التداول، وتفويض CopyTrade، وأتمتة كاملة لـ MetaTrader على XAU/USD وUS500."
    },
    pricing: {
      title: "الخطط ورأس المال المُدار | Braxel Markets",
      description: "قارن بين خطط التداول الخوارزمي وتخصيصات رأس المال المُدار. يُسعَّر رأس المال المُدار دائمًا بالدولار الأمريكي."
    },
    about: {
      title: "عن Braxel Markets | التداول الخوارزمي",
      description: "تبني Braxel Markets بنية تحتية للتداول الخوارزمي بمستوى المؤسسات وتدير رأس المال بضوابط صارمة للمخاطر."
    },
    howItWorks: {
      title: "كيف تعمل | Braxel Markets",
      description: "تعرّف على كيفية ربط Braxel Markets رأس مالك باستراتيجيات MetaTrader المؤتمتة بالكامل على XAU/USD وUS500."
    },
    contact: {
      title: "اتصل بنا | Braxel Markets",
      description: "تواصل مع فريق Braxel Markets بخصوص البنية التحتية للتداول الخوارزمي ورأس المال المُدار."
    },
    terms: {
      title: "شروط الخدمة | Braxel Markets",
      description: "اقرأ شروط الخدمة لاستخدام Braxel Markets."
    },
    privacy: {
      title: "سياسة الخصوصية | Braxel Markets",
      description: "تعرّف على كيفية جمع Braxel Markets لبياناتك الشخصية واستخدامها وحمايتها."
    },
    disclaimer: {
      title: "الإفصاح عن المخاطر | Braxel Markets",
      description: "إفصاح مهم عن المخاطر المتعلقة بالتداول الخوارزمي ورأس المال المُدار مع Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "البرازيل",
      US: "الولايات المتحدة",
      GB: "المملكة المتحدة",
      DE: "ألمانيا",
      FR: "فرنسا",
      ES: "إسبانيا",
      IT: "إيطاليا",
      PT: "البرتغال",
      RU: "روسيا",
      CN: "الصين",
      JP: "اليابان",
      IN: "الهند",
      OTHER: "بلدان أخرى"
    },
    method: {
      BR: {
        id_card: "بطاقة الهوية الوطنية (RG/CPF)",
        drivers_license: "رخصة القيادة"
      },
      US: {
        id_card: "بطاقة هوية الولاية"
      },
      GB: {
        id_card: "الهوية الوطنية / رخصة القيادة",
        biometric: "تصريح إقامة بيومتري"
      },
      DE: {
        drivers: "رخصة القيادة",
        passport: "جواز السفر / Reisepass"
      },
      FR: {
        residence: "تصريح الإقامة"
      },
      RU: {
        foreign_passport: "جواز سفر أجنبي"
      },
      OTHER: {
        passport: "جواز سفر دولي",
        national_id: "بطاقة الهوية الوطنية"
      }
    },
    doc: {
      rg: {
        desc: "وثيقة الهوية الوطنية البرازيلية"
      },
      cpf: {
        desc: "بطاقة تسجيل دافع الضرائب البرازيلي"
      },
      passport: {
        desc: "جواز سفر ساري المفعول مع صفحة الصورة",
        name: "جواز السفر"
      },
      cnh: {
        desc: "رخصة القيادة البرازيلية",
        name: "CNH (رخصة القيادة)"
      },
      state_id: {
        desc: "رخصة القيادة أو بطاقة هوية صادرة عن الولاية",
        name: "بطاقة هوية الولاية"
      },
      passport_uk: {
        desc: "جواز سفر بريطاني ساري المفعول"
      },
      driving_license_uk: {
        desc: "رخصة القيادة البريطانية",
        name: "رخصة القيادة"
      },
      brp: {
        desc: "تصريح إقامة بيومتري بريطاني",
        name: "تصريح إقامة بيومتري"
      },
      personalausweis: {
        desc: "بطاقة الهوية الألمانية"
      },
      passport_de: {
        desc: "جواز سفر ألماني ساري المفعول"
      },
      fuehrerschein: {
        desc: "رخصة القيادة الألمانية"
      },
      cni: {
        desc: "بطاقة الهوية الوطنية الفرنسية"
      },
      passport_fr: {
        desc: "جواز سفر فرنسي ساري المفعول"
      },
      titre_sejour: {
        desc: "تصريح الإقامة الفرنسي"
      },
      dni: {
        desc: "وثيقة الهوية الوطنية الإسبانية"
      },
      nie: {
        desc: "رقم تعريف الأجانب"
      },
      passport_es: {
        desc: "جواز سفر ساري المفعول"
      },
      carta_id: {
        desc: "بطاقة الهوية الإيطالية"
      },
      passport_it: {
        desc: "جواز سفر إيطالي ساري المفعول"
      },
      cc: {
        desc: "بطاقة المواطن البرتغالية"
      },
      passport_pt: {
        desc: "جواز سفر برتغالي ساري المفعول"
      },
      passport_ru: {
        desc: "جواز السفر الروسي الداخلي"
      },
      foreign_passport_ru: {
        desc: "جواز السفر الروسي الخارجي",
        name: "جواز سفر أجنبي"
      },
      id_card_cn: {
        desc: "بطاقة الهوية الصينية"
      },
      passport_cn: {
        desc: "جواز سفر ساري المفعول"
      },
      passport_jp: {
        desc: "جواز سفر ياباني ساري المفعول"
      },
      zairyu: {
        desc: "بطاقة الإقامة"
      },
      aadhaar: {
        desc: "بطاقة الهوية الفريدة",
        name: "بطاقة Aadhaar"
      },
      voter_id: {
        desc: "بطاقة هوية انتخابية بالصورة",
        name: "بطاقة الناخب"
      },
      passport_in: {
        desc: "جواز سفر هندي ساري المفعول"
      },
      passport_intl: {
        desc: "جواز سفر ساري المفعول من بلدك"
      },
      national_id_intl: {
        desc: "بطاقة هوية وطنية صادرة عن الحكومة",
        name: "بطاقة الهوية الوطنية"
      }
    },
    methodName: {
      id_card: "بطاقة الهوية الوطنية",
      passport: "جواز السفر",
      drivers_license: "رخصة القيادة",
      drivers: "رخصة القيادة",
      biometric: "تصريح إقامة بيومتري",
      residence: "تصريح الإقامة",
      foreign_passport: "جواز سفر أجنبي",
      national_id: "بطاقة الهوية الوطنية"
    }
  },
  errorBoundary: {
    title: "حدث خطأ ما",
    message: "تعذّر تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.",
    retry: "إعادة تحميل الصفحة",
    home: "العودة إلى الرئيسية"
  }
};

const heTranslation = {
  disclaimerPage: {
    title: "כתב ויתור פיננסי",
    risk: "סיכון",
    importantRiskTitle: "אזהרת סיכון חשובה",
    importantRiskText: "השקעה בשווקים הפיננסיים כרוכה בסיכונים מהותיים ועלולה לגרום לאובדן מלא של ההון המושקע. ביצועי עבר אינם ערובה לתוצאות עתידיות.",
    noAdviceTitle: "אין ייעוץ",
    noAdviceText: "תוכן אתר זה והשירותים שמספקת Braxel Markets אינם מהווים ייעוץ פיננסי, משפטי או מיסויי. אנו ממליצים לכל משקיע לקבל ייעוץ מקצועי בלתי תלוי לפני קבלת החלטות השקעה.",
    limitationTitle: "הגבלת אחריות",
    limitationText: "Braxel Markets אינה אחראית להפסדים כספיים הנובעים משימוש בטכנולוגיית האוטומציה שלנו או מתנודות בשוק.",
    capitalAtRiskTitle: "הון בסיכון",
    capitalAtRiskText: "ההון שלך חשוף לסיכון בעת השימוש בשירותים שלנו. ייתכן שתאבד חלק מהשקעתך או את כולה.",
    noGuaranteedReturnsTitle: "אין תשואה מובטחת",
    noGuaranteedReturnsText: "איננו מתחייבים לכל תשואה או רווח. ביצועי עבר אינם מעידים על תוצאות עתידיות.",
    pastPerformanceTitle: "ביצועי עבר אינם מעידים",
    pastPerformanceText: "כל ביצועי עבר המוצגים הם להמחשה בלבד ואינם מבטיחים תוצאות עתידיות.",
    notLicensedTitle: "סטטוס רגולטורי",
    notLicensedText: "Braxel Markets אינה מיוצגת כיום כמוסד פיננסי מורשה או מפוקח ב-[PLACEHOLDER: סמכות שיפוט]. אנא בדוק את הסטטוס הרגולטורי החל על מיקומך.",
    noCapitalProtectionTitle: "אין ערובת הגנת הון",
    noCapitalProtectionText: "איננו מציעים הגנת הון או ערובה מפני הפסדים.",
    algorithmicRisksTitle: "סיכוני מסחר אלגוריתמי/אוטומטי",
    algorithmicRisksText: "אסטרטגיות מסחר אוטומטיות ואלגוריתמיות כרוכות בסיכונים הכוללים, בין היתר, כשלי מערכת, בעיות קישוריות, שגיאות מודל ותנאי שוק בלתי צפויים.",
    jurisdictionRestrictionsTitle: "הגבלות תחום שיפוט",
    jurisdictionRestrictionsText: "השירותים שלנו עשויים שלא להיות זמינים בכל תחומי השיפוט. המשתמשים אחראים לוודא עמידה בחוקים ובתקנות המקומיים לפני השימוש בפלטפורמה שלנו."
  },
  privacyPage: {
    title: "מדיניות פרטיות",
    privacy: "פרטיות",
    dataCollectionTitle: "איסוף נתונים",
    dataCollectionText: "אנו אוספים רק את המידע הנדרש לאספקת השירותים שלנו, לרבות שם, אימייל ונתוני עסקאות. הנתונים שלך מוגנים בהצפנת AES-256.",
    useOfInfoTitle: "שימוש במידע",
    useOfInfoText: "המידע הנאסף משמש אך ורק לניהול החשבון שלך, לעיבוד תשלומים ולשליחת דוחות ביצועים שבועיים.",
    securityTitle: "אבטחה",
    securityText: "אנו מיישמים אמצעי אבטחה קפדניים כדי להגן מפני גישה בלתי מורשית, שינוי או השמדה של הנתונים האישיים שלך.",
    legalBasisTitle: "בסיס משפטי לעיבוד",
    legalBasisText: "הבסיס המשפטי שלנו לעיבוד הנתונים האישיים שלך הוא [PLACEHOLDER: בסיס משפטי, למשל הסכמה, אינטרס לגיטימי, נחיצות חוזית].",
    retentionTitle: "תקופת שמירת נתונים",
    retentionText: "אנו שומרים את הנתונים האישיים שלך במשך [PLACEHOLDER: תקופת שמירה], אלא אם החוק מחייב תקופה ארוכה יותר.",
    thirdPartiesTitle: "צדדים שלישיים ומעבדים",
    thirdPartiesText: "אנו עשויים לשתף את הנתונים שלך עם ספקי שירות חיצוניים מהימנים כגון [PLACEHOLDER: רשימת מעבדים, למשל ספקי סליקה, אחסון בענן, שירותי דואר אלקטרוני] אך ורק למטרות המפורטות במדיניות זו.",
    userRightsTitle: "הזכויות שלך",
    userRightsText: "בהתאם לחוקי הגנת הנתונים החלים, כגון LGPD (ברזיל) ו-GDPR (האיחוד האירופי), יש לך הזכות לגשת לנתונים האישיים שלך, לתקנם, למחקם ולהעבירם, כמו גם להתנגד לעיבוד או להגבילו. למימוש זכויות אלה, אנא צור קשר בכתובת [PLACEHOLDER: איש קשר לבקשות זכויות].",
    cookiesTitle: "קובצי Cookie וטכנולוגיות דומות",
    cookiesText: "האתר שלנו משתמש בקובצי Cookie ובטכנולוגיות דומות כדי לשפר את חוויית המשתמש, לנתח תנועה ולהתאים תוכן. ניתן לנהל את העדפות קובצי ה-Cookie דרך הגדרות הדפדפן שלך.",
    contactTitle: "יצירת קשר וממונה הגנת הנתונים",
    contactText: "לשאלות בנוגע למדיניות פרטיות זו או לנוהלי הנתונים שלנו, אנא צור קשר עם ממונה הגנת הנתונים בכתובת [PLACEHOLDER: אימייל או איש קשר של ה-DPO]."
  },
  contactEmail: {
    newSubmission: "שליחת טופס יצירת קשר חדשה",
    name: "שם",
    email: "דוא\"ל",
    subject: "נושא",
    message: "הודעה",
    sentFrom: "נשלח מ"
  },
  nav: {
    pricing: "תוכניות השקעה",
    howItWorks: "תשתית",
    about: "אודות",
    contact: "תמיכה מוסדית",
    login: "גישה לטרמינל",
    support: "תמיכה",
    openAccount: "יצירת חשבון",
    dashboard: "לוח בקרה",
    logout: "התנתקות",
    selectLanguage: "בחר שפה",
    sessionActive: "סשן פעיל",
    accessDashboard: "גש ללוח הבקרה"
  },
  footer: {
    desc: "תשתית השקעות ברמה מוסדית. טכנולוגיה קניינית לשוק המודרני.",
    platform: "פלטפורמה",
    company: "חברה",
    support: "תמיכה דיגיטלית",
    rights: "כל הזכויות שמורות.",
    privacy: "פרטיות",
    terms: "תנאים",
    disclaimer: "הצהרה פיננסית",
    address: "כתובת מסחרית",
    addressValue: "Calle de la Haya, 28935, Parque Coimbra, מדריד, ספרד",
    riskTitle: "הצהרת סיכונים",
    riskText: "מסחר בשווקים פיננסיים כרוך בסיכון משמעותי להפסד ואינו מתאים לכל המשקיעים. ביצועי עבר אינם מעידים על תוצאות עתידיות. ערך ההשקעות יכול לעלות או לרדת. אל תשקיע כסף שאינך יכול להרשות לעצמך להפסיד. Braxel Markets אינה מבטיחה תשואות ספציפיות.",
    emailAria: "דוא\"ל",
    xAria: "X (טוויטר)"
  },
  chatbot: {
    title: "תמיכת Braxel",
    placeholder: "הקלד הודעה...",
    emailSupport: "אימייל:",
    assistantReply: "תודה על הודעתך. הצוות שלנו ישיב בקרוב.",
    send: "שלח",
    brandAI: "Braxel Markets AI",
    openChat: "פתח צ׳אט תמיכה",
    close: "סגור",
    minimize: "מזער",
    maximize: "הרחב",
    supportDialog: "צ׳אט תמיכה"
  },
  auth: {
    loginTitle: "התחברות",
    loginSubtitle: "הזן את פרטי הגישה שלך.",
    registerTitle: "יצירת חשבון",
    registerSubtitle: "התחל את המסע שלך בשוק המוסדי.",
    email: "כתובת דוא״ל",
    password: "סיסמה",
    fullName: "שם מלא",
    forgotPassword: "שכחת סיסמה?",
    noAccount: "אין לך חשבון?",
    hasAccount: "כבר יש לך גישה?",
    btnAccess: "גישה לחשבון",
    btnCreate: "צור את החשבון שלי",
    termsAgree: "אני מסכים לתנאים ולמדיניות הפרטיות.",
    futureTitle: "העתיד של",
    futureSubtitle: "ההשקעות",
    features: [
      "אלגוריתמים ברמה מוסדית",
      "הגנת הון מתקדמת",
      "ביצוע במילישניות",
      "שקיפות מלאה"
    ],
    loginLink: "התחברות",
    loginSideDescription: "גישה לטרמינל הניהול המוסדי שלך.",
    loginSideFooter: "אבטחה ברמה מוסדית",
    loginErrorMessage: "פרטי כניסה לא תקפים. אנא נסה שוב.",
    registerErrorMessage: "ההרשמה נכשלה. אנא נסה שוב.",
    registerSuccessMessage: "החשבון נוצר בהצלחה!",
    registerSideFooter: "מוגן על ידי אבטחה מוסדית",
    welcomeBackTitle: "ברוך שובך",
    welcomeBackHighlight: "הטרמינל המוסדי",
    accountNotFound: "החשבון לא נמצא. אנא צור חשבון קודם.",
    rememberMe: "זכור אותי",
    registerLink: "צור חשבון",
    accessBadge: "גישה מוסדית",
    emailPlaceholder: "הזן את האימייל שלך",
    fullNamePlaceholder: "הזן את שמך המלא",
    passwordPlaceholder: "סיסמה",
    accountNotFoundError: "החשבון לא נמצא. אנא צור חשבון תחילה.",
    resetPasswordSent: "אם קיים חשבון עבור אימייל זה, נשלח קישור לאיפוס הסיסמה.",
    resetPasswordError: "לא ניתן לשלוח קישור לאיפוס. אנא נסה שוב.",
    enterEmailFirst: "הזן תחילה את כתובת האימייל שלך."
  },
  hero: {
    title1: "ניהול הון",
    title2: "אלגוריתמי של אליטה",
    desc: "פרוס אסטרטגיות כמותיות ברמה מוסדית שתוכננו לשוק המודרני. חווה דיוק ביצוע במילישניות ופרוטוקולי הפחתת סיכונים מתקדמים.",
    getStarted: "חקור תוכניות השקעה",
    viewStrategies: "מתודולוגיה טכנית"
  },
  stats: {
    volume: "ניהול הון אסטרטגי",
    traders: "חשבונות פעילים",
    uptime: "זמן פעילות תשתית",
    latency: "דיוק ביצוע"
  },
  methodology: {
    badge: "מתודולוגיה",
    title: "מודלים כמותיים",
    statArb: {
      title: "ארביטראז׳ סטטיסטי",
      desc: "ניצול חוסר יעילות מחירים זמני בין נכסים מתואמים באמצעות מודלי קו-אינטגרציה ומסחר זוגות.",
      f1: "ניתוח קו-אינטגרציה",
      f2: "אלגוריתמי בחירת זוגות",
      f3: "סף Z-Score"
    },
    meanRev: {
      title: "חזרה לממוצע",
      desc: "זיהוי סטיות מחיר נכסים מממוצעים היסטוריים עם כללי כניסה ויציאה שיטתיים.",
      f1: "אותות רצועות בולינגר",
      f2: "זיהוי דיברגנציית RSI",
      f3: "מודלי Ornstein-Uhlenbeck"
    },
    hft: {
      title: "מסחר בתדירות גבוהה",
      desc: "אסטרטגיות ביצוע בהשהיה אולטרא-נמוכה עם תשתית משולבת להצבת פקודות ברמת מיקרושניות.",
      f1: "מיקרו-מבנה שוק",
      f2: "ניתוח זרימת פקודות",
      f3: "ארביטראז׳ השהיה"
    }
  },
  transparency: {
    badge: "תשתית",
    title: "טכנולוגיה שקופה",
    desc: "התשתית שלנו בנויה על בסיס ארגוני, מבטיחה אמינות, מהירות ואבטחה.",
    connectivity: {
      title: "קישוריות",
      desc: "גישה ישירה לשוק דרך מרכזי הנתונים של Equinix (NY5, LD4, TY3) עם קישוריות בזמן השהיה נמוך לבורסות המובילות (לא מאומת)."
    },
    cloud: {
      title: "ביצוע בענן",
      desc: "מנועי ביצוע כפולים ב-AWS (us-east-1, eu-west-1) וב-Azure לחוסן במעבר כשל (לא מאומת)."
    },
    security: {
      title: "אבטחה",
      desc: "הצפנה מקצה לקצה, עמידה בתקן SOC 2 Type II ואימות רב-שכבתי לכל הפעולות (לא מאומת)."
    },
    warning: "השווקים תנודתיים. תשואות אינן מובטחות לעולם וייתכנו הפסדים גם עם אמצעי הגנה איתנים.",
    protocolTitle: "פרוטוקול המיועד לשימוש מוסדי",
    protocolDesc: "התשתית שלנו פועלת לפי תקני ציות וניהול סיכונים מחמירים במטרה להשיג ביטחון תפעולי (ללא אחריות)."
  },
  process_home: {
    badge: "תהליך",
    title: "תהליך עבודה",
    subtitle: "מוסדי",
    step1: {
      title: "הרשמה",
      desc: "קליטה מאובטחת ואימות זהות."
    },
    step2: {
      title: "הקצאה",
      desc: "בחירת רמת ההון המנוהל."
    },
    step3: {
      title: "אינטגרציה",
      desc: "פריסת תשתית אלגוריתמית."
    },
    step4: {
      title: "ניטור",
      desc: "מעקב ביצועים בזמן אמת."
    },
    step5: {
      title: "נזילות",
      desc: "פרוטוקולים מופשטים למשיכת רווחים."
    }
  },
  cta_home: {
    badge: "הזדמנות",
    title: "הגדל את",
    subtitle: "הון",
    desc: "הצטרף לקבוצת האליטה של משקיעים שמשתמשים בתשתית הקניינית של Braxel.",
    btn: "התחל הקצאה",
    trust: "אבטחה ברמה מוסדית"
  },
  pricing: {
    badge: "שקיפות",
    title: "הקצאות",
    subtitle: "הון",
    desc: "תשתית ברמה מוסדית עם מבנה עמלות שקוף.",
    select: "הבטח תוכנית זו",
    allocation: "הון מנוהל",
    month: "עמלה חודשית",
    detectedCurrency: "כל המחירים מחויבים ב-USD ({{currency}}) ללא תלות במיקומך",
    managedCapitalUsdNote: "הון מנוהל (Capital Gerenciado) נקוב תמיד בדולר ארה\"ב."
  },
  plans: {
    starter: "בסיסי",
    starterFeatures: "תכונות מסלול בסיסי",
    managedCapital: "הון מנוהל",
    features: {
      automation: "אוטומציה",
      accountManagement: "ניהול חשבון",
      emailSupport: "תמיכה באימייל",
      controlledRisk: "סיכון מבוקר",
      starterFeatures: "תכונות מסלול בסיסי",
      prioritySupport: "תמיכה בעדיפות",
      detailedLogs: "לוגים מפורטים",
      proFeatures: "תכונות Pro",
      multiAccount: "ריבוי חשבונות",
      weeklyReports: "דוחות שבועיים",
      advancedFeatures: "תכונות מתקדמות",
      support247: "תמיכה 24/7",
      dedicatedManager: "מנהל ייעודי"
    },
    professional: "מקצועי",
    professionalFeatures: "תכונות מסלול מקצועי",
    business: "עסקי",
    businessFeatures: "תכונות מסלול עסקי",
    enterprise: "ארגוני",
    enterpriseFeatures: "תכונות מסלול ארגוני"
  },
  howItWorks: {
    badge: "תשתית",
    title: "ארכיטקטורה",
    subtitle: "טכנית",
    desc: "המערכת האקולוגית הקניינית שלנו בנויה למהירות, אבטחה וביצועים עקביים.",
    steps: [
      {
        title: "הרשמה",
        desc: "צור את הפרופיל המוסדי שלך."
      },
      {
        title: "לוח בקרה",
        desc: "גישה לטרמינל הניהול הפרטי."
      },
      {
        title: "בחירת תוכנית",
        desc: "בחר את רמת הקצאת ההון."
      },
      {
        title: "פריסת API",
        desc: "חיבור אוטומטי לשווקים גלובליים."
      },
      {
        title: "ביצוע",
        desc: "עיבוד פקודות במילישניות."
      },
      {
        title: "דיווח",
        desc: "ניתוח ביצועים שבועי מפורט."
      }
    ],
    cta: "מוכן להתחיל?",
    ctaBtn: "הצטרף לרשת"
  },
  about: {
    badge: "אודות",
    title: "מצוינות",
    subtitle: "מוסדית",
    desc: "Braxel Markets מייצגת את פסגת ניהול ההון האלגוריתמי.",
    historyTitle: "ההיסטוריה שלנו",
    historyDesc1: "הוקמה על ידי צוות של אנליסטים כמותיים ומהנדסי תוכנה, Braxel נוצרה לגשר על הפער בין הון קמעונאי לטכנולוגיה מוסדית.",
    historyDesc2: "כיום אנו מתמקדים בתשואות מותאמות סיכון ויציבות תשתית, ומספקים אסטרטגיות אלגוריתמיות חדשניות למשקיע המודרני.",
    stats: {
      founded: "הוקמה",
      users: "משתמשים פעילים",
      uptime: "זמינות",
      support: "תמיכה"
    },
    values: {
      mission: "משימה",
      missionDesc: "לספק תשתית אלגוריתמית של אליטה להון גלובלי.",
      vision: "חזון",
      visionDesc: "להגדיר את עתיד הניהול הכמותי האוטומטי.",
      values: "ערכים",
      valuesDesc: "שקיפות, דיוק ואבטחה בלתי מתפשרת."
    },
    teamTitle: "צוות ההנהגה",
    teamDesc: "הכירו את המייסדים והמנהלים מאחורי Braxel Markets.",
    team: [
      {
        name: "Bernardo Campi",
        role: "מייסד ומנכ״ל",
        bio: "אסטרטג כמותי ויזם המוביל את החזון של Braxel Markets לתשתית אלגוריתמית מוסדית.",
        photo: "/team-bernardo-campi.jpg"
      }
    ],
    teamBadge: "הנהגה"
  },
  contact: {
    badge: "תמיכה",
    title: "ערוצים",
    subtitle: "מוסדיים",
    desc: "צוות התמיכה המסור שלנו זמין 24/7 לפניות מוסדיות.",
    infoTitle: "פרטי קשר",
    formTitle: "פנייה ישירה",
    placeholders: {
      name: "שם מלא",
      email: "כתובת דוא״ל",
      subject: "נושא",
      message: "הודעה"
    },
    sendBtn: "שלח פנייה",
    supportHours: "שעות תמיכה",
    institutionalSupport: "תמיכה מוסדית 24/7",
    securityChallenge: "אתגר אבטחה",
    securityAnswer: "תשובה",
    incorrectAnswer: "תשובת האבטחה שגויה. אנא נסה שוב.",
    waitMessage: "אנא המתן רגע לפני שליחת הודעה נוספת.",
    messageSent: "ההודעה נשלחה בהצלחה! הצוות שלנו יצור איתך קשר בקרוב.",
    messageFailed: "שליחת ההודעה נכשלה. אנא נסה שוב או שלח לנו אימייל ישירות ל marketsbraxel@ouvidor.net",
    cooldown: "אנא המתן",
    consentPre: "בשליחת טופס זה, אתה מסכים ל",
    consentPost: "אנו משתמשים בנתונים שלך רק כדי להשיב לפנייתך.",
    emailLabel: "דוא\"ל"
  },
  dashboard: {
    portfolio: "תיק השקעות",
    activeServices: "שירותים פעילים",
    newAllocation: "הקצאה חדשה",
    noServices: "לא נמצאו תוכניות השקעה פעילות.",
    balance: "יתרה נוכחית",
    withdraw: "משיכה",
    liquidity: "נזילות",
    requestWithdraw: "בקש משיכה",
    selectAccount: "בחר חשבון",
    amount: "סכום (USD)",
    iban: "IBAN / פרטי בנק",
    btnWithdraw: "שלח בקשת משיכה",
    profile: "ניהול פרופיל",
    settings: "הגדרות",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    saveChanges: "שמור שינויים",
    verifiedAccount: "חשבון מאומת",
    accountStandard: "חשבון רגיל",
    withdrawal: {
      gateTitle: "נדרש אימות זהות",
      gateWhy: "כדי להגן על כספך ולעמוד בתקנות, נדרש אימות זהות (KYC) לפני בקשת משיכה. ניתן לסחור בחופשיות בלעדיו.",
      gateRejectedDesc: "ההגשה הקודמת שלך לא התקבלה. עיין בסיבה למטה ושלח שוב את המסמכים.",
      gateUnderReview: "המסמכים שלך בבדיקה. נודיע לך במייל לאחר קבלת החלטה. עד אז לא ניתן לבקש משיכה.",
      kycStatusLabel: "מצב האימות",
      statusPending: "לא הוגש",
      statusSubmitted: "בבדיקה",
      statusApproved: "מאושר",
      statusRejected: "נדחה",
      rejectedReason: "סיבה",
      continueToForm: "המשך למשיכה",
      submitDocs: "שלח מסמכים",
      resubmit: "שלח שוב מסמכים",
      uploadFront: "מסמך זהות (חזית)",
      uploadBack: "מסמך זהות (גב)",
      uploadSelfie: "סלפי עם המסמך",
      chooseFile: "בחר קובץ",
      fileHint: "JPG, PNG או PDF, עד 10MB",
      selfieHint: "תמונה ברורה של פניך עם המסמך",
      optional: "אופציונלי",
      frontRequired: "נא לצרף את חזית מסמך הזהות.",
      fileTooLarge: "הקובץ גדול מ-10MB.",
      uploadError: "לא ניתן לשלוח את המסמכים. נסה שוב.",
      documentsSubmitted: "המסמכים נשלחו. נבדוק אותם בקרוב.",
    },
    totalAUM: "סך נכסים מנוהלים",
    activeAlgos: "אלגוריתמים פעילים",
    systemStatus: "מצב מערכת",
    operational: "פעיל",
    infraProtection: "הגנת תשתית",
    twoFactor: "אימות דו-שלבי",
    notEnabled: "לא מופעל",
    enable2FA: "הפעל 2FA",
    kycStatus: "אימות KYC",
    verified: "מאומת",
    viewDocs: "הצג מסמכים",
    investor: "משקיע",
    kycRequired: "נדרש אימות KYC",
    kycRequiredDesc: "השלם את האימות כדי לגשת לכל התכונות של הפלטפורמה. זהו חובה עבור כל החשבונות המנהלים הון.",
    kycUnderReview: "KYC בבדיקה",
    kycUnderReviewDesc: "המסמכים שלך נבדקים על ידי צוות הציות שלנו. זה בדרך כלל לוקח 24-48 שעות.",
    kycRejected: "אימות KYC נדחה",
    kycRejectedDesc: "המסמכים שלך לא התקבלו. אנא שלח שוב עם מסמכים תקפים.",
    resubmitDocs: "שלח מסמכים שוב",
    completeVerification: "השלם אימות",
    verificationRequired: "נדרש אימות",
    goToVerification: "עבור לאימות",
    totalProfit: "רווח כולל",
    drawdown: "ירידה",
    maxDrawdown: "משיכה מקסימלית",
    assetsInOperation: "נכסים בפעולה",
    monthlyReturns: "תשואות חודשיות",
    analytics: "ניתוחים",
    newWithdrawalRequest: "בקשת משיכה חדשה",
    walletIban: "ארנק / IBAN",
    network: {
      erc20: "ERC-20 (אתריום)",
      trc20: "TRC-20 (טרון)",
      bep20: "BEP-20 (BSC)",
      bankSwift: "העברה בנקאית (SWIFT)"
    },
    transactionHistory: "היסטוריית עסקאות",
    operations: "פעולות",
    asset: "נכס",
    type: "סוג",
    entry: "כניסה",
    exit: "יציאה",
    profit: "רווח",
    time: "זמן",
    status: "סטטוס",
    open: "פתוח",
    closed: "סגור",
    withdrawalAmountPlaceholder: "0.00",
    withdrawalWalletPlaceholder: "כתובת ארנק קריפטו או IBAN",
    newEmailPlaceholder: "new@email.com",
    verificationCodePlaceholder: "הזן קוד בן 6 ספרות",
    minPasswordPlaceholder: "לפחות 8 תווים",
    confirmPasswordPlaceholder: "הזן שוב את הסיסמה החדשה",
    accountNotFound: "החשבון לא נמצא. אנא צור חשבון קודם.",
    loginSuccess: "התחברת בהצלחה!",
    rememberMe: "זכור אותי",
    navPerformance: "ביצועים",
    navAuditLog: "יומן ביקורת",
    tabProfile: "פרופיל",
    tabKycVerification: "אימות KYC",
    tabSecurity: "אבטחה",
    kycCompleteDesc: "השלם את אימות KYC כדי לגשת לכל תכונות הפלטפורמה. זוהי דרישת ציות חובה לכל החשבונות.",
    kyc: {
      approved: "האימות אושר",
      underReview: "מסמכים בבדיקה",
      rejected: "האימות נדחה",
      required: "נדרש אימות",
      descApproved: "זהותך אומתה. כל התכונות פתוחות.",
      descSubmitted: "צוות הציות שלנו בודק את המסמכים שלך. זה בדרך כלל אורך 24-48 שעות.",
      descRejected: "המסמכים שלך לא התקבלו. נא שלח שוב עם תיעוד תקף.",
      descRequired: "השלם את אימות הזהות כדי לפתוח את כל תכונות הפלטפורמה.",
      stepCountry: "מדינה",
      stepMethod: "שיטה",
      stepDocument: "מסמך",
      stepReview: "סקירה",
      selectCountry: "בחר את המדינה שלך",
      selectCountryDesc: "בחר את המדינה שהנפיקה את מסמך הזהות שלך.",
      selectCountryPlaceholder: "בחר מדינה...",
      selectMethod: "בחר שיטת אימות",
      selectMethodDesc: "בחר כיצד תרצה לאמת את זהותך עבור {{country}}.",
      uploadDocument: "העלה את המסמך שלך",
      uploadDocumentDesc: "בחר והעלה מסמך תקף אחד מהאפשרויות למטה.",
      clickToUpload: "לחץ להעלאה או גרור ושחרר",
      submitting: "שולח...",
      submitForVerification: "שלח לאימות",
      progressTitle: "התקדמות אימות",
      stepEmailVerification: "אימות אימייל",
      stepIdentityDocument: "מסמך זהות",
      stepComplianceReview: "סקירת ציות",
      stepAccountActivation: "הפעלת חשבון",
      statusInProgress: "בתהליך",
      statusComplete: "הושלם",
      statusPending: "ממתין",
      changePassword: "שינוי סיסמה",
      updateCredentials: "עדכן את פרטי ההתחברות",
      newPassword: "סיסמה חדשה",
      confirmNewPassword: "אשר סיסמה חדשה",
      emailVerification: "אימות אימייל",
      verified: "מאומת",
      verifiedEmail: "אימייל מאומת",
      securityActivityLog: "יומן פעילות אבטחה",
      scanAuthenticator: "סרוק עם אפליקציית האימות שלך",
      eventLoginNewDevice: "התחברות ממכשיר חדש",
      eventPasswordChanged: "הסיסמה שונתה",
      eventAccountCreated: "החשבון נוצר",
      timeHoursAgo: "לפני {{count}} שעות",
      timeDaysAgo: "לפני {{count}} ימים"
    },
    newEmailLabel: "כתובת אימייל חדשה",
    sendConfirmationLink: "שלח קישור אימות",
    identityVerified: "הזהות שלך אומתה! כל התכונות פתוחות כעת.",
    verificationRejected: "האימות שלך נדחה. אנא שלח שוב את המסמכים שלך.",
    profileUpdated: "הפרופיל עודכן בהצלחה.",
    failedUpdateProfile: "עדכון הפרופיל נכשל.",
    differentEmail: "אנא הזן כתובת אימייל שונה.",
    confirmationLinkSent: "קישור אימות נשלח לכתובת האימייל החדשה. אנא אמת כדי להשלים את השינוי.",
    failedEmail: "עדכון האימייל נכשל.",
    passwordsDoNotMatch: "הסיסמאות אינן תואמות.",
    passwordTooShort: "הסיסמה חייבת להכיל לפחות 8 תווים.",
    passwordChanged: "הסיסמה שונתה בהצלחה.",
    failedPassword: "שינוי הסיסמה נכשל.",
    uploadDocument: "אנא העלה מסמך.",
    completeSteps: "אנא השלם את כל שלבי האימות.",
    documentsSubmitted: "המסמכים נשלחו לאימות. תקבל הודעה לאחר הבדיקה.",
    failedDocuments: "שליחת המסמכים נכשלה.",
    performanceTitle: "לוח ביצועים",
    auditLogTitle: "יומן ביקורת",
    auditLogDesc: "כל ההזמנות האלגוריתמיות שבוצעו בחשבונך.",
    accountSettingsTitle: "הגדרות חשבון",
    personalInformation: "מידע אישי",
    emailAddress: "כתובת אימייל",
    emailChangeNotice: "שינוי האימייל דורש אימות. קישור אימות יישלח לכתובת החדשה.",
    currentEmail: "אימייל נוכחי",
    confirmationSent: "אימות נשלח",
    tryDifferentEmail: "נסה אימייל אחר",
    continueToMethod: "המשך לבחירת שיטה",
    uploadHint: "PNG, JPG, PDF עד 10MB",
    twoFactorDesc: "הוסף שכבת אבטחה נוספת לחשבונך. השתמש באפליקציית אימות כמו Google Authenticator או Authy.",
    qrCode: "קוד QR",
    kycRequiredBanner: "נדרש KYC",
    assetsList: "BTC, ETH, SOL",
    networkLabel: "רשת",
    emailChangeInboxNotice: "אנא בדוק את תיבת הדואר הנכנס ולחץ על הקישור כדי להשלים את שינוי כתובת הדוא\"ל.",
    emailChangeSentTo: "קישור אימות נשלח אל {{email}}. אנא בדוק את תיבת הדואר הנכנס ולחץ על הקישור כדי להשלים את שינוי כתובת הדוא\"ל.",
    growthPerformanceMtd: "ביצועי צמיחה (מתחילת החודש)"
  },
  checkout: {
    summary: "סיכום",
    allocationTitle: "הקצאה",
    allocationSubtitle: "מוסדית",
    tierLabel: "רמת תשתית אלגוריתמית",
    billedMonthly: "חיוב חודשי",
    detailsTitle: "פרטי הקצאה",
    managedCapital: "הון מנוהל",
    setupFee: "דמי הקמה",
    waived: "מוותר",
    latency: "השהיית ביצוע",
    infrastructureTitle: "תשתית כלולה",
    realTimeMonitoring: "ניטור בזמן אמת",
    activeUponDeployment: "פעיל לאחר פריסה",
    totalDue: "סה״כ לתשלום",
    dedicatedNode: "צומת ייעודי",
    globalMarkets: "שווקים גלובליים",
    instantSetup: "הקמה מיידית",
    authRequired: "נדרש אימות",
    authDesc: "אנא התחבר או צור חשבון כדי להמשיך בהקצאה.",
    btnLogin: "התחבר להמשך",
    btnRegister: "צור חשבון",
    confirmDeployment: "אשר פריסה",
    deploymentDesc: "באישור, אתה מאשר את פריסת התשתית האלגוריתמית הקשורה לתוכנית {{plan}}.",
    proceedPayment: "המשך לתשלום מאובטח",
    secureGateway: "שער מאובטח",
    back: "חזרה",
    riskDisclosure: "גילוי סיכונים: מסחר אלגוריתמי כרוך בסיכון משמעותי להפסד. ביצועי עבר אינם מעידים על תוצאות עתידיות.",
    secureTransaction: "עסקה מאובטחת",
    paypalNote: "פרטי התשלום שלך מעובדים בצורה מאובטחת על ידי PayPal. Braxel Markets אינה מאחסנת את פרטי הכרטיס.",
    encryptionNote: "מוצפן בתקני AES-256 מוסדיים",
    verifying: "מאמת עסקה מוסדית...",
    loading: "טוען טרמינל...",
    globalInfra: "תשתית תשלומים גלובלית",
    qrCode: "קוד QR",
    allCards: "כל הכרטיסים",
    selectPaymentMethod: "בחר אמצעי תשלום",
    choosePayment: "בחר כיצד ברצונך לשלם",
    creditCard: "כרטיס אשראי",
    instantPayment: "תשלום מיידי",
    cardDesc: "Visa, Mastercard וכרטיסים נוספים",
    crypto: "קריפטו",
    cryptoLabel: "USDT, BTC, ETH",
    cryptoDesc: "העברה מהירה ומאובטחת בקריפטו",
    securePayment: "תשלום מאובטח",
    cardNumber: "מספר כרטיס",
    cardName: "שם על הכרטיס",
    cardExpiry: "תוקף",
    payNow: "שלם עכשיו",
    amountToPay: "סכום לתשלום",
    selectNetwork: "בחר רשת",
    yourAddress: "כתובת הפקדה",
    yourAddressPlaceholder: "הזן את כתובת ה-USDT שלך",
    important: "חשוב",
    cryptoNote: "שלח את הסכום המדויק כדי לקבל את התוכנית",
    sendExactAmount: "שלח בדיוק את הסכום הזה כדי למנוע עיכובים",
    confirmCrypto: "אשר עם קריפטו",
    copied: "הועתק!",
    cryptoPending: "התשלום נרשם! ממתין לאישור.",
    processing: "מעבד...",
    paymentSuccess: "התשלום אושר!",
    selectCountry: "בחר מדינה",
    searchCountry: "חפש מדינה...",
    phone: "מספר טלפון",
    fillAllFields: "מלא את כל השדות",
    phonePlaceholder: "999999999",
    cardNumberPlaceholder: "0000 0000 0000 0000",
    cardNamePlaceholder: "שם מלא",
    cardExpiryPlaceholder: "חודש/שנה",
    cvvPlaceholder: "123",
    cvvLabel: "CVC",
    paymentFailed: "התשלום נכשל",
    paymentError: "שגיאת תשלום",
    amountToSend: "סכום לשליחה",
    paymentReference: "כלול את האימייל שלך כהפניה לתשלום",
    wiseTransfer: "העברה בנקאית",
    bankDetails: "פרטי בנק",
    accountHolder: "בעל החשבון",
    accountNumber: "מספר חשבון",
    bankName: "שם הבנק",
    bankAddress: "כתובת הבנק",
    routingNumber: "מספר ניתוב",
    confirmWise: "אשר העברה",
    wiseDesc: "העבר ישירות לחשבון הבנק שלנו דרך Wise",
    wiseNote: "לאחר ביצוע ההעברה, לחץ על אישור למטה. החשבון שלך יופעל לאחר אימות (1-3 ימי עסקים).",
    wiseInternational: "העברה בינלאומית",
    openWise: "פתח את אתר Wise",
    transferInstructions: "הוראות העברה",
    lowFees: "עמלות נמוכות",
    noKyc: "נדרש KYC",
    anyCountry: "כל מדינה",
    wiseConfirmRequired: "נא אשר שביצעת את ההעברה",
    wiseConfirmText: "ביצעתי את ההעברה הבנקאית ומאשר שהסכום שנשלח תואם את מחיר התוכנית.",
    wisePaymentSuccess: "התשלום אושר! חשבונך מוגדר.",
    wiseStep1: "העתק את פרטי הבנק שלמטה",
    wiseStep2: "בצע העברה מהבנק או מחשבון Wise שלך",
    wiseStep3: "לחץ על אישור לאחר ביצוע ההעברה",
    subscriptionTitle: "מנוי",
    subscriptionSubtitle: "תוכנית שירות",
    serviceAccess: "גישה לשירות",
    confirmCard: "אשר כרטיס",
    redirecting: "מעביר לתשלום...",
    card: "כרטיס אשראי / חיוב",
    testModeBanner: "מצב בדיקה — ללא כסף אמיתי. ללא בנק אמיתי. ללא ארנק אמיתי. ללא הפעלה אמיתית.",
    startFailed: "לא ניתן להתחיל את התשלום. נסו שוב.",
    notConfigured: "התשלומים עדיין לא הוגדרו במלואם. נסו אמצעי אחר או פנו לתמיכה.",
    invalidPlanTitle: "תוכנית לא חוקית",
    invalidPlanDesc: "התוכנית שנבחרה אינה זמינה עוד. אנא בחרו תוכנית שוב.",
    swiftLabel: "SWIFT",
    referenceLabel: "הפניה",
  },
  legal: {
    badgeLegal: "משפטי",
    termsTitle: "תנאי שירות"
  },
  faq: {
    title: "שאלות נפוצות",
    badge: "שאלות נפוצות",
    q1: "האם נדרש ניסיון קודם?",
    a1: "לא. התשתית שלנו אוטומטית לחלוטין. עליך רק לבחור את רמת ההקצאה ולעקוב אחר הביצועים דרך הטרמינל.",
    q2: "מהם הסיכונים הכרוכים?",
    a2: "כמו בכל שוק פיננסי, קיימים סיכוני הפסד הון עקב תנודתיות. אנו משתמשים בפרוטוקולים מתקדמים להגנת ההון.",
    q3: "איך המערכת עובדת?",
    a3: "האלגוריתמים הקנייניים שלנו מבצעים אסטרטגיות כמותיות בתדירות גבוהה בשווקים גלובליים בדיוק של מילישניות.",
    q4: "האם אפשר לבטל את התוכנית?",
    a4: "כן. ניתן לבקש ביטול ומשיכת הון בכל עת דרך פרוטוקולי לוח הבקרה."
  },
  diffs: {
    title: "למה BRAXEL MARKETS?",
    badge: "יתרונות",
    t1: "טכנולוגיה קניינית",
    d1: "רשתות עצביות שתוכננו לביצוע ברמה מוסדית.",
    t2: "אוטומציה מלאה",
    d2: "ניהול אלגוריתמי 24/7 ללא הטיה רגשית אנושית.",
    t3: "גישה מופשטת",
    d3: "תשתית מוסדית נגישה דרך טרמינל אינטואיטיבי.",
    t4: "רמה מקצועית",
    d4: "חיבור ישיר למאגרי נזילות גלובליים בהשהיה אולטרא-נמוכה."
  },
  signals: {
    title: "ביצוע",
    subtitle: "אלגוריתמי",
    badge: "טרמינל בזמן אמת",
    desc: "עקוב אחר התשתית הקניינית שלנו בזמן אמת. כל אות מעובד על ידי הרשתות העצביות שלנו בדיוק של מילישניות.",
    asset: "נכס",
    type: "סוג",
    entry: "כניסה",
    profit: "רווח",
    status: "סטטוס",
    active: "פעיל",
    completed: "הושלם",
    institutionalVerification: "אימות מוסדי",
    realtimeFeed: "זרם נתונים בזמן אמת ממאגרי נזילות גלובליים.",
    liveTerminal: "מסוף חי",
    connected: "מחובר"
  },
  application: {
    title: "בקשה",
    subtitle: "שליחה",
    plan_selected: "התוכנית שנבחרה",
    billed_monthly: "חיוב חודשי",
    plan_description: "אתה עומד לרכוש את מנוי השירות {{plan}}.",
    plan_price_detail: "תשלום חודשי: {{price}} (משולם מדי חודש)",
    full_name: "שם מלא",
    full_name_placeholder: "הזן את שמך המלא",
    email: "כתובת אימייל",
    email_placeholder: "הזן את האימייל שלך",
    address_line1: "כתובת — שורה 1",
    address_line1_placeholder: "רחוב ומספר בית",
    address_line2: "פרטים נוספים",
    address_line2_placeholder: "דירה, קומה, יחידה וכו' (אופציונלי)",
    city: "עיר",
    city_placeholder: "עיר",
    region: "מדינה / אזור",
    region_placeholder: "מדינה או אזור",
    postal_code: "מיקוד",
    postal_code_placeholder: "מיקוד",
    country: "מדינה",
    country_placeholder: "מדינה",
    phone: "טלפון",
    phone_placeholder: "מספר טלפון",
    terms_accepted: "אני מסכים לתנאי השירות",
    privacy_accepted: "אני מסכים למדיניות הפרטיות",
    viewTerms: "הצג תנאים",
    viewPrivacy: "הצג מדיניות פרטיות",
    customer_note: "הערת לקוח (אופציונלי)",
    customer_note_placeholder: "כל מידע נוסף שתרצה שנדע",
    note_limit: "מקסימום {{count}} תווים",
    characters: "תווים",
    submitting: "שולח...",
    submit: "שלח בקשה",
    errors: {
      full_name_required: "שם מלא הוא חובה",
      email_required: "אימייל הוא חובה",
      email_invalid: "כתובת אימייל לא חוקית",
      address_line1_required: "כתובת היא חובה",
      city_required: "עיר היא חובה",
      country_required: "מדינה היא חובה",
      terms_required: "עליך להסכים לתנאי השירות",
      privacy_required: "עליך להסכים למדיניות הפרטיות",
      note_too_long: "ההערה חייבת להיות עד 500 תווים",
      submit_failed: "השליחה נכשלה. נסה שוב."
    }
  },
  checkoutSuccess: {
    verifying: "מאמת תשלום…",
    backToPricing: "חזרה לתוכניות",
    couldNotVerify: "טרם ניתן היה לאמת את התשלום שלך",
    couldNotVerifyDesc: "אם השלמת את התשלום, אל דאגה — התשלום מעובד וחשבונך יופעל בקרוב. אנא רענן דף זה בעוד רגע.",
    verifiedBadge: "מאומת",
    paymentCompleted: "התשלום הושלם",
    activationNotice: "חשבונך יופעל תוך מספר דקות.",
    paymentId: "מזהה תשלום",
    applicationId: "מזהה בקשה",
    securityNotice: "למען ביטחונך, חשבונות מופעלים ידנית על ידי מפעיל לאחר אימות התשלום. תקבל גישה ברגע שהבדיקה תסתיים.",
    goToDashboard: "מעבר ללוח הבקרה",
    contactSupport: "פנה לתמיכה",
    verifyingBadge: "מאמת",
    paymentReceived: "התשלום התקבל. אנו מאמתים את התשלום.",
    beingVerified: "התשלום שלך מאומת. דף זה יתעדכן אוטומטית לאחר אישור התשלום. אל תסגור חלון זה.",
    currentStatus: "סטטוס נוכחי",
    urlSecurityNotice: "למען ביטחונך, דף זה אינו מסמן תשלום כהושלם על בסיס הכתובת בלבד. אנו ממתינים לאישור מצד השרת."
  },
  termsPage: {
    title: "תנאי שירות",
    entityTitle: "הישות המתקשרת",
    entityText: "[שם הישות המשפטית, מספר רישום, סמכות שיפוט]",
    descriptionTitle: "תיאור השירות",
    descriptionText: "Braxel Markets מספקת תשתית מסחר אלגוריתמית ברמה מוסדית ושירותים נלווים דרך הפלטפורמה שלה.",
    feesTitle: "עמלות ותשלומים",
    feesText: "העמלות עבור השירותים שלנו מפורטות בעמוד התמחור ועשויות להשתנות בהודעה מראש. אמצעי התשלום כוללים העברה בנקאית, כרטיס אשראי ומטבע קריפטוגרפי.",
    eligibilityTitle: "זכאות",
    eligibilityText: "השירותים שלנו זמינים ליחידים ולתאגידים בני 18 ומעלה העומדים בדרישות ה-Know Your Customer (KYC) ומניעת הלבנת הון (AML) שלנו.",
    accountTerminationTitle: "סגירת חשבון",
    accountTerminationText: "כל צד רשאי לסגור את החשבון בהודעה מראש בכתב של [PLACEHOLDER: תקופת הודעה, למשל 30 יום]. Braxel Markets רשאית לסגור את החשבון באופן מיידי במקרה של הפרת התנאים, פעילות בלתי חוקית או דרישות רגולטוריות.",
    limitationOfLiabilityTitle: "הגבלת אחריות",
    limitationOfLiabilityText: "במידה המרבית המותרת בחוק, Braxel Markets לא תישא באחריות לכל נזק עקיף, מקרי, מיוחד, תוצאתי או עונשי, או לכל אובדן של נתונים, שימוש, מוניטין או הפסדים בלתי מוחשיים אחרים, הנובעים מגישתך לשירותים שלנו או משימושך בהם.",
    disputeResolutionTitle: "יישוב סכסוכים ודין חל",
    disputeResolutionText: "תנאים אלה ייקבעו ויפורשו בהתאם לחוקי [PLACEHOLDER: סמכות שיפוט]. כל מחלוקת הנובעת מתנאים אלה או הקשורה להם תוגש לסמכות השיפוט הבלעדית של בתי המשפט של [PLACEHOLDER: סמכות שיפוט].",
    changesToTermsTitle: "שינויים בתנאים אלה",
    changesToTermsText: "אנו שומרים לעצמנו את הזכות לשנות או להחליף תנאים אלה בכל עת. אם השינוי מהותי, נודיע לפחות [PLACEHOLDER: תקופת הודעה, למשל 30 יום] לפני כניסת התנאים החדשים לתוקף. מה נחשב שינוי מהותי ייקבע לפי שיקול דעתנו הבלעדי.",
    effectiveDateTitle: "תאריך תחילה",
    effectiveDateText: "תאריך תחילה: [PLACEHOLDER: תאריך]",
    contactTitle: "צור קשר",
    contactText: "לשאלות בנוגע לתנאים אלה, אנא צור קשר בכתובת [PLACEHOLDER: אימייל או כתובת ליצירת קשר]."
  },
  legalDraftBanner: "עמוד זה הוא טיוטה בבדיקה משפטית ואינו סופי עדיין.",
  notFound: {
    title: "404",
    message: "מצטערים, הדף שחיפשת אינו קיים.",
    returnHome: "חזרה לדף הבית"
  },
  authCallback: {
    confirmingTitle: "מאמת את החשבון שלך...",
    confirmingDesc: "אנא המתן בזמן שאנו מאמתים את האימייל שלך.",
    confirmedTitle: "האימייל אומת!",
    confirmedDesc: "החשבון שלך אומת בהצלחה.",
    redirecting: "מעביר להתחברות...",
    failedTitle: "האימות נכשל",
    goToLogin: "עבור להתחברות",
    invalidLink: "קישור אימות שגוי או שפג תוקפו",
    failedConfirm: "אימות האימייל נכשל"
  },
  paymentsDisabled: {
    title: "התשלומים מושבתים כעת.",
    desc: "מערכת התשלומים טרם פעילה. להפעלת תשלומים, צור קשר עם המפעיל בכתובת",
    managedBy: "עיבוד התשלומים מנוהל אך ורק על ידי מפעיל הפלטפורמה. אם יש לך שאלות בנוגע להקצאה ממתינה, אנא צור קשר עם התמיכה.",
    viewPlans: "צפה בתוכניות ההשקעה"
  },
  checkoutStatus: {
    created: "נוצר",
    pending: "ממתין לתשלום",
    processing: "אימות ברשת",
    confirmed: "מאושר",
    failed: "נכשל",
    rejected: "נדחה",
    refunded: "הוחזר",
    disputed: "במחלוקת",
    canceled: "בוטל",
    pending_manual: "ממתין לבדיקה ידנית"
  },
  legalReview: {
    title: "טיוטה בבדיקה משפטית"
  },
  operator: {
    title: "מפעיל",
    subtitle: "לוח בקרה",
    description: "סקור והפעל בקשות לקוחות ממתינות.",
    no_pending_applications: "אין בקשות ממתינות.",
    plan: "תוכנית",
    amount: "סכום",
    country: "מדינה",
    customer_note: "הערת לקוח",
    activate_account: "הפעל חשבון",
    activating: "מפעיל...",
    reject_or_request_info: "דחה / בקש מידע",
    rejecting: "דוחה...",
    reject_application: "דחה בקשה",
    reject_reason_prompt: "ספק סיבה לדחייה או את המידע הנדרש.",
    reject_reason_placeholder: "סיבה...",
    cancel: "ביטול",
    reject: "דחה",
    errors: {
      activation_failed: "הפעלת הבקשה נכשלה.",
      rejection_failed: "דחיית הבקשה נכשלה."
    },
    status: {
      activation_pending: "ממתין להפעלה",
      account_active: "חשבון פעיל",
      rejected: "נדחה",
      manual_review: "בדיקה ידנית"
    }
  },
  profitCalculator: {
    badge: "תחזית",
    titleA: "מחשבון",
    titleB: "רווח",
    initialAllocation: "הקצאה ראשונית",
    monthlyProfit: "רווח חודשי משוער",
    annualProfit: "רווח שנתי משוער",
    riskTitle: "ניהול סיכונים",
    riskDesc: "תחזיות המבוססות על ביצועים אלגוריתמיים היסטוריים עם מגבלות ירידה מחמירות.",
    instantTitle: "פריסה מיידית",
    instantDesc: "ההון שלך מתחיל לפעול תוך דקות משילוב התשתית.",
    disclaimer: "* כתב ויתור: ביצועי עבר אינם מבטיחים תוצאות עתידיות. התחזיות להמחשה בלבד."
  },
  meta: {
    home: {
      title: "Braxel Markets | ניהול הון אלגוריתמי ברמה מוסדית",
      description: "תשתית מסחר אלגוריתמית ברמה מוסדית, גישה להון של חברות פרופ, הרשאת CopyTrade ואוטומציה מלאה של MetaTrader עבור XAU/USD ו-US500."
    },
    pricing: {
      title: "מסלולים והון מנוהל | Braxel Markets",
      description: "השווה בין מסלולי מסחר אלגוריתמיים והקצאות הון מנוהל. הון מנוהל נקוב תמיד בדולר ארה\"ב."
    },
    about: {
      title: "אודות Braxel Markets | מסחר אלגוריתמי",
      description: "Braxel Markets בונה תשתית מסחר אלגוריתמית ברמה מוסדית ומנהלת הון עם בקרות סיכון מחמירות."
    },
    howItWorks: {
      title: "איך זה עובד | Braxel Markets",
      description: "גלה כיצד Braxel Markets מחברת את ההון שלך לאסטרטגיות MetaTrader אוטומטיות לחלוטין עבור XAU/USD ו-US500."
    },
    contact: {
      title: "צור קשר | Braxel Markets",
      description: "צור קשר עם צוות Braxel Markets בנושא תשתית מסחר אלגוריתמית והון מנוהל."
    },
    terms: {
      title: "תנאי שירות | Braxel Markets",
      description: "קרא את תנאי השירות לשימוש ב-Braxel Markets."
    },
    privacy: {
      title: "מדיניות פרטיות | Braxel Markets",
      description: "למד כיצד Braxel Markets אוספת, משתמשת ומגנה על הנתונים האישיים שלך."
    },
    disclaimer: {
      title: "גילוי סיכונים | Braxel Markets",
      description: "גילוי סיכונים חשוב עבור מסחר אלגוריתמי והון מנוהל עם Braxel Markets."
    }
  },
  kyc: {
    country: {
      BR: "ברזיל",
      US: "ארצות הברית",
      GB: "הממלכה המאוחדת",
      DE: "גרמניה",
      FR: "צרפת",
      ES: "ספרד",
      IT: "איטליה",
      PT: "פורטוגל",
      RU: "רוסיה",
      CN: "סין",
      JP: "יפן",
      IN: "הודו",
      OTHER: "מדינות אחרות"
    },
    method: {
      BR: {
        id_card: "תעודת זהות לאומית (RG/CPF)",
        drivers_license: "רישיון נהיגה"
      },
      US: {
        id_card: "תעודת זהות מדינתית"
      },
      GB: {
        id_card: "תעודה לאומית / רישיון נהיגה",
        biometric: "היתר שהייה ביומטרי"
      },
      DE: {
        drivers: "רישיון נהיגה",
        passport: "דרכון / Reisepass"
      },
      FR: {
        residence: "היתר שהייה"
      },
      RU: {
        foreign_passport: "דרכון חוץ"
      },
      OTHER: {
        passport: "דרכון בינלאומי",
        national_id: "תעודת זהות לאומית"
      }
    },
    doc: {
      rg: {
        desc: "תעודת זהות לאומית ברזילאית"
      },
      cpf: {
        desc: "כרטיס רישום משלם המסים הברזילאי"
      },
      passport: {
        desc: "דרכון בתוקף עם עמוד תמונה",
        name: "דרכון"
      },
      cnh: {
        desc: "רישיון נהיגה ברזילאי",
        name: "CNH (רישיון נהיגה)"
      },
      state_id: {
        desc: "רישיון נהיגה או תעודה ממשלתית",
        name: "תעודת זהות מדינתית"
      },
      passport_uk: {
        desc: "דרכון בריטי בתוקף"
      },
      driving_license_uk: {
        desc: "רישיון נהיגה בריטי",
        name: "רישיון נהיגה"
      },
      brp: {
        desc: "היתר שהייה ביומטרי בריטי",
        name: "היתר שהייה ביומטרי"
      },
      personalausweis: {
        desc: "תעודת זהות גרמנית"
      },
      passport_de: {
        desc: "דרכון גרמני בתוקף"
      },
      fuehrerschein: {
        desc: "רישיון נהיגה גרמני"
      },
      cni: {
        desc: "תעודת זהות לאומית צרפתית"
      },
      passport_fr: {
        desc: "דרכון צרפתי בתוקף"
      },
      titre_sejour: {
        desc: "היתר שהייה צרפתי"
      },
      dni: {
        desc: "תעודת זהות לאומית ספרדית"
      },
      nie: {
        desc: "מספר זיהוי לזרים"
      },
      passport_es: {
        desc: "דרכון בתוקף"
      },
      carta_id: {
        desc: "תעודת זהות איטלקית"
      },
      passport_it: {
        desc: "דרכון איטלקי בתוקף"
      },
      cc: {
        desc: "כרטיס אזרח פורטוגלי"
      },
      passport_pt: {
        desc: "דרכון פורטוגלי בתוקף"
      },
      passport_ru: {
        desc: "דרכון פנימי רוסי"
      },
      foreign_passport_ru: {
        desc: "דרכון חוץ רוסי",
        name: "דרכון חוץ"
      },
      id_card_cn: {
        desc: "תעודת זהות סינית"
      },
      passport_cn: {
        desc: "דרכון בתוקף"
      },
      passport_jp: {
        desc: "דרכון יפני בתוקף"
      },
      zairyu: {
        desc: "כרטיס תושב"
      },
      aadhaar: {
        desc: "כרטיס זיהוי ייחודי",
        name: "כרטיס Aadhaar"
      },
      voter_id: {
        desc: "תעודת זהות בחירות עם תמונה",
        name: "תעודת בוחר"
      },
      passport_in: {
        desc: "דרכון הודי בתוקף"
      },
      passport_intl: {
        desc: "דרכון בתוקף מארץ מוצאך"
      },
      national_id_intl: {
        desc: "תעודת זהות לאומית ממשלתית",
        name: "תעודת זהות לאומית"
      }
    },
    methodName: {
      id_card: "תעודת זהות לאומית",
      passport: "דרכון",
      drivers_license: "רישיון נהיגה",
      drivers: "רישיון נהיגה",
      biometric: "היתר שהייה ביומטרי",
      residence: "היתר שהייה",
      foreign_passport: "דרכון חוץ",
      national_id: "תעודת זהות לאומית"
    }
  },
  errorBoundary: {
    title: "משהו השתבש",
    message: "לא ניתן לטעון את הדף הזה. נסה שוב.",
    retry: "טען מחדש את הדף",
    home: "חזרה לדף הבית"
  }
};

const resources = {
  en: { translation: enTranslation },
  pt: { translation: ptTranslation },
  it: { translation: itTranslation },
  es: { translation: esTranslation },
  fr: { translation: frTranslation },
  de: { translation: deTranslation },
  ru: { translation: ruTranslation },
  zh: { translation: zhTranslation },
  ja: { translation: jaTranslation },
  ar: { translation: arTranslation },
  he: { translation: heTranslation },
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    // Collapse regional variants (e.g. navigator "en-US", "pt-BR") to the base
    // code so <html lang> is correct and the language-switcher active state
    // matches the codes in supportedLanguages.
    supportedLngs: supportedLanguages.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    debug: false,
    detection: {
      // querystring first so `?lng=<code>` links (used by hreflang alternates)
      // take precedence over a previously stored preference.
      order: ['querystring', 'localStorage', 'navigator', 'cookie', 'sessionStorage'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
      // The detector returns regional variants ("en-US", "pt-BR"); collapse
      // them to the base code so i18n.language matches supportedLanguages.
      convertDetectedLanguage: (lng) => lng.split('-')[0]
    },
    interpolation: {
      escapeValue: false
    },
    returnEmptyString: true
  }, (err) => {
    if (err) return console.error(err);
    applyDirection(i18n.language);
  });

// The languageChanged handler does not fire for the initial detected language,
// so a persisted/detected ar|he load would otherwise stay LTR until the first
// manual switch.
function applyDirection(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' || lng === 'he' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', applyDirection);


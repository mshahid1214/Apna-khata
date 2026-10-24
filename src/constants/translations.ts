import { Language, Role, Commodity, WeightUnit, SlipType } from '../types';

export const TRANSLATIONS: Record<Language, {
  appName: string;
  tabs: {
    home: string;
    khata: string;
    slips: string;
    rates: string;
    more: string;
  };
  roles: Record<Role, { title: string; desc: string; badge: string }>;
  commodities: Record<Commodity, string>;
  units: Record<WeightUnit, string>;
  slipTypes: Record<SlipType, { title: string; subtitle: string; code: string }>;
  actions: {
    createSlip: string;
    addLedgerEntry: string;
    addParty: string;
    save: string;
    cancel: string;
    printSlip: string;
    shareSlip: string;
    listenAudio: string;
    stopAudio: string;
    close: string;
    switchRole: string;
    search: string;
    filter: string;
    refreshSample: string;
    installApp: string;
  };
  khata: {
    title: string;
    subtitle: string;
    partySelect: string;
    allParties: string;
    debit: string; // بنام
    credit: string; // جمع
    balance: string; // بقایا
    youOwe: string; // ہم نے دینے ہیں
    theyOwe: string; // ہم نے لینے ہیں
    clearBalance: string; // حساب برابر
    entryDate: string;
    description: string;
    amount: string;
    slipReference: string;
    statementStamp: string;
  };
  slipForm: {
    title: string;
    slipNumber: string;
    date: string;
    party: string;
    commodity: string;
    variety: string;
    grossWeight: string;
    tareWeight: string;
    netWeight: string;
    unit: string;
    petiWeight: string;
    ratePerUnit: string;
    grossTotal: string;
    commission: string;
    kantaFee: string;
    laborFee: string;
    freightFee: string;
    advanceAdjusted: string;
    netPayable: string;
    vehicleNo: string;
    chamberNo: string;
    notes: string;
    stampAndSign: string;
    verifiedStampText: string;
  };
  rates: {
    title: string;
    subtitle: string;
    rateBoard: string;
    mandiNotice: string;
    configHeader: string;
    manWeightLabel: string;
    commissionPercentLabel: string;
    kantaFeeLabel: string;
    laborFeeLabel: string;
    trendUp: string;
    trendDown: string;
    trendStable: string;
    ratePerMan: string;
    saveRates: string;
  };
  more: {
    title: string;
    languageSelect: string;
    activeRole: string;
    storageInfo: string;
    resetSampleData: string;
    sampleDataResetConfirm: string;
    audioVoiceTest: string;
    testSpeech: string;
    aboutTitle: string;
    aboutBody: string;
    installPrompt: string;
    offlineMode: string;
  };
  firstRun: {
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    next: string;
    getStarted: string;
    skip: string;
  };
  errors: {
    nameRequired: string;
    validAmount: string;
    validWeight: string;
    genericError: string;
    sampleNotice: string;
  };
}> = {
  ur: {
    appName: "اپنا کھاتہ",
    tabs: {
      home: "شروع / ہوم",
      khata: "کھاتہ رجسٹر",
      slips: "پرچیاں",
      rates: "ریٹس و منڈی",
      more: "مزید اختیارات",
    },
    roles: {
      farmer: { title: "زمیندار / کسان", desc: "فصل کی فروخت، وزن اور پیشگی رقم کا حساب", badge: "کسان کھاتہ" },
      arhti: { title: "آڑھتی / کمیشن ایجنٹ", desc: "بولی، کٹوتیاں، کمیشن اور خریداروں کے کھاتے", badge: "آڑھت رجسٹر" },
      cold_storage: { title: "کولڈ اسٹوریج آپریٹر", desc: "چیمبر، آمد، وزن اور یومیہ / ماہانہ کرایہ چلان", badge: "گودام چلان" },
      transporter: { title: "ٹرانسپورٹر / گاڑی والا", desc: "بلٹی، ڈیزل خرچ، مال برداری اور باقی کرایہ", badge: "گاڑی بلٹی" },
      buyer: { title: "خریدار / بیوپاری", desc: "خریداری پرچی، منڈی ٹیکس، اور ادائیگی کھاتہ", badge: "خرید پرچی" },
    },
    commodities: {
      mango: "آم (چونسا / سندھڑی)",
      citrus: "کنو / مالٹا",
      dates: "کھجور (اصیل)",
      cotton: "کپاس / پھٹی",
    },
    units: {
      kg: "کلوگرام (Kg)",
      man: "من (40 کلو)",
      ton: "میٹرک ٹن",
      peti: "لکڑی پیٹی / کریٹ",
    },
    slipTypes: {
      boli: { title: "بولی و نیلامی پرچی", subtitle: "آڑھت بولی، کمیشن اور خالص رقم", code: "BOLI" },
      kanta: { title: "کانٹا وزن پرچی", subtitle: "گاڑی وزن، خالی گاڑی اور خالص وزن", code: "KANTA" },
      challan: { title: "کولڈ اسٹوریج چلان", subtitle: "چیمبر ذخیرہ رسید اور کرایہ", code: "CHALLAN" },
      transport: { title: "ٹرانسپورٹ بلٹی", subtitle: "مال برداری بلٹی اور ڈرائیور رسید", code: "FREIGHT" },
    },
    actions: {
      createSlip: "نئی پرچی بنائیں",
      addLedgerEntry: "کھاتے میں نیا اندراج",
      addParty: "نیا کھاتہ دار شامل کریں",
      save: "محفوظ کریں",
      cancel: "منسوخ",
      printSlip: "پرچی پرنٹ / تصویر محفوظ کریں",
      shareSlip: "واٹس ایپ شیئر",
      listenAudio: "آواز میں سنیں",
      stopAudio: "آواز روکیں",
      close: "بند کریں",
      switchRole: "کردار تبدیل کریں",
      search: "نام یا فون سے تلاش کریں...",
      filter: "فلٹر",
      refreshSample: "نمونہ ڈیٹا دوبارہ لوڈ کریں",
      installApp: "فون میں انسٹال کریں",
    },
    khata: {
      title: "روایتی بہی کھاتہ",
      subtitle: "ڈیبٹ، کریڈٹ اور بقایا جات کا صاف حساب",
      partySelect: "کھاتہ دار منتخب کریں",
      allParties: "تمام کھاتہ دار",
      debit: "بنام (ہم نے دیے)",
      credit: "جمع (ہم نے لیے / فصل)",
      balance: "کل بقایا",
      youOwe: "ہم نے دینے ہیں",
      theyOwe: "ہم نے لینے ہیں",
      clearBalance: "حساب برابر ہے",
      entryDate: "تاریخ اندراج",
      description: "تفصیل / وجہ ادائیگی",
      amount: "رقم (روپے)",
      slipReference: "حوالہ پرچی نمبر",
      statementStamp: "مہر کھاتہ تصدیق شدہ",
    },
    slipForm: {
      title: "نئی پرچی اندراج",
      slipNumber: "پرچی نمبر",
      date: "تاریخ",
      party: "کھاتہ دار / پارٹی",
      commodity: "جنس / فصل",
      variety: "قسم / کوالٹی",
      grossWeight: "کل وزن (بشمول گاڑی/باردانہ)",
      tareWeight: "خالی گاڑی / باردانہ وزن",
      netWeight: "خالص وزن",
      unit: "پیمانہ وزن",
      petiWeight: "فی پیٹی وزن (کلو)",
      ratePerUnit: "ریٹ فی من / فی کلو (روپے)",
      grossTotal: "کل مالیت (روپے)",
      commission: "آڑھت کمیشن",
      kantaFee: "کانٹا پرچی فیس",
      laborFee: "مزدوری / پلائی",
      freightFee: "کرایہ مال برداری",
      advanceAdjusted: "پیشگی رقم منہا",
      netPayable: "خالص واجب الادا رقم",
      vehicleNo: "گاڑی نمبر",
      chamberNo: "چیمبر نمبر",
      notes: "خاص نوٹ / ریمارکس",
      stampAndSign: "مہر منڈی و دستخط",
      verifiedStampText: "منظور شدہ منڈی رسید",
    },
    rates: {
      title: "آج کے منڈی ریٹس",
      subtitle: "جنوبی پنجاب کی غلہ و سبزی منڈیوں کے تازہ ترین نرخ",
      rateBoard: "یومیہ بھاؤ بورڈ",
      mandiNotice: "نوٹ: یہ تمام ریٹس برائے نمونہ ہیں اور مکمل طور پر تبدیل کیے جا سکتے ہیں۔",
      configHeader: "کمیشن اور اوزان کی ترتیبات",
      manWeightLabel: "ایک من کا وزن (کلو)",
      commissionPercentLabel: "معمول کا کمیشن فیصد (%)",
      kantaFeeLabel: "عام کانٹا فیس (روپے)",
      laborFeeLabel: "فی من مزدوری (روپے)",
      trendUp: "تیزی (بڑھوتری)",
      trendDown: "مندی (کمی)",
      trendStable: "مستحکم",
      ratePerMan: "روپے فی من",
      saveRates: "ترتیبات محفوظ کریں",
    },
    more: {
      title: "سیٹنگز اور مدد",
      languageSelect: "زبان کا انتخاب",
      activeRole: "موجودہ فعال کردار",
      storageInfo: "ڈیٹا سٹوریج: موبائل میں محفوظ (آف لائن تیار)",
      resetSampleData: "نمونہ ڈیٹا دوبارہ سیٹ کریں",
      sampleDataResetConfirm: "کیا آپ واقعی تمام نمونہ ڈیٹا دوبارہ سیٹ کرنا چاہتے ہیں؟",
      audioVoiceTest: "صوتی معاون کا جائزہ",
      testSpeech: "اردو آواز ٹیسٹ کریں",
      aboutTitle: "اپنا کھاتہ کے بارے میں",
      aboutBody: "جنوبی پنجاب کے کاشتکاروں، آڑھتیوں اور تاجروں کے لیے آسان اور محفوظ بہی کھاتہ ایپ۔",
      installPrompt: "ایپ کو ہوم اسکرین پر لگائیں تاکہ بغیر انٹرنیٹ بھی چلے۔",
      offlineMode: "آف لائن موڈ — انٹرنیٹ کے بغیر بھی کام جاری رکھیے۔",
    },
    firstRun: {
      step1Title: "کاغذی پرچیاں بھول جائیے",
      step1Desc: "بولی، کانٹا اور گودام کی تمام پرچیاں اب آپ کے فون میں محفوظ اور مہر شدہ ہیں۔",
      step2Title: "آواز میں سنیے اور سمجھیے",
      step2Desc: "ہر پرچی اور کھاتے کو ایک کلک سے اردو میں بلند آواز سے سنیں، کم پڑھے لکھے بھائیوں کے لیے خصوصی سہولت۔",
      step3Title: "بغیر انٹرنیٹ، دھوپ میں بھی واضح",
      step3Desc: "منڈی کی کڑی دھوپ میں تیز روشنی والے بڑے بٹن، اور بغیر انٹرنیٹ پورا ڈیٹا آپ کے ہاتھ میں۔",
      next: "اگلا قدم",
      getStarted: "کھاتہ شروع کریں",
      skip: "چھوڑیں",
    },
    errors: {
      nameRequired: "براہ کرم کھاتہ دار کا نام درج کیجیے۔",
      validAmount: "درست رقم لکھیے۔",
      validWeight: "درست وزن درج کیجیے۔",
      genericError: "کوئی خرابی پیش آ گئی۔ دوبارہ کوشش کیجیے۔",
      sampleNotice: "یہ نمونہ ڈیٹا ہے، کسی بھی وقت ایڈٹ کر سکتے ہیں۔",
    },
  },
  'ur-Latn': {
    appName: "Apna Khata",
    tabs: {
      home: "Home / Shuru",
      khata: "Khata Register",
      slips: "Parchiyan",
      rates: "Rates & Mandi",
      more: "Mazeed",
    },
    roles: {
      farmer: { title: "Zameendar / Kisan", desc: "Fasal bikri, wazan aur paishgi ka hisaab", badge: "Kisan Khata" },
      arhti: { title: "Arhti / Commission Agent", desc: "Boli, katautiyan, commission aur khareedar khata", badge: "Arhat Register" },
      cold_storage: { title: "Cold Storage Operator", desc: "Chamber, aamad, wazan aur kiraya challan", badge: "Godown Challan" },
      transporter: { title: "Transporter / Gari Wala", desc: "Bilty, diesel kharch aur bacha kiraya", badge: "Gari Bilty" },
      buyer: { title: "Khareedar / Beopari", desc: "Khareed parchi, mandi tax aur adaigi khata", badge: "Khareed Parchi" },
    },
    commodities: {
      mango: "Aam (Chaunsa / Sindhri)",
      citrus: "Kinnow / Malta",
      dates: "Khajoor (Aseel)",
      cotton: "Kapaas / Phutti",
    },
    units: {
      kg: "Kilogram (Kg)",
      man: "Man (40 Kg)",
      ton: "Metric Ton",
      peti: "Wood Peti / Crate",
    },
    slipTypes: {
      boli: { title: "Boli & Auction Slip", subtitle: "Arhat boli, commission aur saafi raqam", code: "BOLI" },
      kanta: { title: "Kanta Weighing Slip", subtitle: "Gari wazan, khali gari aur saafi wazan", code: "KANTA" },
      challan: { title: "Cold Storage Challan", subtitle: "Chamber zakhira receipt aur kiraya", code: "CHALLAN" },
      transport: { title: "Transport Bilty", subtitle: "Maal bardari bilty aur driver receipt", code: "FREIGHT" },
    },
    actions: {
      createSlip: "Nayi Parchi Banayein",
      addLedgerEntry: "Khate Mein Naya Indraj",
      addParty: "Naya Banda Shamil Karein",
      save: "Mehfooz Karein",
      cancel: "Mansookh",
      printSlip: "Parchi Print / Tasveer Save",
      shareSlip: "WhatsApp Share",
      listenAudio: "Awaaz Mein Sunein",
      stopAudio: "Awaaz Rokein",
      close: "Band Karein",
      switchRole: "Kirdar Badlein",
      search: "Naam ya phone se talash karein...",
      filter: "Filter",
      refreshSample: "Sample Data Dobara Load Karein",
      installApp: "Phone Mein Install Karein",
    },
    khata: {
      title: "Rivayati Bahi Khata",
      subtitle: "Debit, Credit aur baqaya ka saaf hisaab",
      partySelect: "Khatedar Muntakhib Karein",
      allParties: "Tamam Khatedar",
      debit: "Banaam (Humne diye)",
      credit: "Jamma (Humne liye / Fasal)",
      balance: "Kul Baqaya",
      youOwe: "Humne dene hain",
      theyOwe: "Humne lene hain",
      clearBalance: "Hisaab barabar hai",
      entryDate: "Tareekh Indraj",
      description: "Tafseel / Wajah Adaigi",
      amount: "Raqam (PKR)",
      slipReference: "Parchi No. Hawala",
      statementStamp: "Mohar Tasdeeq Shuda",
    },
    slipForm: {
      title: "Nayi Parchi Indraj",
      slipNumber: "Parchi No.",
      date: "Tareekh",
      party: "Khatedar / Party",
      commodity: "Jins / Fasal",
      variety: "Qisam / Quality",
      grossWeight: "Kul Wazan (Gari samet)",
      tareWeight: "Khali Gari / Bardana Wazan",
      netWeight: "Saafi Wazan",
      unit: "Paimana Wazan",
      petiWeight: "Fi Peti Wazan (Kg)",
      ratePerUnit: "Rate Fi Man / Fi Kg (PKR)",
      grossTotal: "Kul Maaliyat (PKR)",
      commission: "Arhat Commission",
      kantaFee: "Kanta Parchi Fee",
      laborFee: "Mazdoori / Pallai",
      freightFee: "Kiraya Maal Bardari",
      advanceAdjusted: "Paishgi Raqam Minha",
      netPayable: "Saafi Wajib-ul-Ada Raqam",
      vehicleNo: "Gari Number",
      chamberNo: "Chamber Number",
      notes: "Khas Note / Remarks",
      stampAndSign: "Mohar Mandi & Dastakhat",
      verifiedStampText: "Manzoor Shuda Mandi Receipt",
    },
    rates: {
      title: "Aaj Ke Mandi Rates",
      subtitle: "South Punjab mandi ke taza tareen nirkkh",
      rateBoard: "Daily Bhaao Board",
      mandiNotice: "Note: Ye tamam rates SAMPLE hain aur user-editable hain.",
      configHeader: "Commission Aur Wazan Settings",
      manWeightLabel: "Ek Man Ka Wazan (Kg)",
      commissionPercentLabel: "Aam Commission (%)",
      kantaFeeLabel: "Kanta Fee (PKR)",
      laborFeeLabel: "Fi Man Mazdoori (PKR)",
      trendUp: "Tezi (Izafa)",
      trendDown: "Mandi (Kami)",
      trendStable: "Mustahkam",
      ratePerMan: "PKR Fi Man",
      saveRates: "Settings Save Karein",
    },
    more: {
      title: "Settings & Madad",
      languageSelect: "Zaban Ka Intekhab",
      activeRole: "Maujooda Kirdar",
      storageInfo: "Storage: Mobile mein mehfooz (Offline ready)",
      resetSampleData: "Sample Data Reset Karein",
      sampleDataResetConfirm: "Kya aap waqayi tamam sample data reset karna chahte hain?",
      audioVoiceTest: "Voice Assistant Ka Jaiza",
      testSpeech: "Awaaz Test Karein",
      aboutTitle: "Apna Khata Ke Bare Mein",
      aboutBody: "South Punjab ke kisano aur beopariyon ke liye digital bahi khata.",
      installPrompt: "App ko home screen par lagayein taake bina internet bhi chale.",
      offlineMode: "Offline Mode — Internet ke baghair bhi kaam jaari rakhein.",
    },
    firstRun: {
      step1Title: "Kaghazi Parchiyan Bhool Jayein",
      step1Desc: "Boli, kanta aur godown ki tamam parchiyan ab phone mein stamp ke sath mehfooz hain.",
      step2Title: "Awaaz Mein Sunein",
      step2Desc: "Har parchi aur khate ko ek click se Urdu mein sunein, kam parhe likhe bhaaiyon ke liye khas saholat.",
      step3Title: "Baghair Internet, Dhoop Mein Bhi Saaf",
      step3Desc: "Mandi ki dhoop mein bare button aur bina internet pura hisaab aapke haath mein.",
      next: "Agla Qadam",
      getStarted: "Shuru Karein",
      skip: "Chhorhein",
    },
    errors: {
      nameRequired: "Khatedar ka naam lazmi likhein.",
      validAmount: "Durust raqam darj karein.",
      validWeight: "Durust wazan darj karein.",
      genericError: "Koi kharabi pesh aayi, dobara koshish karein.",
      sampleNotice: "Ye SAMPLE data hai, kabhi bhi edit kar sakte hain.",
    },
  },
  en: {
    appName: "Apna Khata",
    tabs: {
      home: "Home",
      khata: "Khata Ledger",
      slips: "Paper Slips",
      rates: "Mandi Rates",
      more: "More",
    },
    roles: {
      farmer: { title: "Farmer / Grower", desc: "Crop sales, weighments and cash advances", badge: "Farmer Khata" },
      arhti: { title: "Arhti / Commission Agent", desc: "Auctions, commission, labor fees & buyers", badge: "Arhat Ledger" },
      cold_storage: { title: "Cold Storage Operator", desc: "Chambers, weighments and storage challans", badge: "Storage Challan" },
      transporter: { title: "Transporter / Dispatcher", desc: "Bilty freight slips, fuel and payable balances", badge: "Freight Bilty" },
      buyer: { title: "Buyer / Trader", desc: "Purchase invoices, mandi taxes & settlement", badge: "Buyer Slip" },
    },
    commodities: {
      mango: "Mango (Chaunsa / Sindhri)",
      citrus: "Citrus / Kinnow",
      dates: "Dates (Aseel)",
      cotton: "Cotton / Phutti",
    },
    units: {
      kg: "Kilogram (Kg)",
      man: "Man (40 Kg)",
      ton: "Metric Ton",
      peti: "Wood Peti / Crate",
    },
    slipTypes: {
      boli: { title: "Auction Slip (Boli)", subtitle: "Mandi auction, deductions & net payable", code: "BOLI" },
      kanta: { title: "Weighbridge Ticket (Kanta)", subtitle: "Gross weight, tare & certified net weight", code: "KANTA" },
      challan: { title: "Cold Storage Challan", subtitle: "Chamber deposit slip & warehouse receipt", code: "CHALLAN" },
      transport: { title: "Transport Freight Bilty", subtitle: "Waybill receipt & transit settlement", code: "FREIGHT" },
    },
    actions: {
      createSlip: "Create Paper Slip",
      addLedgerEntry: "Add Ledger Entry",
      addParty: "Add New Party",
      save: "Save Record",
      cancel: "Cancel",
      printSlip: "Print / Save Slip",
      shareSlip: "Share via WhatsApp",
      listenAudio: "Read Aloud (Voice)",
      stopAudio: "Stop Voice",
      close: "Close",
      switchRole: "Switch Role",
      search: "Search by name or phone...",
      filter: "Filter",
      refreshSample: "Reload Sample Data",
      installApp: "Install App to Home Screen",
    },
    khata: {
      title: "Traditional Bahi-Khata Ledger",
      subtitle: "Debit, Credit & net balances in transparent book style",
      partySelect: "Select Party Account",
      allParties: "All Accounts",
      debit: "Debit (Paid Out / Advance)",
      credit: "Credit (Produce Value / Received)",
      balance: "Net Balance",
      youOwe: "Payable (You owe)",
      theyOwe: "Receivable (They owe you)",
      clearBalance: "Account Settled",
      entryDate: "Entry Date",
      description: "Particulars / Reason",
      amount: "Amount (PKR)",
      slipReference: "Slip Reference No.",
      statementStamp: "Verified Ledger Stamp",
    },
    slipForm: {
      title: "Create Traditional Slip",
      slipNumber: "Slip Number",
      date: "Date (DD/MM/YYYY)",
      party: "Party / Counterpart",
      commodity: "Crop / Commodity",
      variety: "Variety / Grade",
      grossWeight: "Gross Weight",
      tareWeight: "Tare / Empty Weight",
      netWeight: "Net Weight",
      unit: "Weight Unit",
      petiWeight: "Peti Weight (Kg)",
      ratePerUnit: "Rate Per Unit (PKR)",
      grossTotal: "Gross Amount (PKR)",
      commission: "Commission Fee",
      kantaFee: "Weighbridge (Kanta) Fee",
      laborFee: "Labor / Pallai Fee",
      freightFee: "Freight Charges",
      advanceAdjusted: "Advance Deducted",
      netPayable: "Net Payable Amount",
      vehicleNo: "Vehicle / Truck No.",
      chamberNo: "Chamber / Bay No.",
      notes: "Notes / Special Remarks",
      stampAndSign: "Mandi Stamp & Signature",
      verifiedStampText: "Official Mandi Verification Stamp",
    },
    rates: {
      title: "Today's Mandi Rates",
      subtitle: "South Punjab wholesale fruit & crop rate board",
      rateBoard: "Daily Rate Board",
      mandiNotice: "NOTE: All rates are realistic SAMPLE data and are 100% user-editable.",
      configHeader: "Mandi Calculation Settings",
      manWeightLabel: "Weight of 1 Man (Kg)",
      commissionPercentLabel: "Standard Commission (%)",
      kantaFeeLabel: "Standard Kanta Fee (PKR)",
      laborFeeLabel: "Labor Fee per Man (PKR)",
      trendUp: "Trending Up",
      trendDown: "Trending Down",
      trendStable: "Stable",
      ratePerMan: "PKR per Man",
      saveRates: "Save Settings",
    },
    more: {
      title: "Settings & Options",
      languageSelect: "Language Selection",
      activeRole: "Current Role",
      storageInfo: "Storage: Local offline database",
      resetSampleData: "Reset Sample Data",
      sampleDataResetConfirm: "Are you sure you want to reset to default sample data?",
      audioVoiceTest: "Voice Assistant Diagnostics",
      testSpeech: "Test Voice Synthesis",
      aboutTitle: "About Apna Khata",
      aboutBody: "Designed for South Punjab fruit and cotton supply chain actors.",
      installPrompt: "Install on mobile home screen for quick offline access.",
      offlineMode: "Offline Mode — Works seamlessly without internet.",
    },
    firstRun: {
      step1Title: "Replace Fragile Paper Slips",
      step1Desc: "Digitalise boli, kanta, storage and freight slips with authentic stamped paper replicas.",
      step2Title: "Voice Guidance in Urdu",
      step2Desc: "Tap the speaker icon on any screen to hear all financial figures and weight summaries read aloud.",
      step3Title: "Built for Sunlight & Zero Internet",
      step3Desc: "Large 56px touch targets, high-contrast layouts, and 100% offline capability.",
      next: "Next Step",
      getStarted: "Get Started",
      skip: "Skip",
    },
    errors: {
      nameRequired: "Please enter party name.",
      validAmount: "Please enter a valid amount.",
      validWeight: "Please enter a valid weight.",
      genericError: "An error occurred. Please try again.",
      sampleNotice: "This is SAMPLE data and can be edited anytime.",
    },
  },
};

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'ml'

export interface Translations {
  common: {
    welcome: string
    signIn: string
    signOut: string
    save: string
    cancel: string
    delete: string
    edit: string
    close: string
    loading: string
    error: string
    success: string
  }
  sidebar: {
    navigation: string
    dashboard: string
    chatbot: string
    healthVault: string
    emergencyQR: string
    moodTracker: string
    reminders: string
    insights: string
  }
  auth: {
    signIn: string
    signUp: string
    email: string
    password: string
    fullName: string
    welcomeBack: string
    createAccount: string
    signingIn: string
    creatingAccount: string
  }
  moodTracker: {
    title: string
    subtitle: string
    howAreYouFeeling: string
    verySad: string
    sad: string
    neutral: string
    happy: string
    veryHappy: string
    saveMood: string
    updateMood: string
    averageMood: string
    currentStreak: string
    totalEntries: string
    moodTrends: string
    recentEntries: string
    mentalHealthMatters: string
    mentalHealthDescription: string
    waysToImprove: string
  }
  chatbot: {
    title: string
    subtitle: string
    placeholder: string
    send: string
    voiceOn: string
    voiceOff: string
    voiceNotSupported: string
  }
  healthVault: {
    title: string
    uploadRecord: string
    myRecords: string
    cloudSynced: string
    localMode: string
    signInToSync: string
  }
  dashboard: {
    welcomeBack: string
    wellnessJourney: string
    healthScore: string
    activeReminders: string
    recentActivity: string
    quickAccess: string
    aiHealthChatbot: string
    healthVault: string
    emergencyQR: string
    moodTracker: string
    medicationReminders: string
    healthInsights: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    },
    sidebar: {
      navigation: 'Navigation',
      dashboard: 'Dashboard',
      chatbot: 'AI Chatbot',
      healthVault: 'Health Vault',
      emergencyQR: 'Emergency QR',
      moodTracker: 'Mood Tracker',
      reminders: 'Reminders',
      insights: 'Insights'
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      welcomeBack: 'Welcome back',
      createAccount: 'Create account',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...'
    },
    moodTracker: {
      title: 'Mood Tracker',
      subtitle: 'Monitor your mental health and emotional wellbeing',
      howAreYouFeeling: 'How are you feeling today?',
      verySad: 'Very Sad',
      sad: 'Sad',
      neutral: 'Neutral',
      happy: 'Happy',
      veryHappy: 'Very Happy',
      saveMood: "Save Today's Mood",
      updateMood: "Update Today's Mood",
      averageMood: 'Average Mood',
      currentStreak: 'Current Streak',
      totalEntries: 'Total Entries',
      moodTrends: 'Mood Trends',
      recentEntries: 'Recent Mood Entries',
      mentalHealthMatters: 'Why Mental Health Matters',
      mentalHealthDescription: 'Mental health is just as important as physical health.',
      waysToImprove: 'Ways to Improve Your Mood'
    },
    chatbot: {
      title: 'AI Health Assistant',
      subtitle: 'Reminders • Appointments • Quick comfort tips',
      placeholder: 'Type your message...',
      send: 'Send',
      voiceOn: 'Voice on',
      voiceOff: 'Voice off',
      voiceNotSupported: 'Voice not supported'
    },
    healthVault: {
      title: 'Health Vault',
      uploadRecord: 'Upload New Record',
      myRecords: 'My Records',
      cloudSynced: 'Cloud synced',
      localMode: 'Local demo mode',
      signInToSync: 'Sign in to sync your health records to the cloud'
    },
    dashboard: {
      welcomeBack: 'Welcome back to MedPal',
      wellnessJourney: 'Your wellness journey continues',
      healthScore: 'Health Score',
      activeReminders: 'Active Reminders',
      recentActivity: 'Recent Activity',
      quickAccess: 'Quick Access',
      aiHealthChatbot: 'AI Health Chatbot',
      healthVault: 'Health Vault',
      emergencyQR: 'Emergency QR',
      moodTracker: 'Mood Tracker',
      medicationReminders: 'Medication Reminders',
      healthInsights: 'Health Insights'
    }
  },
  hi: {
    common: {
      welcome: 'स्वागत है',
      signIn: 'साइन इन करें',
      signOut: 'साइन आउट करें',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      close: 'बंद करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल'
    },
    sidebar: {
      navigation: 'नेविगेशन',
      dashboard: 'डैशबोर्ड',
      chatbot: 'AI चैटबॉट',
      healthVault: 'हेल्थ वॉल्ट',
      emergencyQR: 'आपातकालीन QR',
      moodTracker: 'मूड ट्रैकर',
      reminders: 'अनुस्मारक',
      insights: 'अंतर्दृष्टि'
    },
    auth: {
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      fullName: 'पूरा नाम',
      welcomeBack: 'वापसी पर स्वागत है',
      createAccount: 'खाता बनाएं',
      signingIn: 'साइन इन हो रहा है...',
      creatingAccount: 'खाता बनाया जा रहा है...'
    },
    moodTracker: {
      title: 'मूड ट्रैकर',
      subtitle: 'अपने मानसिक स्वास्थ्य और भावनात्मक कल्याण की निगरानी करें',
      howAreYouFeeling: 'आज आप कैसा महसूस कर रहे हैं?',
      verySad: 'बहुत उदास',
      sad: 'उदास',
      neutral: 'तटस्थ',
      happy: 'खुश',
      veryHappy: 'बहुत खुश',
      saveMood: "आज का मूड सेव करें",
      updateMood: "आज का मूड अपडेट करें",
      averageMood: 'औसत मूड',
      currentStreak: 'वर्तमान स्ट्रीक',
      totalEntries: 'कुल प्रविष्टियां',
      moodTrends: 'मूड ट्रेंड',
      recentEntries: 'हाल की मूड प्रविष्टियां',
      mentalHealthMatters: 'मानसिक स्वास्थ्य क्यों महत्वपूर्ण है',
      mentalHealthDescription: 'मानसिक स्वास्थ्य शारीरिक स्वास्थ्य जितना ही महत्वपूर्ण है।',
      waysToImprove: 'अपने मूड को सुधारने के तरीके'
    },
    chatbot: {
      title: 'AI स्वास्थ्य सहायक',
      subtitle: 'अनुस्मारक • अपॉइंटमेंट • त्वरित सुखदायक सुझाव',
      placeholder: 'अपना संदेश टाइप करें...',
      send: 'भेजें',
      voiceOn: 'आवाज चालू',
      voiceOff: 'आवाज बंद',
      voiceNotSupported: 'आवाज समर्थित नहीं है'
    },
    healthVault: {
      title: 'हेल्थ वॉल्ट',
      uploadRecord: 'नया रिकॉर्ड अपलोड करें',
      myRecords: 'मेरे रिकॉर्ड',
      cloudSynced: 'क्लाउड सिंक',
      localMode: 'स्थानीय डेमो मोड',
      signInToSync: 'अपने स्वास्थ्य रिकॉर्ड को क्लाउड में सिंक करने के लिए साइन इन करें'
    },
    dashboard: {
      welcomeBack: 'MedPal में वापसी पर स्वागत है',
      wellnessJourney: 'आपकी कल्याण यात्रा जारी है',
      healthScore: 'स्वास्थ्य स्कोर',
      activeReminders: 'सक्रिय अनुस्मारक',
      recentActivity: 'हाल की गतिविधि',
      quickAccess: 'त्वरित पहुंच',
      aiHealthChatbot: 'AI स्वास्थ्य चैटबॉट',
      healthVault: 'हेल्थ वॉल्ट',
      emergencyQR: 'आपातकालीन QR',
      moodTracker: 'मूड ट्रैकर',
      medicationReminders: 'दवा अनुस्मारक',
      healthInsights: 'स्वास्थ्य अंतर्दृष्टि'
    }
  },
  kn: {
    common: {
      welcome: 'ಸ್ವಾಗತ',
      signIn: 'ಸೈನ್ ಇನ್',
      signOut: 'ಸೈನ್ ಔಟ್',
      save: 'ಉಳಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      delete: 'ಅಳಿಸಿ',
      edit: 'ಸಂಪಾದಿಸಿ',
      close: 'ಮುಚ್ಚಿ',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      error: 'ದೋಷ',
      success: 'ಯಶಸ್ಸು'
    },
    sidebar: {
      navigation: 'ನ್ಯಾವಿಗೇಷನ್',
      dashboard: 'ಡ್ಯಾಶ್ಬೋರ್ಡ್',
      chatbot: 'AI ಚಾಟ್ಬಾಟ್',
      healthVault: 'ಆರೋಗ್ಯ ವಾಲ್ಟ್',
      emergencyQR: 'ಅನತ್ಯಾಯಕ QR',
      moodTracker: 'ಮನಸ್ಥಿತಿ ಟ್ರ್ಯಾಕರ್',
      reminders: 'ಜ್ಞಾಪಕಗಳು',
      insights: 'ಒಳನೋಟಗಳು'
    },
    auth: {
      signIn: 'ಸೈನ್ ಇನ್',
      signUp: 'ಸೈನ್ ಅಪ್',
      email: 'ಇಮೇಲ್',
      password: 'ಪಾಸ್ವರ್ಡ್',
      fullName: 'ಪೂರ್ಣ ಹೆಸರು',
      welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
      createAccount: 'ಖಾತೆ ರಚಿಸಿ',
      signingIn: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...',
      creatingAccount: 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...'
    },
    moodTracker: {
      title: 'ಮನಸ್ಥಿತಿ ಟ್ರ್ಯಾಕರ್',
      subtitle: 'ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಕಲ್ಯಾಣವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ',
      howAreYouFeeling: 'ಇಂದು ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತೀರಿ?',
      verySad: 'ಬಹಳ ದುಃಖ',
      sad: 'ದುಃಖ',
      neutral: 'ತಟಸ್ಥ',
      happy: 'ಸಂತೋಷ',
      veryHappy: 'ಬಹಳ ಸಂತೋಷ',
      saveMood: "ಇಂದಿನ ಮನಸ್ಥಿತಿಯನ್ನು ಉಳಿಸಿ",
      updateMood: "ಇಂದಿನ ಮನಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಿ",
      averageMood: 'ಸರಾಸರಿ ಮನಸ್ಥಿತಿ',
      currentStreak: 'ಪ್ರಸ್ತುತ ಸ್ಟ್ರೀಕ್',
      totalEntries: 'ಒಟ್ಟು ಪ್ರವೇಶಗಳು',
      moodTrends: 'ಮನಸ್ಥಿತಿ ಟ್ರೆಂಡ್ಗಳು',
      recentEntries: 'ಇತ್ತೀಚಿನ ಮನಸ್ಥಿತಿ ಪ್ರವೇಶಗಳು',
      mentalHealthMatters: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ ಏಕೆ ಮುಖ್ಯ',
      mentalHealthDescription: 'ಮಾನಸಿಕ ಆರೋಗ್ಯವು ದೈಹಿಕ ಆರೋಗ್ಯಕ್ಕೆ ಸಮಾನವಾಗಿ ಮುಖ್ಯವಾಗಿದೆ।',
      waysToImprove: 'ನಿಮ್ಮ ಮನಸ್ಥಿತಿಯನ್ನು ಸುಧಾರಿಸುವ ವಿಧಾನಗಳು'
    },
    chatbot: {
      title: 'AI ಆರೋಗ್ಯ ಸಹಾಯಕ',
      subtitle: 'ಜ್ಞಾಪಕಗಳು • ನಿಯಮಿತಿ • ತ್ವರಿತ ಸೌಕರ್ಯ ಸಲಹೆಗಳು',
      placeholder: 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
      send: 'ಕಳುಹಿಸಿ',
      voiceOn: 'ಧ್ವನಿ ಆನ್',
      voiceOff: 'ಧ್ವನಿ ಆಫ್',
      voiceNotSupported: 'ಧ್ವನಿ ಬೆಂಬಲಿಸಲಾಗಿಲ್ಲ'
    },
    healthVault: {
      title: 'ಆರೋಗ್ಯ ವಾಲ್ಟ್',
      uploadRecord: 'ಹೊಸ ರೆಕಾರ್ಡ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
      myRecords: 'ನನ್ನ ರೆಕಾರ್ಡ್ಗಳು',
      cloudSynced: 'ಕ್ಲೌಡ್ ಸಿಂಕ್',
      localMode: 'ಸ್ಥಳೀಯ ಡೆಮೊ ಮೋಡ್',
      signInToSync: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ರೆಕಾರ್ಡ್ಗಳನ್ನು ಕ್ಲೌಡ್ಗೆ ಸಿಂಕ್ ಮಾಡಲು ಸೈನ್ ಇನ್ ಮಾಡಿ'
    },
    dashboard: {
      welcomeBack: 'MedPal ಗೆ ಮರಳಿ ಸ್ವಾಗತ',
      wellnessJourney: 'ನಿಮ್ಮ ಕಲ್ಯಾಣ ಪ್ರಯಾಣ ಮುಂದುವರಿಯುತ್ತದೆ',
      healthScore: 'ಆರೋಗ್ಯ ಸ್ಕೋರ್',
      activeReminders: 'ಸಕ್ರಿಯ ಜ್ಞಾಪಕಗಳು',
      recentActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
      quickAccess: 'ತ್ವರಿತ ಪ್ರವೇಶ',
      aiHealthChatbot: 'AI ಆರೋಗ್ಯ ಚಾಟ್ಬಾಟ್',
      healthVault: 'ಆರೋಗ್ಯ ವಾಲ್ಟ್',
      emergencyQR: 'ಅನತ್ಯಾಯಕ QR',
      moodTracker: 'ಮನಸ್ಥಿತಿ ಟ್ರ್ಯಾಕರ್',
      medicationReminders: 'ಔಷಧಿ ಜ್ಞಾಪಕಗಳು',
      healthInsights: 'ಆರೋಗ್ಯ ಒಳನೋಟಗಳು'
    }
  },
  ta: {
    common: {
      welcome: 'வரவேற்கிறோம்',
      signIn: 'உள்நுழைய',
      signOut: 'வெளியேற',
      save: 'சேமி',
      cancel: 'ரத்துசெய்',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      close: 'மூடு',
      loading: 'ஏற்றுகிறது...',
      error: 'பிழை',
      success: 'வெற்றி'
    },
    sidebar: {
      navigation: 'வழிசெலுத்தல்',
      dashboard: 'டாஷ்போர்டு',
      chatbot: 'AI சாட்பாட்',
      healthVault: 'சுகாதார களஞ்சியம்',
      emergencyQR: 'அவசர QR',
      moodTracker: 'மனநிலை கண்காணிப்பு',
      reminders: 'நினைவூட்டல்கள்',
      insights: 'நுண்ணறிவுகள்'
    },
    auth: {
      signIn: 'உள்நுழைய',
      signUp: 'பதிவு செய்',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      fullName: 'முழு பெயர்',
      welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
      createAccount: 'கணக்கு உருவாக்க',
      signingIn: 'உள்நுழைகிறது...',
      creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது...'
    },
    moodTracker: {
      title: 'மனநிலை கண்காணிப்பு',
      subtitle: 'உங்கள் மனநலம் மற்றும் உணர்ச்சி நல்வாழ்வை கண்காணிக்கவும்',
      howAreYouFeeling: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
      verySad: 'மிகவும் சோகம்',
      sad: 'சோகம்',
      neutral: 'நடுநிலை',
      happy: 'மகிழ்ச்சி',
      veryHappy: 'மிகவும் மகிழ்ச்சி',
      saveMood: "இன்றைய மனநிலையை சேமி",
      updateMood: "இன்றைய மனநிலையை புதுப்பி",
      averageMood: 'சராசரி மனநிலை',
      currentStreak: 'தற்போதைய தொடர்',
      totalEntries: 'மொத்த உள்ளீடுகள்',
      moodTrends: 'மனநிலை போக்குகள்',
      recentEntries: 'சமீபத்திய மனநிலை உள்ளீடுகள்',
      mentalHealthMatters: 'மனநலம் ஏன் முக்கியம்',
      mentalHealthDescription: 'மனநலம் உடல் நலத்தைப் போலவே முக்கியமானது.',
      waysToImprove: 'உங்கள் மனநிலையை மேம்படுத்துவதற்கான வழிகள்'
    },
    chatbot: {
      title: 'AI சுகாதார உதவியாளர்',
      subtitle: 'நினைவூட்டல்கள் • நியமனங்கள் • விரைவான ஆறுதல் குறிப்புகள்',
      placeholder: 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...',
      send: 'அனுப்பு',
      voiceOn: 'குரல் இயக்கப்பட்டது',
      voiceOff: 'குரல் முடக்கப்பட்டது',
      voiceNotSupported: 'குரல் ஆதரிக்கப்படவில்லை'
    },
    healthVault: {
      title: 'சுகாதார களஞ்சியம்',
      uploadRecord: 'புதிய பதிவை பதிவேற்று',
      myRecords: 'எனது பதிவுகள்',
      cloudSynced: 'கிளவுட் ஒத்திசைவு',
      localMode: 'உள்ளூர் டெமோ மோட்',
      signInToSync: 'உங்கள் சுகாதார பதிவுகளை கிளவுட்டில் ஒத்திசைக்க உள்நுழையவும்'
    },
    dashboard: {
      welcomeBack: 'MedPal க்கு மீண்டும் வரவேற்கிறோம்',
      wellnessJourney: 'உங்கள் நல்வாழ்வு பயணம் தொடர்கிறது',
      healthScore: 'சுகாதார மதிப்பெண்',
      activeReminders: 'செயலில் உள்ள நினைவூட்டல்கள்',
      recentActivity: 'சமீபத்திய செயல்பாடு',
      quickAccess: 'விரைவான அணுகல்',
      aiHealthChatbot: 'AI சுகாதார சாட்பாட்',
      healthVault: 'சுகாதார களஞ்சியம்',
      emergencyQR: 'அவசர QR',
      moodTracker: 'மனநிலை கண்காணிப்பு',
      medicationReminders: 'மருந்து நினைவூட்டல்கள்',
      healthInsights: 'சுகாதார நுண்ணறிவுகள்'
    }
  },
  ml: {
    common: {
      welcome: 'സ്വാഗതം',
      signIn: 'സൈൻ ഇൻ',
      signOut: 'സൈൻ ഔട്ട്',
      save: 'സേവ് ചെയ്യുക',
      cancel: 'റദ്ദാക്കുക',
      delete: 'ഇല്ലാതാക്കുക',
      edit: 'എഡിറ്റ് ചെയ്യുക',
      close: 'അടയ്ക്കുക',
      loading: 'ലോഡ് ചെയ്യുന്നു...',
      error: 'പിശക്',
      success: 'വിജയം'
    },
    sidebar: {
      navigation: 'നാവിഗേഷൻ',
      dashboard: 'ഡാഷ്ബോർഡ്',
      chatbot: 'AI ചാറ്റ്ബോട്ട്',
      healthVault: 'ആരോഗ്യ വോൾട്ട്',
      emergencyQR: 'അടിയന്തര QR',
      moodTracker: 'മാനസികാവസ്ഥ ട്രാക്കർ',
      reminders: 'ഓർമ്മപ്പെടുത്തലുകൾ',
      insights: 'ഉൾക്കാഴ്ചകൾ'
    },
    auth: {
      signIn: 'സൈൻ ഇൻ',
      signUp: 'സൈൻ അപ്പ്',
      email: 'ഇമെയിൽ',
      password: 'പാസ്‌വേഡ്',
      fullName: 'പൂർണ്ണ നാമം',
      welcomeBack: 'വീണ്ടും സ്വാഗതം',
      createAccount: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക',
      signingIn: 'സൈൻ ഇൻ ചെയ്യുന്നു...',
      creatingAccount: 'അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു...'
    },
    moodTracker: {
      title: 'മാനസികാവസ്ഥ ട്രാക്കർ',
      subtitle: 'നിങ്ങളുടെ മാനസികാരോഗ്യവും വൈകാരിക ക്ഷേമവും നിരീക്ഷിക്കുക',
      howAreYouFeeling: 'ഇന്ന് നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു?',
      verySad: 'വളരെ ദുഃഖം',
      sad: 'ദുഃഖം',
      neutral: 'നിഷ്പക്ഷം',
      happy: 'സന്തോഷം',
      veryHappy: 'വളരെ സന്തോഷം',
      saveMood: "ഇന്നത്തെ മാനസികാവസ്ഥ സേവ് ചെയ്യുക",
      updateMood: "ഇന്നത്തെ മാനസികാവസ്ഥ അപ്‌ഡേറ്റ് ചെയ്യുക",
      averageMood: 'ശരാശരി മാനസികാവസ്ഥ',
      currentStreak: 'നിലവിലെ സ്ട്രീക്ക്',
      totalEntries: 'ആകെ എൻട്രികൾ',
      moodTrends: 'മാനസികാവസ്ഥ ട്രെൻഡുകൾ',
      recentEntries: 'സമീപകാല മാനസികാവസ്ഥ എൻട്രികൾ',
      mentalHealthMatters: 'മാനസികാരോഗ്യം എന്തുകൊണ്ട് പ്രധാനമാണ്',
      mentalHealthDescription: 'മാനസികാരോഗ്യം ശാരീരികാരോഗ്യത്തിന് തുല്യമായി പ്രധാനമാണ്.',
      waysToImprove: 'നിങ്ങളുടെ മാനസികാവസ്ഥ മെച്ചപ്പെടുത്താനുള്ള വഴികൾ'
    },
    chatbot: {
      title: 'AI ആരോഗ്യ അസിസ്റ്റന്റ്',
      subtitle: 'ഓർമ്മപ്പെടുത്തലുകൾ • അപ്പോയിന്റ്‌മെന്റുകൾ • വേഗത്തിലുള്ള ആശ്വാസ ടിപ്പുകൾ',
      placeholder: 'നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
      send: 'അയയ്ക്കുക',
      voiceOn: 'ശബ്ദം ഓണാണ്',
      voiceOff: 'ശബ്ദം ഓഫാണ്',
      voiceNotSupported: 'ശബ്ദം പിന്തുണയ്ക്കുന്നില്ല'
    },
    healthVault: {
      title: 'ആരോഗ്യ വോൾട്ട്',
      uploadRecord: 'പുതിയ റെക്കോർഡ് അപ്‌ലോഡ് ചെയ്യുക',
      myRecords: 'എന്റെ റെക്കോർഡുകൾ',
      cloudSynced: 'ക്ലൗഡ് സിങ്ക്',
      localMode: 'പ്രാദേശിക ഡെമോ മോഡ്',
      signInToSync: 'നിങ്ങളുടെ ആരോഗ്യ റെക്കോർഡുകൾ ക്ലൗഡിലേക്ക് സിങ്ക് ചെയ്യാൻ സൈൻ ഇൻ ചെയ്യുക'
    },
    dashboard: {
      welcomeBack: 'MedPal-ലേക്ക് വീണ്ടും സ്വാഗതം',
      wellnessJourney: 'നിങ്ങളുടെ കല്യാണ യാത്ര തുടരുന്നു',
      healthScore: 'ആരോഗ്യ സ്കോർ',
      activeReminders: 'സജീവമായ ഓർമ്മപ്പെടുത്തലുകൾ',
      recentActivity: 'സമീപകാല പ്രവർത്തനം',
      quickAccess: 'ദ്രുത പ്രവേശനം',
      aiHealthChatbot: 'AI ആരോഗ്യ ചാറ്റ്ബോട്ട്',
      healthVault: 'ആരോഗ്യ വോൾട്ട്',
      emergencyQR: 'അടിയന്തര QR',
      moodTracker: 'മാനസികാവസ്ഥ ട്രാക്കർ',
      medicationReminders: 'മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ',
      healthInsights: 'ആരോഗ്യ ഉൾക്കാഴ്ചകൾ'
    }
  }
}

export default translations


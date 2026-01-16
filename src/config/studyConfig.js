// Study Configuration - Easy to modify settings and logic
export const STUDY_CONFIG = {
  // Study metadata
  title: "Feedback on a GenAI Prototype for Creative Workflow",
  description: "Thank you for your interest in this study. This survey is about to test a prototype of a GenAI tool for creative workflows. Before we begin, we need to ask a few questions to determine your eligibility.",
  
  // Debug and Testing Configuration
  debug: {
    enabled: false, // Set to false in production
    showDeviceInfo: false, // Show device ID in console
    bypassSecurity: false, // Set to true to bypass some security for testing
    testMode: false, // Enable test mode features
    showExemptionStatus: false // Show when device exemptions are working
  },
  
  // Device Exemption List - Add your device IDs here for testing
  deviceExemptions: [
    'gsato4', // Your actual device ID
    'e9tfuj', // yuki's macbook
    'test-device-2', // Test device for development
    'test-device-3', // Test device for development
    // Add more device IDs as needed
  ],
  
  // AB Testing configuration
  abTesting: {
    enabled: true,
    groups: ['A', 'B'],
    splitRatio: 0.5, // 50/50 split
    groupNames: {
      'A': 'Control Group',
      'B': 'Treatment Group'
    }
  },
  
  // Form URLs for each group
  formUrls: {
    'A': 'https://forms.gle/ESnUMgn2eKwGDJYA9',
    'B': 'https://forms.gle/7d7xCUWr1HRpFpc49'
  },
  
  // Questions configuration - Easy to modify
  questions: {
    q1: {
      id: 'field',
      type: 'radio',
      title: 'Which of the following best describes your professional field?',
      subtitle: '(If you are in an interdisciplinary field that covers creative work, please choose "Creative Arts, Design, or Media".)',
      options: [
        { value: 'creative', label: 'Creative Arts, Design, or Media' },
        { value: 'business', label: 'Business, Marketing, or Sales' },
        { value: 'finance', label: 'Finance, Accounting, or Banking' },
        { value: 'healthcare', label: 'Healthcare or Medicine' },
        { value: 'education', label: 'Education or Academia' },
        { value: 'tech', label: 'Technology or IT (without a creative role)' },
        { value: 'engineering', label: 'Engineering or Science' },
        { value: 'service', label: 'Customer Service or Hospitality' },
        { value: 'government', label: 'Government or Public Service' },
        { value: 'other', label: 'Other' }
      ],
      nextStep: 'q2',
      disqualifyOn: ['business', 'finance', 'healthcare', 'education', 'tech', 'engineering', 'service', 'government', 'other'], // Disqualify non-creative fields
      required: true
    },
    
    q2: {
      id: 'experience',
      type: 'select',
      title: 'When did you begin your professional career in this field?',
      options: [
        { value: 'less_than_1_year', label: 'Less than 1 year' },
        { value: '1_to_3_years', label: '1 to 3 years ago' },
        { value: '3_to_5_years', label: '3 to 5 years ago' },
        { value: '5_to_10_years', label: '5 to 10 years ago' },
        { value: 'more_than_10_years', label: 'More than 10 years ago' }
      ],
      nextStep: 'q3',
      disqualifyOn: 'less_than_1_year', // Disqualify if this answer is selected
      required: true
    },
    
    q3: {
      id: 'genai_usage',
      type: 'radio',
      title: 'How would you describe your familiarity with Generative AI tools in your work?',
      options: [
        { value: 'limited', label: 'I have no or very limited exposure to them.' },
        { value: 'experimented', label: 'I have experimented with them but do not use them regularly.' },
        { value: 'regular', label: 'They are a regular part of my workflow.' },
        { value: 'essential', label: 'They are essential to my creative process.' }
      ],
      nextStep: 'redirect',
      disqualifyOn: 'limited', // Disqualify if limited usage
      required: true
    }
  },
  
  // Flow logic - Easy to modify
  flowLogic: {
    // Define what happens after each question
    field: {
      creative: 'q2', // Only creative fields go to q2
      default: 'disqualify' // All other fields disqualify
    },
    
    experience: {
      less_than_1_year: 'disqualify', // If less than 1 year, disqualify
      default: 'q3' // Any other answer goes to q3
    },
    
    genai_usage: {
      limited: 'disqualify', // If limited usage, disqualify
      default: 'redirect' // Any other answer goes to redirect
    }
  },
  
  // Security settings
  security: {
    preventBackNavigation: true,
    preventRightClick: true,
    preventDevTools: true,
    preventRefresh: true,
    sessionTimeout: 60000, // 1 minute
    deviceFingerprinting: true,
    maxVisitsPerDevice: 3 // Maximum number of completions allowed per device (1 = once, 2 = twice, etc.)
  },
  
  // UI settings
  ui: {
    loadingDelay: 2000, // 2 seconds before redirect
    animations: true,
    theme: 'light',
    primaryColor: 'blue'
  },
  
  // Welcome Page Configuration
  welcomePage: {
    enabled: true, // Set to false to skip welcome page and go directly to questions
    title: "Feedback on a GenAI Prototype for Creative Workflow",
    subtitle: "We are recruiting creative practitioners like you to help evaluate a new GenAI prototype for creative workflows.",

    // description: "We're evaluating a new GenAI prototype designed specifically for creative workflows. Your insights will directly influence how AI tools are developed for the creative industry.",
    
    // Optional logo (set showLogo to false to hide)
    showLogo: true,
    logo: "/creativastudio-survey/study-logo.png", // URL or path to logo image
    logoAlt: "Study Logo", // Alt text for accessibility
    logoWidth: "200px", // Optional: control logo size
    logoHeight: "auto", // Optional: control logo height
    
    // Key points to highlight (optional)
    // keyPoints: [
    //   "The study takes approximately 10-15 minutes to complete",
    //   "Your responses will be kept completely confidential",
    //   "You can withdraw from the study at any time",
    //   "There are no right or wrong answers"
    // ],
    // keyPointsTitle: "Before we begin:", // Title for the key points section
    
    // Additional information box (optional)
    additionalInfo: "Quick setup: Stable internet required • Complete in one sitting • Takes 20-25 minutes",
    
    // Time estimate (optional)
    // timeEstimate: "10-15 minutes",
    
    // Button customization
    buttonText: "Let's Begin",
    buttonStyle: "blue", // Options: "blue", "green", "red"
    
    // Footer text (optional)
    // footerText: "By continuing, you consent to participate in this research study."
  },

  // Messages
  messages: {
    loading: 'Initializing study...',
    redirecting: 'Preparing Study',
    redirectSubtitle: 'Please wait while we prepare your study materials...',
    completed: 'Thank You',
    completedSubtitle: 'Our records indicate that you have already completed this screening. Thank you for your time. If you have any questions, please contact us at yukizhuyue@outlook.com.',
    disqualified: 'Based on your responses, you do not currently qualify for this study.',
  disqualifiedSubtitle: 'We appreciate your interest. If you have any questions, please contact us at yukizhuyue@outlook.com.',
    error: 'An error occurred. Please try again.'
  }
};

// Helper function to get question by step
export const getQuestionByStep = (step) => {
  return STUDY_CONFIG.questions[step];
};

// Helper function to get next step based on answer
export const getNextStep = (questionId, answer) => {
  const question = Object.values(STUDY_CONFIG.questions).find(q => q.id === questionId);
  if (!question) return null;
  
  // Check if this answer should disqualify
  if (question.disqualifyOn) {
    if (Array.isArray(question.disqualifyOn)) {
      if (question.disqualifyOn.includes(answer)) {
        return 'disqualify';
      }
    } else if (question.disqualifyOn === answer) {
      return 'disqualify';
    }
  }
  
  // Return next step or default
  return question.nextStep || 'disqualify';
};

// Helper function to check if answer should disqualify
export const shouldDisqualify = (questionId, answer) => {
  const question = Object.values(STUDY_CONFIG.questions).find(q => q.id === questionId);
  if (!question) return false;
  
  if (question.disqualifyOn) {
    if (Array.isArray(question.disqualifyOn)) {
      return question.disqualifyOn.includes(answer);
    }
    return question.disqualifyOn === answer;
  }
  
  return false;
};

import { STUDY_CONFIG } from '../config/studyConfig.js';

// Security utilities for the randomizor application
export class SecurityManager {
  constructor() {
    this.deviceId = null;
    this.sessionToken = null;
    this.init();
  }

  init() {
    if (STUDY_CONFIG.security.preventBackNavigation) {
      this.preventBackNavigation();
    }
    
    if (STUDY_CONFIG.security.preventRightClick) {
      this.preventRightClick();
    }
    
    if (STUDY_CONFIG.security.preventDevTools) {
      this.detectDevTools();
    }
    
    if (STUDY_CONFIG.security.preventRefresh) {
      this.preventRefresh();
    }
  }

  preventBackNavigation() {
    // Disable back button
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', () => {
      history.pushState(null, null, location.href);
    });
  }

  preventRightClick() {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  preventRefresh() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'r' || e.key === 'R' || e.key === 'F5') {
          e.preventDefault();
        }
      }
      // Prevent F12 and other dev tools shortcuts
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    });
  }

  detectDevTools() {
    const devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;
    const emitEvent = (isOpen, orientation) => {
      if (devtools.open !== isOpen) {
        devtools.open = isOpen;
        devtools.orientation = orientation;
        
        if (isOpen) {
          console.warn('Developer tools detected');
          // You could add additional security measures here
        }
      }
    };

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        emitEvent(true, 'vertical');
      } else {
        emitEvent(false, null);
      }
    }, 500);
  }

  async generateDeviceFingerprint() {
    if (!STUDY_CONFIG.security.deviceFingerprinting) {
      return this.generateRandomId();
    }

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      navigator.platform,
      navigator.cookieEnabled ? '1' : '0',
      navigator.doNotTrack || 'unknown'
    ];

    // Add canvas fingerprinting
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprinting', 2, 2);
      components.push(canvas.toDataURL());
    } catch (error) {
      console.warn('Canvas fingerprinting failed:', error);
    }

    // Create hash from components
    const fingerprint = components.join('|');
    return this.hashString(fingerprint);
  }

  generateRandomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  generateSessionToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return this.hashString(`${this.deviceId}_${timestamp}_${random}`);
  }

  async initialize() {
    this.deviceId = await this.generateDeviceFingerprint();
    this.sessionToken = this.generateSessionToken();
    return {
      deviceId: this.deviceId,
      sessionToken: this.sessionToken
    };
  }

  getDeviceId() {
    return this.deviceId;
  }

  getSessionToken() {
    return this.sessionToken;
  }

  // Check if device is exempt from certain restrictions
  async isDeviceExempt() {
    return STUDY_CONFIG.deviceExemptions.includes(this.deviceId);
  }
}

// Storage utilities with encryption
export class SecureStorage {
  static setItem(key, value) {
    try {
      const encryptedValue = btoa(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Storage encryption failed:', error);
      // Fallback to plain storage
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static getItem(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      const decryptedValue = atob(value);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Storage decryption failed:', error);
      // Fallback to plain storage
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  }

  static removeItem(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

// Session management
export class SessionManager {
  constructor(deviceId, sessionToken) {
    this.deviceId = deviceId;
    this.sessionToken = sessionToken;
  }

  storeSession() {
    const sessionData = {
      deviceId: this.deviceId,
      sessionToken: this.sessionToken,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    // Store in sessionStorage (cleared when tab closes)
    sessionStorage.setItem('ab_test_session', JSON.stringify(sessionData));
    
    // Store completion status in localStorage (persistent)
    if (!SecureStorage.getItem(`ab_test_completed_${this.deviceId}`)) {
      SecureStorage.setItem(`ab_test_completed_${this.deviceId}`, false);
    }
  }

  async checkCompletion() {
    // Check if device is exempt first
    if (this.deviceId && STUDY_CONFIG.deviceExemptions.includes(this.deviceId)) {
      console.log('🎯 DEVICE EXEMPTION WORKING:', this.deviceId);
      console.log('✅ Clearing completion data for exempt device');
      // Clear any existing completion data for exempt devices
      SecureStorage.removeItem(`ab_test_completed_${this.deviceId}`);
      return false; // Allow access even if previously completed
    }
    
    const completed = SecureStorage.getItem(`ab_test_completed_${this.deviceId}`);
    return completed === true;
  }

  markCompleted() {
    SecureStorage.setItem(`ab_test_completed_${this.deviceId}`, true);
  }

  getSessionData() {
    return JSON.parse(sessionStorage.getItem('ab_test_session') || '{}');
  }
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDY_CONFIG, getQuestionByStep, getNextStep } from '../config/studyConfig';
import { SecurityManager, SessionManager, SecureStorage } from '../utils/security';
import { createABTestingManager } from '../utils/abTesting';
import { checkParticipantIdExists, storeParticipantId } from '../utils/firebase';
import QuestionForm from './QuestionForm';
import LoadingSpinner from './LoadingSpinner';
import RedirectMessage from './RedirectMessage';
import DebugPanel from './DebugPanel';

const Randomizor = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('q1');
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [securityManager, setSecurityManager] = useState(null);
  const [sessionManager, setSessionManager] = useState(null);
  const [abTestingManager, setAbTestingManager] = useState(null);
  const [showParticipantId, setShowParticipantId] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize security
      const security = new SecurityManager();
      const { deviceId, sessionToken } = await security.initialize();
      setSecurityManager(security);

      // Log device ID for debugging
      if (STUDY_CONFIG.debug.enabled) {
        console.log('==============================================');
        console.log('🔑 YOUR DEVICE ID:', deviceId);
        console.log('📋 Add this to deviceExemptions in studyConfig.js');
        console.log('==============================================');
      }

      // Initialize session management
      const session = new SessionManager(deviceId, sessionToken);
      setSessionManager(session);

      // Check if already completed
      const isCompleted = await session.checkCompletion();
      if (isCompleted) {
        setIsCompleted(true);
        setIsLoading(false);
        return;
      }

      // Initialize AB testing
      const abTesting = createABTestingManager(deviceId);
      setAbTestingManager(abTesting);

      // Store session
      session.storeSession();

      // Show main content
      setIsLoading(false);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Check if this answer should disqualify
    if (getNextStep(questionId, answer) === 'disqualify') {
      handleDisqualify();
      return;
    }

    // Get next step
    const nextStep = getNextStep(questionId, answer);
    if (nextStep === 'redirect') {
      handleRedirect();
      return;
    }

    // Move to next question
    setCurrentStep(nextStep);
  };

  // Generate a unique participant ID based on timestamp + random code
  const generateUniqueParticipantId = () => {
    // Use timestamp in base36 (shorter)
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    
    // Add random 2-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomCode = '';
    for (let i = 0; i < 2; i++) {
      randomCode += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Format: XZ24K7 (6 chars total, no group identifier)
    return `${timestamp}${randomCode}`;
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(participantId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setCopied(false);
    }
  };

  // Debug: Force clear and reassign for testing
  const handleDebugReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleDisqualify = () => {
    if (sessionManager) {
      sessionManager.markCompleted();
    }
    setIsDisqualified(true);
    
    // Redirect to end page after a delay
    setTimeout(() => {
      navigate('/end');
    }, 2000);
  };

  const handleRedirect = async () => {
    if (sessionManager) {
      sessionManager.markCompleted();
    }
    
    // Assign AB group first
    const group = abTestingManager?.getTestGroup();
    
    // Generate unique ID and check if it exists in Firebase
    let id;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
      id = generateUniqueParticipantId();
      const exists = await checkParticipantIdExists(id);
      
      if (!exists) {
        break; // Found a unique ID
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    // Log the group assignment
    console.log('🎯 Assigned Group:', group);
    console.log('🆔 Participant ID:', id);
    
    // Store ID in Firebase with the correct group
    await storeParticipantId(id, group, {
      deviceId: securityManager?.getDeviceId()
    });
    
    setParticipantId(id);
    SecureStorage.setItem('participant_id', id);
    
    // Store group mapping
    SecureStorage.setItem('participant_group', group);
    SecureStorage.setItem(`participant_group_map_${id}`, group);
    
    setShowParticipantId(true);
  };

  const handleContinueToSurvey = () => {
    // Group already assigned, just increment counter and navigate
    const group = abTestingManager?.getTestGroup() || SecureStorage.getItem('participant_group');
    if (abTestingManager) {
      abTestingManager.incrementGroupCount();
    }
    // Pass group as URL parameter to ensure Survey.jsx gets it
    navigate(`/survey?variant=${group}`);
  };

  // Debug functions
  const handleReset = () => {
    if (sessionManager) {
      sessionManager.markCompleted();
    }
    setCurrentStep('q1');
    setAnswers({});
    setIsCompleted(false);
    setIsDisqualified(false);
    setIsRedirecting(false);
    
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reinitialize
    initializeApp();
  };

  const handleSetStep = (step) => {
    setCurrentStep(step);
  };

  const handleSetGroup = (group) => {
    if (abTestingManager) {
      abTestingManager.resetGroupAssignment();
      abTestingManager.testGroup = group;
      SecureStorage.setItem(`ab_test_group_${securityManager?.getDeviceId()}`, group);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={STUDY_CONFIG.messages.loading} />;
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 fade-in">
        <div className="glass-card p-8 rounded-2xl shadow-modern-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {STUDY_CONFIG.messages.completed}
          </h2>
          <p className="text-gray-700 text-lg">
            {STUDY_CONFIG.messages.completedSubtitle}
          </p>
        </div>
      </div>
    );
  }

  if (isDisqualified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 fade-in">
        <div className="glass-card p-8 rounded-2xl shadow-modern-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            {STUDY_CONFIG.messages.disqualified}
          </h2>
          <p className="text-gray-700 text-lg">
            {STUDY_CONFIG.messages.disqualifiedSubtitle}
          </p>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return <RedirectMessage />;
  }

  // Participant ID copy screen
  if (showParticipantId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 fade-in">
        <div className="glass-card p-8 rounded-2xl shadow-modern-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Participant ID
          </h2>
          <p className="text-gray-600 mb-6">Please copy this ID. You will paste it at the top of the next form.</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <code className="text-2xl font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              {participantId}
            </code>
            <button
              onClick={handleCopyId}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={handleContinueToSurvey}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            I’ve copied my ID – Continue
          </button>          
          {STUDY_CONFIG.debug.enabled && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Debug: Clear data and test another group</p>
              <button
                onClick={handleDebugReset}
                className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset & Test Again
              </button>
            </div>
          )}        </div>
      </div>
    );
  }

  const currentQuestion = getQuestionByStep(currentStep);
  if (!currentQuestion) {
    return <div>Error: Question not found</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 fade-in">
      <div className="glass-card p-8 rounded-2xl shadow-modern-lg w-full max-w-2xl">
        <main>
          <QuestionForm
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
          />
        </main>
      </div>

      {/* Debug Panel */}
      <DebugPanel
        deviceId={securityManager?.getDeviceId() || 'unknown'}
        testGroup={abTestingManager?.getTestGroup() || 'unknown'}
        currentStep={currentStep}
        answers={answers}
        onReset={handleReset}
        onSetStep={handleSetStep}
        onSetGroup={handleSetGroup}
      />
    </div>
  );
};

export default Randomizor;

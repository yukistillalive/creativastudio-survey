import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDY_CONFIG, getQuestionByStep, getNextStep } from '../config/studyConfig';
import { SecurityManager, SessionManager, SecureStorage } from '../utils/security';
import { createABTestingManager } from '../utils/abTesting';
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

  const handleRedirect = () => {
    if (sessionManager) {
      sessionManager.markCompleted();
    }
    if (abTestingManager) {
      abTestingManager.incrementGroupCount();
    }
    
    // Navigate directly to survey without delay
    navigate('/survey');
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

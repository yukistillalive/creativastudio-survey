import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STUDY_CONFIG } from '../config/studyConfig';
import { SecureStorage } from '../utils/security';

function Survey() {
  const [searchParams] = useSearchParams();
  const [formUrl, setFormUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testGroup, setTestGroup] = useState(null);
  const [participantId, setParticipantId] = useState('');

  // Use form URLs from config
  const FORM_URLS = STUDY_CONFIG.formUrls;

  useEffect(() => {
    const determineForm = () => {
      // Get participant ID from SecureStorage
      const storedId = SecureStorage.getItem('participant_id');
      if (storedId) {
        setParticipantId(storedId);
      }

      // First check URL parameter
      const variant = searchParams.get('variant');
      if (variant === 'A' || variant === 'B') {
        console.log('✅ Group from URL parameter:', variant);
        setTestGroup(variant);
        setFormUrl(FORM_URLS[variant]);
        setIsLoading(false);
        return;
      }

      // Check participant_group which is set when ID is generated
      const participantGroup = SecureStorage.getItem('participant_group');
      if (participantGroup && FORM_URLS[participantGroup]) {
        console.log('✅ Group from participant_group:', participantGroup);
        setTestGroup(participantGroup);
        setFormUrl(FORM_URLS[participantGroup]);
        setIsLoading(false);
        return;
      }

      // Try to get from ab_test_group in secure storage
      const storedGroup = Object.keys(localStorage).find(key => 
        key.includes('ab_test_group') && !key.includes('count') && !key.includes('fallback')
      );
      
      if (storedGroup) {
        const group = localStorage.getItem(storedGroup);
        if (group && FORM_URLS[group]) {
          console.log('✅ Group from ab_test_group storage:', group);
          setTestGroup(group);
          setFormUrl(FORM_URLS[group]);
          setIsLoading(false);
          return;
        }
      }

      // If we get here, something went wrong - show error
      console.error('❌ Could not determine group assignment');
      setTestGroup('B'); // Default fallback
      setFormUrl(FORM_URLS['B']);
      setIsLoading(false);
    };

    determineForm();
  }, [searchParams, FORM_URLS]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="glass-card p-8 rounded-2xl shadow-modern-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5e7bea] via-[#7c83d1] to-[#7a59c2] py-8 px-4 flex items-start justify-center">
      <div className="w-full max-w-5xl">
        {participantId && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-2 border-blue-300">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Remember to paste your Participant ID at the top of the form:
                </p>
                <code className="text-lg font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                  {participantId}
                </code>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/40">
          <iframe
            src={formUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            className="min-h-[85vh] w-full block"
            title="Survey Form"
            style={{ display: 'block', border: 'none' }}
          >
            Loading…
          </iframe>
        </div>
      </div>
    </div>
  );
}

export default Survey;
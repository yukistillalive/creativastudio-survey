import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Survey() {
  const [searchParams] = useSearchParams();
  const [formUrl, setFormUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testGroup, setTestGroup] = useState(null);
  const [participantId, setParticipantId] = useState('');

  const FORM_URLS = {
    'A': 'https://docs.google.com/forms/d/e/1FAIpQLSea70NkZ0RhYjfgatbSHS_d1DKTsRSkmK-9aT1i8Vznx4KY5A/viewform?embedded=true',
    'B': 'https://docs.google.com/forms/d/e/1FAIpQLScHYoXRHAd9EY78wVXoJ8Hkbmx_p1YNzt5izkMyluiFkCwS7A/viewform?embedded=true'
  };

  useEffect(() => {
    const determineForm = () => {
      // Get participant ID from localStorage
      const storedId = localStorage.getItem('participant_id');
      if (storedId) {
        try {
          const decoded = atob(storedId);
          setParticipantId(JSON.parse(decoded));
        } catch {
          setParticipantId(storedId);
        }
      }

      // First check URL parameter
      const variant = searchParams.get('variant');
      if (variant === 'A' || variant === 'B') {
        setTestGroup(variant);
        setFormUrl(FORM_URLS[variant]);
        setIsLoading(false);
        return;
      }

      // Try to get from secure storage (set by AB testing manager)
      const storedGroup = Object.keys(localStorage).find(key => 
        key.includes('ab_test_group')
      );
      
      if (storedGroup) {
        const group = localStorage.getItem(storedGroup);
        if (group && FORM_URLS[group]) {
          setTestGroup(group);
          setFormUrl(FORM_URLS[group]);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to random assignment
      const randomGroup = Math.random() < 0.5 ? 'A' : 'B';
      setTestGroup(randomGroup);
      setFormUrl(FORM_URLS[randomGroup]);
      
      // Store for consistency
      localStorage.setItem('ab_test_group_fallback', randomGroup);
      setIsLoading(false);
    };

    determineForm();
  }, [searchParams]);

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
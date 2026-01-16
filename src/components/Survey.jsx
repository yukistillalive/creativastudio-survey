import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Survey() {
  const [searchParams] = useSearchParams();
  const [formUrl, setFormUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testGroup, setTestGroup] = useState(null);

  const FORM_URLS = {
    'A': 'https://docs.google.com/forms/d/e/1FAIpQLSea70NkZ0RhYjfgatbSHS_d1DKTsRSkmK-9aT1i8Vznx4KY5A/viewform?embedded=true',
    'B': 'https://docs.google.com/forms/d/e/1FAIpQLScHYoXRHAd9EY78wVXoJ8Hkbmx_p1YNzt5izkMyluiFkCwS7A/viewform?embedded=true'
  };

  useEffect(() => {
    const determineForm = () => {
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
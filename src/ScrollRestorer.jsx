import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollRestorer = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition !== null) {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        console.log('Scroll restored to:', savedScrollPosition);
      }
    } else {
      window.scrollTo(0, 0);
      console.log('Navigated via', navigationType, '- scroll to top');
    }
  }, [location, navigationType]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
};

export default ScrollRestorer;

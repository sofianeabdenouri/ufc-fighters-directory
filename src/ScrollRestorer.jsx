import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollRestorer = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const scrollElement = document.scrollingElement || document.documentElement;
    const isGoingBack = navigationType === 'POP';

    if (isGoingBack && location.pathname === '/') {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition !== null) {
        const scrollY = parseInt(savedScrollPosition, 10);
        console.log('Restoring scroll to:', scrollY);
        scrollElement.scrollTo({ top: scrollY, behavior: 'instant' });
      }
    } else {
      scrollElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location, navigationType]);

  return null;
};

export default ScrollRestorer;

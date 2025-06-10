import { useEffect } from 'react';

const useSaveScrollOnUnmount = () => {
  useEffect(() => {
    return () => {
      const scrollPos = window.scrollY;
      sessionStorage.setItem('scrollPosition', scrollPos.toString());
      console.log('Scroll position saved on unmount:', scrollPos);
    };
  }, []);
};

export default useSaveScrollOnUnmount;

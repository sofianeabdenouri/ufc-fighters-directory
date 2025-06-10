import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestorer = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollingElement = document.querySelector(".app");
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");

    if (scrollingElement && location.pathname === "/") {
      scrollingElement.scrollTo(0, parseInt(savedScrollPosition || "0", 10));
    }
  }, [location]);

  return null;
};

export default ScrollRestorer;

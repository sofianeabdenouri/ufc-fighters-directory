import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestorer = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollingElement = document.querySelector(".app");
    const savedScrollPosition = sessionStorage.getItem("scrollPosition");

    if (scrollingElement && location.pathname === "/") {
      requestAnimationFrame(() => {
        scrollingElement.scrollTo(0, parseInt(savedScrollPosition || "0", 10));
        console.log("Scroll restored to:", savedScrollPosition);
      });
    }
  }, [location]);

  return null;
};

export default ScrollRestorer;

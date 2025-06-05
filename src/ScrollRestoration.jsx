import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") {
      // Try the new key first, fallback to legacy key
      const savedY =
        sessionStorage.getItem(`scroll-${location.pathname}`) ||
        sessionStorage.getItem(`${location.pathname}scrollPosition`);

      if (savedY !== null) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedY, 10));
        });
      }
    }
  }, [location.pathname, navigationType]);

  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(`scroll-${location.pathname}`, window.scrollY);
    };
    window.addEventListener("scroll", save);
    return () => window.removeEventListener("scroll", save);
  }, [location.pathname]);

  return null;
};

export default ScrollRestoration;

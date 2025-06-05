import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // ← add this

  // Restore scroll on POP (i.e. back/forward)
  useEffect(() => {
    if (navigationType === "POP") {
      const savedY = sessionStorage.getItem(`scroll-${location.pathname}`);
      if (savedY !== null) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedY, 10));
        });
      }
    }
  }, [location.pathname, navigationType]);

  // Save scroll when scrolling
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

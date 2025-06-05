import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Restore scroll on back/forward
  useEffect(() => {
    if (navigationType === "POP") {
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

  // Save scroll on scroll and before unmount/navigation
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(`scroll-${location.pathname}`, window.scrollY);
    };

    window.addEventListener("scroll", save);
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);

    return () => {
      save(); // ← save one last time when component unmounts
      window.removeEventListener("scroll", save);
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pagehide", save);
    };
  }, [location.pathname]);

  return null;
};

export default ScrollRestoration;

import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") {
      const savedY =
        sessionStorage.getItem(`scroll-${location.pathname}`) ||
        sessionStorage.getItem(`${location.pathname}scrollPosition`);

      if (savedY !== null) {
        requestAnimationFrame(() => {
          document.querySelector(".app")?.scrollTo(0, parseInt(savedY, 10));
        });
      }
    }
  }, [location.pathname, navigationType]);

  useEffect(() => {
    const save = () => {
      const y = document.querySelector(".app")?.scrollTop || 0;
      sessionStorage.setItem(`scroll-${location.pathname}`, y);
    };

    const el = document.querySelector(".app");
    el?.addEventListener("scroll", save);
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);

    return () => {
      save();
      el?.removeEventListener("scroll", save);
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pagehide", save);
    };
  }, [location.pathname]);

  return null;
};

export default ScrollRestoration;

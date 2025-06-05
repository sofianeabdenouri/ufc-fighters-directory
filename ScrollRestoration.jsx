import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    const appElement = document.querySelector(".app");
    const savedPosition = sessionStorage.getItem("scrollPosition");

    if (location.pathname === "/" && savedPosition) {
      appElement?.scrollTo(0, parseInt(savedPosition, 10));
    }

    return () => {
      if (location.pathname === "/") {
        sessionStorage.setItem("scrollPosition", appElement?.scrollTop || 0);
      }
    };
  }, [location]);

  return null;
};

export default ScrollRestoration;

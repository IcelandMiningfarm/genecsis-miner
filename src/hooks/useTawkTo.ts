import { useEffect } from "react";

const TAWK_SRC = "https://embed.tawk.to/6994b3ee1b1f6f1c33835aa8/";

export const useTawkTo = () => {
  useEffect(() => {
    // Avoid loading twice
    if (document.getElementById("tawk-script")) return;

    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);

    return () => {
      // Hide widget when leaving authenticated pages
      const api = (window as any).Tawk_API;
      if (api?.hideWidget) api.hideWidget();
    };
  }, []);

  // Show widget if it was previously hidden
  useEffect(() => {
    const api = (window as any).Tawk_API;
    if (api?.showWidget) api.showWidget();
  }, []);
};

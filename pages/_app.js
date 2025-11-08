/**
 * Global App Component
 * Always dark mode - pitch black background
 */

import { useEffect } from "react";
import "../src/styles/globals.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add("dark");
    document.body.style.backgroundColor = "#000000";
  }, []);

  return (
    <div className="min-h-screen dark">
      <div className="bg-black text-white transition-colors duration-200">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;

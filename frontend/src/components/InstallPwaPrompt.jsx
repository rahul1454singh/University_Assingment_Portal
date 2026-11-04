import React, { useState, useEffect } from "react";
import { GraduationCap, Download, X, Share, PlusSquare } from "lucide-react";
import "../css/InstallPwaPrompt.css";

const InstallPwaPrompt = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (isDismissed) {
      return;
    }

    // 3. Check if user is on a mobile device or narrow screen
    const isMobileDevice =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;

    // Capture standard PWA install event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isMobileDevice) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If on iOS or mobile browser that doesn't fire beforeinstallprompt, still display prompt after 1.5s
    const timer = setTimeout(() => {
      if (isMobileDevice && !sessionStorage.getItem("pwa_install_dismissed")) {
        setShowBanner(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;

    if (isIosDevice) {
      // Show iOS step-by-step guidance
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers without direct prompt
      alert("To install, open your browser menu (⋮) and tap 'Add to Home screen' or 'Install App'.");
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosGuide(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <>
      <aside className="pwa-install-banner" role="dialog" aria-label="Install App Banner">
        <div className="pwa-banner-header">
          <div className="pwa-icon-wrapper" aria-hidden="true">
            <GraduationCap size={28} />
          </div>

          <div className="pwa-banner-content">
            <h3 className="pwa-banner-title">Install University Portal</h3>
            <p className="pwa-banner-desc">
              Add this app to your mobile home screen for quick, one-tap access.
            </p>
          </div>

          <button
            className="pwa-close-btn"
            onClick={handleDismiss}
            aria-label="Close install notification"
          >
            <X size={18} />
          </button>
        </div>

        <div className="pwa-banner-actions">
          <button className="pwa-btn-dismiss" onClick={handleDismiss}>
            Not Now
          </button>
          <button className="pwa-btn-install" onClick={handleInstallClick}>
            <Download size={15} />
            <span>Install App</span>
          </button>
        </div>
      </aside>

      {/* iOS Safari Instructions Modal */}
      {showIosGuide && (
        <div className="pwa-ios-modal-overlay" onClick={() => setShowIosGuide(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-title">
              <GraduationCap size={22} color="#2563eb" />
              <span>Install on iPhone / iPad</span>
            </div>

            <ul className="pwa-ios-steps">
              <li>
                <span className="pwa-ios-step-num">1</span>
                <span>
                  Tap the Safari <strong>Share</strong> button <span className="pwa-ios-icon-badge"><Share size={13} /></span> at the bottom of the screen.
                </span>
              </li>
              <li>
                <span className="pwa-ios-step-num">2</span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong> <span className="pwa-ios-icon-badge"><PlusSquare size={13} /></span>.
                </span>
              </li>
              <li>
                <span className="pwa-ios-step-num">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
              </li>
            </ul>

            <button
              className="pwa-btn-install"
              style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
              onClick={() => {
                setShowIosGuide(false);
                setShowBanner(false);
                sessionStorage.setItem("pwa_install_dismissed", "true");
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPwaPrompt;

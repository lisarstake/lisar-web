import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "lisar-install-dismissed";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  const isiOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
  }, []);

  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const iOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return displayModeStandalone || iOSStandalone;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const canShow = !dismissed && !isStandalone && isMobile && (Boolean(deferredPrompt) || isiOS);

  if (!canShow) return null;

  const onInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const onDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-4 z-[70] mx-auto w-[min(560px,calc(100%-1.5rem))] rounded-md border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:inset-x-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Install Lisar</p>
          <p className="mt-1 text-xs text-gray-500">
            {deferredPrompt
              ? "Add Lisar to your home screen for faster access."
              : "Tap Share, then choose Add to Home Screen."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              type="button"
              onClick={onInstall}
              className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Add
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

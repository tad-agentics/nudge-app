import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const byMq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (
    navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return Boolean(byMq || iosStandalone);
}

/**
 * PWA install UX — `beforeinstallprompt` where supported; iOS Safari hints otherwise.
 * @see artifacts/docs/tech-spec.md §18
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsStandalone(isStandaloneDisplay());
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    return true;
  }, [deferred]);

  return {
    canPromptInstall: Boolean(deferred),
    promptInstall,
    isIOS,
    isStandalone,
  };
}

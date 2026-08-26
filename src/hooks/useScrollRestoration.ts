// src/hooks/useScrollRestoration.ts
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Remembers scroll position per history entry (persists across the session)
const scrollPositions = new Map<string, number>();

/**
 * Returns `isReady`: false while we're figuring out / applying the correct
 * scroll position after a Back/Forward navigation, true once it's safe to
 * show the page. Wrap your routed content's visibility with this so the
 * user never sees the wrong section (e.g. Footer) flash before the jump.
 */
export function useScrollRestoration(): boolean {
  const location = useLocation();
  const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
  const [isReady, setIsReady] = useState(navType !== "POP");
  const quietTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableHitsRef = useRef(0);
  const lastHeightRef = useRef(0);

  // Save scroll position of the page we're leaving, right before it changes
  useEffect(() => {
    return () => {
      scrollPositions.set(location.key, window.scrollY);
    };
  }, [location]);

  useEffect(() => {
    if (navType !== "POP") {
      // Fresh navigation: no restore needed, just go to top and show immediately
      window.scrollTo(0, 0);
      setIsReady(true);
      return;
    }

    const saved = scrollPositions.get(location.key);
    if (saved == null) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    stableHitsRef.current = 0;
    lastHeightRef.current = 0;

    let settled = false;
    // Hard cap so we never hide the page forever if something never finishes loading
    const maxWait = setTimeout(() => finish(true), 3000);

    function finish(skipCorrections = false) {
      if (settled) return;
      settled = true;
      window.scrollTo(0, saved!);
      requestAnimationFrame(() => setIsReady(true));
      clearTimeout(maxWait);
      observer.disconnect();

      if (!skipCorrections) {
        // Quietly re-correct a few times after reveal, in case a late-loading
        // section (e.g. Blog) shifts the page height right after we showed it.
        // Small enough / soon enough after paint that it isn't perceptible as
        // a "jump" the way the original full glitch was.
        [50, 150, 300, 600].forEach((delay) => {
          setTimeout(() => {
            if (Math.abs(window.scrollY - saved!) > 4) {
              window.scrollTo(0, saved!);
            }
          }, delay);
        });
      }
    }

    // Require the page height to be unchanged across TWO consecutive checks
    // spaced 200ms apart before we consider it "settled" — a single quiet
    // moment isn't enough proof that async sections are done loading.
    const observer = new ResizeObserver(() => {
      const height = document.body.scrollHeight;
      if (height === lastHeightRef.current) {
        return; // ResizeObserver fired but height genuinely didn't change; ignore
      }
      lastHeightRef.current = height;
      stableHitsRef.current = 0;

      if (quietTimerRef.current) clearTimeout(quietTimerRef.current);
      quietTimerRef.current = setTimeout(checkStable, 200);
    });

    function checkStable() {
      const height = document.body.scrollHeight;
      if (height === lastHeightRef.current) {
        stableHitsRef.current += 1;
      } else {
        lastHeightRef.current = height;
        stableHitsRef.current = 1;
      }

      if (stableHitsRef.current >= 2) {
        finish();
      } else {
        quietTimerRef.current = setTimeout(checkStable, 200);
      }
    }

    observer.observe(document.body);
    lastHeightRef.current = document.body.scrollHeight;
    // Kick off the first stability check in case nothing resizes at all
    quietTimerRef.current = setTimeout(checkStable, 200);
    // Apply an early (invisible, since page is hidden) jump so layout is close
    window.scrollTo(0, saved);

    return () => {
      clearTimeout(maxWait);
      if (quietTimerRef.current) clearTimeout(quietTimerRef.current);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navType]);

  return isReady;
}
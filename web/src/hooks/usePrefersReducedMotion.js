import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(callback) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  }

  mediaQuery.addListener(callback);
  return () => mediaQuery.removeListener(callback);
}

function getSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export default function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

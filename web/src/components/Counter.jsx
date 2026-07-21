import { useEffect, useState } from "react";

export default function Counter({
  from = 0,
  to = 0,
  duration = 1200,
  formatter,
  className,
}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const startedAt = performance.now();
    let frameId;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [duration, from, to]);

  return (
    <span className={className}>
      {formatter ? formatter(value) : Math.round(value).toLocaleString()}
    </span>
  );
}

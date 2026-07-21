type ReadingPoint = {
  timestamp: string;
  flowLpm: number;
};

type FlowChartProps = {
  readings: ReadingPoint[];
  loading?: boolean;
};

const SVG_WIDTH = 640;
const SVG_HEIGHT = 220;
const PADDING = {
  top: 18,
  right: 12,
  bottom: 32,
  left: 12,
};

function formatTimeLabel(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function FlowChart({
  readings,
  loading = false,
}: FlowChartProps) {
  const data = [...readings].reverse();

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-7 w-14 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-[200px] animate-pulse rounded-xl bg-muted/50" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Flow Rate</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time water flow (L/min)
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Live
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
          No telemetry history available yet.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-[200px] w-full overflow-visible"
          role="img"
          aria-label="Water flow trend chart"
        >
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: 4 }).map((_, index) => {
            const y =
              PADDING.top +
              (index / 3) * (SVG_HEIGHT - PADDING.top - PADDING.bottom);

            return (
              <line
                key={index}
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray="4 6"
              />
            );
          })}

          {(() => {
            const maxFlow = Math.max(...data.map((point) => point.flowLpm), 1);
            const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
            const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;
            const points = data.map((point, index) => {
              const x =
                PADDING.left +
                (index / Math.max(data.length - 1, 1)) * chartWidth;
              const y =
                PADDING.top + chartHeight - (point.flowLpm / maxFlow) * chartHeight;

              return { ...point, x, y };
            });

            const linePath = points
              .map((point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
              )
              .join(" ");
            const areaPath = [
              `M ${points[0]?.x.toFixed(2)} ${(SVG_HEIGHT - PADDING.bottom).toFixed(2)}`,
              ...points.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
              `L ${points[points.length - 1]?.x.toFixed(2)} ${(SVG_HEIGHT - PADDING.bottom).toFixed(2)}`,
              "Z",
            ].join(" ");
            const labelIndexes = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
              Math.min(data.length - 1, Math.round((data.length - 1) * ratio)),
            );

            return (
              <>
                <path d={areaPath} fill="url(#flowGradient)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={points[points.length - 1]?.x}
                  cy={points[points.length - 1]?.y}
                  r="5"
                  fill="hsl(var(--primary))"
                />

                {labelIndexes.map((pointIndex, index) => {
                  const point = points[pointIndex];

                  return (
                    <text
                      key={`${point.timestamp}-${index}`}
                      x={point.x}
                      y={SVG_HEIGHT - 8}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="11"
                      textAnchor={index === 0 ? "start" : index === labelIndexes.length - 1 ? "end" : "middle"}
                    >
                      {formatTimeLabel(point.timestamp)}
                    </text>
                  );
                })}
              </>
            );
          })()}
        </svg>
      )}
    </section>
  );
}

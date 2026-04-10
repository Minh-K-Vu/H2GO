type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
};

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">
        {value}{" "}
        {unit && (
          <span className="text-base font-medium text-zinc-600">{unit}</span>
        )}
      </p>
      {subtitle && <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}

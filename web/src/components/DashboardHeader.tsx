type DashboardHeaderProps = {
  title: string;
  description: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
};

export default function DashboardHeader({
  title,
  description,
  lastUpdated,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>

        <p className="mt-2 text-xs text-zinc-500">
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
            : "No successful refresh yet"}
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Refresh
      </button>
    </header>
  );
}

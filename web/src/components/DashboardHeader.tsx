type DashboardHeaderProps = {
  title: string;
  description: string;
};

export default function DashboardHeader({
  title,
  description,
}: DashboardHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </header>
  );
}

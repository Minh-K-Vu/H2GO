type ValveControlCardProps = {
  state: "Open" | "Closed";
  buttonLabel: string;
};

export default function ValveControlCard({
  state,
  buttonLabel,
}: ValveControlCardProps) {
  const isOpen = state === "Open";

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <p className="text-sm font-medium text-zinc-600">Valve Control</p>
      <p className="mt-2 text-lg font-semibold text-zinc-900">{state}</p>
      <button
        className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-medium text-white ${
          isOpen
            ? "bg-red-600 hover:bg-red-500"
            : "bg-green-600 hover:bg-green-500"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

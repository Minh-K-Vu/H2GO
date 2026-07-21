export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050d1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <div className="h-5 w-5 rounded-full border-2 border-white/80 border-t-transparent" />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    </div>
  );
}

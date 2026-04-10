type SafetyBannerProp = {
  status: "safe" | "warning" | "danger";
  message: string;
};

export default function SafetyBanner({ status, message }: SafetyBannerProp) {
  let bannerClasses = "bg-green-100 text-green-800";

  if (status === "warning") {
    bannerClasses = "bg-yellow-100 text-yellow-800";
  }

  if (status === "danger") {
    bannerClasses = "bg-red-100 text-red-800";
  }

  return (
    <section
      className={`mb-6 rounded-xl px-4 py-3 text-sm font-semibold ${bannerClasses}`}
    >
      {message}
    </section>
  );
}

import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import MarketingNav from "@/components/MarketingNav";
import "@/app/globals.css";
import "leaflet/dist/leaflet.css";

export default function Base44PagesApp({ Component, pageProps }) {
  const Router = typeof window === "undefined" ? MemoryRouter : BrowserRouter;
  const fullBleed = Component.fullBleed === true;
  const hideMarketingNav = Component.hideMarketingNav === true;

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-deep text-white">
          {hideMarketingNav ? null : <MarketingNav />}
          <main
            className={
              fullBleed || hideMarketingNav
                ? "min-h-screen bg-deep"
                : "min-h-screen bg-deep pt-14"
            }
          >
            <Component {...pageProps} />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

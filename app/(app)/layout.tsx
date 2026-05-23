import { AppNav } from "@/components/layout/AppNav";
import { MiniPlayer } from "@/components/layout/MiniPlayer";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Footer } from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineBanner />
      <AppNav />
      {/* Offset for fixed navbar */}
      <main className="pt-16 pb-36 md:pb-20 flex-1">
        {children}
      </main>
      <Footer />
      <MiniPlayer />
    </div>
  );
}


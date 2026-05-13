import { AppNav } from "@/components/layout/AppNav";
import { MiniPlayer } from "@/components/layout/MiniPlayer";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <AppNav />
      {/* Offset for fixed navbar */}
      <main className="pt-16 pb-20">
        {children}
      </main>
      <MiniPlayer />
    </div>
  );
}


"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// /audio/[slug] redirects to /podcast/[slug] — they share the same player
export default function AudioRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    router.replace(`/podcast/${slug}`);
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

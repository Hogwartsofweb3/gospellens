"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText, Video, Mic, Info, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: "new_content" | "ministry" | "billing" | "system";
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_content: <FileText size={15} className="text-secondary" />,
  ministry: <Video size={15} className="text-primary" />,
  billing: <Mic size={15} className="text-yellow-400" />,
  system: <Megaphone size={15} className="text-text-secondary" />,
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-full text-text-secondary hover:text-white hover:bg-elevated transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-[380px] max-h-[480px] flex flex-col rounded-xl border border-[#2A2A2A] shadow-2xl overflow-hidden"
            style={{ background: "#1A1A1A" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] flex-shrink-0">
              <span className="text-white font-poppins font-semibold text-sm">Notifications</span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-primary text-xs hover:underline">
                    Mark all as read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#2A2A2A]">
              {loading && (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-text-secondary gap-2">
                  <Bell size={36} strokeWidth={1} className="opacity-30" />
                  <p className="text-sm">You're all caught up 🎉</p>
                </div>
              )}

              {!loading && notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markRead(n.id); setOpen(false); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors relative ${
                    !n.is_read ? "border-l-2 border-primary" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center flex-shrink-0 mt-0.5">
                    {TYPE_ICON[n.type] || <Info size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.is_read ? "text-text-secondary" : "text-white font-medium"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-text-secondary text-xs mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-text-secondary text-xs mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

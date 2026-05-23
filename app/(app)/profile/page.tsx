"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, BookOpen, Users, Bell, Sun, Moon,
  LogOut, Shield, FileText, HelpCircle,
  Camera, Check, CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";


// ─── Types ────────────────────────────────────────────────
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_topics: string[];
}

interface Ministry {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_verified: boolean;
}

type Section =
  | "profile" | "topics" | "follows"
  | "notifications" | "appearance";

const ALL_TOPICS = [
  "Bible Study", "Theology", "Sermons", "Devotionals", "Prayer",
  "Worship", "Evangelism", "Church History", "Youth & Teens",
  "Family & Marriage", "Leadership", "Healing & Miracles",
];

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; dividerAfter?: boolean }[] = [
  { id: "profile", label: "My Profile", icon: <User size={16} /> },
  { id: "topics", label: "My Topics", icon: <BookOpen size={16} /> },
  { id: "follows", label: "Ministries I Follow", icon: <Users size={16} />, dividerAfter: true },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "appearance", label: "Appearance", icon: <Sun size={16} />, dividerAfter: true },
];

// ─── Main Component ────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/signin"); return; }
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      setProfile(data || { id: user.id, email: user.email || "", full_name: null, avatar_url: null, preferred_topics: [] });
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-2"
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1100px] mx-auto px-4 pt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT SIDEBAR ── */}
          <aside className="lg:w-[260px] flex-shrink-0">
            {/* User Identity */}
            <div className="flex flex-col items-center text-center mb-6 p-5 bg-surface rounded-2xl border border-elevated">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-elevated border-2 border-primary mb-3 relative">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {(profile?.full_name || profile?.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-poppins font-bold text-white text-lg leading-tight">
                {profile?.full_name || "Gospel Lens User"}
              </p>
              <p className="text-text-secondary text-xs mt-0.5 font-inter">{profile?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-elevated text-text-secondary">
                Member
              </span>
            </div>

            {/* Nav */}
            <nav className="bg-surface rounded-2xl border border-elevated overflow-hidden">
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                      activeSection === item.id
                        ? "text-primary border-l-2 border-primary bg-primary/5"
                        : "text-text-secondary hover:text-white hover:bg-elevated border-l-2 border-transparent"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                  {item.dividerAfter && <div className="border-t border-elevated" />}
                </div>
              ))}

              {/* External Links */}
              <div className="border-t border-elevated">
                {[
                  { href: "/privacy-policy", label: "Privacy Policy", icon: <Shield size={16} /> },
                  { href: "/terms", label: "Terms of Service", icon: <FileText size={16} /> },
                  { href: "mailto:info.gospellens@gmail.com", label: "Help & Support", icon: <HelpCircle size={16} /> },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-white hover:bg-elevated transition-colors"
                  >
                    {link.icon} {link.label}
                  </a>
                ))}
              </div>

              <div className="border-t border-elevated">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-red-400 hover:bg-elevated transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── RIGHT CONTENT PANEL ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === "profile" && (
                  <ProfileSection profile={profile} setProfile={setProfile} showToast={showToast} />
                )}
                {activeSection === "topics" && (
                  <TopicsSection profile={profile} setProfile={setProfile} showToast={showToast} />
                )}
                {activeSection === "follows" && (
                  <FollowsSection />
                )}
                {activeSection === "notifications" && (
                  <NotificationsSection showToast={showToast} />
                )}
                {activeSection === "appearance" && (
                  <AppearanceSection showToast={showToast} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Section ───────────────────────────────────────
function ProfileSection({ profile, setProfile, showToast }: {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  showToast: (msg: string) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("users").update({ full_name: name }).eq("id", profile.id);
    setProfile({ ...profile, full_name: name });
    showToast("Profile updated!");
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
      showToast("Avatar updated!");
    }
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl text-white mb-6">My Profile</h2>
      <div className="bg-surface rounded-2xl border border-elevated p-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-full overflow-hidden bg-elevated border-2 border-elevated hover:border-primary transition-colors cursor-pointer relative group"
            onClick={() => fileRef.current?.click()}
          >
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {(profile?.full_name || profile?.email || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div>
            <p className="text-white font-medium">{profile?.full_name || "Set your name"}</p>
            <p className="text-text-secondary text-sm">{profile?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="text-primary text-sm mt-1 hover:underline">
              Change avatar
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm font-medium mb-1.5 block">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-background border border-elevated rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-text-secondary text-sm font-medium mb-1.5 block">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full bg-background/50 border border-elevated rounded-xl px-4 py-3 text-text-secondary text-sm cursor-not-allowed"
            />
            <p className="text-text-secondary text-xs mt-1">Email cannot be changed here.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary rounded-full text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topics Section ────────────────────────────────────────
function TopicsSection({ profile, setProfile, showToast }: {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  showToast: (msg: string) => void;
}) {
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>(profile?.preferred_topics || []);
  const [saving, setSaving] = useState(false);

  const toggle = (topic: string) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("users").update({ preferred_topics: selected }).eq("id", profile.id);
    setProfile({ ...profile, preferred_topics: selected });
    showToast("Topics saved!");
    setSaving(false);
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl text-white mb-2">My Topics</h2>
      <p className="text-text-secondary text-sm mb-6">Choose the topics you care about most.</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {ALL_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => toggle(topic)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              selected.includes(topic)
                ? "bg-primary border-primary text-white"
                : "bg-surface border-elevated text-text-secondary hover:border-white/30 hover:text-white"
            }`}
          >
            {selected.includes(topic) && <Check size={12} className="inline mr-1" />}
            {topic}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-primary rounded-full text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

// ─── Follows Section ───────────────────────────────────────
function FollowsSection() {
  const supabase = createClient();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_follows")
        .select("ministries(id, name, slug, logo_url, is_verified)")
        .eq("user_id", user.id);
      setMinistries(((data || []).map((r: any) => r.ministries).filter(Boolean)) as Ministry[]);
      setLoading(false);
    }
    load();
  }, []);

  const unfollow = async (ministryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_follows").delete().eq("user_id", user.id).eq("ministry_id", ministryId);
    setMinistries((prev) => prev.filter((m) => m.id !== ministryId));
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl text-white mb-6">Ministries I Follow</h2>
      {loading && <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
      {!loading && ministries.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-white mb-1">You haven't followed any ministries yet.</p>
          <Link href="/discover" className="text-primary text-sm hover:underline">Discover ministries →</Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ministries.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-elevated">
            <Link href={`/ministry/${m.slug}`} className="w-10 h-10 rounded-full bg-elevated overflow-hidden flex-shrink-0">
              {m.logo_url ? (
                <Image src={m.logo_url} alt={m.name} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">{m.name[0]}</div>
              )}
            </Link>
            <Link href={`/ministry/${m.slug}`} className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate flex items-center gap-1">
                {m.name}
                {m.is_verified && <CheckCircle size={12} className="text-secondary flex-shrink-0" />}
              </p>
            </Link>
            <button
              onClick={() => unfollow(m.id)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-elevated text-text-secondary hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Unfollow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications Section ─────────────────────────────────
function NotificationsSection({ showToast }: { showToast: (msg: string) => void }) {
  const [prefs, setPrefs] = useState({
    new_content: true,
    weekly_digest: true,
    announcements: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      showToast("Notification settings saved");
      return next;
    });
  };

  const items = [
    { key: "new_content" as const, label: "New content from followed ministries", desc: "Get notified when your ministries post new content." },
    { key: "weekly_digest" as const, label: "Weekly digest email", desc: "A curated list of the best content from the past week." },
    { key: "announcements" as const, label: "New features & announcements", desc: "Hear about new features and platform updates." },
  ];

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl text-white mb-6">Notifications</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-elevated">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-text-secondary text-xs mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${prefs[item.key] ? "bg-primary" : "bg-elevated"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[item.key] ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appearance Section ────────────────────────────────────────────────
function AppearanceSection({ showToast }: { showToast: (msg: string) => void }) {
  const [isDark, setIsDark] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("gl-theme");
    const prefersDark = saved !== "light";
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("light-mode", !prefersDark);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light-mode", !next);
      localStorage.setItem("gl-theme", next ? "dark" : "light");
      showToast(next ? "Dark mode enabled" : "Light mode enabled");
      return next;
    });
  };

  return (
    <div>
      <h2 className="font-poppins font-bold text-2xl text-white mb-6">Appearance</h2>
      <div className="bg-surface rounded-xl border border-elevated p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-white text-sm font-medium flex items-center gap-2">
            {isDark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            {isDark ? "Dark Mode" : "Light Mode"}
          </p>
          <p className="text-text-secondary text-xs mt-0.5">
            {isDark ? "Gospel Lens is optimised for dark mode. Recommended." : "Light mode uses a lighter background."}
          </p>
        </div>
        <button
          onClick={toggle}
          className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-elevated border border-border"}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-5" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}

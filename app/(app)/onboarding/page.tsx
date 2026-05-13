"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Music, BookOpen, Video, Heart, Home,
  Users, Flame, Star, Book, Sparkles, UserPlus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

const TOPICS = [
  { id: "worship", label: "Worship", icon: Music },
  { id: "sermons", label: "Sermons", icon: Video },
  { id: "prayer", label: "Prayer", icon: Heart },
  { id: "prophecy", label: "Prophecy", icon: Sparkles },
  { id: "devotionals", label: "Devotionals", icon: BookOpen },
  { id: "family", label: "Family & Marriage", icon: Home },
  { id: "youth", label: "Youth & Teens", icon: Users },
  { id: "evangelism", label: "Evangelism", icon: Flame },
  { id: "bible_study", label: "Bible Study", icon: Book },
  { id: "healing", label: "Healing & Miracles", icon: Star },
  { id: "leadership", label: "Leadership", icon: UserPlus },
  { id: "women", label: "Women of Faith", icon: Users },
];

export default function OnboardingPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({ preferred_topics: selectedTopics })
        .eq("id", user.id);
    }
    router.push("/home");
  };

  const isValid = selectedTopics.length >= 3;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-text-primary">
      <div className="max-w-4xl w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-3">
            What moves your spirit?
          </h1>
          <p className="text-text-secondary max-w-lg">
            Pick at least 3 topics to personalise your feed. You can change these anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-10">
          {TOPICS.map((topic, i) => {
            const isSelected = selectedTopics.includes(topic.id);
            const Icon = topic.icon;
            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleTopic(topic.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? "bg-primary/10 border-primary text-white shadow-glow-pink scale-105"
                    : "bg-elevated border-border text-white hover:border-primary/50"
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-primary" : "text-primary/60"}`} />
                <span className="font-medium text-sm text-center">{topic.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <p className="text-sm font-medium">
            <span className={isValid ? "text-primary font-bold" : "text-text-secondary"}>
              {selectedTopics.length}
            </span>
            <span className="text-text-secondary"> of 3 minimum selected</span>
          </p>

          <button
            onClick={handleSave}
            disabled={!isValid || loading}
            className="w-full py-3.5 bg-primary text-white font-semibold rounded-pill hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow-pink"
          >
            {loading ? "Saving..." : "Continue to Gospel Lens →"}
          </button>

          <button
            onClick={() => router.push("/home")}
            className="text-sm text-text-muted hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

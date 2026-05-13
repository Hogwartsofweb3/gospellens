"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Check, Sparkles, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = ["$2", "$5", "$10", "$20"];

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [tab, setTab] = useState<"donate" | "supporter">("donate");
  const [selectedAmount, setSelectedAmount] = useState("$5");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const finalAmount = selectedAmount === "Custom" ? customAmount : selectedAmount.replace("$", "");

  const handleDonate = async () => {
    setError(null);
    const amt = parseFloat(finalAmount);
    if (!amt || amt < 1) { setError("Minimum donation is $1."); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("users").select("full_name, email").eq("id", user?.id || "").single();
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "donation",
          amount: amt.toString(),
          userId: user?.id,
          userEmail: user?.email,
          userName: profile?.full_name || "",
        }),
      });
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      window.location.href = url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleSupporter = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("users").select("full_name").eq("id", user?.id || "").single();
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "supporter",
          userId: user?.id,
          userEmail: user?.email,
          userName: profile?.full_name || "",
        }),
      });
      const { url, error: apiError } = await res.json();
      if (apiError) throw new Error(apiError);
      window.location.href = url;
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl"
            style={{
              background: "#1A1A1A",
              borderColor: "#E040A0",
              boxShadow: "0 0 60px rgba(224,64,160,0.15)",
            }}
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:text-white hover:bg-elevated transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Heart size={32} className="text-primary" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="font-poppins font-bold text-[22px] text-white text-center mb-1">
                Support Gospel Lens
              </h2>
              <p className="text-text-secondary text-sm text-center mb-6">
                All content is free. Your support keeps it that way. 🙏
              </p>

              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-background p-1 mb-6 gap-1">
                <button
                  onClick={() => setTab("donate")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === "donate" ? "bg-primary text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <Heart size={13} className="inline mr-1.5" />
                  One-time Donation
                </button>
                <button
                  onClick={() => setTab("supporter")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === "supporter" ? "bg-primary text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <Sparkles size={13} className="inline mr-1.5" />
                  Supporter ($1.99/mo)
                </button>
              </div>

              {/* Donate Tab */}
              {tab === "donate" && (
                <div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                          selectedAmount === amt
                            ? "bg-primary border-primary text-white"
                            : "bg-surface border-elevated text-text-secondary hover:border-primary/50 hover:text-white"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedAmount("Custom")}
                    className={`w-full mb-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      selectedAmount === "Custom"
                        ? "border-primary text-primary"
                        : "border-elevated text-text-secondary hover:border-primary/50 hover:text-white"
                    }`}
                  >
                    Custom amount
                  </button>
                  {selectedAmount === "Custom" && (
                    <div className="relative mb-3">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-background border border-elevated rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}
                  {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                  <button
                    onClick={handleDonate}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <><Heart size={15} /> Donate {selectedAmount !== "Custom" ? selectedAmount : customAmount ? `$${customAmount}` : ""}</>
                    )}
                  </button>
                </div>
              )}

              {/* Supporter Tab */}
              {tab === "supporter" && (
                <div>
                  <div className="bg-background rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown size={16} className="text-primary" />
                      <span className="text-white font-semibold text-sm">What you get</span>
                    </div>
                    <ul className="space-y-1.5">
                      {[
                        "✦ Supporter badge on your profile",
                        "Early access to new features",
                        "Priority feedback channel",
                        "7-day free trial — cancel anytime",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check size={13} className="text-primary flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
                  <button
                    onClick={handleSupporter}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <><Sparkles size={15} /> Start 7-Day Free Trial</>
                    )}
                  </button>
                  <p className="text-text-secondary text-xs text-center mt-2">
                    $1.99/month after trial · Cancel anytime
                  </p>
                </div>
              )}

              {/* Maybe later */}
              <button
                onClick={onClose}
                className="w-full mt-4 text-text-secondary text-sm hover:text-white transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TOPICS = [
  "Salvation & Grace",
  "The Trinity",
  "Prayer & Fasting",
  "Bible Interpretation",
  "Church & Ministry",
  "Christian Living",
  "End Times",
  "Other",
];

export default function AskPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const charCount = question.length;
  const maxChars = 2000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || question.trim().length < 10) {
      setError("Please write a more detailed question.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fullQuestion = topic ? `[${topic}]\n\n${question.trim()}` : question.trim();
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question: fullQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-elevated px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-inter">Back</span>
        </button>
      </div>

      <div className="max-w-[640px] mx-auto px-5 pt-10">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <h1 className="font-poppins font-bold text-white text-2xl mb-3">Question Received!</h1>
              <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Thank you for reaching out. Our team will look into your question and we may feature the answer on Gospel Lens.
                {email && " A confirmation has been sent to your email."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setSuccess(false); setName(""); setEmail(""); setTopic(""); setQuestion(""); }}
                  className="px-6 py-2.5 rounded-full border border-elevated text-text-secondary hover:text-white hover:border-white/30 transition-colors text-sm"
                >
                  Ask Another Question
                </button>
                <Link
                  href="/home"
                  className="px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-glow-pink text-center"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Page header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-primary uppercase">Ask a Question</span>
              </div>
              <h1 className="font-poppins font-bold text-white text-[28px] leading-tight mb-3">
                Got a theology question?
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Ask anything about the Christian faith — doctrine, Scripture, church life, or practical Christian living. Our team reads every question.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Your Name <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Timothy"
                      maxLength={80}
                      className="w-full bg-surface border border-elevated rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Email <span className="text-text-muted font-normal normal-case tracking-normal">(for a reply)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-surface border border-elevated rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                    Topic <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(topic === t ? "" : t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          topic === t
                            ? "bg-primary border-primary text-white"
                            : "border-elevated text-text-secondary hover:border-primary/40 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                    Your Question <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value.slice(0, maxChars))}
                    placeholder="Write your theology or Christian life question here..."
                    rows={7}
                    required
                    className="w-full bg-surface border border-elevated rounded-xl px-4 py-3 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors resize-none leading-relaxed"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-text-muted text-xs">Be as specific as possible — it helps us give a better answer.</p>
                    <p className={`text-xs ${charCount > maxChars * 0.9 ? "text-amber-400" : "text-text-muted"}`}>
                      {charCount}/{maxChars}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {loading ? "Sending..." : "Send Question"}
                </button>

                <p className="text-text-muted text-xs text-center">
                  We read every question. Selected answers may be published on Gospel Lens.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

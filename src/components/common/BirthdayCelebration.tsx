import React, { useState, useEffect } from "react";
import { Gift, X, Sparkles, Copy, Check, MessageCircle, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Celebrant {
  id: string;
  name: string;
  dob: string;
  type: "member" | "kid";
  image_url?: string;
}

interface BirthdayCelebrationProps {
  celebrants: Celebrant[];
  onDismiss: () => void;
}

export default function BirthdayCelebration({ celebrants, onDismiss }: BirthdayCelebrationProps) {
  const [activeWishIndex, setActiveWishIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; color: string; delay: string; size: string; rotate: string }>>([]);
  const [balloons, setBalloons] = useState<Array<{ id: number; left: string; color: string; delay: string; scale: number }>>([]);

  const birthdayWishes = [
    (name: string) => `Happy Birthday, ${name}! 🎉 Wishing you a blessed day filled with joy, peace, and God's love. We appreciate you being part of our church family! ✨`,
    (name: string) => `Wishing you a very Happy Birthday, ${name}! May the Lord bless you abundantly on your special day and guide your steps in the year ahead. Have a wonderful celebration! 🎂🙏`,
    (name: string) => `Happy Birthday, ${name}! 🌟 We celebrate the wonderful person you are today. May your day be filled with laughter, love, and sweet memories. God bless you! ❤️`
  ];

  useEffect(() => {
    // Generate confetti config
    const colors = ["#ff4a5a", "#ffdea9", "#0ea5e9", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"];
    const generatedConfetti = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 2}s`,
      size: `${Math.random() * 8 + 6}px`,
      rotate: `${Math.random() * 360}deg`
    }));
    setConfetti(generatedConfetti);

    // Generate balloons config
    const balloonColors = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
    const generatedBalloons = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
      delay: `${Math.random() * 1.5}s`,
      scale: Math.random() * 0.4 + 0.8
    }));
    setBalloons(generatedBalloons);
  }, []);

  const handleCopyWish = (name: string, wishFn: (n: string) => string) => {
    const text = wishFn(name);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (celebrants.length === 0) return null;

  return (
    <>
      {/* Balloon & Confetti Container (Behind Card for sleek look) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem] z-0">
        {/* Floating Balloons */}
        {balloons.map((b) => (
          <div
            key={b.id}
            className="absolute bottom-0 w-8 h-10 rounded-t-[50%] rounded-b-[45%] flex flex-col items-center opacity-65 animate-float-balloon"
            style={{
              left: b.left,
              backgroundColor: b.color,
              animationDelay: b.delay,
              transform: `scale(${b.scale})`,
              boxShadow: `inset -4px -6px 12px rgba(0,0,0,0.15), 0 8px 16px ${b.color}33`,
            }}
          >
            {/* Balloon knot */}
            <div className="w-1.5 h-1.5 border-t-[4px] border-t-current border-x-[3px] border-x-transparent mt-[40px] opacity-90" style={{ color: b.color }} />
            {/* String */}
            <div className="w-0.5 h-12 bg-on-surface-variant/20 -mt-[2px]" />
          </div>
        ))}

        {/* Falling Confetti */}
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute -top-4 rounded-xs opacity-75 animate-confetti-fall"
            style={{
              left: c.left,
              backgroundColor: c.color,
              width: c.size,
              height: c.size,
              animationDelay: c.delay,
              transform: `rotate(${c.rotate})`,
            }}
          />
        ))}
      </div>

      {/* Celebration Notification Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative z-10 w-full bg-linear-to-br from-primary via-primary-container to-[#00172e] border border-outline-variant/20 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-primary/10 overflow-hidden mb-8"
      >
        {/* Glowing background shapes */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-tertiary-fixed/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 pointer-events-auto"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed text-primary flex items-center justify-center shrink-0 shadow-lg shadow-tertiary-fixed/20 animate-bounce">
              <Gift size={32} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-tertiary-fixed/20 text-tertiary-fixed px-3 py-1 rounded-full">
                  Celebration Time
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-pink-300">
                  <Sparkles size={12} className="animate-pulse" />
                  Today's Birthday
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black mt-2 text-white">
                Happy Birthday wishes are in order!
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Say him/her a beautiful wish and make their day special!
              </p>
            </div>
          </div>
        </div>

        {/* Celebrants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pointer-events-auto">
          {celebrants.map((c) => (
            <div
              key={c.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-tertiary-fixed"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-tertiary-fixed/25 text-tertiary-fixed font-black flex items-center justify-center border-2 border-tertiary-fixed/30 text-lg">
                    {c.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-tertiary-fixed transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-[10px] uppercase font-black tracking-wider text-tertiary-fixed-dim/80">
                    {c.type === "kid" ? "🧒 Kids Ministry" : "👤 Church Member"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveWishIndex(activeWishIndex === celebrants.indexOf(c) ? null : celebrants.indexOf(c))}
                className="px-4 py-2 bg-tertiary-fixed text-primary font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-tertiary-fixed/10 flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                Wish
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Custom Birthday Wish Overlay Modal */}
      <AnimatePresence>
        {activeWishIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-surface border border-outline-variant/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Sparkle background details */}
              <div className="absolute top-4 right-10 text-tertiary-fixed-dim/20 animate-spin-slow">
                <Star size={64} fill="currentColor" />
              </div>
              <div className="absolute bottom-6 left-6 text-pink-500/10">
                <Heart size={48} fill="currentColor" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveWishIndex(null);
                  setCopied(false);
                }}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all"
              >
                <X size={16} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-heading font-black text-on-surface">
                  Send a Wish to {celebrants[activeWishIndex].name}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Select a template to copy or send directly!
                </p>
              </div>

              {/* Wish Templates */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar max-h-[45vh]">
                {birthdayWishes.map((wishFn, index) => {
                  const wishText = wishFn(celebrants[activeWishIndex!].name);
                  return (
                    <div
                      key={index}
                      className="p-4 bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 hover:border-primary/20 rounded-2xl relative transition-all duration-300 group"
                    >
                      <p className="text-xs text-on-surface font-medium leading-relaxed mb-3">
                        {wishText}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-primary/40 tracking-wider">
                          Option {index + 1}
                        </span>
                        <button
                          onClick={() => handleCopyWish(celebrants[activeWishIndex!].name, wishFn)}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-tertiary-fixed-dim transition-colors py-1 px-2.5 rounded-lg bg-surface/50 border border-outline-variant/10"
                        >
                          {copied ? (
                            <>
                              <Check size={14} className="text-green-500" />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Template</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`tel:${(celebrants[activeWishIndex] as any).phone || ""}`}
                  className="flex-1 py-3.5 bg-primary text-on-primary hover:opacity-90 font-bold text-sm rounded-xl text-center shadow-lg transition-all"
                >
                  Call Now
                </a>
                <button
                  onClick={() => {
                    setActiveWishIndex(null);
                    setCopied(false);
                  }}
                  className="flex-1 py-3.5 bg-surface-container-low text-on-surface hover:bg-surface-container font-bold text-sm rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inject Floating Balloon & Confetti Animations to document styles */}
      <style>{`
        @keyframes floatBalloon {
          0% {
            transform: translateY(120vh) rotate(0deg);
          }
          100% {
            transform: translateY(-20vh) rotate(15deg);
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(120vh) rotate(360deg);
          }
        }
        .animate-float-balloon {
          animation: floatBalloon 15s linear infinite;
        }
        .animate-confetti-fall {
          animation: confettiFall 7s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>
    </>
  );
}

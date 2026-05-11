import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Camera, Phone, FileText, Bell, Shield,
  Save, CheckCircle, AlertCircle, Loader, Eye, EyeOff,
  Lock, Palette, Globe, LogOut, Upload, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

const ROLE_CONFIG = {
  admin: { label: "Administrator", color: "text-red-500", bg: "bg-red-500/10", gradient: "from-red-500 to-orange-500" },
  shepherd: { label: "Shepherd", color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-teal-500" },
  bible_leader: { label: "Bible Leader", color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500 to-indigo-500" },
  finance: { label: "Finance Officer", color: "text-amber-500", bg: "bg-amber-500/10", gradient: "from-amber-500 to-yellow-500" },
  youth_ministry: { label: "Youth Ministry", color: "text-purple-500", bg: "bg-purple-500/10", gradient: "from-purple-500 to-pink-500" },
  management: { label: "Management", color: "text-indigo-500", bg: "bg-indigo-500/10", gradient: "from-indigo-500 to-blue-500" },
  kids_ministry: { label: "Kids Ministry", color: "text-pink-500", bg: "bg-pink-500/10", gradient: "from-pink-500 to-rose-500" },
};

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Notification state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifApp, setNotifApp] = useState(true);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, bio, avatar_url, notification_email, notification_app")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || null);
      setNotifEmail(data.notification_email ?? true);
      setNotifApp(data.notification_app ?? true);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5MB", "error");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(cacheBustedUrl);

      await supabase.from("profiles").update({ avatar_url: cacheBustedUrl }).eq("id", user.id);
      showToast("Profile photo updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload photo", "error");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim(), bio: bio.trim() })
        .eq("id", user.id);
      if (error) throw error;
      showToast("Profile saved successfully!");
    } catch (err) {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_email: notifEmail, notification_app: notifApp })
        .eq("id", user.id);
      if (error) throw error;
      showToast("Notification preferences saved!");
    } catch (err) {
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[2000] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-primary/40 mt-1 font-medium">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Profile Card + Tab Nav */}
        <div className="lg:w-72 flex flex-col gap-4">
          {/* Avatar Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[28px] shadow-xl border border-white/20 p-6 flex flex-col items-center gap-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-[28px] overflow-hidden shadow-lg bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center`}>
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{fullName?.charAt(0) || user?.email?.charAt(0) || "?"}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                {uploading ? <Loader size={15} className="animate-spin" /> : <Camera size={15} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="text-center">
              <h3 className="font-black text-primary text-base">{fullName || "Your Name"}</h3>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleConfig.bg} ${roleConfig.color}`}>
                <Shield size={10} />
                {roleConfig.label}
              </div>
            </div>

            <div className="w-full pt-4 border-t border-primary/5 text-center">
              <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Member Since</p>
              <p className="text-sm font-black text-primary/60 mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[24px] shadow-xl border border-white/20 p-2 flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-[18px] text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg"
                    : "text-primary/60 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Tab Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSaveProfile} className="bg-white/60 backdrop-blur-xl rounded-[28px] shadow-xl border border-white/20 p-6 flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-black text-primary">Personal Information</h2>
                    <p className="text-xs text-primary/40 mt-0.5">Update your name, phone and bio</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm text-primary placeholder:text-primary/30 focus:ring-2 ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+251 9XX XXX XXX"
                          className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm text-primary placeholder:text-primary/30 focus:ring-2 ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block">Bio / Ministry Description</label>
                      <div className="relative">
                        <FileText size={16} className="absolute left-4 top-4 text-primary/30" />
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="A short description about your ministry role..."
                          rows={4}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm text-primary placeholder:text-primary/30 focus:ring-2 ring-primary/20 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Role info (read-only) */}
                    <div className="bg-surface-container-low rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-3">System Role (Read-Only)</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${roleConfig.bg} ${roleConfig.color}`}>
                        <Shield size={14} />
                        {roleConfig.label}
                      </div>
                      <p className="text-xs text-primary/40 mt-2">Your role can only be changed by an Administrator.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-60"
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <form onSubmit={handleChangePassword} className="bg-white/60 backdrop-blur-xl rounded-[28px] shadow-xl border border-white/20 p-6 flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-black text-primary">Change Password</h2>
                    <p className="text-xs text-primary/40 mt-0.5">Use a strong password with at least 8 characters</p>
                  </div>

                  {[
                    { label: "New Password", value: newPassword, setter: setNewPassword, show: showNewPw, toggle: () => setShowNewPw(p => !p), placeholder: "At least 8 characters" },
                    { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, show: showNewPw, toggle: () => setShowNewPw(p => !p), placeholder: "Repeat new password" },
                  ].map(({ label, value, setter, show, toggle, placeholder }) => (
                    <div key={label}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2 block">{label}</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" />
                        <input
                          type={show ? "text" : "password"}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-11 pr-12 text-sm text-primary placeholder:text-primary/30 focus:ring-2 ring-primary/20 outline-none transition-all"
                        />
                        <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors">
                          {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {newPassword && newPassword === confirmPassword && (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                      <CheckCircle size={14} /> Passwords match
                    </div>
                  )}
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                      <AlertCircle size={14} /> Passwords do not match
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving || !newPassword || newPassword !== confirmPassword}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-40"
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />}
                    Update Password
                  </button>
                </form>

                {/* Sign out all sessions */}
                <div className="bg-red-50 border border-red-100 rounded-[24px] p-5 flex items-center justify-between">
                  <div>
                    <p className="font-black text-sm text-red-600">Sign Out Everywhere</p>
                    <p className="text-xs text-red-400 mt-0.5">Log out from all devices and browsers</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-black text-xs hover:bg-red-600 transition-all"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white/60 backdrop-blur-xl rounded-[28px] shadow-xl border border-white/20 p-6 flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-black text-primary">Notification Preferences</h2>
                    <p className="text-xs text-primary/40 mt-0.5">Choose how you want to be notified</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { label: "In-App Notifications", desc: "Get notified for new messages and updates inside the app", value: notifApp, setter: setNotifApp, icon: Bell },
                      { label: "Email Notifications", desc: "Receive email alerts for important church updates", value: notifEmail, setter: setNotifEmail, icon: Globe },
                    ].map(({ label, desc, value, setter, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 grid place-items-center shrink-0">
                            <Icon size={18} className="text-primary/60" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary">{label}</p>
                            <p className="text-xs text-primary/40 mt-0.5">{desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setter(p => !p)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ml-4 ${value ? "bg-primary" : "bg-primary/20"}`}
                        >
                          <motion.div
                            animate={{ x: value ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-60"
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import { fetchAPI } from "../lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    date_of_birth: "",
    country: "",
    phone_number: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Settings state
  const [privacySettings, setPrivacySettings] = useState({
    account_visibility: "public",
    hide_followers_list: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  async function loadProfileData() {
    try {
      const profRes = await fetchAPI("/accounts/profile/");
      const userData = profRes.data;
      setProfile(userData);
      setEditForm({
        full_name: userData?.full_name || "",
        bio: userData?.bio || "",
        date_of_birth: userData?.date_of_birth || "",
        country: userData?.country || "",
        phone_number: userData?.phone_number || "",
      });
      setPrivacySettings({
        account_visibility: userData?.account_visibility || "public",
        hide_followers_list: userData?.hide_followers_list || false,
      });
      setPreferredLanguage(userData?.preferred_language || "en");

      if (userData?.id) {
        const [postsRes, prayersRes] = await Promise.all([
          fetchAPI(`/social/posts/?author=${userData.id}`).catch(() => ({ data: { results: [] } })),
          fetchAPI(`/social/prayers/?author=${userData.id}`).catch(() => ({ data: { results: [] } })),
        ]);
        setPosts(postsRes?.data?.results || postsRes?.results || []);
        setPrayers(prayersRes?.data?.results || prayersRes?.results || []);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  async function handleSaveProfile() {
    if (saving) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetchAPI("/accounts/profile/", {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      setProfile((prev: any) => ({ ...prev, ...res.data }));
      setSaveMessage("Profile updated!");
      setIsEditing(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      const res = await fetchAPI("/accounts/profile/", {
        method: "PATCH",
        body: formData,
      });
      setProfile((prev: any) => ({ ...prev, profile_photo: res.data?.profile_photo || res.profile_photo }));
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSaveSettings() {
    if (savingSettings) return;
    setSavingSettings(true);
    setSettingsMessage("");
    try {
      await fetchAPI("/accounts/privacy/", {
        method: "PATCH",
        body: JSON.stringify(privacySettings),
      });
      await fetchAPI("/accounts/profile/", {
        method: "PATCH",
        body: JSON.stringify({ preferred_language: preferredLanguage }),
      });
      setProfile((prev: any) => ({ 
        ...prev, 
        ...privacySettings,
        preferred_language: preferredLanguage,
      }));
      setSettingsMessage("Settings saved!");
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (err: any) {
      setSettingsMessage(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  async function loadFollowRequests() {
    try {
      const res = await fetchAPI("/accounts/follow-requests/");
      setFollowRequests(res?.data?.results || res?.results || res?.data || []);
    } catch (err) {
      console.error("Failed to load follow requests:", err);
    }
  }

  async function handleFollowRequest(requestId: string, action: "accept" | "reject") {
    try {
      await fetchAPI(`/accounts/follow-requests/${requestId}/`, {
        method: action === "accept" ? "POST" : "DELETE",
      });
      setFollowRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to handle follow request:", err);
    }
  }

  async function loadBlockedUsers() {
    try {
      const res = await fetchAPI("/accounts/blocked-users/");
      setBlockedUsers(res?.data?.results || res?.results || res?.data || []);
    } catch (err) {
      console.error("Failed to load blocked users:", err);
    }
  }

  async function handleUnblock(userId: string) {
    try {
      await fetchAPI(`/accounts/users/${userId}/block/`, { method: "DELETE" });
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to unblock:", err);
    }
  }

  const [pushEnabled, setPushEnabled] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPushEnabled(!!localStorage.getItem("push_token"));
    }
  }, []);

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = crypto.randomUUID();
        try {
          await fetchAPI("/notifications/device-tokens/", {
            method: "POST",
            body: JSON.stringify({ token, device_type: "web" }),
          });
          localStorage.setItem("push_token", token);
          setPushEnabled(true);
        } catch (err) {
          console.error("Failed to register push token:", err);
        }
      }
    } else {
      const token = localStorage.getItem("push_token");
      if (token) {
        try {
          await fetchAPI("/notifications/device-tokens/deregister/", {
            method: "POST",
            body: JSON.stringify({ token }),
          });
        } catch (err) {
          console.error("Failed to deregister push token:", err);
        }
        localStorage.removeItem("push_token");
        setPushEnabled(false);
      }
    }
  }

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await fetchAPI("/accounts/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-headline mb-4">Please Sign In</h1>
          <p className="text-on-surface-variant mb-8">You need to be logged in to view your profile.</p>
          <a href="/login" className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold">Sign In</a>
        </div>
      </MainLayout>
    );
  }

  const getAge = (dob: string) => {
    if (!dob) return null;
    const b = new Date(dob), t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
    return age;
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Profile Sidebar */}
        <section className="lg:col-span-4 mb-12 lg:mb-0">
          <div className="sticky top-28">
            <div className="flex flex-col items-center lg:items-start space-y-6">
              {/* Avatar with Edit option */}
              <div className="relative group">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl bg-surface-container-high shadow-2xl shadow-primary/5 flex items-center justify-center overflow-hidden border-2 border-white">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">person</span>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  title="Change photo"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* Name & Bio */}
              <div className="text-center lg:text-left">
                <h1 className="font-headline text-4xl text-on-surface mb-1">{profile.full_name}</h1>
                <p className="text-on-surface-variant font-body leading-relaxed max-w-sm">
                  {profile.bio || "No bio yet. Tell the community about your journey with faith."}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 border-y border-outline-variant/15 py-4 w-full justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <span className="block font-headline text-2xl text-primary">{profile.follower_count || 0}</span>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Followers</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-headline text-2xl text-primary">{profile.following_count || 0}</span>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Following</span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full space-y-2">
                <button onClick={() => { setActiveTab("edit"); setIsEditing(true); }} className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Edit Profile</button>
                <button className="w-full bg-surface-container-low text-primary py-3 rounded-xl font-semibold hover:bg-surface-container-high transition-all">Share Presence</button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="lg:col-span-8 space-y-12">
          {/* Tabs */}
          <div className="flex space-x-12 border-b border-outline-variant/15 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab("posts")} className={`pb-4 transition-all whitespace-nowrap font-medium ${activeTab === "posts" ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>My Posts ({posts.length})</button>
            <button onClick={() => setActiveTab("prayers")} className={`pb-4 transition-all whitespace-nowrap font-medium ${activeTab === "prayers" ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>My Prayers ({prayers.length})</button>
            <button onClick={() => { setActiveTab("edit"); setIsEditing(true); }} className={`pb-4 transition-all whitespace-nowrap font-medium ${activeTab === "edit" ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>Edit Profile</button>
            <button onClick={() => setActiveTab("settings")} className={`pb-4 transition-all whitespace-nowrap font-medium ${activeTab === "settings" ? "text-primary border-b-2 border-primary font-semibold" : "text-on-surface-variant hover:text-primary"}`}>Settings</button>
            <a href="/analytics" className={`pb-4 transition-all whitespace-nowrap font-medium text-on-surface-variant hover:text-primary`}>Analytics</a>
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group border border-outline-variant/10">
                    {post.media?.[0] && (
                      <div className="relative h-48 overflow-hidden bg-surface-container">
                        <img src={post.media[0].file} alt="Post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-on-surface mb-4 line-clamp-3">{post.text_content}</p>
                      <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">favorite</span> {post.reaction_count || 0}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">chat_bubble</span> {post.comment_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                  <p className="text-on-surface-variant">You haven&apos;t posted any reflections yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Prayers */}
          {activeTab === "prayers" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prayers.length > 0 ? (
                prayers.map((prayer) => (
                  <div key={prayer.id} className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between border border-outline-variant/10">
                    <div>
                      <h4 className="font-headline text-2xl mb-4">{prayer.title}</h4>
                      <p className="text-on-surface-variant italic leading-relaxed line-clamp-4">{prayer.description}</p>
                    </div>
                    <div className="mt-8 flex justify-between items-center text-xs text-on-surface-variant">
                      <span>{new Date(prayer.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-3">
                        <span>{prayer.reaction_count || 0} prayers</span>
                        <span>{prayer.comment_count || 0} comments</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                  <p className="text-on-surface-variant">You haven&apos;t shared any prayer requests yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Profile */}
          {activeTab === "edit" && (
            <div className="bg-surface-container-low rounded-2xl p-8 lg:p-12 space-y-8">
              <div className="max-w-xl"><h2 className="font-headline text-3xl mb-2">Edit Profile</h2><p className="text-on-surface-variant font-body">Update your personal information.</p></div>
              {saveMessage && (<div className={`px-4 py-3 rounded-xl text-sm font-medium ${saveMessage.includes("updated") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{saveMessage}</div>)}
              <div className="grid grid-cols-1 gap-6 max-w-xl">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">Full Name</label>
                  <input type="text" value={editForm.full_name} onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-on-surface" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">Bio</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} maxLength={250} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-on-surface resize-none" placeholder="Tell the community about your journey..." />
                  <span className="text-xs text-on-surface-variant/50">{editForm.bio.length}/250</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">Date of Birth</label>
                  <div className="relative">
                    <input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-on-surface" />
                    {editForm.date_of_birth && (<span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{getAge(editForm.date_of_birth)} yrs</span>)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">Country</label>
                  <input type="text" value={editForm.country} onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-on-surface" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary block">Phone Number</label>
                  <input type="tel" value={editForm.phone_number} onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-on-surface" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={handleSaveProfile} disabled={saving} className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                  <button onClick={() => setActiveTab("posts")} className="px-8 py-4 rounded-xl text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-all">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="bg-surface-container-low rounded-2xl p-8 lg:p-12 space-y-10">
              <div className="max-w-xl"><h2 className="font-headline text-3xl mb-2">Settings</h2><p className="text-on-surface-variant font-body">Manage your presence and how you interact with the community.</p></div>
              {settingsMessage && (<div className={`px-4 py-3 rounded-xl text-sm font-medium max-w-xl ${settingsMessage.includes("saved") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{settingsMessage}</div>)}
              <div className="grid grid-cols-1 gap-8 max-w-xl">
                {/* Language, Notifications, Privacy, Account - (same as original simplified) */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Display Language</label>
                  <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none cursor-pointer font-medium text-on-surface">
                    <option value="en">English (US)</option><option value="es">Español</option><option value="fr">Français</option><option value="hi">Hindi (हिन्दी)</option><option value="pt">Português</option><option value="ar">العربية (Arabic)</option><option value="ko">한국어 (Korean)</option><option value="zh">中文 (Chinese)</option><option value="sw">Kiswahili</option><option value="tl">Filipino</option>
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Notifications</label>
                  <div className="flex items-center justify-between py-2">
                    <div><h5 className="font-semibold text-on-surface">Push Notifications</h5><p className="text-sm text-on-surface-variant">Receive alerts for likes, comments, and follows.</p></div>
                    <div className="relative inline-flex items-center cursor-pointer"><input className="sr-only peer" type="checkbox" checked={pushEnabled} onChange={(e) => handlePushToggle(e.target.checked)} /><div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Privacy</label>
                  <div className="flex items-center justify-between py-2">
                    <div><h5 className="font-semibold text-on-surface">Private Profile</h5><p className="text-sm text-on-surface-variant">Only approved members can view your reflections.</p></div>
                    <div className="relative inline-flex items-center cursor-pointer"><input className="sr-only peer" type="checkbox" checked={privacySettings.account_visibility === "private"} onChange={(e) => setPrivacySettings(prev => ({ ...prev, account_visibility: e.target.checked ? "private" : "public" }))} /><div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Account</label>
                  <button onClick={() => window.location.href = "/change-password"} className="w-full text-left flex items-center justify-between py-3 px-4 rounded-xl hover:bg-surface-container-high transition-all group">
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-on-surface-variant">lock</span><span className="font-medium text-on-surface">Change Password</span></div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">chevron_right</span>
                  </button>
                  <button onClick={handleLogout} className="w-full text-left flex items-center justify-between py-3 px-4 rounded-xl hover:bg-red-50 transition-all group">
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-red-500">logout</span><span className="font-medium text-red-600">Sign Out</span></div>
                    <span className="material-symbols-outlined text-red-400 group-hover:text-red-600">chevron_right</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Follow Requests</label>
                  <button onClick={loadFollowRequests} className="text-xs text-primary font-bold hover:underline">Load Requests</button>
                  {followRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-surface-container-high">
                      <span className="font-medium text-on-surface text-sm">{req.from_user?.full_name || "User"}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleFollowRequest(req.id, "accept")} className="text-xs bg-primary text-on-primary px-3 py-1 rounded-lg font-bold">Accept</button>
                        <button onClick={() => handleFollowRequest(req.id, "reject")} className="text-xs bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-lg font-bold">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary">Blocked Users</label>
                  <button onClick={loadBlockedUsers} className="text-xs text-primary font-bold hover:underline">Load Blocked Users</button>
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 px-4 rounded-xl bg-surface-container-high">
                      <span className="font-medium text-on-surface text-sm">{user.full_name || "User"}</span>
                      <button onClick={() => handleUnblock(user.id)} className="text-xs text-red-600 font-bold hover:underline">Unblock</button>
                    </div>
                  ))}
                </div>
                <div className="pt-4"><button onClick={handleSaveSettings} disabled={savingSettings} className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50">{savingSettings ? "Saving..." : "Save Settings"}</button></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

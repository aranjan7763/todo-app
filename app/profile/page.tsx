"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { SOCIAL_CONFIG } from "@/components/SocialIcons";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = () => {
    setFormData({
      name: profile?.name || "",
      tagline: profile?.tagline || "",
      about: profile?.about || "",
      city: profile?.city || "",
      country: profile?.country || "",
      twitter: profile?.twitter || "",
      facebook: profile?.facebook || "",
      instagram: profile?.instagram || "",
      linkedin: profile?.linkedin || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (!updateError) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    }
    setUploading(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const socialLinks = SOCIAL_CONFIG;

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="loading-state">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <a href="/" className="profile-back">
          <span className="material-icons">arrow_back</span>
          Back to tasks
        </a>
      </div>

      <div className="profile-card">
        {!editing ? (
          <>
            <h1>
              Profile
              <button onClick={startEdit} className="profile-edit-btn">
                <span className="material-icons" style={{ fontSize: "14px" }}>
                  edit
                </span>
                Edit
              </button>
            </h1>

            <div className="profile-avatar-section">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="profile-avatar-large"
                />
              ) : (
                <div className="profile-avatar-placeholder-large">
                  <span className="material-icons">person</span>
                </div>
              )}
              {profile?.name && (
                <div className="profile-view-name">{profile.name}</div>
              )}
              {profile?.tagline && (
                <div className="profile-view-tagline">{profile.tagline}</div>
              )}
              {(profile?.city || profile?.country) && (
                <div className="profile-view-location">
                  <span className="material-icons">location_on</span>
                  {[profile?.city, profile?.country]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>

            {profile?.about && (
              <div className="profile-view-about">{profile.about}</div>
            )}

            <div className="profile-view-socials">
              {socialLinks.map(
                (s) =>
                  profile?.[s.key as keyof Profile] && (
                    <a
                      key={s.key}
                      href={`${s.prefix}${profile[s.key as keyof Profile]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-social-link"
                    >
                      <s.Icon size={14} /> @{profile[s.key as keyof Profile]}
                    </a>
                  )
              )}
            </div>

            {!profile?.name &&
              !profile?.about &&
              !SOCIAL_CONFIG.some((s) => profile?.[s.key as keyof Profile]) && (
                <div className="empty-state">
                  Your profile is empty. Click Edit to add your details!
                </div>
              )}
          </>
        ) : (
          <>
            <h1>Edit Profile</h1>

            <div className="profile-avatar-section">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="profile-avatar-large"
                />
              ) : (
                <div className="profile-avatar-placeholder-large">
                  <span className="material-icons">person</span>
                </div>
              )}
              <div className="profile-avatar-upload">
                <label>
                  {uploading ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="profile-form">
              <div className="profile-form-field">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="profile-form-field">
                <label>Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="A short tagline about you"
                />
              </div>

              <div className="profile-form-field">
                <label>About</label>
                <textarea
                  value={formData.about || ""}
                  onChange={(e) => updateField("about", e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>

              <div className="profile-form-row">
                <div className="profile-form-field">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="profile-form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="profile-social-fields">
                <h3>Social Media</h3>
                {socialLinks.map((s) => (
                  <div key={s.key} className="profile-form-field">
                    <label>{s.label}</label>
                    <input
                      type="text"
                      value={
                        (formData[s.key as keyof Profile] as string) || ""
                      }
                      onChange={(e) => updateField(s.key, e.target.value)}
                      placeholder={`${s.label} username`}
                    />
                  </div>
                ))}
              </div>

              <div className="profile-form-actions">
                <button onClick={cancelEdit} className="profile-cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="profile-save-btn"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

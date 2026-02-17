"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const SOCIAL_LINKS = [
  { key: "twitter", label: "Twitter", prefix: "https://x.com/" },
  { key: "facebook", label: "Facebook", prefix: "https://facebook.com/" },
  { key: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
  { key: "linkedin", label: "LinkedIn", prefix: "https://linkedin.com/in/" },
];

interface ProfileEditModalProps {
  profile: Profile | null;
  userId: string;
  onSave: (updated: Profile) => void;
  onClose: () => void;
}

export default function ProfileEditModal({
  profile,
  userId,
  onSave,
  onClose,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const supabase = createClient();

  useEffect(() => {
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
  }, [profile]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setAvatarUrl(publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...formData,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      onSave(data);
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="profile-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Profile</h2>

        <div className="profile-avatar-section">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="profile-avatar-large" />
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
          <div className="profile-form-row">
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
                placeholder="A short tagline"
              />
            </div>
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
            <div className="profile-form-row">
              <div className="profile-form-field">
                <label>Twitter</label>
                <input
                  type="text"
                  value={formData.twitter || ""}
                  onChange={(e) => updateField("twitter", e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="profile-form-field">
                <label>Facebook</label>
                <input
                  type="text"
                  value={formData.facebook || ""}
                  onChange={(e) => updateField("facebook", e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
            <div className="profile-form-row">
              <div className="profile-form-field">
                <label>Instagram</label>
                <input
                  type="text"
                  value={formData.instagram || ""}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="profile-form-field">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={formData.linkedin || ""}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <div className="profile-form-actions">
            <button onClick={onClose} className="profile-cancel-btn">
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
      </div>
    </div>
  );
}

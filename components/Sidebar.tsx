"use client";

import { useState } from "react";
import type { Category, Profile } from "@/lib/types";
import CategoryModal from "./CategoryModal";
import ProfileEditModal from "./ProfileEditModal";
import { SOCIAL_CONFIG } from "./SocialIcons";

interface TodoCounts {
  total: number;
  active: number;
  completed: number;
  uncategorized: number;
  byCategory: Record<string, number>;
}

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  todoCounts: TodoCounts;
  open: boolean;
  onClose: () => void;
  onCreateCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  profile: Profile | null;
  userEmail: string;
  userId: string;
  onProfileUpdate: (profile: Profile) => void;
}

export default function Sidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  todoCounts,
  open,
  onClose,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  profile,
  userEmail,
  userId,
  onProfileUpdate,
}: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const handleSelect = (id: string | null) => {
    onSelectCategory(id);
    onClose();
  };

  const displayName = profile?.name || userEmail;
  const hasSocials = SOCIAL_CONFIG.some(
    (s) => profile?.[s.key as keyof Profile]
  );

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Profile section */}
        <div
          className="sidebar-profile"
          onClick={() => setShowProfileEdit(true)}
        >
          <div className="sidebar-profile-main">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="sidebar-avatar"
              />
            ) : (
              <div className="sidebar-avatar-placeholder">
                <span className="material-icons">account_circle</span>
              </div>
            )}
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{displayName}</div>
              {profile?.tagline && (
                <div className="sidebar-profile-tagline">{profile.tagline}</div>
              )}
            </div>
          </div>

          {profile?.about && (
            <div className="sidebar-profile-about">{profile.about}</div>
          )}

          {hasSocials && (
            <div className="sidebar-profile-socials">
              {SOCIAL_CONFIG.map(
                (s) =>
                  profile?.[s.key as keyof Profile] && (
                    <a
                      key={s.key}
                      href={`${s.prefix}${profile[s.key as keyof Profile]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sidebar-social-chip"
                      onClick={(e) => e.stopPropagation()}
                      title={s.label}
                    >
                      <s.Icon size={12} />
                    </a>
                  )
              )}
            </div>
          )}

          {/* Hover tooltip with full profile */}
          <div className="sidebar-profile-tooltip">
            <div className="sidebar-tooltip-header">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="sidebar-tooltip-avatar"
                />
              ) : (
                <div className="sidebar-tooltip-avatar-placeholder">
                  <span className="material-icons">person</span>
                </div>
              )}
              <div>
                <div className="sidebar-tooltip-name">{displayName}</div>
                {profile?.tagline && (
                  <div className="sidebar-tooltip-tagline">
                    {profile.tagline}
                  </div>
                )}
                {(profile?.city || profile?.country) && (
                  <div className="sidebar-tooltip-location">
                    <span className="material-icons">location_on</span>
                    {[profile?.city, profile?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
            {profile?.about && (
              <div className="sidebar-tooltip-about">{profile.about}</div>
            )}
            {hasSocials && (
              <div className="sidebar-tooltip-socials">
                {SOCIAL_CONFIG.map(
                  (s) =>
                    profile?.[s.key as keyof Profile] && (
                      <div key={s.key} className="sidebar-tooltip-social-row">
                        <span className="sidebar-tooltip-social-icon">
                          <s.Icon size={12} />
                        </span>
                        @{profile[s.key as keyof Profile]}
                      </div>
                    )
                )}
              </div>
            )}
            <div className="sidebar-tooltip-hint">Click to edit profile</div>
          </div>
        </div>

        {/* Dotted separator */}
        <div className="sidebar-divider" />

        <div className="sidebar-search">
          <span className="material-icons">search</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="sidebar-section-title">
          Categories
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            title="Add category"
          >
            <span className="material-icons">add</span>
          </button>
        </div>

        <ul className="category-list">
          <li
            className={`category-item ${selectedCategoryId === null ? "active" : ""}`}
            onClick={() => handleSelect(null)}
          >
            <span className="material-icons">list</span>
            All
            <span className="category-count">{todoCounts.total}</span>
          </li>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`category-item ${selectedCategoryId === cat.id ? "active" : ""}`}
              onClick={() => handleSelect(cat.id)}
            >
              <span
                className="category-dot"
                style={{ background: cat.color }}
              />
              {cat.name}
              <span className="category-count">
                {todoCounts.byCategory[cat.id] || 0}
              </span>
              <div className="category-item-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(cat);
                    setShowModal(true);
                  }}
                  title="Edit"
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(cat.id);
                  }}
                  title="Delete"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </li>
          ))}
          <li
            className={`category-item ${selectedCategoryId === "uncategorized" ? "active" : ""}`}
            onClick={() => handleSelect("uncategorized")}
          >
            <span className="material-icons">inbox</span>
            Uncategorized
            <span className="category-count">{todoCounts.uncategorized}</span>
          </li>
        </ul>

        <div className="sidebar-summary">
          <div>
            Active: <span>{todoCounts.active}</span>
          </div>
          <div>
            Completed: <span>{todoCounts.completed}</span>
          </div>
        </div>
      </aside>

      {showModal && (
        <CategoryModal
          category={editingCategory}
          onSave={(name, color) => {
            if (editingCategory) {
              onEditCategory(editingCategory.id, name, color);
            } else {
              onCreateCategory(name, color);
            }
            setShowModal(false);
            setEditingCategory(null);
          }}
          onDelete={
            editingCategory
              ? () => {
                  onDeleteCategory(editingCategory.id);
                  setShowModal(false);
                  setEditingCategory(null);
                }
              : undefined
          }
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          userId={userId}
          onSave={(updated) => {
            onProfileUpdate(updated);
            setShowProfileEdit(false);
          }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </>
  );
}

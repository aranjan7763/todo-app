"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/lib/types";

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#2ecc71",
  "#e17055",
  "#00b894",
  "#fdcb6e",
  "#6c5ce7",
];

interface CategoryModalProps {
  category?: Category | null;
  onSave: (name: string, color: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function CategoryModal({
  category,
  onSave,
  onDelete,
  onClose,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    }
  }, [category]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{category ? "Edit Category" : "New Category"}</h2>

        <div className="modal-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Category name"
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label>Color</label>
          <div className="color-palette">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          {category && onDelete && (
            <button onClick={onDelete} className="modal-delete-btn">
              Delete
            </button>
          )}
          <button onClick={onClose} className="modal-cancel-btn">
            Cancel
          </button>
          <button onClick={handleSave} className="modal-save-btn">
            {category ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

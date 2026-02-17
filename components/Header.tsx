"use client";

import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle: () => void;
}

export default function Header({
  onLogout,
  onMenuToggle,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="header-bar">
      <div className="header-left">
        <button onClick={onMenuToggle} className="header-menu-btn">
          <span className="material-icons">menu</span>
        </button>
        <span className="header-title">My To-Do List</span>
      </div>
      <div className="header-right">
        <div
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <div className={`theme-toggle-track ${theme === "dark" ? "dark" : ""}`}>
            <div className="theme-toggle-thumb">
              <span className="material-icons theme-toggle-thumb-icon">
                {theme === "light" ? "light_mode" : "dark_mode"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="header-logout">
          Sign out
        </button>
      </div>
    </div>
  );
}

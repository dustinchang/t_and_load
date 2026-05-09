import { NavLink, useNavigate } from "react-router-dom";
import { Home, Flag, Trophy, ChevronLeft } from "lucide-react";
import "./Layout.css";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function TopBar({
  title,
  subtitle,
  showBack = false,
  actions,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {showBack && (
        <button
          className="topbar-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="topbar-title-group">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
        }
      >
        <span className="bottom-nav-icon">
          <Home size={22} />
        </span>
        Home
      </NavLink>
      <NavLink
        to="/play"
        className={({ isActive }) =>
          `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
        }
      >
        <span className="bottom-nav-icon">
          <Flag size={22} />
        </span>
        Play
      </NavLink>
      <NavLink
        to="/scorecard"
        className={({ isActive }) =>
          `bottom-nav-item${isActive ? " bottom-nav-item--active" : ""}`
        }
      >
        <span className="bottom-nav-icon">
          <Trophy size={22} />
        </span>
        Scorecard
      </NavLink>
    </nav>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  topBar?: React.ReactNode;
}

export function Layout({ children, showNav = true, topBar }: LayoutProps) {
  return (
    <div className="layout">
      {topBar}
      <main
        className={`layout-content${showNav ? "" : " layout-content--no-nav"}`}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

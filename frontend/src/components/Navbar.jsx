import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  Droplet,
  Search,
  Activity,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

function navClass({ isActive }) {
  return `flex items-center gap-1.5 text-sm font-medium transition-all duration-150 px-3 py-1.5 rounded-lg ${
    isActive ? "text-crimson bg-crimson-soft/80 font-semibold" : "text-inkSoft hover:text-ink hover:bg-line/40"
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === "admin" ? "/dashboard/admin" : user?.role === "donor" ? "/dashboard/donor" : "/dashboard/requester";

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md transition-all shadow-sm">
      {/* Top emergency micro-banner */}
      <div className="bg-crimson px-4 py-1 text-center text-xs font-medium text-white flex items-center justify-center gap-2">
        <Heart className="h-3.5 w-3.5 animate-pulse text-white fill-white" />
        <span>Emergency Blood Dispatch System — Connect in Seconds</span>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson text-white shadow-sm shadow-crimson/30 group-hover:scale-105 transition-transform">
            <Droplet className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-ink">RedLine</span>
              <span className="inline-block h-2 w-2 rounded-full bg-crimson animate-ping" />
            </div>
            <span className="hidden sm:block text-[10px] font-mono tracking-widest text-inkSoft uppercase">Blood Network</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/search" className={navClass}>
            <Search className="h-4 w-4" />
            <span>Find Donors</span>
          </NavLink>
          <NavLink to="/requests" className={navClass}>
            <Activity className="h-4 w-4" />
            <span>Active Requests</span>
          </NavLink>
          {user && (
            <NavLink to={dashboardPath} className={navClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-paper px-3 py-1.5 rounded-full border border-line">
                {user.role === "admin" ? (
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-pulse" />
                )}
                <span className="text-xs font-semibold text-ink capitalize">{user.role}</span>
                <span className="text-xs text-inkSoft">({user.full_name?.split(" ")[0]})</span>
              </div>
              <Link to="/request/new" className="btn-primary">
                <PlusCircle className="h-4 w-4" />
                <span>Request Blood</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-xs" title="Log out">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost">
                <LogIn className="h-4 w-4" />
                <span>Log in</span>
              </Link>
              <Link to="/register" className="btn-primary">
                <UserPlus className="h-4 w-4" />
                <span>Join Network</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-ink md:hidden hover:bg-line/40 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-line bg-white px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className={navClass}
            >
              <Search className="h-4 w-4" />
              <span>Find Donors</span>
            </NavLink>
            <NavLink
              to="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className={navClass}
            >
              <Activity className="h-4 w-4" />
              <span>Active Requests</span>
            </NavLink>
            {user && (
              <NavLink
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className={navClass}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard ({user.role})</span>
              </NavLink>
            )}
            <div className="pt-3 border-t border-line mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/request/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full justify-center"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Request Blood Now</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-outline w-full justify-center text-crimson"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out ({user.full_name})</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-outline w-full justify-center"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Log in</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full justify-center"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign up as Donor / Requester</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

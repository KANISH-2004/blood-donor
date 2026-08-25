import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import { LogIn, Key, Mail, Shield, Heart, FileText } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      pushToast(`Welcome back, ${user.full_name.split(" ")[0]}.`);
      const dest =
        user.role === "admin" ? "/dashboard/admin" : user.role === "donor" ? "/dashboard/donor" : "/dashboard/requester";
      navigate(dest);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not log in. Check your email and password."));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError("");
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card bg-white shadow-md border-line p-6 sm:p-8 space-y-6">
        <div>
          <p className="eyebrow flex items-center gap-1">
            <LogIn className="h-4 w-4" />
            <span>Welcome Back</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Sign in to RedLine</h1>
          <p className="mt-1 text-xs text-inkSoft">Access your donor or requester coordination dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-crimson-soft border border-crimson/20 p-3.5 text-xs text-crimson-deep">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                id="email"
                type="email"
                required
                className="input pl-9"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                id="password"
                type="password"
                required
                className="input pl-9"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-2.5 shadow-sm">
            {submitting ? "Authenticating..." : "Sign In to Account"}
          </button>
        </form>

        {/* 1-Click Demo Accounts Fill */}
        <div className="pt-3 border-t border-line space-y-2">
          <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider">Quick Demo Login Presets</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("admin@blooddonor.dev", "Admin@123")}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-paper text-[11px] font-semibold text-ink hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="h-3 w-3 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("donor1@blooddonor.dev", "Donor@123")}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-paper text-[11px] font-semibold text-ink hover:border-crimson hover:bg-crimson-soft/40 flex items-center justify-center gap-1 transition-colors"
            >
              <Heart className="h-3 w-3 text-crimson" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("requester1@blooddonor.dev", "Requester@123")}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-paper text-[11px] font-semibold text-ink hover:border-pulse hover:bg-pulse-soft flex items-center justify-center gap-1 transition-colors"
            >
              <FileText className="h-3 w-3 text-pulse-deep" />
              <span>Requester</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-inkSoft pt-1">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-semibold text-crimson hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

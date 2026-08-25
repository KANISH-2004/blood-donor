import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import { UserPlus, User, Mail, Phone, Lock, Heart, FileText } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "donor",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await register(form);
      pushToast("Account created successfully. Welcome to RedLine!");
      if (user.role === "donor") {
        navigate("/donor/register");
      } else {
        navigate("/dashboard/requester");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create your account. Please check your inputs."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card bg-white shadow-md border-line p-6 sm:p-8 space-y-6">
        <div>
          <p className="eyebrow flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Join Network</span>
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Create Your RedLine Account</h1>
          <p className="mt-1 text-xs text-inkSoft">Register as a life-saving donor or post blood requests for hospitals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-xl bg-crimson-soft border border-crimson/20 p-3.5 text-xs text-crimson-deep">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="full_name">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                id="full_name"
                required
                className="input pl-9"
                placeholder="e.g. John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                id="phone"
                required
                className="input pl-9"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="input pl-9"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <span className="label">I am joining primarily as:</span>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "donor" })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.role === "donor"
                    ? "border-crimson bg-crimson-soft/50 ring-1 ring-crimson"
                    : "border-line bg-white hover:border-inkSoft"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${form.role === "donor" ? "text-crimson fill-crimson" : "text-inkSoft"}`} />
                  <span className="text-sm font-bold text-ink">Blood Donor</span>
                </div>
                <p className="text-[11px] text-inkSoft mt-1">I want to be available to donate blood.</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "requester" })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.role === "requester"
                    ? "border-pulse bg-pulse-soft/60 ring-1 ring-pulse"
                    : "border-line bg-white hover:border-inkSoft"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className={`h-4 w-4 ${form.role === "requester" ? "text-pulse-deep" : "text-inkSoft"}`} />
                  <span className="text-sm font-bold text-ink">Requester</span>
                </div>
                <p className="text-[11px] text-inkSoft mt-1">I need to request blood for patients.</p>
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-2.5 mt-2">
            {submitting ? "Creating Account..." : "Create Account & Continue"}
          </button>
        </form>

        <p className="text-center text-xs text-inkSoft pt-1">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-crimson hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

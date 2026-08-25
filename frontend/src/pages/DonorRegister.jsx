import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyDonorProfile, upsertDonorProfile } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import Loading from "../components/Loading";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CONTACT_METHODS = [
  { value: "in_app", label: "In-app only" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
];

const defaultForm = {
  age: "",
  blood_group: "O+",
  city: "",
  area: "",
  is_available: true,
  last_donation_date: "",
  preferred_contact_method: "in_app",
};

export default function DonorRegister() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { pushToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getMyDonorProfile()
      .then((res) => {
        const p = res.data;
        setForm({
          age: p.age,
          blood_group: p.blood_group,
          city: p.city,
          area: p.area || "",
          is_available: p.is_available,
          last_donation_date: p.last_donation_date || "",
          preferred_contact_method: p.preferred_contact_method,
        });
      })
      .catch(() => {}) // no existing profile yet — that's fine
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await upsertDonorProfile({
        ...form,
        age: Number(form.age),
        last_donation_date: form.last_donation_date || null,
        area: form.area || null,
      });
      pushToast("Donor profile saved. Thank you for signing up to help.");
      navigate("/dashboard/donor");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save your donor profile."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Loading your donor profile..." />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Donor profile</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Register as a blood donor</h1>
      <p className="mt-2 text-sm text-inkSoft">
        Your exact address is never shown publicly — only your approximate city and area, and only when
        you're marked available.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {error && (
          <div role="alert" className="rounded-md bg-crimson-soft px-4 py-3 text-sm text-crimson-deep">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              min={18}
              max={65}
              required
              className="input"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="blood_group">Blood group</label>
            <select
              id="blood_group"
              className="input"
              value={form.blood_group}
              onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="city">City</label>
            <input
              id="city"
              required
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="area">Area (approximate)</label>
            <input
              id="area"
              className="input"
              placeholder="e.g. Anna Nagar"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="last_donation_date">Last donation date (if any)</label>
          <input
            id="last_donation_date"
            type="date"
            className="input"
            value={form.last_donation_date}
            onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="preferred_contact_method">Preferred contact method</label>
          <select
            id="preferred_contact_method"
            className="input"
            value={form.preferred_contact_method}
            onChange={(e) => setForm({ ...form, preferred_contact_method: e.target.value })}
          >
            {CONTACT_METHODS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            className="h-4 w-4 rounded border-line text-crimson focus:ring-crimson"
          />
          I'm currently available to donate
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving..." : "Save donor profile"}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = [
  { value: "critical", label: "Critical — within hours" },
  { value: "urgent", label: "Urgent — within 1-2 days" },
  { value: "scheduled", label: "Scheduled — planned ahead" },
];

const defaultForm = {
  blood_group: "O+",
  hospital_name: "",
  hospital_location: "",
  city: "",
  units_required: 1,
  urgency: "urgent",
  required_by: "",
  notes: "",
};

export default function RequestBlood() {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await createRequest({
        ...form,
        units_required: Number(form.units_required),
        required_by: new Date(form.required_by).toISOString(),
        notes: form.notes || null,
      });
      pushToast("Request posted. We're finding matching donors now.");
      navigate(`/requests/${res.data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create the request."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Emergency request</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">Post a blood request</h1>
      <p className="mt-2 text-sm text-inkSoft">
        This creates an active request visible to compatible donors nearby. For life-threatening
        emergencies, also contact your hospital and local emergency services directly.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        {error && (
          <div role="alert" className="rounded-md bg-crimson-soft px-4 py-3 text-sm text-crimson-deep">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="blood_group">Blood group needed</label>
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
          <div>
            <label className="label" htmlFor="units_required">Units required</label>
            <input
              id="units_required"
              type="number"
              min={1}
              max={20}
              required
              className="input"
              value={form.units_required}
              onChange={(e) => setForm({ ...form, units_required: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="hospital_name">Hospital name</label>
          <input
            id="hospital_name"
            required
            className="input"
            value={form.hospital_name}
            onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="hospital_location">Hospital location / area</label>
            <input
              id="hospital_location"
              required
              className="input"
              value={form.hospital_location}
              onChange={(e) => setForm({ ...form, hospital_location: e.target.value })}
            />
          </div>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="urgency">Urgency level</label>
            <select
              id="urgency"
              className="input"
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
            >
              {URGENCY_LEVELS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="required_by">Needed by</label>
            <input
              id="required_by"
              type="datetime-local"
              required
              className="input"
              value={form.required_by}
              onChange={(e) => setForm({ ...form, required_by: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">Additional notes (optional)</label>
          <textarea
            id="notes"
            rows={3}
            className="input"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Posting request..." : "Post request"}
        </button>
      </form>
    </div>
  );
}

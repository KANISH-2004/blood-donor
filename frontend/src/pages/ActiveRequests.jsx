import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRequests } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import BloodBadge from "../components/BloodBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import { Activity, MapPin, Clock, ArrowRight, AlertTriangle, Filter, PlusCircle } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES = [
  { label: "All Urgencies", value: "" },
  { label: "Critical (< 6h)", value: "critical" },
  { label: "Urgent (< 48h)", value: "urgent" },
  { label: "Scheduled", value: "scheduled" },
];

export default function ActiveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ city: "", blood_group: "", urgency: "" });

  const load = async (currentFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (currentFilters.city) params.city = currentFilters.city;
      if (currentFilters.blood_group) params.blood_group = currentFilters.blood_group;
      const res = await listRequests(params);
      let data = res.data;
      if (currentFilters.urgency) {
        data = data.filter((r) => r.urgency === currentFilters.urgency);
      }
      setRequests(data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load active requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handleUrgencyTab = (val) => {
    const updated = { ...filters, urgency: val };
    setFilters(updated);
    load(updated);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            <span>Emergency Coordination Hub</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Active Blood Requests</h1>
          <p className="mt-2 text-sm text-inkSoft max-w-xl">
            Live patient requests from regional hospitals. If you or someone you know is compatible, view details to
            coordinate via the hospital blood bank.
          </p>
        </div>
        <Link to="/request/new" className="btn-primary shrink-0">
          <PlusCircle className="h-4 w-4" />
          <span>Post New Request</span>
        </Link>
      </div>

      {/* Urgency Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {URGENCIES.map((u) => {
          const active = filters.urgency === u.value;
          return (
            <button
              key={u.label}
              onClick={() => handleUrgencyTab(u.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? "bg-crimson text-white shadow-sm shadow-crimson/20"
                  : "bg-paper text-inkSoft hover:text-ink hover:bg-line/60"
              }`}
            >
              {u.label}
            </button>
          );
        })}
      </div>

      {/* City & Blood Group Filter Form */}
      <form onSubmit={handleFilterSubmit} className="card grid gap-3 sm:grid-cols-12 bg-white shadow-sm">
        <div className="sm:col-span-5 relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
          <input
            className="input pl-9"
            placeholder="Search by city (e.g. Chennai)"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>
        <div className="sm:col-span-4">
          <select
            className="input"
            value={filters.blood_group}
            onChange={(e) => setFilters({ ...filters, blood_group: e.target.value })}
          >
            <option value="">Any blood group</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                Blood Group {g}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className="btn-outline w-full justify-center">
            <Filter className="h-4 w-4 text-inkSoft" />
            <span>Apply Filter</span>
          </button>
        </div>
      </form>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <Loading label="Fetching active requests..." />
        ) : error ? (
          <div role="alert" className="rounded-xl bg-crimson-soft border border-crimson/20 p-4 text-sm text-crimson-deep">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No active blood requests found"
            message="There are currently no active requests matching your selected criteria."
            action={
              <button
                onClick={() => {
                  setFilters({ city: "", blood_group: "", urgency: "" });
                  load({ city: "", blood_group: "", urgency: "" });
                }}
                className="btn-outline"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {requests.map((r) => {
              const neededDate = new Date(r.required_by);
              return (
                <div
                  key={r.id}
                  className="card bg-white hover:border-crimson/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <BloodBadge group={r.blood_group} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-ink">{r.hospital_name}</h2>
                        <UrgencyBadge level={r.urgency} />
                      </div>
                      <p className="text-xs text-inkSoft flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-inkSoft" />
                        <span>{r.hospital_location}, {r.city}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-inkSoft">
                        <span className="font-semibold text-ink">
                          Required: <span className="font-mono text-crimson font-bold">{r.units_required} unit(s)</span>
                        </span>
                        <span className="flex items-center gap-1 text-inkSoft">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Needed by {neededDate.toLocaleDateString()} {neededDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-line">
                    <Link
                      to={`/requests/${r.id}`}
                      className="btn-primary w-full md:w-auto justify-center text-xs px-4 py-2.5"
                    >
                      <span>View & Match</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

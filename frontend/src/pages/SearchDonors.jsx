import { useState, useEffect } from "react";
import { searchDonors } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import BloodBadge from "../components/BloodBadge";
import { Search, MapPin, Shield, Droplet, Filter, RefreshCw, CheckCircle } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SearchDonors() {
  const [filters, setFilters] = useState({ city: "", area: "", blood_group: "", available_only: true });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeSearch = async (currentFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (currentFilters.city) params.city = currentFilters.city;
      if (currentFilters.area) params.area = currentFilters.area;
      if (currentFilters.blood_group) params.blood_group = currentFilters.blood_group;
      params.available_only = currentFilters.available_only;
      const res = await searchDonors(params);
      setResults(res.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not search donors."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch to show active donors immediately
    executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleGroupChipClick = (group) => {
    const updatedGroup = filters.blood_group === group ? "" : group;
    const updatedFilters = { ...filters, blood_group: updatedGroup };
    setFilters(updatedFilters);
    executeSearch(updatedFilters);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div>
        <p className="eyebrow flex items-center gap-1.5">
          <Search className="h-4 w-4" />
          <span>Public Donor Directory</span>
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Search Available Donors</h1>
        <p className="mt-2 text-sm text-inkSoft max-w-2xl">
          Search registered donors across cities and blood groups. To protect donor safety, exact home addresses, phone
          numbers, and emails are never exposed publicly.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pulse-soft text-pulse-deep shrink-0">
          <Shield className="h-5 w-5" />
        </div>
        <div className="text-xs text-inkSoft">
          <span className="font-semibold text-ink">Privacy-First Architecture: </span>
          Only approximate municipal areas and blood group availability are shown. To request donor coordination, submit
          an official blood request.
        </div>
      </div>

      {/* Blood Group Quick Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-inkSoft flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Quick Filter by Blood Group</span>
          </label>
          {filters.blood_group && (
            <button
              onClick={() => handleGroupChipClick("")}
              className="text-xs text-crimson hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGroupChipClick("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.blood_group === ""
                ? "bg-ink text-white"
                : "bg-white border border-line text-inkSoft hover:border-ink hover:text-ink"
            }`}
          >
            All Groups
          </button>
          {BLOOD_GROUPS.map((g) => {
            const active = filters.blood_group === g;
            return (
              <button
                key={g}
                onClick={() => handleGroupChipClick(g)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  active
                    ? "bg-crimson text-white shadow-sm shadow-crimson/30"
                    : "bg-white border border-line text-ink hover:border-crimson hover:bg-crimson-soft/40"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="card grid gap-4 sm:grid-cols-12 bg-white shadow-sm">
        <div className="sm:col-span-4 relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
          <input
            className="input pl-9"
            placeholder="City (e.g. Chennai, Bengaluru)"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>
        <div className="sm:col-span-4 relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
          <input
            className="input pl-9"
            placeholder="Area / Neighborhood"
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 flex items-center">
          <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={filters.available_only}
              onChange={(e) => setFilters({ ...filters, available_only: e.target.checked })}
              className="rounded border-line text-crimson focus:ring-crimson"
            />
            <span>Available Only</span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary w-full justify-center">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Search Results Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <div className="text-sm font-semibold text-ink">
            {loading ? "Searching..." : `${results.length} Donor(s) Found`}
          </div>
          <button
            onClick={() => executeSearch()}
            className="flex items-center gap-1 text-xs text-inkSoft hover:text-ink"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && <Loading label="Finding registered donors..." />}

        {error && (
          <div role="alert" className="rounded-xl bg-crimson-soft border border-crimson/20 p-4 text-sm text-crimson-deep">
            {error}
          </div>
        )}

        {!loading && results.length === 0 && (
          <EmptyState
            title="No donors match your search"
            message="Try widening your search to a broader city or different blood group."
          />
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((d) => (
              <div
                key={d.donor_id}
                className="card bg-white hover:border-crimson/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-ink flex items-center gap-1.5">
                        <span>{d.display_name}</span>
                        <CheckCircle className="h-3.5 w-3.5 text-pulse" />
                      </p>
                      <p className="text-xs text-inkSoft mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{d.area ? `${d.area}, ` : ""}{d.city}</span>
                      </p>
                    </div>
                    <BloodBadge group={d.blood_group} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                  <span className="text-inkSoft">Current Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      d.is_available ? "text-pulse-deep" : "text-inkSoft"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        d.is_available ? "bg-pulse animate-pulse" : "bg-line"
                      }`}
                    />
                    {d.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMatches, getRequest, matchingDisclaimer, runMatching, acceptMatch } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import BloodBadge from "../components/BloodBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import {
  MapPin,
  Clock,
  Droplet,
  Users,
  Shield,
  Activity,
  CheckCircle,
  Building2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const { pushToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [reqRes, matchRes, discRes] = await Promise.all([
        getRequest(id),
        getMatches(id),
        matchingDisclaimer(),
      ]);
      setRequest(reqRes.data);
      setMatches(matchRes.data);
      setDisclaimer(discRes.data.disclaimer);
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not load this request."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRunMatching = async () => {
    setMatching(true);
    try {
      const res = await runMatching(id);
      setMatches(res.data);
      pushToast(`Found ${res.data.length} compatible candidate donor(s).`);
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not run matching algorithm."), "error");
    } finally {
      setMatching(false);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    setAcceptingId(matchId);
    try {
      await acceptMatch(matchId);
      pushToast("Match accepted! Requester has been notified.");
      load();
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not accept match."), "error");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <Loading label="Loading request & matching candidates..." />;
  if (!request)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Request not found" message="This request may have been completed or removed." />
      </div>
    );

  const neededDate = new Date(request.required_by);
  const isOwnerOrAdmin = user && (user.id === request.requester_id || user.role === "admin");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      {/* Top back navigation */}
      <Link to="/requests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-inkSoft hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Active Requests</span>
      </Link>

      {/* Main Request Summary Card */}
      <div className="card bg-white shadow-sm border-line space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <BloodBadge group={request.blood_group} />
            <UrgencyBadge level={request.urgency} />
            <span className="badge bg-paper border border-line text-ink capitalize font-mono">{request.status}</span>
          </div>
          <span className="text-xs font-mono text-inkSoft">ID: #{request.id.slice(0, 8)}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 text-inkSoft text-xs">
            <Building2 className="h-4 w-4 text-crimson" />
            <span>Hospital Facility</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink">{request.hospital_name}</h1>
          <p className="mt-1 text-sm text-inkSoft flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-inkSoft/80" />
            <span>{request.hospital_location}, {request.city}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-paper p-4 border border-line text-sm">
          <div>
            <span className="text-xs text-inkSoft">Units Required</span>
            <p className="font-mono text-xl font-bold text-crimson mt-0.5">{request.units_required} Unit(s)</p>
          </div>
          <div>
            <span className="text-xs text-inkSoft">Needed By Date & Time</span>
            <p className="font-mono text-xs sm:text-sm font-semibold text-ink mt-1">
              {neededDate.toLocaleDateString()} {neededDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-inkSoft">Compatibility</span>
            <p className="text-xs font-semibold text-pulse-deep mt-1 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Real-Time ABO/Rh Matching</span>
            </p>
          </div>
        </div>

        {request.notes && (
          <div className="rounded-xl bg-paper/60 p-4 border border-line/80 text-sm">
            <span className="text-xs font-semibold text-inkSoft uppercase tracking-wider block mb-1">Requester Notes</span>
            <p className="text-ink leading-relaxed">{request.notes}</p>
          </div>
        )}

        {/* Matching Button */}
        {isOwnerOrAdmin ? (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={handleRunMatching}
              disabled={matching}
              className="btn-primary px-6 py-3 justify-center shadow-md shadow-crimson/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>{matching ? "Analyzing candidate donors..." : "Run Donor Matching Algorithm"}</span>
            </button>
            <span className="text-xs text-inkSoft">Ranks candidate donors by blood compatibility + proximity</span>
          </div>
        ) : (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 shrink-0" />
            <span>If you are a matched donor, you will see your acceptance action below or in your notifications.</span>
          </div>
        )}
      </div>

      {/* Official Medical Disclaimer Box */}
      <div className="rounded-xl border border-amber/30 bg-amber-soft/40 p-4 flex items-start gap-3 text-xs text-inkSoft">
        <Shield className="h-5 w-5 text-amber shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink font-semibold">Medical Protocol Reminder: </strong>
          {disclaimer || "Candidate donor suggestions are ranked by group compatibility and proximity. Actual transfusion compatibility and donor eligibility must always be confirmed by licensed medical professionals or blood banks."}
        </div>
      </div>

      {/* Candidate Donors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-crimson" />
            <h2 className="text-lg font-bold text-ink">Matched Candidate Donors ({matches.length})</h2>
          </div>
          {matches.length > 0 && (
            <span className="text-xs font-mono text-pulse font-semibold">Scored & Ranked</span>
          )}
        </div>

        {matches.length === 0 ? (
          <EmptyState
            title="No candidate donors ranked yet"
            message={
              isOwnerOrAdmin
                ? "Click 'Run Donor Matching Algorithm' above to identify and score available donors for this request."
                : "The requester has not run donor matching yet or no available matches are currently found."
            }
          />
        ) : (
          <div className="grid gap-3">
            {matches.map((m) => {
              const isMatchDonor = user && user.role === "donor";
              return (
                <div
                  key={m.id}
                  className="card bg-white hover:border-line hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson-soft text-crimson font-bold">
                      <Droplet className="h-5 w-5 fill-crimson" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{m.donor_display_name || "Verified Donor"}</p>
                      <p className="text-xs text-inkSoft mt-0.5">
                        Group <span className="font-bold font-mono text-crimson">{m.donor_blood_group}</span> · {m.donor_city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-xs text-inkSoft">Match Score:</span>
                        <span className="font-mono text-sm font-bold text-pulse-deep">{m.match_score} pts</span>
                      </div>
                      <span className={`badge mt-1 ${
                        m.status === "accepted" ? "bg-emerald-100 text-emerald-800" : "bg-pulse-soft text-pulse-deep"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    {isMatchDonor && m.status === "suggested" && (
                      <button
                        onClick={() => handleAcceptMatch(m.id)}
                        disabled={acceptingId === m.id}
                        className="btn-secondary text-xs px-3.5 py-1.5"
                      >
                        {acceptingId === m.id ? "Accepting..." : "Accept Request"}
                      </button>
                    )}
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

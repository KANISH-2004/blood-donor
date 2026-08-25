import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myRequests, listNotifications, markAllRead } from "../api/endpoints";
import { useToast } from "../components/Toast";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import BloodBadge from "../components/BloodBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import {
  PlusCircle,
  Activity,
  Bell,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

export default function DashboardRequester() {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.allSettled([myRequests(), listNotifications()]);
      if (reqRes.status === "fulfilled") setRequests(reqRes.value.data);
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      pushToast("All notifications marked as read.");
    } catch (err) {
      pushToast("Could not mark notifications as read.", "error");
    }
  };

  if (loading) return <Loading label="Loading requester dashboard..." />;

  const activeCount = requests.filter((r) => r.status === "active" || r.status === "matched").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>Requester Command Center</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">My Blood Requests</h1>
          <p className="mt-1 text-sm text-inkSoft">
            Track real-time candidate matches, accept donor coordination, and update request progress.
          </p>
        </div>
        <Link to="/request/new" className="btn-primary shrink-0">
          <PlusCircle className="h-4 w-4" />
          <span>Post New Request</span>
        </Link>
      </div>

      {/* Metric summary banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Active Requests</span>
          <p className="font-mono text-3xl font-bold text-crimson mt-1">{activeCount}</p>
          <p className="text-xs text-inkSoft mt-1">Awaiting or currently in coordination</p>
        </div>
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Completed</span>
          <p className="font-mono text-3xl font-bold text-pulse-deep mt-1">{completedCount}</p>
          <p className="text-xs text-inkSoft mt-1">Successfully fulfilled donations</p>
        </div>
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Total Posted</span>
          <p className="font-mono text-3xl font-bold text-ink mt-1">{requests.length}</p>
          <p className="text-xs text-inkSoft mt-1">Lifetime emergency blood posts</p>
        </div>
      </div>

      {/* Main Grid: My Requests List & Notifications */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-lg font-bold text-ink">Request History & Matches</h2>
            <span className="text-xs text-inkSoft font-semibold">{requests.length} Requests</span>
          </div>

          {requests.length === 0 ? (
            <EmptyState
              title="No blood requests posted yet"
              message="When you or someone in your family needs emergency blood, post a request here to immediately match with compatible donors."
              action={
                <Link to="/request/new" className="btn-primary">
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Your First Request</span>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="card bg-white hover:border-crimson/40 hover:shadow-sm transition-all p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <BloodBadge group={r.blood_group} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink text-base">{r.hospital_name}</h3>
                        <UrgencyBadge level={r.urgency} />
                      </div>
                      <p className="text-xs text-inkSoft flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{r.hospital_location}, {r.city}</span>
                      </p>
                      <p className="text-xs text-ink">
                        <span className="font-semibold text-crimson">{r.units_required} unit(s)</span> · Status:{" "}
                        <span className="badge bg-paper border border-line capitalize font-mono text-[10px]">
                          {r.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/requests/${r.id}`}
                    className="btn-primary text-xs px-4 py-2 w-full sm:w-auto justify-center"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>View & Match</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-ink" />
              <h2 className="text-lg font-bold text-ink">Notifications</h2>
              {unreadCount > 0 && (
                <span className="badge bg-crimson text-white text-[10px] px-2">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-inkSoft hover:text-ink hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState title="No notifications" message="Alerts for donor matches will appear here." />
          ) : (
            <ul className="space-y-2.5">
              {notifications.slice(0, 6).map((n) => (
                <li
                  key={n.id}
                  className={`rounded-xl border p-3.5 text-xs transition-all ${
                    n.is_read
                      ? "border-line bg-white text-inkSoft"
                      : "border-crimson/30 bg-crimson-soft/40 text-ink shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-ink text-xs">{n.title}</p>
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-crimson shrink-0 mt-1" />}
                  </div>
                  <p className="mt-1 text-inkSoft leading-relaxed">{n.message}</p>
                  {n.related_request_id && (
                    <Link
                      to={`/requests/${n.related_request_id}`}
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-crimson hover:underline"
                    >
                      <span>Go to Request</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

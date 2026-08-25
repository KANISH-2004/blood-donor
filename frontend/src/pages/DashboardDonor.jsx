import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDonorProfile, listNotifications, updateMyDonorProfile, markAllRead, listRequests } from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import BloodBadge from "../components/BloodBadge";
import {
  Heart,
  Droplet,
  Bell,
  CheckCircle2,
  Calendar,
  MapPin,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Edit3,
} from "lucide-react";

export default function DashboardDonor() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { pushToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [profileRes, notifRes, reqRes] = await Promise.allSettled([
        getMyDonorProfile(),
        listNotifications(),
        listRequests(),
      ]);
      if (profileRes.status === "fulfilled") {
        const prof = profileRes.value.data;
        setProfile(prof);
        if (reqRes.status === "fulfilled") {
          // Filter active requests in donor's city or matching blood group
          const matched = reqRes.value.data.filter(
            (r) => r.city?.toLowerCase() === prof.city?.toLowerCase() || r.blood_group === prof.blood_group
          );
          setMatchingRequests(matched.slice(0, 4));
        }
      }
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const res = await updateMyDonorProfile({ is_available: !profile.is_available });
      setProfile(res.data);
      pushToast(res.data.is_available ? "You're now marked AVAILABLE for emergency requests." : "You're marked UNAVAILABLE.");
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not update availability."), "error");
    } finally {
      setToggling(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      pushToast("All notifications marked as read.");
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not mark notifications as read."), "error");
    }
  };

  if (loading) return <Loading label="Loading donor dashboard..." />;

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Complete your donor profile"
          message="Add your blood group and city to join our active emergency dispatch network."
          action={
            <Link to="/donor/register" className="btn-primary">
              <Droplet className="h-4 w-4" />
              <span>Create Donor Profile</span>
            </Link>
          }
        />
      </div>
    );
  }

  // Calculate days since last donation
  let donationGapNotice = "Eligible to donate";
  if (profile.last_donation_date) {
    const lastDate = new Date(profile.last_donation_date);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      donationGapNotice = `${90 - diffDays} days until next donation interval`;
    } else {
      donationGapNotice = `Ready to donate (${diffDays} days since last donation)`;
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Droplet className="h-4 w-4" />
            <span>Donor Control Center</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Welcome, {profile.full_name || "Hero"}</h1>
          <p className="mt-1 text-sm text-inkSoft">
            Manage your emergency availability status, view matched patient requests, and track donation impact.
          </p>
        </div>
        <Link to="/donor/register" className="btn-outline shrink-0">
          <Edit3 className="h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* KPI & Status Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Availability Card */}
        <div className="card bg-white border-line flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-inkSoft uppercase">Dispatch Status</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                profile.is_available ? "bg-pulse animate-pulse" : "bg-line"
              }`}
            />
          </div>
          <div className="my-2">
            <p className={`text-xl font-bold ${profile.is_available ? "text-pulse-deep" : "text-inkSoft"}`}>
              {profile.is_available ? "Ready & Available" : "Offline / Unavailable"}
            </p>
            <p className="text-xs text-inkSoft mt-1">
              {profile.is_available ? "Eligible to receive match alerts" : "No match notifications sent"}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className={`btn text-xs w-full justify-center ${
              profile.is_available ? "btn-outline text-ink" : "btn-secondary"
            }`}
          >
            {toggling ? "Updating..." : profile.is_available ? "Set as Unavailable" : "Set as Available"}
          </button>
        </div>

        {/* Blood Type Card */}
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Blood Group</span>
          <div className="mt-3 flex items-center gap-3">
            <BloodBadge group={profile.blood_group} />
            <div>
              <p className="font-mono text-xl font-bold text-ink">{profile.blood_group}</p>
              <p className="text-xs text-inkSoft">Verified Type</p>
            </div>
          </div>
          <p className="text-[11px] text-inkSoft mt-4 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{profile.area ? `${profile.area}, ` : ""}{profile.city}</span>
          </p>
        </div>

        {/* Total Donations */}
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Donation Impact</span>
          <div className="mt-2">
            <p className="font-mono text-3xl font-bold text-crimson">{profile.total_donations}</p>
            <p className="text-xs text-inkSoft mt-1">Life-saving donations logged</p>
          </div>
          <div className="mt-3 text-[11px] text-pulse-deep font-semibold flex items-center gap-1">
            <Heart className="h-3 w-3 fill-pulse" />
            <span>Estimated ~{profile.total_donations * 3} lives touched</span>
          </div>
        </div>

        {/* Next Interval */}
        <div className="card bg-white border-line p-5">
          <span className="text-xs font-semibold text-inkSoft uppercase">Eligibility Status</span>
          <div className="mt-2">
            <p className="text-sm font-bold text-ink leading-tight">{donationGapNotice}</p>
            <p className="text-xs text-inkSoft mt-1">
              Last donation: <span className="font-mono">{profile.last_donation_date || "None recorded"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Matching Requests & Notifications */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Nearby & Compatible Emergency Requests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-crimson" />
              <h2 className="text-lg font-bold text-ink">Urgent Requests in Your Area</h2>
            </div>
            <Link to="/requests" className="text-xs font-semibold text-crimson hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {matchingRequests.length === 0 ? (
            <EmptyState
              title="No urgent requests in your city"
              message="When hospitals in your area need your blood type, they will appear here automatically."
            />
          ) : (
            <div className="space-y-3">
              {matchingRequests.map((r) => (
                <div
                  key={r.id}
                  className="card bg-white hover:border-crimson/40 hover:shadow-sm transition-all p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BloodBadge group={r.blood_group} />
                    <div>
                      <p className="font-bold text-ink text-sm">{r.hospital_name}</p>
                      <p className="text-xs text-inkSoft flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>{r.city} · {r.units_required} unit(s) needed</span>
                      </p>
                    </div>
                  </div>
                  <Link to={`/requests/${r.id}`} className="btn-outline text-xs px-3 py-1.5">
                    View Request
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notifications Center */}
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
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-inkSoft hover:text-ink hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState title="No notifications" message="You are all caught up!" />
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
                      <span>View details</span>
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

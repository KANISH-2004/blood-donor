import { useEffect, useState } from "react";
import {
  adminListRequests,
  adminListUsers,
  adminReactivateUser,
  adminStats,
  adminSuspendUser,
  adminRemoveRequest,
} from "../api/endpoints";
import { apiErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import Loading from "../components/Loading";
import BloodBadge from "../components/BloodBadge";
import UrgencyBadge from "../components/UrgencyBadge";
import {
  ShieldCheck,
  Users,
  Droplets,
  Activity,
  UserX,
  Search,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "KPI Overview" },
  { key: "users", label: "User Directory" },
  { key: "requests", label: "Request Oversight" },
];

export default function DashboardAdmin() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, requestsRes] = await Promise.all([
        adminStats(),
        adminListUsers(),
        adminListRequests(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not load admin data."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuspendToggle = async (targetUser) => {
    try {
      if (targetUser.is_suspended) {
        await adminReactivateUser(targetUser.id);
        pushToast(`User ${targetUser.full_name} has been reactivated.`);
      } else {
        await adminSuspendUser(targetUser.id, "Suspended by platform administrator");
        pushToast(`User ${targetUser.full_name} has been suspended.`);
      }
      load();
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not update user status."), "error");
    }
  };

  const handleRemoveRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to permanently remove this request from the platform?")) {
      return;
    }
    try {
      await adminRemoveRequest(requestId);
      pushToast("Emergency request removed.");
      load();
    } catch (err) {
      pushToast(apiErrorMessage(err, "Could not remove request."), "error");
    }
  };

  if (loading) return <Loading label="Loading administration dashboard..." />;

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Platform Governance & Oversight</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Admin Control Center</h1>
          <p className="mt-1 text-sm text-inkSoft">
            Monitor platform metrics, moderate accounts, and oversee live emergency blood dispatches.
          </p>
        </div>
        <button
          onClick={load}
          className="btn-outline flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition-all ${
              tab === t.key
                ? "border-crimson text-crimson"
                : "border-transparent text-inkSoft hover:text-ink hover:border-line"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card bg-white border-line p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-ink">{stats.total_users}</p>
                <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mt-0.5">Total Users</p>
              </div>
            </div>

            <div className="card bg-white border-line p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-crimson-soft text-crimson">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-crimson">{stats.total_donors}</p>
                <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mt-0.5">
                  Registered Donors ({stats.available_donors} Available)
                </p>
              </div>
            </div>

            <div className="card bg-white border-line p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pulse-soft text-pulse-deep">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-pulse-deep">{stats.active_requests}</p>
                <p className="text-xs font-semibold text-inkSoft uppercase tracking-wider mt-0.5">
                  Active Requests ({stats.total_requests} Lifetime)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-ink mb-3">System Health & Compliance</h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="p-3 bg-paper rounded-lg border border-line">
                <span className="text-inkSoft">Suspended Accounts</span>
                <p className="text-lg font-bold font-mono text-ink mt-1">{stats.suspended_users}</p>
              </div>
              <div className="p-3 bg-paper rounded-lg border border-line">
                <span className="text-inkSoft">Donor Availability Ratio</span>
                <p className="text-lg font-bold font-mono text-pulse-deep mt-1">
                  {stats.total_donors > 0
                    ? `${Math.round((stats.available_donors / stats.total_donors) * 100)}%`
                    : "100%"}
                </p>
              </div>
              <div className="p-3 bg-paper rounded-lg border border-line">
                <span className="text-inkSoft">Privacy Compliance</span>
                <p className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Enforced (Masked API)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-inkSoft/60" />
              <input
                className="input pl-9 text-xs"
                placeholder="Search users by name, email, or role..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <span className="text-xs text-inkSoft font-mono">{filteredUsers.length} User(s)</span>
          </div>

          <div className="card overflow-x-auto p-0 bg-white shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-paper border-b border-line text-inkSoft font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email & Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-paper/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-ink">{u.full_name}</td>
                    <td className="px-4 py-3 text-inkSoft">
                      <p>{u.email}</p>
                      <p className="font-mono text-[11px]">{u.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-paper border border-line capitalize font-mono text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          u.is_suspended
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {u.is_suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleSuspendToggle(u)}
                          className={`btn text-xs px-3 py-1 ${
                            u.is_suspended ? "btn-secondary" : "btn-outline text-crimson hover:bg-crimson-soft"
                          }`}
                        >
                          {u.is_suspended ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {tab === "requests" && (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="card bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <BloodBadge group={r.blood_group} />
                <div>
                  <p className="font-bold text-ink text-sm">{r.hospital_name}</p>
                  <p className="text-xs text-inkSoft">
                    {r.hospital_location}, {r.city} · <span className="font-bold text-crimson">{r.units_required} unit(s)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UrgencyBadge level={r.urgency} />
                <span className="badge bg-paper border border-line capitalize font-mono text-[10px]">
                  {r.status}
                </span>
                <button
                  onClick={() => handleRemoveRequest(r.id)}
                  className="p-1.5 text-inkSoft hover:text-crimson hover:bg-crimson-soft rounded-lg transition-colors"
                  title="Remove request"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

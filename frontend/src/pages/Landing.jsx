import { useState } from "react";
import { Link } from "react-router-dom";
import PulseLine from "../components/PulseLine";
import { useAuth } from "../context/AuthContext";
import BloodBadge from "../components/BloodBadge";
import {
  Heart,
  Droplet,
  Shield,
  Clock,
  Search,
  Activity,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

const COMPATIBILITY_RULES = {
  "O-": {
    canGiveTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-"],
    desc: "Universal red cell donor. Vital for emergency transfusions when blood type is unknown.",
    badgeClass: "bg-red-700 text-white",
  },
  "O+": {
    canGiveTo: ["O+", "A+", "B+", "AB+"],
    canReceiveFrom: ["O-", "O+"],
    desc: "Most common blood group. High demand across all trauma units.",
    badgeClass: "bg-red-600 text-white",
  },
  "A-": {
    canGiveTo: ["A-", "A+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "A-"],
    desc: "Can donate red blood cells to both A and AB blood types.",
    badgeClass: "bg-rose-600 text-white",
  },
  "A+": {
    canGiveTo: ["A+", "AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+"],
    desc: "Second most common blood type. Widely needed for routine & emergency surgeries.",
    badgeClass: "bg-rose-500 text-white",
  },
  "B-": {
    canGiveTo: ["B-", "B+", "AB-", "AB+"],
    canReceiveFrom: ["O-", "B-"],
    desc: "One of the rarest blood groups. Every active donor makes a huge difference.",
    badgeClass: "bg-amber-600 text-white",
  },
  "B+": {
    canGiveTo: ["B+", "AB+"],
    canReceiveFrom: ["O-", "O+", "B-", "B+"],
    desc: "Can give red blood cells to B+ and AB+ recipients.",
    badgeClass: "bg-amber-500 text-white",
  },
  "AB-": {
    canGiveTo: ["AB-", "AB+"],
    canReceiveFrom: ["O-", "A-", "B-", "AB-"],
    desc: "Rarest blood group. Can receive red blood cells from all negative groups.",
    badgeClass: "bg-purple-600 text-white",
  },
  "AB+": {
    canGiveTo: ["AB+"],
    canReceiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    desc: "Universal recipient for red blood cells. Universal donor for plasma.",
    badgeClass: "bg-purple-700 text-white",
  },
};

const STEPS = [
  {
    icon: AlertCircle,
    step: "01",
    label: "Post Emergency Need",
    body: "Requesters submit blood group, hospital name, units, and urgency level in under 60 seconds.",
  },
  {
    icon: Activity,
    step: "02",
    label: "Rank Compatible Donors",
    body: "Our intelligent algorithm matches real ABO/Rh compatibility rules and proximity while masking exact donor addresses.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    label: "Coordinate & Save Lives",
    body: "Donors receive instant alerts to accept the request. Transfusions are verified by medical professionals at the hospital.",
  },
];

const STATS = [
  { icon: Droplet, value: "8", unit: "Blood Types", label: "Full ABO & Rh Compatibility Matrix" },
  { icon: Clock, value: "< 2 min", unit: "", label: "Average Time to Post & Match" },
  { icon: Shield, value: "100%", unit: "Privacy Safe", label: "Zero Public Leaks of Phone or Exact Location" },
];

export default function Landing() {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState("O-");

  const compData = COMPATIBILITY_RULES[selectedGroup];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-paper to-white pt-8 pb-16 sm:pb-24">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-crimson/5 blur-3xl pointer-events-none" />

        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-12 md:items-center">
          {/* Left Column - Copy */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-crimson/20 bg-crimson-soft px-3.5 py-1 text-xs font-semibold text-crimson">
              <span className="h-2 w-2 rounded-full bg-crimson animate-pulse" />
              <span>Real-Time Blood Donor Matching Platform</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              When seconds save lives, <br />
              <span className="text-crimson">find the right donor fast.</span>
            </h1>

            <p className="max-w-xl text-lg text-inkSoft">
              RedLine eliminates frantic social media searching by directly connecting hospitals and families with
              verified, compatible donors nearby — completely protecting donor privacy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={user ? "/request/new" : "/register"} className="btn-primary text-base px-6 py-3 shadow-md shadow-crimson/20 hover:scale-[1.02] transition-transform">
                <AlertCircle className="h-5 w-5" />
                <span>Post Emergency Request</span>
              </Link>
              <Link to="/search" className="btn-outline text-base px-6 py-3 hover:bg-line/40">
                <Search className="h-5 w-5 text-inkSoft" />
                <span>Search Available Donors</span>
              </Link>
            </div>

            {/* Micro trust indicators */}
            <div className="pt-4 flex items-center gap-6 text-xs text-inkSoft">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-pulse" />
                No phone/email leaks
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-pulse" />
                Free community service
              </span>
            </div>
          </div>

          {/* Right Column - Live Active Snapshot Card */}
          <div className="md:col-span-5">
            <div className="card border-2 border-line/80 shadow-xl shadow-ink/5 bg-white/90 backdrop-blur">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-crimson animate-ping" />
                  <span className="font-display font-bold text-ink">Urgent Live Feed</span>
                </div>
                <span className="text-xs font-mono text-pulse font-semibold uppercase">Real-Time Dispatch</span>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { group: "O-", units: "3 Units", hospital: "Apollo Emergency", city: "Chennai", urgency: "critical", time: "12m ago" },
                  { group: "B+", units: "2 Units", hospital: "City General", city: "Coimbatore", urgency: "urgent", time: "45m ago" },
                  { group: "A+", units: "1 Unit", hospital: "St. Mary's Care", city: "Bengaluru", urgency: "scheduled", time: "2h ago" },
                ].map((item, idx) => (
                  <div key={idx} className="group rounded-xl border border-line/80 bg-paper/60 p-3.5 hover:border-crimson/40 hover:bg-crimson-soft/20 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BloodBadge group={item.group} />
                      <div>
                        <p className="text-sm font-semibold text-ink group-hover:text-crimson transition-colors">{item.hospital}</p>
                        <p className="text-xs text-inkSoft">{item.city} · <span className="font-medium text-ink">{item.units}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        item.urgency === "critical" ? "bg-red-100 text-red-700 border border-red-200" :
                        item.urgency === "urgent" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                        "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {item.urgency}
                      </span>
                      <p className="text-[10px] text-inkSoft mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-line">
                <Link to="/requests" className="flex items-center justify-center gap-1.5 text-xs font-semibold text-crimson hover:text-crimson-deep transition-colors w-full py-1">
                  <span>View All Active Emergency Requests</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <PulseLine />
        </div>
      </section>

      {/* Interactive Blood Compatibility Matrix Explorer */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-gradient-to-br from-white via-paper to-white p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="eyebrow flex items-center justify-center gap-1">
              <Droplet className="h-4 w-4" />
              <span>Interactive Compatibility Guide</span>
            </p>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Know your compatibility in one click</h2>
            <p className="text-sm text-inkSoft">
              Select any blood group below to instantly see who you can donate to and receive from based on scientific ABO/Rh rules.
            </p>
          </div>

          {/* Blood group selector pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {Object.keys(COMPATIBILITY_RULES).map((group) => {
              const active = selectedGroup === group;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`px-4 py-2 rounded-xl font-display font-bold text-sm sm:text-base transition-all ${
                    active
                      ? "bg-crimson text-white shadow-md shadow-crimson/30 scale-105"
                      : "bg-white border border-line text-ink hover:border-crimson hover:bg-crimson-soft/30"
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>

          {/* Compatibility Breakdown Card */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Can Donate To */}
            <div className="card bg-white border-pulse/20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-soft text-pulse-deep">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Blood Group {selectedGroup} Can Donate To:</h3>
                  <p className="text-xs text-inkSoft">Eligible recipient blood types</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {compData.canGiveTo.map((g) => (
                  <span key={g} className="px-3 py-1.5 rounded-lg bg-pulse-soft text-pulse-deep font-bold font-mono text-sm border border-pulse/20">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Can Receive From */}
            <div className="card bg-white border-crimson/20 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crimson-soft text-crimson-deep">
                  <Droplet className="h-4 w-4 fill-crimson" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Blood Group {selectedGroup} Can Receive From:</h3>
                  <p className="text-xs text-inkSoft">Compatible donor blood types</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {compData.canReceiveFrom.map((g) => (
                  <span key={g} className="px-3 py-1.5 rounded-lg bg-crimson-soft text-crimson-deep font-bold font-mono text-sm border border-crimson/20">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-paper p-4 text-xs text-inkSoft flex items-start gap-2 border border-line">
            <HelpCircle className="h-4 w-4 text-pulse shrink-0 mt-0.5" />
            <p>
              <strong className="text-ink font-semibold">Scientific Fact:</strong> {compData.desc} (Transfusion compatibility is always cross-matched in a certified lab prior to procedure).
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="eyebrow">Seamless Process</p>
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">How RedLine saves lives during emergencies</h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="card relative overflow-hidden group hover:border-crimson/40 hover:shadow-lg transition-all">
                <span className="absolute top-4 right-4 font-mono text-3xl font-black text-line/80 select-none group-hover:text-crimson/20 transition-colors">
                  {step.step}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-crimson-soft text-crimson mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-ink">{step.label}</h3>
                <p className="mt-2 text-sm text-inkSoft leading-relaxed">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Stats Bar */}
      <section className="border-y border-line bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 sm:grid-cols-3">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper border border-line text-crimson">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-ink">{s.value}</span>
                    {s.unit && <span className="text-xs font-semibold text-crimson">{s.unit}</span>}
                  </div>
                  <p className="text-xs text-inkSoft">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-xl border border-amber/30 bg-amber-soft/50 p-5 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber shrink-0 mt-0.5" />
          <div className="text-xs text-inkSoft leading-relaxed">
            <strong className="text-ink font-semibold">Important Medical Notice: </strong>
            RedLine helps families and hospitals coordinate rapidly with nearby volunteers. It is an operational platform
            and does not make final transfusion compatibility or medical eligibility determinations. Final cross-matching
            must always be performed by licensed medical professionals or blood banks.
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card relative overflow-hidden bg-gradient-to-r from-ink via-ink to-ink/95 text-white p-8 sm:p-12">
          <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg space-y-2">
              <h3 className="font-display text-2xl font-bold sm:text-3xl text-white">Be someone's hero today.</h3>
              <p className="text-sm text-white/70">
                Register once as a donor. Your location is kept strictly private and you only get alerted when a compatible patient nearby is in critical need.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3 bg-crimson hover:bg-crimson-deep">
                Join as Donor
              </Link>
              <Link to="/request/new" className="btn-outline text-base px-6 py-3 bg-white text-ink hover:bg-paper">
                Post Request
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

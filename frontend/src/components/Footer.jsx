import { Link } from "react-router-dom";
import { Droplet, Heart, Shield, PhoneCall, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1 - Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-crimson text-white">
                <Droplet className="h-4 w-4 fill-white" />
              </div>
              <span>RedLine</span>
            </div>
            <p className="text-xs text-inkSoft leading-relaxed">
              An emergency platform connecting blood donors, requesters, and regional hospitals to save lives without compromising donor privacy.
            </p>
          </div>

          {/* Col 2 - Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Quick Links</h4>
            <ul className="space-y-2 text-xs text-inkSoft">
              <li>
                <Link to="/search" className="hover:text-crimson transition-colors">
                  Find Available Donors
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-crimson transition-colors">
                  Live Emergency Requests
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-crimson transition-colors">
                  Donor Registration
                </Link>
              </li>
              <li>
                <Link to="/request/new" className="hover:text-crimson transition-colors">
                  Post Blood Need
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 - Emergency Hotline info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">Emergency Assistance</h4>
            <p className="text-xs text-inkSoft leading-relaxed">
              In severe life-threatening emergencies, always contact your local hospital blood bank directly.
            </p>
            <div className="rounded-lg bg-crimson-soft/60 border border-crimson/20 p-2.5 text-xs text-crimson-deep flex items-center gap-2">
              <PhoneCall className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold">National Blood Helpline: 104 / 108</span>
            </div>
          </div>

          {/* Col 4 - Medical Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-pulse" />
              <span>Medical Protocol</span>
            </h4>
            <p className="text-xs text-inkSoft leading-relaxed">
              RedLine facilitates rapid coordination only. Transfusion compatibility and donor health eligibility must always be verified by certified blood banks and medical practitioners.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-inkSoft">
          <p>© {new Date().getFullYear()} RedLine Platform. Open-source Blood Coordination System.</p>
          <div className="flex items-center gap-4">
            <Link to="/search" className="hover:text-ink">Donor Directory</Link>
            <Link to="/requests" className="hover:text-ink">Requests</Link>
            <Link to="/login" className="hover:text-ink">Member Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

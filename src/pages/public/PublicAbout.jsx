import { Link } from "react-router-dom";
import { FiTarget, FiZap, FiShield, FiUsers, FiArrowRight, FiAward } from "react-icons/fi";

const PublicAbout = () => {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 font-sans space-y-16">
            {/* HERO */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-700">
                    About HireSphere
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    Connecting Top Engineering Talent with World-Class Teams
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                    HireSphere is an enterprise-grade recruitment ecosystem designed to eliminate hiring friction. We empower tech professionals to find impactful careers and enable organizations to discover, screen, and recruit the best minds without delays.
                </p>
            </div>

            {/* CORE PILLARS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FiTarget size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Precision Matching</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Our platform pairs job requirements with candidate profiles based on verified skills, years of expertise, and workplace preference.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <FiZap size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Direct ATS Pipeline</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        No middleman. Recruiters review applications directly with shortlisting, feedback, and offer workflows in real-time.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FiShield size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">100% Verified Employers</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Every employer and job opening undergoes authenticity verification to ensure a safe, legitimate job-hunting experience.
                    </p>
                </div>
            </div>

            {/* PLATFORM STATS */}
            <div className="rounded-3xl bg-slate-900 text-white p-10 sm:p-14 text-center space-y-8">
                <h2 className="text-2xl sm:text-3xl font-black">Built for Speed and Scale</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-3xl sm:text-4xl font-black text-indigo-400">100+</p>
                        <p className="text-xs text-slate-300 mt-1">Live Job Openings</p>
                    </div>
                    <div>
                        <p className="text-3xl sm:text-4xl font-black text-purple-400">10+</p>
                        <p className="text-xs text-slate-300 mt-1">Enterprise Partners</p>
                    </div>
                    <div>
                        <p className="text-3xl sm:text-4xl font-black text-emerald-400">&lt; 24 Hrs</p>
                        <p className="text-xs text-slate-300 mt-1">Average Response Time</p>
                    </div>
                    <div>
                        <p className="text-3xl sm:text-4xl font-black text-amber-400">0%</p>
                        <p className="text-xs text-slate-300 mt-1">Candidate Fees</p>
                    </div>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Ready to take the next step?</h3>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition"
                    >
                        Explore Open Jobs
                        <FiArrowRight size={14} />
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-6 py-3 text-xs font-bold text-slate-700 transition"
                    >
                        Sign Up as Employer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicAbout;

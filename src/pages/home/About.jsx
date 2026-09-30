import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { FiCheckCircle, FiShield, FiTrendingUp, FiUsers } from "react-icons/fi";

const About = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700">
                        About HireSphere
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        Built for modern tech hiring
                    </h1>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        HireSphere connects software developers, engineers, and digital innovators directly with tech leaders without friction or outdated black-box applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <FiCheckCircle size={20} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">100% Verified Positions</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Every vacancy is published by verified hiring managers and recruiters with transparent salary ranges.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <FiTrendingUp size={20} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Real-Time Pipeline Status</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Never wonder where your resume went. Receive instant notifications when an employer reviews, shortlists, or accepts your application.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <FiShield size={20} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Direct ATS Management</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Employers get an integrated candidate tracking system to shortlist, review PDF resumes, and send instant offers.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;

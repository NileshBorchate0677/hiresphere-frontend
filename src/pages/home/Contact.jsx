import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { FiMail, FiMapPin, FiCheck } from "react-icons/fi";

const Contact = () => {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact HireSphere Support</h1>
                    <p className="text-xs text-slate-500">Have questions about your recruiter workspace or job seeker account?</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs max-w-xl mx-auto space-y-6">
                    {sent ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-xs font-semibold text-emerald-800 space-y-2">
                            <FiCheck size={24} className="mx-auto text-emerald-600" />
                            <p>Thank you for reaching out! Our support team will get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Work Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Message / Question</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition shadow-sm"
                            >
                                Send Inquiry
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;

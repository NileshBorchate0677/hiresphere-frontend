import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiCheckCircle, FiSend } from "react-icons/fi";

const PublicContact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 font-sans space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="inline-block rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-700">
                    Get in Touch
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    We're Here to Help
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                    Have questions about hiring solutions, job seeker features, or enterprise plans? Send us a message and our team will get back to you shortly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONTACT DETAILS */}
                <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FiMail size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Email Support</h3>
                        <p className="text-xs text-slate-500">support@hiresphere.dev</p>
                        <p className="text-[11px] text-slate-400">Available Monday - Friday, 9am - 7pm IST</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FiPhone size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Enterprise Hotline</h3>
                        <p className="text-xs text-slate-500">+91 (020) 2553-9000</p>
                        <p className="text-[11px] text-slate-400">Dedicated hiring specialist assistance</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FiMapPin size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Headquarters</h3>
                        <p className="text-xs text-slate-500">Pune Tech Park, Shivaji Nagar, Pune, MH 411005</p>
                    </div>
                </div>

                {/* FORM */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs">
                    {submitted ? (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                                <FiCheckCircle size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Message Received!</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Thank you for contacting HireSphere. One of our specialists will respond to {email} within 24 business hours.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubmitted(false);
                                    setName("");
                                    setEmail("");
                                    setMessage("");
                                }}
                                className="inline-block rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                                Send us an Inquiry
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Nilesh Borchate"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">Your Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nilesh@example.com"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Your Message / Question</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what you need help with..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                            >
                                <FiSend size={13} />
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicContact;

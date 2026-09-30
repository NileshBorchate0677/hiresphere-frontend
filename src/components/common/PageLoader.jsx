import React from "react";

const PageLoader = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 font-sans animate-in fade-in duration-200">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Loading Experience...
            </p>
        </div>
    );
};

export default PageLoader;

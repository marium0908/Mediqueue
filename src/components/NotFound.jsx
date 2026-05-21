import React from "react";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound({ setRoute }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-24 w-24 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 rounded-2xl flex items-center justify-center shadow-sm"
      >
        <HelpCircle className="h-12 w-12 text-indigo-650" />
      </motion.div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
          Page Not Found (404)
        </h1>
        <p className="text-sm text-slate-505 dark:text-slate-400 leading-relaxed">
          The requested route, URL pathname, or directory parameter is unrecognized or has migrated elsewhere. Let us return you to active operations.
        </p>
      </div>

      <div>
        <button
          onClick={() => setRoute("home")}
          className="inline-flex items-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold rounded-lg text-xs shadow-md transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
}

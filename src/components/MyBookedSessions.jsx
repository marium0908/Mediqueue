import { useState, useEffect } from "react";
import { Booking, User } from "../types";
import { useToast } from "./Toast";
import { CalendarCheck, AlertTriangle, XSquare, Clock, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MyBookedSessions({ currentUser, token, setRoute }) {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for cancel confirmation modal
  const [cancellingSessionId, setCancellingSessionId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchMyBookedSessions();
  }, [currentUser]);

  const fetchMyBookedSessions = () => {
    if (!currentUser) return;
    setIsLoading(true);

    fetch("/api/bookings/my", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load booked sessions");
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Bookings fetch error:", err);
        setIsLoading(false);
      });
  };

  const handleCancelConfirm = async () => {
    if (!cancellingSessionId) return;
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/bookings/${cancellingSessionId}/cancel`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel booking slot");
      }

      toast.success("Admissions slot has been successfully cancelled.");
      setCancellingSessionId(null);

      // Instantly update on-screen status without needing page reload!
      setSessions((prev) =>
        prev.map((item) =>
          item._id === cancellingSessionId ? { ...item, bookingStatus: "cancelled" } : item
        )
      );
    } catch (err) {
      toast.error(err.message || "Cancellation request failed.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-indigo-50/10 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          My Booked Tutor Sessions
        </h1>
        <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
          Monitor your upcoming academic session schedules and admissions badges, specific to your student identity.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : sessions.length === 0 ? (
        /* Empty State */
        <div className="p-8 md:p-12 text-center bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl space-y-4 backdrop-blur-xs shadow-xs">
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 rounded-full flex items-center justify-center mx-auto">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-bold text-slate-800 dark:text-white font-display text-base">You haven't booked any sessions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse through our certified tutors roster to queue a learning slot or secure admission tokens.
            </p>
          </div>
          <button
            onClick={() => setRoute("tutors")}
            className="py-2 px-6 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-505 cursor-pointer transition shadow-xs"
          >
            Find a Tutor
          </button>
        </div>
      ) : (
        /* Booking Table */
        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 shadow-xs overflow-hidden backdrop-blur-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-100/30 dark:bg-indigo-950/55 text-slate-500 dark:text-slate-400 border-b border-indigo-100/20 dark:border-indigo-900/30 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Tutor Name</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Student Email (Ref)</th>
                  <th className="py-4 px-6">Admissions Status</th>
                  <th className="py-4 px-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/20 dark:divide-indigo-900/20 text-slate-705 dark:text-slate-300">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-105">
                      {session.tutorName}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-850 dark:text-slate-205">
                      {session.studentName}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {session.studentEmail}
                    </td>
                    <td className="py-4 px-6">
                      {session.bookingStatus === "booked" ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-150/40 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          ● Booked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/40 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {session.bookingStatus === "booked" ? (
                        <button
                          onClick={() => setCancellingSessionId(session._id)}
                          className="py-1 px-3 border border-rose-100 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 rounded text-[11px] font-semibold transition cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 line-through">cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal Dialog */}
      <AnimatePresence>
        {cancellingSessionId && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingSessionId(null)}
              className="absolute inset-0 bg-slate-950"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-indigo-50/95 dark:bg-indigo-950/95 border border-indigo-100/40 dark:border-indigo-900/40 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center space-y-4 backdrop-blur-md"
            >
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">
                  Confirm Booking Cancellation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal px-4">
                  Are you sure you want to cancel your booked learning slot? This will release the slot capacity back to the directory records.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setCancellingSessionId(null)}
                  className="py-2 px-4 border border-indigo-150 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100/20 dark:hover:bg-indigo-950/40 cursor-pointer"
                >
                  Return
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isCancelling}
                  className="py-2 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

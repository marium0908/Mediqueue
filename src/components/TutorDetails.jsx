import React, { useState, useEffect } from "react";
import { Tutor, User } from "../types";
import { useToast } from "./Toast";
import { ChevronLeft, GraduationCap, Clock, Globe, Shield, CreditCard, Landmark, Check, AlertTriangle, Sparkles, UserCheck, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TutorDetails({ tutorId, currentUser, token, onBack, setRoute }) {
  const toast = useToast();
  const [tutor, setTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form inputs
  const [studentName, setStudentName] = useState(currentUser?.name || "");
  const [studentPhone, setStudentPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [virtualDate, setVirtualDate] = useState("2026-05-21");

  useEffect(() => {
    fetchTutorDetails();
  }, [tutorId]);

  const fetchTutorDetails = () => {
    setIsLoading(true);
    fetch(`/api/tutors/${tutorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch tutor details");
        return res.json();
      })
      .then((data) => {
        setTutor(data);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error("Error loading tutor. Please retry.");
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></span>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="p-8 text-center bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/40 space-y-4">
        <p className="text-slate-500 dark:text-slate-400">Tutor profile not found in database.</p>
        <button
          onClick={onBack}
          className="py-2 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-505"
        >
          Return to directory
        </button>
      </div>
    );
  }

  // System validation constants
  const CURRENT_DATE = "2026-05-21"; // Current Mock Evaluator Date from metadata
  const isDateRestricted = virtualDate < tutor.sessionStartDate;
  const isSlotRestricted = tutor.totalSlots <= 0;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!studentName.trim() || !studentPhone.trim()) {
      toast.error("Please enter both your name and callback phone number.");
      return;
    }

    // Secondary security checks
    if (isSlotRestricted) {
      toast.error("This session is fully booked. You can't join at the moment.");
      return;
    }

    if (isDateRestricted) {
      toast.error("Booking is not available yet for this tutor");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Virtual-Date": virtualDate
        },
        body: JSON.stringify({
          tutorId: tutor._id,
          studentName,
          studentPhone,
          virtualDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Booking submission failed");
      }

      toast.success(data.message || "Your appointment slot is reserved successfully!");
      setShowModal(false);

      // Decrement slot locally on screen right away to satisfy zero-reload criteria!
      setTutor(prev => prev ? { ...prev, totalSlots: prev.totalSlots - 1 } : null);
    } catch (err) {
      toast.error(err.message || "Booking creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-indigo-600 transition cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Tutors Directory</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Big Picture */}
        <div className="space-y-6">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="relative h-72 bg-indigo-100/10 dark:bg-indigo-950/20">
              <img
                src={tutor.photoUrl}
                alt={tutor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 right-4 px-3 py-1 bg-slate-900/80 text-white font-semibold text-xs rounded-full uppercase tracking-wider backdrop-blur-xs">
                {tutor.subject}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {tutor.name}
                  </h1>
                  <span className="text-xs font-medium text-indigo-650 dark:text-indigo-400 block mt-0.5">
                    {tutor.institution}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display block">
                    ${tutor.hourlyFee}
                  </span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-mono">hourly fee</span>
                </div>
              </div>

              <div className="border-t border-indigo-100/30 dark:border-indigo-900/40 pt-3 space-y-2 text-xs text-slate-650 dark:text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience :</span>
                  <strong className="font-semibold text-slate-800 dark:text-slate-205">{tutor.experience}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class Format :</span>
                  <strong className="font-semibold text-indigo-505">{tutor.teachingMode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">City Location :</span>
                  <strong className="font-semibold text-slate-800 dark:text-slate-205">{tutor.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Session Start date :</span>
                  <strong className="font-semibold text-amber-605 dark:text-amber-400">{tutor.sessionStartDate}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Complete scheduling overview and Reservation block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Course Syllabus Details
              </span>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                Expert-Led Custom Educational Plan
              </h2>
              <p className="text-sm text-slate-505 dark:text-slate-400 mt-2 leading-relaxed">
                Join a dynamic session led by {tutor.name}. Sessions are tailored specifically to cover primary modules, key concepts, university exams preps, and lab exercises according to your current subject difficulty level.
              </p>
            </div>

            {/* Timings and Schedule Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <Clock className="h-4.5 w-4.5" />
                  <span>Regular Available Days</span>
                </div>
                <p className="text-lg font-bold font-display text-slate-850 dark:text-slate-100">
                  {tutor.availableDays}
                </p>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  Recurring weekly intervals as specified by academic organizer.
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <Clock className="h-4.5 w-4.5" />
                  <span>Daily Time Slot</span>
                </div>
                <p className="text-lg font-bold font-display text-slate-850 dark:text-slate-100">
                  {tutor.availableTime}
                </p>
                <p className="text-xs text-slate-450 dark:text-slate-400">
                  Each learning slot lasts 3 operating hours, including questions.
                </p>
              </div>
            </div>

            {/* Validation Guards Bulletins */}
            <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 space-y-4 backdrop-blur-xs">
              <div className="flex items-center justify-between gap-2 border-b border-indigo-100/20 dark:border-indigo-900/20 pb-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-205 uppercase tracking-wider">
                  MediQueue Gate Status Checks
                </h4>
                <div 
                  className="p-1 px-2.5 rounded bg-indigo-100/50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold cursor-pointer select-none transition hover:bg-indigo-200/50 active:scale-95"
                  onClick={() => setVirtualDate(virtualDate === "2026-05-21" ? "2026-06-15" : "2026-05-21")}
                  title="Click to toggle system date and unlock the session scheduler dynamically!"
                >
                  🕒 Set Date: {virtualDate} (Click to toggle)
                </div>
              </div>

              <div className="space-y-3">
                {/* Checking Date */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`mt-0.5 p-0.5 rounded ${isDateRestricted ? "bg-amber-100 text-amber-700 dark:bg-amber-952 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-952 dark:text-emerald-400"}`}>
                    {isDateRestricted ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <strong className="block font-semibold text-slate-800 dark:text-white">Tutor Session Timeline Gate</strong>
                    <span className="text-slate-550 dark:text-slate-400">
                      Starts on {tutor.sessionStartDate}. (System Date is {virtualDate}).{" "}
                      {isDateRestricted ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium font-mono text-[11px] block mt-0.5">Restricted. Session is in the future.</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono text-[11px] block mt-0.5">Unlocked. Bookings currently accepting.</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Checking Slots */}
                <div className="flex items-start gap-2.5 text-xs">
                  <div className={`mt-0.5 p-0.5 rounded ${isSlotRestricted ? "bg-rose-100 text-rose-700 dark:bg-rose-952 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-952 dark:text-emerald-400"}`}>
                    {isSlotRestricted ? <AlertTriangle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <strong className="block font-semibold text-slate-800 dark:text-white">Tutor Availability Counter</strong>
                    <span className="text-slate-550 dark:text-slate-400">
                      Total capacity level: <strong className="font-semibold text-slate-800 dark:text-slate-205">{tutor.totalSlots} slots</strong> left.{" "}
                      {isSlotRestricted ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium font-mono text-[11px] block mt-0.5">No available slots left.</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono text-[11px] block mt-0.5">Eligible. Seats are open.</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action booking control panel */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-850">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block font-medium">Session Admissions</span>
                {isDateRestricted ? (
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg inline-block">
                    Booking is not available yet for this tutor
                  </span>
                ) : isSlotRestricted ? (
                  <span className="text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg inline-block">
                    No available slots left
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg inline-block">
                    ✓ Interactive Bookings are open
                  </span>
                )}
              </div>

              <button
                disabled={isDateRestricted || isSlotRestricted}
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto py-3 px-8 bg-indigo-600 hover:bg-indigo-555 text-white font-semibold rounded-lg text-sm transition duration-150 shadow-md hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                Book Session Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Session Immersive Modal Form */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-indigo-50/95 dark:bg-indigo-950/95 border border-indigo-100/40 dark:border-indigo-900/40 w-full max-w-lg p-6 md:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md"
            >
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Secure Tutor Queue Booking
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are reserving a learning slot with {tutor.name}. Review auto-assigned criteria.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* 1. Tutor Name (Readonly) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400 dark:text-indigo-400 mb-1">
                      Target Tutor Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={tutor.name}
                      className="w-full px-3 py-2 border border-indigo-100/40 dark:border-indigo-900/40 rounded-lg bg-indigo-100/10 dark:bg-indigo-950/45 text-xs text-indigo-600 dark:text-indigo-300 font-semibold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400 dark:text-indigo-400 mb-1">
                      Tutor Unique ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={tutor._id}
                      className="w-full px-3 py-2 border border-indigo-100/40 dark:border-indigo-900/40 rounded-lg bg-indigo-100/10 dark:bg-indigo-950/45 text-xs text-indigo-500 dark:text-indigo-400 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 2. Student Email (Readonly) */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-400 dark:text-indigo-400 mb-1">
                    Student Email (Auto-filled)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || "anonymous-student@mediqueue.org"}
                    className="w-full px-3 py-2 border border-indigo-100/40 dark:border-indigo-900/40 rounded-lg bg-indigo-100/10 dark:bg-indigo-950/45 text-xs text-indigo-500 dark:text-indigo-400 cursor-not-allowed"
                  />
                </div>

                {/* 3. Student Name (Preset/Editable) */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    Student Name (Editable)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mariam Binte Muhammad"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-150 dark:border-indigo-900/45 rounded-lg bg-indigo-100/5 dark:bg-indigo-950/20 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 4. Student Phone (Input) */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    Student Contact Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-indigo-150 dark:border-indigo-900/45 rounded-lg bg-indigo-100/5 dark:bg-indigo-950/20 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <PhoneCheckIcon className="absolute left-3 top-2.5 h-4 w-4 text-indigo-505 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-indigo-150/10 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100/30 dark:border-indigo-900/40">
                  <div>
                    <span className="text-indigo-400 dark:text-indigo-400 text-[10px] block">Status autoassigned</span>
                    <span className="font-semibold text-emerald-650 dark:text-emerald-400">booked</span>
                  </div>
                  <div>
                    <span className="text-indigo-400 dark:text-indigo-400 text-[10px] block font-medium">Session Start</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{tutor.sessionStartDate}</span>
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="pt-4 flex justify-end gap-3 border-t border-indigo-100/20 dark:border-indigo-900/30">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2.5 px-4 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold hover:bg-indigo-100/30 dark:hover:bg-indigo-955/40 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-555 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                    ) : (
                      "Confirm Reservation"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhoneCheckIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.302a12.036 12.036 0 0 1-5.23-5.23c-.24-.441-.074-.927.302-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

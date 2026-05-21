import React, { useState } from "react";
import { useToast } from "./Toast";
import { GraduationCap, ArrowRight, BookOpen, Clock, Globe, Calendar, DollarSign, Landmark, PlusCircle } from "lucide-react";

const SUBJECTS_DROPDOWN = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Other"
];

const TEACHING_MODES = ["Online", "Offline", "Both"];

export default function AddTutor({ token, setRoute }) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [availableDays, setAvailableDays] = useState("Mon - Wed");
  const [availableTime, setAvailableTime] = useState("4:00 PM - 7:00 PM");
  const [hourlyFee, setHourlyFee] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [sessionStartDate, setSessionStartDate] = useState("");
  const [institution, setInstitution] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [teachingMode, setTeachingMode] = useState("Online");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !subject || !availableDays || !availableTime || !hourlyFee || !totalSlots || !sessionStartDate) {
      toast.error("Please fill in all required scheduler fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          photoUrl: photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
          subject,
          availableDays,
          availableTime,
          hourlyFee: Number(hourlyFee),
          totalSlots: Number(totalSlots),
          sessionStartDate,
          institution: institution || "Verified Independent Tutor",
          experience: experience || "3 Years Experience",
          location: location || "Remote",
          teachingMode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register tutor details");
      }

      toast.success("Tutor registration saved and published successfully!");
      setRoute("my-tutors"); // Redirect directly to user's registered list
    } catch (err) {
      toast.error(err.message || "Submitting tutor profile failed. Please review values.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
          Admin Portal Gate
        </span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
          Publish Tutor Listing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Create an active booking slot and catalog listing. Students can immediately begin queue reservations once published.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 p-6 md:p-8 rounded-2xl shadow-xs space-y-6 backdrop-blur-xs">
        {/* Row 1: Name and Profile Picture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Tutor Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Michael Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Portrait Photo URL (Imgbb/Postimage)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/your-image.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400">Leave blank to assign our beautiful high-fidelity profile avatar.</p>
          </div>
        </div>

        {/* Row 2: Subject Dropdown and Teaching Mode Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Subject Category *
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
            >
              {SUBJECTS_DROPDOWN.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Teaching Mode *
            </label>
            <select
              value={teachingMode}
              onChange={(e) => setTeachingMode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
            >
              {TEACHING_MODES.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Timings Available Days / Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Available Days (Intervals) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sun - Thu"
              value={availableDays}
              onChange={(e) => setAvailableDays(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Available Operating Hours *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5:00 PM - 8:00 PM"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 4: Pricing Hourly Fee & Capacity Slot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Hourly Tuition Fee (USD) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 45"
                value={hourlyFee}
                onChange={(e) => setHourlyFee(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <DollarSign className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Total Slots Available (Capacity Limit) *
            </label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 10"
              value={totalSlots}
              onChange={(e) => setTotalSlots(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 5: Start Date Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Session Start Date Checkpoint *
            </label>
            <input
              type="date"
              required
              value={sessionStartDate}
              onChange={(e) => setSessionStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              City Location Area (Area / Country)
            </label>
            <input
              type="text"
              placeholder="e.g. Boston, Massachusetts"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 6: Institution and Experience credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Institution Credential
            </label>
            <input
              type="text"
              placeholder="e.g. Columbia University"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Total Professional Experience
            </label>
            <input
              type="text"
              placeholder="e.g. 5 Years Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-205 dark:border-slate-800 rounded-lg text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 py-3 px-8 bg-indigo-600 hover:bg-indigo-555 text-white font-semibold rounded-lg text-sm shadow-md transition duration-150 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Publish Tutor Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Tutor, User } from "../types";
import { useToast } from "./Toast";
import { Trash2, Edit, AlertCircle, Sparkles, AlertTriangle, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

export default function MyTutors({ currentUser, token, setRoute }) {
  const toast = useToast();
  const [myTutors, setMyTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Editing Modal
  const [editingTutor, setEditingTutor] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDays, setEditDays] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editSlots, setEditSlots] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editMode, setEditMode] = useState("");

  // States for Delete Confirmation Modal
  const [deletingTutorId, setDeletingTutorId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMyTutors();
  }, [currentUser]);

  const fetchMyTutors = () => {
    if (!currentUser) return;
    setIsLoading(true);
    // Fetch all tutors, then filter by current student Email
    fetch("/api/tutors")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch tutors catalog");
        return res.json();
      })
      .then((data) => {
        const userTutors = data.filter((t) => t.createdByUserEmail === currentUser.email);
        setMyTutors(userTutors);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("My tutors load error:", err);
        setIsLoading(false);
      });
  };

  // Open Edit Modal Form with preset states
  const handleOpenEdit = (tutor) => {
    setEditingTutor(tutor);
    setEditName(tutor.name);
    setEditPhotoUrl(tutor.photoUrl);
    setEditSubject(tutor.subject);
    setEditDays(tutor.availableDays);
    setEditTime(tutor.availableTime);
    setEditFee(tutor.hourlyFee.toString());
    setEditSlots(tutor.totalSlots.toString());
    setEditStartDate(tutor.sessionStartDate);
    setEditInstitution(tutor.institution);
    setEditExperience(tutor.experience);
    setEditLocation(tutor.location);
    setEditMode(tutor.teachingMode);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editingTutor) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/tutors/${editingTutor._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          photoUrl: editPhotoUrl,
          subject: editSubject,
          availableDays: editDays,
          availableTime: editTime,
          hourlyFee: Number(editFee),
          totalSlots: Number(editSlots),
          sessionStartDate: editStartDate,
          institution: editInstitution,
          experience: editExperience,
          location: editLocation,
          teachingMode: editMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update tutor details");
      }

      toast.success("Tutor values updated successfully!");
      setEditingTutor(null);

      // Instantly map edits onto on-screen state to satisfy zero reload rule!
      setMyTutors((prev) =>
        prev.map((item) => (item._id === editingTutor._id ? { ...item, ...data.tutor } : item))
      );
    } catch (err) {
      toast.error(err.message || "Update process failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTutorId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/tutors/${deletingTutorId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete tutor");
      }

      toast.success("Tutor profile has been securely deleted.");
      setDeletingTutorId(null);

      // Update screen state immediately
      setMyTutors((prev) => prev.filter((item) => item._id !== deletingTutorId));
    } catch (err) {
      toast.error(err.message || "Failed to complete deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            My Registered Tutor Slots
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review and adjust availability checkpoints for all listings published under your profile session.
          </p>
        </div>
        <button
          onClick={() => setRoute("add-tutor")}
          className="py-2 px-4 bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold rounded-lg text-xs shadow-md transition cursor-pointer"
        >
          Publish New Tutor
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : myTutors.length === 0 ? (
        /* Empty State */
        <div className="p-8 md:p-12 text-center bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl space-y-4">
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-bold text-slate-800 dark:text-white font-display text-base">No Published Tutor Listings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You haven't listed any private or institutional tutors in the system yet. Once created, they appear in this operational panel.
            </p>
          </div>
          <button
            onClick={() => setRoute("add-tutor")}
            className="py-2 px-6 bg-indigo-650 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-505 cursor-pointer transition shadow-xs"
          >
            List Your First Tutor
          </button>
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 shadow-xs overflow-hidden backdrop-blur-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-100/30 dark:bg-indigo-950/55 text-slate-500 dark:text-slate-400 border-b border-indigo-100/20 dark:border-indigo-900/30 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Tutor Name</th>
                  <th className="py-4 px-6">Subject Area</th>
                  <th className="py-4 px-6">Hourly rate</th>
                  <th className="py-4 px-6">Capacity slots</th>
                  <th className="py-4 px-6">Dates Gate</th>
                  <th className="py-4 px-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/20 dark:divide-indigo-900/20 text-slate-705 dark:text-slate-300">
                {myTutors.map((tutor) => (
                  <tr key={tutor._id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition">
                    <td className="py-4 px-6 font-medium flex items-center gap-3">
                      <img
                        src={tutor.photoUrl}
                        alt={tutor.name}
                        className="h-9 w-9 rounded-full object-cover border border-slate-205 dark:border-slate-750"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{tutor.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{tutor.institution}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
                        {tutor.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold font-mono text-slate-900 dark:text-white">
                      ${tutor.hourlyFee}/hr
                    </td>
                    <td className="py-4 px-6">
                      {tutor.totalSlots > 0 ? (
                        <span className="text-emerald-600 font-bold font-mono">{tutor.totalSlots} slots free</span>
                      ) : (
                        <span className="text-rose-550 dark:text-rose-450 font-bold">Fully Booked</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 dark:text-slate-400">
                      {tutor.sessionStartDate}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(tutor)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Edit properties"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTutorId(tutor._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Delete tutor entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editing Modal Dialog */}
      <AnimatePresence>
        {editingTutor && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTutor(null)}
              className="absolute inset-0 bg-slate-950"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-indigo-50/95 dark:bg-indigo-950/95 border border-indigo-100/40 dark:border-indigo-900/40 w-full max-w-2xl p-6 md:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md"
            >
              <div className="border-b border-slate-101 dark:border-slate-850 pb-4 mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Update Tutor Properties
                </h3>
                <p className="text-xs text-slate-505">
                  Adjust active slots, schedules, and hourly fee. All changes will commit straight to MongoDB.
                </p>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Tutor Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Photo URL</label>
                    <input
                      type="url"
                      required
                      value={editPhotoUrl}
                      onChange={(e) => setEditPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Subject</label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                    >
                      {SUBJECTS_DROPDOWN.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Teaching Mode</label>
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                    >
                      {TEACHING_MODES.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Available Days</label>
                    <input
                      type="text"
                      required
                      value={editDays}
                      onChange={(e) => setEditDays(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Available Time Slot</label>
                    <input
                      type="text"
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Hourly Fee ($)</label>
                    <input
                      type="number"
                      required
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Total Slot Capacity</label>
                    <input
                      type="number"
                      required
                      value={editSlots}
                      onChange={(e) => setEditSlots(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Session Start Date</label>
                    <input
                      type="date"
                      required
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Institution</label>
                    <input
                      type="text"
                      value={editInstitution}
                      onChange={(e) => setEditInstitution(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Experience</label>
                    <input
                      type="text"
                      value={editExperience}
                      onChange={(e) => setEditExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Location Area</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 bg-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setEditingTutor(null)}
                    className="py-2.5 px-4 border border-slate-205 dark:border-slate-800 text-slate-705 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-505 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    {isUpdating ? "Saving..." : "Save Updates"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTutorId && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingTutorId(null)}
              className="absolute inset-0 bg-slate-950"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-indigo-50/95 dark:bg-indigo-950/95 border border-indigo-100/40 dark:border-indigo-900/40 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center space-y-4 backdrop-blur-md"
            >
              <div className="h-12 w-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">
                  Confirm Profile Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal px-4">
                  Are you absolutely sure you want to remove this tutor listing? This will permanently delete records from the catalog database.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingTutorId(null)}
                  className="py-2 px-4 border border-slate-205 dark:border-slate-800 text-slate-705 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="py-2 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

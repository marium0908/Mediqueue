import { useState, useEffect } from "react";
import { Tutor } from "../types";
import { Search, Calendar, RefreshCw, AlertCircle, Sparkles, BookOpen } from "lucide-react";

export default function Tutors({ onSelectTutor }) {
  const [tutors, setTutors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTutors = () => {
    setIsLoading(true);
    let url = "/api/tutors";
    const params = [];
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch filtered tutors");
        return res.json();
      })
      .then((data) => {
        setTutors(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Filter tutors error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Initial and queried fetch
    const debounceTimer = setTimeout(() => {
      fetchTutors();
    }, 300); // 300ms debounce on keystroke query
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search and Filters Segment */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/40 p-6 shadow-xs space-y-4 backdrop-blur-xs">
        <div className="border-b border-indigo-100/20 dark:border-indigo-900/30 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-500" />
            <span>Search & Filter Directory</span>
          </h2>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Clear Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">
              Tutor Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search case-insensitive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Date Picker - Start */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">
              Available From Date ($gte)
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker - End */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">
              Available Thru Date ($lte)
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-205 dark:border-slate-800 rounded-lg bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid display code */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <span className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></span>
          </div>
        ) : tutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-2xl text-center space-y-4 backdrop-blur-xs">
            <div className="h-12 w-12 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-bold text-slate-800 dark:text-white font-display text-base">No Matching Tutors Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Our database does not have any registers matching your exact name search parameter or calendar date filters.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="py-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 cursor-pointer transition shadow-xs"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group h-full backdrop-blur-xs"
              >
                <div>
                  {/* Photo area with category label overlay */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={tutor.photoUrl}
                      alt={tutor.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                      {tutor.subject}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide bg-indigo-600/90 text-white backdrop-blur-xs">
                      Start: {tutor.sessionStartDate}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {tutor.institution}
                    </span>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-snug">
                      {tutor.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                       A certified learning partner with {tutor.experience} experience. Providing teaching modes via {tutor.teachingMode}.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-350 bg-indigo-100/10 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100/20 dark:border-indigo-900/30">
                      <div>
                        <span className="block text-slate-400 uppercase font-mono text-[8px]">Weekly Days</span>
                        <strong className="font-semibold">{tutor.availableDays}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 uppercase font-mono text-[8px]">Time Slot</span>
                        <strong className="font-semibold">{tutor.availableTime}</strong>
                      </div>
                      <div className="mt-1">
                        <span className="block text-slate-400 uppercase font-mono text-[8px]">Location</span>
                        <strong className="font-semibold">{tutor.location}</strong>
                      </div>
                      <div className="mt-1">
                        <span className="block text-slate-400 uppercase font-mono text-[8px]">Instruct Mode</span>
                        <strong className="font-semibold">{tutor.teachingMode}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="border-t border-indigo-100/20 dark:border-indigo-900/30 my-3" />
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <span className="text-[8px] font-mono uppercase text-slate-400 block">Tuition Rate</span>
                      <strong className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-display">
                        ${tutor.hourlyFee}
                      </strong>
                      <span className="text-[9px] text-slate-400">/hr</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] font-mono uppercase text-slate-400 block mb-1">Status Slots</span>
                      {tutor.totalSlots > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[9px] font-semibold px-2 py-0.5 rounded">
                          {tutor.totalSlots} Slots Free
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400 text-[9px] font-semibold px-2 py-0.5 rounded">
                          Fully Reserved
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTutor(tutor._id)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Book Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

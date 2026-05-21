import { useState, useEffect } from "react";
import { Tutor } from "../types";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Globe, ArrowRight, Award, GraduationCap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CAROUSEL_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    title: "Empower Your Learning with Academic Experts",
    subtitle: "Instantly schedule individual interactive slots with verified university mentors and professors across 15+ complex science and humanities fields.",
    cta: "Explore Tutors Profile"
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    title: "1-on-1 Personalized Session Queue Protection",
    subtitle: "Eliminate booking conflicts with our automated digital session token mechanism. Clear Available Slot countdowns ensure 100% reservation confidence.",
    cta: "Browse Subjects"
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200",
    title: "Flexible Formats to Match Your Lifestyle",
    subtitle: "Navigate through native Online classrooms, local Offline learning cafes, or Hybrid learning models. Control schedules entirely at your fingertips.",
    cta: "Get Private Help"
  }
];

export default function Home({ onSelectTutor, setRoute }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-play sliding
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch exactly 6 featured tutors
  useEffect(() => {
    fetch("/api/tutors?limit=6")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load featured list");
        return res.json();
      })
      .then((data) => {
        setFeaturedTutors(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Home tutors fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const slidePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const slideNext = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Banner Slider */}
      <div className="relative h-[480px] w-full bg-slate-900 rounded-2xl overflow-hidden group shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${CAROUSEL_SLIDES[currentSlide].image})` }}
          />
        </AnimatePresence>

        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-semibold"
          >
            Smarter Tutor Reservations — Slide {currentSlide + 1} of 3
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold font-display text-white leading-tight"
          >
            {CAROUSEL_SLIDES[currentSlide].title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-sm md:text-base leading-relaxed"
          >
            {CAROUSEL_SLIDES[currentSlide].subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <button
              onClick={() => setRoute("tutors")}
              className="inline-flex items-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{CAROUSEL_SLIDES[currentSlide].cta}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Manual Slides Arrows */}
        <button
          onClick={slidePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/10 dark:bg-slate-900/40 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={slideNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/10 dark:bg-slate-900/40 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Visual Pill Indicator Dot */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${currentSlide === i ? "w-6 bg-indigo-505" : "w-2 bg-white/40"}`}
              style={{ backgroundColor: currentSlide === i ? "#6366f1" : undefined }}
            />
          ))}
        </div>
      </div>

      {/* 2. Available Tutors Section (Exactly 6 limit) */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Featured Scientific & Literacy Tutors
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top-rated verified facilitators currently accepting reservation entries. Fully compliant with active date bounds.
            </p>
          </div>
          <button
            onClick={() => setRoute("tutors")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 border-b border-indigo-100 hover:border-indigo-500 pb-0.5"
          >
            <span>View All Tutors Directory</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></span>
          </div>
        ) : featuredTutors.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No tutors are stored in the system database yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTutors.map((tutor) => (
              <div
                key={tutor._id}
                className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/40 dark:border-indigo-900/40 rounded-xl overflow-hidden shadow-xs flex flex-col backdrop-blur-xs"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    referrerPolicy="no-referrer"
                    src={tutor.photoUrl}
                    alt={tutor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                    {tutor.subject}
                  </span>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {tutor.institution}
                    </span>
                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-1">
                      {tutor.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-350">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Schedules: <strong className="font-semibold">{tutor.availableDays}</strong> | {tutor.availableTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        <span>Mode: <strong className="font-semibold">{tutor.teachingMode}</strong> | Location: {tutor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-indigo-100/20 dark:border-indigo-900/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Session Fee</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-display">
                        ${tutor.hourlyFee} <span className="text-xs font-normal text-slate-400">/ hr</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                        Slots Status
                      </span>
                      {tutor.totalSlots > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {tutor.totalSlots} Slots Free
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                          Fully Reserved
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTutor(tutor._id)}
                    className="mt-4 w-full py-2.5 px-4 bg-slate-905 hover:bg-slate-805 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 border-indigo-100 hover:border-indigo-300 dark:text-white rounded-lg text-xs font-semibold cursor-pointer border hover:shadow-xs transition transition-all text-center"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Extra Section A: Impact Benchmark */}
      <div className="bg-indigo-100/10 dark:bg-indigo-950/10 border border-indigo-100/35 dark:border-indigo-900/40 rounded-2xl p-8 md:p-12 backdrop-blur-xs">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            Platform Metrics
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Transforming Academic Scheduling
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            By eliminating conflicts, maintaining active date-restriction checkpoints, and offering direct booking tracking, we provide a clean workflow for both mentors and students.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl text-center space-y-1 shadow-xs border border-indigo-100/30 dark:border-indigo-900/40 backdrop-blur-xs">
            <p className="text-3xl font-bold font-display text-indigo-600 dark:text-indigo-400">15,400+</p>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Session Hours Managed</p>
          </div>
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl text-center space-y-1 shadow-xs border border-indigo-100/30 dark:border-indigo-900/40 backdrop-blur-xs">
            <p className="text-3xl font-bold font-display text-indigo-600 dark:text-indigo-400">99.2%</p>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Student Satisfaction</p>
          </div>
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl text-center space-y-1 shadow-xs border border-indigo-100/30 dark:border-indigo-900/40 backdrop-blur-xs">
            <p className="text-3xl font-bold font-display text-indigo-600 dark:text-indigo-400">450+</p>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Certified University Mentors</p>
          </div>
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl text-center space-y-1 shadow-xs border border-indigo-100/30 dark:border-indigo-900/40 backdrop-blur-xs">
            <p className="text-3xl font-bold font-display text-indigo-600 dark:text-indigo-400">15+</p>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Complex Science Spheres</p>
          </div>
        </div>
      </div>

      {/* 4. Extra Section B: Our Academic Pillars & Operational Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
            How MediQueue Works
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Engineered for Precision Scheduling
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Unlike standard calendars, MediQueue features hard safeguards built directly into our data structures:
          </p>
          <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-350 font-medium">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-505" />
              Slot Decrement Guarantee during high concurrence
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-505" />
              Session date timeline gates dynamically monitored
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-505" />
              Active state controls back-referenced dynamically
            </li>
          </ul>
        </div>

        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 space-y-3 backdrop-blur-xs">
          <div className="p-2 w-fit bg-indigo-100/50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            High Quality Vetting
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed">
            Each added tutor profile must submit verified institution certificates, current experience level proof, and area of expertise declarations prior to taking live students.
          </p>
        </div>

        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 space-y-3 backdrop-blur-xs">
          <div className="p-2 w-fit bg-indigo-100/50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
            Anti-Overbooking System
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-405 leading-relaxed">
            A state-monitored slot checkout manager monitors availability. When slots diminish to zero, booking controls automatically lock out requests to protect the tutor schedule.
          </p>
        </div>
      </div>
    </div>
  );
}

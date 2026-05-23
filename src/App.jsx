import { useState, useEffect, useRef } from "react";
import { ToastProvider, useToast } from "./components/Toast";
import { Tutor, User } from "./types";
import Home from "./components/Home";
import Tutors from "./components/Tutors";
import TutorDetails from "./components/TutorDetails";
import AddTutor from "./components/AddTutor";
import MyTutors from "./components/MyTutors";
import MyBookedSessions from "./components/MyBookedSessions";
import Auth from "./components/Auth";
import NotFound from "./components/NotFound";
import { GraduationCap, Sun, Moon, LogIn, UserPlus, ChevronDown, LogOut, Menu, X, BookOpen, Clock, Heart, Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function RootAppContent() {
  const toast = useToast();

  const [dbStatus, setDbStatus] = useState({ status: "checking" });

  useEffect(() => {
    fetch("/api/db-status")
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch((err) => setDbStatus({ status: "error", error: err.message }));
  }, []);

  // 1. Theme Configuration Toggling
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    toast.info(`Theme toggled to ${theme === "light" ? "dark" : "light"} mode`);
  };

  // 2. Authentication states holding JWT token & user credentials
  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem("medi_token");
      return saved && saved !== "undefined" ? saved : null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("medi_user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleAuthSuccess = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem("medi_token", newToken);
    localStorage.setItem("medi_user", JSON.stringify(user));

    // Redirect to home or previously intended path parsed from hash
    const currentHash = window.location.hash;
    if (currentHash === "#/login" || currentHash === "#/register") {
      setRoute("home");
    } else {
      syncRouteFromHash();
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("medi_token");
    localStorage.removeItem("medi_user");
    setRoute("home");
    toast.success("Logged out successfully. Have a nice learning journey!");
  };

  // 3. Robust reload-safe Hash-based Router
  const [route, setRouteState] = useState("home");
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setRoute = (newRoute, tutorId = null) => {
    setRouteState(newRoute);
    setSelectedTutorId(tutorId);

    // Sync Hash
    if (newRoute === "home") {
      window.location.hash = "/";
    } else if (newRoute === "tutor-details" && tutorId) {
      window.location.hash = `/tutors/${tutorId}`;
    } else {
      window.location.hash = `/${newRoute}`;
    }

    setMobileMenuOpen(false);
  };

  // Synchronizers that parse hash to support refreshing securely without throwing errors
  const syncRouteFromHash = () => {
    const hash = window.location.hash;
    // Strip leading hash and optional slash cleanly: e.g. "#/login" or "#login" -> "login"
    const cleanHash = hash.replace(/^#[/]?/, "");

    if (!cleanHash || cleanHash === "/" || cleanHash === "") {
      setRouteState("home");
      setSelectedTutorId(null);
    } else if (cleanHash.startsWith("tutors/")) {
      const parts = cleanHash.split("/");
      const id = parts[1];
      if (id) {
        setRouteState("tutor-details");
        setSelectedTutorId(id);
      } else {
        setRouteState("tutors");
        setSelectedTutorId(null);
      }
    } else {
      const validPages = ["tutors", "add-tutor", "my-tutors", "bookings", "login", "register"];
      if (validPages.includes(cleanHash)) {
        setRouteState(cleanHash);
        setSelectedTutorId(null);
      } else {
        setRouteState("404");
        setSelectedTutorId(null);
      }
    }
  };

  useEffect(() => {
    syncRouteFromHash();
    window.addEventListener("hashchange", syncRouteFromHash);
    return () => window.removeEventListener("hashchange", syncRouteFromHash);
  }, []);

  // 4. Dynamic tab header title update based on the current active view
  useEffect(() => {
    let title = "MediQueue – Tutor Booking System";
    switch (route) {
      case "home":
        title = "MediQueue – Home";
        break;
      case "tutors":
        title = "Tutors Directory | MediQueue";
        break;
      case "tutor-details":
        title = "Tutor Profile Scheduling | MediQueue";
        break;
      case "add-tutor":
        title = "Publish New Tutor | MediQueue";
        break;
      case "my-tutors":
        title = "Manage My Tutors | MediQueue";
        break;
      case "bookings":
        title = "My Booked Sessions | MediQueue";
        break;
      case "login":
        title = "Student Access Portal | MediQueue";
        break;
      case "register":
        title = "Student Registration Portal | MediQueue";
        break;
      case "404":
        title = "Error Not Found | MediQueue";
        break;
    }
    document.title = title;
  }, [route]);

  // 5. Private Route Security Gate Safeguard
  const isPrivateRoute = ["add-tutor", "my-tutors", "bookings"].includes(route);
  useEffect(() => {
    if (isPrivateRoute && !token) {
      toast.info("Secure Area: Please log in using credentials or Google Auth to access tutoring systems.");
      setRouteState("login");
      window.location.hash = "/login";
    }
  }, [route, token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Dynamic Navbar */}
      <nav className="sticky top-0 z-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-150 dark:border-slate-800/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Block: Logo Brand label */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setRoute("home")}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl font-display group cursor-pointer"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl group-hover:scale-105 transition-all flex items-center justify-center">
                  <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M12 6C12 6 8 9.5 8 13C8 15.5 10 17 12 17C14 17 16 15.5 16 13C16 9.5 12 6 12 6Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6V17" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 10C13 11 14.5 11.5 15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 12.5C11 13.5 9.5 14 8.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span>MediQueue</span>
              </button>

              {/* Desktop links */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-505 dark:text-slate-350">
                <button
                  onClick={() => setRoute("home")}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${route === "home" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                >
                  Home
                </button>
                <button
                  onClick={() => setRoute("tutors")}
                  className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${route === "tutors" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                >
                  Tutors
                </button>

                {token && (
                  <>
                    <button
                      onClick={() => setRoute("add-tutor")}
                      className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${route === "add-tutor" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                    >
                      Add Tutor
                    </button>
                    <button
                      onClick={() => setRoute("my-tutors")}
                      className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${route === "my-tutors" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                    >
                      My Tutors
                    </button>
                    <button
                      onClick={() => setRoute("bookings")}
                      className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${route === "bookings" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/20" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                    >
                      My Booked Sessions
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Light Dark Mode button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-lg bg-slate-50 dark:bg-slate-850 hover:scale-[1.05] active:scale-[0.95] transition duration-150 cursor-pointer"
                aria-label="Theme mode selector"
              >
                {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>

              {token && currentUser ? (
                /* Authenticated User Status Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 rounded-xl transition duration-150 text-left cursor-pointer"
                  >
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-8.5 w-8.5 rounded-full object-cover border border-indigo-200 dark:border-indigo-900"
                    />
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-xl shadow-xl py-3 px-2 text-xs text-slate-505 dark:text-slate-400 space-y-1.5"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-850">
                          <span className="font-bold text-slate-800 dark:text-white block text-sm leading-tight">{currentUser.name}</span>
                          <span className="text-[10px] text-slate-450 block mt-0.5 truncate">{currentUser.email}</span>
                        </div>
                        <button
                          onClick={() => {
                            setRoute("bookings");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg font-medium cursor-pointer"
                        >
                          Booked Sessions Overview
                        </button>
                        <button
                          onClick={() => {
                            setRoute("my-tutors");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg font-medium cursor-pointer"
                        >
                          Managed Tutor Listings
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-lg font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span>Sign Out Journey</span>
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Dual Auth Entry Buttons - Always visible & optimized for all devices */
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRoute("login")}
                    className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50 text-[11px] sm:text-xs font-semibold rounded-lg transition duration-150"
                  >
                    <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => setRoute("register")}
                    className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition duration-150"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Icon toggler */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-2 uppercase tracking-wide font-semibold text-xs"
            >
              <button
                onClick={() => setRoute("home")}
                className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-705 dark:text-slate-350 cursor-pointer"
              >
                Home Link
              </button>
              <button
                onClick={() => setRoute("tutors")}
                className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-705 dark:text-slate-350 cursor-pointer"
              >
                Browse Tutors
              </button>

              {token ? (
                <>
                  <button
                    onClick={() => setRoute("add-tutor")}
                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-705 dark:text-slate-350 cursor-pointer"
                  >
                    Add Tutor Entry
                  </button>
                  <button
                    onClick={() => setRoute("my-tutors")}
                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-705 dark:text-slate-350 cursor-pointer"
                  >
                    My Managed Tutors
                  </button>
                  <button
                    onClick={() => setRoute("bookings")}
                    className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-705 dark:text-slate-350 cursor-pointer"
                  >
                    My Booked Sessions
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <button
                    onClick={() => setRoute("login")}
                    className="w-full text-center p-2.5 bg-slate-50 dark:bg-slate-850 text-slate-705 dark:text-slate-350 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition duration-150"
                  >
                    <LogIn className="h-4 w-4 text-indigo-500" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => setRoute("register")}
                    className="w-full text-center p-2.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition duration-150"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Container Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {route === "home" && <Home onSelectTutor={(id) => setRoute("tutor-details", id)} setRoute={setRoute} />}
        {route === "tutors" && <Tutors onSelectTutor={(id) => setRoute("tutor-details", id)} />}
        {route === "tutor-details" && selectedTutorId && (
          <TutorDetails
            tutorId={selectedTutorId}
            currentUser={currentUser}
            token={token}
            onBack={() => setRoute("tutors")}
            setRoute={setRoute}
          />
        )}
        {route === "add-tutor" && <AddTutor token={token} setRoute={setRoute} />}
        {route === "my-tutors" && <MyTutors currentUser={currentUser} token={token} setRoute={setRoute} />}
        {route === "bookings" && <MyBookedSessions currentUser={currentUser} token={token} setRoute={setRoute} />}
        {route === "login" && (
          <Auth mode="login" onAuthSuccess={handleAuthSuccess} setRoute={setRoute} />
        )}
        {route === "register" && (
          <Auth mode="register" onAuthSuccess={handleAuthSuccess} setRoute={setRoute} />
        )}
        {route === "404" && <NotFound setRoute={setRoute} />}
      </main>

      {/* Structured Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-850 text-slate-505 dark:text-slate-400 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo brand and contacts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg font-display">
              <svg className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M12 6C12 6 8 9.5 8 13C8 15.5 10 17 12 17C14 17 16 15.5 16 13C16 9.5 12 6 12 6Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 6V17" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 10C13 11 14.5 11.5 15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 12.5C11 13.5 9.5 14 8.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>MediQueue Systems</span>
            </div>
            <p className="text-slate-505 dark:text-slate-400 leading-relaxed text-[11px]">
              Frictionless 1-on-1 tutoring directory scheduling. Eliminate resource scheduling conflicts during admissions with custom slot tokens.
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-450">
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-405" />
                <span>johndoe@gmail.com</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-405" />
                <span>+1 (800) MEDI-QUEUE</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-405" />
                <span>Silicon Oasis Campus, Block B</span>
              </p>
            </div>
          </div>

          {/* Core Services Links */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 font-mono">
              Learning Services
            </h4>
            <ul className="space-y-2.5 text-[11px] font-medium">
              <li>
                <button onClick={() => setRoute("tutors")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Calculus & Real Analysis
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("tutors")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Thermodynamics & Optics
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("tutors")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Organic Chemistry Labwork
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("tutors")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Advanced Algorithms Code
                </button>
              </li>
            </ul>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 font-mono">
              Academic Support
            </h4>
            <ul className="space-y-2.5 text-[11px] font-medium">
              <li>
                <button onClick={() => setRoute("tutors")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Search All Tutors
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("home")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Operational Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("bookings")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Check Admissions Status
                </button>
              </li>
              <li>
                <button onClick={() => setRoute("login")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left">
                  Simulated Student Access
                </button>
              </li>
            </ul>
          </div>

          {/* Social connections with branded X */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Social Channels
            </h4>
            <p className="text-[11px] leading-relaxed">
              Stay in the loop with syllabus changes, slots capacity alerts, and faculty recruitment releases.
            </p>
            <div className="flex gap-3">
              {/* Branded X Logo */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-850 dark:hover:bg-indigo-500 rounded-lg transition-colors"
                title="Connect on X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Github Logo */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-800 hover:text-white dark:bg-slate-850 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="GitHub Repo"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47722 2 2 6.47722 2 12C2 16.4178 4.86518 20.1662 8.83896 21.4882C9.33896 21.5802 9.52125 21.2721 9.52125 21.0069C9.52125 20.7699 9.51268 20.1408 9.50782 19.3061C6.7265 19.9099 6.13929 17.9691 6.13929 17.9691C5.68474 16.8149 5.02891 16.508 5.02891 16.508C4.12196 15.8885 5.0975 15.9011 5.0975 15.9011C6.10091 15.9717 6.62886 16.9324 6.62886 16.9324C7.51952 18.4593 8.96696 18.0183 9.53594 17.7635C9.62638 17.1182 9.88452 16.6778 10.1699 16.4285C7.94931 16.1764 5.61461 15.3149 5.61461 11.4789C5.61461 10.3868 6.00445 9.49339 6.6433 8.79427C6.54014 8.54145 6.19696 7.52264 6.74164 6.14373C6.74164 6.14373 7.58189 5.87445 9.49332 7.16923C10.2917 6.94723 11.1471 6.83618 12.0003 6.83204C12.8529 6.83618 13.7083 6.94723 14.5083 7.16923C16.4178 5.87445 17.2563 6.14373 17.2563 6.14373C17.8028 7.52264 17.4596 8.54145 17.3565 8.79427C17.9967 9.49339 18.3847 10.3868 18.3847 11.4789C18.3847 15.3252 16.0461 16.1732 13.8181 16.4204C14.177 16.7299 14.4965 17.3421 14.4965 18.2778C14.4965 19.6152 14.4842 20.6938 14.4842 21.015C14.4842 21.2828 14.6631 21.5902 15.1706 21.4882C19.1417 20.1633 22 16.4178 22 12C22 6.47722 17.5228 2 12 2Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-850 pt-6 mt-8 flex flex-col sm:flex-row justify-between text-slate-400 text-[10px]">
          <p>© 2026 MediQueue Systems. Designed for frictionless academic cohort matching. All rights reserved.</p>
          <p className="mt-1 sm:mt-0 font-semibold text-slate-450 uppercase">Student Admissions Gate LIVE</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <RootAppContent />
    </ToastProvider>
  );
}

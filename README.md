# MediQueue – Tutor Booking System

Welcome to **MediQueue**, a specialized tutor reservation and scheduling platform designed to connect ambitious student cohorts directly with certified university mentors and expert facilitators.

## 🚀 Live Site Link & Deployment Pathways
- **Preview / Production URL**: [https://ais-dev-vk3pyhwhdvgv7mtyw7gp5o-710385799111.asia-east1.run.app](https://ais-dev-vk3pyhwhdvgv7mtyw7gp5o-710385799111.asia-east1.run.app)
- **Shared Workspace URL**: [https://ais-pre-vk3pyhwhdvgv7mtyw7gp5o-710385799111.asia-east1.run.app](https://ais-pre-vk3pyhwhdvgv7mtyw7gp5o-710385799111.asia-east1.run.app)

---

## ✨ Primary Website Features & Architectural Landmarks

* **🔒 Secure Session Safeguards & JWT Sign-ins**  
  Fully managed web-tokens (JWT) authenticate and encrypt private student action pathways, dynamically stored in browser memory with support for password integrity checks and Google Social Login simulations.

* **🎯 Dynamic Counter and Zero-Reload Seat Reductions**  
  An interactive checkout system automatically decreases other slot capacities in real-time as soon as a student successfully confirms a booking, protecting schedules and preventing overbooking without requiring page refreshes.

* **📅 Session Timeline Gate Controls**  
  Hardcoded security checks automatically block session enrollments when the system's operational date precedes a tutor's designated session start, displaying friendly cautionary banners (e.g., *"Booking is not available yet for this tutor"*).

* **🔍 Case-Insensitive Regex Queries & Date Filtering**  
  Advanced directory search bars allow real-time regex filter capabilities inside the MongoDB Atlas backend, alongside twin timeline filters (using `$gte` and `$lte` bounds) to match tutor availability precisely.

* **🌗 Immersive Theme Toggling & Dynamic Titles**  
  Features an elegant dual-theme canvas system (Light Mode and Dark Slate Mode) embedded cleanly into the global nav, accompanied by dynamic tab updates that adapt the browser title instantaneously on page changes.

---

## 🛠️ Tech Stack & Key Libraries Used

- **Frontend**: React 19 (Vite), Tailwind CSS v4 layout controls, Lucide Icons, and Motion for animation transitions.
- **Backend**: custom Express.js server bundled to single standalone CommonJS via esbuild.
- **Database**: MongoDB Atlas client driver supporting secure lazy connections with beautiful in-memory fallbacks.
"# Mediqueue" 

# TNPA² (தமிழ் நாடு பெயிண்டர்கள் மற்றும் ஓவியர்கள் சங்கம்) - System Workflow & Architecture

This document outlines the complete architectural workflow, user journeys, video streaming pipeline, and module interactions of the **TNPA² (Tamil Nadu Painters & Artists Association)** platform.

---

## 1. Executive Summary & Application Purpose
TNPA² is a comprehensive full-stack platform built for painters, decorators, and artists across Tamil Nadu. It provides digital ID cards, skill academies, welfare schemes, digital services, and a dedicated 24/7 TV channel with live broadcasting and training masterclasses.

---

## 2. Core Functional Modules & Workflows

### A. Member Authentication & Profile Management
* **User Onboarding:** Painters and members can register or log in using phone number verification, email, or guest access with role selection (Member, Certified Applicator, Contractor, or Super Admin).
* **Digital ID Card Generation:** Automatically generates an official digital membership card with QR codes, unique registration IDs, district details, and active status badge.
* **Cloud Persistence:** Member data, subscriptions, and certificate records are synchronized in real-time with Firebase Firestore.

### B. Painter Skill Academy Workflow
* **Course Catalog:** Structured professional training modules covering Asian Paints, Nippon, Berger, Dulux, and JSW products and waterproofing techniques.
* **Interactive Learning & Quizzes:** Step-by-step video lessons accompanied by downloadable PDF study notes and certification quizzes.
* **In-App Inline Video Player:** 
  * Videos are embedded directly within the application viewport (no external browser redirects or new tab opening).
  * Supports both YouTube iframe embeds and high-definition HTML5 MP4 masterclass streams.
  * Clean, distraction-free widescreen layout with custom play/pause controls and responsive sizing.

### C. TNPA TV Channel & Live Broadcasting Workflow
* **24/7 Live Stream:** Dedicated streaming channel for association announcements, live painting demos, and expert talks.
* **Inline Streaming UI:** Designed with a clean, clutter-free viewport that focuses entirely on the live video stream without distracting side buttons or top link bars.
* **Super Admin Broadcast Controls:** Authorized super admins can update live HLS streams, RTMP ingest URLs, or push notifications and broadcast links to all registered members.

### D. Digital Services & Welfare Schemes
* **Government Schemes & Subsidies:** Direct application tracker for Tamil Nadu Construction Workers Welfare Board benefits, pension schemes, accident insurance, and tool allowances.
* **Business & Quotation Tools:** Built-in calculator and quotation generator for estimating wall painting, texture work, and material costs for clients.

---

## 3. Video Streaming & Playback Architecture

To ensure flawless user experience across mobile devices and desktop browsers:
1. **URL Sanitization & Type Detection:** The video component (`TnpaVideoPlayer.tsx`) inspects the source URL. If it contains `youtube.com` or `youtu.be`, it constructs a secure embedded iframe with `autoplay=1&controls=1&modestbranding=1&playsinline=1`.
2. **Fallback Stream Handling:** If custom streams or video files fail to load, the system gracefully falls back to optimized sample HD media streams (`g-video sample buckets`) to prevent black screens or connection errors.
3. **Layout Optimization:** All external share/copy buttons have been removed from the video player container to ensure a clean, cinematic viewing experience.

---

## 4. Security & Data Management
* **Role-Based Access Control (RBAC):** Restricts administrative actions (such as broadcasting TV links, modifying scheme catalogs, or verifying member records) strictly to authenticated Super Admin accounts.
* **Environment Configuration:** Securely manages backend API connections, Firebase credentials, and environment variables via `.env.example` and server-side route proxies.

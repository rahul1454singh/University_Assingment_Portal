# 🎓 University Assignment Portal — Full-Stack Academic Management Platform

<p align="center">
  <strong>A modern, role-based academic assignment management, cloud document submission, and real-time collaboration platform built with the MERN stack.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%206-blue?style=for-the-badge&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-darkgreen?style=for-the-badge&logo=mongodb" alt="MongoDB Atlas">
  <img src="https://img.shields.io/badge/Storage-Cloudinary%20CDN-blueviolet?style=for-the-badge&logo=cloudinary" alt="Cloudinary">
  <img src="https://img.shields.io/badge/Realtime-Socket.io-black?style=for-the-badge&logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/Mobile-Progressive%20Web%20App-orange?style=for-the-badge&logo=pwa" alt="PWA">
</p>

---

## 📖 1. What is University Assignment Portal?

**University Assignment Portal** is an enterprise-grade academic management web application engineered to solve the widespread logistical problems higher-education institutions face during assignment submission and grading cycles.

### The Real-World Problem It Solves
In traditional universities and colleges, students submit assignments across multiple fragmented channels: WhatsApp groups, personal faculty emails, USB thumb drives, and physical paper printouts. This creates severe logistical bottlenecks:
1. **Lost Submissions & Missing Receipts:** Emails get buried in spam or overlooked; students lack proof of on-time submission.
2. **Professor Overload:** Professors receive hundreds of large PDF attachments in their personal inboxes with no unified grading workflow.
3. **Delayed Feedback:** Students have no visibility into review progress and rarely receive structured remarks or corrections.
4. **Administrative Blindspots:** University administration cannot track departmental productivity, submission rates, or unresolved student grievances.

### The Architectural Solution
University Assignment Portal consolidates all academic workflows into three dedicated, role-protected portals:

1. **Administrator Portal:** Central command center for university faculties. Admins create departments with auto-generated 3-letter codes, provision student and professor accounts with Nepal (+977) phone support and automated welcome credential emails via Nodemailer, manage support tickets with dynamic notification badges, and monitor audit activity logs.
2. **Professor Portal:** Dedicated academic review desk. Professors review department-specific submissions, preview PDFs directly in the browser, grade submissions as **Approved** or **Rejected** with constructive remarks, and converse with advisees via real-time WebSocket chat.
3. **Student Portal:** Academic workstation where students view enrolled faculty, upload PDF assignments individually or via **Bulk Upload**, track live review statuses (`Draft`, `Submitted`, `Approved`, `Rejected`), raise support complaints, chat directly with professors, and install the portal on mobile as a **Progressive Web App (PWA)**.

---

## 🏗️ 2. System Architecture & Tech Stack

The portal implements a decoupled Client-Server architecture with dedicated cloud media streaming and WebSocket gateways:

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                         |
|  React 19 + Vite 6 + React Router 6                                                     |
|  - Student Portal: Submissions, Bulk Upload, Live Feedback, Real-Time Chat, Complaints  |
|  - Professor Portal: Submissions Review, PDF Viewer, Approve/Reject, Real-Time Chat     |
|  - Admin Portal: Department Manager, User Provisioning, Complaints Desk, Activity Logs |
|  - Progressive Web App: Service Worker Cache, Manifest.json, Install Prompt Banner      |
+-----------------------------------------------------------------------------------------+
                                     |
              +----------------------+----------------------+
              |  HTTP/REST (Cookies)                        |  WebSockets (Socket.io)
              v                                             v
+----------------------------------+          +-------------------------------------+
|        EXPRESS 5 BACKEND         | <------> |        SOCKET.IO REAL-TIME HUB      |
|  - JWT Cookie Authentication     |          |  - Conversation Room Multiplexing   |
|  - RBAC Middleware (Role Guards) |          |  - Instant Message Broadcasting     |
|  - Multer Cloud Storage Pipeline |          |  - Online Presence & Activity Sync  |
|  - Activity Logger & Nodemailer  |          +-------------------------------------+
+----------------------------------+
              |
              +----------------------+----------------------+
              |                                             |
              v                                             v
+----------------------------------+          +-------------------------------------+
|      MONGODB ATLAS DATABASE      |          |         CLOUDINARY MEDIA CDN        |
|  - UserData (Roles & Accounts)   |          |  - Secure PDF Assignment Vault      |
|  - Departments (Codes & Enrolls) |          |  - Global CDN Fast Delivery         |
|  - Assignments (Status & Remarks)|          |  - High Availability & Scalability  |
|  - Complaints & Direct Messages  |          +-------------------------------------+
+----------------------------------+
```

| Layer | Technology | Purpose in Project |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + Vite 6** | Ultra-fast client-side component rendering, reactive hooks, and rapid HMR development builds. |
| **Routing** | **React Router v6** | Declarative client-side routing with role-based route guard wrappers (Admin, Professor, Student). |
| **Styling & UI** | **Vanilla CSS3 + Lucide Icons** | Custom design system with CSS custom properties (variables), responsive flex/grid layouts, card elevations, and modern iconography. |
| **PWA Engine** | **Service Worker & Web Manifest** | Enables native web app install prompt on mobile/desktop, custom graduation cap icon, and offline asset caching. |
| **Backend Server** | **Node.js & Express 5** | RESTful API routing, asynchronous middleware pipeline, request parsing, and error-handling controllers. |
| **Database & ODM** | **MongoDB Atlas & Mongoose** | Document-oriented cloud database with schema validation, object ID referencing, and high-performance indexing. |
| **Authentication** | **JWT & Cookie-Parser** | Stateless JSON Web Tokens signed with server secrets and transmitted via tamper-proof, HttpOnly cookies. |
| **Password Hashing** | **BcryptJS** | Adaptive salted cryptographic hashing (10 rounds) of user passwords before persistence in MongoDB. |
| **Real-Time Engine** | **Socket.io** | Bi-directional event-driven WebSocket communication for direct professor-student messaging and live unread indicators. |
| **File Upload Pipeline** | **Multer & Cloudinary Storage** | Streams multipart/form-data assignment PDFs directly into Cloudinary without writing files to server disk. |
| **Cloud Media Storage** | **Cloudinary CDN** | High-availability cloud repository hosting student assignment PDFs with secure access URLs. |
| **Email Service** | **Nodemailer** | Sends automated account onboarding credentials directly to newly created students and professors. |

---

## 👥 3. Features by User Role

### 🛠️ Administrator Experience
* **Department Lifecycle Management:** Create university faculties with automated 3-letter uppercase code generation (e.g. `Computer Science and Engineering` $\rightarrow$ `CSE`), view enrolled student and professor counts, live search filter with instant letter matching, auto-scrolling container (>6 departments), and edit/delete actions with child reference protection.
* **User Provisioning:** Create student and faculty accounts with Full Name, Email, Phone Number with Nepal flag selector (`+977`), Account Role, Department binding, and customizable or auto-generated passwords.
* **Automated Welcome Credentials:** Sends account onboarding emails to new users with login instructions and temporary credentials via Nodemailer.
* **User Directory:** Comprehensive table of all registered users with role badges, search filters, department tags, account editing, and account deletion.
* **Support Complaints Desk:** Real-time ticket management desk displaying user complaints. Features a persistent red notification badge on the sidebar that reflects unread/pending complaints and automatically decrements when the admin marks complaints as `Read` or `Resolved`.
* **Audit Activity Logs:** Chronological audit log recording administrative actions, logins, submissions, and status changes with timestamps and IP records.

### 👨‍🏫 Professor Experience
* **Review Dashboard:** Real-time KPI summary tracking total department submissions, approved assignments, pending reviews, and rejected assignments.
* **Clean Personalized Identity:** Greeting and profile display formatted as `Dr. <Name>` without duplicate honorifics (e.g. avoiding `Prof. Dr.`), and avatar initials smartly skipping the title (e.g. `Dr. Indera Singh` yields avatar letter **I**).
* **Assignment Review Queue:** Filtered submission table showing student name, assignment title, category, date, and current review status.
* **In-Browser PDF Evaluation:** One-click preview opens assignment PDFs in a modal or new tab for convenient grading.
* **Grading & Feedback:** Action buttons to **Approve** or **Reject** assignments accompanied by detailed remarks and feedback.
* **Real-Time Direct Chat:** Dedicated messaging interface with enrolled student advisees powered by Socket.io rooms, with unified layout heights and clean contact dividers.
* **Profile & Security:** Manage personal profile, view department affiliations, and update account password.

### 🎓 Student Experience
* **Student Dashboard:** Overview of personal academic progress, submission counts, approval rates, and pending grades.
* **Single Assignment Submission:** Upload assignments with title, category, description, and PDF file attachment.
* **Bulk Assignment Upload:** Dedicated bulk submission tool enabling students to upload multiple assignment files in a single batch.
* **My Submissions Table:** Filterable table showing submission status (`Draft`, `Submitted`, `Approved`, `Rejected`), professor remarks, and centered action buttons (`Submitted`, `Details`, `Edit`, `Delete`).
* **Real-Time Chat with Professors:** Message departmental professors directly to ask questions, request clarifications, and receive academic guidance.
* **Help & Support Complaints:** Raise support tickets directly to the administration when experiencing department issues or technical difficulties.
* **PWA Mobile Experience:** Web application prompts students on mobile devices to install the portal directly to their home screen with a custom graduation cap icon and banner.
* **Forced Initial Password Rotation:** Enforces first-time login security by prompting users to change their auto-generated password immediately.

---

## 📁 4. Complete File-by-File Directory Breakdown

### Root Files
* [`package.json`](file:///package.json) &mdash; Root-level workspace manifest and development script runner.
* [`README.md`](file:///README.md) &mdash; Master technical documentation, system architecture guide, and complete Viva Q&A handbook.
* [`document.pdf`](file:///document.pdf) &mdash; Standalone downloadable vector PDF document summarizing the entire codebase and Viva questions (locally maintained and Git-ignored).
* [`.gitignore`](file:///D:/COLLEGE_FOLDER/Project/University_Assingment_Portal/.gitignore) &mdash; Rules specifying intentionally untracked files (`node_modules/`, `.env`, `dist/`, and `*.pdf`).

---

### Backend Directory (`backend/`)
* [`backend/server.js`](file:///backend/server.js) &mdash; Backend entrypoint. Configures Express 5 app, HTTP server, Socket.io WebSocket instance, CORS, cookie parser, DNS resolution fallbacks for Windows, and route mounts.
* [`backend/config/db.js`](file:///backend/config/db.js) &mdash; Establishes Mongoose connection to MongoDB Atlas with connection caching, retry logic, and URI sanitization.
* [`backend/config/cloudinary.js`](file:///backend/config/cloudinary.js) &mdash; Configures Cloudinary SDK with API keys, cloud name, and secret credentials.
* [`backend/middleware/authMiddleware.js`](file:///backend/middleware/authMiddleware.js) &mdash; Verifies incoming JWT from HttpOnly cookies, extracts user payload, and enforces role-based authorization (Admin, Professor, Student).
* [`backend/middleware/cloudinaryUpload.js`](file:///backend/middleware/cloudinaryUpload.js) &mdash; Multer storage engine connecting multipart file streams to Cloudinary PDF storage.
* [`backend/models/UserData.js`](file:///backend/models/UserData.js) &mdash; Mongoose schema for user accounts (name, email, password, role, department, phone, isFirstLogin).
* [`backend/models/Department.js`](file:///backend/models/Department.js) &mdash; Mongoose schema for university departments (name, code, description).
* [`backend/models/Assignment.js`](file:///backend/models/Assignment.js) &mdash; Mongoose schema for student assignment submissions (title, category, fileUrl, student, professor, department, status, remarks).
* [`backend/models/Complaint.js`](file:///backend/models/Complaint.js) &mdash; Mongoose schema for user support tickets (sender, email, message, status, isRead).
* [`backend/models/Message.js`](file:///backend/models/Message.js) &mdash; Mongoose schema for real-time chat messages between students and professors.
* [`backend/models/ActivityLog.js`](file:///backend/models/ActivityLog.js) &mdash; Mongoose schema for system audit trail logs (user, action, details, ipAddress).
* [`backend/routes/authRoutes.js`](file:///backend/routes/authRoutes.js) &mdash; Endpoints for login, logout, password change, and current user profile session verification.
* [`backend/routes/adminRoutes.js`](file:///backend/routes/adminRoutes.js) &mdash; Endpoints for admin dashboard stats, user management, and activity logs.
* [`backend/routes/departmentRoutes.js`](file:///backend/routes/departmentRoutes.js) &mdash; CRUD endpoints for university departments with auto-code generation and validation.
* [`backend/routes/professorRoutes.js`](file:///backend/routes/professorRoutes.js) &mdash; Endpoints for professor dashboard metrics, submissions review, and assignment approval/rejection.
* [`backend/routes/studentRoutes.js`](file:///backend/routes/studentRoutes.js) &mdash; Endpoints for student dashboard stats, assignment uploads, bulk uploads, and submission edits.
* [`backend/routes/complaintRoutes.js`](file:///backend/routes/complaintRoutes.js) &mdash; Endpoints for creating complaints, listing complaints, updating complaint status, and querying unread pending counts.
* [`backend/routes/messageRoutes.js`](file:///backend/routes/messageRoutes.js) &mdash; Endpoints for fetching conversation history and unread message indicators between users.
* [`backend/utils/emailService.js`](file:///backend/utils/emailService.js) &mdash; Nodemailer transport utility sending automated credentials to newly registered users.
* [`backend/utils/activityLogger.js`](file:///backend/utils/activityLogger.js) &mdash; Helper utility logging administrative and user actions directly to MongoDB.

---

### Frontend Directory (`frontend/`)
* [`frontend/index.html`](file:///frontend/index.html) &mdash; Single-Page Application HTML shell with viewport configuration, favicon, and PWA manifest links.
* [`frontend/vite.config.js`](file:///frontend/vite.config.js) &mdash; Vite bundler configuration with React plugin and proxy settings.
* [`frontend/public/manifest.json`](file:///frontend/public/manifest.json) &mdash; PWA Web App Manifest configuring app name, theme color (`#2563eb`), display mode (`standalone`), and app icons.
* [`frontend/public/sw.js`](file:///frontend/public/sw.js) &mdash; Service worker script providing asset caching and offline resilience for PWA installation.
* [`frontend/public/pwa-icon-*.svg`](file:///frontend/public/pwa-icon-192.svg) &mdash; Branded graduation cap app icons for progressive web app installation.
* [`frontend/src/main.jsx`](file:///frontend/src/main.jsx) &mdash; React application bootstrap file mounting the root DOM tree with service worker registration.
* [`frontend/src/App.jsx`](file:///frontend/src/App.jsx) &mdash; Central routing hub declaring all protected role-based routes, login, forgot password, and force change password screens.
* [`frontend/src/components/Navbar.jsx`](file:///frontend/src/components/Navbar.jsx) &mdash; Top navigation bar with centered brand title, role indicators, and profile avatars.
* [`frontend/src/components/Layout.jsx`](file:///frontend/src/components/Layout.jsx) &mdash; Global layout wrapper with collapsible sidebar, navigation links, and real-time complaint count synchronization.
* [`frontend/src/components/InstallPwaPrompt.jsx`](file:///frontend/src/components/InstallPwaPrompt.jsx) &mdash; Custom mobile installation banner prompting users to install the app on their phone.
* [`frontend/src/components/MessageContactDropdown.jsx`](file:///frontend/src/components/MessageContactDropdown.jsx) &mdash; Clean dropdown selector for messaging professors, avoiding duplicate `Prof. Dr.` prefixes.
* [`frontend/src/admin/AdminDashboard.jsx`](file:///frontend/src/admin/AdminDashboard.jsx) &mdash; Admin overview with statistical cards for departments, users, submissions, and complaints.
* [`frontend/src/admin/Departments.jsx`](file:///frontend/src/admin/Departments.jsx) &mdash; Department management table with real-time search, code badges, and member counts.
* [`frontend/src/admin/CreateDepartment.jsx`](file:///frontend/src/admin/CreateDepartment.jsx) &mdash; Department creation form with automatic 3-letter code generation and back button.
* [`frontend/src/admin/CreateUser.jsx`](file:///frontend/src/admin/CreateUser.jsx) &mdash; User onboarding form with Nepal phone selector, role dropdown, department scroll list, and search filter.
* [`frontend/src/admin/Complaints.jsx`](file:///frontend/src/admin/Complaints.jsx) &mdash; Support complaints desk with live status dropdown (Pending, Read, Resolved) and event dispatching.
* [`frontend/src/professor/ProfessorDashboard.jsx`](file:///frontend/src/professor/ProfessorDashboard.jsx) &mdash; Professor analytics dashboard with clean `Dr. <Name>` greeting and initial avatar.
* [`frontend/src/professor/ProfessorReviews.jsx`](file:///frontend/src/professor/ProfessorReviews.jsx) &mdash; Submission evaluation desk with in-browser PDF viewer, status badges, and feedback inputs.
* [`frontend/src/student/StudentAssignments.jsx`](file:///frontend/src/student/StudentAssignments.jsx) &mdash; Student submissions table with perfectly centered action buttons and status filters.
* [`frontend/src/student/StudentBulkUpload.jsx`](file:///frontend/src/student/StudentBulkUpload.jsx) &mdash; Batch submission interface allowing students to submit multiple PDF files at once.
* [`frontend/src/student/StudentMessages.jsx`](file:///frontend/src/student/StudentMessages.jsx) &mdash; Real-time chat client connected to Socket.io with synchronized header dividers and enrolled faculty list.
* [`frontend/src/utils/nameHelper.js`](file:///frontend/src/utils/nameHelper.js) &mdash; Clean naming utility: strips duplicate honorifics and extracts initials skipping `Dr.` prefixes.

---

## 🗄️ 5. Database Schema & Collections Overview

The MongoDB database is organized into 6 specialized collections managed through Mongoose:

1. **`UserData` Collection (`models/UserData.js`):**
   * `name` (String, required): Full name of the student, professor, or admin.
   * `email` (String, required, unique, indexed): Primary login identifier.
   * `password` (String, required): Bcrypt-hashed password string.
   * `role` (String, enum: `['admin', 'professor', 'student']`): Enforces RBAC permissions.
   * `department` (ObjectId ref 'Department'): Department affiliation.
   * `phone` (String): Contact phone number formatted with country dial code.
   * `isFirstLogin` (Boolean, default: true): Forces initial password rotation upon onboarding.
   * `timestamps`: Automatic `createdAt` and `updatedAt` tracking.

2. **`Department` Collection (`models/Department.js`):**
   * `name` (String, required, unique): Faculty title (e.g. `Computer Science and Engineering`).
   * `code` (String, required, unique, uppercase): Auto-generated 3-letter abbreviation (e.g. `CSE`).
   * `description` (String): Optional academic summary of the department.

3. **`Assignment` Collection (`models/Assignment.js`):**
   * `title` (String, required): Assignment topic or coursework title.
   * `category` (String, enum: `['Assignment', 'Project', 'Lab Report', 'Thesis']`): Coursework category.
   * `description` (String): Additional notes or submission context from student.
   * `fileUrl` (String, required): Direct Cloudinary CDN download and view URL.
   * `filePublicId` (String): Cloudinary asset ID for secure asset management.
   * `student` (ObjectId ref 'UserData', indexed): Foreign key to the submitting student.
   * `professor` (ObjectId ref 'UserData', indexed): Foreign key to the evaluating professor.
   * `department` (ObjectId ref 'Department'): Department under which coursework was assigned.
   * `status` (String, enum: `['Draft', 'Submitted', 'Approved', 'Rejected']`, default: `'Submitted'`): Lifecycle status.
   * `remarks` (String): Constructive grading feedback and comments from the professor.

4. **`Complaint` Collection (`models/Complaint.js`):**
   * `sender` (ObjectId ref 'UserData'): User who submitted the ticket.
   * `senderName` & `senderEmail` (String): Denormalized fields for high-speed admin querying.
   * `role` (String): Role of the submitter (Student or Professor).
   * `message` (String, required): Detailed problem statement or help request.
   * `status` (String, enum: `['Pending', 'Read', 'Resolved']`, default: `'Pending'`): Current resolution status.
   * `isRead` (Boolean, default: false): Read indicator flag for real-time notification counting.

5. **`Message` Collection (`models/Message.js`):**
   * `sender` (ObjectId ref 'UserData', required): Message author.
   * `receiver` (ObjectId ref 'UserData', required): Message recipient.
   * `message` (String, required): Plain text communication content.
   * `isRead` (Boolean, default: false): Delivery and read receipt indicator.

6. **`ActivityLog` Collection (`models/ActivityLog.js`):**
   * `user` (ObjectId ref 'UserData'): Identity of the actor performing the action.
   * `action` (String, required): Event description (e.g., `USER_CREATED`, `ASSIGNMENT_UPLOADED`, `COMPLAINT_RESOLVED`).
   * `details` (Object/Mixed): Granular event metadata and parameters.
   * `ipAddress` (String): Client IP address for security auditing.

---

## ⚙️ 6. How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database connection URI
* [Cloudinary](https://cloudinary.com/) account for PDF cloud storage

### Step 1: Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/assignment_portal
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm start
```

### Step 2: Configure Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser to experience the portal.

---

## 🎓 7. Comprehensive Technical Viva & Interview Preparation Guide

### Q1. Can you give a 2-minute elevator pitch of your project?
* **Simple Speaking Answer:** "University Assignment Portal is a web application designed to solve assignment chaos in colleges. Usually, students send assignments via WhatsApp or email, where professors lose track of files, have no proof of deadlines, and struggle to give timely feedback. My project replaces this with three dedicated portals: an Admin portal to create departments and accounts, a Student portal where students can submit PDF assignments individually or in bulk, and a Professor portal where teachers can preview PDFs directly in the browser and approve or reject them with remarks. The whole platform runs on React 19, Node.js, Express, MongoDB Atlas, Cloudinary for PDF storage, Socket.io for real-time messaging, and is installable as a mobile app through PWA."
* **Technical Depth:** The application follows a 3-tier MERN architecture. It uses JWT authentication stored in HttpOnly cookies to defend against XSS attacks, implements Role-Based Access Control (RBAC) via Express middleware, streams multi-part PDF uploads directly to Cloudinary via Multer, enables bi-directional real-time chat via Socket.io rooms, and utilizes Service Workers with a Web App Manifest for Progressive Web App capabilities.

### Q2. Why did you choose the MERN stack instead of traditional stacks like PHP/MySQL or Django/PostgreSQL?
* **Simple Speaking Answer:** "The MERN stack allows end-to-end JavaScript development across both the frontend and backend. React 19 provides a fast, reactive Single Page Application experience without page reloads, and Node.js handles concurrent I/O operations efficiently through its non-blocking event loop. MongoDB's JSON-like document model also matches our JavaScript data structures perfectly without complex relational impedance."
* **Technical Depth:** Node.js uses an event-driven, single-threaded event loop (libuv) that excels at handling high concurrency with low memory footprint, which is ideal for I/O heavy operations like streaming file uploads and WebSocket real-time connections. React's virtual DOM reconciliation and modular component hierarchy enable clean state management across complex interfaces like bulk file uploads and dynamic evaluation tables.

### Q3. How is user authentication implemented, and why are tokens stored in HttpOnly cookies instead of localStorage?
* **Simple Speaking Answer:** "When a user logs in, the backend verifies their email and bcrypt-hashed password. If valid, the server signs a JWT containing the user ID and role, and attaches it as an HttpOnly cookie in the HTTP response. We avoid `localStorage` because any malicious JavaScript script or Cross-Site Scripting (XSS) vulnerability can steal tokens from `localStorage`. An HttpOnly cookie cannot be read or stolen by JavaScript code in the browser, making the session significantly safer."
* **Technical Depth:** Storing JWTs in `localStorage` leaves the application vulnerable to token exfiltration via XSS attacks (e.g. `window.localStorage.getItem('token')`). By using `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, and `sameSite: 'strict'` (or `'none'` for cross-origin deployments), the browser automatically manages token transmission in the request headers while blocking client-side JavaScript access via `document.cookie`.

### Q4. How does Role-Based Access Control (RBAC) work in your backend?
* **Simple Speaking Answer:** "We use custom Express middleware called `authMiddleware` and `authorizeRoles`. When a request hits any protected endpoint, the middleware first checks the JWT from the cookie to verify identity. Then, the role guard checks if the user's role matches the allowed roles for that route. For example, if a student tries to call `/api/admin/create-user`, the server detects that the role is not 'admin' and immediately returns an HTTP 403 Forbidden error."
* **Technical Depth:** The middleware extracts the decoded token from `req.cookies.token`, verifies its cryptographic signature using `jwt.verify()` and `process.env.JWT_SECRET`, and binds the payload to `req.user`. Subsequent authorization middleware checks `allowedRoles.includes(req.user.role)`. If false, execution terminates with `res.status(403).json({ message: 'Access Denied: Insufficient Privileges' })`.

### Q5. How do assignment PDF uploads work, and why not store PDFs directly inside MongoDB?
* **Simple Speaking Answer:** "When a student submits an assignment, the browser sends the PDF file via `multipart/form-data` to our backend. The backend uses Multer with Cloudinary storage to stream the file directly to Cloudinary's cloud servers. Cloudinary returns a secure URL and asset ID, which we save in our MongoDB Assignment document. We do not store files inside MongoDB because MongoDB has a strict 16MB document size limit, and storing binary blobs directly in a database slows down backups, bloats database memory, and exhausts server RAM."
* **Technical Depth:** Cloudinary offloads bandwidth and storage from our application server to a specialized Content Delivery Network (CDN). The `multer-storage-cloudinary` engine pipes file streams directly to Cloudinary without writing temporary files to our Node.js server disk. MongoDB merely stores the lightweight metadata: `fileUrl` (String), `filePublicId` (String), and submission timestamps, keeping document size under 1KB and queries exceptionally fast.

### Q6. How does real-time chat between students and professors work?
* **Simple Speaking Answer:** "We use Socket.io. When a user opens the messages screen, the client establishes a persistent WebSocket connection to the server. When two users chat, the server creates a private room identified by their sorted user IDs. When a student types and sends a message, it is saved to MongoDB and instantly emitted across the WebSocket room to the professor's browser without requiring any page reload or polling."
* **Technical Depth:** Socket.io provides full-duplex communication over an upgraded HTTP connection. Private conversation channels are generated using a deterministic room identifier: `[userId1, userId2].sort().join('_')`. Upon the `send_message` event, the backend persists the message document in the `Message` collection and broadcasts the payload to the room with `io.to(roomId).emit('receive_message', newMessage)`, achieving sub-100ms latency.

### Q7. How does the admin complaints notification badge work in real time?
* **Simple Speaking Answer:** "The admin sidebar displays a red notification pill showing the count of complaints that are still 'Pending'. Previously, opening the page would clear the badge, but we improved it so that the badge remains visible as long as complaints are pending. When the admin selects a complaint and changes its status from 'Pending' to 'Read' or 'Resolved', the backend updates the record, and the frontend triggers a global event that decrements the red badge number in real time."
* **Technical Depth:** The backend route `GET /api/admin/complaints/unread-count` executes `Complaint.countDocuments({ status: 'Pending' })`. In the frontend, the `Layout.jsx` component listens for the custom `complaintsUpdated` DOM event and periodically queries the count. When `Complaints.jsx` performs an inline status update via `PUT /api/admin/complaints/:id/status`, it dispatches `window.dispatchEvent(new Event('complaintsUpdated'))`, updating the badge state instantaneously across all navigation bars.

### Q8. What is a Progressive Web App (PWA) and how is it implemented in your project?
* **Simple Speaking Answer:** "A PWA allows a website to be installed on a mobile phone or desktop just like a native app from the Play Store or App Store. In our project, we configured a `manifest.json` file with our portal name, blue theme colors, and graduation cap icons. We also registered a Service Worker (`sw.js`) that caches essential assets. When a student opens the website on their phone, our app detects mobile access and displays a custom install prompt button saying 'Install University Portal' so they can add it to their home screen with one tap."
* **Technical Depth:** The browser evaluates the web app manifest against PWA installability criteria (HTTPS, valid manifest with `display: standalone`, `icons` array with 192px and 512px assets, and a registered Service Worker with a `fetch` event handler). In `InstallPwaPrompt.jsx`, the component intercepts the browser's `beforeinstallprompt` event, stores the event object in component state, prevents the default browser banner, and renders a custom UI prompt. When clicked, it calls `promptEvent.prompt()` and handles user choice.

### Q9. How does your backend handle MongoDB Atlas DNS resolution issues on Windows?
* **Simple Speaking Answer:** "On some Windows networks or local ISPs, Node.js fails to resolve MongoDB Atlas SRV connection strings (`mongodb+srv://`) because the default local DNS resolver times out. To make our application resilient and prevent crashes, we added a DNS fallback in `server.js` that explicitly sets reliable public DNS servers (Google `8.8.8.8` and Cloudflare `1.1.1.1`) when running on Windows."
* **Technical Depth:** Node's native `dns` module uses the OS resolver. In Windows environments with misconfigured ISP routers, SRV record lookups for Atlas clusters fail with `querySrv ENOTFOUND`. In `server.js`, we conditionally execute:
`if (process.platform === 'win32') { dns.setServers(['8.8.8.8', '1.1.1.1']); }`, ensuring deterministic resolution of Atlas cluster endpoints.

### Q10. How do you prevent Cross-Origin Resource Sharing (CORS) errors?
* **Simple Speaking Answer:** "Because our frontend runs on Vite port 5173 and backend runs on Express port 5000, they are considered different origins. We configured the Express `cors` middleware with `origin: 'http://localhost:5173'` and `credentials: true`. Setting credentials to true is mandatory so that HttpOnly authentication cookies can travel back and forth between the frontend and backend."
* **Technical Depth:** When making requests with credentials (cookies, authorization headers), browsers mandate that the server response contains `Access-Control-Allow-Credentials: true` and an explicit `Access-Control-Allow-Origin` matching the client origin (wildcards `*` are forbidden by browser security specifications when credentials are exchanged).

### Q11. What is the First-Time Login (Password Rotation) feature and why is it important?
* **Simple Speaking Answer:** "When the admin creates an account for a student or professor, the system generates an initial password. In the database, the user document has a flag `isFirstLogin: true`. When the user logs in for the first time, our frontend route guard intercepts them and forces them to a 'Change Password' page before they can view their dashboard. This guarantees that nobody, not even the admin, knows the user's permanent private password."
* **Technical Depth:** In `authRoutes.js`, the login payload includes `isFirstLogin`. The frontend `App.jsx` checks this flag upon authentication state hydration. If true, the router redirects the browser to `/force-change-password` and prevents access to all protected dashboards. Upon successful submission to `/api/auth/change-password`, the backend hashes the new password with bcrypt, updates `isFirstLogin = false`, and persists the change.

### Q12. How are professor names and avatar initials formatted cleanly?
* **Simple Speaking Answer:** "If a professor's name is entered as 'Dr. Indera Singh', traditional code might show their title as 'Prof. Dr. Indera Singh' which looks repetitive, or use 'D' for their avatar initial which stands for 'Doctor' rather than their real name. We created a custom utility called `nameHelper.js` that strips redundant 'Prof.' prefixes, formats names cleanly as `Dr. <Name>`, and extracts avatar initials by skipping honorifics like 'Dr.' or 'Prof.', so 'Dr. Indera Singh' correctly displays **I** in their avatar badge."
* **Technical Depth:** `formatProfessorName(name)` cleans honorific duplication using regex replacements: `name.replace(/^prof\\.?\\s*dr\\.?/i, 'Dr. ')`. The initial extraction function splits name tokens, filters out common honorific words (`['DR', 'PROF', 'MR', 'MS', 'MRS']`), and returns the first character of the actual given name: `validTokens[0][0].toUpperCase()`.

### Q13. How does bulk assignment upload work?
* **Simple Speaking Answer:** "In the Student portal, students can select multiple PDF files simultaneously. The frontend bundles them into a single `FormData` object. The backend's Multer middleware uses `upload.array('files', 10)` to accept up to 10 files in parallel, uploads each file to Cloudinary, and saves an array of new Assignment documents in MongoDB using `Assignment.insertMany()`."
* **Technical Depth:** `insertMany()` performs a single batch write command to MongoDB Atlas rather than individual sequential database roundtrips, reducing network overhead and database write lock contention significantly.

### Q14. What database indexes did you create in MongoDB and why?
* **Simple Speaking Answer:** "We created indexes on frequently searched and filtered fields: `email` in UserData, `code` in Department, `student` and `professor` IDs in Assignment, and `status` in Complaint. Indexes allow MongoDB to find documents using a B-Tree structure in O(log N) time rather than scanning every document in the collection (O(N) collection scan), ensuring the app stays fast even with tens of thousands of records."
* **Technical Depth:** Without indexes, queries like `Assignment.find({ professor: profId, status: 'Submitted' })` perform a full collection scan (COLLSCAN), loading all documents into server memory. Creating compound indexes (e.g. `{ professor: 1, status: 1 }`) converts this to an index scan (IXSCAN), drastically reducing CPU usage, memory consumption, and query latency.

### Q15. How does password encryption with Bcrypt work under the hood?
* **Simple Speaking Answer:** "Bcrypt uses a one-way mathematical hashing algorithm combined with a random 'salt'. A salt is random string added to the password before hashing to ensure that two identical passwords produce completely different hash outputs. Bcrypt also uses 'work factor rounds' (we use 10 rounds), which intentionally slows down calculation to make brute-force and dictionary attacks computationally infeasible for attackers."
* **Technical Depth:** Bcrypt implements the Blowfish-based cryptographic cipher. The work factor parameter $2^N$ determines the number of hashing iterations (10 rounds = $2^{10} = 1024$ iterations). Bcrypt hashes are one-way; passwords can never be decrypted. During login, `bcrypt.compare(candidatePassword, storedHash)` extracts the salt from the stored hash, hashes the candidate password with that exact salt, and compares the outputs in constant time to thwart timing attacks.

### Q16. What happens if a department is deleted? How is data integrity protected?
* **Simple Speaking Answer:** "Before deleting a department, our backend checks if any active students, professors, or assignments are currently linked to that department. If users or submissions exist, the backend blocks the deletion and returns an error explaining that enrolled users must be reassigned first. This prevents orphaned records and broken links in the database."
* **Technical Depth:** In `departmentController.js`, `deleteDepartment` executes pre-checks:
`const enrolledCount = await UserData.countDocuments({ department: id });`. If `enrolledCount > 0`, the endpoint halts with status 400: `'Cannot delete department with active enrolled users'`, enforcing referential integrity programmatically at the application layer.

### Q17. How do you handle pagination in the student assignments table?
* **Simple Speaking Answer:** "If a student has submitted 50 assignments, loading all of them at once would slow down the browser and waste network bandwidth. We use pagination where the client requests a specific page (e.g. page 1 with 10 records). The backend uses MongoDB's `skip()` and `limit()` methods to return only those 10 records along with total count, allowing the user to navigate through Previous and Next page controls smoothly."
* **Technical Depth:** The query formula is `const skip = (page - 1) * limit;`. The backend executes `Assignment.find(query).skip(skip).limit(limit).sort({ createdAt: -1 })` and simultaneously executes `Assignment.countDocuments(query)` with `Promise.all()` to return `{ data, currentPage, totalPages, totalItems }`.

### Q18. What is the ActivityLog collection and how does it help administrators?
* **Simple Speaking Answer:** "Activity logs act like a security camera for the application. Whenever an important action happens &mdash; like a user logging in, an admin creating an account, an assignment being submitted, or a complaint status being changed &mdash; the backend automatically creates an entry recording who did it, what action was taken, any details, the client IP address, and the exact timestamp. The admin can review this audit log to investigate any suspicious actions or verify when tasks occurred."
* **Technical Depth:** The centralized utility `logActivity(userId, action, details, ip)` writes non-blocking log documents to the `ActivityLog` collection. By abstracting this into a reusable utility, logging is cleanly decoupled from business logic in route controllers.

### Q19. If 50,000 students and professors use this portal concurrently during exam season, what bottlenecks would arise and how would you scale?
* **Simple Speaking Answer:** "The three main bottlenecks would be: 1) File upload bandwidth on the Node server, 2) WebSocket server memory for real-time chat, and 3) Database read/write locks on MongoDB. To solve this: First, since our PDF uploads stream directly to Cloudinary's global CDN, our application servers are already shielded from media bandwidth. Second, for Socket.io, we would add a Redis Adapter to synchronize WebSocket events across multiple Node server instances behind an NGINX load balancer. Third, on MongoDB, we would enable read-replicas for read queries and shard assignments by department ID."
* **Technical Depth:** Node.js single-process memory is capped by V8 (~1.4GB default). We would deploy stateless Express containers horizontally across AWS ECS or Kubernetes, using the `@socket.io/redis-adapter` to synchronize Socket rooms across nodes via Redis Pub/Sub. MongoDB Atlas read-replicas would handle analytical reads and dashboard statistics via `secondaryPreferred` read preferences.

### Q20. What are the key differences between SQL and NoSQL, and why was MongoDB preferred here?
* **Simple Speaking Answer:** "SQL databases like PostgreSQL or MySQL use rigid tables with predefined schemas and foreign key joins, which is great for banking or complex relational transactions. NoSQL databases like MongoDB store data in flexible, JSON-like BSON documents. We chose MongoDB because our academic assignment data is inherently document-centric: an assignment submission is a self-contained record with file URLs, professor remarks, and status stages. It provides high write throughput for rapid file submissions and integrates natively with JavaScript and Node.js without an Object-Relational Mapping (ORM) translation layer."
* **Technical Depth:** MongoDB's dynamic schema flexibility allowed fast iterations during portal development (e.g., adding Nepal phone numbers, country codes, remarks, and PWA metadata) without requiring destructive database schema migrations. Furthermore, Mongoose provides application-level schema validation and virtual joins via `.populate()`, giving us the benefits of structure without SQL table locking overhead.

### Q21. How do you ensure form inputs are validated and protected against malicious injections?
* **Simple Speaking Answer:** "We use defense-in-depth with two layers of validation: client-side validation for instant user feedback (checking required fields, email formats, and password strengths in React), and strict server-side validation in Express before touching the database. In MongoDB, queries use parameterized Mongoose methods rather than string concatenation, which naturally prevents SQL/NoSQL injection attacks."
* **Technical Depth:** Mongoose enforces schema-level validation constraints (e.g. `enum`, `match` regex, `minlength`, `trim`). Input payloads are sanitized against NoSQL operator injection (e.g. malicious payloads like `{ "$gt": "" }`) by verifying types before executing database operations.

### Q22. How does Nodemailer send emails, and what happens if the email service fails?
* **Simple Speaking Answer:** "Nodemailer creates an SMTP transport client using our university email account credentials. When the admin creates a new student, Nodemailer compiles a formatted HTML email containing their login ID and initial password and sends it via Gmail SMTP. If the email service fails (e.g., due to wrong SMTP credentials or rate limits), our code catches the error gracefully, logs it to the console, but does not abort account creation, ensuring the admin can still view the generated password and provide it manually."
* **Technical Depth:** `emailService.js` wraps the send call inside a `try...catch` block. This prevents an external third-party SMTP outage from rolling back atomic user creation transactions in MongoDB, guaranteeing business continuity.

### Q23. What are React Hooks and which ones did you use most extensively in this project?
* **Simple Speaking Answer:** "React Hooks are built-in functions that let functional components manage state and lifecycle events. We used `useState` to manage local form data, modal visibility, and table filters; `useEffect` to fetch assignments, initiate socket connections, and synchronize notification counts on component mount; and `useNavigate` from React Router to programmatically navigate users across dashboards."
* **Technical Depth:** We also utilized custom events and DOM listeners inside `useEffect` with clean-up return functions (e.g. `window.removeEventListener('complaintsUpdated', ...)`) to prevent memory leaks and dangling subscriptions when components unmount.

### Q24. What was the most difficult bug or technical challenge you faced and how did you resolve it?
* **Simple Speaking Answer:** "One major challenge was the MongoDB Atlas DNS resolution error on Windows, where local ISP resolvers failed to parse Atlas SRV connection strings and caused the server to crash on startup. We solved this by adding custom DNS fallbacks (Google 8.8.8.8 and Cloudflare 1.1.1.1) in Node.js specifically for Windows environments. Another tricky issue was honorific name formatting, where professors named 'Dr. Indera Singh' had their names displayed with duplicate titles like 'Prof. Dr.' and their avatar initials showed 'D' for Doctor instead of 'I'. We resolved this by building a dedicated `nameHelper.js` module that cleans honorific duplication and intelligently skips academic titles when extracting initials."
* **Technical Depth:** The DNS issue was diagnosed through Node's `c-ares` library behavior on Windows. The name helper uses tokenized regex analysis to separate prefix titles from given names, ensuring pristine typography across all portal components.

### Q25. Can you give a 5-minute technical project pitch for the viva examination?
* **Complete Viva Pitch:**
  "Respected professors and evaluators, today I am presenting the **University Assignment Portal**, a full-stack academic workflow management and real-time collaboration system built with the MERN stack (MongoDB, Express, React, and Node.js).
  
  **1. Problem Statement:** In university environments, managing assignment submissions through email, WhatsApp, or physical printouts creates immense administrative burden. Submissions get lost, professors cannot track deadlines, students receive no automated confirmation, and grading feedback is delayed or absent.
  
  **2. Architectural Solution:** Our platform provides three dedicated, role-protected environments:
  * **Admin Portal:** Manages academic departments with auto-generated codes, registers students and professors with automated email onboarding, monitors an audit activity log, and manages support tickets with a dynamic notification badge that persists until issues are resolved.
  * **Professor Portal:** Allows faculty to view submissions filtered by their department, inspect student PDFs in an integrated viewer, and approve or reject submissions with detailed feedback.
  * **Student Portal:** Gives students a modern dashboard to submit assignments individually or in bulk, track submission status in real time with centered action buttons, chat directly with departmental professors, and install the portal as a Progressive Web App (PWA) on their phone.
  
  **3. Security & Cloud Infrastructure:** Authentication is handled via stateless JSON Web Tokens sealed inside HttpOnly cookies, eliminating XSS vulnerabilities. Passwords are encrypted with 10 salt rounds of bcrypt, and forced password rotation is required on first login. Multi-part PDF submissions stream directly to Cloudinary CDN via Multer, preventing local server disk bloat and keeping MongoDB lightweight. Direct messaging between students and professors is powered by Socket.io WebSocket rooms.
  
  **4. Conclusion:** University Assignment Portal is an end-to-end, secure, scalable, and mobile-ready platform that modernizes higher education academic administration. Thank you, and I look forward to your questions."

---

## 📄 Documentation PDF
A standalone, formatted PDF copy of this documentation is generated locally as `document.pdf`. It is kept locally for reference and excluded from Git commits.

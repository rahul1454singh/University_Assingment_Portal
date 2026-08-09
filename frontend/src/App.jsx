import React from "react";
import { Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard";
import Departments from "./admin/Departments";
import CreateDepartment from "./admin/CreateDepartment";
import EditDepartment from "./admin/EditDepartment";
import Users from "./admin/Users";
import CreateUser from "./admin/CreateUser";
import EditUser from "./admin/EditUser";
import Complaints from "./admin/Complaints";

// Student Pages
import StudentDashboard from "./student/StudentDashboard";
import StudentAssignments from "./student/StudentAssignments";
import StudentUploadAssignment from "./student/StudentUploadAssignment";
import StudentBulkUpload from "./student/StudentBulkUpload";
import StudentEditAssignment from "./student/StudentEditAssignment";
import StudentProfile from "./student/StudentProfile";
import StudentMessages from "./student/StudentMessages";

// Professor Pages
import ProfessorDashboard from "./professor/ProfessorDashboard";
import ProfessorReviews from "./professor/ProfessorReviews";
import ProfessorProfile from "./professor/ProfessorProfile";
import ProfessorMessages from "./professor/ProfessorMessages";
import ReviewAssignment from "./professor/ReviewAssignment";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/departments" element={<Departments />} />
      <Route path="/admin/departments/create" element={<CreateDepartment />} />
      <Route path="/admin/departments/edit/:id" element={<EditDepartment />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/users/create" element={<CreateUser />} />
      <Route path="/admin/users/edit/:id" element={<EditUser />} />
      <Route path="/admin/complaints" element={<Complaints />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/assignments" element={<StudentAssignments />} />
      <Route path="/student/assignments/upload" element={<StudentUploadAssignment />} />
      <Route path="/student/assignments/bulk-upload" element={<StudentBulkUpload />} />
      <Route path="/student/assignments/:id/edit" element={<StudentEditAssignment />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/messages" element={<StudentMessages />} />

      {/* Professor Routes */}
      <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
      <Route path="/professor/reviews" element={<ProfessorReviews />} />
      <Route path="/professor/profile" element={<ProfessorProfile />} />
      <Route path="/professor/messages" element={<ProfessorMessages />} />
      <Route path="/professor/assignments/:id/review" element={<ReviewAssignment />} />
    </Routes>
  );
}

export default App;

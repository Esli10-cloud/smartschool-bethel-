import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Teachers from "./pages/Teachers.jsx";
import Payments from "./pages/Payments.jsx";
import Grades from "./pages/Grades.jsx";
import Settings from "./pages/Settings.jsx";
import Users from "./pages/Users.jsx"; // <-- AJOUTÉ

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} /> {/* <-- AJOUTÉ */}
      </Routes>
    </BrowserRouter>
  );
}
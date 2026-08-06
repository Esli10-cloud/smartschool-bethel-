import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Teachers from "./pages/Teachers.jsx";
import Payments from "./pages/Payments.jsx";
import Grades from "./pages/Grades.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route pour la page de connexion */}
        <Route path="/login" element={<Login />} />

        {/* Redirection automatique de l'accueil (/) vers (/login) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Tes routes de l'application */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
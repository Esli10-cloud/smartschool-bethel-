import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Users, GraduationCap, Wallet, BookOpen, ArrowUpRight, Plus, CreditCard, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Statistiques
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalRecettes, setTotalRecettes] = useState(0);
  const [activeClassesCount, setActiveClassesCount] = useState(0);

  // Tableaux récents
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // 1. Récupérer les élèves
      const { data: students, error: studentsErr } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (!studentsErr && students) {
        setTotalStudents(students.length);
        
        // Calculer le nombre de classes uniques actives
        const uniqueClasses = new Set(students.map((s) => s.classe).filter(Boolean));
        setActiveClassesCount(uniqueClasses.size);

        // Récupérer les 5 derniers élèves inscrits
        setRecentStudents(students.slice(0, 5));
      }

      // 2. Récupérer les enseignants
      const { data: teachers, error: teachersErr } = await supabase
        .from("teachers")
        .select("id");

      if (!teachersErr && teachers) {
        setTotalTeachers(teachers.length);
      }

      // 3. Récupérer les paiements (recettes)
      const { data: payments, error: paymentsErr } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!paymentsErr && payments) {
        // Somme totale des recettes
        const total = payments.reduce((sum, p) => sum + (Number(p.montant) || 0), 0);
        setTotalRecettes(total);

        // 5 derniers paiements
        setRecentPayments(payments.slice(0, 5));
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header title="Tableau de bord" />

        <div style={{ padding: "30px" }}>
          
          {/* Titre & Sous-titre */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Aperçu Général</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
              Bienvenue sur la plateforme SmartSchool Bethel. Voici les statistiques en temps réel.
            </p>
          </div>

          {/* 4 CARTES D'INDICATEURS (KPIs) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            
            {/* Carte Élèves */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "500" }}>Élèves Inscrits</p>
                <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", margin: "8px 0 0 0" }}>
                  {loading ? "..." : totalStudents}
                </h3>
              </div>
              <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px", color: "#2563eb" }}>
                <Users size={24} />
              </div>
            </div>

            {/* Carte Enseignants */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "500" }}>Enseignants</p>
                <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", margin: "8px 0 0 0" }}>
                  {loading ? "..." : totalTeachers}
                </h3>
              </div>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "10px", color: "#16a34a" }}>
                <GraduationCap size={24} />
              </div>
            </div>

            {/* Carte Recettes */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "500" }}>Recettes Totales</p>
                <h3 style={{ fontSize: "22px", fontWeight: "bold", color: "#0f172a", margin: "8px 0 0 0" }}>
                  {loading ? "..." : `${totalRecettes.toLocaleString("fr-FR")} CFA`}
                </h3>
              </div>
              <div style={{ background: "#fff7ed", padding: "12px", borderRadius: "10px", color: "#ea580c" }}>
                <Wallet size={24} />
              </div>
            </div>

            {/* Carte Classes Actives (DYNAMIQUE) */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontWeight: "500" }}>Classes Actives</p>
                <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", margin: "8px 0 0 0" }}>
                  {loading ? "..." : activeClassesCount}
                </h3>
              </div>
              <div style={{ background: "#faf5ff", padding: "12px", borderRadius: "10px", color: "#9333ea" }}>
                <BookOpen size={24} />
              </div>
            </div>

          </div>

          {/* RACCOURCIS RAPIDES */}
          <div style={{ background: "#1e293b", color: "white", padding: "20px", borderRadius: "12px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Actions Rapides</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>Accédez rapidement aux tâches fréquentes du secrétariat.</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/students")}
                style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} /> Inscrire un élève
              </button>
              <button
                onClick={() => navigate("/payments")}
                style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CreditCard size={16} /> Enregistrer un paiement
              </button>
              <button
                onClick={() => navigate("/students")}
                style={{ background: "#475569", color: "white", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FileText size={16} /> Imprimer une liste
              </button>
            </div>
          </div>

          {/* DEUX TABLEAUX DE SUIVI RÉCENT */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
            
            {/* Dernières Inscriptions */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Dernières Inscriptions</h3>
                <button onClick={() => navigate("/students")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  Voir tout <ArrowUpRight size={14} />
                </button>
              </div>

              {recentStudents.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Aucun élève récent.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentStudents.map((s) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>{s.nom} {s.prenom}</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>Matricule: {s.matricule} • Classe: {s.classe}</p>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: s.is_affecte_etat ? "#1e40af" : "#475569", background: s.is_affecte_etat ? "#dbeafe" : "#e2e8f0", padding: "4px 8px", borderRadius: "6px" }}>
                        {s.is_affecte_etat ? "Affecté État" : "Standard"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Derniers Paiements / Recettes */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>Derniers Paiements Recueillis</h3>
                <button onClick={() => navigate("/payments")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  Voir tout <ArrowUpRight size={14} />
                </button>
              </div>

              {recentPayments.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Aucun paiement enregistré pour l'instant.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentPayments.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>{p.student_name || "Élève"}</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748b" }}>{p.motif || "Scolarité"} • {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : ""}</p>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "#16a34a" }}>
                        +{Number(p.montant).toLocaleString("fr-FR")} CFA
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
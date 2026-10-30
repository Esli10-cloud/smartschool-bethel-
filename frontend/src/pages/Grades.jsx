import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Printer, Filter } from "lucide-react";

export default function Grades() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");

  // Stocke les notes tapées : { "id_eleve": { n1: 12, n2: 15, n3: 10, coef: 1 } }
  const [notesData, setNotesData] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("nom", { ascending: true });

      if (!error && data) {
        setStudents(data);
        // Sélectionne la première classe par défaut
        if (data.length > 0 && data[0].classe) {
          setSelectedClass(data[0].classe);
        }
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  // Liste des classes uniques
  const classesList = [...new Set(students.map((s) => s.classe).filter(Boolean))].sort();

  // Élèves de la classe sélectionnée
  const filteredStudents = students.filter((s) => s.classe === selectedClass);

  // Gestion de la saisie
  const handleNoteChange = (studentId, field, value) => {
    const numValue = parseFloat(value) || "";
    setNotesData((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: numValue,
      },
    }));
  };

  // Calcul automatique
  const calculateStats = (studentId) => {
    const studentNotes = notesData[studentId] || {};
    const n1 = parseFloat(studentNotes.n1) || 0;
    const n2 = parseFloat(studentNotes.n2) || 0;
    const n3 = parseFloat(studentNotes.n3) || 0;
    const coef = parseFloat(studentNotes.coef) || 1;

    const moyenne = (n1 + n2 + n3) / 3;
    const ponderee = moyenne * coef;

    const hasNotes = studentNotes.n1 || studentNotes.n2 || studentNotes.n3;

    return {
      moyenne: hasNotes ? moyenne.toFixed(2) : "",
      ponderee: hasNotes ? ponderee.toFixed(2) : "",
    };
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Cacher la Sidebar à l'impression */}
      <div className="no-print">
        <Sidebar />
      </div>

      <div style={{ flex: 1 }}>
        <div className="no-print">
          <Header title="Fiches de Notes" />
        </div>

        <div style={{ padding: "30px" }} className="print-padding-reset">
          
          {/* Barre d'outils */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <Filter size={16} color="#64748b" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: "14px", fontWeight: "600", color: "#334155" }}
              >
                <option value="">Sélectionner une classe...</option>
                {classesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "#2563eb", color: "white",
                padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer"
              }}
            >
              <Printer size={18} /> Imprimer la fiche
            </button>
          </div>

          {/* La fiche */}
          <div id="grades-print" style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            
            <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>LYCÉE TECHNIQUE BETHEL</h1>
              <h2 style={{ fontSize: "16px", margin: "5px 0" }}>FICHE DE NOTES</h2>
              <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>CLASSE : {selectedClass || "Aucune classe sélectionnée"}</p>
              <p style={{ fontSize: "12px", margin: "5px 0 0 0", fontStyle: "italic" }}>Matière / Professeur : ......................................................</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left", fontSize: "13px" }}>Matricule</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left", fontSize: "13px" }}>Nom & Prénom</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "70px" }}>Note 1</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "70px" }}>Note 2</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "70px" }}>Note 3</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "80px" }}>Moyenne</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "60px" }}>Coef</th>
                  <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "80px" }}>Pondérée</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center" }}>Chargement...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center" }}>Aucun élève dans cette classe.</td></tr>
                ) : (
                  filteredStudents.map((s) => {
                    const stats = calculateStats(s.id);
                    const studentNotes = notesData[s.id] || {};

                    return (
                      <tr key={s.id}>
                        <td style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "13px", color: "#2563eb", fontWeight: "bold" }}>{s.matricule}</td>
                        <td style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "13px", fontWeight: "bold" }}>{s.nom} {s.prenom}</td>
                        
                        <td style={{ border: "1px solid #000", padding: "2px" }}>
                          <input className="no-print-border" type="number" value={studentNotes.n1 || ""} onChange={(e) => handleNoteChange(s.id, 'n1', e.target.value)} style={{ width: "100%", border: "none", textAlign: "center", outline: "none", background: "transparent" }} />
                        </td>
                        <td style={{ border: "1px solid #000", padding: "2px" }}>
                          <input className="no-print-border" type="number" value={studentNotes.n2 || ""} onChange={(e) => handleNoteChange(s.id, 'n2', e.target.value)} style={{ width: "100%", border: "none", textAlign: "center", outline: "none", background: "transparent" }} />
                        </td>
                        <td style={{ border: "1px solid #000", padding: "2px" }}>
                          <input className="no-print-border" type="number" value={studentNotes.n3 || ""} onChange={(e) => handleNoteChange(s.id, 'n3', e.target.value)} style={{ width: "100%", border: "none", textAlign: "center", outline: "none", background: "transparent" }} />
                        </td>

                        <td style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "13px", textAlign: "center", fontWeight: "bold", color: "#16a34a" }}>{stats.moyenne}</td>
                        
                        <td style={{ border: "1px solid #000", padding: "2px" }}>
                           <input className="no-print-border" type="number" value={studentNotes.coef || ""} onChange={(e) => handleNoteChange(s.id, 'coef', e.target.value)} placeholder="1" style={{ width: "100%", border: "none", textAlign: "center", outline: "none", background: "transparent" }} />
                        </td>

                        <td style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "13px", textAlign: "center", fontWeight: "bold", color: "#2563eb" }}>{stats.ponderee}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            
            <div style={{ marginTop: "30px", textAlign: "right", fontSize: "14px", fontWeight: "bold" }}>
               Signature du professeur : ......................................................
            </div>

          </div>
        </div>
      </div>

      {/* Règles CSS d'impression */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-padding-reset { padding: 0 !important; }
          body { background: white !important; }
          #grades-print { border: none !important; padding: 0 !important; }
          
          .no-print-border {
            border: none !important;
            outline: none !important;
            background: transparent !important;
          }
          
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
        }
      `}</style>
    </div>
  );
}
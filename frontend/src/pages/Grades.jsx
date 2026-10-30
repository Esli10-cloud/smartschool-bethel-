import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Printer, Filter } from "lucide-react";

export default function Grades() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");

  // Stocke les notes tapées : { "id_eleve": { n1: 12, n2: 15, n3: 10 } }
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
        // Sélectionne la première classe par défaut s'il y a des élèves
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

  // Calcul automatique de la moyenne simple
  const calculateMoyenne = (studentId) => {
    const studentNotes = notesData[studentId] || {};
    const n1 = parseFloat(studentNotes.n1) || 0;
    const n2 = parseFloat(studentNotes.n2) || 0;
    const n3 = parseFloat(studentNotes.n3) || 0;

    const hasNotes = studentNotes.n1 || studentNotes.n2 || studentNotes.n3;
    const moyenne = (n1 + n2 + n3) / 3;

    return hasNotes ? moyenne.toFixed(2) : "";
  };

  // Fonction pour générer le tableau d'une classe spécifique
  const renderClassTable = (className) => {
    const classStudents = students.filter((s) => s.classe === className);
    
    if (classStudents.length === 0) return null;

    return (
      <div key={className} className="class-sheet" style={{ marginBottom: "40px", pageBreakAfter: "always" }}>
        
        {/* En-tête de la fiche */}
        <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>LYCÉE TECHNIQUE BETHEL</h1>
          <h2 style={{ fontSize: "16px", margin: "5px 0" }}>FICHE DE NOTES</h2>
          <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>CLASSE : {className}</p>
          <p style={{ fontSize: "12px", margin: "5px 0 0 0", fontStyle: "italic" }}>Matière / Professeur : ......................................................</p>
        </div>

        {/* Tableau */}
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left", fontSize: "13px" }}>Matricule</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left", fontSize: "13px" }}>Nom & Prénom</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "80px" }}>Note 1</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "80px" }}>Note 2</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "80px" }}>Note 3</th>
              <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontSize: "13px", width: "100px" }}>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map((s) => {
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

                  <td style={{ border: "1px solid #000", padding: "6px 8px", fontSize: "13px", textAlign: "center", fontWeight: "bold", color: "#16a34a" }}>{calculateMoyenne(s.id)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div style={{ marginTop: "30px", textAlign: "right", fontSize: "14px", fontWeight: "bold" }}>
           Signature du professeur : ......................................................
        </div>
      </div>
    );
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
                {/* ✅ NOUVEAU : Option pour imprimer toutes les classes */}
                <option value="ALL">🌟 TOUTES LES CLASSES (Impression globale)</option>
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
              <Printer size={18} /> Imprimer
            </button>
          </div>

          {/* Affichage des fiches */}
          <div id="grades-print">
            {loading ? (
              <p style={{ textAlign: "center" }}>Chargement des élèves...</p>
            ) : selectedClass === "ALL" ? (
              // Si on sélectionne "TOUTES LES CLASSES", on boucle sur toutes les classes
              classesList.map((cls) => renderClassTable(cls))
            ) : selectedClass ? (
              // Si une classe est sélectionnée, on affiche juste elle
              renderClassTable(selectedClass)
            ) : (
              <p style={{ textAlign: "center", color: "#64748b" }}>Veuillez sélectionner une classe pour afficher les fiches.</p>
            )}
          </div>

        </div>
      </div>

      {/* Règles CSS d'impression */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-padding-reset { padding: 0 !important; }
          body { background: white !important; }
          
          #grades-print {
            border: none !important;
            padding: 0 !important;
          }

          .class-sheet {
            page-break-after: always; /* Force une nouvelle page pour chaque classe */
          }
          
          .class-sheet:last-child {
            page-break-after: auto; /* Pas de page blanche à la fin */
          }
          
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
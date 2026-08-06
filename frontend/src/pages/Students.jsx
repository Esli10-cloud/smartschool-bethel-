import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Plus, Search, Trash2, Edit, FileSpreadsheet, Filter, Users, Printer } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Toutes");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Champs de l'élève
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState("Masculin");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [classe, setClasse] = useState("CAP/AP");
  const [isAffecteEtat, setIsAffecteEtat] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [parentNomPrenom, setParentNomPrenom] = useState("");
  const [parentTelephone, setParentTelephone] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setSexe("Masculin");
    setDateNaissance("");
    setLieuNaissance("");
    setClasse("CAP/AP");
    setIsAffecteEtat(false);
    setTelephone("");
    setParentNomPrenom("");
    setParentTelephone("");
    setEditingStudentId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setIsEditMode(true);
    setEditingStudentId(student.id);
    setNom(student.nom || "");
    setPrenom(student.prenom || "");
    setSexe(student.sexe || "Masculin");
    setDateNaissance(student.date_naissance || "");
    setLieuNaissance(student.lieu_naissance || "");
    setClasse(student.classe || "CAP/AP");
    setIsAffecteEtat(student.is_affecte_etat || false);

    const cleanPhone = (student.telephone || "").replace(/^\+226\s?/, "");
    setTelephone(cleanPhone);

    setParentNomPrenom(student.parent_nom_prenom || "");
    const cleanParentPhone = (student.telephone_parent || "").replace(/^\+226\s?/, "");
    setParentTelephone(cleanParentPhone);

    setIsModalOpen(true);
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    if (!nom || !prenom) {
      alert("Veuillez remplir les champs obligatoires (Nom et Prénom).");
      return;
    }

    const payload = {
      nom: nom.toUpperCase(),
      prenom,
      sexe,
      date_naissance: dateNaissance || null,
      lieu_naissance: lieuNaissance,
      classe,
      is_affecte_etat: isAffecteEtat,
      telephone: telephone ? `+226 ${telephone}` : "",
      parent_nom_prenom: parentNomPrenom || "",
      telephone_parent: parentTelephone ? `+226 ${parentTelephone}` : "",
    };

    if (isEditMode) {
      const { error } = await supabase
        .from("students")
        .update(payload)
        .eq("id", editingStudentId);

      if (!error) {
        setIsModalOpen(false);
        resetForm();
        fetchStudents();
      } else {
        alert("Erreur lors de la modification : " + error.message);
      }
    } else {
      const matricule = "TB" + Math.floor(1000 + Math.random() * 9000);
      const newStudent = { matricule, ...payload };

      const { error } = await supabase.from("students").insert([newStudent]);

      if (!error) {
        setIsModalOpen(false);
        resetForm();
        fetchStudents();
      } else {
        alert("Erreur lors de l'ajout : " + error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet élève ?")) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (!error) {
        fetchStudents();
      } else {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };

  // Export Excel / CSV
  const exportToCSV = () => {
    const headers = ["Matricule", "Nom", "Prénom", "Sexe", "Classe", "Statut", "Telephone Eleve", "Parent/Tuteur", "Telephone Parent"];
    const rows = filteredStudents.map(s => [
      s.matricule || "",
      `"${s.nom || ""}"`,
      `"${s.prenom || ""}"`,
      s.sexe || "",
      `"${s.classe || ""}"`,
      s.is_affecte_etat ? "Affecté État" : "Standard",
      `"${s.telephone || ""}"`,
      `"${s.parent_nom_prenom || ""}"`,
      `"${s.telephone_parent || ""}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `liste_eleves_${selectedClassFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction d'impression PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Liste unique des classes pour le filtre
  const classesList = ["Toutes", ...new Set(students.map(s => s.classe).filter(Boolean))];

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      s.matricule?.toLowerCase().includes(search.toLowerCase()) ||
      s.classe?.toLowerCase().includes(search.toLowerCase());

    const matchClass = selectedClassFilter === "Toutes" || s.classe === selectedClassFilter;

    return matchSearch && matchClass;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      
      {/* Cacher la Sidebar lors de l'impression */}
      <div className="no-print">
        <Sidebar />
      </div>

      <div style={{ flex: 1 }}>
        <div className="no-print">
          <Header title="Gestion des Élèves" />
        </div>

        <div style={{ padding: "30px" }} className="print-padding-reset">
          
          {/* En-tête d'impression (Visible uniquement à l'impression / PDF) */}
          <div className="print-only" style={{ display: "none", marginBottom: "20px", borderBottom: "2px solid #2563eb", paddingBottom: "10px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1e3a8a", margin: 0 }}>LYCÉE TECHNIQUE BETHEL</h1>
            <h2 style={{ fontSize: "16px", color: "#475569", margin: "5px 0" }}>
              LISTE OFFICIELLE DES ÉLÈVES {selectedClassFilter !== "Toutes" ? `- CLASSE : ${selectedClassFilter}` : ""}
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              Date d'impression : {new Date().toLocaleDateString("fr-FR")} | Total : {filteredStudents.length} élève(s)
            </p>
          </div>

          {/* Barre d'outils et statistiques (Cachée à l'impression) */}
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Barre de recherche */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "260px" }}>
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", outline: "none", width: "100%", fontSize: "14px" }}
                />
              </div>

              {/* Filtre par classe */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <Filter size={16} color="#64748b" />
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: "600", color: "#334155" }}
                >
                  {classesList.map(c => <option key={c} value={c}>Classe : {c}</option>)}
                </select>
              </div>

              {/* Compteur d'élèves */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", color: "#1e40af", fontWeight: "700" }}>
                <Users size={16} />
                <span>Total : {filteredStudents.length} / {students.length} élève(s)</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Bouton Imprimer PDF */}
              <button
                onClick={handlePrintPDF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#475569",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Printer size={16} /> Imprimer PDF
              </button>

              {/* Bouton Export Excel */}
              <button
                onClick={exportToCSV}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#16a34a",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <FileSpreadsheet size={16} /> Exporter Excel
              </button>

              {/* Bouton Inscrire */}
              <button
                onClick={handleOpenAddModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#2563eb",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <Plus size={18} /> Inscrire un nouvel élève
              </button>
            </div>
          </div>

          {/* Tableau des élèves */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#2563eb", color: "white", textAlign: "left", fontSize: "14px" }}>
                  <th style={{ padding: "14px 20px" }}>Matricule</th>
                  <th style={{ padding: "14px 20px" }}>Nom & Prénom</th>
                  <th style={{ padding: "14px 20px" }}>Sexe</th>
                  <th style={{ padding: "14px 20px" }}>Classe & Filière</th>
                  <th style={{ padding: "14px 20px" }}>Statut</th>
                  <th style={{ padding: "14px 20px" }}>Contact Élève</th>
                  <th style={{ padding: "14px 20px" }}>Parent / Tuteur</th>
                  <th style={{ padding: "14px 20px" }}>Contact Parent</th>
                  <th className="no-print" style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                      Chargement des élèves...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                      Aucun élève trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                      <td style={{ padding: "14px 20px", fontWeight: "600", color: "#2563eb" }}>{s.matricule}</td>
                      <td style={{ padding: "14px 20px", fontWeight: "600" }}>{s.nom} {s.prenom}</td>
                      <td style={{ padding: "14px 20px" }}>{s.sexe === "Masculin" ? "M" : "F"}</td>
                      <td style={{ padding: "14px 20px" }}>{s.classe}</td>
                      <td style={{ padding: "14px 20px" }}>
                        {s.is_affecte_etat ? (
                          <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                            Affecté État
                          </span>
                        ) : (
                          <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>
                            Standard
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#475569" }}>{s.telephone || "-"}</td>
                      <td style={{ padding: "14px 20px" }}>{s.parent_nom_prenom || "-"}</td>
                      <td style={{ padding: "14px 20px", color: "#475569" }}>{s.telephone_parent || "-"}</td>
                      <td className="no-print" style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            title="Modifier l'élève"
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              border: "1px solid #bfdbfe",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            title="Supprimer l'élève"
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditMode ? "Modifier les informations de l'élève" : "Inscrire un nouvel élève"}
      >
        <form onSubmit={handleSubmitStudent} style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: "6px" }}>
          
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Nom *</label>
            <input
              type="text"
              placeholder="Ex : OUEDRAOGO"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Prénom *</label>
            <input
              type="text"
              placeholder="Ex : Ali"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Sexe *</label>
            <select
              value={sexe}
              onChange={(e) => setSexe(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
            >
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Date de naissance</label>
              <input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Lieu de naissance</label>
              <input
                type="text"
                placeholder="Ex : Ouagadougou"
                value={lieuNaissance}
                onChange={(e) => setLieuNaissance(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Classe & Filière *</label>
            <select
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
            >
              <optgroup label="CAP / AP">
                <option value="CAP/AP">CAP/AP</option>
              </optgroup>
              <optgroup label="ÉLECTROTECHNIQUE">
                <option value="CAP 1 - Électrotechnique">CAP 1 - Électrotechnique</option>
                <option value="CAP 2 - Électrotechnique">CAP 2 - Électrotechnique</option>
                <option value="CAP 3 - Électrotechnique">CAP 3 - Électrotechnique</option>
                <option value="BEP 1 - Électrotechnique">BEP 1 - Électrotechnique</option>
                <option value="BEP 2 - Électrotechnique">BEP 2 - Électrotechnique</option>
                <option value="Tle F3 - Électrotechnique">Tle F3 - Électrotechnique</option>
                <option value="BAC-PRO - Électrotechnique">BAC-PRO - Électrotechnique</option>
              </optgroup>
              <optgroup label="ÉLECTRONIQUE">
                <option value="BEP 1 - Électronique">BEP 1 - Électronique</option>
                <option value="BEP 2 - Électronique">BEP 2 - Électronique</option>
                <option value="Tle F2 - Électronique">Tle F2 - Électronique</option>
              </optgroup>
              <optgroup label="GÉNIE CIVIL">
                <option value="CAP 1 - Génie Civil">CAP 1 - Génie Civil</option>
                <option value="CAP 2 - Génie Civil">CAP 2 - Génie Civil</option>
                <option value="CAP 3 - Génie Civil">CAP 3 - Génie Civil</option>
                <option value="BEP 1 - Génie Civil">BEP 1 - Génie Civil</option>
                <option value="BEP 2 - Génie Civil">BEP 2 - Génie Civil</option>
                <option value="TleF4 - Génie Civil">TleF4 - Génie Civil</option>
                <option value="BAC-PRO - Génie Civil">BAC-PRO - Génie Civil</option>
              </optgroup>
              <optgroup label="MÉCANIQUE AUTO (MVA)">
                <option value="CAP 1 - Mécanique Auto (MVA)">CAP 1 - Mécanique Auto (MVA)</option>
                <option value="CAP 2 - Mécanique Auto (MVA)">CAP 2 - Mécanique Auto (MVA)</option>
                <option value="CAP 3 - Mécanique Auto (MVA)">CAP 3 - Mécanique Auto (MVA)</option>
                <option value="BEP 1 - Mécanique Auto (MVA)">BEP 1 - Mécanique Auto (MVA)</option>
                <option value="BEP 2 - Mécanique Auto (MVA)">BEP 2 - Mécanique Auto (MVA)</option>
                <option value="BAC-PRO - Mécanique Auto (MVA)">BAC-PRO - Mécanique Auto (MVA)</option>
              </optgroup>
              <optgroup label="COMPTABILITÉ">
                <option value="BEP 1 / 2nd AB3 - Comptabilité">BEP 1 / 2nd AB3 - Comptabilité</option>
                <option value="BEP 2 - Comptabilité">BEP 2 - Comptabilité</option>
                <option value="TLE G2 - Comptabilité">TLE G2 - Comptabilité</option>
              </optgroup>
              <optgroup label="ENSEIGNEMENT GÉNÉRAL">
                <option value="3ème - Enseignement Général">3ème - Enseignement Général</option>
                <option value="4ème - Enseignement Général">4ème - Enseignement Général</option>
                <option value="5ème - Enseignement Général">5ème - Enseignement Général</option>
                <option value="6ème - Enseignement Général">6ème - Enseignement Général</option>
                <option value="2ND AC - Enseignement Général">2ND AC - Enseignement Général</option>
                <option value="1ère D - Enseignement Général">1ère D - Enseignement Général</option>
                <option value="Tle D - Enseignement Général">Tle D - Enseignement Général</option>
                <option value="1ère A - Enseignement Général">1ère A - Enseignement Général</option>
                <option value="Tle A - Enseignement Général">Tle A - Enseignement Général</option>
              </optgroup>
            </select>
          </div>

          <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
            <input
              type="checkbox"
              id="affecteEtat"
              checked={isAffecteEtat}
              onChange={(e) => setIsAffecteEtat(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="affecteEtat" style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#1e293b" }}>
              Élève affecté de l'État (Appliquer le tarif spécifique)
            </label>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Contact de l'élève</label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#f8fafc" }}>
              <span style={{ padding: "10px 12px", background: "#e2e8f0", fontWeight: "600", fontSize: "13px", color: "#334155", borderRight: "1px solid #cbd5e1" }}>
                +226
              </span>
              <input
                type="tel"
                placeholder="70 00 00 00"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "none", outline: "none", background: "transparent", color: "black" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "14px", borderTop: "1px dashed #cbd5e1", paddingTop: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Nom et Prénom du Parent / Tuteur</label>
            <input
              type="text"
              placeholder="Ex : OUEDRAOGO Paul"
              value={parentNomPrenom}
              onChange={(e) => setParentNomPrenom(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "black" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Contact des parents</label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#f8fafc" }}>
              <span style={{ padding: "10px 12px", background: "#e2e8f0", fontWeight: "600", fontSize: "13px", color: "#334155", borderRight: "1px solid #cbd5e1" }}>
                +226
              </span>
              <input
                type="tel"
                placeholder="78 00 00 00"
                value={parentTelephone}
                onChange={(e) => setParentTelephone(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "none", outline: "none", background: "transparent", color: "black" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer" }}
            >
              {isEditMode ? "Enregistrer les modifications" : "Enregistrer l'élève"}
            </button>
          </div>

        </form>
      </Modal>

      {/* Règles CSS pour masquer les éléments inutiles sur l'impression / PDF */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-padding-reset { padding: 0 !important; }
          body { background: white !important; }
          table { border: 1px solid #cbd5e1 !important; }
          th { background-color: #f1f5f9 !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Users, UserPlus, Shield, AlertCircle } from "lucide-react";

export default function UsersPage() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("secretaire");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Récupérer l'utilisateur connecté pour vérifier son rôle
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setCurrentUserRole(profile?.role);
      }

      // 2. Récupérer la liste de tous les profils
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setUsersList(data || []);
    } catch (err) {
      setErrorMessage("Erreur de chargement : " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Appel de la fonction Edge qu'on vient de déployer
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email, password, full_name: fullName, role },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setSuccessMessage("Utilisateur créé avec succès !");
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("secretaire");
      fetchUsers(); // Rafraîchir la liste
    } catch (err) {
      setErrorMessage("Erreur lors de la création : " + err.message);
    }
  };

  // Sécurité : Si ce n'est pas un admin, on affiche un message d'accès refusé
  if (currentUserRole && currentUserRole !== "admin") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", color: "#dc2626" }}>
            <Shield size={48} style={{ marginBottom: "16px" }} />
            <h2>Accès Refusé</h2>
            <p>Seul un administrateur peut accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header title="Gestion des Utilisateurs" />

        <div style={{ padding: "30px" }}>
          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <AlertCircle size={18} /> {errorMessage}
            </div>
          )}
          {successMessage && (
            <div style={{ background: "#f0fdf4", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
              {successMessage}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Liste des Agents</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2563eb", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}
            >
              <UserPlus size={18} /> Ajouter un utilisateur
            </button>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#2563eb", color: "white", textAlign: "left", fontSize: "14px" }}>
                  <th style={{ padding: "14px 20px" }}>Nom Complet</th>
                  <th style={{ padding: "14px 20px" }}>Rôle</th>
                  <th style={{ padding: "14px 20px" }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center" }}>Chargement...</td></tr>
                ) : usersList.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center" }}>Aucun utilisateur trouvé.</td></tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                      <td style={{ padding: "14px 20px", fontWeight: "600" }}>{u.full_name || "Sans nom"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "700", background: u.role === "admin" ? "#fee2e2" : u.role === "comptable" ? "#dbeafe" : "#f1f5f9", color: u.role === "admin" ? "#991b1b" : u.role === "comptable" ? "#1e40af" : "#334155" }}>
                          {u.role?.toUpperCase() || "SECRETAIRE"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#64748b", fontSize: "12px" }}>{u.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un nouvel agent">
        <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Nom complet *</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Mot de passe * (min. 6 caractères)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Rôle *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <option value="secretaire">Secrétaire (Élèves, Bulletins, Professeurs)</option>
              <option value="comptable">Comptable (Paiements, Inscriptions)</option>
              <option value="admin">Administrateur (Accès Total)</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Annuler</button>
            <button type="submit" style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer" }}>Créer l'utilisateur</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
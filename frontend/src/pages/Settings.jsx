import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  UserPlus, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Mail, 
  User,
  Settings as SettingsIcon,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users_list");
  
  // États pour la création de compte
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("secretaire");
  
  // États d'interface
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Liste des utilisateurs
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Charger la liste des utilisateurs depuis la table 'profiles'
  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProfiles(data);
    } catch (err) {
      console.error("Erreur de chargement des profils :", err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Fonction pour créer un nouvel agent
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      // 1. Création de l'utilisateur dans Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // 2. Sécurité : Mise à jour explicite du rôle dans la table profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert([{
            id: data.user.id,
            full_name: fullName,
            role: role
          }]);

        if (profileError) console.warn("Note profils :", profileError.message);

        setMessage(`Le compte pour "${fullName}" (${role.toUpperCase()}) a été créé avec succès !`);
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("secretaire");
        
        // Recharger la liste des utilisateurs
        fetchProfiles();
      }
    } catch (err) {
      setErrorMessage("Erreur lors de la création du compte : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header title="Paramètres & Gestion des Comptes" />

        <div style={{ padding: "30px", maxWidth: "1100px" }}>
          
          {/* Navigation par onglets */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
            <button
              onClick={() => setActiveTab("users_list")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                background: activeTab === "users_list" ? "#2563eb" : "white",
                color: activeTab === "users_list" ? "white" : "#64748b"
              }}
            >
              <Users size={18} /> Utilisateurs Registrés ({profiles.length})
            </button>

            <button
              onClick={() => setActiveTab("add_user")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                background: activeTab === "add_user" ? "#2563eb" : "white",
                color: activeTab === "add_user" ? "white" : "#64748b"
              }}
            >
              <UserPlus size={18} /> Créer un Nouvel Agent
            </button>
          </div>

          {/* ONGLET 1 : Liste des utilisateurs */}
          {activeTab === "users_list" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Comptes Agents de l'Établissement</h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Liste des accès enregistrés avec leurs permissions respectives.
                  </p>
                </div>
                <button 
                  onClick={fetchProfiles} 
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid #cbd5e1", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                >
                  <RefreshCw size={14} /> Actualiser
                </button>
              </div>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#334155", textAlign: "left", fontSize: "13px", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 20px" }}>Nom & Prénom</th>
                      <th style={{ padding: "14px 20px" }}>Rôle & Privilèges</th>
                      <th style={{ padding: "14px 20px" }}>Date de Création</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProfiles ? (
                      <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Chargement des profils...</td></tr>
                    ) : profiles.length === 0 ? (
                      <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Aucun profil enregistré dans la table.</td></tr>
                    ) : (
                      profiles.map((p) => {
                        const isRoleAdmin = p.role === "admin";
                        const isRoleComptable = p.role === "comptable";
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                            <td style={{ padding: "14px 20px", fontWeight: "600", color: "#1e293b" }}>
                              {p.full_name || "Agent sans nom"}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "700",
                                background: isRoleAdmin ? "#fef3c7" : isRoleComptable ? "#dcfce7" : "#eff6ff",
                                color: isRoleAdmin ? "#92400e" : isRoleComptable ? "#166534" : "#1e40af"
                              }}>
                                {isRoleAdmin ? "🛡️ Administrateur" : isRoleComptable ? "💰 Comptable" : "📋 Secrétaire"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 20px", color: "#64748b", fontSize: "13px" }}>
                              {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET 2 : Formulaire de création */}
          {activeTab === "add_user" && (
            <div style={{ background: "white", padding: "28px", borderRadius: "12px", border: "1px solid #e2e8f0", maxWidth: "560px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Créer un Compte d'Accès</h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  Renseignez les identifiants pour autoriser un membre du personnel.
                </p>
              </div>

              {message && (
                <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                  <CheckCircle size={18} />
                  <span>{message}</span>
                </div>
              )}

              {errorMessage && (
                <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Nom & Prénom *</label>
                  <div style={{ position: "relative" }}>
                    <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      required
                      placeholder="Ex : Moussa Ouédraogo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Adresse E-mail *</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      required
                      placeholder="agent@bethel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Mot de passe initial *</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#334155" }}>Rôle & Niveau d'Accès *</label>
                  <div style={{ position: "relative" }}>
                    <ShieldCheck size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", background: "white", boxSizing: "border-box" }}
                    >
                      <option value="secretaire">📋 Secrétaire (Inscriptions & Consultations)</option>
                      <option value="comptable">💰 Comptable (Saisie des versements & Reçus)</option>
                      <option value="admin">🛡️ Administrateur (Accès Total, Annulations, Audit)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? "Création du compte..." : "Enregistrer le compte agent"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
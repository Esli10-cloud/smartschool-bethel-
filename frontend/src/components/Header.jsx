import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import AISearchBar from "./AISearchBar";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const today = new Date();
  const date = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div
      style={{
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        borderBottom: "1px solid #e5e7eb",
        position: "relative",
        gap: "20px"
      }}
    >
      {/* Titre et Date */}
      <div>
        <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        <small>{date}</small>
      </div>

      {/* Barre de Recherche IA intégrée au centre */}
      <div style={{ flex: 1, maxWidth: "500px" }}>
        <AISearchBar />
      </div>

      {/* Bouton du rôle avec menu déroulant */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Administrateur ▾
        </button>

        {/* Menu de déconnexion */}
        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "45px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "5px 0",
              zIndex: 100,
              minWidth: "180px",
              whiteSpace: "nowrap",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "none",
                background: "transparent",
                color: "#dc2626",
                textAlign: "left",
                cursor: "pointer",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}
            >
              🚪 Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
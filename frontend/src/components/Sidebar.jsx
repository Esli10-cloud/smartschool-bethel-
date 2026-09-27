import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  BookOpen,
  Settings,
  UserCog,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  // Récupération du rôle de l'utilisateur connecté
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (data) {
          setUserRole(data.role);
        } else if (error) {
          console.error("Erreur de récupération du rôle:", error);
        }
      }
    };
    fetchUserRole();
  }, []);

  // Définition des menus avec les rôles autorisés
  const menus = [
    { 
      title: "Tableau de bord", 
      path: "/dashboard", 
      icon: LayoutDashboard, 
      roles: ["admin", "comptable", "secretaire"] 
    },
    { 
      title: "Élèves", 
      path: "/students", 
      icon: Users, 
      roles: ["admin", "comptable", "secretaire"] 
    },
    { 
      title: "Enseignants", 
      path: "/teachers", 
      icon: GraduationCap, 
      roles: ["admin", "secretaire"] 
    },
    { 
      title: "Comptabilité", 
      path: "/payments", 
      icon: Wallet, 
      roles: ["admin", "comptable"] 
    },
    { 
      title: "Notes", 
      path: "/grades", 
      icon: BookOpen, 
      roles: ["admin", "secretaire"] 
    },
    { 
      title: "Paramètres", 
      path: "/settings", 
      icon: Settings, 
      roles: ["admin"] 
    },
    // Nouveau menu pour la gestion des utilisateurs (Admin uniquement)
    { 
      title: "Gestion Utilisateurs", 
      path: "/users", 
      icon: UserCog, 
      roles: ["admin"] 
    },
  ];

  // Filtrage des menus selon le rôle (si le rôle n'est pas encore chargé, on n'affiche rien pour éviter le clignotement)
  const filteredMenus = menus.filter((menu) => {
    if (!userRole) return false; // Ne rien afficher tant que le rôle n'est pas chargé
    return menu.roles.includes(userRole);
  });

  return (
    <div
      style={{
        width: 250,
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2>🏫 SmartSchool</h2>
      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Lycée Technique Bethel</p>

      <div style={{ marginTop: 30, flex: 1 }}>
        {filteredMenus.map((menu) => {
          const Icon = menu.icon;
          const isActive = location.pathname === menu.path;

          return (
            <Link
              key={menu.path}
              to={menu.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "white",
                padding: 12,
                borderRadius: 10,
                marginBottom: 8,
                background: isActive ? "#2563eb" : "transparent",
                transition: "background 0.2s",
              }}
            >
              <Icon size={20} />
              {menu.title}
            </Link>
          );
        })}
      </div>
      
      {/* Petit indicateur de rôle en bas */}
      {userRole && (
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #1e293b" }}>
          Connecté en tant que : <strong style={{ color: "#94a3b8", textTransform: "capitalize" }}>{userRole}</strong>
        </div>
      )}
    </div>
  );
}
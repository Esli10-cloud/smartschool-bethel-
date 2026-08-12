import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  BookOpen,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menus = [
    { title: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
    { title: "Élèves", path: "/students", icon: Users },
    { title: "Enseignants", path: "/teachers", icon: GraduationCap },
    { title: "Comptabilité", path: "/payments", icon: Wallet },
    { title: "Notes", path: "/grades", icon: BookOpen },
    { title: "Paramètres", path: "/settings", icon: Settings },
  ];

  return (
    <div
      style={{
        width: 250,
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <h2>🏫 SmartSchool</h2>
      <p>Lycée Technique Bethel</p>

      <div style={{ marginTop: 30 }}>
        {menus.map((menu) => {
          const Icon = menu.icon;

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
                background:
                  location.pathname === menu.path
                    ? "#2563eb"
                    : "transparent",
              }}
            >
              <Icon size={20} />
              {menu.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
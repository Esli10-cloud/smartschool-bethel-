import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
      <Search
        size={18}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
        }}
      />
      <input
        type="text"
        placeholder="Rechercher un élève par nom, prénom ou matricule..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 10px 10px 40px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </div>
  );
}
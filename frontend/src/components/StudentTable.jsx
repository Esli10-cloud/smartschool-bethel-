import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function StudentTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("nom");

    if (!error) {
      setStudents(data);
    }
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "30px",
        background: "white",
      }}
    >
      <thead>
        <tr style={{ background: "#2563eb", color: "white" }}>
          <th>Matricule</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Classe</th>
          <th>Filière</th>
        </tr>
      </thead>

      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.matricule}</td>
            <td>{student.nom}</td>
            <td>{student.prenom}</td>
            <td>{student.classe}</td>
            <td>{student.filiere}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
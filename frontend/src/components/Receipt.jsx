import React from "react";
import { Printer } from "lucide-react";
import { SCHOOL_FEES_GRID, EXTRA_FEES } from "../services/paymentService";

export default function Receipt({ payment, paymentsList = [], onClose }) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = payment.students || {};

  // Recherche de la grille tarifaire pour la classe de l'élève
  const getFeeInfo = (studentClass) => {
    if (!studentClass) return null;
    if (SCHOOL_FEES_GRID[studentClass]) return SCHOOL_FEES_GRID[studentClass];
    const foundKey = Object.keys(SCHOOL_FEES_GRID).find((key) =>
      key.toLowerCase().includes(studentClass.toLowerCase())
    );
    return foundKey ? SCHOOL_FEES_GRID[foundKey] : null;
  };

  const studentFeeInfo = getFeeInfo(student.classe);

  // Total de la scolarité due (+ droits d'inscription 5 000 CFA)
  const totalDue = studentFeeInfo ? studentFeeInfo.total + EXTRA_FEES.INSCRIPTION_FEE : 0;

  // Cumul total payé par l'élève à ce jour
  const totalPaidByStudent = paymentsList
    .filter((p) => String(p.student_id) === String(payment.student_id))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Reste net à payer
  const remainingAmount = Math.max(0, totalDue - totalPaidByStudent);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "520px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
              .no-print { display: none !important; }
            }
          `}
        </style>

        {/* Zone Imprimable */}
        <div id="printable-receipt" style={{ border: "2px dashed #cbd5e1", padding: "24px", borderRadius: "8px" }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", textTransform: "uppercase", color: "#0f172a" }}>Lycée Technique Bethel</h2>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b" }}>Discipline - Travail - Succès</p>
            <h3 style={{ margin: "10px 0 0", fontSize: "16px", color: "#16a34a" }}>
              REÇU DE PAIEMENT N° {payment.id ? String(payment.id).substring(0, 8) : "001"}
            </h3>
          </div>

          <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#334155", marginBottom: "16px" }}>
            <div><strong>Date :</strong> {new Date(payment.created_at || Date.now()).toLocaleDateString("fr-FR")}</div>
            <div><strong>Matricule :</strong> {student.matricule || "N/A"}</div>
            <div><strong>Nom & Prénom :</strong> {student.nom} {student.prenom}</div>
            <div><strong>Classe / Filière :</strong> {student.classe || "N/A"}</div>
            <div><strong>Mode de Règlement :</strong> {payment.payment_method || "Espèces"}</div>
          </div>

          {/* Tableau récapitulatif avec le RESTANT À PAYER */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "16px" }}>
            <tbody>
              <tr style={{ borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px 0", color: "#64748b" }}>Montant versé ce jour :</td>
                <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "bold", color: "#16a34a", fontSize: "15px" }}>
                  {payment.amount ? Number(payment.amount).toLocaleString() : 0} CFA
                </td>
              </tr>
              {totalDue > 0 && (
                <>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 0", color: "#64748b" }}>Total Scolarité (Frais inclus) :</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontWeight: "600" }}>
                      {totalDue.toLocaleString()} CFA
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 0", color: "#64748b" }}>Cumul total payé à ce jour :</td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontWeight: "600", color: "#2563eb" }}>
                      {totalPaidByStudent.toLocaleString()} CFA
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid #0f172a", background: "#fef2f2" }}>
                    <td style={{ padding: "10px 8px", fontWeight: "bold", color: "#dc2626" }}>RESTE À PAYER :</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "bold", color: "#dc2626", fontSize: "15px" }}>
                      {remainingAmount.toLocaleString()} CFA
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", fontSize: "12px", color: "#64748b" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0 }}>La Caisse</p>
              <div style={{ height: "40px" }}></div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0 }}>L'Élève / Le Tuteur</p>
              <div style={{ height: "40px" }}></div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Printer size={16} /> Imprimer le Reçu
          </button>
        </div>
      </div>
    </div>
  );
}
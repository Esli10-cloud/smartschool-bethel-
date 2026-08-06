import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { 
  Plus, 
  Printer, 
  Search, 
  BarChart3, 
  DollarSign, 
  FileSpreadsheet, 
  AlertCircle, 
  ShieldCheck, 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Calendar,
  XCircle,
  Ban,
  LogOut,
  AlertTriangle
} from "lucide-react";

// Configuration centralisée de l'établissement
const SCHOOL_CONFIG = {
  name: "LYCÉE TECHNIQUE BETHEL",
  subTitle: "ENSEIGNEMENT TECHNIQUE INDUSTRIEL ET COMMERCIAL",
  motto: "LE TEMPLE DU SAVOIR",
  address: "06 BP 9047 Ouagadougou 06",
  phone: "+(226) 06 71 73 73 / 70 16 66 97",
  email: "ltbethel@yahoo.fr",
  logoUrl: "/logo.jpeg"
};

const EXTRA_FEES = {
  INSCRIPTION_FEE: 5000,
  PAPER_RAME_FEE: 3500,
};

const formatNomPrenom = (nom = "", prenom = "") => {
  const nomFormatted = nom.trim().toUpperCase();
  const prenomFormatted = prenom
    .trim()
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  return { nomFormatted, prenomFormatted };
};

export default function Payments() {
  const [activeTab, setActiveTab] = useState("historique");
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Année scolaire active : 2026-2027 par défaut
  const [academicYear, setAcademicYear] = useState("2026-2027");

  // --- AUTHENTIFICATION RÉELLE (Supabase Auth + table "profiles") ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async (session) => {
      const user = session?.user;
      if (!user) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setCurrentUser({ id: user.id, nom: user.email, role: "secretaire" });
      } else {
        setCurrentUser({
          id: user.id,
          nom: profile.full_name || user.email,
          role: profile.role || "secretaire",
        });
      }
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadCurrentUser(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthLoading(true);
      loadCurrentUser(session);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // Recherche & Filtres Historique
  const [searchTermHistory, setSearchTermHistory] = useState("");
  const [filterClassHistory, setFilterClassHistory] = useState("Tous");
  const [filterPeriodHistory, setFilterPeriodHistory] = useState("tous");

  // Pagination
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [currentPageImpayes, setCurrentPageImpayes] = useState(1);
  const [currentPageExonerations, setCurrentPageExonerations] = useState(1);
  const itemsPerPage = 10;

  // Recherche & Filtres Impayés
  const [searchTermStudent, setSearchTermStudent] = useState("");
  const [searchTermImpayes, setSearchTermImpayes] = useState("");
  const [filterClassImpayes, setFilterClassImpayes] = useState("Tous");
  const [caisseDate, setCaisseDate] = useState(new Date().toISOString().split('T')[0]);

  // Modaux
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentToCancel, setPaymentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Formulaire de paiement
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Espèces");
  const [payInscription, setPayInscription] = useState(true);
  const [payPaperRame, setPayPaperRame] = useState(false);
  const [paymentNote, setPaymentNote] = useState("");

  // Remises & bourses
  const [customReductions, setCustomReductions] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: stData, error: stErr } = await supabase
        .from("students")
        .select("id, matricule, nom, prenom, classe, is_affecte_etat, created_at");

      if (stErr) throw stErr;

      const { data: payData, error: payErr } = await supabase
        .from("payments")
        .select(`
          *,
          students(
            id,
            matricule,
            nom,
            prenom,
            classe,
            is_affecte_etat,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (payErr) throw payErr;

      const { data: logData, error: logErr } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logErr) throw logErr;

      if (stData) setStudents(stData);
      if (payData) setPayments(payData);
      if (logData) setAuditLogs(logData);
    } catch (err) {
      console.error("Erreur de chargement Supabase :", err);
      setErrorMessage("Impossible de charger les données depuis le serveur. Vérifiez votre connexion internet.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recordAuditLog = async (actionType, detailsText) => {
    if (!currentUser) return;
    try {
      await supabase.from("audit_logs").insert([{
        user_name: currentUser.nom,
        role: currentUser.role,
        action: actionType,
        details: detailsText
      }]);
      fetchData();
    } catch (e) {
      console.error("Erreur log d'audit :", e);
    }
  };

  const selectedStudent = students.find(
    (s) => String(s.id) === String(selectedStudentId)
  );

  const checkIsAffected = (student) => student?.is_affecte_etat === true;

  const getFeeDetails = (student) => {
    if (!student || !student.classe) return { tr1: 100000, tr2: 25000, tr3: 25000, total: 150000, baseTotal: 150000, reduction: 0 };
    const cls = student.classe.toUpperCase();
    const isAffected = checkIsAffected(student);

    let baseTotal = 150000;
    let tr1 = 100000, tr2 = 25000, tr3 = 25000;

    if (isAffected) {
      if (cls.includes("ACC") || cls.includes("COMPTA") || cls.includes("AB3") || cls.includes("G2")) {
        tr1 = 40000; tr2 = 20000; tr3 = 20000; baseTotal = 80000;
      } else if (cls.includes("CAP") || cls.includes("AP")) {
        tr1 = 50000; tr2 = 25000; tr3 = 25000; baseTotal = 100000;
      } else if (cls.includes("GÉNIE CIVIL") || cls.includes("GENIE CIVIL") || cls.includes("F4")) {
        tr1 = 80000; tr2 = 30000; tr3 = 30000; baseTotal = 140000;
      } else {
        tr1 = 50000; tr2 = 25000; tr3 = 25000; baseTotal = 100000;
      }
    } else {
      if (cls.includes("CAP") || cls.includes("AP")) { 
        tr1 = 100000; tr2 = 25000; tr3 = 25000; baseTotal = 150000; 
      } else if (cls.includes("TF2") || cls.includes("F3")) { 
        tr1 = 100000; tr2 = 35000; tr3 = 30000; baseTotal = 165000; 
      } else if (cls.includes("GÉNIE CIVIL") || cls.includes("GENIE CIVIL") || cls.includes("F4")) {
        if (cls.includes("TLE")) { tr1 = 110000; tr2 = 50000; tr3 = 50000; baseTotal = 210000; }
        else if (cls.includes("BAC-PRO") || cls.includes("BAC PRO")) { tr1 = 140000; tr2 = 40000; tr3 = 40000; baseTotal = 220000; }
        else { tr1 = 100000; tr2 = 50000; tr3 = 50000; baseTotal = 200000; }
      } else if (cls.includes("BAC-PRO") || cls.includes("BAC PRO") || cls.includes("ÉLECTRO") || cls.includes("ELECTRO")) { 
        tr1 = 140000; tr2 = 40000; tr3 = 40000; baseTotal = 220000; 
      } else if (cls.includes("COMPTABILITÉ") || cls.includes("COMPTABILITE") || cls.includes("G2") || cls.includes("AB3") || cls.includes("ACC")) {
        if (cls.includes("BEP 2") || cls.includes("BEP2")) { tr1 = 50000; tr2 = 30000; tr3 = 30000; baseTotal = 110000; }
        else { tr1 = 50000; tr2 = 25000; tr3 = 25000; baseTotal = 100000; }
      } else if (cls.includes("3ÈME") || cls.includes("3EME")) { 
        tr1 = 50000; tr2 = 20000; tr3 = 20000; baseTotal = 90000; 
      } else if (cls.includes("4ÈME") || cls.includes("4EME")) { 
        tr1 = 40000; tr2 = 20000; tr3 = 20000; baseTotal = 80000; 
      } else if (cls.includes("5ÈME") || cls.includes("5EME") || cls.includes("6ÈME") || cls.includes("6EME")) { 
        tr1 = 35000; tr2 = 20000; tr3 = 15000; baseTotal = 70000; 
      }
    }

    const reduction = customReductions[student.id] || 0;
    const finalTotal = Math.max(0, baseTotal - reduction);

    return { tr1, tr2, tr3, total: finalTotal, baseTotal, reduction };
  };

  const fees = selectedStudent ? getFeeDetails(selectedStudent) : { tr1: 0, tr2: 0, tr3: 0, total: 0, baseTotal: 0, reduction: 0 };
  const totalInscription = payInscription ? EXTRA_FEES.INSCRIPTION_FEE : 0;
  const totalRame = payPaperRame ? EXTRA_FEES.PAPER_RAME_FEE : 0;
  const totalAttendu = fees.total + totalInscription + totalRame;

  const activeStudentPayments = payments.filter(
    (p) => String(p.student_id) === String(selectedStudentId) && 
           !p.is_cancelled && 
           (p.academic_year ? p.academic_year === academicYear : true)
  );

  const totalDejaPaye = activeStudentPayments.reduce(
    (sum, p) => sum + parseInt(p.amount || p.montant || 0, 10),
    0
  );

  const resteActuelAvantPaiement = Math.max(0, totalAttendu - totalDejaPaye);
  const versementActuel = parseInt(amount, 10) || 0;
  const nouveauCumul = totalDejaPaye + versementActuel;
  const resteAPayer = Math.max(0, totalAttendu - nouveauCumul);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "comptable")) {
      setErrorMessage("Vous n'avez pas les droits nécessaires pour enregistrer un versement.");
      return;
    }
    if (!selectedStudentId || versementActuel <= 0) {
      alert("Veuillez sélectionner un élève et saisir un montant valide.");
      return;
    }

    if (versementActuel > resteActuelAvantPaiement) {
      const confirmOverpay = window.confirm(
        `Attention : Le montant saisi (${versementActuel.toLocaleString()} CFA) dépasse le reste à payer de l'élève (${resteActuelAvantPaiement.toLocaleString()} CFA). Voulez-vous continuer ?`
      );
      if (!confirmOverpay) return;
    }

    const newPaymentObj = {
      student_id: selectedStudentId,
      amount: versementActuel,
      mode: paymentMode,
      academic_year: academicYear,
      is_cancelled: false,
      total_exigible: totalAttendu,
      cumul_paye: nouveauCumul,
      reste_a_payer: resteAPayer,
      paye_inscription: payInscription,
      paye_rame: payPaperRame,
      notes: paymentNote,
    };

    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([newPaymentObj])
        .select("*, students(*)");

      if (error) throw error;

      if (data) {
        setIsModalOpen(false);
        setSelectedReceipt(data[0]);
        setReceiptModalOpen(true);
        setAmount("");
        setSelectedStudentId("");
        setSearchTermStudent("");
        setPaymentNote("");
        
        await recordAuditLog(
          "NOUVEAU_VERSEMENT", 
          `Encaissement de ${versementActuel.toLocaleString()} CFA (N° Transaction ${data[0].id}) pour l'élève ID ${selectedStudentId} [Année: ${academicYear}]`
        );

        fetchData();
      }
    } catch (error) {
      setErrorMessage("Erreur lors de l'enregistrement du paiement : " + error.message);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentToCancel || currentUser.role !== "admin") return;
    if (!cancelReason.trim()) {
      alert("Veuillez saisir un motif d'annulation obligatoirement.");
      return;
    }

    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          is_cancelled: true, 
          cancel_reason: cancelReason,
          cancelled_by: currentUser.nom,
          cancelled_at: new Date().toISOString()
        })
        .eq("id", paymentToCancel.id);

      if (error) throw error;

      await recordAuditLog(
        "ANNULATION_VERSEMENT", 
        `Annulation du reçu/transaction N° ${paymentToCancel.id} d'un montant de ${(paymentToCancel.amount || 0).toLocaleString()} CFA. Motif : ${cancelReason}`
      );

      setCancelModalOpen(false);
      setPaymentToCancel(null);
      setCancelReason("");
      fetchData();
    } catch (err) {
      setErrorMessage("Erreur lors de l'annulation du versement : " + err.message);
    }
  };

  const openReceipt = (payment) => {
    setSelectedReceipt(payment);
    setReceiptModalOpen(true);
  };

  const exportToCSV = () => {
    const headers = ["N° Transaction", "Date", "Statut", "Matricule", "Nom", "Prenom", "Classe", "Mode", "Montant", "Notes"];
    const rows = filteredPayments.map(p => {
      const { nomFormatted, prenomFormatted } = formatNomPrenom(p.students?.nom, p.students?.prenom);
      return [
        p.id,
        p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
        p.is_cancelled ? "ANNULÉ" : "VALIDE",
        p.students?.matricule || "",
        nomFormatted,
        prenomFormatted,
        p.students?.classe || "",
        p.mode || "Espèces",
        p.amount || p.montant || 0,
        `"${(p.notes || "").replace(/"/g, '""')}"`
      ];
    });

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historique_versements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classesList = ["Tous", ...new Set(students.map(s => s.classe).filter(Boolean))];

  const filteredPayments = payments.filter((p) => {
    const search = searchTermHistory.toLowerCase();
    const nom = p.students?.nom?.toLowerCase() || "";
    const prenom = p.students?.prenom?.toLowerCase() || "";
    const matricule = p.students?.matricule?.toLowerCase() || "";
    const matchSearch = nom.includes(search) || prenom.includes(search) || matricule.includes(search);

    const matchClass = filterClassHistory === "Tous" || p.students?.classe === filterClassHistory;

    let matchPeriod = true;
    if (p.created_at) {
      const pDate = new Date(p.created_at);
      const today = new Date();
      if (filterPeriodHistory === "aujourdhui") {
        matchPeriod = pDate.toDateString() === today.toDateString();
      } else if (filterPeriodHistory === "mois") {
        matchPeriod = pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
      } else if (filterPeriodHistory === "annee") {
        matchPeriod = pDate.getFullYear() === today.getFullYear();
      }
    }

    return matchSearch && matchClass && matchPeriod;
  });

  const totalPagesHistory = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const currentDisplayedPayments = filteredPayments.slice((currentPageHistory - 1) * itemsPerPage, currentPageHistory * itemsPerPage);

  const totalFilteredAmount = filteredPayments
    .filter(p => !p.is_cancelled)
    .reduce((sum, p) => sum + parseInt(p.amount || p.montant || 0, 10), 0);

  const totalEncaisseGlobal = payments
    .filter(p => !p.is_cancelled)
    .reduce((sum, p) => sum + parseInt(p.amount || p.montant || 0, 10), 0);

  const statsParMode = payments
    .filter(p => !p.is_cancelled)
    .reduce((acc, p) => {
      const m = p.mode || "Espèces";
      acc[m] = (acc[m] || 0) + parseInt(p.amount || p.montant || 0, 10);
      return acc;
    }, {});

  const studentsStatusMap = students.map(st => {
    const stPays = payments.filter(p =>
      String(p.student_id) === String(st.id) &&
      !p.is_cancelled &&
      (p.academic_year ? p.academic_year === academicYear : true)
    );
    const totalPaye = stPays.reduce((sum, p) => sum + parseInt(p.amount || p.montant || 0, 10), 0);
    const fDetails = getFeeDetails(st);
    const totalExigibleSt = fDetails.total + EXTRA_FEES.INSCRIPTION_FEE;
    const reste = Math.max(0, totalExigibleSt - totalPaye);
    return { ...st, totalPaye, totalExigibleSt, reste };
  });

  const listeImpayes = studentsStatusMap.filter(s => s.reste > 0);
  const totalImpayesGlobal = listeImpayes.reduce((sum, s) => sum + s.reste, 0);

  const filteredImpayes = listeImpayes.filter(s => {
    const matchClass = filterClassImpayes === "Tous" || s.classe === filterClassImpayes;
    const search = searchTermImpayes.toLowerCase();
    return matchClass && ((s.nom?.toLowerCase() || "").includes(search) || 
                          (s.prenom?.toLowerCase() || "").includes(search) || 
                          (s.matricule?.toLowerCase() || "").includes(search));
  });

  const totalPagesImpayes = Math.ceil(filteredImpayes.length / itemsPerPage) || 1;
  const currentDisplayedImpayes = filteredImpayes.slice((currentPageImpayes - 1) * itemsPerPage, currentPageImpayes * itemsPerPage);

  const totalPagesExonerations = Math.ceil(students.length / itemsPerPage) || 1;
  const currentDisplayedExonerations = students.slice((currentPageExonerations - 1) * itemsPerPage, currentPageExonerations * itemsPerPage);

  const paymentsDuJour = payments.filter(p => p.created_at && p.created_at.startsWith(caisseDate) && !p.is_cancelled);
  const totalCaisseJour = paymentsDuJour.reduce((sum, p) => sum + parseInt(p.amount || p.montant || 0, 10), 0);

  const filteredStudents = students.filter((s) => {
    const search = searchTermStudent.toLowerCase();
    return (s.nom?.toLowerCase() || "").includes(search) || 
           (s.prenom?.toLowerCase() || "").includes(search) || 
           (s.matricule?.toLowerCase() || "").includes(search);
  });

  const OfficialHeader = () => (
    <div style={{ borderBottom: "2px solid #b45309", paddingBottom: "10px", marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: "1 1 40%" }}>
          <h1 style={{ margin: 0, fontSize: "13px", fontWeight: "900", color: "#b45309", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {SCHOOL_CONFIG.name}
          </h1>
          <div style={{ fontSize: "8px", fontWeight: "700", color: "#1e293b", marginTop: "3px", lineHeight: "1.2" }}>
            {SCHOOL_CONFIG.subTitle}
          </div>
          <div style={{ fontSize: "9px", fontWeight: "800", color: "#2563eb", marginTop: "3px", fontStyle: "italic" }}>
            {SCHOOL_CONFIG.motto}
          </div>
        </div>
        <div style={{ flex: "0 0 55px", textAlign: "center" }}>
          <img src={SCHOOL_CONFIG.logoUrl} alt="Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
        </div>
        <div style={{ flex: "1 1 40%", textAlign: "right", fontSize: "8.5px", color: "#334155", lineHeight: "1.4" }}>
          <div><strong>Adresse :</strong> {SCHOOL_CONFIG.address}</div>
          <div><strong>Tél :</strong> {SCHOOL_CONFIG.phone}</div>
          <div><strong>E-mail :</strong> {SCHOOL_CONFIG.email}</div>
        </div>
      </div>
    </div>
  );

  // --- Écrans de garde liés à l'authentification ---
  if (authLoading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Vérification de la session...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px", color: "#334155" }}>
        <AlertTriangle size={32} color="#dc2626" />
        <div style={{ fontWeight: "700" }}>Vous devez être connecté pour accéder à la comptabilité.</div>
        <div style={{ fontSize: "13px", color: "#64748b" }}>Connectez-vous via la page de connexion de l'application.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Styles globaux pour forcer l'impression correcte */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #receipt-a5, #receipt-a5 *,
          #caisse-print, #caisse-print *,
          #impayes-print, #impayes-print * {
            visibility: visible;
          }
          #receipt-a5 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #caisse-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #impayes-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header title="Comptabilité & Gestion Financière" />

        <div style={{ padding: "30px" }}>

          {errorMessage && (
            <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer" }}><XCircle size={18} /></button>
            </div>
          )}
          
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setActiveTab("historique")}
                style={{
                  padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                  background: activeTab === "historique" ? "#2563eb" : "white",
                  color: activeTab === "historique" ? "white" : "#64748b"
                }}
              >
                📋 Historique & Versements
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                  background: activeTab === "dashboard" ? "#2563eb" : "white",
                  color: activeTab === "dashboard" ? "white" : "#64748b"
                }}
              >
                <BarChart3 size={16} /> Tableau de Bord
              </button>
              <button
                onClick={() => setActiveTab("impayes")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                  background: activeTab === "impayes" ? "#2563eb" : "white",
                  color: activeTab === "impayes" ? "white" : "#64748b"
                }}
              >
                <AlertCircle size={16} /> Impayés ({listeImpayes.length})
              </button>
              <button
                onClick={() => setActiveTab("exonerations")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                  background: activeTab === "exonerations" ? "#2563eb" : "white",
                  color: activeTab === "exonerations" ? "white" : "#64748b"
                }}
              >
                <ShieldCheck size={16} /> Bourses & Exonérations
              </button>
              <button
                onClick={() => setActiveTab("caisse")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                  background: activeTab === "caisse" ? "#2563eb" : "white",
                  color: activeTab === "caisse" ? "white" : "#64748b"
                }}
              >
                <DollarSign size={16} /> Clôture de Caisse
              </button>

              {currentUser.role === "admin" && (
                <button
                  onClick={() => setActiveTab("audit")}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer",
                    background: activeTab === "audit" ? "#7c3aed" : "white",
                    color: activeTab === "audit" ? "white" : "#7c3aed"
                  }}
                >
                  <ClipboardList size={16} /> Journal d'Audit
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ background: "#eff6ff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <strong style={{ color: "#1e40af" }}>Année Scolaire :</strong>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ background: "transparent", border: "none", fontWeight: "700", cursor: "pointer", color: "#1e40af" }}>
                  <option value="2026-2027">2026 - 2027 (Nouvelle Année)</option>
                  <option value="2025-2026">2025 - 2026</option>
                </select>
              </div>

              <div style={{ background: "#eff6ff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
                <span style={{ fontWeight: "700", color: "#1e40af" }}>
                  {currentUser.nom} · {currentUser.role === "admin" ? "Administrateur" : currentUser.role === "comptable" ? "Comptable" : "Secrétaire"}
                </span>
                <button
                  onClick={handleLogout}
                  title="Se déconnecter"
                  style={{ display: "flex", alignItems: "center", gap: "4px", background: "white", border: "1px solid #93c5fd", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#1e40af", fontWeight: "600" }}
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            </div>
          </div>

          {activeTab === "historique" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <h2>Historique des Encaissements</h2>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={exportToCSV} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#16a34a", color: "white", padding: "10px 14px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}>
                    <FileSpreadsheet size={16} /> Exporter Excel
                  </button>

                  {(currentUser.role === "admin" || currentUser.role === "comptable") && (
                    <button
                      onClick={() => {
                        setSelectedStudentId("");
                        setSearchTermStudent("");
                        setIsModalOpen(true);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2563eb", color: "white", padding: "10px 18px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}
                    >
                      <Plus size={18} /> Nouveau Versement
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
                  <div style={{ position: "relative", minWidth: "220px" }}>
                    <Search size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Rechercher élève ou reçu..."
                      value={searchTermHistory}
                      onChange={(e) => { setSearchTermHistory(e.target.value); setCurrentPageHistory(1); }}
                      style={{ width: "100%", padding: "8px 10px 8px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Filter size={16} style={{ color: "#64748b" }} />
                    <select
                      value={filterClassHistory}
                      onChange={(e) => { setFilterClassHistory(e.target.value); setCurrentPageHistory(1); }}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                    >
                      {classesList.map(c => <option key={c} value={c}>Classe : {c}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={16} style={{ color: "#64748b" }} />
                    <select
                      value={filterPeriodHistory}
                      onChange={(e) => { setFilterPeriodHistory(e.target.value); setCurrentPageHistory(1); }}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                    >
                      <option value="tous">Période : Tout l'historique</option>
                      <option value="aujourdhui">Aujourd'hui uniquement</option>
                      <option value="mois">Mois en cours</option>
                      <option value="annee">Année en cours</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: "#f1f5f9", padding: "6px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", color: "#334155" }}>
                  <span>Résultats : <strong>{filteredPayments.length}</strong> | Total Encaissé : <strong style={{ color: "#16a34a" }}>{totalFilteredAmount.toLocaleString()} CFA</strong></span>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#2563eb", color: "white", textAlign: "left", fontSize: "14px" }}>
                      <th style={{ padding: "14px 20px" }}>N° Trans.</th>
                      <th style={{ padding: "14px 20px" }}>Date</th>
                      <th style={{ padding: "14px 20px" }}>Matricule</th>
                      <th style={{ padding: "14px 20px" }}>Nom & Prénom</th>
                      <th style={{ padding: "14px 20px" }}>Classe</th>
                      <th style={{ padding: "14px 20px" }}>Mode</th>
                      <th style={{ padding: "14px 20px" }}>Montant Versé</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Chargement des données...</td></tr>
                    ) : currentDisplayedPayments.length === 0 ? (
                      <tr><td colSpan="8" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Aucun versement trouvé.</td></tr>
                    ) : (
                      currentDisplayedPayments.map((p) => {
                        const val = parseInt(p.amount || p.montant || 0, 10);
                        const { nomFormatted, prenomFormatted } = formatNomPrenom(p.students?.nom, p.students?.prenom);
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px", opacity: p.is_cancelled ? 0.6 : 1, background: p.is_cancelled ? "#fef2f2" : "white" }}>
                            <td style={{ padding: "14px 20px", fontWeight: "600" }}>
                              #{p.id}
                              {p.is_cancelled && <span style={{ marginLeft: "6px", color: "#dc2626", fontSize: "11px", fontWeight: "800" }}>(ANNULÉ)</span>}
                            </td>
                            <td style={{ padding: "14px 20px", color: "#64748b" }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</td>
                            <td style={{ padding: "14px 20px", fontWeight: "600", color: "#2563eb" }}>{p.students?.matricule || "-"}</td>
                            <td style={{ padding: "14px 20px", fontWeight: "600", color: "#1e293b" }}>{nomFormatted} {prenomFormatted}</td>
                            <td style={{ padding: "14px 20px" }}>{p.students?.classe || "-"}</td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "#f1f5f9", color: "#334155", fontWeight: "600" }}>{p.mode || "Espèces"}</span>
                            </td>
                            <td style={{ padding: "14px 20px", color: p.is_cancelled ? "#991b1b" : "#16a34a", fontWeight: "700", textDecoration: p.is_cancelled ? "line-through" : "none" }}>
                              {val.toLocaleString()} CFA
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                {!p.is_cancelled && (currentUser.role === "admin" || currentUser.role === "comptable") && (
                                  <button onClick={() => { setSelectedStudentId(p.student_id); setIsModalOpen(true); }} style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
                                    <Plus size={14} /> Compléter
                                  </button>
                                )}
                                {!p.is_cancelled && (
                                  <button onClick={() => openReceipt(p)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
                                    <Printer size={14} /> Reçu
                                  </button>
                                )}
                                {currentUser.role === "admin" && !p.is_cancelled && (
                                  <button onClick={() => { setPaymentToCancel(p); setCancelModalOpen(true); }} title="Annuler le reçu (Stornage)" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
                                    <Ban size={14} /> Annuler
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {totalPagesHistory > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Page <strong>{currentPageHistory}</strong> sur <strong>{totalPagesHistory}</strong></div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setCurrentPageHistory(prev => Math.max(prev - 1, 1))} disabled={currentPageHistory === 1} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: currentPageHistory === 1 ? "not-allowed" : "pointer" }}>
                        <ChevronLeft size={16} /> Précédent
                      </button>
                      <button onClick={() => setCurrentPageHistory(prev => Math.min(prev + 1, totalPagesHistory))} disabled={currentPageHistory === totalPagesHistory} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: currentPageHistory === totalPagesHistory ? "not-allowed" : "pointer" }}>
                        Suivant <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div>
              <h2 style={{ marginBottom: "20px" }}>Tableau de Bord Financier [{academicYear}]</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>TOTAL ENCAISSÉ GLOBAL (VALIDE)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a" }}>{totalEncaisseGlobal.toLocaleString()} CFA</div>
                </div>

                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>TOTAL IMPAYÉS RESTANTS</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#dc2626" }}>{totalImpayesGlobal.toLocaleString()} CFA</div>
                </div>

                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>TOTAL ÉLÈVES INSCRITS</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#2563eb" }}>{students.length}</div>
                </div>

                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>ÉLÈVES AYANT SOLDÉ</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0284c7" }}>
                    {studentsStatusMap.filter(s => s.reste === 0 && s.totalPaye > 0).length}
                  </div>
                </div>
              </div>

              <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Encaissements par Mode de Règlement</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                  {Object.entries(statsParMode).map(([mode, montant]) => (
                    <div key={mode} style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>{mode}</div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{montant.toLocaleString()} CFA</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "impayes" && (
            <div id="impayes-print" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <OfficialHeader />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>État des Impayés et Relances [{academicYear}]</h2>
                  <div style={{ fontSize: "13px", color: "#2563eb", fontWeight: "700", marginTop: "4px" }}>
                    Classe : {filterClassImpayes === "Tous" ? "Toutes les classes" : filterClassImpayes}
                  </div>
                </div>

                <div className="no-print" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <select value={filterClassImpayes} onChange={(e) => { setFilterClassImpayes(e.target.value); setCurrentPageImpayes(1); }} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    {classesList.map(c => <option key={c} value={c}>Classe : {c}</option>)}
                  </select>

                  <div style={{ position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" placeholder="Filtrer un impayé..." value={searchTermImpayes} onChange={(e) => { setSearchTermImpayes(e.target.value); setCurrentPageImpayes(1); }} style={{ padding: "10px 10px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "220px" }} />
                  </div>

                  <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#475569", color: "white", padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}>
                    <Printer size={16} /> Imprimer Liste
                  </button>
                </div>
              </div>

              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#dc2626", color: "white", textAlign: "left", fontSize: "14px" }}>
                      <th style={{ padding: "14px 20px" }}>Nom & Prénom</th>
                      <th style={{ padding: "14px 20px" }}>Classe</th>
                      <th style={{ padding: "14px 20px" }}>Total Attendu</th>
                      <th style={{ padding: "14px 20px" }}>Déjà Versé</th>
                      <th style={{ padding: "14px 20px" }}>Reste à Payer</th>
                      <th className="no-print" style={{ padding: "14px 20px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDisplayedImpayes.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#16a34a", fontWeight: "600" }}>Aucun impayé trouvé. 🎉</td></tr>
                    ) : (
                      currentDisplayedImpayes.map((st) => {
                        const { nomFormatted, prenomFormatted } = formatNomPrenom(st.nom, st.prenom);
                        return (
                          <tr key={st.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                            <td style={{ padding: "14px 20px", fontWeight: "600", color: "#1e293b" }}>{nomFormatted} {prenomFormatted}</td>
                            <td style={{ padding: "14px 20px" }}>{st.classe || "-"}</td>
                            <td style={{ padding: "14px 20px" }}>{st.totalExigibleSt.toLocaleString()} CFA</td>
                            <td style={{ padding: "14px 20px", color: "#16a34a", fontWeight: "600" }}>{st.totalPaye.toLocaleString()} CFA</td>
                            <td style={{ padding: "14px 20px", color: "#dc2626", fontWeight: "800" }}>{st.reste.toLocaleString()} CFA</td>
                            <td className="no-print" style={{ padding: "14px 20px", textAlign: "right" }}>
                              {(currentUser.role === "admin" || currentUser.role === "comptable") && (
                                <button onClick={() => { setSelectedStudentId(st.id); setIsModalOpen(true); }} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                                  Encaisser
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {totalPagesImpayes > 1 && (
                  <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Page <strong>{currentPageImpayes}</strong> sur <strong>{totalPagesImpayes}</strong></div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setCurrentPageImpayes(prev => Math.max(prev - 1, 1))} disabled={currentPageImpayes === 1} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
                        <ChevronLeft size={16} /> Précédent
                      </button>
                      <button onClick={() => setCurrentPageImpayes(prev => Math.min(prev + 1, totalPagesImpayes))} disabled={currentPageImpayes === totalPagesImpayes} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
                        Suivant <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "exonerations" && (
            <div>
              <h2 style={{ marginBottom: "8px" }}>Gestion des Bourses et Exonérations / Remises</h2>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                Attribuez une réduction exceptionnelle qui sera déduite du total exigible de l'élève.
              </p>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#2563eb", color: "white", textAlign: "left", fontSize: "14px" }}>
                      <th style={{ padding: "14px 20px" }}>Matricule</th>
                      <th style={{ padding: "14px 20px" }}>Nom & Prénom</th>
                      <th style={{ padding: "14px 20px" }}>Classe</th>
                      <th style={{ padding: "14px 20px" }}>Scolarité Standard</th>
                      <th style={{ padding: "14px 20px" }}>Remise / Bourse (CFA)</th>
                      <th style={{ padding: "14px 20px" }}>Nouveau Total Exigible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDisplayedExonerations.map((st) => {
                      const details = getFeeDetails(st);
                      const currentRemise = customReductions[st.id] || 0;
                      const { nomFormatted, prenomFormatted } = formatNomPrenom(st.nom, st.prenom);
                      return (
                        <tr key={st.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                          <td style={{ padding: "14px 20px", fontWeight: "600", color: "#2563eb" }}>{st.matricule || "-"}</td>
                          <td style={{ padding: "14px 20px", fontWeight: "600", color: "#1e293b" }}>{nomFormatted} {prenomFormatted}</td>
                          <td style={{ padding: "14px 20px" }}>{st.classe || "-"}</td>
                          <td style={{ padding: "14px 20px" }}>{details.baseTotal.toLocaleString()} CFA</td>
                          <td style={{ padding: "14px 20px" }}>
                            <input
                              type="number"
                              placeholder="Ex : 25000"
                              disabled={currentUser.role !== "admin"}
                              value={currentRemise === 0 ? "" : currentRemise}
                              onChange={async (e) => {
                                if (currentUser.role !== "admin") return;
                                const val = parseInt(e.target.value, 10) || 0;
                                setCustomReductions(prev => ({ ...prev, [st.id]: val }));
                                await recordAuditLog("MODIFICATION_REMISE", `Mise à jour bourse/remise à ${val} CFA pour l'élève ID ${st.id}`);
                              }}
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", width: "140px" }}
                            />
                          </td>
                          <td style={{ padding: "14px 20px", fontWeight: "800", color: "#16a34a" }}>
                            {details.total.toLocaleString()} CFA
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalPagesExonerations > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>Page <strong>{currentPageExonerations}</strong> sur <strong>{totalPagesExonerations}</strong></div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setCurrentPageExonerations(prev => Math.max(prev - 1, 1))} disabled={currentPageExonerations === 1} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
                        <ChevronLeft size={16} /> Précédent
                      </button>
                      <button onClick={() => setCurrentPageExonerations(prev => Math.min(prev + 1, totalPagesExonerations))} disabled={currentPageExonerations === totalPagesExonerations} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
                        Suivant <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "caisse" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h2>Clôture de Caisse Journalière</h2>

                <div className="no-print" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600" }}>Date de caisse :</label>
                  <input type="date" value={caisseDate} onChange={(e) => setCaisseDate(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#2563eb", color: "white", padding: "9px 16px", borderRadius: "8px", border: "none", fontWeight: "600", cursor: "pointer" }}>
                    <Printer size={16} /> Imprimer Point de Caisse
                  </button>
                </div>
              </div>

              <div id="caisse-print" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <OfficialHeader />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#2563eb", textTransform: "uppercase" }}>RAPPORT DE CLÔTURE DE CAISSE JOURNALIER</h3>
                  <div style={{ textAlign: "right", fontSize: "13px" }}>
                    <div><strong>Date :</strong> {new Date(caisseDate).toLocaleDateString("fr-FR")}</div>
                    <div><strong>Transactions Valides :</strong> {paymentsDuJour.length}</div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #cbd5e1" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#334155" }}>TOTAL ENCAISSÉ CE JOUR :</span>
                  <span style={{ fontSize: "24px", fontWeight: "900", color: "#16a34a" }}>{totalCaisseJour.toLocaleString()} CFA</span>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "13px", color: "#334155" }}>
                      <th style={{ padding: "10px 14px" }}>N° Trans.</th>
                      <th style={{ padding: "10px 14px" }}>Heure</th>
                      <th style={{ padding: "10px 14px" }}>Matricule</th>
                      <th style={{ padding: "10px 14px" }}>Nom & Prénom</th>
                      <th style={{ padding: "10px 14px" }}>Mode</th>
                      <th style={{ padding: "10px 14px", textAlign: "right" }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsDuJour.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Aucun versement enregistré à cette date.</td></tr>
                    ) : (
                      paymentsDuJour.map(p => {
                        const { nomFormatted, prenomFormatted } = formatNomPrenom(p.students?.nom, p.students?.prenom);
                        return (
                          <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                            <td style={{ padding: "10px 14px", fontWeight: "600" }}>#{p.id}</td>
                            <td style={{ padding: "10px 14px", color: "#64748b" }}>{p.created_at ? new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}</td>
                            <td style={{ padding: "10px 14px", color: "#2563eb", fontWeight: "600" }}>{p.students?.matricule}</td>
                            <td style={{ padding: "10px 14px", fontWeight: "600", color: "#1e293b" }}>{nomFormatted} {prenomFormatted}</td>
                            <td style={{ padding: "10px 14px" }}>{p.mode || "Espèces"}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#16a34a", fontWeight: "700" }}>{parseInt(p.amount || p.montant || 0, 10).toLocaleString()} CFA</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "audit" && currentUser.role === "admin" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Journal d'Audit & Traçabilité</h2>
                  <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                    Historique sécurisé de toutes les opérations financières.
                  </p>
                </div>
                <button onClick={fetchData} style={{ background: "#7c3aed", color: "white", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                  🔄 Actualiser les logs
                </button>
              </div>

              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#7c3aed", color: "white", textAlign: "left", fontSize: "13px" }}>
                      <th style={{ padding: "14px 20px" }}>Date & Heure</th>
                      <th style={{ padding: "14px 20px" }}>Utilisateur</th>
                      <th style={{ padding: "14px 20px" }}>Rôle</th>
                      <th style={{ padding: "14px 20px" }}>Action</th>
                      <th style={{ padding: "14px 20px" }}>Détails de l'opération</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Aucun journal enregistré.</td></tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                          <td style={{ padding: "14px 20px", color: "#64748b" }}>{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                          <td style={{ padding: "14px 20px", fontWeight: "700", color: "#1e293b" }}>{log.user_name || "Admin"}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>{log.role || "admin"}</span>
                          </td>
                          <td style={{ padding: "14px 20px", fontWeight: "600", color: "#2563eb" }}>{log.action}</td>
                          <td style={{ padding: "14px 20px", color: "#334155" }}>{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer un versement">
        <form onSubmit={handleAddPayment} style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "4px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Sélectionner l'élève *</label>
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={searchTermStudent}
              onChange={(e) => setSearchTermStudent(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "8px", background: "#f8fafc" }}
            />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
            >
              <option value="">-- Choisir un élève --</option>
              {filteredStudents
                .slice()
                .sort((a, b) => {
                  if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                  }
                  return b.id - a.id;
                })
                .map((s) => {
                  const affected = checkIsAffected(s);
                  const { nomFormatted, prenomFormatted } = formatNomPrenom(s.nom, s.prenom);
                  return (
                    <option key={s.id} value={s.id}>
                      🆕 {nomFormatted} {prenomFormatted} — {s.classe || "Sans classe"} [{s.matricule || "Sans mat."}] {affected ? "(Affecté État)" : ""}
                    </option>
                  );
                })}
            </select>
          </div>

          {selectedStudent && (
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}>
                <span style={{ fontWeight: "700", color: "#1e293b" }}>Échéancier ({selectedStudent.classe})</span>
                {fees.reduction > 0 && <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>Remise de {fees.reduction.toLocaleString()} CFA</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Total Scolarité (après remise) :</span><strong>{fees.total.toLocaleString()} CFA</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Déjà versé à ce jour :</span><strong style={{ color: "#2563eb" }}>{totalDejaPaye.toLocaleString()} CFA</strong>
              </div>

              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={payInscription} onChange={(e) => setPayInscription(e.target.checked)} />
                  <span>Frais d'inscription / réinscription (+5 000 CFA)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={payPaperRame} onChange={(e) => setPayPaperRame(e.target.checked)} />
                  <span>Rame de papier (+3 500 CFA)</span>
                </label>
              </div>

              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "14px", background: "#fef2f2", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#991b1b" }}>Reste à payer actuel :</span>
                <span style={{ color: resteActuelAvantPaiement > 0 ? "#dc2626" : "#16a34a" }}>{resteActuelAvantPaiement.toLocaleString()} CFA</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Montant versé aujourd'hui (CFA Entier) *</label>
            <input
              type="number"
              step="1"
              placeholder="Ex : 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
          </div>

          {selectedStudent && versementActuel > 0 && (
            <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#166534" }}>
                <span>Nouveau Reste à Payer après ce versement :</span>
                <strong style={{ color: resteAPayer > 0 ? "#dc2626" : "#16a34a", fontSize: "15px" }}>{resteAPayer.toLocaleString()} CFA</strong>
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Mode de Règlement *</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              <option value="Espèces">Espèces</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Moov Money">Moov Money</option>
              <option value="Virement Bancaire">Virement Bancaire</option>
              <option value="Chèque">Chèque</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Notes / Observations</label>
            <textarea placeholder="Observations..." value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "60px" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Annuler</button>
            <button type="submit" style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer" }}>Enregistrer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Annulation Légale de Reçu">
        {paymentToCancel && (
          <div>
            <div style={{ background: "#fef2f2", padding: "12px", borderRadius: "8px", border: "1px solid #fecaca", color: "#991b1b", fontSize: "13px", marginBottom: "16px" }}>
              <strong>Avertissement Comptable :</strong> La transaction <strong>#{paymentToCancel.id}</strong> d'un montant de <strong>{parseInt(paymentToCancel.amount || 0, 10).toLocaleString()} CFA</strong> sera marquée comme <em>ANNULÉE</em>. Elle ne sera pas supprimée de la base de données pour préserver l'historique et la conformité légale.
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Motif d'annulation obligatoire *</label>
              <textarea
                placeholder="Ex : Erreur de montant saisi par le comptable..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={() => setCancelModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Abandonner</button>
              <button type="button" onClick={handleCancelPayment} style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#dc2626", color: "white", fontWeight: "600", cursor: "pointer" }}>Confirmer l'Annulation</button>
            </div>
          </div>
        )}
      </Modal>

      {selectedReceipt && (
        <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="">
          <div id="receipt-a5" style={{ padding: "15px", color: "#0f172a", fontFamily: "sans-serif", maxWidth: "650px", margin: "0 auto", background: "white" }}>
            <OfficialHeader />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ width: "100px" }}></div>
              <div style={{ textAlign: "center" }}>
                <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "3px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>
                  REÇU DE PAIEMENT N° {selectedReceipt.id}
                </span>
              </div>
              <div style={{ width: "100px", textAlign: "right" }}>
                {(selectedReceipt.reste_a_payer || 0) === 0 && !selectedReceipt.is_cancelled && (
                  <div style={{ border: "2px solid #16a34a", color: "#16a34a", padding: "2px 6px", borderRadius: "6px", fontWeight: "900", fontSize: "10px", textTransform: "uppercase", backgroundColor: "#f0fdf4" }}>
                    SOLDÉ
                  </div>
                )}
                {selectedReceipt.is_cancelled && (
                  <div style={{ border: "2px solid #dc2626", color: "#dc2626", padding: "2px 6px", borderRadius: "6px", fontWeight: "900", fontSize: "10px", textTransform: "uppercase", backgroundColor: "#fef2f2" }}>
                    ANNULÉ
                  </div>
                )}
              </div>
            </div>

            {(() => {
              const { nomFormatted, prenomFormatted } = formatNomPrenom(selectedReceipt.students?.nom, selectedReceipt.students?.prenom);
              const isAffectedReceipt = selectedReceipt.students?.is_affecte_etat === true;
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", fontSize: "10.5px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "8px" }}>
                  <div><strong>Date :</strong> {selectedReceipt.created_at ? new Date(selectedReceipt.created_at).toLocaleDateString("fr-FR") : "-"}</div>
                  <div><strong>Mode :</strong> {selectedReceipt.mode || "Espèces"}</div>
                  <div><strong>Matricule :</strong> <span style={{ color: "#2563eb", fontWeight: "700" }}>{selectedReceipt.students?.matricule || "-"}</span></div>
                  <div><strong>Classe :</strong> {selectedReceipt.students?.classe || "-"}</div>
                  <div style={{ gridColumn: "span 2" }}>
                    <strong>Élève :</strong> <span style={{ fontSize: "11px", fontWeight: "700" }}>{nomFormatted} {prenomFormatted}</span>
                    {isAffectedReceipt && <span style={{ color: "#b45309", fontWeight: "700", marginLeft: "6px" }}>(Affecté État)</span>}
                  </div>
                </div>
              );
            })()}

            <div style={{ background: "#fff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "12px", fontSize: "10.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span>Total Scolarité Exigible :</span><strong>{(selectedReceipt.total_exigible || 0).toLocaleString()} CFA</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span>Montant versé ce jour :</span><strong style={{ color: selectedReceipt.is_cancelled ? "#dc2626" : "#16a34a" }}>{parseInt(selectedReceipt.amount || selectedReceipt.montant || 0, 10).toLocaleString()} CFA</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span>Cumul total réglé :</span><strong style={{ color: "#2563eb" }}>{(selectedReceipt.cumul_paye || 0).toLocaleString()} CFA</strong>
              </div>
              <hr style={{ margin: "4px 0", border: "0", borderTop: "1px dashed #cbd5e1" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "800" }}>
                <span>RESTE À PAYER :</span>
                <span style={{ color: (selectedReceipt.reste_a_payer || 0) > 0 ? "#dc2626" : "#16a34a" }}>{(selectedReceipt.reste_a_payer || 0).toLocaleString()} CFA</span>
              </div>
            </div>

            {/* Mention légale centrée sans le smiley */}
            <div style={{ textAlign: "center", margin: "10px 0" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#dc2626", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                TOUTE SOMME VERSÉE N'EST PLUS RESTITUABLE.
              </span>
            </div>

            {/* Zone Signature & Cachet */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px", paddingTop: "5px" }}>
              <div style={{ textAlign: "center", width: "180px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b", textDecoration: "underline" }}>
                  La Comptabilité
                </span>
                <div style={{ height: "50px" }}></div>
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button onClick={() => setReceiptModalOpen(false)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Fermer</button>
              <button onClick={() => window.print()} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Printer size={16} /> Imprimer Reçu
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
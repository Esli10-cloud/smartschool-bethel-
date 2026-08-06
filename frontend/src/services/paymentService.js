// Grille tarifaire officielle conforme au prospectus du lycée
export const SCHOOL_FEES_GRID = {
  // ==================== CAP / AP (Année Préparatoire) ====================
  "CAP/AP": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },

  // ==================== ÉLECTRONIQUE & ÉLECTROTECHNIQUE ====================
  // --- CAP 1, 2, 3 ---
  "CAP 1 (Électronique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 2 (Électronique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 3 (Électronique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 1 (Électrotechnique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 2 (Électrotechnique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 3 (Électrotechnique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },

  // --- BEP 1 & 2 ---
  "BEP 1 (Électronique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "BEP 2 (Électronique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "BEP 1 (Électrotechnique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "BEP 2 (Électrotechnique)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },

  // --- TERMINALES & BAC-PRO ---
  "TLE F2 (Électronique)": { v1: 100000, v2: 35000, v3: 30000, total: 165000 },
  "TLE F3 (Électrotechnique)": { v1: 100000, v2: 35000, v3: 30000, total: 165000 },
  "BAC-PRO (Électronique)": { v1: 140000, v2: 40000, v3: 40000, total: 220000 },
  "BAC-PRO (Électrotechnique)": { v1: 140000, v2: 40000, v3: 40000, total: 220000 },

  // ==================== GÉNIE CIVIL ====================
  "CAP 1 (Génie Civil)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 2 (Génie Civil)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 3 (Génie Civil)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "BEP 1 (Génie Civil)": { v1: 100000, v2: 50000, v3: 50000, total: 200000 },
  "BEP 2 (Génie Civil)": { v1: 100000, v2: 50000, v3: 50000, total: 200000 },
  "TLE F4 (Génie Civil)": { v1: 110000, v2: 50000, v3: 50000, total: 210000 },
  "BAC-PRO (Génie Civil)": { v1: 140000, v2: 40000, v3: 40000, total: 220000 },

  // ==================== ÉNERGIE SOLAIRE ====================
  "BAC-PRO (Solaire)": { v1: 140000, v2: 40000, v3: 40000, total: 220000 },

  // ==================== INFORMATIQUE - MI ====================
  "BAC-PRO (Informatique MI)": { v1: 140000, v2: 40000, v3: 40000, total: 220000 },

  // ==================== MÉCANIQUE AUTO (MVA) ====================
  "CAP 1 (Mécanique Auto)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 2 (Mécanique Auto)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "CAP 3 (Mécanique Auto)": { v1: 100000, v2: 25000, v3: 25000, total: 150000 },
  "BEP 1 (Mécanique Auto)": { v1: 100000, v2: 35000, v3: 30000, total: 165000 },
  "BEP 2 (Mécanique Auto)": { v1: 100000, v2: 35000, v3: 30000, total: 165000 },
  "BAC-PRO (Mécanique Auto)": { v1: 100000, v2: 60000, v3: 60000, total: 220000 },

  // ==================== COMPTABILITÉ ====================
  "BEP 1 (Comptabilité-ACC)": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
  "BEP 2 (Comptabilité)": { v1: 50000, v2: 30000, v3: 30000, total: 110000 },
  "TLE G2 (Comptabilité)": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },

  // ==================== ENSEIGNEMENT GÉNÉRAL ====================
  "6ème": { v1: 35000, v2: 20000, v3: 15000, total: 70000 },
  "5ème": { v1: 35000, v2: 20000, v3: 15000, total: 70000 },
  "4ème": { v1: 40000, v2: 20000, v3: 20000, total: 80000 },
  "3ème": { v1: 50000, v2: 20000, v3: 20000, total: 90000 },
  "2ⁿᵈ AC": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
  "1ère A": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
  "1ère D": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
  "TLE A": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
  "TLE D": { v1: 50000, v2: 25000, v3: 25000, total: 100000 },
};

// Frais annexes
export const EXTRA_FEES = {
  INSCRIPTION_FEE: 5000, // Droits d'inscription / réinscription
  PAPER_RAME_FEE: 3500,  // Option de paiement physique ou 3500 F
};
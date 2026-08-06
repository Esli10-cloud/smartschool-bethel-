import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [matiere, setMatiere] = useState('');
  const [valeur, setValeur] = useState('');
  const [coefficient, setCoefficient] = useState('2');
  const [trimestre, setTrimestre] = useState('1 SEMESTRE');
  
  // Infos fictives pour l'exemple du bulletin
  const [eleveNom] = useState('KOUDOUGOU');
  const [elevePrenom] = useState('WENDKUUNI TOUSSAIN');
  const [eleveClasse] = useState('CAP 1 ELECTRO-TECHNIQUE');
  const [eleveMatricule] = useState('LTB-10/25-00430');

  useEffect(() => {
    fetchGrades();
  }, []);

  async function fetchGrades() {
    const { data, error } = await supabase.from('notes').select('*');
    if (error) console.error('Erreur:', error);
    else setGrades(data || []);
  }

  async function addGrade(e) {
    e.preventDefault();
    if (!valeur) return alert('Veuillez entrer une note');

    const { error } = await supabase.from('notes').insert([
      { matiere, valeur: parseFloat(valeur), coefficient: parseInt(coefficient) || 1, trimestre }
    ]);

    if (error) {
      alert('Erreur lors de l\'ajout');
      console.error(error);
    } else {
      setMatiere('');
      setValeur('');
      fetchGrades();
    }
  }

  // Calculs pour le bulletin
  const totalCoeff = grades.reduce((acc, curr) => acc + (curr.coefficient || 2), 0);
  const totalPondere = grades.reduce((acc, curr) => {
    const note = Number(curr.valeur) || Number(curr.grade) || 0;
    const coeff = curr.coefficient || 2;
    return acc + (note * coeff);
  }, 0);
  const moyenneGenerale = totalCoeff > 0 ? (totalPondere / totalCoeff).toFixed(2) : 0;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', background: '#fff', border: '1px solid #cbd5e1' }}>
      
      {/* EN-TETE OFFICIEL ECOLE */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ margin: '0', fontSize: '18px' }}>LYCÉE TECHNIQUE BETHEL</h2>
        <p style={{ margin: '5px 0', fontSize: '11px' }}>Année scolaire : 2025-2026</p>
        <h3 style={{ margin: '10px 0', background: '#f1f5f9', padding: '5px' }}>BULLETIN DE NOTES OFFICIEL</h3>
      </div>

      {/* INFOS ELEVE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', fontSize: '13px', marginBottom: '15px', border: '1px solid #cbd5e1' }}>
        <div><strong>Classe :</strong> {eleveClasse}</div>
        <div><strong>Matricule :</strong> {eleveMatricule}</div>
        <div><strong>Nom :</strong> {eleveNom}</div>
        <div><strong>Prénoms :</strong> {elevePrenom}</div>
      </div>

      {/* FORMULAIRE D'AJOUT RAPIDE POUR TEST */}
      <form onSubmit={addGrade} style={{ margin: '15px 0', display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#eff6ff', padding: '10px', borderRadius: '6px' }}>
        <input type="text" placeholder="Matière" value={matiere} onChange={e => setMatiere(e.target.value)} required style={{ padding: '6px', flex: 2 }} />
        <input type="number" step="0.01" placeholder="Note /20" value={valeur} onChange={e => setValeur(e.target.value)} required style={{ padding: '6px', width: '80px' }} />
        <input type="number" placeholder="Coeff" value={coefficient} onChange={e => setCoefficient(e.target.value)} required style={{ padding: '6px', width: '60px' }} />
        <button type="submit" style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Ajouter au bulletin</button>
      </form>

      {/* TABLEAU DES MATIERES */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>Matières</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', textAlign: 'center' }}>Coef</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', textAlign: 'center' }}>Moy /20</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8', textAlign: 'center' }}>Notes Pondérées</th>
            <th style={{ padding: '8px', border: '1px solid #94a3b8' }}>Appréciation</th>
          </tr>
        </thead>
        <tbody>
          {grades.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '15px', textAlign: 'center' }}>Aucune matière enregistrée pour l'instant.</td>
            </tr>
          ) : (
            grades.map((g, index) => {
              const note = Number(g.valeur) || Number(g.grade) || 0;
              const coeff = g.coefficient || 2;
              const pondere = note * coeff;
              let appreciation = "Faible";
              if (note >= 14) appreciation = "Bien";
              else if (note >= 10) appreciation = "Passable";
              else if (note < 7) appreciation = "Très faible";

              return (
                <tr key={index}>
                  <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{g.matiere}</td>
                  <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{coeff}</td>
                  <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{note}</td>
                  <td style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{pondere}</td>
                  <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>{appreciation}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* BILAN DU BULLETIN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', background: '#f8fafc', padding: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
        <div>
          <p><strong>TOTAL COEFFICIENTS :</strong> {totalCoeff}</p>
          <p><strong>TOTAL PONDÉRÉ :</strong> {totalPondere}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '16px' }}><strong>MOYENNE TRIMESTRIELLE :</strong> <span style={{ color: '#2563eb' }}>{moyenneGenerale} / 20</span></p>
        </div>
      </div>

    </div>
  );
}
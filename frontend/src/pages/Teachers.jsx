import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matiere, setMatiere] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    const { data, error } = await supabase.from('teachers').select('*');
    if (error) console.error('Erreur:', error);
    else setTeachers(data || []);
  }

  async function addTeacher(e) {
    e.preventDefault();
    if (!nom) return alert('Veuillez entrer un nom');

    const { error } = await supabase.from('teachers').insert([
      { nom, prenom, matiere, contact }
    ]);

    if (error) {
      alert('Erreur lors de l\'ajout');
      console.error(error);
    } else {
      setNom('');
      setPrenom('');
      setMatiere('');
      setContact('');
      fetchTeachers();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>👨‍🏫 Gestion des enseignants</h1>

      <form onSubmit={addTeacher} style={{ margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" placeholder="Nom" value={nom} 
          onChange={e => setNom(e.target.value)} required 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" placeholder="Prénom" value={prenom} 
          onChange={e => setPrenom(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" placeholder="Matière" value={matiere} 
          onChange={e => setMatiere(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" placeholder="Contact" value={contact} 
          onChange={e => setContact(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Ajouter
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Nom</th>
            <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Prénom</th>
            <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Matière</th>
            <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Contact</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '15px', textAlign: 'center' }}>Aucun enseignant enregistré pour le moment.</td>
            </tr>
          ) : (
            teachers.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{t.nom || t.name}</td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{t.prenom || t.firstname}</td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{t.matiere || t.subject}</td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{t.contact || t.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
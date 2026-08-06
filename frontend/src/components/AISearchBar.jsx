import React, { useState } from 'react';
import { askSmartSchoolAI } from '../services/aiService';

export default function AISearchBar() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    const result = await askSmartSchoolAI(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Poser une question à l'IA (ex: Nombre d'élèves inscrits ?)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '4px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Recherche...' : 'Demander'}
        </button>
      </form>
      {response && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '4px', borderLeft: '4px solid #007bff' }}>
          <strong>Réponse Assistant :</strong>
          <p style={{ margin: '5px 0 0 0' }}>{response}</p>
        </div>
      )}
    </div>
  );
}
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const askSmartSchoolAI = async (userPrompt) => {
  try {
    const { data: students } = await supabase.from('students').select('*');
    const { data: payments } = await supabase.from('payments').select('*');

    const systemContext = `
      Tu es l'assistant virtuel de SmartSchool Bethel.
      Voici les données de l'école :
      - Élèves : ${JSON.stringify(students || [])}
      - Paiements : ${JSON.stringify(payments || [])}

      Réponds de manière courte, claire et professionnelle à la question.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemContext }, { text: userPrompt }] }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Erreur IA :", error);
    return "Impossible d'obtenir une réponse pour le moment.";
  }
};
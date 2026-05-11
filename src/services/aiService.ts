import { GoogleGenAI } from "@google/genai";

// Use VITE_ prefix for client-side Vite compatibility, with fallback to process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateDesignSuggestion(summary: string): Promise<string> {
  const prompt = `
Eres un director de arte experimentado. Un estudiante ha leído un libro y escrito este resumen:
"${summary}"

Genera UNA ÚNICA idea principal de cómo aplicar esto al diseño gráfico (ej: tipografía, color, composición).
Reglas:
- Máximo 15 a 20 palabras.
- Mantenlo extremadamente conciso, de lectura muy rápida.
- Directo al punto, sin saludos, despedidas ni introducciones.
- Solo la idea de aplicación.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "¡Aplica esta idea experimentando con nuevos contrastes y paletas de colores en tu próximo diseño!";
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return "💡 Tip creativo: A veces, la mejor inspiración viene de las páginas de un buen libro. Experimenta traduciendo el tono de esa historia en paletas de color y elecciones tipográficas para tu próximo moodboard.";
  }
}

import { GoogleGenAI } from "@google/genai";

let aiClient: any = null;

// Pool of high-quality fallback design suggestions in Spanish (to match the app language)
const KEYWORD_RULES = [
  {
    keywords: ["color", "colores", "paleta", "azul", "rojo", "verde", "amarillo", "rosa", "morado", "negro", "blanco", "tono", "tonos", "pincel", "pintura", "cálido", "frio", "frescura", "cielo", "mar", "atardecer"],
    tips: [
      "🎨 Idea de diseño: Traduce la atmósfera de esta lectura en una paleta de color triádica (un tono dominante, uno de apoyo y un acento vibrante).",
      "🎨 Sugerencia visual: Para este tema, experimenta con una paleta de alto contraste inspirada en tonos de la naturaleza para capturar su esencia.",
      "🎨 Concepto tipográfico: Asocia los conceptos cálidos de tu lectura con colores crema suaves y añade un acento terracota moderno."
    ]
  },
  {
    keywords: ["tipografia", "tipografía", "letra", "letras", "fuente", "fuentes", "texto", "serif", "sans", "mono", "escribir", "libro", "lectura", "párrafo", "novela"],
    tips: [
      "✍️ Contraste tipográfico: Combina una tipografía Serif clásica en tus títulos para evocar jerarquía histórica, contrastada con una Sans-serif limpia para el texto de lectura.",
      "✍️ Idea de composición: El texto largo requiere aire. Establece una altura de línea (line-height) holgada de 1.6 para que la lectura digital respire.",
      "✍️ Tip tipográfico: Alinea las fuentes de ancho variable para los conceptos expresivos y una fuente Mono técnica para los datos o notas al pie."
    ]
  },
  {
    keywords: ["composición", "composicion", "orden", "diseño", "estructura", "alineado", "grilla", "bento", "espacio", "vacío", "caos", "equilibrio", "balance", "formas"],
    tips: [
      "📐 Estructura visual: Aplica la regla de los tercios en tu próximo lienzo, colocando el centro de atención de la lectura en una de las intersecciones.",
      "📐 Diseño Bento: Distribuye los conceptos clave que destacas en una cuadrícula asimétrica (bento-grid) con diferentes proporciones de tarjetas.",
      "📐 Espacio sagrado: Atribúyele un 40% de espacio en blanco alrededor de las ideas principales de tu lectura para concentrar la atención."
    ]
  },
  {
    keywords: ["historia", "personaje", "emoción", "emocion", "sentimiento", "viaje", "aventura", "magia", "fantasía", "fantasia", "oscuro", "luz", "miedo", "amor", "tristeza"],
    tips: [
      "✨ Inspiración emocional: Traduce la tensión emocional o el dramatismo del relato usando sombras profundas y un degradado radial de alta saturación.",
      "✨ Narrativa visual: Utiliza siluetas estilizadas y una iconografía lineal minimalista para contar en un solo frame la esencia de los personajes.",
      "✨ Enfoque dramático: Los tonos oscuros como fondo con acentos de luz de neón (cyan o rosa eléctrico) encajan de maravilla con la tensión de tu resumen."
    ]
  },
  {
    keywords: ["tecnología", "tecnologia", "futuro", "ciencia", "computadora", "digital", "pantalla", "usuario", "interfaz", "desarrollo", "web", "app", "juego", "celular", "pantallas"],
    tips: [
      "💻 UI Moderna: Utiliza un efecto 'backdrop-blur' (efecto cristal) sobre fondos degradados oscuros para una interfaz limpia y futurista.",
      "💻 Estética Neo-brutalista: Atrévete con bordes negros gruesos bien marcados (3px-4px) y colores planos saturados sin degradados.",
      "💻 Tip de interfaz: Cuando diseñes apps para esta temática, mantén los botones principales con un alto de mínimo 48px para facilitar el toque táctil."
    ]
  }
];

const GENERAL_TIPS = [
  "💡 Tip de jerarquía: Asegúrate de que el título principal sea al menos 2.5 veces más grande que el cuerpo para guiar el flujo visual.",
  "💡 Tip de escala: Agrupa los elementos relacionados de tu resumen en contenedores limpios usando diferentes densidades tipográficas.",
  "💡 Elemento focal: Define de antemano un único punto de enfoque en tu lienzo que absorba la atención primaria del lector.",
  "💡 Psicología de la forma: Utiliza bordes redondeados (rounded-3xl) para evocar accesibilidad y cercanía, o bordes afilados para profesionalismo estricto."
];

function getAiClient() {
  if (aiClient) return aiClient;

  let apiKey: string | undefined = undefined;

  // Safely extract apiKey from modern Vite env meta metadata or potential process.env replacement
  try {
    apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
  } catch (e) {
    // Ignore meta errors in different bundlers
  }

  if (!apiKey) {
    try {
      if (typeof process !== "undefined" && process?.env) {
        apiKey = process.env.GEMINI_API_KEY;
      }
    } catch (e) {
      // Ignore process errors
    }
  }

  // We intentionally return null if no key is configured, rather than throwing.
  // This allows the app to operate fully keyless in public web scenarios.
  if (!apiKey) {
    return null;
  }

  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (err) {
    console.error("[Gemini API] Error initializing GoogleGenAI client:", err);
    return null;
  }
}

export async function generateDesignSuggestion(summary: string): Promise<string> {
  const norm = summary.toLowerCase();

  // 1. Try smart local analyzer first when we want complete "sin clave" browser independence
  const client = getAiClient();
  if (!client) {
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some(k => norm.includes(k))) {
        const idx = Math.floor(Math.random() * rule.tips.length);
        return rule.tips[idx];
      }
    }
    
    // Fallback semi-dynamic local generator
    const fallbackTips = [
      ...GENERAL_TIPS,
      `🎨 Inspiración de diseño: Tu resumen de ${summary.length} caracteres sugiere un estilo ultra-minimalista. Opta por fondos planos oscuros con fuentes sans-serif mono de alto impacto.`,
      `🎨 Desafío en pantalla: Intenta estructurar visualmente la lectura que resumiste utilizando únicamente dos colores en todo el diseño.`
    ];
    return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
  }

  const prompt = `
Eres un director de arte de diseño de interfaces. Un estudiante ha leído un fragmento de texto y ha elaborado este breve resumen de aprendizaje:
"${summary}"

Propón una única regla o sugerencia práctica de diseño visual (color, tipografía o interfaz) inspirada en la esencia de lo aprendido.
Reglas estrictas:
- Máximo 15 a 20 palabras.
- En español.
- Sé sumamente directo, práctico y profesional. No saludes, no uses introducciones.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    return response.text?.trim() || GENERAL_TIPS[0];
  } catch (error) {
    console.error("Error generating suggestion with Gemini:", error);
    // Graceful fallback to prevent crashes if the API key fails dynamically
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some(k => norm.includes(k))) {
        return rule.tips[Math.floor(Math.random() * rule.tips.length)];
      }
    }
    return GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
  }
}


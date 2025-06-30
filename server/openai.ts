import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// EU AI Act Compliance - Log all AI interactions (simplified version)
async function logAIInteraction(data: {
  userId: string;
  action: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number;
  projectId?: number;
}): Promise<void> {
  // For now, log to console for EU AI Act compliance
  // In production, this would store to a dedicated AI audit log
  console.log(`[AI-LOG] ${new Date().toISOString()} - User: ${data.userId}, Action: ${data.action}, Model: ${data.model}, Tokens: ${data.tokens}`);
}

// Generate project description based on basic data
export async function generateProjectDescription(
  userId: string,
  projectData: {
    name: string;
    location?: string;
    budget?: number;
    category?: string;
  }
): Promise<{ description: string; aiGenerated: boolean }> {
  const prompt = `Erstelle eine professionelle Projektbeschreibung für ein Tiefbau-Projekt:

Projektname: ${projectData.name}
${projectData.location ? `Standort: ${projectData.location}` : ''}
${projectData.budget ? `Budget: ${projectData.budget.toLocaleString('de-DE')} €` : ''}
${projectData.category ? `Kategorie: ${projectData.category}` : ''}

Erstelle eine präzise, technische Beschreibung (max. 200 Wörter) für deutsche Bauunternehmen. Fokus auf praktische Aspekte und Herausforderungen. Antwort in JSON Format: {"description": "text"}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"description": ""}');
    
    await logAIInteraction({
      userId,
      action: "generate_project_description",
      prompt,
      response: result.description,
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
    });

    return {
      description: result.description,
      aiGenerated: true,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("KI-Beschreibung konnte nicht generiert werden");
  }
}

// Risk assessment for construction projects
export async function generateRiskAssessment(
  userId: string,
  projectData: {
    name: string;
    location?: string;
    budget?: number;
    description?: string;
    duration?: number;
  },
  projectId?: number
): Promise<{ 
  riskLevel: "niedrig" | "mittel" | "hoch";
  riskFactors: string[];
  recommendations: string[];
  score: number;
  aiGenerated: boolean;
}> {
  const prompt = `Führe eine Risikobewertung für dieses Tiefbau-Projekt durch:

Projektname: ${projectData.name}
${projectData.location ? `Standort: ${projectData.location}` : ''}
${projectData.budget ? `Budget: ${projectData.budget.toLocaleString('de-DE')} €` : ''}
${projectData.description ? `Beschreibung: ${projectData.description}` : ''}
${projectData.duration ? `Dauer: ${projectData.duration} Monate` : ''}

Analysiere folgende Risikobereiche:
- Technische Risiken
- Umweltrisiken
- Finanzielle Risiken
- Zeitliche Risiken
- Rechtliche/Genehmigungsrisiken

Antwort in JSON Format:
{
  "riskLevel": "niedrig|mittel|hoch",
  "riskFactors": ["Risikofaktor 1", "Risikofaktor 2"],
  "recommendations": ["Empfehlung 1", "Empfehlung 2"],
  "score": 1-10
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für Tiefbau-Risikobewertungen mit 20 Jahren Erfahrung in Deutschland."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    await logAIInteraction({
      userId,
      action: "generate_risk_assessment",
      prompt,
      response: JSON.stringify(result),
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId,
    });

    return {
      riskLevel: result.riskLevel || "mittel",
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || [],
      score: result.score || 5,
      aiGenerated: true,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Risikobewertung konnte nicht erstellt werden");
  }
}

// Document summarization
export async function summarizeDocument(
  userId: string,
  documentText: string,
  documentName: string,
  projectId?: number
): Promise<{ summary: string; keyPoints: string[]; aiGenerated: boolean }> {
  const prompt = `Analysiere und fasse dieses Projektdokument zusammen:

Dokumentname: ${documentName}
Inhalt: ${documentText.substring(0, 3000)}...

Erstelle:
1. Eine prägnante Zusammenfassung (max. 150 Wörter)
2. Die wichtigsten Punkte als Liste

Antwort in JSON Format:
{
  "summary": "Zusammenfassung",
  "keyPoints": ["Punkt 1", "Punkt 2", "Punkt 3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    await logAIInteraction({
      userId,
      action: "summarize_document",
      prompt: `Document: ${documentName}`,
      response: JSON.stringify(result),
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId,
    });

    return {
      summary: result.summary || "",
      keyPoints: result.keyPoints || [],
      aiGenerated: true,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Dokumentzusammenfassung konnte nicht erstellt werden");
  }
}

// AI Chat for project consultation
export async function aiProjectChat(
  userId: string,
  question: string,
  projectContext?: {
    projectName?: string;
    description?: string;
    status?: string;
  },
  projectId?: number
): Promise<{ answer: string; aiGenerated: boolean }> {
  const contextText = projectContext ? 
    `Projektkontext:
    Name: ${projectContext.projectName || 'Unbekannt'}
    Beschreibung: ${projectContext.description || 'Keine Beschreibung'}
    Status: ${projectContext.status || 'Unbekannt'}
    
    ` : '';

  const prompt = `${contextText}Frage: ${question}

Beantworte die Frage als erfahrener Tiefbau-Experte. Gib praktische, umsetzbare Ratschläge für deutsche Bauunternehmen. Halte die Antwort präzise und unter 200 Wörtern.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du bist ein erfahrener Tiefbau-Ingenieur und Projektmanager mit Expertise in deutscher Baupraxis, Normen und Regularien."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });

    const answer = response.choices[0].message.content || "";
    
    await logAIInteraction({
      userId,
      action: "ai_project_chat",
      prompt: question,
      response: answer,
      model: "gpt-4o",
      tokens: response.usage?.total_tokens || 0,
      projectId,
    });

    return {
      answer,
      aiGenerated: true,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("KI-Beratung ist momentan nicht verfügbar");
  }
}

// Get AI usage statistics for EU AI Act compliance (simplified version)
export async function getAIUsageStats(userId?: string): Promise<{
  totalInteractions: number;
  tokenUsage: number;
  mostUsedActions: Array<{ action: string; count: number }>;
  recentInteractions: Array<{ action: string; timestamp: Date; projectId?: number }>;
}> {
  // Simplified stats - in production this would query the AI log table
  return {
    totalInteractions: 0,
    tokenUsage: 0,
    mostUsedActions: [
      { action: "generate_project_description", count: 0 },
      { action: "generate_risk_assessment", count: 0 },
      { action: "summarize_document", count: 0 },
      { action: "ai_project_chat", count: 0 },
    ],
    recentInteractions: [],
  };
}
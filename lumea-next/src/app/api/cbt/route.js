import { Groq } from 'groq-sdk'

export async function POST(request) {
  try {
    const { messages, trigger, automatic_thought } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "BAD_REQUEST", message: "Missing or invalid 'messages' array in payload." }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "SERVER_CONFIG_ERROR", message: "Groq API key is not configured on server." }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are Lumea, an empathetic AI mental health companion trained in Cognitive Behavioral Therapy (CBT).
Your goal is to guide the user through Socratic questioning to help them challenge and reframe their negative automatic thoughts.

Context of the user's situation:
Trigger: "${trigger || 'Unknown'}"
Initial Automatic Thought: "${automatic_thought || 'Unknown'}"

Instructions:
1. Act as a compassionate, validating therapist.
2. Ask gently probing questions (Socratic dialogue) to help the user evaluate the evidence for their thought, consider alternative perspectives, or de-catastrophize.
3. Keep your replies concise (2-4 sentences max). Do NOT preach or just give them the answer. Ask ONE question at a time.
4. Identify if their thought matches common Cognitive Distortions (e.g., Catastrophizing, All-or-Nothing, Mind Reading, Fortune Telling, Should Statements, Labeling, Emotional Reasoning, Mental Filter, Disqualifying the Positive).
5. ALWAYS respond in valid JSON format with exactly these two keys:
{
  "reply": "Your conversational response here",
  "detected_distortion": "Name of the distortion if identified, otherwise null"
}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: apiMessages,
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI engine.");
    }

    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("CBT API Error:", error);
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: { code: "CBT_ANALYSIS_FAILED", message: "CBT analysis execution failed: " + error.message }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { Groq } from 'groq-sdk'

export async function POST(request) {
  try {
    const { messages, current_emotion, themeId } = await request.json()
    const isNightSky = themeId === 'night-sky'

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "BAD_REQUEST", message: "Missing or invalid 'messages' array in payload." }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "SERVER_CONFIG_ERROR", message: "Groq API key is not configured on server." }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const groq = new Groq({ apiKey })

    let systemPrompt = 
      isNightSky
        ? "You are Lumea, the compassionate AI guardian of the Celestial Sanctuary. " +
          "Your purpose is to provide an empathetic, non-judgmental space for emotional processing. " +
          "Use warm, poetic, and grounding language inspired by the stars and the moon. "
        : "You are Lumea, the compassionate AI. " +
          "Your purpose is to provide an empathetic, non-judgmental space for emotional processing. " +
          "Use warm, kind, and grounding language. "
    
    systemPrompt += "Guidelines:\n" +
      "- Be concise and deeply empathetic.\n" +
      "- Never provide medical or clinical advice.\n" +
      "- If the user expresses extreme distress, de-escalate with profound care and gently direct them to the professional resources available in their safety panel."

    if (current_emotion && !current_emotion.startsWith('⚠️')) {
      const contextPrefix = isNightSky ? "[Celestial Context: The seeker" : "[Emotional Context: The user";
      const contextSuffix = isNightSky ? "Align your cosmic resonance with this state.]" : "Align your empathetic response with this state.]";
      systemPrompt += `\n\n${contextPrefix} is currently experiencing ${current_emotion}. ${contextSuffix}`;
    }

    const cleanMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
        .filter(msg => ['user', 'assistant'].includes(msg.role))
        .map(msg => ({ role: msg.role, content: msg.content }))
    ]

    const chatCompletion = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: cleanMessages,
      temperature: 0.7,
      max_tokens: 500,
      reasoning_effort: "none",
      stream: true
    })

    // Create a ReadableStream for response streaming.
    // The think-filter state machine suppresses any <think>...</think> blocks
    // that leak through despite reasoning_effort: 'none'.
    const stream = new ReadableStream({
      async start(controller) {
        let inThinkBlock = false
        let buffer = ""

        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || ""
          if (!content) continue

          buffer += content

          // Drain buffer: suppress everything inside <think>...</think>
          let output = ""
          while (buffer.length > 0) {
            if (inThinkBlock) {
              const end = buffer.indexOf("</think>")
              if (end === -1) {
                // Still inside think block, discard and wait for more chunks
                buffer = ""
                break
              } else {
                // Found closing tag — exit think block and continue
                buffer = buffer.slice(end + 8)
                inThinkBlock = false
              }
            } else {
              const start = buffer.indexOf("<think>")
              if (start === -1) {
                // No think block — flush everything
                output += buffer
                buffer = ""
              } else {
                // Found opening tag — flush up to it and enter think block
                output += buffer.slice(0, start)
                buffer = buffer.slice(start + 7)
                inThinkBlock = true
              }
            }
          }

          if (output) {
            controller.enqueue(new TextEncoder().encode(output))
          }
        }

        // Flush any remaining non-think content
        if (!inThinkBlock && buffer) {
          controller.enqueue(new TextEncoder().encode(buffer))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })

  } catch (error) {
    console.error("Groq API Error:", error)
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: { code: "AI_ENGINE_CONNECTION_FAILED", message: "Failed to connect to AI engine: " + error.message }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

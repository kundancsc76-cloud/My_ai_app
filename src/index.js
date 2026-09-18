export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { prompt } = await request.json();

        if (!prompt || !prompt.trim()) {
          return new Response(
            JSON.stringify({ error: "Prompt is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: data.error?.message || "Gemini API error"
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        const answer =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "AI ne koi response nahi diya.";

        return new Response(
          JSON.stringify({ answer }),
          {
            headers: { "Content-Type": "application/json" }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Server error" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

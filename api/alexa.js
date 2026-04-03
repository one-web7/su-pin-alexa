export default function handler(req, res) {
  return new Response(JSON.stringify({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "マッコ、スーピンだよ。何する？"
      },
      shouldEndSession: false
    }
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

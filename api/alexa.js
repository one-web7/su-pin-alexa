export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.json({ ok: true, message: "Alexaエンドポイントは稼働中です" });
  }

  const body = req.body;

  const requestType = body?.request?.type;

  // 👇 これが超重要
  if (requestType === "LaunchRequest") {
    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "マッコ、スーピンだよ。何する？",
        },
        shouldEndSession: false,
      },
    });
  }

  // fallback
  return res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "ごめん、うまく処理できなかった",
      },
      shouldEndSession: false,
    },
  });
}

export default function handler(req, res) {
  const requestType = req.body?.request?.type;

  if (requestType === "LaunchRequest") {
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "マッコ、スーピンだよ。何する？"
        },
        shouldEndSession: false
      }
    });
  }

  return res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "テスト成功"
      },
      shouldEndSession: false
    }
  });
}

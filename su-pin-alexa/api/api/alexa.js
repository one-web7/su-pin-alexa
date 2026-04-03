  const requestType = req.body.request.type;
  const intent = req.body.request.intent?.name || "unknown";

  let text = "マッコに最適な提案をする";

  if (requestType === "LaunchRequest") {
    text = "マッコ、どうする？案件整理？営業？投稿？";
  }

  if (intent === "ankenseiriIntent") text = "案件整理して";
  if (intent === "eigyoIntent") text = "営業トーク作って";
  if (intent === "postIntent") text = "SNS投稿作って";
  if (intent === "nextIntent") text = "次なにやる？";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたはスーピン。マッコ専用AI。結論から短く答える"
        },
        {
          role: "user",
          content: text
        }
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "うまく応答できませんでした。";

  res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: reply
      },
      shouldEndSession: false
    }
  });
}

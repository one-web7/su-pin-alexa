export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const requestType = body?.request?.type || "";
    const intentName = body?.request?.intent?.name || "";
    const slots = body?.request?.intent?.slots || {};

    const reply = (text, endSession = false) => {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text
          },
          shouldEndSession: endSession
        }
      });
    };

    if (requestType === "LaunchRequest") {
      return reply("マッコ、スーピンだよ。何でも聞いて。");
    }

    let userText = "";

    if (requestType === "IntentRequest") {
      // utterance があれば最優先
      userText = slots?.utterance?.value || "";

      // utterance が空なら intent名をそのまま投げる
      if (!userText) {
        userText = intentName || "";
      }
    }

    if (!userText) {
      return reply("ごめん、もう一回言って。");
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "あなたはスーピン。マッコ専用の秘書AI。何でも答える。音声で読み上げやすい短い日本語で答える。"
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await openaiResponse.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() || "うまく答えられなかった。";

    return reply(text);

  } catch (e) {
    console.error(e);
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "エラーが出た。"
        },
        shouldEndSession: false
      }
    });
  }
}

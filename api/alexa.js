export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const requestType = body?.request?.type || "";
    const intentName = body?.request?.intent?.name || "";
    const slots = body?.request?.intent?.slots || {};

    // Alexa向けは必ずこの形で返す
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

    // ブラウザ確認用
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "Alexaエンドポイントは稼働中です"
      });
    }

    // 起動
    if (requestType === "LaunchRequest") {
      return reply("マッコ、スーピンだよ。何する？");
    }

    // 終了
    if (requestType === "SessionEndedRequest") {
      return res.status(200).json({});
    }

    // 標準
    if (intentName === "AMAZON.StopIntent" || intentName === "AMAZON.CancelIntent") {
      return reply("また呼んでね、マッコ。", true);
    }

    if (intentName === "AMAZON.HelpIntent") {
      return reply("たとえば、次なに、案件整理して、話して 今日なにやるべき、みたいに言ってね。");
    }

    let userText = "";

    if (intentName === "ankenseiriIntent") userText = "案件整理して";
    if (intentName === "eigyoIntent") userText = "営業トーク作って";
    if (intentName === "postIntent") userText = "SNS投稿作って";
    if (intentName === "nextIntent") userText = "次なにやる？";
    if (intentName === "chatIntent") userText = slots?.utterance?.value || "";

    if (!userText) {
      return reply("ごめん、もう一回言って。");
    }

    if (!process.env.OPENAI_API_KEY) {
      return reply("OpenAIのAPIキーが未設定だよ。");
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
            content: "あなたはスーピン。マッコ専用AI。結論から、短く、やさしく、実用的に日本語で答える。音声で読み上げやすい自然な文にする。"
          },
          {
            role: "user",
            content: userText
          }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", data);
      return reply("OpenAIとの通信でエラーが出たよ。");
    }

    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "ごめん、うまく考えがまとまらなかった。";

    return reply(text);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "サーバー側でエラーが出たよ。"
        },
        shouldEndSession: false
      }
    });
  }
}

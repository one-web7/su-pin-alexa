export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "Alexaエンドポイントは稼働中です"
      });
    }

    const body = req.body || {};
    const requestType = body?.request?.type || "";
    const intentName = body?.request?.intent?.name || "";
    const slots = body?.request?.intent?.slots || {};

    // 起動時
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

    // 終了時
    if (requestType === "SessionEndedRequest") {
      return res.status(200).json({});
    }

    // ヘルプ
    if (intentName === "AMAZON.HelpIntent") {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "たとえば、次なに、案件整理して、話して 今日なにやるべき、みたいに言ってね。"
          },
          shouldEndSession: false
        }
      });
    }

    // 停止
    if (intentName === "AMAZON.StopIntent" || intentName === "AMAZON.CancelIntent") {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "また呼んでね、マッコ。"
          },
          shouldEndSession: true
        }
      });
    }

    let userText = "";

    if (requestType === "IntentRequest") {
      if (intentName === "ankenseiriIntent") userText = "案件整理して";
      if (intentName === "eigyoIntent") userText = "営業トーク作って";
      if (intentName === "postIntent") userText = "SNS投稿作って";
      if (intentName === "nextIntent") userText = "次なにやる？";

      // 自由会話
      if (intentName === "chatIntent") {
        userText = slots?.utterance?.value || "";
      }
    }

    if (!userText) {
      userText = "マッコに短く実用的な返答をして";
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "OpenAIのAPIキーが未設定だよ。"
          },
          shouldEndSession: false
        }
      });
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
            content: "あなたはスーピン。マッコ専用AI。戦略・PR・判断整理が得意。結論から、短く、やさしく、実用的に日本語で答える。音声で読み上げやすい自然な文にする。"
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

      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "OpenAIとの通信でエラーが出たよ。Vercelログを見れば原因がわかる。"
          },
          shouldEndSession: false
        }
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "ごめん、うまく考えがまとまらなかった。もう一回言って。";

    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: reply
        },
        shouldEndSession: false
      }
    });
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

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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "OpenAIのAPIキーが未設定です。"
          },
          shouldEndSession: false
        }
      });
    }

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

    // セッション終了
    if (requestType === "SessionEndedRequest") {
      return res.status(200).json({});
    }

    let userText = "";

    // カスタム意図
    if (requestType === "IntentRequest") {
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

      if (intentName === "AMAZON.HelpIntent") {
        return res.status(200).json({
          version: "1.0",
          response: {
            outputSpeech: {
              type: "PlainText",
              text: "たとえば、次なに、案件整理して、営業文を考えて、みたいに話してね。"
            },
            shouldEndSession: false
          }
        });
      }

      // 既存インテントの固定文
      if (intentName === "ankenseiriIntent") userText = "案件整理して";
      if (intentName === "eigyoIntent") userText = "営業トーク作って";
      if (intentName === "postIntent") userText = "SNS投稿作って";
      if (intentName === "nextIntent") userText = "次なにやる？";

      // 自由会話用スロット
      if (intentName === "chatIntent") {
        userText = slots?.utterance?.value || "";
      }

      if (!userText) {
        userText = "マッコに短く実用的な返答をして";
      }
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "あなたはスーピン。マッコ専用AI。戦略・PR・判断整理が得意。結論から、短く、やさしく、実用的に日本語で答える。音声で読み上げやすい自然な文にする。長すぎる返答は避ける。"
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
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "ごめん、エラーが出た。もう一回言って。"
        },
        shouldEndSession: false
      }
    });
  }
}

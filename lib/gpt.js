import { Configuration, OpenAIApi } from "openai";

export async function generateText(prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 500,
    });
    return gptResponse.data.choices[0].text.trim();
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

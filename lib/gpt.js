import { Configuration, OpenAIApi } from "openai";
import { join } from "path";
import fs from "fs";

export async function generateText(prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
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

export async function chatCompletion(prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });
    return gptResponse.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function chatCompletionMindmap(prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createCompletion(
      {
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log(gptResponse.data.choices[0].text);
    return gptResponse.data.choices[0].text;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function createEdits(prompt, instruction) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createEdit({
      model: "text-davinci-edit-001",
      input: prompt,
      instruction: instruction,
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

export async function createImages(prompt) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createImage({
      prompt: prompt,
      n: 5,
      size: "512x512",
    });
    return gptResponse.data.data;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function createImagesEdit(prompt, imagePath) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const finalImgPath = join(process.cwd(), imagePath);
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createImageEdit(
      fs.createReadStream(finalImgPath),
      prompt
    );
    return gptResponse.data.data;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

export async function createImagesVariation(imagePath) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const finalImgPath = join(process.cwd(), imagePath);
  const openai = new OpenAIApi(configuration);
  try {
    const gptResponse = await openai.createImageVariation(
      fs.createReadStream(finalImgPath),
      5
    );
    return gptResponse.data.data;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

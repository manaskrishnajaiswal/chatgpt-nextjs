import {
  chatCompletion,
  createEdits,
  createImages,
  createImagesEdit,
  generateText,
} from "@/lib/gpt";

export async function generateTextPost(req, res) {
  const { inputText } = req.body;
  try {
    const generatedText = await generateText(inputText);
    res.status(200).send({
      message: "Text generated successfully!!",
      generatedText: generatedText,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
}

export async function createChatCompletionPost(req, res) {
  const { inputText } = req.body;
  try {
    const generatedChatResponse = await chatCompletion(inputText);
    res.status(200).send({
      message: "Chat generated successfully!!",
      generatedChatResponse: generatedChatResponse,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
}

export async function createEditsPost(req, res) {
  const { inputText, inputInstruction } = req.body;
  try {
    const generatedEditResponse = await createEdits(
      inputText,
      inputInstruction
    );
    res.status(200).send({
      message: "Response generated successfully!!",
      generatedEditResponse: generatedEditResponse,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
}

export async function createImagePost(req, res) {
  const { inputText } = req.body;
  try {
    const generatedImageResponse = await createImages(inputText);
    res.status(200).send({
      message: "Images generated successfully!!",
      generatedImageResponse: generatedImageResponse,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
}

export async function createImageEditPost(req, res) {
  const { inputText, inputImage } = req.body;
  try {
    const generatedImageResponse = await createImagesEdit(
      inputText,
      inputImage
    );
    res.status(200).send({
      message: "Images generated successfully!!",
      generatedImageResponse: generatedImageResponse,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .send({ message: "Internal Server error", error: error.message });
  }
}

import { generateText } from "@/lib/gpt";

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

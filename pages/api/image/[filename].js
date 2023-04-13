import { unlink } from "fs/promises";
import { join } from "path";

const deleteImage = async (req, res) => {
  try {
    const { filename } = req.query;
    const imagePath = join(process.cwd(), "/public/images", filename);
    await unlink(imagePath);
    res.json({ done: "ok" });
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
};

export default deleteImage;

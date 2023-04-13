import { readdir } from "fs/promises";
import { join } from "path";
import formidable from "formidable";
import fs from "fs/promises";
import sharp from "sharp";

const readFile = (req, saveLocally) => {
  const options = {};
  if (saveLocally) {
    options.uploadDir = join(process.cwd(), "/public/images");
    options.filename = (name, ext, path, form) => {
      return Date.now().toString() + "_" + path.originalFilename;
    };
  }
  options.maxFileSize = 4000 * 1024 * 1024;
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) reject(err);
      const { mimetype, size, filepath: filepath } = files.myImage;
      if (mimetype !== "image/png" || size > options.maxFileSize) {
        await fs.unlink(filepath);
        return reject({ error: "Invalid file type or size" });
      }
      console.log(filepath);
      const image = await sharp(filepath);
      const { width, height } = await image.metadata();
      if (width !== height) {
        await fs.unlink(filepath);
        return reject({ error: "Image must be square" });
      }
      resolve({ fields, files });
    });
  });
};

const handler = async (req, res) => {
  try {
    await readdir(join(process.cwd(), "/public/images"));
  } catch (error) {
    await fs.mkdir(join(process.cwd(), "/public/images"));
  }
  try {
    await readFile(req, true);
    res.json({ done: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

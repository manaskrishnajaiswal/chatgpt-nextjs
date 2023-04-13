import { readdir } from "fs/promises";
import { join } from "path";
import formidable from "formidable";
import fs from "fs/promises";

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
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
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
  await readFile(req, true);
  res.json({ done: "ok" });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

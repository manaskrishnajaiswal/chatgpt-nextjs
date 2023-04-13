import { useState } from "react";
import axios from "axios";
import { readdir } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import Image from "next/image";

const ImageHome = ({ dirs }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState();

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("myImage", selectedFile);
      const { data } = await axios.post("/api/image", formData);
      console.log(data);
      window.location.reload();
    } catch (error) {
      console.log(error.response?.data);
    }
    setUploading(false);
    setSelectedImage("");
    setSelectedFile();
  };

  return (
    <div className="max-w-4xl mx-auto p-20 space-y-6">
      <label>
        <input
          type="file"
          hidden
          onChange={({ target }) => {
            if (target.files) {
              const file = target.files[0];
              setSelectedImage(URL.createObjectURL(file));
              setSelectedFile(file);
            }
          }}
        />
        <div className="w-40 aspect-video rounded flex items-center justify-center border-2 border-dashed cursor-pointer">
          {selectedImage ? (
            <img src={selectedImage} alt="" />
          ) : (
            <span>Select Image</span>
          )}
        </div>
      </label>
      {selectedImage ? (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ opacity: uploading ? ".5" : "1" }}
          className="bg-red-600 mx-3 p-3 w-32 text-center rounded text-white"
        >
          {uploading ? "Uploading.." : "Upload"}
        </button>
      ) : (
        <button
          onClick={handleUpload}
          disabled
          style={{ opacity: uploading ? ".5" : "1" }}
          className="bg-red-600 mx-3 p-3 w-32 text-center rounded text-white"
        >
          {uploading ? "Uploading.." : "Upload"}
        </button>
      )}

      <div className="mt-20 flex flex-col w-40">
        <ul className="list-disc">
          {dirs.map((item) => (
            <li key={item}>
              <Link href={"/images/" + item}>
                <span className="text-blue-500 hover:underline">{item}</span>
                <Image
                  src={`/images/${item}`}
                  alt={item}
                  width={200}
                  height={200}
                />
              </Link>
              <br></br>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const props = { dirs: [] };
  try {
    const dirs = await readdir(join(process.cwd(), "/public/images"));
    props.dirs = dirs;
    return { props };
  } catch (error) {
    return { props };
  }
};

export default ImageHome;

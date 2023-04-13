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
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("myImage", selectedFile);
      const { data } = await axios.post("/api/image", formData);
      if (data?.error) {
        console.log(data.error.error);
        setErrorMessage(data.error.error);
      } else {
        console.log(data);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
    setUploading(false);
    setSelectedImage("");
    setSelectedFile();
  };

  const closeErrorHandler = () => {
    setErrorMessage("");
  };

  const imageRemoveHandler = async (filename) => {
    try {
      const response = await fetch(`/api/image/${filename}`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log(data);
      if (data?.error) {
        console.log(data.error.error);
        setErrorMessage(data.error.error);
      } else {
        if (data?.done == "ok") {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-20 space-y-6">
      {errorMessage && (
        <div className="h-10 p-2 flex justify-between rounded-md w-50 bg-red-500">
          <span className="px-3 font-bold">Error - {errorMessage}</span>
          <button
            onClick={closeErrorHandler}
            className="bg-yellow-500 border-yellow-500 text-yellow-50 px-4  border rounded-md hover:bg-yellow-200 hover:border-yellow-200 hover:text-gray-800 focus:outline-none"
          >
            X
          </button>
        </div>
      )}

      <label>
        <input
          disabled={dirs.length > 0}
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
      <div>
        <p>
          ** Must be a valid PNG file, less than 4MB, and square{" "}
          <span className="font-bold">Image</span>.
        </p>
        <p>
          ** Image can be uploaded once, delete current Image and upload again!!
        </p>
      </div>

      <div className="mt-20 flex flex-col w-40">
        <ul className="list-disc">
          {dirs.map((item) => (
            <li key={item} className="flex">
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
              <span
                className="mx-3 text-red-500 cursor-pointer"
                onClick={() => imageRemoveHandler(item)}
              >
                X
              </span>
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

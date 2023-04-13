import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import axios from "axios";
import Loader from "@/frontend/components/Loader";
import Image from "next/image";
import { readdir } from "fs/promises";
import { join } from "path";
import Link from "next/link";

export default function Home({ dirs }) {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loader, setLoader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const imageTempPath = `/public/images/${dirs[0]}`;
    const model = {
      inputText: prompt,
      inputImage: imageTempPath,
    };
    try {
      setGeneratedText("");
      setLoader(true);
      const { data } = await axios.post(
        "/api/chatgpt/chatgpt-createimageedit",
        model
      );
      setLoader(false);
      setGeneratedText(data);
      setPrompt("");
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  const clearTextHandler = (event) => {
    event.preventDefault();
    setGeneratedText("");
    setPrompt("");
  };

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
    <>
      <Head>
        <title>chatgpt - Create Images Edit</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
          integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <main className={styles.main}>
        <>
          <h1 className="text-xl md:text-5xl text-center font-bold py-10 border-b">
            OpenAI GPT Demo - Create Images Edit
          </h1>
          <div className="container mx-auto py-3">
            <div className="max-w-4xl mx-auto p-10 space-y-6 border-b-4">
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
                  ** Image can be uploaded once, delete current Image and upload
                  again!!
                </p>
              </div>

              <div className="mt-20 flex flex-col w-40">
                <ul className="list-disc">
                  {dirs.map((item) => (
                    <li key={item} className="flex">
                      <Link href={"/images/" + item}>
                        <span className="text-blue-500 hover:underline">
                          {item}
                        </span>
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
            <br></br>
            <br></br>

            <form onSubmit={handleSubmit}>
              <label htmlFor="prompt" className="text-xl font-bold">
                Enter a prompt:
              </label>
              <br></br>
              <textarea
                className="border px-2 py-2 focus:outline-none rounded-md"
                id="prompt"
                row={10}
                cols={50}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                required
              />
              <br></br>
              <br></br>
              <button
                type="submit"
                className="bg-green-500 border-green-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-green-200 hover:text-green-900 focus:outline-none"
              >
                Generate Images
              </button>
              <button
                onClick={clearTextHandler}
                className="mx-2 bg-red-500 border-red-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-red-200 hover:text-red-900 focus:outline-none"
              >
                Clear Images
              </button>
            </form>
            <br></br>
            <br></br>
            {loader ? <Loader /> : <></>}
            {generatedText && (
              <div className="py-5 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedText ? (
                  generatedText.generatedImageResponse.map((image, index) => (
                    <div key={index}>
                      <Image
                        src={image.url}
                        alt={prompt}
                        width={200}
                        height={200}
                      />
                    </div>
                  ))
                ) : (
                  <span className="text-xl font-bold">No Images Found.</span>
                )}
              </div>
            )}
          </div>
        </>
      </main>
    </>
  );
}

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

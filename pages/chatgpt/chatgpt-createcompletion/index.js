import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import axios from "axios";
import Loader from "@/frontend/components/Loader";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const model = {
      inputText: prompt,
    };
    try {
      setGeneratedText("");
      setLoader(true);
      const { data } = await axios.post("/api/chatgpt", model);
      setLoader(false);
      setGeneratedText(data);
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

  return (
    <>
      <Head>
        <title>chatgpt - Text Generation</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <h1>OpenAI GPT Demo - Text Generation</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="prompt">Enter a prompt:</label>
            <br></br>
            <textarea
              style={{ padding: "0.5rem" }}
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
              style={{ padding: "0.5rem" }}
              className={styles.btn1}
            >
              Generate Text
            </button>
            <button
              onClick={clearTextHandler}
              style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
              className={styles.btn2}
            >
              Clear Text
            </button>
          </form>
          <br></br>
          <br></br>
          {loader ? <Loader /> : <></>}
          {generatedText && (
            <div>
              <h2>Generated Text:</h2>
              <p style={{ textAlign: "justify" }}>
                {generatedText.generatedText}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

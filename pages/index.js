import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const textGenerationHandler = () => {
    router.push("/chatgpt/chatgpt-createcompletion");
  };
  const chatCompletionHandler = () => {
    router.push("/chatgpt/chatgpt-chatcompletion");
  };
  const createEditsHandler = () => {
    router.push("/chatgpt/chatgpt-createedits");
  };
  const createImageHandler = () => {
    router.push("/chatgpt/chatgpt-createimage");
  };
  return (
    <>
      <Head>
        <title>OPENAI GPT DEMO</title>
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
      <main className="py-2">
        <>
          <h1 className="text-xl md:text-5xl text-center font-bold py-10 border-b">
            OpenAI GPT Demo
          </h1>
          <div className="container mx-auto py-3">
            <ul className="list-disc">
              <li>
                <div>
                  <h3>Completions</h3>
                  <p>
                    Given a prompt, the model will return one or more predicted
                    completions, and can also return the probabilities of
                    alternative tokens at each position.
                  </p>
                  <button
                    className="bg-yellow-500 border-yellow-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-yellow-200 hover:border-yellow-200 hover:text-gray-800 focus:outline-none"
                    onClick={textGenerationHandler}
                  >
                    Try Completion
                  </button>
                </div>
              </li>
              <br></br>
              <li>
                <div>
                  <h3>Chat</h3>
                  <p>
                    Given a chat conversation, the model will return a chat
                    completion response.
                  </p>
                  <button
                    className="bg-yellow-500 border-yellow-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-yellow-200 hover:border-yellow-200 hover:text-gray-800 focus:outline-none"
                    onClick={chatCompletionHandler}
                  >
                    Try Chat Completion
                  </button>
                </div>
              </li>
              <br></br>
              <li>
                <div>
                  <h3>Edits</h3>
                  <p>
                    Given a prompt and an instruction, the model will return an
                    edited version of the prompt.
                  </p>
                  <button
                    className="bg-yellow-500 border-yellow-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-yellow-200 hover:border-yellow-200 hover:text-gray-800 focus:outline-none"
                    onClick={createEditsHandler}
                  >
                    Try Edits
                  </button>
                </div>
              </li>
              <br></br>
              <li>
                <div>
                  <h3>Images</h3>
                  <p>
                    Given a prompt and/or an input image, the model will
                    generate a new image.
                  </p>
                  <ol className="list-decimal mx-3">
                    <li>
                      <div>
                        <h4>Create Image</h4>
                        <p>
                          Given a prompt and/or an input image, the model will
                          generate a new image.
                        </p>
                        <button
                          className="bg-yellow-500 border-yellow-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-yellow-200 hover:border-yellow-200 hover:text-gray-800 focus:outline-none"
                          onClick={createImageHandler}
                        >
                          Try Create Image
                        </button>
                      </div>
                    </li>
                  </ol>
                </div>
              </li>
            </ul>
          </div>
        </>
      </main>
    </>
  );
}

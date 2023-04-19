import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";
import Loader from "@/frontend/components/Loader";
import Head from "next/head";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatgptMindmap = () => {
  const diagramRef = useRef(null);
  const diagramInstanceRef = useRef(null);

  const [nodeData, setNodeData] = useState({});
  console.log(nodeData);
  const [nodeDataArray, setNodeDataArray] = useState([]);
  console.log(nodeDataArray);

  const [prompt, setPrompt] = useState("");
  console.log(prompt);
  const [generatedText, setGeneratedText] = useState("");
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (!diagramRef.current) return;

    // dispose of previous Diagram instance
    if (diagramInstanceRef.current) {
      diagramInstanceRef.current.div = null;
      diagramInstanceRef.current = null;
    }

    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, diagramRef.current, {
      initialContentAlignment: go.Spot.Center,
      "undoManager.isEnabled": true,
    });

    // Define the node template with a button
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      { background: "yellow", resizable: true },
      $(go.Shape, { fill: "yellow" }, new go.Binding("fill", "color")),
      $(
        go.TextBlock,
        {
          margin: 10,
          textAlign: "center",
          stretch: go.GraphObject.Fill,
          width: 800,
          height: 500,
          overflow: go.TextBlock.OverflowEllipsis,
          font: "bold 50px sans-serif",
          editable: false,
          isMultiline: true,
          wrap: go.TextBlock.WrapFit,
        },
        new go.Binding("text", "text"),
        new go.Binding("stroke", "stroke")
      ),
      {
        click: (e, node) => {
          const buttonClicked = node;
          console.log(`Button clicked on node: ${buttonClicked}`);
          if (node.isTreeExpanded) {
            diagram.commandHandler.collapseTree(node);
          } else {
            diagram.commandHandler.expandTree(node);
          }
        },
      }
    );

    // Add nodes to the diagram
    diagram.model = $(go.TreeModel, {
      nodeDataArray: nodeDataArray,
    });

    // customize the layout of the tree
    diagram.layout = $(go.TreeLayout, {
      angle: 90,
      nodeSpacing: 20,
      layerSpacing: 80,
    });

    // Set the zoom level to 25%
    diagram.scale = 0.25;
    // Set minimum and maximum sizes for the nodes
    diagram.nodeTemplate.minSize = new go.Size(NaN, 50);
    diagram.nodeTemplate.maxSize = new go.Size(NaN, NaN);

    // store Diagram instance
    diagramInstanceRef.current = diagram;
  }, [diagramRef.current, nodeDataArray]);

  useEffect(() => {
    console.log(Object.keys(nodeData).length);
    if (Object.keys(nodeData).length !== 0) {
      dataJSONToMindmapConvertor(nodeData);
    }
  }, [nodeData]);

  // cleanup function
  useEffect(() => {
    return () => {
      if (diagramInstanceRef.current) {
        diagramInstanceRef.current.div = null;
        diagramInstanceRef.current = null;
      }
    };
  }, []);

  const dataJSONToMindmapConvertor = async (myData) => {
    // your async code here
    try {
      const jsonString = JSON.stringify(myData);
      console.log(jsonString);
      const jsonObject = JSON.parse(jsonString);
      console.log(jsonObject);
      console.log("JSON data is valid");
      const mindmapData = convertToTreeNodes(myData);
      console.log(mindmapData);
      setNodeDataArray([...nodeDataArray, ...mindmapData]);
    } catch (error) {
      console.error("JSON data is invalid", error);
    }
  };

  const promptHandleSubmit = async (event) => {
    event.preventDefault();
    if (generatedText) {
      setGeneratedText("");
      setNodeData([]);
      setNodeDataArray([
        {
          key: "R1",
          text: prompt,
          color: "brown",
          figure: "Rectangle",
        },
      ]);
    }
    if (nodeDataArray.length === 0) {
      setNodeDataArray([
        {
          key: "R1",
          text: prompt,
          color: "brown",
          figure: "Rectangle",
        },
      ]);
    }
    const model = {
      inputText:
        prompt +
        "Please provide mindmap. Please provide data in json format only and no other text.",
    };
    try {
      setGeneratedText("");
      setLoader(true);
      toast.success("Text Generation started!!");
      const { data } = await axios.post(
        "/api/chatgpt/chatgpt-chatcompletion-mindmap",
        model
      );
      setLoader(false);
      toast.success("Text Generation ended!!");
      setGeneratedText(data);
      const responseJSON = JSON.parse(
        data.generatedChatResponse.replace(/\n/g, "")
      );
      console.log(responseJSON);
      setNodeData(responseJSON);
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  const clearTextHandler = (event) => {
    event.preventDefault();
    setGeneratedText("");
    setPrompt("");
    setNodeData([]);
    setNodeDataArray([]);
  };

  return (
    <>
      <section>
        <Head>
          <title>ChatGpt MindMap</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Head>
        <ToastContainer position="bottom-right" />
        <main className="py-5">
          <>
            <h1 className="text-xl md:text-5xl text-center font-bold py-10 border-b">
              OpenAI GPT Demo - Chat Completion
            </h1>
            <div className="container mx-auto py-3">
              <div>
                <div className="flex">
                  <div className="mx-4">
                    <form onSubmit={promptHandleSubmit}>
                      <label htmlFor="prompt" className="text-xl font-bold">
                        Enter a prompt:
                      </label>
                      <br></br>
                      <textarea
                        className="border px-2 py-2 focus:outline-none rounded-md text-justify"
                        id="prompt"
                        rows={6}
                        cols={60}
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
                        {generatedText ? "Regenerate Chat" : "Generate Chat"}
                      </button>
                      <button
                        onClick={clearTextHandler}
                        className="mx-2 bg-red-500 border-red-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-red-200 hover:text-red-900 focus:outline-none"
                      >
                        Clear Chat
                      </button>
                    </form>
                  </div>
                  <div>
                    <>
                      <h2>Rules To Generate Mindmap:</h2>
                      <ul className="list-disc">
                        <li>Type in Prompt your requirement.</li>
                        <li>Wait, So that AI can geneate your data.</li>
                        <li>
                          If Your data is not upto mark, please generate again.
                        </li>
                        <li>
                          If Your mindmap is not generated, please generate
                          again.
                        </li>
                        <li>
                          Please rephrase your words, do not include any
                          technical IT terms.
                        </li>
                      </ul>
                    </>
                  </div>
                </div>

                <br></br>
                <br></br>
                {loader ? <Loader /> : <></>}
              </div>
              <div className="">
                {(generatedText || nodeDataArray.length !== 0 || true) && (
                  <div className="mx-auto">
                    {/* <div
                      className="mx-3"
                      style={{
                        width: "50%",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <h2 className="text-xl font-bold">Generated Chat:</h2>
                      <p style={{ textAlign: "justify" }} className="px-2">
                        {generatedText.generatedChatResponse.map((item) => (
                          <span key={item.index}>
                            {item.message.content}
                            <br></br>
                            <br></br>
                          </span>
                        ))}
                      </p>
                    </div> */}
                    <div
                      className="border rounded-md"
                      ref={diagramRef}
                      style={{
                        height: "600px",
                        width: "100%",
                        backgroundColor: "#f0f0f0",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </>

          <br />
        </main>
      </section>
    </>
  );
};

function convertToTreeNodes(data, parent = "R1") {
  var nodes = [];
  var nodeCount = 1;
  var nodeDataCount = 1;
  for (let key in data) {
    let value = data[key];
    if (typeof value === "string") {
      let node = {
        key: parent + "N" + nodeCount + "D" + nodeDataCount,
        parent: parent,
        text: value,
      };
      nodes.push(node);
    }
    if (typeof value === "object") {
      let node = {
        key: parent + "N" + nodeCount + "D" + nodeDataCount,
        parent: parent,
        text: typeof value === "object" ? key : value,
      };
      nodes.push(node);
      let children = convertToTreeNodes(
        value,
        parent + "N" + nodeCount + "D" + nodeDataCount
      );
      if (children.length !== 0) {
        nodes.push(...children);
      }
    }
    // console.log("For Loop - ", nodes)
    nodeDataCount++;
  }
  nodeCount++;
  //   console.log("Main - nodes", nodes)
  //   console.log("Main - dataArr", dataArr)
  return nodes;
}

export default ChatgptMindmap;

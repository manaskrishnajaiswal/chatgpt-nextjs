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

  const [rootData, setRootData] = useState("");
  console.log(rootData);
  const [nodeData, setNodeData] = useState([]);
  console.log(nodeData);
  const [nodeDataArray, setNodeDataArray] = useState([]);
  console.log(nodeDataArray);
  const [nodeSelected, setNodeSelected] = useState(false);
  console.log(nodeSelected);
  const [parentKey, setParentKey] = useState("R1");
  console.log(parentKey);
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
          setPrompt(node.data?.text);
          if (node.isTreeExpanded) {
            diagram.commandHandler.collapseTree(node);
          } else {
            diagram.commandHandler.expandTree(node);
          }
          var children = node.findTreeChildrenNodes(); // find all child nodes of the clicked node
          const nodeChildArr = [];
          children.each(function (child) {
            nodeChildArr.push(child.data.key);
            console.log(child.data.key); // log the key property of each child node to the console
          });

          if (nodeChildArr.length >= 3 || nodeData.length === 0) {
            if (nodeChildArr.length >= 3) {
              console.log("Only 3 child nodes can be added!!");
              toast.error("Only 3 child nodes can be added!!");
            } else if (nodeData.length === 0) {
              console.log("Please generate data for node!!");
              toast.error("Please generate data for node!!");
            }
          } else {
            setParentKey(node.data?.key);
          }
          if (nodeChildArr.length === 0) {
            setNodeSelected(true);
            setParentKey(node.data?.key);
          }
        },
      }
    );

    // Add nodes
    console.log(parentKey.length > 0 && nodeData.length === 3);
    if (
      parentKey.length > 0 &&
      nodeData.length === 3 &&
      nodeDataArray.length > 0
    ) {
      // const parentKey = node.data?.key;
      const tempChildList = [];
      for (let i = 1; i <= 3; i++) {
        const childKey = parentKey + "N" + i;
        const childData = {
          key: childKey,
          text: nodeData[i - 1]?.message.content,
          color: "#1ABC9C",
          figure: "Diamond",
          parent: parentKey,
        };
        tempChildList.push(childData);
      }
      setNodeDataArray([...nodeDataArray, ...tempChildList]);
      setNodeData([]);
    }

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
    diagram.scale = 0.125;
    // Set minimum and maximum sizes for the nodes
    diagram.nodeTemplate.minSize = new go.Size(NaN, 50);
    diagram.nodeTemplate.maxSize = new go.Size(NaN, NaN);

    if (nodeDataArray.length === 0 && rootData) {
      setNodeDataArray([
        {
          key: "R1",
          text: rootData,
          color: "brown",
          figure: "Rectangle",
        },
      ]);
      // setParentKey("R1");
    }

    // store Diagram instance
    diagramInstanceRef.current = diagram;
  }, [diagramRef.current, rootData, nodeData, nodeDataArray, parentKey]);

  useEffect(() => {
    if (nodeSelected && prompt.length > 0 && nodeData.length === 0) {
      nodefetchData();
    }
  }, [prompt, nodeSelected, nodeData]);

  // cleanup function
  useEffect(() => {
    return () => {
      if (diagramInstanceRef.current) {
        diagramInstanceRef.current.div = null;
        diagramInstanceRef.current = null;
      }
    };
  }, []);

  const nodefetchData = async () => {
    // your async code here
    const model = {
      inputText: prompt,
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
      setNodeSelected(false);
      setGeneratedText(data);
      setRootData(prompt);
      setNodeData([...data.generatedChatResponse]);
      setPrompt("");
    } catch (error) {
      setLoader(false);
      setNodeSelected(false);
      console.log(error);
    }
  };

  const promptHandleSubmit = async (event) => {
    event.preventDefault();
    const model = {
      inputText: prompt,
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
      setNodeSelected(false);
      setGeneratedText(data);
      setRootData(prompt);
      setNodeData([...data.generatedChatResponse]);
      setPrompt("");
    } catch (error) {
      setLoader(false);
      setNodeSelected(false);
      console.log(error);
    }
  };

  const clearTextHandler = (event) => {
    event.preventDefault();
    setGeneratedText("");
    setPrompt("");
    setRootData("");
    setNodeData([]);
    setNodeDataArray([]);
    setParentKey("R1");
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
            <div className="container flex mx-auto py-3">
              <div>
                <div className="flex">
                  <div className="mx-2">
                    <form onSubmit={promptHandleSubmit}>
                      <label htmlFor="prompt" className="text-xl font-bold">
                        Enter a prompt:
                      </label>
                      <br></br>
                      <textarea
                        className="border px-2 py-2 focus:outline-none rounded-md text-justify"
                        id="prompt"
                        rows={8}
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
                        Generate Chat
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
                    {nodeDataArray.length !== 0 && (
                      <>
                        <h2>Selected Node Data:</h2>
                        <p className="text-justify">{prompt}</p>
                      </>
                    )}
                  </div>
                </div>

                <br></br>
                <br></br>
                {loader ? <Loader /> : <></>}
                {(generatedText || nodeDataArray.length !== 0 || true) && (
                  <div className="mx-auto">
                    <div
                      className="border rounded-md"
                      ref={diagramRef}
                      style={{
                        height: "600px",
                        backgroundColor: "#f0f0f0",
                      }}
                    />
                  </div>
                )}
              </div>
              <div></div>
            </div>
          </>

          <br />
        </main>
      </section>
    </>
  );
};

export default ChatgptMindmap;

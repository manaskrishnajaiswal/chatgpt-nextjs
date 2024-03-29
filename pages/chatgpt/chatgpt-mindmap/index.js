import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";
import Loader from "@/frontend/components/Loader";
import Head from "next/head";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const colors = {
  beige: "#F5F5DC",
  ivory: "#FFFFF0",
  wheat: "#F5DEB3",
  lightYellow: "#FFFFE0",
  lavender: "#E6E6FA",
  mistyRose: "#FFE4E1",
  lightBlue: "#ADD8E6",
  lightPink: "#FFB6C1",
  lemonChiffon: "#FFFACD",
  paleGoldenrod: "#EEE8AA",
  cornsilk: "#FFF8DC",
  mintCream: "#F5FFFA",
  aliceBlue: "#F0F8FF",
  floralWhite: "#FFFAF0",
  honeydew: "#F0FFF0",
  oldLace: "#FDF5E6",
  seashell: "#FFF5EE",
  lightCyan: "#E0FFFF",
  lavenderBlush: "#FFF0F5",
  lightGoldenrodYellow: "#FAFAD2",
  papayaWhip: "#FFEFD5",
};

const ChatgptMindmap = () => {
  const diagramRef = useRef(null);
  const diagramInstanceRef = useRef(null);

  const [nodeData, setNodeData] = useState({});
  console.log(nodeData);
  const [nodeDataArray, setNodeDataArray] = useState([]);
  console.log(nodeDataArray);
  const [selectedNodeKey, setSelectedNodeKey] = useState("");
  console.log(selectedNodeKey);

  const [prompt, setPrompt] = useState("");
  console.log(prompt);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState([]);
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
      layout: $(go.TreeLayout, {
        angle: 90,
        arrangementSpacing: new go.Size(100, 100),
        compaction: go.TreeLayout.CompactionBlock,
        alternateAngle: 0,
        alternateAlignment: go.TreeLayout.AlignmentCenter,
      }),
      // when the user drags a node, also move/copy/delete the whole subtree starting with that node
      "commandHandler.copiesTree": true,
      "commandHandler.copiesParentKey": true,
      "commandHandler.deletesTree": true,
      "draggingTool.dragsTree": true,
      "undoManager.isEnabled": true,
    });

    diagram.contextMenu = $(go.Adornment);
    // the context menu allows users to change the font size and weight,
    // and to perform a limited tree layout starting at that node
    var nodeMenu = $(
      "ContextMenu",
      $(
        "ContextMenuButton",
        $(
          go.Panel, // Added a panel to center the content in the node
          go.Panel.Auto,
          {
            stretch: go.GraphObject.Fill,
            alignment: go.Spot.Center,
            margin: 1,
            width: 50,
            height: 30,
          },
          $(
            go.Shape,
            "RoundedRectangle",
            {
              fill: $(go.Brush, "Linear", {
                0: "white",
                1: "#E6F4F1",
              }),
              stroke: null,
              strokeWidth: 0,
            },
            new go.Binding("fill", "color")
          ),
          $(
            go.TextBlock,
            {
              textAlign: "center",
              overflow: go.TextBlock.OverflowEllipsis,
              font: "bold 10px sans-serif",
              editable: false,
              isMultiline: true,
              wrap: go.TextBlock.WrapFit,
              stroke: "#444",
            },
            "Delete"
          )
        ),
        {
          click: (e, obj) => e.diagram.commandHandler.deleteSelection(),
        }
      ),
      $(
        "ContextMenuButton",
        $(
          go.Panel, // Added a panel to center the content in the node
          go.Panel.Auto,
          {
            stretch: go.GraphObject.Fill,
            alignment: go.Spot.Center,
            margin: 1,
            width: 100,
            height: 30,
          },
          $(
            go.Shape,
            "RoundedRectangle",
            {
              fill: $(go.Brush, "Linear", {
                0: "white",
                1: "#E6F4F1",
              }),
              stroke: null,
              strokeWidth: 0,
            },
            new go.Binding("fill", "color")
          ),
          $(
            go.TextBlock,
            {
              textAlign: "center",
              overflow: go.TextBlock.OverflowEllipsis,
              font: "bold 10px sans-serif",
              editable: false,
              isMultiline: true,
              wrap: go.TextBlock.WrapFit,
              stroke: "#444",
            },
            "Generate Child Nodes"
          )
        ),
        {
          click: async (e, obj) => {
            var contextmenu = obj.part; // get the context menu
            var node = contextmenu.adornedPart; // get the adorned Part, i.e. the node
            if (node) {
              console.log(node.data.text);
              var key = node.data.key; // get the node key
              console.log(
                "Generate Child Nodes clicked on node with key:",
                key
              );
              setSelectedNodeKey(key);
              const newNodePrompt = await fetchPrompt(key);
              console.log(newNodePrompt);
              // generate child nodes here
              await nodefetchData(node.data.text);
            } else {
              console.log("No node found");
            }
          },
        }
      ),
      $(
        "ContextMenuButton",
        $(
          go.Panel, // Added a panel to center the content in the node
          go.Panel.Auto,
          {
            stretch: go.GraphObject.Fill,
            alignment: go.Spot.Center,
            margin: 1,
            width: 100,
            height: 30,
          },
          $(
            go.Shape,
            "RoundedRectangle",
            {
              fill: $(go.Brush, "Linear", {
                0: "white",
                1: "#E6F4F1",
              }),
              stroke: null,
              strokeWidth: 0,
            },
            new go.Binding("fill", "color")
          ),
          $(
            go.TextBlock,
            {
              textAlign: "center",
              overflow: go.TextBlock.OverflowEllipsis,
              font: "bold 10px sans-serif",
              editable: false,
              isMultiline: true,
              wrap: go.TextBlock.WrapFit,
              stroke: "#444",
            },
            "Generate Image"
          )
        ),
        {
          click: async (e, obj) => {
            var contextmenu = obj.part; // get the context menu
            var node = contextmenu.adornedPart; // get the adorned Part, i.e. the node
            if (node) {
              console.log(node.data.text);
              var key = node.data.key; // get the node key
              console.log(
                "Generate Image Child Node clicked on node with key:",
                key
              );
              // setSelectedNodeKey(key);
              // const newNodePrompt = await fetchPrompt(key);
              // console.log(newNodePrompt);
              // generate child nodes here
              const genImages = await handleImageGenerate(node.data.text);
              console.log(genImages);
              let randomNumber = Math.floor(Math.random() * 5);
              const imgNode = {
                key: "I" + randomNumber,
                parent: key,
                source: genImages.generatedImageResponse[randomNumber]["url"],
                color:
                  colors[
                    Object.keys(colors)[
                      Math.floor(Math.random() * Object.keys(colors).length)
                    ]
                  ],
                figure: "Rectangle",
              };
              setNodeDataArray([...nodeDataArray, imgNode]);
            } else {
              console.log("No node found");
            }
          },
        }
      )
    );

    // Define the node template with a button
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        background: "white",
        resizable: true,
        selectionAdornmentTemplate: $(
          go.Adornment,
          "Auto",
          $(go.Shape, "RoundedRectangle", {
            fill: null,
            stroke: "deepskyblue",
            strokeWidth: 2,
          }),
          $(go.Placeholder)
        ),
        contextMenu: nodeMenu,
      },
      $(
        go.Panel, // Added a panel to center the content in the node
        go.Panel.Auto,
        {
          stretch: go.GraphObject.Fill,
          alignment: go.Spot.Center,
          margin: 10,
          width: 800,
          height: 500,
        },
        $(
          go.Shape,
          "RoundedRectangle",
          {
            fill: $(go.Brush, "Linear", {
              0: "white",
              1: "#E6F4F1",
            }),
            stroke: null,
            strokeWidth: 0,
          },
          new go.Binding("fill", "color")
        ),
        $(
          go.Picture, // added a Picture object to display an image
          {
            margin: 10,
            width: 700,
            height: 400,
            background: "white",
          },
          new go.Binding("source", "source") // bound to the "source" property of the node data
        ),
        $(
          go.TextBlock,
          {
            textAlign: "center",
            overflow: go.TextBlock.OverflowEllipsis,
            font: "bold 50px sans-serif",
            editable: false,
            isMultiline: true,
            wrap: go.TextBlock.WrapFit,
            stroke: "#444",
          },
          new go.Binding("text", "text"),
          new go.Binding("stroke", "stroke")
        )
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
      dataJSONToMindmapConvertor(nodeData, selectedNodeKey);
      setNodeData({});
    }
  }, [nodeData, selectedNodeKey]);

  // cleanup function
  useEffect(() => {
    return () => {
      if (diagramInstanceRef.current) {
        diagramInstanceRef.current.div = null;
        diagramInstanceRef.current = null;
      }
    };
  }, []);

  const dataJSONToMindmapConvertor = async (myData, mySelectedNodeKey) => {
    // your async code here
    try {
      const jsonString = JSON.stringify(myData);
      console.log(jsonString);
      const jsonObject = JSON.parse(jsonString);
      console.log(jsonObject);
      console.log("JSON data is valid");
      if (mySelectedNodeKey.length > 0) {
        const mindmapData = convertToTreeNodes(myData, mySelectedNodeKey);
        console.log(mindmapData);
        setNodeDataArray([...nodeDataArray, ...mindmapData]);
      } else {
        const mindmapData = convertToTreeNodes(myData);
        console.log(mindmapData);
        setNodeDataArray([...nodeDataArray, ...mindmapData]);
      }
    } catch (error) {
      console.error("JSON data is invalid", error);
      toast.alert("Not able to generate Text, Please try again!");
      alert("Error fetching data, try again!");
    }
  };

  const fetchPrompt = async (nodeKeyId) => {
    function fetchPromptData(data, nodeKey) {
      var nodesText = "";
      var parentKey = "";
      for (let i = 0; i < data.length; i++) {
        if (data[i]["key"] === nodeKey) {
          nodesText = data[i]["text"] + ". " + nodesText;
          parentKey = data[i]["parent"];
          let parentNodesText = fetchPromptData(data, parentKey);
          if (parentNodesText.length !== 0) {
            nodesText = parentNodesText + nodesText;
          }
        }
      }
      return nodesText;
    }

    const traversedPrompt = fetchPromptData(nodeDataArray, nodeKeyId);
    console.log(traversedPrompt);
    return traversedPrompt;
  };

  const nodefetchData = async (customPrompt) => {
    // your async code here
    const model = {
      inputText: ` Please refer text in inverted commas """${customPrompt}""" and Please provide mindmap. Please do not include data in Array format strictly and only Objects of Objects format and also include respective data in each object also. Please provide data in json format only and no other text. Response should always between {} parenthesis.`,
    };
    console.log(model["inputText"]);
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
      console.log(data);
      const responseJSON = JSON.parse(
        data.generatedChatResponse.replace(/\n/g, "")
      );
      console.log(responseJSON);
      setNodeData(responseJSON);
    } catch (error) {
      setLoader(false);
      toast.error("Error fetching data, try again!");
      alert("Error fetching data, try again!");
      console.log(error);
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
          color:
            colors[
              Object.keys(colors)[
                Math.floor(Math.random() * Object.keys(colors).length)
              ]
            ],
          figure: "Rectangle",
        },
      ]);
    }
    if (nodeDataArray.length === 0) {
      setNodeDataArray([
        {
          key: "R1",
          text: prompt,
          color:
            colors[
              Object.keys(colors)[
                Math.floor(Math.random() * Object.keys(colors).length)
              ]
            ],
          figure: "Rectangle",
        },
      ]);
    }
    const model = {
      inputText:
        prompt +
        "Please provide mindmap. Please do not include data in Array format strictly and only Objects of Objects format and also include respective data in each object also. Please provide data in json format only and no other text.",
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
      toast.error("Error fetching data, try again!");
      alert("Error fetching data, try again!");
      console.log(error);
    }
  };

  const handleImageGenerate = async (imagePrompt) => {
    const model = {
      inputText: imagePrompt,
    };
    console.log(model);
    try {
      setGeneratedImage("");
      setLoader(true);
      toast.success("Image Generation started!!");
      const { data } = await axios.post(
        "/api/chatgpt/chatgpt-createimage",
        model
      );
      setLoader(false);
      toast.success("Image Generation ended!!");
      setGeneratedImage(data);
      return data;
    } catch (error) {
      setLoader(false);
      toast.error("Error fetching data, try again!");
      alert("Error fetching data, try again!");
      console.log(error);
    }
  };

  const clearTextHandler = (event) => {
    event.preventDefault();
    setGeneratedText("");
    setPrompt("");
    setNodeData([]);
    setNodeDataArray([]);
    setSelectedNodeKey("");
    setGeneratedImage([]);
  };

  // Toggle full screen on button click
  const toggleFullScreen = () => {
    const elem = diagramRef.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
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
              OpenAI GPT Demo - Generate MindMap
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
                        {generatedText
                          ? "Regenerate MindMap"
                          : "Generate MindMap"}
                      </button>
                      <button
                        onClick={clearTextHandler}
                        className="mx-2 bg-red-500 border-red-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-red-200 hover:text-red-900 focus:outline-none"
                      >
                        Clear MindMap
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
                    <button
                      className="bg-green-500 border-green-500 text-yellow-50 px-4 py-2 border rounded-md hover:bg-green-200 hover:text-green-900 focus:outline-none"
                      onClick={toggleFullScreen}
                    >
                      Full Screen
                    </button>
                    <br></br>
                    <br></br>
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
    if (
      (typeof value === "string" && value.length !== 0) ||
      typeof value === "number"
    ) {
      let node = {
        key: parent + "N" + nodeCount + "D" + nodeDataCount,
        parent: parent,
        text: Number.isNaN(Number(key)) ? key : "Item_" + (Number(key) + 1),
        color:
          colors[
            Object.keys(colors)[
              Math.floor(Math.random() * Object.keys(colors).length)
            ]
          ],
      };
      let childNode = {
        key: parent + "N" + nodeCount + "D" + nodeDataCount + "CS",
        parent: parent + "N" + nodeCount + "D" + nodeDataCount,
        text: value,
        color:
          colors[
            Object.keys(colors)[
              Math.floor(Math.random() * Object.keys(colors).length)
            ]
          ],
      };
      nodes.push(node);
      nodes.push(childNode);
    }
    if (typeof value === "object") {
      let node = {
        key: parent + "N" + nodeCount + "D" + nodeDataCount,
        parent: parent,
        text:
          typeof value === "object"
            ? Number.isNaN(Number(key))
              ? key
              : "Item_" + (Number(key) + 1)
            : value,
        color:
          colors[
            Object.keys(colors)[
              Math.floor(Math.random() * Object.keys(colors).length)
            ]
          ],
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

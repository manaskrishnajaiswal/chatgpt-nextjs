import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";
import Loader from "@/frontend/components/Loader";
import Head from "next/head";

const ChatgptMindmap = () => {
  const diagramRef = useRef(null);
  const diagramInstanceRef = useRef(null);

  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 0, text: "Finish writing article", completed: false },
    { key: 1, text: "Do laundry", completed: true },
    { key: 2, text: "Buy groceries", completed: false },
  ]);

  useEffect(() => {
    if (!diagramRef.current) return;

    // dispose of previous Diagram instance
    if (diagramInstanceRef.current) {
      diagramInstanceRef.current.div = null;
      diagramInstanceRef.current = null;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const diagram = go.GraphObject.make(go.Diagram, diagramRef.current, {
      initialContentAlignment: go.Spot.Center,
      "undoManager.isEnabled": true,
      model: new go.GraphLinksModel(nodeDataArray),
    });

    diagram.nodeTemplate = go.GraphObject.make(
      go.Node,
      "Auto",
      new go.Binding("location", "loc", go.Point.parse),
      go.GraphObject.make(
        go.Shape,
        "Rectangle",
        { fill: "white", strokeWidth: 2 },
        new go.Binding("stroke", "completed", (completed) =>
          completed ? "green" : "black"
        )
      ),
      go.GraphObject.make(
        go.TextBlock,
        { margin: 8 },
        new go.Binding("text", "text")
      ),
      {
        click: (e, node) => {
          const item = node.data;
          setNodeDataArray((prevNodeDataArray) =>
            prevNodeDataArray.map((nodeData) =>
              nodeData.key === item.key
                ? { ...nodeData, completed: !nodeData.completed }
                : nodeData
            )
          );
        },
        contextClick: (e, node) => {
          const item = node.data;
          setNodeDataArray((prevNodeDataArray) =>
            prevNodeDataArray.filter((nodeData) => nodeData.key !== item.key)
          );
        },
      }
    );
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // store Diagram instance
    diagramInstanceRef.current = diagram;
  }, [diagramRef.current, nodeDataArray]);

  // cleanup function
  useEffect(() => {
    return () => {
      if (diagramInstanceRef.current) {
        diagramInstanceRef.current.div = null;
        diagramInstanceRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements[0];
    if (input.value.trim() !== "") {
      const newNode = {
        key: nodeDataArray.length,
        text: input.value.trim(),
        completed: false,
      };
      setNodeDataArray([...nodeDataArray, newNode]);
      input.value = "";
    }
  };

  return (
    <>
      <section>
        <Head>
          <title>Database Mgmt App</title>
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
        <main className="py-5">
          <h1 className="text-xl md:text-5xl text-center font-bold py-10 border-b">
            Database Schema and Data
          </h1>
          <br />

          <div className="container mx-auto">
            <h1>To-Do List</h1>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Add new item" />
              <button type="submit">Add</button>
            </form>
            <div
              className="border rounded-md"
              ref={diagramRef}
              style={{
                width: "100%",
                height: "800px",
                backgroundColor: "#f0f0f0",
              }}
            />
          </div>
        </main>
      </section>
    </>
  );
};

export default ChatgptMindmap;

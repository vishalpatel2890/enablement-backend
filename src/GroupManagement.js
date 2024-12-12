import React, { useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "react-flow-renderer";

const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 50 },
    data: { label: "Node 1" },
    groupId: "group1",
    layerId: "layer1",
  },
  {
    id: "2",
    position: { x: 300, y: 50 },
    data: { label: "Node 2" },
    groupId: "group1",
    layerId: "layer1",
  },
  {
    id: "3",
    position: { x: 150, y: 200 },
    data: { label: "Node 3" },
    groupId: "group1",
    layerId: "layer2",
  },
  {
    id: "4",
    position: { x: 400, y: 50 },
    data: { label: "Node 4" },
    groupId: "group2",
    layerId: "layer1",
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", label: "Edge 1-2" },
  { id: "e1-3", source: "1", target: "3", label: "Edge 1-3" },
];

const initialGroups = [
  {
    id: "group1",
    label: "Group 1",
    backgroundColor: "#e6f7ff",
    layers: [
      { id: "layer1", label: "Layer 1" },
      { id: "layer2", label: "Layer 2" },
    ],
  },
  {
    id: "group2",
    label: "Group 2",
    backgroundColor: "#ffe4e1",
    layers: [{ id: "layer1", label: "Layer 1" }],
  },
];

const GroupManagementInner = ({ nodes, edges, setNodes, setEdges, groups }) => {
  const { transform = { x: 0, y: 0, zoom: 1 } } = useReactFlow(); // Add a fallback for `transform`
  const { x, y, zoom } = transform;

  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (params) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const renderBoundaries = () => {
    return groups.map((group) => {
      const groupNodes = nodes.filter((node) => node.groupId === group.id);

      if (groupNodes.length === 0) return null;

      const groupXMin = Math.min(...groupNodes.map((node) => node.position.x));
      const groupYMin = Math.min(...groupNodes.map((node) => node.position.y));
      const groupXMax =
        Math.max(...groupNodes.map((node) => node.position.x)) + 150; // Buffer for node size
      const groupYMax =
        Math.max(...groupNodes.map((node) => node.position.y)) + 100; // Buffer for node size

      return (
        <div
          key={group.id}
          style={{
            position: "absolute",
            left: groupXMin * zoom + x,
            top: groupYMin * zoom + y,
            width: (groupXMax - groupXMin) * zoom,
            height: (groupYMax - groupYMin) * zoom,
            backgroundColor: group.backgroundColor,
            border: "2px dashed #ccc",
            opacity: 0.5,
            borderRadius: "10px",
            pointerEvents: "none",
          }}
        >
          {group.layers.map((layer) => {
            const layerNodes = groupNodes.filter(
              (node) => node.layerId === layer.id
            );
            if (layerNodes.length === 0) return null;

            const layerYMin = Math.min(
              ...layerNodes.map((node) => node.position.y)
            );
            const layerYMax =
              Math.max(...layerNodes.map((node) => node.position.y)) + 100;

            return (
              <div
                key={layer.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: (layerYMin - groupYMin) * zoom,
                  width: "100%",
                  height: (layerYMax - layerYMin) * zoom,
                  border: "1px solid #aaa",
                  borderRadius: "5px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      );
    });
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      style={{ background: "#f4f4f9" }}
    >
      {renderBoundaries()}
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

const GroupManagement = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh", width: "100%" }}>
        <h1 style={{ textAlign: "center" }}>Group Management</h1>
        <GroupManagementInner
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          groups={initialGroups}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default GroupManagement;

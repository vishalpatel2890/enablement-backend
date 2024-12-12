import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";

const ItemType = {
  NODE: "node",
};

// Color mapping object
const GROUP_COLORS = {
  group1: "#ffe4e1",
  group2: "#e6f7ff",
  group3: "#e8ffe6",
  group4: "#fffacd",
  group5: "#ffebcd",
  group6: "#d5e8d4",
  group7: "#fbe4c2",
  group8: "#f4d8e7",
  group9: "#f408e7",
};

function App() {
  const [groups, setGroups] = useState([
    {
      id: "group1",
      label: "Pre-Pipeline",
      layers: [
        [
          {
            id: "1A",
            label: "Create Account Plan",
            link: "https://example.com/1A",
            data: "Some metadata for 1A",
          },
        ],
      ],
    },
    {
      id: "group2",
      label: "Qualification",
      layers: [
        [
          {
            id: "2A",
            label: "Qualify the Lead",
            link: "https://example.com/2A",
            data: "Some metadata for 2A",
          },
        ],
      ],
    },
  ]);

  const [connections, setConnections] = useState([{ from: "1A", to: "2A" }]);
  const [addingConnection, setAddingConnection] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [columns, setColumns] = useState([]);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Log groups and connections whenever they change
  useEffect(() => {
    console.group("Current State");
    console.log("Groups:", groups);
    const groupStructure = groups.map((group) => ({
      id: group.id,
      label: group.label,
      layerCount: group.layers.length,
      nodeCount: group.layers.flat().length,
      nodes: group.layers.flat().map((node) => ({
        id: node.id,
        label: node.label,
      })),
    }));
    console.log("Group Structure:", groupStructure);
    console.log("Connections:", connections);
    connections.forEach((conn) => {
      const fromNode = groups
        .flatMap((g) => g.layers.flat())
        .find((n) => n.id === conn.from);
      const toNode = groups
        .flatMap((g) => g.layers.flat())
        .find((n) => n.id === conn.to);
      console.log(
        `Connection: ${fromNode?.label || conn.from} → ${
          toNode?.label || conn.to
        }`
      );
    });
    console.groupEnd();
  }, [groups, connections]);

  useEffect(() => {
    const calculateColumns = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerHeight = window.innerHeight - 100;
      const groupElements = container.getElementsByClassName("group");

      if (groupElements.length === 0) {
        setColumns([groups]);
        return;
      }

      const groupHeight = 200;
      const groupsPerColumn = Math.floor(containerHeight / groupHeight);

      const newColumns = [];
      let currentColumn = [];

      groups.forEach((group) => {
        if (currentColumn.length >= groupsPerColumn) {
          newColumns.push(currentColumn);
          currentColumn = [];
        }
        currentColumn.push(group);
      });

      if (currentColumn.length > 0) {
        newColumns.push(currentColumn);
      }

      setColumns(newColumns);
    };

    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [groups]);

  useEffect(() => {
    console.group("Column Distribution");
    columns.forEach((column, index) => {
      console.log(
        `Column ${index + 1}:`,
        column.map((group) => group.label)
      );
    });
    console.groupEnd();
  }, [columns]);

  useEffect(() => {
    drawConnections();
    window.addEventListener("resize", drawConnections);
    return () => window.removeEventListener("resize", drawConnections);
  }, [groups, connections, columns]);

  const getGroupColor = (groupId) => {
    return GROUP_COLORS[groupId] || "#ffffff";
  };

  const drawConnections = () => {
    const svg = svgRef.current;
    if (!svg) return;

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    connections.forEach(({ from, to }) => {
      const fromElement = document.getElementById(from);
      const toElement = document.getElementById(to);

      if (fromElement && toElement) {
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        const fromPoint = {
          x: fromRect.right - svgRect.left,
          y: fromRect.top + fromRect.height / 2 - svgRect.top,
        };
        const toPoint = {
          x: toRect.left - svgRect.left,
          y: toRect.top + toRect.height / 2 - svgRect.top,
        };

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", fromPoint.x);
        line.setAttribute("y1", fromPoint.y);
        line.setAttribute("x2", toPoint.x);
        line.setAttribute("y2", toPoint.y);
        line.setAttribute("stroke", "#007bff");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("marker-end", "url(#arrowhead)");

        svg.appendChild(line);
      }
    });
  };

  const addGroup = () => {
    const newGroupId = `group${groups.length + 1}`;
    const newGroup = {
      id: newGroupId,
      label: `New Group ${groups.length + 1}`,
      layers: [[]],
    };
    console.log("Adding new group:", newGroup);
    setGroups((prev) => [...prev, newGroup]);
  };

  const addLayer = (groupId) => {
    console.log(`Adding new layer to group: ${groupId}`);
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, layers: [...group.layers, []] }
          : group
      )
    );
  };

  const addNode = (groupId, layerIndex, label) => {
    const newNode = {
      id: `${groupId}-${layerIndex}-${Date.now()}`,
      label,
      link: "https://example.com/new-node",
      data: "New metadata",
    };

    console.log("Adding new node:", newNode);
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              layers: group.layers.map((layer, idx) =>
                idx === layerIndex ? [...layer, newNode] : layer
              ),
            }
          : group
      )
    );
  };

  const moveNode = (nodeId, targetGroupId, targetLayerIndex) => {
    console.log(
      `Moving node ${nodeId} to group ${targetGroupId}, layer ${targetLayerIndex}`
    );
    const newGroups = groups.map((group) => {
      const newGroup = { ...group };
      newGroup.layers = group.layers.map((layer) =>
        layer.filter((node) => node.id !== nodeId)
      );
      return newGroup;
    });

    const node = groups
      .flatMap((group) => group.layers.flat())
      .find((node) => node.id === nodeId);

    if (node) {
      const targetGroup = newGroups.find((group) => group.id === targetGroupId);
      targetGroup.layers[targetLayerIndex] = [
        ...(targetGroup.layers[targetLayerIndex] || []),
        node,
      ];
      setGroups(newGroups);
    }
  };

  const startAddingConnection = () => {
    setAddingConnection(true);
    setSelectedNodes([]);
  };

  const handleNodeClick = (nodeId) => {
    if (!addingConnection) return;

    setSelectedNodes((prev) => {
      const updated = [...prev, nodeId];
      if (updated.length === 2) {
        addConnection(updated[0], updated[1]);
        setAddingConnection(false);
        setSelectedNodes([]);
      }
      return updated;
    });
  };

  const addConnection = (fromNodeId, toNodeId) => {
    console.log(`Adding connection from ${fromNodeId} to ${toNodeId}`);
    const newConnection = { from: fromNodeId, to: toNodeId };
    setConnections((prev) => {
      const updatedConnections = prev.some(
        (conn) => conn.from === fromNodeId && conn.to === toNodeId
      )
        ? prev
        : [...prev, newConnection];
      return updatedConnections;
    });
  };

  const editNode = (nodeId, newLabel, newLink, newData) => {
    console.log(`Editing node ${nodeId}:`, { newLabel, newLink, newData });
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        layers: group.layers.map((layer) =>
          layer.map((node) =>
            node.id === nodeId
              ? { ...node, label: newLabel, link: newLink, data: newData }
              : node
          )
        ),
      }))
    );
  };

  const openModal = (node) => {
    setModalData(node);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const Node = ({ node, groupId, layerIndex }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemType.NODE,
      item: { id: node.id, groupId, layerIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        id={node.id}
        ref={drag}
        className={`node ${
          addingConnection && selectedNodes.includes(node.id) ? "highlight" : ""
        }`}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
        onClick={() => handleNodeClick(node.id)}
      >
        <p>{node.label}</p>
        <button
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={() => openModal(node)}
        >
          Edit
        </button>
      </div>
    );
  };

  const Layer = ({ layer, groupId, layerIndex }) => {
    const [, drop] = useDrop({
      accept: ItemType.NODE,
      drop: (item) => moveNode(item.id, groupId, layerIndex),
    });

    return (
      <div ref={drop} className="layer">
        <div className="layer-content">
          {layer.map((node) => (
            <Node
              key={node.id}
              node={node}
              groupId={groupId}
              layerIndex={layerIndex}
            />
          ))}
        </div>
        <button
          className="add-node-button"
          onClick={() => addNode(groupId, layerIndex, "New Node")}
          title="Add Node"
        >
          +
        </button>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="tree-container" ref={containerRef}>
        <svg ref={svgRef} className="connections-svg">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#007bff" />
            </marker>
          </defs>
        </svg>

        <div
          className="columns-container"
          style={{ display: "flex", gap: "20px" }}
        >
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="column">
              {column.map((group) => (
                <div
                  key={group.id}
                  className="group"
                  style={{ backgroundColor: getGroupColor(group.id) }}
                >
                  <h3>{group.label}</h3>
                  <button onClick={() => addLayer(group.id)}>Add Layer</button>
                  {group.layers.map((layer, index) => (
                    <Layer
                      key={index}
                      layer={layer}
                      groupId={group.id}
                      layerIndex={index}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="button-container">
          <button onClick={addGroup}>Add Group</button>
          <button
            onClick={startAddingConnection}
            style={{
              backgroundColor: addingConnection ? "#007bff" : "#f0f0f0",
              color: addingConnection ? "white" : "black",
            }}
          >
            Add Connection
          </button>
        </div>

        {modalData && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Node</h3>
              <label>
                Name:
                <input
                  type="text"
                  defaultValue={modalData.label}
                  onChange={(e) => (modalData.label = e.target.value)}
                />
              </label>
              <label>
                Link:
                <input
                  type="text"
                  defaultValue={modalData.link}
                  onChange={(e) => (modalData.link = e.target.value)}
                />
              </label>
              <label>
                Data:
                <input
                  type="text"
                  defaultValue={modalData.data}
                  onChange={(e) => (modalData.data = e.target.value)}
                />
              </label>
              <button
                onClick={() => {
                  editNode(
                    modalData.id,
                    modalData.label,
                    modalData.link,
                    modalData.data
                  );
                  closeModal();
                }}
              >
                Save
              </button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;

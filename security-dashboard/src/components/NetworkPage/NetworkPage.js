import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Graph from 'react-vis-network-graph';
import { Rnd } from 'react-rnd';
import './NetworkPage.css';
import uuid from 'react-uuid';

const NetworkPage = () => {
  const { alertId } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickedEdge, setClickedEdge] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterTransparent, setFilterTransparent] = useState(false);
  const [fileNameFilter, setFileNameFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    setLoading(true);

    axios.get(`http://127.0.0.1:5000/api/network/${alertId}`)
      .then(response => {
        const { nodes, edges } = response.data;
        setNodes(nodes);
        setEdges(edges);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching network data:', error);
        setLoading(false);
      });
  }, [alertId]);

  const handleNodeClick = (event) => {
    const { nodes: clickedNodes } = event;
    if (clickedNodes.length > 0) {
      const nodeId = clickedNodes[0];
      const clickedNode = nodes.find(node => node.id === nodeId);
      setClickedNode(clickedNode || null);
    }
  };

  const handleEdgeClick = (event) => {
    const { edges: clickedEdges } = event;
    if (clickedEdges.length > 0) {
      const edgeId = clickedEdges[0];
      const clickedEdge = edges.find(edge => `${edge.source}-${edge.target}` === edgeId);
      setClickedEdge(clickedEdge || null);
    }
  };

  const handleClosePopup = () => {
    setClickedEdge(null);
    setClickedNode(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFileNameFilterChange = (event) => {
    setFileNameFilter(event.target.value);
  };

  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  const handleFilterToggle = () => {
    setFilterTransparent(!filterTransparent);
  };

  const getHighlightedItems = (items, searchQuery) => {
    if (!searchQuery) return items;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return items.map(item => ({
      ...item,
      highlighted: item.label.toLowerCase().includes(lowerCaseQuery),
    }));
  };

  const formatFilePath = (filePath) => {
    if (typeof filePath === 'string') {
      const parts = filePath.split('\\');
      return parts[parts.length - 1]; // Return only the file name
    } else {
      console.error('filePath is not a string:', filePath);
      return filePath; // Return as is or handle it as needed
    }
  };

  const highlightedNodes = getHighlightedItems(nodes, searchQuery);
  const highlightedEdges = getHighlightedItems(edges, searchQuery);

  const filterNodesByFileName = (nodes, fileNameFilter) => {
    if (!fileNameFilter) return nodes;

    const lowerCaseFilter = fileNameFilter.toLowerCase();
    return nodes.map(node => ({
      ...node,
      highlight: node.label.toLowerCase().includes(lowerCaseFilter),
      label: node.label.toLowerCase().includes(lowerCaseFilter) ? 
        <span style={{ backgroundColor: '#FFFF00' }}>{node.label}</span> : node.label, // Highlighting
    }));
  };

  const filteredNodes = filterNodesByFileName(highlightedNodes, fileNameFilter);

  const calculatePositions = (nodes) => {
    const nodePositions = {};
    const rankSpacingX = 200;
    const ySpacing = 100;
    const nodesByRank = nodes.reduce((acc, node) => {
      const rank = node.rank || 0;
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(node);
      return acc;
    }, {});

    Object.keys(nodesByRank).forEach(rank => {
      const nodesInRank = nodesByRank[rank];
      nodesInRank.forEach((node, index) => {
        nodePositions[node.id] = {
          x: rank * rankSpacingX,
          y: index * ySpacing - (nodesInRank.length * ySpacing) / 2,
        };
      });
    });

    return nodePositions;
  };

  const nodePositions = calculatePositions(filterTransparent ? nodes : filteredNodes);

  const options = {
    layout: { hierarchical: false },
    edges: {
      color: { color: '#000000', highlight: '#ff0000', hover: '#ff0000' },
      arrows: { to: { enabled: true, scaleFactor: 1 } },
      smooth: { type: 'cubicBezier', roundness: 0.2 },
      font: { align: 'top', size: 12 },
    },
    nodes: {
      shape: 'dot',
      size: 20,
      font: { size: 14, face: 'Arial' },
    },
    interaction: {
      dragNodes: true,
      hover: true,
      selectConnectedEdges: false,
    },
    physics: {
      enabled: false,
      stabilization: { enabled: true, iterations: 300, updateInterval: 50 },
    },
  };

  const graphData = {
    nodes: (filterTransparent ? nodes : filteredNodes).map(node => ({
      ...node,
      x: nodePositions[node.id]?.x || 0,
      y: nodePositions[node.id]?.y || 0,
      label: node.type === 'file' && node.label !== 'comb-file'
        ? formatFilePath(node.label)
        : node.label,
      title: node.type === 'file' && node.label !== 'comb-file' ? node.label : '',
      shape: node.type === 'process' ? 'circle' : (node.type === 'socket' ? 'diamond' : 'box'),
      size: node.type === 'socket' ? 40 : 20,
      font: { size: node.type === 'socket' ? 10 : 14, vadjust: node.type === 'socket' ? -50 : 0 },
      color: {
        background: node.transparent && filterTransparent ? (node.highlight ? "#FFFF00" : "rgba(151, 194, 252, 0.5)") : "rgb(151, 194, 252)",
        border: "#2B7CE9",
        highlight: { background: node.highlight ? "#FFFF00" : (node.transparent && filterTransparent ? "rgba(210, 229, 255, 0.1)" : "#D2E5FF"), border: "#2B7CE9" },
      },
      className: node.transparent && !node.highlight ? 'transparent' : '',
    })),

    edges: highlightedEdges
      .filter(edge => !(edge.transparent && filterTransparent))
      .map(edge => ({
        from: edge.source,
        to: edge.target,
        label: edge.label,
        color: edge.highlighted ? '#f2cc0c' :
               edge.alname ? '#ff0000' :
               '#000000',
        id: `${edge.source}-${edge.target}`,
        font: { size: 12, align: 'horizontal', background: 'white', strokeWidth: 0 },
        className: edge.transparent ? 'transparent' : '',
      })),
  };

  return (
    <div className="network-container">
      <div className="floating-buttons">
  <button className="floating-back-button" onClick={() => navigate(-1)}>Back</button>
  <div className="options-container">
    <button className="floating-toggle-button" onClick={toggleMenu}>
      {menuVisible ? "Close Menu" : "Menu"}
    </button>
    <div className={`search-bar ${menuVisible ? "visible" : "hidden"}`}>
      <input
        type="text"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <input
        type="text"
        placeholder="Filter by filename..."
        value={fileNameFilter}
        onChange={handleFileNameFilterChange}
      />
      <button onClick={handleFilterToggle}>
        {filterTransparent ? "Show All" : "Show Filtered"}
      </button>
    </div>
  </div>
</div>

      <div id="network-visualization">
        <Graph
          key={uuid()}
          graph={graphData}
          options={options}
          events={{
            selectNode: handleNodeClick,
            selectEdge: handleEdgeClick,
          }}
        />
        
        {clickedEdge && clickedEdge.alname && (
          <Rnd default={{ x: 50, y: 50, width: 250, height: 120 }} minWidth={250} minHeight={120}>
            <div className="edge-popup">
              <div>
                <strong>Edge Type:</strong> {clickedEdge.alname}
              </div>
              <div>
                <strong>Edge Time:</strong> {clickedEdge.time}
              </div>
              <button onClick={handleClosePopup}>Close</button>
            </div>
          </Rnd>
        )}

        {clickedNode && (
          <Rnd default={{ x: 50, y: 50, width: 250, height: 120 }} minWidth={250} minHeight={120}>
            <div className="node-popup">
              <div>
                <strong>Node Label:</strong> {clickedNode.label}
              </div>
              <div>
                <strong>Node Type:</strong> {clickedNode.type}
              </div>
              <button onClick={handleClosePopup}>Close</button>
            </div>
          </Rnd>
        )}
      </div>



      {loading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
};

export default NetworkPage;
  
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
  const [menuVisible, setMenuVisible] = useState(false);  // State to track menu visibility
  const [filterTransparent, setFilterTransparent] = useState(false); // State to track filter option
  const [fileNameFilter, setFileNameFilter] = useState(''); // State to track file name filter
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
    setMenuVisible(!menuVisible);  // Toggle menu visibility
  };

  const handleFilterToggle = () => {
    setFilterTransparent(!filterTransparent);  // Toggle filter option
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
    const parts = filePath.split('\\');
    return parts[parts.length - 1]; // Return only the file name
  };

  const highlightedNodes = getHighlightedItems(nodes, searchQuery);
  const highlightedEdges = getHighlightedItems(edges, searchQuery);

  const filterNodesByFileName = (nodes, fileNameFilter) => {
    if (!fileNameFilter) return nodes;

    const lowerCaseFilter = fileNameFilter.toLowerCase();
    return nodes.map(node => ({
      ...node,
      highlight: node.label.toLowerCase().includes(lowerCaseFilter),
    }));
  };

  const filteredNodes = filterNodesByFileName(highlightedNodes, fileNameFilter);

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
    nodes: filteredNodes.map(node => {
      let label = node.label;
      let title = '';

      if (node.type === 'file' && node.label !== 'comb-file') {
        label = formatFilePath(node.label); // Only show file name
        title = node.label; // Full path for hover information
      }

      return {
        id: node.id,
        label: label,
        title: title,
        x: node.x,
        y: node.y,
        shape: node.type === 'process' ? 'circle' :
               node.type === 'socket' ? 'diamond' :
               'box',
        size: node.type === 'socket' ? 40 : 20,
        font: { size: node.type === 'socket' ? 10 : 14, vadjust: node.type === 'socket' ? -50 : 0 },
        color: {
          background: node.highlight ? "#FFFF00" : (node.transparent && filterTransparent ? "rgba(151, 194, 252, 0.5)" : "rgb(151, 194, 252)"),
          border: "#2B7CE9",
          highlight: { background: node.highlight ? "#FFFF00" : (node.transparent && filterTransparent ? "rgba(210, 229, 255, 0.1)" : "#D2E5FF"), border: "#2B7CE9" },
        },
        className: node.transparent && !node.highlight ? 'transparent' : '',
      };
    }),

    edges: highlightedEdges.map(edge => ({
      from: edge.source,
      to: edge.target,
      label: edge.label,
      color: edge.highlighted ? '#FFFF00' :
              edge.alname && edge.transparent && filterTransparent ? '#ff9999' :
              edge.alname ? '#ff0000' :
              edge.transparent && filterTransparent ? '#d3d3d3' :
              '#000000',
      id: `${edge.source}-${edge.target}`,
      font: { size: 12, align: 'horizontal', background: 'white', strokeWidth: 0 },
      className: edge.transparent && !edge.highlighted ? 'transparent' : '',
    })),
  };

  return (
    <div className="network-container">
      <div className="floating-buttons">
        <button className="floating-back-button" onClick={() => navigate(-1)}>Back</button>
        <button className="floating-toggle-button" onClick={toggleMenu}>
          {menuVisible ? "Close Menu" : "Menu"}
        </button>
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
                <strong>Node Name:</strong> {clickedNode.label}
              </div>
              <div>
                <strong>Node Rank:</strong> {clickedNode.rank || 'N/A'}
              </div>
              <button onClick={handleClosePopup}>Close</button>
            </div>
          </Rnd>
        )}
      </div>

      <div className={`sliding-menu ${menuVisible ? 'visible' : ''}`}>
        <div className="filter-container">
          <div className="filter-option">
            <label>
              <input
                type="checkbox"
                checked={filterTransparent}
                onChange={handleFilterToggle}
              />
              Show Transparent Edges
            </label>
          </div>
          <div className="filter-option">
            <label>
              File Name Filter:
              <input
                type="text"
                value={fileNameFilter}
                onChange={handleFileNameFilterChange}
                placeholder="Enter file name"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;

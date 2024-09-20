import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FilteredTable from './FilteredTable/FilteredTable';
import TopBar from './TopBar/TopBar';
import Graph from './Graph/Graph';
import Filter from './Filters/Filter';
import io from 'socket.io-client';


const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [newAlerts, setNewAlerts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    severity: [],
    machine: '',
    fromDate: '',
    toDate: ''
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPieChart, setShowPieChart] = useState(true);
  const socket = io('http://127.0.0.1:5000');
  const togglePieChart = () => {
    setShowPieChart(prevState => !prevState);
  };

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Log the socket connection status
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('new_alert', (alert) => {
        console.log('New alert:', alert);
        setAlerts((prevAlerts) => [...prevAlerts, alert]);
        fetchAlerts();
    });

    return () => {
        socket.disconnect();
        console.log('Socket disconnected');
    };
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/alert');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const clearAlert = (index) => {
    const updatedAlerts = newAlerts.filter((_, i) => i !== index);
    setNewAlerts(updatedAlerts);
  };

  const clearAllAlerts = () => {
    setNewAlerts([]);
  };


  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    let sortedAlerts = [...filteredAlerts];
    sortedAlerts.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setFilteredAlerts(sortedAlerts);
  };

  const sortSeverity = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const severityOrder = { high: 3, medium: 2, low: 1 };

    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
      const severityA = severityOrder[a[key].toLowerCase()] || 0;
      const severityB = severityOrder[b[key].toLowerCase()] || 0;

      return direction === 'ascending'
        ? severityA - severityB
        : severityB - severityA;
    });

    setFilteredAlerts(sortedAlerts);
  };

  const applyFilters = () => {
    let filtered = alerts.filter(alert => {
      const occurredOn = new Date(alert.occurred_on);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      return (
        (filters.id === '' || alert.id.toString().includes(filters.id)) &&
        (filters.name === '' || alert.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.severity.length === 0 || filters.severity.includes(alert.severity.toLowerCase())) &&
        (filters.machine === '' || alert.machine.toLowerCase().includes(filters.machine.toLowerCase())) &&
        (!fromDate || occurredOn >= fromDate) &&
        (!toDate || occurredOn <= toDate)
      );
    });
    setFilteredAlerts(filtered);
  };

  const handleSeverityChange = (e) => {
    const { value, checked } = e.target;
    let newSeverity = [...filters.severity];

    if (checked) {
      newSeverity.push(value);
    } else {
      newSeverity = newSeverity.filter(s => s !== value);
    }

    setFilters({ ...filters, severity: newSeverity });
  };

  const clearAllFilters = () => {
    setFilters({
      id: '',
      name: '',
      severity: [],
      machine: '',
      fromDate: '',
      toDate: ''
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className={`dashboard ${menuOpen ? 'menu-open' : ''}`}>
      <TopBar setAuth={true}></TopBar>

      




      <div className="container-fluid main-content scroll" style={{ position: "relative" }}>
        <h2 className="title">Dashboard</h2>
        {alerts.length > 0 ? (
          <div className="alerts-table" style={{ flex: showPieChart ? '0 1 auto' : '1 1 100%', transition: 'flex 0.3s ease' }}>
            <h2 className="alerts-heading">Alerts</h2>




            <div className="notification-container" style={{ position: 'relative' }}>
      <div 
        className={`notification-icon ${newAlerts.length > 0 ? 'active' : ''}`} 
        onClick={() => setNotificationsOpen(!notificationsOpen)}
      >
        {/* SVG Code Here */}
        {newAlerts.length > 0 && (
          <span className="notification-count">{newAlerts.length}</span>
        )}
      </div>

      {notificationsOpen && (
        <div className="notification-dropdown">
          <h2><b>New Alerts</b></h2>
          {newAlerts.length === 0 ? (
            <p>No new alerts</p>
          ) : (
            <ul>
              {newAlerts.map((alert, index) => (
                <li key={index}>
                  <p>{alert.name} - {alert.severity}</p>
                  <button className="clear-alert-button" onClick={() => clearAlert(index)}>Clear</button>
                </li>
              ))}
            </ul>
          )}
          {newAlerts.length > 0 && (
            <button className="clear-all-button" onClick={clearAllAlerts}>Clear All</button>
          )}
        </div>
      )}
    </div>


            <Filter filters={filters}
              handleFilterChange={handleFilterChange}
              handleSeverityChange={handleSeverityChange}
              clearAllFilters={clearAllFilters}
              togglePieChart={togglePieChart}
              showPieChart={showPieChart}
            ></Filter>

            {showPieChart && <Graph alerts={alerts}></Graph>}

            <FilteredTable filteredAlerts={filteredAlerts} sortData={sortData} sortSeverity={sortSeverity}></FilteredTable>

          </div>
        ) : (
          <div className="no-alerts">
            <p>No alerts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

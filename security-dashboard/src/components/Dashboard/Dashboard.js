import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './Dashboard.css';
import FilteredTable from './FilteredTable/FilteredTable';
import TopBar from './TopBar/TopBar';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const Dashboard = ({ setAuth }) => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    severity: [],
    machine: '',
    fromDate: '',
    toDate: ''
  });
  const [showPieChart, setShowPieChart] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

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

  const handleLogout = () => {
    setAuth(false);
    localStorage.setItem('auth', 'false');
    navigate('/login');
  };

  const togglePieChart = () => {
    setShowPieChart(prevState => !prevState);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getSeverityCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    alerts.forEach(alert => {
      const severity = alert.severity.toLowerCase();
      if (counts[severity] !== undefined) {
        counts[severity]++;
      }
    });
    return counts;
  };

  const severityCounts = getSeverityCounts();
  const pieData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [severityCounts.high, severityCounts.medium, severityCounts.low],
      backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 1
    }]
  };

  return (
    <div className={`dashboard ${menuOpen ? 'menu-open' : ''}`}>
      {/* <div className="top-bar">
        <div className="left-section">
          <div className="menu-toggle" onClick={toggleMenu}>
            <div className="menu-icon">
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
            </div>
          </div>
        </div>
        <div className="right-section">
          <button className="sign-out-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </div> */}
      <TopBar></TopBar>
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className={`close-arrow-container ${menuOpen ? 'arrow-open' : ''}`} onClick={closeMenu}>
          <div className="arrow"></div>
        </div>
        <div className="user-info">
          <div className="user-photo"></div>
          <div className="user-name">{username}</div>
        </div>
      </div>

      <div className="main-content">
        <h1 className="title">Dashboard</h1>

        {alerts.length > 0 ? (
          <div className="alerts-table">
            <h2 className="alerts-heading">Alerts</h2>

            <div className="filter-container">
              <input name="name" placeholder="Filter by Name" value={filters.name} onChange={handleFilterChange} />
              <input name="machine" placeholder="Filter by Machine" value={filters.machine} onChange={handleFilterChange} />

              {/* Severity Dropdown */}
              <div className="severity-dropdown">
                <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {filters.severity.length > 0 ? filters.severity.join(', ') : 'Select Severity'}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <label>
                      <input
                        type="checkbox"
                        value="high"
                        checked={filters.severity.includes('high')}
                        onChange={handleSeverityChange}
                      />
                      High
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="medium"
                        checked={filters.severity.includes('medium')}
                        onChange={handleSeverityChange}
                      />
                      Medium
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="low"
                        checked={filters.severity.includes('low')}
                        onChange={handleSeverityChange}
                      />
                      Low
                    </label>
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="date-filter">
                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} placeholder="From" />
                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} placeholder="To" />
              </div>

              {/* Clear Filters Button */}
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            <div className="card">
              <div className="card-header">
                {showPieChart && (
                  <h2 className="card-title">Threat Severity</h2>
                )}
                <button className="toggle-chart-btn" onClick={togglePieChart}>
                  {showPieChart ? 'Hide Graph' : 'Show Graph'}
                </button>
              </div>
              {showPieChart && (
                <div className="pie-chart-container">
                  <div className="pie-chart">
                    <Pie data={pieData} />
                  </div>
                </div>
              )}
            </div>
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

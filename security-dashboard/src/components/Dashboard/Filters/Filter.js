import { useState } from "react";
import SeverityOptions from "./SeverityOptions/SeverityOptions";
import "./Filter.css"

export default function Filter({ filters, handleFilterChange, handleSeverityChange, clearAllFilters, togglePieChart, showPieChart }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return <>
        <div className="filter-container">
            <input name="name" placeholder="Filter by Name" value={filters.name} onChange={handleFilterChange} />
            <input name="machine" placeholder="Filter by Machine" value={filters.machine} onChange={handleFilterChange} />

            {/* Severity Dropdown */}
            <div className="severity-dropdown">
                <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {filters.severity.length > 0 ? filters.severity.join(', ') : 'Select Severity'}
                </button>
                {dropdownOpen && (
                    <SeverityOptions filters={filters} handleSeverityChange={handleSeverityChange}></SeverityOptions>
                )}
            </div>

            {/* Date Filter */}
            <div className="date-filter">
                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} placeholder="From" />
                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} placeholder="To" />
            </div>

            {/* Clear Filters Button */}
        </div>
        <div className="filter-container">
            <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear All Filters
            </button>
            <button className="toggle-chart-btn" onClick={togglePieChart}>
                {showPieChart ? 'Hide Graphs' : 'Show Graphs'}
            </button>
        </div>
    </>
}
import "./SeverityOptions.css"

export default function SeverityOptions({filters, handleSeverityChange}) {
    return <>
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
    </>
}
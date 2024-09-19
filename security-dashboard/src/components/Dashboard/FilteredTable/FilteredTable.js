import { Link } from "react-router-dom"
import './FilteredTable.css';
export default function FilteredTable({ filteredAlerts, sortData, sortSeverity }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };
    return <>
        <table>
            <thead>
                <tr>
                    <th onClick={() => sortData('id')}>Name</th>
                    <th >Description</th>
                    <th onClick={() => sortSeverity('severity')}>Severity</th>
                    <th onClick={() => sortData('machine')}>Machine</th>
                    <th onClick={() => sortData('occurred_on')} >Occurred On</th>
                    <th >More Info</th>
                </tr>
            </thead>
            <tbody>
                {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className={`severity-${alert.severity.toLowerCase()}`}>
                        <td>{alert.name}</td>
                        <td>{alert.description}</td>
                        <td>{alert.severity}</td>
                        <td>{alert.machine}</td>
                        <td>{formatDate(alert.occurred_on)}</td>
                        <td><Link to={`/alert/${alert.id}`}>More Info</Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
}
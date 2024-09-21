import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import "./Graph.css";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default function Graph({ alerts }) {

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

    const getMachineCounts = () => {
        const machineCounts = {};
            alerts.forEach(alert => {
            const machine = alert.machine;
            if (machineCounts[machine]) {
                machineCounts[machine]++;
            } else {
                machineCounts[machine] = 1;
            }
        });
    
        return machineCounts;
    };

    const severityCounts = getSeverityCounts();
    const machineCounts = getMachineCounts();
    const pieSeverityData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [severityCounts.high, severityCounts.medium, severityCounts.low],
            backgroundColor: ['#C62828', '#FFA726', '#66BB6A'],
            borderColor: ['#fff', '#fff', '#fff'],
            borderWidth: 1
        }]
    };

    const pieMachineData = {
        labels: Object.keys(machineCounts),  // Use machine names as labels
        datasets: [{
            data: Object.values(machineCounts),  // Use machine counts as data
            backgroundColor: getColorScheme(Object.values(machineCounts)),
            borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
            borderWidth: 1
        }]
    };

    function getColorScheme(values) {
        const colors = ['#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#5e5e5e', '#0275d8'];
        
        // Create an array of indices and sort them based on values
        const sortedIndices = values.map((value, index) => index)
            .sort((a, b) => values[b] - values[a]);
    
        // Assign colors based on sorted indices
        return sortedIndices.map(index => colors[index]);
    }

    return <>
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Threat Severity</h2>
            </div>
            <div className="pie-chart-container">
                <div className="pie-chart">
                    <Pie data={pieSeverityData} />
                </div>
            <div className="pie-chart-container">
                <div className="pie-chart">
                    <Pie data={pieMachineData} />
                </div>
            </div>
                        
            </div>
        </div>
    </>
}
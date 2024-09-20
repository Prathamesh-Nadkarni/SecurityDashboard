import { useState } from "react";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import "./Graph.css"

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
            backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
            borderColor: ['#fff', '#fff', '#fff'],
            borderWidth: 1
        }]
    };

    const pieMachineData = {
        labels: Object.keys(machineCounts),  // Use machine names as labels
        datasets: [{
            data: Object.values(machineCounts),  // Use machine counts as data
            backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#17a2b8', '#6f42c1', '#3f10f1' ],  // Add more colors if you have more machines
            borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
            borderWidth: 1
        }]
    };

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
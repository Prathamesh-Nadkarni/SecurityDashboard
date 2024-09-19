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

    return <>
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Threat Severity</h2>
            </div>
            <div className="pie-chart-container">
                <div className="pie-chart">
                    <Pie data={pieData} />
                </div>
            </div>
        </div>
    </>
}
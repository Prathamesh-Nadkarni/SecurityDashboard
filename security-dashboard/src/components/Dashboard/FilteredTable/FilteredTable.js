import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import './FilteredTable.css';
import { Link } from 'react-router-dom';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
};

const autoSizeOptions = {
    includeOutliers: true,
    includeHeaders: true,
    expand: true,
    outLiersFactor: 1.5
}

const columns = [
    {
        field: 'name',
        headerName: 'Name',
        editable: false,
        sortable: true,
        headerAlign: 'left'
    },
    {
        field: 'description',
        headerName: 'Description',
        editable: false,
        sortable: true,
        flex: 1,
        headerAlign: 'left'
    },
    {
        field: 'severity',
        headerName: 'Severity',
        editable: false,
        sortable: true,
        headerAlign: 'left'
    },
    {
        field: 'machine',
        headerName: 'Machine',
        description: 'This column has a value getter and is not sortable.',
        sortable: true,
        editable: false,
        headerAlign: 'left'
    },
    {
        field: 'occurred_on',
        headerName: 'Occured On',
        description: 'This column has a value getter and is not sortable.',
        sortable: true,
        editable: false,
        flex: 0.5,
        valueGetter: (value, row) => {
            var ans = formatDate(value)
            if (ans?.includes("Invalid Date")) {
                return undefined;
            }
            return ans;
        },
        headerAlign: 'left'
    },
    {
        field: 'link',
        headerName: 'More Info',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        editable: false,
        renderCell: (params) => {
            return <>
                <Link to={`/alert/${params.row.id}`}>
                    <Button variant="contained">More Info</Button>
                </Link>
            </>
        }
    },
];

const pageSizeOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" }
];

export default function FilteredTable({ filteredAlerts }) {

    return (
        <Box sx={{ height: 500, width: '100%', maxWidth: "100%" }}>
            <DataGrid
                rows={filteredAlerts}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={pageSizeOptions}
                autosizeOptions={autoSizeOptions}
                getRowClassName={(params) => `severity-${params.row.severity?.toLowerCase()}`}
            />
        </Box>
    );
}
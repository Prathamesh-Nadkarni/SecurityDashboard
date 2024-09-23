import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import { GridArrowUpwardIcon } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleAltSharpIcon from '@mui/icons-material/PeopleAltSharp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import List from '@mui/material/List';
import { useLocation } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
import UploadPage from '../../UploadPage/UploadPage';
import { getRole, getUsername } from '../../../utils/headers';

const drawerWidth = 240;

function TopBar(props) {
    const { alerts = [], setAlerts, window: prevWindow, setAuth } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [drawerW, setDrawerW] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationList, setNotificationList] = useState(alerts);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const roleName = getRole();
    const username = getUsername();
    const location = useLocation();
    useEffect(() => {
        setNotificationList(alerts);
        const authStatus = localStorage.getItem('auth') === 'true';
    }, [alerts]);

    const clearAlert = (index) => {
        setNotificationList((prevNotifications) => prevNotifications.filter((_, i) => i !== index));
    };

    const clearAllAlerts = () => {
        setNotificationList([]);
    };

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
        setDrawerW(0);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setDrawerW(drawerWidth);
            setMobileOpen((prev) => !prev);
        }
    };

    const handleLogout = () => {
        localStorage.setItem('auth', 'false');
        navigate('/login');

    };

    const handleSecondDrawerClick = (index) => {
        console.log(index);
        if (index % 2 === 0) {
            navigate('/upload');
        } else {
            window.location.replace('https://sts.cs.illinois.edu/');
        }
    };

    const handleNotificationsClick = () => {
        setNotificationsOpen((prev) => !prev);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    const drawer = (
        <div>
            <Toolbar><img src="https://sts.cs.illinois.edu/assets/themes/lab/images/logo/lab-logo.png" className="h-8" alt="Flowbite Logo" /></Toolbar>
            <Divider />
            <List>
                {['Dashboard',  ...(roleName === 'admin' ? ['Users'] : [])].map((text) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={() => {
                            if (text === 'Users') {
                                navigate('/users');
                            } else if (text === 'Dashboard') {
                                navigate('/login');
                            }
                        }}>
                            <ListItemIcon>
                                {text === 'Dashboard' ? <SpaceDashboardIcon /> : <PeopleAltSharpIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {[...(roleName === 'admin'? roleName === 'edit' ? 'Upload Alerts' : [] : []) , 'Contact'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={() => handleSecondDrawerClick(index)} rel="noopener noreferrer">
                            <ListItemIcon>
                                {index % 2 === 0 ? <GridArrowUpwardIcon /> : <ContactMailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    const container = prevWindow !== undefined ? () => prevWindow().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerW}px)` },
                    ml: { sm: `${drawerW}px` },
                    bgcolor: "#003366"
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Threat Detection Dashboard
                    </Typography>

                    <div
                        className={`${notificationList.length > 0 ? 'active' : ''}`}
                        style={{ position: 'relative', cursor: 'pointer' }}
                    >
                        <IconButton
                            color="inherit"
                            edge="end"
                            onClick={handleNotificationsClick}
                            sx={{ mr: 2 }}
                        >
                            <NotificationsIcon />
                            {notificationList.length > 0 && (
                                <span className="notification-count">{notificationList.length}</span>
                            )}
                        </IconButton>
                        {notificationsOpen && (
                            <div className="notification-dropdown" style={{
                                position: 'absolute',
                                top: '50px',
                                right: '0',
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 1000,
                                width: '200px'
                            }}>
                                <h2 style={{ color: 'black' }}><b>New Alerts</b></h2>
                                {notificationList.length === 0 ? (
                                    <p style={{ color: 'black' }}>No new alerts</p>
                                ) : (
                                    <ul>
                                        {notificationList.map((alert, index) => (
                                            <li key={index}>
                                                <p style={{ color: 'black' }}>{alert.name} - {alert.severity}</p>
                                                <button
                                                    className="clear-alert-button"
                                                    onClick={() => clearAlert(index)}
                                                >
                                                    Clear
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {notificationList.length > 0 && (
                                    <button className="clear-all-button" onClick={clearAllAlerts}>
                                        Clear All
                                    </button>
                                )}
                            </div>
                    )}
                    </div>

                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={handleMenuClick}
                        sx={{ ml: 2 }}
                    >
                        <AccountCircleIcon />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                width: '200px', // Adjust the width as needed
                            },
                        }}
                    >
                         <MenuItem
                            disabled
                            style={{
                                height: '50px',
                                color: 'black',
                                opacity: 0.9
                            }}
                        >
                            Hi, {username}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleProfile}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerW } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerW },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerW}px)` } }}
            >
                {props.children}
            </Box>
        </Box>
    );
}

TopBar.propTypes = {
    window: PropTypes.func,
    alerts: PropTypes.array,
    setAuth: PropTypes.func,
};

export default TopBar;

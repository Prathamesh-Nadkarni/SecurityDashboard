import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import DashboardIcon from '@mui/icons-material/Dashboard';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import List from '@mui/material/List';
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
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function TopBar(props) {
    const { alerts, setAlerts, window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [drawerW, setDrawerW] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationList, setNotificationList] = useState(alerts);
    const navigate = useNavigate();


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

    const handleNotificationsClick = () => {
        setNotificationsOpen((prev) => !prev);
    };

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {['Profile', 'Dashboard'].map((text) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={() => {
                            if (text === 'Profile') {
                                navigate('/profile');
                            } else if (text === 'Dashboard') {
                                navigate('/login');
                            }
                        }}>
                            <ListItemIcon>
                                {text === 'Profile' ? <AccountCircleIcon /> : <SpaceDashboardIcon />} {/* Change icon as needed */}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['Settings', 'Contact'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <SettingsIcon /> : <ContactMailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

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
                        className={`notification-icon ${alerts.length > 0 ? 'active' : ''}`} 
                        onClick={handleNotificationsClick}
                        style={{ position: 'relative', cursor: 'pointer' }}
                    >
                        <NotificationsIcon />
                        {alerts.length > 0 && (
                            <span className="notification-count">{alerts.length}</span>
                        )}
                    </div>
                    {notificationsOpen && (
                    <div className="notification-dropdown">
                        <h2><b>New Alerts</b></h2>
                        {notificationList.length === 0 ? (
                            <p>No new alerts</p>
                        ) : (
                            <ul>
                                {notificationList.map((alert, index) => (
                                    <li key={index}>
                                        <p>{alert.name} - {alert.severity}</p>
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
};

export default TopBar;

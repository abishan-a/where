/* ============================================
   Public Transport & Traffic Management App
   Tracking JavaScript - Bus Tracking Logic
   ============================================ */

// Tracking state
let trackingState = {
    autoRefresh: false,
    refreshInterval: null,
    selectedRoute: null,
    buses: []
};

/**
 * Initialize Tracking Page
 * Sets up the bus tracking functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize full map
    if (document.getElementById('tracking-map')) {
        initFullMap();
        initializeTrackingControls();
        loadBusList();
        
        // Start auto-refresh if enabled
        const autoRefreshCheckbox = document.getElementById('auto-refresh');
        if (autoRefreshCheckbox && autoRefreshCheckbox.checked) {
            toggleAutoRefresh();
        }
    }
});

/**
 * Initialize Tracking Controls
 * Sets up control buttons and filters
 */
function initializeTrackingControls() {
    // Route filter dropdown
    const routeFilter = document.getElementById('route-filter');
    if (routeFilter) {
        routeFilter.addEventListener('change', function() {
            filterBusesByRoute(this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshBusData();
        });
    }
    
    // Auto-refresh toggle
    const autoRefreshCheckbox = document.getElementById('auto-refresh');
    if (autoRefreshCheckbox) {
        autoRefreshCheckbox.addEventListener('change', function() {
            toggleAutoRefresh();
        });
    }
    
    // Sidebar toggle (mobile)
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
}

/**
 * Load Bus List
 * Populates the sidebar with nearby buses
 */
function loadBusList() {
    const busListContainer = document.getElementById('bus-list');
    if (!busListContainer) return;
    
    // Sample bus data - in production, this would come from an API
    const buses = [
        {
            id: 'bus-001',
            route: 'Route 138',
            destination: 'Nugegoda',
            eta: 5,
            distance: '0.8 km',
            status: 'on-time'
        },
        {
            id: 'bus-002',
            route: 'Route 100',
            destination: 'Dehiwala',
            eta: 8,
            distance: '1.2 km',
            status: 'on-time'
        },
        {
            id: 'bus-003',
            route: 'Route 177',
            destination: 'Pettah',
            eta: 12,
            distance: '2.1 km',
            status: 'delayed'
        },
        {
            id: 'bus-004',
            route: 'Route 138',
            destination: 'Fort',
            eta: 15,
            distance: '2.5 km',
            status: 'on-time'
        }
    ];
    
    trackingState.buses = buses;
    renderBusList(buses);
}

/**
 * Render Bus List
 * Displays buses in the sidebar
 */
function renderBusList(buses) {
    const busListContainer = document.getElementById('bus-list');
    if (!busListContainer) return;
    
    // Clear existing list
    busListContainer.innerHTML = '';
    
    if (buses.length === 0) {
        busListContainer.innerHTML = '<p class="text-center">No buses found</p>';
        return;
    }
    
    buses.forEach(bus => {
        const busItem = document.createElement('div');
        busItem.className = 'bus-item';
        busItem.setAttribute('data-bus-id', bus.id);
        
        // Status badge
        const statusClass = bus.status === 'delayed' ? 'badge-warning' : 'badge-success';
        const statusText = bus.status === 'delayed' ? 'Delayed' : 'On Time';
        
        busItem.innerHTML = `
            <div class="bus-item-header">
                <h4>${bus.id}</h4>
                <span class="badge ${statusClass}">${statusText}</span>
            </div>
            <div class="bus-item-details">
                <p><strong>Route:</strong> ${bus.route}</p>
                <p><strong>Destination:</strong> ${bus.destination}</p>
                <p><strong>Distance:</strong> ${bus.distance}</p>
                <p class="eta"><strong>ETA:</strong> ${bus.eta} min</p>
            </div>
            <button class="btn btn-primary btn-small" onclick="focusBusOnMap('${bus.id}')">
                Show on Map
            </button>
        `;
        
        busListContainer.appendChild(busItem);
    });
}

/**
 * Filter Buses by Route
 * Filters the bus list and map markers by selected route
 */
function filterBusesByRoute(routeId) {
    trackingState.selectedRoute = routeId;
    
    let filteredBuses = trackingState.buses;
    
    if (routeId && routeId !== 'all') {
        filteredBuses = trackingState.buses.filter(bus => 
            bus.route.toLowerCase().includes(routeId.toLowerCase())
        );
    }
    
    renderBusList(filteredBuses);
    
    // Update map markers (in a real app, you'd filter markers here)
    if (window.map) {
        // This would filter bus markers on the map
        console.log('Filtering buses by route:', routeId);
    }
}

/**
 * Refresh Bus Data
 * Manually refreshes bus positions and ETA
 */
function refreshBusData() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        showLoading(refreshBtn);
    }
    
    // Simulate API call
    setTimeout(() => {
        // Update bus positions on map
        if (typeof updateBusPositions === 'function') {
            updateBusPositions();
        }
        
        // Update ETA for buses
        updateBusETA();
        
        // Reload bus list
        loadBusList();
        
        if (refreshBtn) {
            hideLoading(refreshBtn);
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('Bus positions updated', 'success');
        }
    }, 1000);
}

/**
 * Update Bus ETA
 * Updates estimated arrival times for buses
 */
function updateBusETA() {
    trackingState.buses.forEach(bus => {
        // Simulate ETA change (in production, this would come from API)
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        bus.eta = Math.max(1, bus.eta + change);
    });
}

/**
 * Toggle Auto Refresh
 * Enables or disables automatic bus position updates
 */
function toggleAutoRefresh() {
    const autoRefreshCheckbox = document.getElementById('auto-refresh');
    if (!autoRefreshCheckbox) return;
    
    trackingState.autoRefresh = autoRefreshCheckbox.checked;
    
    // Clear existing interval
    if (trackingState.refreshInterval) {
        clearInterval(trackingState.refreshInterval);
        trackingState.refreshInterval = null;
    }
    
    // Start auto-refresh if enabled
    if (trackingState.autoRefresh) {
        trackingState.refreshInterval = setInterval(() => {
            refreshBusData();
        }, 30000); // Refresh every 30 seconds
        
        if (typeof showNotification === 'function') {
            showNotification('Auto-refresh enabled', 'success');
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Auto-refresh disabled', 'info');
        }
    }
}

/**
 * Focus Bus on Map
 * Centers the map on a specific bus
 */
function focusBusOnMap(busId) {
    if (!window.map) return;
    
    // Find bus marker
    const busMarker = window.busMarkers.find(bm => bm.bus.id === busId);
    
    if (busMarker) {
        // Center map on bus
        window.map.setView([busMarker.bus.lat, busMarker.bus.lng], 15);
        
        // Open popup
        busMarker.marker.openPopup();
        
        // Highlight bus item in sidebar
        const busItems = document.querySelectorAll('.bus-item');
        busItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-bus-id') === busId) {
                item.classList.add('active');
            }
        });
    }
}

/**
 * Calculate Distance
 * Calculates distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

/**
 * Get User Location
 * Gets the user's current location (if permitted)
 */
function getUserLocation() {
    if (!navigator.geolocation) {
        if (typeof showNotification === 'function') {
            showNotification('Geolocation is not supported by your browser', 'error');
        }
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (window.map) {
                window.map.setView([lat, lng], 15);
                
                // Add user location marker
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="background: #43A047; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(window.map).bindPopup('Your Location');
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Location found', 'success');
            }
        },
        function(error) {
            if (typeof showNotification === 'function') {
                showNotification('Unable to get your location', 'error');
            }
            console.error('Geolocation error:', error);
        }
    );
}

// Make functions available globally for onclick handlers
window.focusBusOnMap = focusBusOnMap;
window.getUserLocation = getUserLocation;


/* ============================================
   Public Transport & Traffic Management App
   Map JavaScript - Leaflet Integration
   ============================================ */

// Global map variable
window.map = null;
window.busMarkers = [];
let routePolylines = [];
let busStopMarkers = [];

/**
 * Initialize Demo Map
 * Creates a map widget for the homepage demo
 */
window.initDemoMap = function() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    // Center coordinates for Colombo, Sri Lanka
    const colomboCenter = [6.9271, 79.8612];
    
    // Initialize map
    window.map = L.map('demo-map', {
        center: colomboCenter,
        zoom: 13,
        zoomControl: true,
        attributionControl: true
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(window.map);
    
    // Add sample bus routes and stops
    addSampleRoutes();
    addSampleBusStops();
    addSampleBuses();
};

/**
 * Initialize Full Map
 * Creates a full-screen map for tracking page
 */
window.initFullMap = function() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    // Center coordinates for Colombo, Sri Lanka
    const colomboCenter = [6.9271, 79.8612];
    
    // Initialize map
    window.map = L.map('tracking-map', {
        center: colomboCenter,
        zoom: 13,
        zoomControl: true,
        attributionControl: true
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(window.map);
    
    // Add all routes and buses
    addSampleRoutes();
    addSampleBusStops();
    addSampleBuses();
    
    // Fit map to show all markers
    if (busStopMarkers.length > 0) {
        const group = new L.featureGroup(busStopMarkers);
        window.map.fitBounds(group.getBounds().pad(0.1));
    }
};

/**
 * Initialize Route Preview Map
 * Creates a small map for route preview
 */
window.initRoutePreviewMap = function(routeId) {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    const route = getRouteData(routeId);
    if (!route) return;
    
    // Create map container if it doesn't exist
    const containerId = 'route-preview-map';
    let mapContainer = document.getElementById(containerId);
    
    if (!mapContainer) {
        mapContainer = document.createElement('div');
        mapContainer.id = containerId;
        mapContainer.className = 'map-container';
        mapContainer.style.height = '300px';
        
        const parent = document.querySelector('.route-preview');
        if (parent) {
            parent.appendChild(mapContainer);
        } else {
            return;
        }
    }
    
    // Initialize map
    const routeMap = L.map(containerId, {
        center: route.center || [6.9271, 79.8612],
        zoom: 12,
        zoomControl: true
    });
    
    // Add tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
    
    // Add route polyline
    if (route.path && route.path.length > 0) {
        L.polyline(route.path, {
            color: '#1E88E5',
            weight: 4,
            opacity: 0.7
        }).addTo(routeMap);
        
        // Add bus stops
        route.stops.forEach(stop => {
            L.marker([stop.lat, stop.lng], {
                icon: createBusStopIcon()
            }).addTo(routeMap)
            .bindPopup(`<strong>${stop.name}</strong><br>${stop.address || ''}`);
        });
        
        // Fit map to route
        routeMap.fitBounds(route.path);
    }
}

/**
 * Add Sample Routes
 * Adds sample bus routes to the map
 */
function addSampleRoutes() {
    // Sample route data for Colombo area
    const routes = [
        {
            id: 'route-138',
            name: 'Route 138',
            path: [
                [6.9350, 79.8500], // Fort
                [6.9200, 79.8600], // Pettah
                [6.9100, 79.8700], // Maradana
                [6.9000, 79.8800], // Borella
                [6.8900, 79.8900]  // Nugegoda
            ],
            color: '#1E88E5'
        },
        {
            id: 'route-100',
            name: 'Route 100',
            path: [
                [6.9400, 79.8400], // Kollupitiya
                [6.9300, 79.8500], // Fort
                [6.9200, 79.8600], // Pettah
                [6.9100, 79.8700], // Maradana
                [6.9000, 79.9000]  // Dehiwala
            ],
            color: '#43A047'
        },
        {
            id: 'route-177',
            name: 'Route 177',
            path: [
                [6.9500, 79.8300], // Bambalapitiya
                [6.9400, 79.8400], // Kollupitiya
                [6.9300, 79.8500], // Fort
                [6.9200, 79.8600]  // Pettah
            ],
            color: '#FB8C00'
        }
    ];
    
    routes.forEach(route => {
        const polyline = L.polyline(route.path, {
            color: route.color,
            weight: 4,
            opacity: 0.7
        }).addTo(window.map);
        
        routePolylines.push(polyline);
        
        // Add route label at midpoint
        const midIndex = Math.floor(route.path.length / 2);
        const midPoint = route.path[midIndex];
        
        L.marker(midPoint, {
            icon: L.divIcon({
                className: 'route-label',
                html: `<div style="background: ${route.color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${route.name}</div>`,
                iconSize: [60, 20],
                iconAnchor: [30, 10]
            })
        }).addTo(window.map);
    });
}

/**
 * Add Sample Bus Stops
 * Adds bus stop markers to the map
 */
function addSampleBusStops() {
    const stops = [
        { name: 'Fort Bus Stand', lat: 6.9350, lng: 79.8500, address: 'Fort, Colombo 01' },
        { name: 'Pettah Bus Stand', lat: 6.9200, lng: 79.8600, address: 'Pettah, Colombo 11' },
        { name: 'Maradana Station', lat: 6.9100, lng: 79.8700, address: 'Maradana, Colombo 10' },
        { name: 'Borella Junction', lat: 6.9000, lng: 79.8800, address: 'Borella, Colombo 08' },
        { name: 'Nugegoda', lat: 6.8900, lng: 79.8900, address: 'Nugegoda, Colombo 05' },
        { name: 'Kollupitiya', lat: 6.9400, lng: 79.8400, address: 'Kollupitiya, Colombo 03' },
        { name: 'Bambalapitiya', lat: 6.9500, lng: 79.8300, address: 'Bambalapitiya, Colombo 04' }
    ];
    
    stops.forEach(stop => {
        const marker = L.marker([stop.lat, stop.lng], {
            icon: createBusStopIcon()
        }).addTo(window.map);
        
        marker.bindPopup(`
            <div style="min-width: 150px;">
                <strong>${stop.name}</strong><br>
                <small>${stop.address}</small>
            </div>
        `);
        
        busStopMarkers.push(marker);
    });
}

/**
 * Add Sample Buses
 * Adds moving bus markers to simulate real-time tracking
 */
function addSampleBuses() {
    const buses = [
        { id: 'bus-001', route: 'Route 138', lat: 6.9250, lng: 79.8550, direction: 'north' },
        { id: 'bus-002', route: 'Route 100', lat: 6.9150, lng: 79.8650, direction: 'south' },
        { id: 'bus-003', route: 'Route 177', lat: 6.9450, lng: 79.8350, direction: 'east' }
    ];
    
    buses.forEach(bus => {
        const marker = L.marker([bus.lat, bus.lng], {
            icon: createBusIcon(bus.route),
            zIndexOffset: 1000 // Ensure buses appear above routes
        }).addTo(window.map);
        
        marker.bindPopup(`
            <div style="min-width: 150px;">
                <strong>${bus.id}</strong><br>
                <small>${bus.route}</small><br>
                <small>ETA: 5 min</small>
            </div>
        `);
        
        window.busMarkers.push({
            marker: marker,
            bus: bus
        });
    });
}

/**
 * Create Bus Icon
 * Creates a custom icon for bus markers
 */
function createBusIcon(routeName) {
    // Determine color based on route
    let color = '#1E88E5';
    if (routeName.includes('100')) color = '#43A047';
    if (routeName.includes('177')) color = '#FB8C00';
    
    return L.divIcon({
        className: 'bus-marker',
        html: `<div style="
            background: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}

/**
 * Create Bus Stop Icon
 * Creates a custom icon for bus stop markers
 */
function createBusStopIcon() {
    return L.divIcon({
        className: 'bus-stop-marker',
        html: `<div style="
            background: #1E88E5;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

/**
 * Get Route Data
 * Retrieves route information by ID
 */
function getRouteData(routeId) {
    // Sample route data - in production, this would come from an API
    const routes = {
        'route-138': {
            id: 'route-138',
            name: 'Route 138',
            path: [
                [6.9350, 79.8500],
                [6.9200, 79.8600],
                [6.9100, 79.8700],
                [6.9000, 79.8800],
                [6.8900, 79.8900]
            ],
            stops: [
                { name: 'Fort Bus Stand', lat: 6.9350, lng: 79.8500, address: 'Fort, Colombo 01' },
                { name: 'Pettah Bus Stand', lat: 6.9200, lng: 79.8600, address: 'Pettah, Colombo 11' },
                { name: 'Maradana Station', lat: 6.9100, lng: 79.8700, address: 'Maradana, Colombo 10' },
                { name: 'Borella Junction', lat: 6.9000, lng: 79.8800, address: 'Borella, Colombo 08' },
                { name: 'Nugegoda', lat: 6.8900, lng: 79.8900, address: 'Nugegoda, Colombo 05' }
            ],
            center: [6.9125, 79.8700]
        }
    };
    
    return routes[routeId] || null;
}

/**
 * Update Bus Positions
 * Simulates real-time bus movement (for demo purposes)
 */
window.updateBusPositions = function() {
    window.busMarkers.forEach(busMarker => {
        const bus = busMarker.bus;
        const marker = busMarker.marker;
        
        // Simulate small movement
        const latOffset = (Math.random() - 0.5) * 0.001;
        const lngOffset = (Math.random() - 0.5) * 0.001;
        
        const newLat = bus.lat + latOffset;
        const newLng = bus.lng + lngOffset;
        
        // Update position
        bus.lat = newLat;
        bus.lng = newLng;
        marker.setLatLng([newLat, newLng]);
    });
};

/**
 * Clear Map
 * Removes all markers and polylines from the map
 */
function clearMap() {
    window.busMarkers.forEach(busMarker => {
        window.map.removeLayer(busMarker.marker);
    });
    window.busMarkers = [];
    
    routePolylines.forEach(polyline => {
        window.map.removeLayer(polyline);
    });
    routePolylines = [];
    
    busStopMarkers.forEach(marker => {
        window.map.removeLayer(marker);
    });
    busStopMarkers = [];
}

/**
 * Filter Routes on Map
 * Shows/hides routes based on filter
 */
function filterRoutes(routeId) {
    // Implementation for filtering routes
    // This would hide/show specific routes based on selection
    console.log('Filtering routes:', routeId);
}


/**
 * Offline support for HashGenerator
 * Allows the application to work without internet connection
 */

// Register service worker if supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}

// Check online status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    // Optional: Show status indicator
    if (!isOnline) {
        showOfflineNotification();
    }
}

function showOfflineNotification() {
    if (typeof showNotification === 'function') {
        showNotification('You are offline. HashGenerator will continue to work without internet connection.', 'info');
    }
}

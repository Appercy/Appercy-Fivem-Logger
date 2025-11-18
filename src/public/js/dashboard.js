/**
 * Dashboard JavaScript - Main log viewing interface
 * 
 * Handles:
 * - User authentication check
 * - Log fetching and display
 * - Filtering (type, level, resource, search, date range)
 * - Log deletion (single and bulk) for admins
 * - Dark mode and locale management
 * - Admin status detection
 * 
 * @requires locale.js for translations
 * @requires theme.js for dark mode
 */

// Check if user is logged in
const sessionId = localStorage.getItem('sessionId');
const username = localStorage.getItem('username');
let isAdmin = false;
let selectedLogs = new Set();
let currentLogs = []; // Store logs for metadata access

if (!sessionId) {
    window.location.href = '/login.html';
}

// Initialize locale selector and apply translations
document.addEventListener('DOMContentLoaded', () => {
    const localeSelector = document.getElementById('localeSelector');
    if (localeSelector) {
        localeSelector.value = getCurrentLocale();
    }
    
    // Apply translations to all elements with data-i18n attribute
    applyTranslations();
    
    // Setup metadata modal close handlers
    setupMetadataModal();
});

/**
 * Setup metadata modal event handlers
 */
function setupMetadataModal() {
    const modal = document.getElementById('metadataModal');
    const closeBtn = modal.querySelector('.close');
    const closeModalBtn = modal.querySelector('.close-modal');
    
    // Close on X button
    closeBtn.onclick = () => modal.classList.remove('show');
    
    // Close on Close button
    closeModalBtn.onclick = () => modal.classList.remove('show');
    
    // Close on outside click
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };
}

/**
 * Apply translations to all elements with data-i18n attribute
 * Uses the current locale from localStorage
 */
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

document.getElementById('username').textContent = username;

// Check if user is admin and show admin button
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        
        if (response.ok) {
            isAdmin = true;
            document.getElementById('adminBtn').style.display = 'inline-block';
        }
    } catch (error) {
        // User is not admin, button stays hidden
    }
}

// Admin panel navigation
document.getElementById('adminBtn').addEventListener('click', () => {
    window.location.href = '/admin.html';
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
});

// Load logs
async function loadLogs(filters = {}) {
    const logsTable = document.getElementById('logsTable');
    logsTable.innerHTML = '<div class="loading">Loading logs...</div>';
    
    try {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.level) params.append('level', filters.level);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.search) params.append('search', filters.search);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        params.append('limit', '100');
        
        const response = await fetch(`/api/logs?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${sessionId}`,
            },
        });
        
        if (response.status === 401) {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
            return;
        }
        
        const data = await response.json();
        
        if (data.logs.length === 0) {
            logsTable.innerHTML = `<div class="empty-state" data-i18n="noLogsFound">${t('noLogsFound')}</div>`;
            currentLogs = [];
            return;
        }
        
        currentLogs = data.logs;
        renderLogsTable(data.logs);
    } catch (error) {
        console.error('Error loading logs:', error);
        logsTable.innerHTML = `<div class="empty-state" data-i18n="errorLoadingLogs">${t('errorLoadingLogs')}</div>`;
    }
}

function renderLogsTable(logs) {
    const logsTable = document.getElementById('logsTable');
    
    let html = `
        <table>
            <thead>
                <tr>
                    ${isAdmin ? '<th><input type="checkbox" id="selectAllLogs"></th>' : ''}
                    <th data-i18n="id">ID</th>
                    <th data-i18n="type">Type</th>
                    <th data-i18n="level">Level</th>
                    <th data-i18n="resource">Resource</th>
                    <th data-i18n="message">Message</th>
                    <th data-i18n="media">Media</th>
                    <th data-i18n="timestamp">Timestamp</th>
                    <th data-i18n="metadata">Metadata</th>
                    ${isAdmin ? '<th data-i18n="actions">Actions</th>' : ''}
                </tr>
            </thead>
            <tbody>
    `;
    
    logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const messagePreview = log.message.length > 100 
            ? log.message.substring(0, 100) + '...' 
            : log.message;
        
        let mediaHtml = '-';
        if (log.media_local_path || log.media_url) {
            const mediaPath = log.media_local_path || log.media_url;
            const originalUrl = log.media_url;
            
            if (log.media_type === 'image') {
                // Show inline image with click to view full size
                mediaHtml = `
                    <div class="media-container">
                        <img src="${escapeHtml(mediaPath)}" 
                             alt="Log media" 
                             class="inline-media-thumbnail" 
                             onclick="window.open('${escapeHtml(mediaPath)}', '_blank')"
                             onerror="this.src='${escapeHtml(originalUrl)}'; this.onerror=null;"
                             title="Click to view full size">
                        ${originalUrl ? `<div class="media-url-toggle" onclick="toggleMediaUrl('${log.id}')">Show URL</div>` : ''}
                        ${originalUrl ? `<div class="media-url" id="media-url-${log.id}" style="display:none;"><a href="${escapeHtml(originalUrl)}" target="_blank">${escapeHtml(originalUrl)}</a></div>` : ''}
                    </div>
                `;
            } else if (log.media_type === 'video') {
                // Show inline video player
                mediaHtml = `
                    <div class="media-container">
                        <video controls class="inline-media-video" preload="metadata">
                            <source src="${escapeHtml(mediaPath)}" type="video/mp4">
                            <source src="${escapeHtml(mediaPath)}" type="video/webm">
                            Your browser doesn't support video playback.
                        </video>
                        ${originalUrl ? `<div class="media-url-toggle" onclick="toggleMediaUrl('${log.id}')">Show URL</div>` : ''}
                        ${originalUrl ? `<div class="media-url" id="media-url-${log.id}" style="display:none;"><a href="${escapeHtml(originalUrl)}" target="_blank">${escapeHtml(originalUrl)}</a></div>` : ''}
                    </div>
                `;
            } else {
                // File download link
                mediaHtml = `
                    <div class="media-container">
                        <a href="${escapeHtml(mediaPath)}" target="_blank" class="media-file-link">📎 Download File</a>
                        ${originalUrl ? `<div class="media-url-toggle" onclick="toggleMediaUrl('${log.id}')">Show URL</div>` : ''}
                        ${originalUrl ? `<div class="media-url" id="media-url-${log.id}" style="display:none;"><a href="${escapeHtml(originalUrl)}" target="_blank">${escapeHtml(originalUrl)}</a></div>` : ''}
                    </div>
                `;
            }
        }
        
        html += `
            <tr>
                ${isAdmin ? `<td><input type="checkbox" class="log-checkbox" data-log-id="${log.id}"></td>` : ''}
                <td>${log.id}</td>
                <td><span class="log-type ${log.type}">${log.type}</span></td>
                <td><span class="log-level ${log.level}">${log.level}</span></td>
                <td>${escapeHtml(log.resource || '-')}</td>
                <td title="${escapeHtml(log.message)}">${escapeHtml(messagePreview)}</td>
                <td>${mediaHtml}</td>
                <td>${timestamp}</td>
                <td>
                    <button class="btn btn-secondary btn-sm metadata-btn" data-log-id="${log.id}">
                        <span data-i18n="view">View</span>
                    </button>
                </td>
                ${isAdmin ? `<td><button class="btn btn-danger btn-sm delete-log-btn" data-log-id="${log.id}" data-i18n="delete">Delete</button></td>` : ''}
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    logsTable.innerHTML = html;
    
    // Apply translations to newly rendered content
    applyTranslations();
    
    // Add metadata modal handlers
    document.querySelectorAll('.metadata-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const logId = parseInt(e.target.closest('button').dataset.logId);
            const log = currentLogs.find(l => l.id === logId);
            if (log) {
                showMetadataModal(log.metadata, log.media_url);
            }
        });
    });

    if (isAdmin) {
        // Add select all handler
        const selectAll = document.getElementById('selectAllLogs');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.log-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                    const logId = parseInt(cb.dataset.logId);
                    if (e.target.checked) {
                        selectedLogs.add(logId);
                    } else {
                        selectedLogs.delete(logId);
                    }
                });
                updateDeleteButton();
            });
        }
        
        // Add checkbox handlers
        document.querySelectorAll('.log-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const logId = parseInt(e.target.dataset.logId);
                if (e.target.checked) {
                    selectedLogs.add(logId);
                } else {
                    selectedLogs.delete(logId);
                }
                updateDeleteButton();
            });
        });
        
        // Add delete button handlers
        document.querySelectorAll('.delete-log-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const logId = parseInt(e.target.dataset.logId);
                showConfirm(t('confirmDelete'), () => {
                    deleteSingleLog(logId);
                });
            });
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Toggle media URL visibility
 * Shows/hides the original URL for media files
 */
function toggleMediaUrl(logId) {
    const urlEl = document.getElementById(`media-url-${logId}`);
    if (urlEl) {
        urlEl.style.display = urlEl.style.display === 'none' ? 'block' : 'none';
    }
}

// Filter handlers
document.getElementById('applyFilters').addEventListener('click', () => {
    const filters = {
        type: document.getElementById('filterType').value,
        level: document.getElementById('filterLevel').value,
        resource: document.getElementById('filterResource').value,
        search: document.getElementById('filterSearch').value,
        startDate: document.getElementById('filterStartDate').value,
        endDate: document.getElementById('filterEndDate').value,
    };
    
    loadLogs(filters);
});

document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterType').value = '';
    document.getElementById('filterLevel').value = '';
    document.getElementById('filterResource').value = '';
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    loadLogs();
});

document.getElementById('refreshLogs').addEventListener('click', () => {
    const filters = {
        type: document.getElementById('filterType').value,
        level: document.getElementById('filterLevel').value,
        resource: document.getElementById('filterResource').value,
        search: document.getElementById('filterSearch').value,
        startDate: document.getElementById('filterStartDate').value,
        endDate: document.getElementById('filterEndDate').value,
    };
    
    loadLogs(filters);
});

// Initial load
loadLogs();
checkAdminStatus();

/**
 * Show metadata in modal
 * Displays JSON metadata and original media URL if available
 */
function showMetadataModal(metadata, mediaUrl) {
    const modal = document.getElementById('metadataModal');
    const content = modal.querySelector('pre');
    
    let displayContent = JSON.stringify(metadata, null, 2);
    
    // Add media URL section if available
    if (mediaUrl) {
        displayContent += '\n\n--- Original Media URL ---\n' + mediaUrl;
    }
    
    content.textContent = displayContent;
    modal.classList.add('show');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show confirmation modal
 * @param {string} message - Confirmation message
 * @param {function} onConfirm - Callback when confirmed
 */
function showConfirm(message, onConfirm) {
    // Create confirm modal if it doesn't exist
    let confirmModal = document.getElementById('confirmModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2 data-i18n="confirm">Confirm</h2>
                    <span class="close">&times;</span>
                </div>
                <div id="confirmMessage" style="padding: 20px;"></div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-danger" id="confirmYes" data-i18n="yes">Yes</button>
                    <button type="button" class="btn btn-secondary" id="confirmNo" data-i18n="no">No</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        // Close handlers
        confirmModal.querySelector('.close').onclick = () => confirmModal.classList.remove('show');
        confirmModal.querySelector('#confirmNo').onclick = () => confirmModal.classList.remove('show');
        window.addEventListener('click', (e) => {
            if (e.target === confirmModal) confirmModal.classList.remove('show');
        });
    }
    
    // Set message and show
    document.getElementById('confirmMessage').textContent = message;
    confirmModal.classList.add('show');
    
    // Handle confirm
    const yesBtn = document.getElementById('confirmYes');
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    
    newYesBtn.onclick = () => {
        confirmModal.classList.remove('show');
        onConfirm();
    };
}

// Delete functions
function updateDeleteButton() {
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (selectedLogs.size > 0) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.textContent = `${t('deleteSelected')} (${selectedLogs.size})`;
    } else {
        deleteBtn.style.display = 'none';
    }
}

async function deleteSingleLog(logId) {
    try {
        const response = await fetch(`/api/logs/${logId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
            },
        });
        
        if (response.ok) {
            // Reload logs
            const filters = {
                type: document.getElementById('filterType').value,
                level: document.getElementById('filterLevel').value,
                resource: document.getElementById('filterResource').value,
                search: document.getElementById('filterSearch').value,
                startDate: document.getElementById('filterStartDate').value,
                endDate: document.getElementById('filterEndDate').value,
            };
            loadLogs(filters);
            showToast('Log deleted successfully', 'success');
        } else {
            showToast('Failed to delete log', 'error');
        }
    } catch (error) {
        console.error('Error deleting log:', error);
        showToast('Error deleting log', 'error');
    }
}

async function deleteSelectedLogs() {
    if (selectedLogs.size === 0) return;
    
    const confirmMsg = t('confirmDeleteSelected').replace('{count}', selectedLogs.size);
    showConfirm(confirmMsg, async () => {
        try {
            const response = await fetch('/api/logs/delete-bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`,
                },
                body: JSON.stringify({ ids: Array.from(selectedLogs) }),
            });
            
            if (response.ok) {
                selectedLogs.clear();
                // Reload logs
                const filters = {
                    type: document.getElementById('filterType').value,
                    level: document.getElementById('filterLevel').value,
                    resource: document.getElementById('filterResource').value,
                    search: document.getElementById('filterSearch').value,
                    startDate: document.getElementById('filterStartDate').value,
                    endDate: document.getElementById('filterEndDate').value,
                };
                loadLogs(filters);
                showToast(`${selectedLogs.size} logs deleted successfully`, 'success');
            } else {
                showToast('Failed to delete logs', 'error');
            }
        } catch (error) {
            console.error('Error deleting logs:', error);
            showToast('Error deleting logs', 'error');
        }
    });
}

// Delete selected button handler
document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedLogs);

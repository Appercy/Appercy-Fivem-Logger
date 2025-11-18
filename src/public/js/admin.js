// Check if user is logged in and is admin
const sessionId = localStorage.getItem('sessionId');
const username = localStorage.getItem('username');

if (!sessionId) {
    window.location.href = '/login.html';
}

// Check admin access
async function checkAdminAccess() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
            return false;
        }
        
        if (response.status === 403) {
            showToast('Access denied. Admin privileges required.', 'error');
            setTimeout(() => window.location.href = '/dashboard.html', 1500);
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/dashboard.html';
        return false;
    }
}

// Wait for admin check before proceeding
checkAdminAccess().then(isAdmin => {
    if (!isAdmin) return;
    
    document.getElementById('username').textContent = username;
    
    // Initialize locale selector
    const localeSelector = document.getElementById('localeSelector');
    if (localeSelector) {
        localeSelector.value = getCurrentLocale();
    }
    
    // Apply translations
    applyTranslations();
});

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            el.textContent = translation;
        }
    });
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

// Navigation
document.getElementById('dashboardBtn').addEventListener('click', () => {
    window.location.href = '/dashboard.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
});

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active states
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Modal handling
const userModal = document.getElementById('userModal');
const resetPasswordModal = document.getElementById('resetPasswordModal');

document.querySelectorAll('.close, .close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        userModal.style.display = 'none';
        resetPasswordModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === userModal) userModal.style.display = 'none';
    if (e.target === resetPasswordModal) resetPasswordModal.style.display = 'none';
});

// Users Management
async function loadUsers() {
    const container = document.getElementById('usersTable');
    container.innerHTML = '<div class="loading">Loading users...</div>';
    
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${sessionId}` }
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (response.status === 403) {
            container.innerHTML = '<div class="empty-state">Access denied. Admin privileges required.</div>';
            return;
        }
        
        const data = await response.json();
        renderUsersTable(data.users);
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<div class="empty-state">Error loading users</div>';
    }
}

function renderUsersTable(users) {
    const container = document.getElementById('usersTable');
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        const createdDate = new Date(user.created_at).toLocaleDateString();
        const role = user.is_admin ? 'Admin' : 'User';
        const roleClass = user.is_admin ? 'admin' : 'user';
        
        html += `
            <tr>
                <td><strong>${escapeHtml(user.username)}</strong></td>
                <td><span class="badge badge-${roleClass}">${role}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-small btn-primary" onclick="resetPassword(${user.id}, '${escapeHtml(user.username)}')">Reset Password</button>
                    <button class="btn-small btn-danger" onclick="deleteUser(${user.id}, '${escapeHtml(user.username)}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

document.getElementById('addUserBtn').addEventListener('click', () => {
    document.getElementById('userForm').reset();
    userModal.style.display = 'block';
});

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        isAdmin: document.getElementById('newUserAdmin').checked,
    };
    
    if (data.password.length < 8) {
        showToast('Password must be at least 8 characters', 'warning'); return;
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            userModal.style.display = 'none';
            loadUsers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to create user', 'error');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Failed to create user', 'error');
    }
});

window.resetPassword = function(userId, username) {
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetUsername').textContent = username;
    document.getElementById('resetPasswordForm').reset();
    resetPasswordModal.style.display = 'block';
};

document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('resetUserId').value;
    const password = document.getElementById('resetPassword').value;
    
    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'warning'); return;
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });
        
        if (response.ok) {
            resetPasswordModal.style.display = 'none';
            showToast('Password reset successfully', 'success');
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to reset password', 'error');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showToast('Failed to reset password', 'error');
    }
});

window.deleteUser = async function(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${sessionId}` },
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Failed to delete user', 'error');
    }
};

// Utility function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial load
loadUsers();

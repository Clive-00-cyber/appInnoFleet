// script.js - Fonctions communes et API

// Détecter automatiquement l'URL de base
const API_BASE = window.location.origin + '/api';

// Fonction générique pour appeler l'API
export async function apiCall(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur réseau');
    }
    return response.json();
}

// Authentification
export async function login() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const errorDiv = document.getElementById('login-error');
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'index.html';
    } catch (err) {
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = err.message;
        } else alert(err.message);
    }
}

export function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

export function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export function checkAuth() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

export function requireAdmin() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Initialisation commune à chaque page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) return;

    if (!checkAuth()) return;

    const user = getCurrentUser();
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.textContent = `${user.name} (${user.role})`;
    }

    // Masquer les éléments admin si nécessaire
    if (user.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Mettre en évidence le menu actif
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        const onclick = li.getAttribute('onclick');
        if (onclick && onclick.includes(currentPage)) {
            li.classList.add('active');
        }
    });

    // Charger les stats latérales (seulement pour admin)
    loadSidebarStats();
});

async function loadSidebarStats() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') return; // seulement pour admin
    try {
        const stats = await apiCall('/stats');
        const elAssurance = document.getElementById('stats-assurance');
        const elVignette = document.getElementById('stats-vignette');
        const elCarburant = document.getElementById('stats-carburant');
        if (elAssurance) elAssurance.textContent = '525 000 FCFA'; // simulé
        if (elVignette) elVignette.textContent = '580 000 FCFA'; // simulé
        if (elCarburant && stats.coutCarburant) {
            const totalCarburant = stats.coutCarburant.reduce((acc, m) => acc + m.total, 0);
            elCarburant.textContent = totalCarburant + ' FCFA';
        }
    } catch (err) {
        console.error(err);
    }
}

export function initSearch(tableId, inputSelector, columnIndices = null) {
    const input = document.querySelector(inputSelector);
    if (!input) {
        console.warn(`Élément de recherche non trouvé : ${inputSelector}`);
        return;
    }

    // Éviter les écouteurs multiples en clonant/remplaçant l'input
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll(`${tableId} tbody tr`);
        rows.forEach(row => {
            let match = false;
            if (columnIndices) {
                for (let idx of columnIndices) {
                    const cell = row.cells[idx];
                    if (cell && cell.textContent.toLowerCase().includes(term)) {
                        match = true;
                        break;
                    }
                }
            } else {
                match = row.textContent.toLowerCase().includes(term);
            }
            row.style.display = match ? '' : 'none';
        });
    });
}

// Rendre les fonctions disponibles globalement pour les attributs onclick
window.login = login;
window.logout = logout;
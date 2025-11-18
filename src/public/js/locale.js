/**
 * LOCALE SYSTEM - TRANSLATION GUIDE
 * 
 * How to add a new language:
 * 
 * 1. Add your language code to the translations object below (e.g., 'fr', 'es', 'it')
 * 2. Copy all the keys from 'en' (English) and translate the VALUES (not the keys!)
 * 3. Add your language to the locale selector in all HTML files:
 *    <option value="fr">Français</option>
 * 
 * Example - Adding French:
 * 
 * const translations = {
 *     en: {
 *         dashboard: 'FiveM Logging Dashboard',
 *         logout: 'Logout',
 *     },
 *     de: {
 *         dashboard: 'FiveM Logging Dashboard',
 *         logout: 'Abmelden',
 *     },
 *     fr: {  // ← Your new language
 *         dashboard: 'Tableau de bord FiveM',
 *         logout: 'Déconnexion',
 *     }
 * };
 * 
 * Then update HTML files (dashboard.html, admin.html, login.html, setup.html):
 * 
 * <select id="localeSelector" class="locale-selector" onchange="setLocale(this.value)">
 *     <option value="en">English</option>
 *     <option value="de">Deutsch</option>
 *     <option value="fr">Français</option>  ← Add this
 * </select>
 * 
 * IMPORTANT:
 * - Keep all keys exactly the same across all languages
 * - Only translate the VALUES (the text after the colon)
 * - Use data-i18n="keyName" in HTML to mark translatable elements
 * - The system automatically applies translations on page load
 * 
 * For more details, see TRANSLATIONS.md
 */

const translations = {
    en: {
        // Header
        dashboard: 'FiveM Logging Dashboard',
        adminPanel: 'Admin Panel',
        logout: 'Logout',
        
        // Dashboard
        filters: 'Filters',
        type: 'Type',
        all: 'All',
        level: 'Level',
        resource: 'Resource',
        search: 'Search',
        startDate: 'Start Date',
        endDate: 'End Date',
        applyFilters: 'Apply Filters',
        clear: 'Clear',
        logs: 'Logs',
        refresh: 'Refresh',
        deleteSelected: 'Delete Selected',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        
        // Table Headers
        id: 'ID',
        type: 'Type',
        level: 'Level',
        resource: 'Resource',
        message: 'Message',
        media: 'Media',
        timestamp: 'Timestamp',
        metadata: 'Metadata',
        view: 'View',
        hide: 'Hide',
        actions: 'Actions',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this log?',
        confirmDeleteSelected: 'Are you sure you want to delete {count} selected logs?',
        
        // Admin Panel
        webhooks: 'Webhooks',
        users: 'Users',
        webhookConfiguration: 'Webhook Configuration',
        webhookUsage: 'Webhook Usage Guide',
        howToSendLogs: 'How to Send Logs',
        webhookDescription: 'Send logs directly to these endpoints without configuration. The system automatically filters and categorizes logs based on the URL and metadata.',
        
        // Webhook Endpoints
        discordWebhooks: 'Discord Webhooks',
        discordWebhookDesc: 'Send logs directly to your Discord webhook URL and optionally filter by resource/level:',
        basic: 'Basic',
        withResourceFilter: 'With Resource Filter',
        withResourceLevelFilter: 'With Resource + Level Filter',
        example: 'Example',
        examples: 'Examples',
        supportsMediaDiscord: 'Supports images, videos, and embeds from Discord attachments',
        fivemLogs: 'FiveM Logs',
        fivemLogsDesc: 'Send FiveM logs with automatic metadata filtering:',
        includeMetadata: 'Include metadata in your payload:',
        autoExtractsMetadata: 'The system automatically extracts resource and level from your metadata',
        customEndpoints: 'Custom Endpoints',
        customEndpointsDesc: 'Create custom filtered endpoints for specific resources:',
        resourceFilter: 'Resource Filter',
        resourceLevelFilter: 'Resource + Level Filter',
        
        addWebhook: 'Add Webhook',
        usingYourWebhooks: 'Using Your Webhooks',
        sendLogsToEndpoints: 'Send logs to these endpoints:',
        configureWebhooksBelow: 'Configure webhooks below to forward logs to Discord, logging services, or other destinations.',
        
        // Webhook Table
        name: 'Name',
        url: 'URL',
        description: 'Description',
        status: 'Status',
        actions: 'Actions',
        active: 'Active',
        inactive: 'Inactive',
        edit: 'Edit',
        enable: 'Enable',
        disable: 'Disable',
        delete: 'Delete',
        
        // User Management
        userManagement: 'User Management',
        addUser: 'Add User',
        username: 'Username',
        role: 'Role',
        created: 'Created',
        admin: 'Admin',
        user: 'User',
        resetPassword: 'Reset Password',
        
        // Modals
        addWebhookTitle: 'Add Webhook',
        editWebhookTitle: 'Edit Webhook',
        webhookName: 'Name:',
        webhookType: 'Type:',
        webhookUrl: 'Webhook URL:',
        webhookDescription: 'Description:',
        save: 'Save',
        cancel: 'Cancel',
        
        addUserTitle: 'Add User',
        newUsername: 'Username:',
        newPassword: 'Password:',
        createUser: 'Create User',
        
        resetPasswordTitle: 'Reset Password',
        resetPasswordFor: 'Reset password for:',
        newPassword: 'New Password:',
        resetPasswordBtn: 'Reset Password',
        
        // Messages
        loading: 'Loading...',
        noLogsFound: 'No logs found',
        errorLoadingLogs: 'Error loading logs',
        accessDenied: 'Access denied. Admin privileges required.',
        noWebhooksConfigured: 'No webhooks configured. Click "Add Webhook" to get started.',
        confirmDeleteWebhook: 'Are you sure you want to delete webhook',
        confirmDeleteUser: 'Are you sure you want to delete user',
        passwordMinLength: 'Password must be at least 8 characters',
        passwordResetSuccess: 'Password reset successfully',
        
        // Login/Setup
        loginTitle: 'Login',
        loginSubtitle: 'FiveM Logging System',
        password: 'Password',
        login: 'Login',
        setupTitle: 'Initial Setup',
        setupSubtitle: 'Create your admin account',
        confirmPassword: 'Confirm Password',
        createAccount: 'Create Account',
    },
    de: {
        // Header
        dashboard: 'FiveM Logging Dashboard',
        adminPanel: 'Admin-Panel',
        logout: 'Abmelden',
        
        // Dashboard
        filters: 'Filter',
        type: 'Typ',
        all: 'Alle',
        level: 'Stufe',
        resource: 'Ressource',
        search: 'Suche',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        applyFilters: 'Filter anwenden',
        clear: 'Löschen',
        logs: 'Logs',
        refresh: 'Aktualisieren',
        deleteSelected: 'Ausgewählte löschen',
        close: 'Schließen',
        confirm: 'Bestätigen',
        yes: 'Ja',
        no: 'Nein',
        
        // Table Headers
        id: 'ID',
        type: 'Typ',
        level: 'Stufe',
        resource: 'Ressource',
        message: 'Nachricht',
        media: 'Medien',
        timestamp: 'Zeitstempel',
        metadata: 'Metadaten',
        view: 'Anzeigen',
        hide: 'Verbergen',
        actions: 'Aktionen',
        delete: 'Löschen',
        confirmDelete: 'Möchten Sie diesen Log wirklich löschen?',
        confirmDeleteSelected: 'Möchten Sie {count} ausgewählte Logs wirklich löschen?',
        
        // Admin Panel
        webhooks: 'Webhooks',
        users: 'Benutzer',
        webhookConfiguration: 'Webhook-Konfiguration',
        webhookUsage: 'Webhook-Nutzungsanleitung',
        howToSendLogs: 'So senden Sie Logs',
        webhookDescription: 'Senden Sie Logs direkt an diese Endpunkte ohne Konfiguration. Das System filtert und kategorisiert Logs automatisch basierend auf der URL und Metadaten.',
        
        // Webhook Endpoints
        discordWebhooks: 'Discord Webhooks',
        discordWebhookDesc: 'Senden Sie Logs direkt an Ihre Discord-Webhook-URL und filtern Sie optional nach Ressource/Level:',
        basic: 'Basis',
        withResourceFilter: 'Mit Ressourcen-Filter',
        withResourceLevelFilter: 'Mit Ressourcen + Level Filter',
        example: 'Beispiel',
        examples: 'Beispiele',
        supportsMediaDiscord: 'Unterstützt Bilder, Videos und Embeds aus Discord-Anhängen',
        fivemLogs: 'FiveM Logs',
        fivemLogsDesc: 'Senden Sie FiveM-Logs mit automatischer Metadaten-Filterung:',
        includeMetadata: 'Fügen Sie Metadaten in Ihre Payload ein:',
        autoExtractsMetadata: 'Das System extrahiert automatisch Ressource und Level aus Ihren Metadaten',
        customEndpoints: 'Benutzerdefinierte Endpunkte',
        customEndpointsDesc: 'Erstellen Sie benutzerdefinierte gefilterte Endpunkte für bestimmte Ressourcen:',
        resourceFilter: 'Ressourcen-Filter',
        resourceLevelFilter: 'Ressourcen + Level Filter',
        
        addWebhook: 'Webhook hinzufügen',
        usingYourWebhooks: 'Ihre Webhooks verwenden',
        sendLogsToEndpoints: 'Logs an diese Endpunkte senden:',
        configureWebhooksBelow: 'Konfigurieren Sie unten Webhooks, um Logs an Discord, Logging-Dienste oder andere Ziele weiterzuleiten.',
        
        // Webhook Table
        name: 'Name',
        url: 'URL',
        description: 'Beschreibung',
        status: 'Status',
        actions: 'Aktionen',
        active: 'Aktiv',
        inactive: 'Inaktiv',
        edit: 'Bearbeiten',
        enable: 'Aktivieren',
        disable: 'Deaktivieren',
        delete: 'Löschen',
        
        // User Management
        userManagement: 'Benutzerverwaltung',
        addUser: 'Benutzer hinzufügen',
        username: 'Benutzername',
        role: 'Rolle',
        created: 'Erstellt',
        admin: 'Administrator',
        user: 'Benutzer',
        resetPassword: 'Passwort zurücksetzen',
        
        // Modals
        addWebhookTitle: 'Webhook hinzufügen',
        editWebhookTitle: 'Webhook bearbeiten',
        webhookName: 'Name:',
        webhookType: 'Typ:',
        webhookUrl: 'Webhook-URL:',
        webhookDescription: 'Beschreibung:',
        save: 'Speichern',
        cancel: 'Abbrechen',
        
        addUserTitle: 'Benutzer hinzufügen',
        newUsername: 'Benutzername:',
        newPassword: 'Passwort:',
        createUser: 'Benutzer erstellen',
        
        resetPasswordTitle: 'Passwort zurücksetzen',
        resetPasswordFor: 'Passwort zurücksetzen für:',
        newPassword: 'Neues Passwort:',
        resetPasswordBtn: 'Passwort zurücksetzen',
        
        // Messages
        loading: 'Lädt...',
        noLogsFound: 'Keine Logs gefunden',
        errorLoadingLogs: 'Fehler beim Laden der Logs',
        accessDenied: 'Zugriff verweigert. Administratorrechte erforderlich.',
        noWebhooksConfigured: 'Keine Webhooks konfiguriert. Klicken Sie auf "Webhook hinzufügen", um zu beginnen.',
        confirmDeleteWebhook: 'Möchten Sie den Webhook wirklich löschen',
        confirmDeleteUser: 'Möchten Sie den Benutzer wirklich löschen',
        passwordMinLength: 'Passwort muss mindestens 8 Zeichen lang sein',
        passwordResetSuccess: 'Passwort erfolgreich zurückgesetzt',
        
        // Login/Setup
        loginTitle: 'Anmelden',
        loginSubtitle: 'FiveM Logging System',
        password: 'Passwort',
        login: 'Anmelden',
        setupTitle: 'Ersteinrichtung',
        setupSubtitle: 'Erstellen Sie Ihr Administrator-Konto',
        confirmPassword: 'Passwort bestätigen',
        createAccount: 'Konto erstellen',
    }
};

// Get current locale from localStorage or default to English
function getCurrentLocale() {
    return localStorage.getItem('locale') || 'en';
}

// Set locale
function setLocale(locale) {
    localStorage.setItem('locale', locale);
    location.reload();
}

// Get translation
function t(key) {
    const locale = getCurrentLocale();
    return translations[locale][key] || translations.en[key] || key;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, getCurrentLocale, setLocale };
}

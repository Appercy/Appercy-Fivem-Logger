# How to Add Translations

This guide shows you how to add new languages to the FiveM Logging System in just a few simple steps!

## Quick Start (5 Minutes)

### Step 1: Edit the Translations File

Open `src/public/js/locale.js` and find the `translations` object. You'll see English (`en`) and German (`de`):

```javascript
const translations = {
    en: {
        dashboard: 'FiveM Logging Dashboard',
        logout: 'Logout',
        // ... more English translations
    },
    de: {
        dashboard: 'FiveM Logging Dashboard', 
        logout: 'Abmelden',
        // ... more German translations
    }
};
```

### Step 2: Copy English Section

Copy the entire English (`en`) section and paste it below. Change `en` to your language code (e.g., `fr` for French, `es` for Spanish, `pl` for Polish):

```javascript
const translations = {
    en: { /* ... */ },
    de: { /* ... */ },
    fr: {  // ← Your new language code
        // Now translate all the values!
        dashboard: 'Tableau de bord FiveM',
        logout: 'Déconnexion',
        // ... translate all the rest
    }
};
```

### Step 3: Translate All Values

Go through each line and translate the text AFTER the colon. **Don't change the keys** (the words before the colon)!

✅ **Correct:**
```javascript
fr: {
    dashboard: 'Tableau de bord FiveM',  // ← Translated value
    logout: 'Déconnexion',
}
```

❌ **Wrong:**
```javascript
fr: {
    tableauDeBord: 'Tableau de bord FiveM',  // ← DON'T change the key!
    deconnexion: 'Déconnexion',
}
```

### Step 4: Add Language to Dropdowns

Update the language selector in these 4 HTML files:

**src/public/dashboard.html** (around line 17):
```html
<select id="localeSelector" class="locale-selector" onchange="setLocale(this.value)">
    <option value="en">English</option>
    <option value="de">Deutsch</option>
    <option value="fr">Français</option>  <!-- ← Add your language -->
</select>
```

**src/public/login.html** (around line 18):
```html
<select id="localeSelector" class="locale-selector" onchange="setLocale(this.value)" style="width: auto;">
    <option value="en">EN</option>
    <option value="de">DE</option>
    <option value="fr">FR</option>  <!-- ← Add your language -->
</select>
```

**src/public/setup.html** (around line 20):
```html
<select id="localeSelector" class="locale-selector" onchange="setLocale(this.value)" style="width: auto;">
    <option value="en">EN</option>
    <option value="de">DE</option>
    <option value="fr">FR</option>  <!-- ← Add your language -->
</select>
```

**src/public/admin.html** (around line 17):
```html
<select id="localeSelector" class="locale-selector" onchange="setLocale(this.value)">
    <option value="en">English</option>
    <option value="de">Deutsch</option>
    <option value="fr">Français</option>  <!-- ← Add your language -->
</select>
```

### Step 5: Test It!

Restart the application and select your new language from the dropdown!

---

## Complete Translation Keys List

Here are ALL the keys you need to translate. Copy this checklist and work through it:

### Header Section
- `dashboard` - Dashboard title
- `adminPanel` - Admin panel button
- `logout` - Logout button

### Dashboard Filters
- `filters` - Filters heading
- `type` - Type filter label
- `all` - All option
- `level` - Level filter label
- `resource` - Resource filter label
- `search` - Search filter label
- `startDate` - Start date label
- `endDate` - End date label
- `applyFilters` - Apply filters button
- `clear` - Clear button
- `logs` - Logs heading
- `refresh` - Refresh button
- `deleteSelected` - Delete selected button

### Table Headers
- `id` - ID column
- `message` - Message column
- `timestamp` - Timestamp column
- `metadata` - Metadata column
- `media` - Media column
- `actions` - Actions column
- `view` - View metadata button
- `hide` - Hide metadata button
- `delete` - Delete button
- `confirmDelete` - Delete confirmation message
- `confirmDeleteSelected` - Bulk delete confirmation (use `{count}` for number)

### Admin Panel - Webhooks
- `webhooks` - Webhooks tab
- `users` - Users tab
- `webhookConfiguration` - Webhook configuration heading
- `addWebhook` - Add webhook button
- `usingYourWebhooks` - Using webhooks heading
- `sendLogsToEndpoints` - Send logs description
- `configureWebhooksBelow` - Configure webhooks description
- `name` - Name label
- `url` - URL label
- `description` - Description label
- `status` - Status label
- `actions` - Actions label
- `active` - Active status
- `inactive` - Inactive status
- `edit` - Edit button
- `enable` - Enable button
- `disable` - Disable button

### Admin Panel - Users
- `userManagement` - User management heading
- `addUser` - Add user button
- `username` - Username label
- `role` - Role label
- `created` - Created label
- `admin` - Admin role
- `user` - User role
- `resetPassword` - Reset password button

### Modals
- `addWebhookTitle` - Add webhook modal title
- `editWebhookTitle` - Edit webhook modal title
- `webhookName` - Webhook name label
- `webhookType` - Webhook type label
- `webhookUrl` - Webhook URL label
- `webhookDescription` - Webhook description label
- `save` - Save button
- `cancel` - Cancel button
- `addUserTitle` - Add user modal title
- `newUsername` - New username label
- `newPassword` - New password label
- `createUser` - Create user button
- `resetPasswordTitle` - Reset password modal title
- `resetPasswordFor` - Reset password for text
- `resetPasswordBtn` - Reset password button

### Messages
- `loading` - Loading text
- `noLogsFound` - No logs found message
- `errorLoadingLogs` - Error loading logs message
- `accessDenied` - Access denied message
- `noWebhooksConfigured` - No webhooks configured message
- `confirmDeleteWebhook` - Confirm delete webhook message
- `confirmDeleteUser` - Confirm delete user message
- `passwordMinLength` - Password minimum length message
- `passwordResetSuccess` - Password reset success message

### Login/Setup
- `loginTitle` - Login page title
- `loginSubtitle` - Login subtitle
- `password` - Password label
- `login` - Login button
- `setupTitle` - Setup page title
- `setupSubtitle` - Setup subtitle
- `confirmPassword` - Confirm password label
- `createAccount` - Create account button

## Tips for Translators

1. **Keep formatting**: If a translation includes HTML tags or special characters, preserve them
   ```javascript
   // English
   confirmDeleteSelected: 'Are you sure you want to delete {count} selected logs?',
   
   // French - keep the {count} placeholder
   confirmDeleteSelected: 'Êtes-vous sûr de vouloir supprimer {count} logs sélectionnés ?',
   ```

2. **Test thoroughly**: After adding translations, test all pages and features

3. **Be consistent**: Use the same terms throughout (e.g., always "webhook" not sometimes "web hook")

4. **Consider context**: Some words have different meanings in different contexts

5. **Use native speakers**: If possible, have a native speaker review your translations

## Example: Adding Spanish

Here's a complete example of adding Spanish:

**1. Edit `src/public/js/locale.js`:**

```javascript
const translations = {
    en: { /* ... */ },
    de: { /* ... */ },
    es: {
        // Header
        dashboard: 'Panel de FiveM',
        adminPanel: 'Panel de Administración',
        logout: 'Cerrar Sesión',
        
        // Dashboard
        filters: 'Filtros',
        type: 'Tipo',
        all: 'Todos',
        level: 'Nivel',
        resource: 'Recurso',
        search: 'Buscar',
        startDate: 'Fecha de Inicio',
        endDate: 'Fecha de Fin',
        applyFilters: 'Aplicar Filtros',
        clear: 'Limpiar',
        logs: 'Registros',
        refresh: 'Actualizar',
        deleteSelected: 'Eliminar Seleccionados',
        
        // ... continue with all keys
    }
};
```

**2. Add to all HTML selectors:**

```html
<option value="es">Español</option>
```

**3. Test and enjoy!**

## Contributing Translations

If you create a translation for a new language, please consider contributing it back to the project:

1. Fork the repository
2. Add your translation to `src/public/js/locale.js`
3. Update all HTML language selectors
4. Test thoroughly
5. Submit a pull request

## Need Help?

If you need help with translations:
- Check existing translations (English and German) as examples
- Ask in the project's issues/discussions
- Use translation tools like DeepL or Google Translate as a starting point (but review carefully!)

---

**Happy Translating! 🌍**

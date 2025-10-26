// src/i18n/messages/de.ts
export default {
    dashboard: {
        title: "Dashboard",
    },
    auth: {
        signIn: "Anmelden",
        signInHint:
            "Geben Sie Ihre E-Mail und Ihr Passwort ein, um sich anzumelden",
        email: "E-Mail",
        password: "Passwort",
        rememberMe: "Angemeldet bleiben",
        forgotPassword: "Passwort vergessen?",
        orRegister: "oder Registrieren",
        noAccount: "Noch kein Konto?",
        register: "Registrieren",
        invalidCredentials: "Ungültige Anmeldedaten",
        sessionExpired: "Sitzung abgelaufen",
    },
    common: {
        empty: "Keine Daten",
        edit: "Bearbeiten",
        cancel: "Abbrechen",
        save: "Speichern",
        saved: "Gespeichert",
        saving: "Speichern",
        delete: "Löschen",
        loading: "Laden...",
        yes: "Ja",
        no: "Nein",
        confirm: "Bestätigen",
        actions: "Aktionen",
        name: "Name",
    },
    toast: {
        loginSuccess: "Erfolgreich angemeldet",
        loginFailed: "Anmeldung fehlgeschlagen",
        loginError: "Anmeldung fehlgeschlagen",

        // HTTP-Fehler
        http: {
            400: "Ungültige Anfrage.",
            401: "Sitzung abgelaufen. Bitte erneut anmelden.",
            403: "Keine Berechtigung.",
            404: "Ressource nicht gefunden.",
            405: "Methode nicht erlaubt.",
            409: "Konflikt. Bitte Seite aktualisieren oder erneut versuchen.",
            422: "Validierung fehlgeschlagen.",
            429: "Zu viele Anfragen. Bitte später erneut versuchen.",
            500: "Serverfehler. Bitte später erneut versuchen.",
            network: "Netzwerkfehler. Verbindung oder Server prüfen.",
            timeout: "Zeitüberschreitung der Anfrage.",
            unknown: "Unbekannter Fehler.",
            validation: "Validierung fehlgeschlagen.",
            success: "Aktion erfolgreich.",
        },
    },
};

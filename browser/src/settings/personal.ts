export interface PersonalSettings {
    hotkeys: {

    }
}

const DEFAULTS: PersonalSettings = {
    hotkeys: {
        towerSelect
    }
}

let currentSettings: PersonalSettings | undefined;

export const getCurrentSettings = (): PersonalSettings => {
    if (!currentSettings) {
        currentSettings = loadFromLocalStorage();
        if (!currentSettings) {
            currentSettings = 
        }
    }
}

const loadFromLocalStorage = (): PersonalSettings | undefined => {
    try {
        let settingsStr = localStorage.getItem("personal_settings");
        if (!settingsStr) return undefined;
        return JSON.parse(settingsStr);
    }
    catch(e) {
        return undefined;
    }
}
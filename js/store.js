(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    var state = {
        activeSection: "home",
        library: null,
        recentTools: [],
        recentAssets: [],
        formState: {},
        lastResult: null,
        serviceConfig: {
            captionProvider: "manual",
            backgroundRemoval: "disabled"
        }
    };

    VortexApp.store = {
        getState: function () {
            return state;
        },
        setActiveSection: function (sectionId) {
            state.activeSection = sectionId;
        },
        setLibrary: function (library) {
            state.library = library;
        },
        rememberTool: function (toolName) {
            if (!toolName) {
                return;
            }

            state.recentTools = [toolName].concat(state.recentTools.filter(function (name) {
                return name !== toolName;
            })).slice(0, 6);
        },
        setRecentAssets: function (assets) {
            state.recentAssets = assets || [];
        },
        setLastResult: function (result) {
            state.lastResult = result;
        },
        setFormState: function (key, value) {
            state.formState[key] = value;
        },
        getFormState: function (key, fallbackValue) {
            if (state.formState.hasOwnProperty(key)) {
                return state.formState[key];
            }

            return fallbackValue;
        },
        setServiceConfig: function (config) {
            state.serviceConfig = config || state.serviceConfig;
        }
    };
})(this);

(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};
    var csInterface = new CSInterface();

    function getHostScriptPath() {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) || "";
        return extensionRoot.replace(/\\/g, "/") + "/host/host.jsx";
    }

    function buildScript(commandName, payload) {
        var serializedPayload = JSON.stringify(payload || {});
        return [
            "(function () {",
            "    $.evalFile(" + JSON.stringify(getHostScriptPath()) + ");",
            "    if (typeof runHostCommand !== 'function') {",
            "        return 'HOST_BOOTSTRAP_FAILED';",
            "    }",
            "    return runHostCommand(" + JSON.stringify(commandName) + ", " + JSON.stringify(serializedPayload) + ");",
            "}())"
        ].join("");
    }

    VortexApp.hostBridge = {
        invoke: function (commandName, payload, callback) {
            csInterface.evalScript(buildScript(commandName, payload), function (rawResult) {
                if (callback) {
                    callback(rawResult);
                }
            });
        }
    };
})(this);

(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};
    var csInterface = new CSInterface();

    function buildScript(commandName, payload) {
        var serializedPayload = JSON.stringify(payload || {});
        return "runHostCommand(" + JSON.stringify(commandName) + ", " + JSON.stringify(serializedPayload) + ")";
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

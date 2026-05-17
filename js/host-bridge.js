(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};
    var csInterface = new CSInterface();
    var hostReady = false;
    var hostLoading = false;
    var pendingCallbacks = [];

    function getHostScriptPath() {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) || "";
        return extensionRoot.replace(/\\/g, "/") + "/host/host.jsx";
    }

    function flushPendingCallbacks(ready) {
        var callbacks = pendingCallbacks.slice(0);
        var i;

        pendingCallbacks = [];
        hostLoading = false;
        hostReady = ready;

        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](ready);
        }
    }

    function ensureHostLoaded(callback) {
        if (hostReady) {
            callback(true);
            return;
        }

        pendingCallbacks.push(callback);

        if (hostLoading) {
            return;
        }

        hostLoading = true;

        var loadScript =
            "(function(){" +
                "if (typeof runHostCommand === 'function') { return 'ready'; }" +
                "var loaded = $.evalFile(" + JSON.stringify(getHostScriptPath()) + ");" +
                "if (typeof runHostCommand === 'function') { return 'ready'; }" +
                "return String(loaded);" +
            "}())";

        csInterface.evalScript(loadScript, function (result) {
            flushPendingCallbacks(result === "ready");
        });
    }

    function buildScript(commandName, payload) {
        var serializedPayload = JSON.stringify(payload || {});
        return "runHostCommand(" + JSON.stringify(commandName) + ", " + JSON.stringify(serializedPayload) + ")";
    }

    VortexApp.hostBridge = {
        invoke: function (commandName, payload, callback) {
            ensureHostLoaded(function (ready) {
                if (!ready) {
                    if (callback) {
                        callback("");
                    }
                    return;
                }

                csInterface.evalScript(buildScript(commandName, payload), function (rawResult) {
                    if (callback) {
                        callback(rawResult);
                    }
                });
            });
        }
    };
})(this);

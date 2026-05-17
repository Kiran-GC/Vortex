(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    function parseResponse(rawResult) {
        if (!rawResult) {
            return {
                ok: false,
                error: {
                    code: "empty_response",
                    message: "No response returned from the After Effects host."
                }
            };
        }

        if (rawResult === "EvalScript error.") {
            return {
                ok: false,
                error: {
                    code: "evalscript_error",
                    message: "After Effects could not execute the host script."
                }
            };
        }

        try {
            return JSON.parse(rawResult);
        } catch (error) {
            return {
                ok: false,
                error: {
                    code: "invalid_json",
                    message: "Host returned malformed JSON.",
                    detail: String(rawResult)
                }
            };
        }
    }

    VortexApp.commandClient = {
        execute: function (commandName, payload, callback) {
            VortexApp.hostBridge.invoke(commandName, payload, function (rawResult) {
                var result = parseResponse(rawResult);
                VortexApp.store.setLastResult(result);

                if (callback) {
                    callback(result);
                }
            });
        }
    };
})(this);

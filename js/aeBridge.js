var csInterface = new CSInterface();

var VortexBridge = {

    eval: function(script, callback) {
        csInterface.evalScript(script, callback);
    }

};

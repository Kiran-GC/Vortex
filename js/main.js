(function (global) {
    document.addEventListener("DOMContentLoaded", function () {
        var VortexApp = global.VortexApp = global.VortexApp || {};

        VortexApp.shell.bindNav();
        VortexApp.shell.bootstrap();
    });
})(this);

(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};
    var toastTimer = null;

    function getToast() {
        return document.getElementById("toast");
    }

    VortexApp.notifications = {
        showToast: function (message, kind) {
            var toast = getToast();

            if (!toast) {
                return;
            }

            toast.textContent = message;
            toast.className = "toast show" + (kind === "error" ? " is-error" : "");

            if (toastTimer) {
                clearTimeout(toastTimer);
            }

            toastTimer = setTimeout(function () {
                toast.className = "toast";
            }, 1800);
        },
        setBanner: function (message, kind) {
            var banner = document.getElementById("resultBanner");

            if (!banner) {
                return;
            }

            if (!message) {
                banner.textContent = "";
                banner.className = "result-banner hidden";
                return;
            }

            banner.textContent = message;
            banner.className = "result-banner";

            if (kind === "error") {
                banner.style.borderColor = "rgba(255, 122, 146, 0.3)";
                banner.style.background = "rgba(255, 122, 146, 0.08)";
            } else {
                banner.style.borderColor = "rgba(77, 217, 233, 0.2)";
                banner.style.background = "rgba(77, 217, 233, 0.08)";
            }
        }
    };
})(this);

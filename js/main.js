document.addEventListener("DOMContentLoaded", function () {

    var copiedEffectsData = null;

    var applyBtn = document.getElementById("applyEffectsBtn");
    if (applyBtn) applyBtn.disabled = true;

    function showToast(message) {
        var toast = document.getElementById("toast");
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 1500);
    }

    /* ============================= */
    /* VIEW NAVIGATION */
    /* ============================= */

    var views = document.querySelectorAll(".view");
    var navButtons = document.querySelectorAll(".nav-btn");
    var backButtons = document.querySelectorAll(".back-btn");

    function switchView(targetId) {
        views.forEach(function (v) {
            v.classList.remove("active");
        });

        var target = document.getElementById(targetId);
        if (target) target.classList.add("active");
    }

    navButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var target = btn.getAttribute("data-target");
            if (target) switchView(target);
        });
    });

    backButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var target = btn.getAttribute("data-target");
            if (target) switchView(target);
        });
    });

    /* ============================= */
    /* EFFECTS TOOL */
    /* ============================= */

    var copyBtn = document.getElementById("copyEffectsBtn");

    if (copyBtn) {
        copyBtn.addEventListener("click", function () {

            VortexBridge.eval("getLayerEffects()", function (result) {

                if (!result || result === "null") {
                    showToast("No effects found");
                    return;
                }

                copiedEffectsData = result;
                if (applyBtn) applyBtn.disabled = false;

                showToast("✓ Copied");
            });

        });
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", function () {

            if (!copiedEffectsData) return;

            var encodedData = encodeURIComponent(copiedEffectsData);
            VortexBridge.eval('applyLayerEffects("' + encodedData + '")');

            showToast("✓ Applied");
        });
    }

});

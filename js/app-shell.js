(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    function getModule(sectionId) {
        return VortexApp.modules[sectionId];
    }

    function updateHeader(meta) {
        document.getElementById("sectionTitle").textContent = meta.title;
        document.getElementById("sectionEyebrow").textContent = meta.eyebrow;
    }

    function updateHostStatus() {
        var hostStatus = document.getElementById("hostStatus");
        var hostState = VortexApp.store.getState().hostState;

        if (!hostStatus || !hostState) {
            return;
        }

        hostStatus.textContent = hostState.message;
        hostStatus.className = hostState.connected ? "host-pill is-live" : "host-pill is-error";
    }

    function updateActiveNav(sectionId) {
        var buttons = document.querySelectorAll(".section-link");

        Array.prototype.forEach.call(buttons, function (button) {
            var isActive = button.getAttribute("data-section") === sectionId;
            button.className = isActive ? "section-link active" : "section-link";
        });
    }

    function renderActions(sectionId) {
        var actionsRoot = document.getElementById("workspaceActions");
        var defaultAction = sectionId === "home" ? "" : '<button data-section-jump="home">Main Menu</button>';

        if (sectionId === "layers") {
            actionsRoot.innerHTML = defaultAction + '<button data-section-jump="templates">Library</button>';
        } else if (sectionId === "text") {
            actionsRoot.innerHTML = defaultAction + '<button data-section-jump="settings">Settings</button>';
        } else {
            actionsRoot.innerHTML = defaultAction;
        }

        var jumpButtons = actionsRoot.querySelectorAll("[data-section-jump]");
        Array.prototype.forEach.call(jumpButtons, function (button) {
            button.addEventListener("click", function () {
                VortexApp.shell.navigate(button.getAttribute("data-section-jump"));
            });
        });
    }

    VortexApp.shell = {
        bootstrap: function () {
            var shell = this;

            VortexApp.commandClient.execute("vortex.ping", {}, function (pingResult) {
                if (!pingResult.ok) {
                    VortexApp.store.setHostState(false, "After Effects host unavailable");
                    VortexApp.notifications.setBanner("The After Effects host did not respond. Recopy the extension and restart After Effects.", "error");
                    updateHostStatus();
                    shell.renderCurrentSection();
                    return;
                }

                VortexApp.store.setHostState(true, "After Effects host connected");
                updateHostStatus();

                VortexApp.commandClient.execute("settings.getConfig", {}, function (result) {
                    if (result.ok) {
                        VortexApp.store.setLibrary(result.data.library || null);
                        VortexApp.store.setServiceConfig(result.data.serviceConfig || {});
                        VortexApp.store.setRecentAssets(result.data.recentAssets || []);
                        if (result.data.library && result.data.library.rootPath) {
                            VortexApp.notifications.setBanner("Host command system ready. Library initialized at " + result.data.library.rootPath + ".");
                        } else {
                            VortexApp.notifications.setBanner("Host command system ready.");
                        }
                    } else {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                    }

                    shell.renderCurrentSection();
                });
            });
        },
        navigate: function (sectionId) {
            if (!getModule(sectionId)) {
                return;
            }

            VortexApp.store.setActiveSection(sectionId);
            this.renderCurrentSection();
        },
        renderCurrentSection: function () {
            var state = VortexApp.store.getState();
            var sectionId = state.activeSection;
            var section = getModule(sectionId);
            var contentRoot = document.getElementById("sectionContent");

            updateHeader(section.meta);
            updateHostStatus();
            updateActiveNav(sectionId);
            renderActions(sectionId);

            contentRoot.innerHTML = section.render();
            section.bind(contentRoot, this);
        },
        bindNav: function () {
            var buttons = document.querySelectorAll(".section-link");
            var shell = this;

            Array.prototype.forEach.call(buttons, function (button) {
                button.addEventListener("click", function () {
                    shell.navigate(button.getAttribute("data-section"));
                });
            });

            document.getElementById("brandHomeButton").addEventListener("click", function () {
                shell.navigate("home");
            });
        }
    };
})(this);

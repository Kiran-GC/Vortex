(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.settings = {
        meta: {
            title: "Settings",
            eyebrow: "Library path, feature flags, service placeholders"
        },
        render: function () {
            var state = VortexApp.store.getState();
            var libraryPath = state.library && state.library.rootPath ? state.library.rootPath : "";
            var serviceConfig = state.serviceConfig || {};

            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Vortex library</h3><p class=\"card-copy\">Reusable assets live in a shared external library so templates, graphs, and text animations can move between projects.</p></div>" +
                        '<div class="field-stack">' +
                            '<label for="libraryPath">Library root path</label>' +
                            '<input id="libraryPath" type="text" value="' + libraryPath + '">' +
                            '<div class="field-help">Default root is managed under the user data directory, but you can point Vortex at a custom shared location.</div>' +
                        "</div>" +
                        '<div class="action-row"><button id="saveLibraryPathBtn">Save Library Path</button><button id="reloadSettingsBtn">Reload Settings</button></div>' +
                    "</div>" +
                    '<div class="column tool-panel">' +
                        "<div><h3>Future service seams</h3><p class=\"card-copy\">These values are placeholders for later AutoCaption or media preprocessing integrations.</p></div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack"><label for="captionProvider">Caption provider</label><input id="captionProvider" type="text" value="' + (serviceConfig.captionProvider || "manual") + '"></div>' +
                            '<div class="field-stack"><label for="bgProvider">Background removal</label><input id="bgProvider" type="text" value="' + (serviceConfig.backgroundRemoval || "disabled") + '"></div>' +
                        "</div>" +
                    "</div>" +
                "</section>";
        },
        bind: function (root, shell) {
            root.querySelector("#saveLibraryPathBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("settings.updateLibraryPath", {
                    path: root.querySelector("#libraryPath").value
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.store.setLibrary(result.data.library);
                    VortexApp.notifications.setBanner("Updated library path to " + result.data.library.rootPath + ".");
                    VortexApp.notifications.showToast("Library updated");
                    VortexApp.store.rememberTool("Settings • Library path");
                    shell.renderCurrentSection();
                });
            });

            root.querySelector("#reloadSettingsBtn").addEventListener("click", function () {
                shell.bootstrap();
            });
        }
    };
})(this);

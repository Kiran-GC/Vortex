(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.media = {
        meta: {
            title: "Media",
            eyebrow: "Clipboard import, future preprocessing"
        },
        render: function () {
            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Clipboard image pipeline</h3><p class=\"card-copy\">The architecture now treats pasted images as an ingest pipeline. Import is first-class, and background removal can plug in later without changing the command shape.</p></div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack"><label for="bgRemoveMode">Background removal</label><select id="bgRemoveMode"><option value="disabled">Disabled</option><option value="later">Future extension</option></select></div>' +
                            '<div class="field-stack"><label for="imageSourceHint">Source hint</label><input id="imageSourceHint" type="text" placeholder="web clipboard, file, screenshot"></div>' +
                        "</div>" +
                        '<div class="action-row"><button id="importClipboardBtn">Import Clipboard Image</button></div>' +
                    "</div>" +
                    '<div class="column section-block">' +
                        "<h3>Media design notes</h3>" +
                        '<ul class="status-list">' +
                            '<li class="status-item"><strong class="status-title">Normalized results</strong><span class="list-meta">Media commands return a consistent shape for future preprocessing hooks.</span></li>' +
                            '<li class="status-item"><strong class="status-title">Service seam</strong><span class="list-meta">Optional background removal is intentionally not baked into the import core.</span></li>' +
                        "</ul>" +
                    "</div>" +
                "</section>";
        },
        bind: function (root) {
            root.querySelector("#importClipboardBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("media.importClipboardImage", {
                    sourceHint: root.querySelector("#imageSourceHint").value,
                    backgroundRemoval: root.querySelector("#bgRemoveMode").value
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("Clipboard import unavailable", "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Media pipeline initialized for " + result.data.supportedSources.join(", ") + ".");
                    VortexApp.store.rememberTool("Media • Clipboard import");
                });
            });
        }
    };
})(this);

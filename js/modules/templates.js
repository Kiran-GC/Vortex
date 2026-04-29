(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    function renderAssets(items) {
        if (!items || !items.length) {
            return '<div class="empty-state"><p class="empty-copy">No saved comp templates or reusable presets yet.</p></div>';
        }

        return '<ul class="asset-list">' + items.map(function (asset) {
            return '<li class="asset-item"><strong class="asset-title">' + asset.name + '</strong><span class="list-meta">' + asset.type + " • " + asset.updatedAt + "</span></li>";
        }).join("") + "</ul>";
    }

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.templates = {
        meta: {
            title: "Templates",
            eyebrow: "Reusable comp and preset library"
        },
        render: function () {
            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Comp template system</h3><p class=\"card-copy\">Templates are stored in a shared Vortex library with metadata, versioning, and a future path to richer payload serialization.</p></div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack"><label for="templateName">Template name</label><input id="templateName" type="text" placeholder="Kinetic Intro Template"></div>' +
                            '<div class="field-stack"><label for="templateTags">Tags</label><input id="templateTags" type="text" placeholder="intro, text, brand"></div>' +
                        "</div>" +
                        '<div class="action-row">' +
                            '<button id="saveCompTemplateBtn">Save Selected Comp</button>' +
                            '<button id="refreshTemplatesBtn">Refresh Library</button>' +
                        "</div>" +
                    "</div>" +
                    '<div class="column section-block">' +
                        "<h3>Library browser</h3>" +
                        '<div id="templateAssetList"><div class="empty-state"><p class="empty-copy">Refresh the library to inspect saved reusable assets.</p></div></div>' +
                    "</div>" +
                "</section>";
        },
        bind: function (root) {
            var assetList = root.querySelector("#templateAssetList");

            function refreshAssets() {
                VortexApp.commandClient.execute("library.listAssets", {}, function (result) {
                    if (!result.ok) {
                        assetList.innerHTML = '<div class="empty-state"><p class="empty-copy">' + result.error.message + "</p></div>";
                        return;
                    }

                    VortexApp.store.setRecentAssets(result.data.assets.slice(0, 5));
                    assetList.innerHTML = renderAssets(result.data.assets);
                });
            }

            root.querySelector("#saveCompTemplateBtn").addEventListener("click", function () {
                var tags = root.querySelector("#templateTags").value;

                VortexApp.commandClient.execute("templates.saveCompTemplate", {
                    name: root.querySelector("#templateName").value,
                    tags: tags ? tags.split(",") : []
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("Template save failed", "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Saved comp template metadata for " + result.data.asset.name + ".");
                    VortexApp.notifications.showToast("Template saved");
                    VortexApp.store.rememberTool("Templates • Save comp");
                    refreshAssets();
                });
            });

            root.querySelector("#refreshTemplatesBtn").addEventListener("click", function () {
                refreshAssets();
                VortexApp.store.rememberTool("Templates • Refresh");
            });

            refreshAssets();
        }
    };
})(this);

(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.layers = {
        meta: {
            title: "Layers",
            eyebrow: "trueComp, unprecomp, effects, layer utilities"
        },
        render: function () {
            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Effects copy workflow</h3><p class=\"card-copy\">The original feature now runs through the shared host command protocol instead of direct ad hoc ExtendScript calls.</p></div>" +
                        '<div class="action-row">' +
                            '<button id="copyEffectsBtn">Copy Effects</button>' +
                            '<button id="applyEffectsBtn" disabled>Apply Effects</button>' +
                        "</div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack">' +
                                '<label for="trueCompSuffix">trueComp suffix</label>' +
                                '<input id="trueCompSuffix" type="text" value="__vtx">' +
                            "</div>" +
                            '<div class="field-stack">' +
                                '<label for="anchorPreset">Anchor preset</label>' +
                                '<select id="anchorPreset">' +
                                    '<option value="center">Center</option>' +
                                    '<option value="top-left">Top Left</option>' +
                                    '<option value="bottom-center">Bottom Center</option>' +
                                "</select>" +
                            "</div>" +
                        "</div>" +
                        '<div class="action-row">' +
                            '<button id="trueCompBtn">trueComp Duplicate</button>' +
                            '<button id="anchorAdjustBtn">Adjust Anchor Point</button>' +
                            '<button id="unprecompBtn">UnPrecomp Stub</button>' +
                        "</div>" +
                    "</div>" +
                    '<div class="column section-block">' +
                        "<h3>Layer operations</h3>" +
                        '<ul class="status-list">' +
                            '<li class="status-item"><strong class="status-title">Effects protocol</strong><span class="list-meta">Structured JSON responses and shared validation.</span></li>' +
                            '<li class="status-item"><strong class="status-title">Nested comp support</strong><span class="list-meta">Scaffolded behind shared comp and layer helpers.</span></li>' +
                            '<li class="status-item"><strong class="status-title">Future layer tools</strong><span class="list-meta">This section is the permanent home for unprecomp and deeper source traversal tools.</span></li>' +
                        "</ul>" +
                    "</div>" +
                "</section>";
        },
        bind: function (root) {
            var copiedEffects = null;
            var applyButton = root.querySelector("#applyEffectsBtn");

            root.querySelector("#copyEffectsBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("effects.copy", {}, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("Effects copy failed", "error");
                        return;
                    }

                    copiedEffects = result.data;
                    applyButton.disabled = false;
                    VortexApp.notifications.setBanner("Captured " + result.data.effectCount + " effect blocks from the selected source layer.");
                    VortexApp.notifications.showToast("Effects copied");
                    VortexApp.store.rememberTool("Layers • Copy effects");
                });
            });

            applyButton.addEventListener("click", function () {
                if (!copiedEffects) {
                    return;
                }

                VortexApp.commandClient.execute("effects.apply", {
                    effects: copiedEffects.effects
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("Effects apply failed", "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Applied copied effects to " + result.data.targetLayerCount + " selected layer(s).");
                    VortexApp.notifications.showToast("Effects applied");
                    VortexApp.store.rememberTool("Layers • Apply effects");
                });
            });

            root.querySelector("#trueCompBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("layers.trueCompDuplicate", {
                    suffix: root.querySelector("#trueCompSuffix").value
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Duplicated " + result.data.duplicatedCount + " precomp source(s) with a trueComp-style suffix.");
                    VortexApp.store.rememberTool("Layers • trueComp");
                });
            });

            root.querySelector("#anchorAdjustBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("layers.adjustAnchorPoint", {
                    preset: root.querySelector("#anchorPreset").value
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Adjusted anchor points on " + result.data.updatedLayerCount + " layer(s).");
                    VortexApp.store.rememberTool("Layers • Anchor point");
                });
            });

            root.querySelector("#unprecompBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("layers.unprecomp", {}, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.notifications.setBanner(result.data.message);
                    VortexApp.store.rememberTool("Layers • UnPrecomp");
                });
            });
        }
    };
})(this);

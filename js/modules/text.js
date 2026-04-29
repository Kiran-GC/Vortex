(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    function assetListMarkup(items) {
        if (!items || !items.length) {
            return '<div class="empty-state"><p class="empty-copy">No saved text animation presets yet.</p></div>';
        }

        return '<ul class="asset-list">' + items.map(function (item) {
            return '<li class="asset-item"><strong class="asset-title">' + item.name + '</strong><span class="list-meta">' + item.updatedAt + "</span></li>";
        }).join("") + "</ul>";
    }

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.text = {
        meta: {
            title: "Text",
            eyebrow: "Captions, SRT, presets, split tools"
        },
        render: function () {
            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Text foundation</h3><p class=\"card-copy\">This subsystem is wired for SRT parsing, reusable text animation presets, text splitting, and future caption providers.</p></div>" +
                        '<div class="field-stack">' +
                            '<label for="srtInput">SRT input</label>' +
                            '<textarea id="srtInput" placeholder="Paste SRT content here to normalize it into caption entries."></textarea>' +
                            '<div class="field-help">The base parses timed text into structured caption data now, while AutoCaption stays behind a future service seam.</div>' +
                        "</div>" +
                        '<div class="action-row">' +
                            '<button id="parseSrtBtn">Parse SRT</button>' +
                            '<button id="listTextPresetsBtn">Built-in Animations</button>' +
                        "</div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack">' +
                                '<label for="splitMode">Text split mode</label>' +
                                '<select id="splitMode">' +
                                    '<option value="characters">Characters</option>' +
                                    '<option value="words">Words</option>' +
                                    '<option value="lines">Lines</option>' +
                                "</select>" +
                            "</div>" +
                            '<div class="field-stack">' +
                                '<label for="splitText">Source text</label>' +
                                '<input id="splitText" type="text" placeholder="Type text to split">' +
                            "</div>" +
                        "</div>" +
                        '<div class="action-row">' +
                            '<button id="splitTextBtn">Preview Split</button>' +
                            '<button id="saveTextPresetBtn">Save Preset Stub</button>' +
                        "</div>" +
                    "</div>" +
                    '<div class="column section-block">' +
                        "<h3>Saved text assets</h3>" +
                        '<div id="textAssetList"><div class="empty-state"><p class="empty-copy">Load presets to inspect what the shared library contains.</p></div></div>' +
                    "</div>" +
                "</section>" +
                '<section class="card-grid">' +
                    '<article class="card"><div class="card-header"><h3>Caption jobs</h3><span class="tool-tag">Service seam</span></div><p class="card-copy">The architecture now reserves a structured input/output shape for future AutoCaption providers without hard-coding any external dependency.</p></article>' +
                    '<article class="card"><div class="card-header"><h3>Animation system</h3><span class="tool-tag">Preset schema</span></div><p class="card-copy">Built-in and user-saved text animations share one library-backed schema so SRT flows and manual animation tools can reuse the same engine.</p></article>' +
                "</section>";
        },
        bind: function (root) {
            var parseSrtBtn = root.querySelector("#parseSrtBtn");
            var listTextPresetsBtn = root.querySelector("#listTextPresetsBtn");
            var splitTextBtn = root.querySelector("#splitTextBtn");
            var saveTextPresetBtn = root.querySelector("#saveTextPresetBtn");
            var assetList = root.querySelector("#textAssetList");

            parseSrtBtn.addEventListener("click", function () {
                var raw = root.querySelector("#srtInput").value;

                VortexApp.commandClient.execute("text.importSrt", { raw: raw }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("SRT parse failed", "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Parsed " + result.data.entryCount + " caption entries into normalized timed text.");
                    VortexApp.notifications.showToast("SRT parsed");
                    VortexApp.store.rememberTool("Text • SRT import");
                });
            });

            listTextPresetsBtn.addEventListener("click", function () {
                VortexApp.commandClient.execute("text.listBuiltInAnimations", {}, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    var names = result.data.presets.map(function (preset) {
                        return preset.name;
                    }).join(", ");

                    VortexApp.notifications.setBanner("Built-in text animations: " + names);
                    VortexApp.store.rememberTool("Text • Built-in animations");
                });
            });

            splitTextBtn.addEventListener("click", function () {
                VortexApp.commandClient.execute("text.split", {
                    raw: root.querySelector("#splitText").value,
                    mode: root.querySelector("#splitMode").value
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Split preview: " + result.data.parts.join(" | "));
                    VortexApp.notifications.showToast("Text split ready");
                    VortexApp.store.rememberTool("Text • Split");
                });
            });

            saveTextPresetBtn.addEventListener("click", function () {
                VortexApp.commandClient.execute("text.saveAnimationPreset", {
                    name: "Custom Text Animation",
                    preset: {
                        selector: "range",
                        offset: 30,
                        blur: 6,
                        easing: "soft-rise"
                    }
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Saved text animation preset to the Vortex library.");
                    VortexApp.notifications.showToast("Preset saved");
                    VortexApp.store.rememberTool("Text • Save preset");
                });
            });

            VortexApp.commandClient.execute("library.listAssets", { type: "text-animation" }, function (result) {
                if (!result.ok) {
                    assetList.innerHTML = '<div class="empty-state"><p class="empty-copy">' + result.error.message + "</p></div>";
                    return;
                }

                assetList.innerHTML = assetListMarkup(result.data.assets);
            });
        }
    };
})(this);

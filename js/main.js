document.addEventListener("DOMContentLoaded", function () {

    var copiedEffectsData = null;
    var textPresetStorageKey = "vortexTextAnimationPresets";
    var textAnimationPresets = [];
    var selectedTextPresetIndex = -1;

    var applyBtn = document.getElementById("applyEffectsBtn");
    if (applyBtn) {
        applyBtn.disabled = true;
    }

    function showToast(message) {
        var toast = document.getElementById("toast");
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(function () {
            toast.classList.remove("show");
        }, 1500);
    }

    var views = document.querySelectorAll(".view");
    var navButtons = document.querySelectorAll(".nav-btn");
    var backButtons = document.querySelectorAll(".back-btn");

    function switchView(targetId) {
        views.forEach(function (view) {
            view.classList.remove("active");
        });

        var target = document.getElementById(targetId);
        if (target) {
            target.classList.add("active");
        }
    }

    navButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var target = button.getAttribute("data-target");
            if (target) {
                switchView(target);
            }
        });
    });

    backButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var target = button.getAttribute("data-target");
            if (target) {
                switchView(target);
            }
        });
    });

    var copyBtn = document.getElementById("copyEffectsBtn");

    if (copyBtn) {
        copyBtn.addEventListener("click", function () {
            VortexBridge.eval("getLayerEffects()", function (result) {
                if (!result || result === "null") {
                    showToast("No effects found");
                    return;
                }

                copiedEffectsData = result;
                if (applyBtn) {
                    applyBtn.disabled = false;
                }

                showToast("Copied");
            });
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", function () {
            if (!copiedEffectsData) {
                return;
            }

            var encodedData = encodeURIComponent(copiedEffectsData);
            VortexBridge.eval('applyLayerEffects("' + encodedData + '")');
            showToast("Applied");
        });
    }

    var importTextPresetBtn = document.getElementById("importTextPresetBtn");
    var previewTextPresetBtn = document.getElementById("previewTextPresetBtn");
    var applyTextPresetBtn = document.getElementById("applyTextPresetBtn");
    var textPresetList = document.getElementById("textPresetList");
    var panelPreviewTextInput = document.getElementById("panelPreviewTextInput");
    var panelPreviewStyleSelect = document.getElementById("panelPreviewStyleSelect");
    var panelPreviewText = document.getElementById("panelPreviewText");
    var replayPanelPreviewBtn = document.getElementById("replayPanelPreviewBtn");
    var panelPreviewStyles = ["rise", "pop", "slide", "type", "blur"];

    function loadTextAnimationPresets() {
        var savedPresets = localStorage.getItem(textPresetStorageKey);

        if (!savedPresets) {
            textAnimationPresets = [];
            return;
        }

        textAnimationPresets = JSON.parse(savedPresets);
    }

    function saveTextAnimationPresets() {
        localStorage.setItem(textPresetStorageKey, JSON.stringify(textAnimationPresets));
    }

    function getSelectedTextPreset() {
        if (selectedTextPresetIndex < 0 || selectedTextPresetIndex >= textAnimationPresets.length) {
            return null;
        }

        return textAnimationPresets[selectedTextPresetIndex];
    }

    function updatePanelPreviewText() {
        if (!panelPreviewText) {
            return;
        }

        panelPreviewText.textContent = panelPreviewTextInput && panelPreviewTextInput.value
            ? panelPreviewTextInput.value
            : "Vortex Preview";
    }

    function replayPanelPreview() {
        if (!panelPreviewText) {
            return;
        }

        var selectedStyle = panelPreviewStyleSelect ? panelPreviewStyleSelect.value : "rise";

        updatePanelPreviewText();
        panelPreviewStyles.forEach(function (style) {
            panelPreviewText.classList.remove("preview-" + style);
        });

        panelPreviewText.classList.remove("is-replaying");
        panelPreviewText.offsetWidth;
        panelPreviewText.classList.add("is-replaying", "preview-" + selectedStyle);
    }

    function updateTextPresetActions() {
        var hasSelectedPreset = !!getSelectedTextPreset();

        if (previewTextPresetBtn) {
            previewTextPresetBtn.disabled = !hasSelectedPreset;
        }

        if (applyTextPresetBtn) {
            applyTextPresetBtn.disabled = !hasSelectedPreset;
        }
    }

    function renderTextPresetList() {
        if (!textPresetList) {
            return;
        }

        textPresetList.innerHTML = "";

        if (textAnimationPresets.length === 0) {
            var emptyState = document.createElement("div");
            emptyState.className = "preset-empty";
            emptyState.textContent = "Import .ffx presets to reuse them here.";
            textPresetList.appendChild(emptyState);
            updateTextPresetActions();
            return;
        }

        textAnimationPresets.forEach(function (preset, index) {
            var presetButton = document.createElement("button");
            presetButton.type = "button";
            presetButton.className = "preset-item";
            presetButton.textContent = preset.name;

            if (index === selectedTextPresetIndex) {
                presetButton.classList.add("selected");
            }

            presetButton.addEventListener("click", function () {
                selectedTextPresetIndex = index;
                renderTextPresetList();
                replayPanelPreview();
            });

            textPresetList.appendChild(presetButton);
        });

        updateTextPresetActions();
    }

    function runTextPresetCommand(commandName) {
        var selectedPreset = getSelectedTextPreset();

        if (!selectedPreset) {
            showToast("Select a preset first");
            return;
        }

        var encodedPath = encodeURIComponent(selectedPreset.path);
        VortexBridge.eval(commandName + '("' + encodedPath + '")', function (result) {
            if (!result || result === "null") {
                return;
            }

            showToast(result);
        });
    }

    if (importTextPresetBtn) {
        importTextPresetBtn.addEventListener("click", function () {
            VortexBridge.eval("importTextAnimationPreset()", function (result) {
                var importedPreset;
                var duplicatePreset;

                if (!result || result === "null") {
                    return;
                }

                importedPreset = JSON.parse(result);
                duplicatePreset = textAnimationPresets.some(function (preset) {
                    return preset.path === importedPreset.path;
                });

                if (!duplicatePreset) {
                    textAnimationPresets.push(importedPreset);
                }

                selectedTextPresetIndex = textAnimationPresets.findIndex(function (preset) {
                    return preset.path === importedPreset.path;
                });

                saveTextAnimationPresets();
                renderTextPresetList();
                replayPanelPreview();
                showToast(duplicatePreset ? "Preset already imported" : "Preset imported");
            });
        });
    }

    if (previewTextPresetBtn) {
        previewTextPresetBtn.addEventListener("click", function () {
            runTextPresetCommand("previewTextAnimationPreset");
        });
    }

    if (applyTextPresetBtn) {
        applyTextPresetBtn.addEventListener("click", function () {
            runTextPresetCommand("applyTextAnimationPreset");
        });
    }

    if (panelPreviewTextInput) {
        panelPreviewTextInput.addEventListener("input", function () {
            replayPanelPreview();
        });
    }

    if (panelPreviewStyleSelect) {
        panelPreviewStyleSelect.addEventListener("change", function () {
            replayPanelPreview();
        });
    }

    if (replayPanelPreviewBtn) {
        replayPanelPreviewBtn.addEventListener("click", function () {
            replayPanelPreview();
        });
    }

    loadTextAnimationPresets();
    renderTextPresetList();
    replayPanelPreview();

});

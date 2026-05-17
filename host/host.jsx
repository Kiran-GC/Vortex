var VortexHost = VortexHost || {};

VortexHost.version = "1.0.0";
VortexHost.settingsVersion = 1;
VortexHost.commands = {};

VortexHost.builtInTextAnimations = [
    { id: "soft-rise", name: "Soft Rise", category: "text-animation" },
    { id: "overshoot-fade", name: "Overshoot Fade", category: "text-animation" },
    { id: "blur-punch", name: "Blur Punch", category: "text-animation" }
];

VortexHost.builtInGraphPresets = [
    { id: "snappy-ease", name: "Snappy Ease", influenceIn: 66, influenceOut: 80 },
    { id: "cinematic-drift", name: "Cinematic Drift", influenceIn: 48, influenceOut: 64 },
    { id: "hard-stop", name: "Hard Stop", influenceIn: 80, influenceOut: 20 }
];

VortexHost.registerCommand = function (commandName, handler) {
    VortexHost.commands[commandName] = handler;
};

VortexHost.respondSuccess = function (data) {
    return JSON.stringify({
        ok: true,
        data: data || {}
    });
};

VortexHost.respondError = function (code, message, detail) {
    return JSON.stringify({
        ok: false,
        error: {
            code: code || "unknown_error",
            message: message || "Unknown error.",
            detail: detail || ""
        }
    });
};

VortexHost.safeParse = function (rawPayload) {
    if (!rawPayload) {
        return {};
    }

    return JSON.parse(rawPayload);
};

VortexHost.fail = function (code, message, detail) {
    throw {
        code: code,
        message: message,
        detail: detail || ""
    };
};

VortexHost.getActiveComp = function () {
    var item = app.project && app.project.activeItem;

    if (!(item instanceof CompItem)) {
        VortexHost.fail("missing_comp", "Open or activate a composition first.");
    }

    return item;
};

VortexHost.getSelectedLayers = function () {
    var comp = VortexHost.getActiveComp();
    var layers = comp.selectedLayers;

    if (!layers || layers.length === 0) {
        VortexHost.fail("missing_layers", "Select at least one layer first.");
    }

    return layers;
};

VortexHost.withUndoGroup = function (label, fn) {
    app.beginUndoGroup(label);

    try {
        return fn();
    } finally {
        app.endUndoGroup();
    }
};

VortexHost.getUserDataFolder = function () {
    var root = Folder.userData;
    if (!root.exists) {
        root.create();
    }
    return root;
};

VortexHost.getSettingsFile = function () {
    return File(VortexHost.getUserDataFolder().fsName + "/Vortex/settings.json");
};

VortexHost.ensureFolder = function (path) {
    var folder = Folder(path);
    if (!folder.exists) {
        if (folder.parent && !folder.parent.exists) {
            VortexHost.ensureFolder(folder.parent.fsName);
        }
        folder.create();
    }
    return folder;
};

VortexHost.slugify = function (value) {
    var base = String(value || "asset").toLowerCase();
    base = base.replace(/[^a-z0-9]+/g, "-");
    base = base.replace(/^-+|-+$/g, "");
    return base || "asset";
};

VortexHost.makeId = function (value) {
    return VortexHost.slugify(value) + "-" + new Date().getTime();
};

VortexHost.nowIso = function () {
    var date = new Date();

    function pad(value) {
        return value < 10 ? "0" + value : String(value);
    }

    return date.getFullYear() +
        "-" + pad(date.getMonth() + 1) +
        "-" + pad(date.getDate()) +
        "T" + pad(date.getHours()) +
        ":" + pad(date.getMinutes()) +
        ":" + pad(date.getSeconds()) +
        "Z";
};

VortexHost.readTextFile = function (file) {
    if (!file.exists) {
        return null;
    }

    file.encoding = "UTF-8";
    file.open("r");
    var contents = file.read();
    file.close();
    return contents;
};

VortexHost.writeTextFile = function (file, contents) {
    var parent = file.parent;
    if (parent && !parent.exists) {
        parent.create();
    }

    file.encoding = "UTF-8";
    file.open("w");
    file.write(contents);
    file.close();
};

VortexHost.getDefaultLibraryRoot = function () {
    return VortexHost.getUserDataFolder().fsName + "/Vortex/library";
};

VortexHost.loadSettings = function () {
    var settingsFile = VortexHost.getSettingsFile();
    var raw = VortexHost.readTextFile(settingsFile);

    if (!raw) {
        return {
            version: VortexHost.settingsVersion,
            libraryPath: VortexHost.getDefaultLibraryRoot(),
            serviceConfig: {
                captionProvider: "manual",
                backgroundRemoval: "disabled"
            }
        };
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return {
            version: VortexHost.settingsVersion,
            libraryPath: VortexHost.getDefaultLibraryRoot(),
            serviceConfig: {
                captionProvider: "manual",
                backgroundRemoval: "disabled"
            }
        };
    }
};

VortexHost.saveSettings = function (settings) {
    settings.version = VortexHost.settingsVersion;
    VortexHost.writeTextFile(VortexHost.getSettingsFile(), JSON.stringify(settings, null, 2));
    return settings;
};

VortexHost.getLibraryFolders = function () {
    var settings = VortexHost.loadSettings();
    var rootPath = settings.libraryPath || VortexHost.getDefaultLibraryRoot();
    var root = VortexHost.ensureFolder(rootPath);

    return {
        rootPath: root.fsName,
        root: root,
        compTemplates: VortexHost.ensureFolder(root.fsName + "/comp-templates"),
        textAnimations: VortexHost.ensureFolder(root.fsName + "/text-animations"),
        graphPresets: VortexHost.ensureFolder(root.fsName + "/graph-presets"),
        toolPresets: VortexHost.ensureFolder(root.fsName + "/tool-presets"),
        cache: VortexHost.ensureFolder(root.fsName + "/cache")
    };
};

VortexHost.assetTypeDirectoryMap = {
    "comp-template": "compTemplates",
    "text-animation": "textAnimations",
    "graph-preset": "graphPresets",
    "tool-preset": "toolPresets"
};

VortexHost.normalizeAssetType = function (type) {
    if (!type) {
        return null;
    }

    if (type === "compTemplate") {
        return "comp-template";
    }

    if (type === "textAnimation") {
        return "text-animation";
    }

    if (type === "graphPreset" || type === "graph") {
        return "graph-preset";
    }

    if (type === "toolPreset") {
        return "tool-preset";
    }

    return type;
};

VortexHost.listLibraryAssets = function (type) {
    var folders = VortexHost.getLibraryFolders();
    var assets = [];
    var keys = type ? [VortexHost.assetTypeDirectoryMap[VortexHost.normalizeAssetType(type)]] : ["compTemplates", "textAnimations", "graphPresets", "toolPresets"];
    var i;
    var j;

    for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var folder = folders[key];

        if (!folder) {
            continue;
        }

        var files = folder.getFiles("*.json");
        for (j = 0; j < files.length; j++) {
            var raw = VortexHost.readTextFile(files[j]);
            if (!raw) {
                continue;
            }

            try {
                assets.push(JSON.parse(raw));
            } catch (error) {}
        }
    }

    assets.sort(function (left, right) {
        var leftValue = String(left.updatedAt || "");
        var rightValue = String(right.updatedAt || "");

        if (leftValue === rightValue) {
            return 0;
        }

        return leftValue < rightValue ? 1 : -1;
    });

    return assets;
};

VortexHost.writeLibraryAsset = function (type, name, payload, tags) {
    var normalizedType = VortexHost.normalizeAssetType(type);
    var folders = VortexHost.getLibraryFolders();
    var directoryKey = VortexHost.assetTypeDirectoryMap[normalizedType];

    if (!directoryKey) {
        VortexHost.fail("invalid_asset_type", "Unsupported asset type: " + type);
    }

    var assetId = VortexHost.makeId(name);
    var folder = folders[directoryKey];
    var file = File(folder.fsName + "/" + assetId + ".json");
    var now = VortexHost.nowIso();
    var asset = {
        id: assetId,
        name: name,
        type: normalizedType,
        version: 1,
        createdAt: now,
        updatedAt: now,
        tags: tags || [],
        payloadPath: file.fsName,
        payload: payload || {}
    };

    VortexHost.writeTextFile(file, JSON.stringify(asset, null, 2));
    return asset;
};

VortexHost.getRecentAssets = function () {
    return VortexHost.listLibraryAssets(null).slice(0, 5);
};

VortexHost.registerCommand("vortex.ping", function () {
    return {
        status: "ok",
        version: VortexHost.version
    };
});

VortexHost.registerCommand("effects.copy", function () {
    var layers = VortexHost.getSelectedLayers();
    var layer = layers[0];
    var effects = layer.property("ADBE Effect Parade");
    var data = [];
    var i;
    var j;

    if (!effects || effects.numProperties === 0) {
        VortexHost.fail("missing_effects", "The selected source layer has no effects to copy.");
    }

    for (i = 1; i <= effects.numProperties; i++) {
        var effect = effects.property(i);
        var effectData = {
            matchName: effect.matchName,
            name: effect.name,
            properties: []
        };

        for (j = 1; j <= effect.numProperties; j++) {
            var prop = effect.property(j);

            if (prop.propertyValueType !== PropertyValueType.NO_VALUE) {
                effectData.properties.push({
                    index: j,
                    matchName: prop.matchName,
                    value: prop.value
                });
            }
        }

        data.push(effectData);
    }

    return {
        sourceLayer: layer.name,
        effectCount: data.length,
        effects: data
    };
});

VortexHost.registerCommand("effects.apply", function (payload) {
    var effectsData = payload.effects;
    var layers = VortexHost.getSelectedLayers();

    if (!effectsData || !effectsData.length) {
        VortexHost.fail("missing_payload", "No copied effect payload was provided.");
    }

    VortexHost.withUndoGroup("Vortex - Apply Effects", function () {
        var l;
        var i;
        var j;

        for (l = 0; l < layers.length; l++) {
            var target = layers[l];
            var effects = target.property("ADBE Effect Parade");

            for (i = 0; i < effectsData.length; i++) {
                var effectData = effectsData[i];
                var newEffect = effects.addProperty(effectData.matchName);

                for (j = 0; j < effectData.properties.length; j++) {
                    try {
                        var propData = effectData.properties[j];
                        newEffect.property(propData.index).setValue(propData.value);
                    } catch (error) {}
                }
            }
        }
    });

    return {
        targetLayerCount: layers.length
    };
});

VortexHost.registerCommand("layers.trueCompDuplicate", function (payload) {
    var layers = VortexHost.getSelectedLayers();
    var suffix = payload.suffix || "__vtx";
    var duplicated = 0;

    VortexHost.withUndoGroup("Vortex - trueComp Duplicate", function () {
        var i;
        for (i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (!(layer.source instanceof CompItem)) {
                continue;
            }

            var duplicatedComp = layer.source.duplicate();
            duplicatedComp.name = layer.source.name + suffix;
            layer.replaceSource(duplicatedComp, false);
            duplicated++;
        }
    });

    if (!duplicated) {
        VortexHost.fail("unsupported_selection", "Select at least one precomp layer for trueComp duplication.");
    }

    return {
        duplicatedCount: duplicated,
        suffix: suffix
    };
});

VortexHost.registerCommand("layers.adjustAnchorPoint", function (payload) {
    var preset = payload.preset || "center";
    var layers = VortexHost.getSelectedLayers();

    VortexHost.withUndoGroup("Vortex - Adjust Anchor Point", function () {
        var i;

        for (i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var width = layer.width || 0;
            var height = layer.height || 0;
            var anchor = [width / 2, height / 2];

            if (preset === "top-left") {
                anchor = [0, 0];
            } else if (preset === "bottom-center") {
                anchor = [width / 2, height];
            }

            layer.anchorPoint.setValue(anchor);
        }
    });

    return {
        preset: preset,
        updatedLayerCount: layers.length
    };
});

VortexHost.registerCommand("layers.unprecomp", function () {
    return {
        message: "UnPrecomp is scaffolded in the new layer command family and ready for a dedicated implementation pass."
    };
});

VortexHost.parseSrtTimestamp = function (raw) {
    var normalized = String(raw || "").replace(",", ".");
    var parts = normalized.split(":");
    if (parts.length !== 3) {
        return 0;
    }

    return (Number(parts[0]) * 3600) + (Number(parts[1]) * 60) + Number(parts[2]);
};

VortexHost.registerCommand("text.importSrt", function (payload) {
    var raw = String(payload.raw || "").replace(/\r/g, "").trim();
    var blocks;
    var entries = [];
    var i;

    if (!raw) {
        VortexHost.fail("missing_srt", "Paste SRT content before trying to parse it.");
    }

    blocks = raw.split(/\n\n+/);

    for (i = 0; i < blocks.length; i++) {
        var lines = blocks[i].split("\n");
        if (lines.length < 2) {
            continue;
        }

        var timeLineIndex = lines[0].indexOf("-->") >= 0 ? 0 : 1;
        var timeLine = lines[timeLineIndex];
        var textLines = lines.slice(timeLineIndex + 1);
        var timeParts = timeLine.split("-->");

        if (timeParts.length !== 2) {
            continue;
        }

        entries.push({
            index: entries.length + 1,
            startSeconds: VortexHost.parseSrtTimestamp(timeParts[0]),
            endSeconds: VortexHost.parseSrtTimestamp(timeParts[1]),
            text: textLines.join("\n")
        });
    }

    return {
        entryCount: entries.length,
        entries: entries
    };
});

VortexHost.registerCommand("text.listBuiltInAnimations", function () {
    return {
        presets: VortexHost.builtInTextAnimations
    };
});

VortexHost.registerCommand("text.split", function (payload) {
    var raw = String(payload.raw || "");
    var mode = payload.mode || "characters";
    var parts = [];

    if (!raw) {
        VortexHost.fail("missing_text", "Enter source text to preview splitting.");
    }

    if (mode === "words") {
        parts = raw.split(/\s+/);
    } else if (mode === "lines") {
        parts = raw.split(/\n/);
    } else {
        parts = raw.split("");
    }

    return {
        mode: mode,
        count: parts.length,
        parts: parts
    };
});

VortexHost.registerCommand("text.saveAnimationPreset", function (payload) {
    var name = payload.name || "Text Animation Preset";
    var asset = VortexHost.writeLibraryAsset("text-animation", name, {
        preset: payload.preset || {},
        builtFrom: "panel"
    }, payload.tags || []);

    return {
        asset: asset
    };
});

VortexHost.registerCommand("motion.listGraphPresets", function () {
    return {
        presets: VortexHost.builtInGraphPresets
    };
});

VortexHost.registerCommand("motion.createCircleRig", function (payload) {
    var comp = VortexHost.getActiveComp();
    var mode = payload.mode === "3d" ? "3d" : "2d";
    var count = Number(payload.count || 6);
    var radius = Number(payload.radius || 240);
    var center = [comp.width / 2, comp.height / 2];

    if (count < 2) {
        VortexHost.fail("invalid_count", "Circle rig requires at least two controllers.");
    }

    VortexHost.withUndoGroup("Vortex - Create Circle Rig", function () {
        var i;
        for (i = 0; i < count; i++) {
            var angle = (Math.PI * 2 * i) / count;
            var x = center[0] + Math.cos(angle) * radius;
            var y = center[1] + Math.sin(angle) * radius;
            var controller = comp.layers.addNull();
            controller.name = "Vortex Rig " + (i + 1);
            controller.property("Position").setValue([x, y]);
            if (mode === "3d") {
                controller.threeDLayer = true;
            }
        }
    });

    return {
        mode: mode,
        controllerCount: count,
        radius: radius,
        angleStep: 360 / count
    };
});

VortexHost.registerCommand("media.importClipboardImage", function (payload) {
    return {
        status: "scaffolded",
        sourceHint: payload.sourceHint || "",
        backgroundRemoval: payload.backgroundRemoval || "disabled",
        supportedSources: ["clipboard", "file", "web-image"],
        message: "Clipboard image import is scaffolded as an ingest pipeline. Native clipboard extraction still needs a dedicated implementation path."
    };
});

VortexHost.registerCommand("templates.saveCompTemplate", function (payload) {
    var comp = VortexHost.getActiveComp();
    var name = payload.name || (comp.name + " Template");
    var cleanedTags = [];
    var i;

    if (payload.tags && payload.tags.length) {
        for (i = 0; i < payload.tags.length; i++) {
            var tag = String(payload.tags[i]).replace(/^\s+|\s+$/g, "");
            if (tag) {
                cleanedTags.push(tag);
            }
        }
    }

    var asset = VortexHost.writeLibraryAsset("comp-template", name, {
        compName: comp.name,
        width: comp.width,
        height: comp.height,
        duration: comp.duration,
        frameRate: comp.frameRate,
        layerCount: comp.numLayers
    }, cleanedTags);

    return {
        asset: asset
    };
});

VortexHost.registerCommand("templates.loadCompTemplate", function (payload) {
    var id = payload.id;
    var assets = VortexHost.listLibraryAssets("comp-template");
    var i;

    for (i = 0; i < assets.length; i++) {
        if (assets[i].id === id) {
            return {
                asset: assets[i]
            };
        }
    }

    VortexHost.fail("asset_not_found", "Could not find the requested comp template.");
});

VortexHost.registerCommand("library.listAssets", function (payload) {
    return {
        assets: VortexHost.listLibraryAssets(payload.type || null)
    };
});

VortexHost.registerCommand("settings.getConfig", function () {
    var settings = VortexHost.loadSettings();
    var library = VortexHost.getLibraryFolders();

    return {
        version: VortexHost.version,
        library: {
            rootPath: library.rootPath,
            categories: ["comp-templates", "text-animations", "graph-presets", "tool-presets", "cache"]
        },
        serviceConfig: settings.serviceConfig,
        recentAssets: VortexHost.getRecentAssets()
    };
});

VortexHost.registerCommand("settings.updateLibraryPath", function (payload) {
    var path = payload.path;
    var settings = VortexHost.loadSettings();

    if (!path) {
        VortexHost.fail("missing_path", "Provide a library path before saving settings.");
    }

    settings.libraryPath = path;
    VortexHost.saveSettings(settings);

    return {
        library: {
            rootPath: VortexHost.getLibraryFolders().rootPath
        },
        serviceConfig: settings.serviceConfig
    };
});

function runHostCommand(commandName, rawPayload) {
    try {
        var handler = VortexHost.commands[commandName];

        if (!handler) {
            return VortexHost.respondError("unknown_command", 'Unknown command "' + commandName + '".');
        }

        var payload = VortexHost.safeParse(rawPayload);
        var result = handler(payload || {});
        return VortexHost.respondSuccess(result);
    } catch (error) {
        if (error && error.code && error.message) {
            return VortexHost.respondError(error.code, error.message, error.detail);
        }

        return VortexHost.respondError("unexpected_error", "Unexpected host error.", error ? String(error) : "");
    }
}

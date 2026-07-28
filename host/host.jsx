function createSolid() {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Please select or open a composition first.");
        return;
    }

    app.beginUndoGroup("Vortex - Create Solid");

    comp.layers.addSolid(
        [0, 0.6, 1],
        "Vortex Solid",
        comp.width,
        comp.height,
        comp.pixelAspect,
        comp.duration
    );

    app.endUndoGroup();
}

function getLayerEffects() {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        return null;
    }

    var layer = comp.selectedLayers[0];

    if (!layer) {
        return null;
    }

    var effects = layer.property("ADBE Effect Parade");

    if (!effects || effects.numProperties === 0) {
        return null;
    }

    var data = [];
    var i;
    var j;

    for (i = 1; i <= effects.numProperties; i++) {
        var effect = effects.property(i);
        var effectData = {
            matchName: effect.matchName,
            properties: []
        };

        for (j = 1; j <= effect.numProperties; j++) {
            var prop = effect.property(j);

            if (prop.propertyValueType !== PropertyValueType.NO_VALUE) {
                effectData.properties.push({
                    value: prop.value
                });
            }
        }

        data.push(effectData);
    }

    return JSON.stringify(data);
}

function applyLayerEffects(encodedJSON) {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Open a composition.");
        return;
    }

    if (!encodedJSON) {
        alert("No effect data received.");
        return;
    }

    var decoded = decodeURIComponent(encodedJSON);
    var data = JSON.parse(decoded);
    var layers = comp.selectedLayers;
    var l;
    var i;
    var j;

    if (layers.length === 0) {
        alert("Select target layers.");
        return;
    }

    app.beginUndoGroup("Vortex - Apply Effects");

    for (l = 0; l < layers.length; l++) {
        var target = layers[l];
        var effects = target.property("ADBE Effect Parade");

        for (i = 0; i < data.length; i++) {
            var effectData = data[i];
            var newEffect = effects.addProperty(effectData.matchName);

            for (j = 0; j < effectData.properties.length; j++) {
                try {
                    newEffect.property(j + 1).setValue(effectData.properties[j].value);
                } catch (e) {
                }
            }
        }
    }

    app.endUndoGroup();
}

function getTextAnimationPresetFile(encodedPath) {
    if (!encodedPath) {
        alert("No preset selected.");
        return null;
    }

    var presetPath = decodeURIComponent(encodedPath);
    var presetFile = File(presetPath);

    if (!presetFile.exists) {
        alert("Preset file could not be found.");
        return null;
    }

    return presetFile;
}

function importTextAnimationPreset() {
    var filter = /windows/i.test($.os)
        ? "After Effects Preset:*.ffx"
        : function (file) {
            return file instanceof File && /\.ffx$/i.test(file.name);
        };
    var presetFile = File.openDialog("Import a text animation preset", filter);

    if (!presetFile) {
        return null;
    }

    return JSON.stringify({
        name: presetFile.displayName || presetFile.name,
        path: presetFile.fsName
    });
}

function applyTextAnimationPreset(encodedPath) {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Open a composition.");
        return null;
    }

    var layers = comp.selectedLayers;

    if (layers.length === 0) {
        alert("Select one or more text layers.");
        return null;
    }

    var presetFile = getTextAnimationPresetFile(encodedPath);

    if (!presetFile) {
        return null;
    }

    var appliedCount = 0;
    var i;

    app.beginUndoGroup("Vortex - Apply Text Animation Preset");

    for (i = 0; i < layers.length; i++) {
        if (layers[i].property("ADBE Text Properties")) {
            layers[i].applyPreset(presetFile);
            appliedCount++;
        }
    }

    app.endUndoGroup();

    if (appliedCount === 0) {
        alert("No selected text layers found.");
        return null;
    }

    return "Applied to " + appliedCount + " text layer" + (appliedCount === 1 ? "" : "s");
}

function previewTextAnimationPreset(encodedPath) {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Open a composition to preview this preset.");
        return null;
    }

    var presetFile = getTextAnimationPresetFile(encodedPath);

    if (!presetFile) {
        return null;
    }

    var previewLayerName = "Vortex Text Animation Preview";
    var i;
    var previewLayer;
    var sourceText;

    app.beginUndoGroup("Vortex - Preview Text Animation Preset");

    for (i = comp.numLayers; i >= 1; i--) {
        if (comp.layer(i).name === previewLayerName) {
            comp.layer(i).remove();
        }
    }

    previewLayer = comp.layers.addText("Vortex Preview");
    previewLayer.name = previewLayerName;
    previewLayer.startTime = comp.time;

    sourceText = previewLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
    sourceText.justification = ParagraphJustification.CENTER_JUSTIFY;
    previewLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(sourceText);
    previewLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);
    previewLayer.applyPreset(presetFile);

    app.endUndoGroup();

    return "Preview created";
}

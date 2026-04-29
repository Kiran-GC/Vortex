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

    for (var i = 1; i <= effects.numProperties; i++) {

        var effect = effects.property(i);

        var effectData = {
            matchName: effect.matchName,
            properties: []
        };

        for (var j = 1; j <= effect.numProperties; j++) {

            var prop = effect.property(j);

            if (prop.propertyValueType !== PropertyValueType.NO_VALUE) {

                var propData = {
                    value: prop.value
                };

                effectData.properties.push(propData);
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

    if (layers.length === 0) {
        alert("Select target layers.");
        return;
    }

    app.beginUndoGroup("Vortex - Apply Effects");

    for (var l = 0; l < layers.length; l++) {

        var target = layers[l];
        var effects = target.property("ADBE Effect Parade");

        for (var i = 0; i < data.length; i++) {

            var effectData = data[i];
            var newEffect = effects.addProperty(effectData.matchName);

            for (var j = 0; j < effectData.properties.length; j++) {

                try {
                    newEffect.property(j + 1).setValue(effectData.properties[j].value);
                } catch (e) {
                    // Ignore properties that can't be set
                }
            }
        }
    }

    app.endUndoGroup();
}

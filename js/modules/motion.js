(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.motion = {
        meta: {
            title: "Motion",
            eyebrow: "Rigs, graphs, proximity, anchor point"
        },
        render: function () {
            return '' +
                '<section class="split-layout">' +
                    '<div class="column tool-panel">' +
                        "<div><h3>Circle rig generator</h3><p class=\"card-copy\">Foundation for 2D and 3D controller layouts with explicit angle division and radius settings.</p></div>" +
                        '<div class="field-grid">' +
                            '<div class="field-stack"><label for="circleMode">Mode</label><select id="circleMode"><option value="2d">2D</option><option value="3d">3D</option></select></div>' +
                            '<div class="field-stack"><label for="circleCount">Controllers</label><input id="circleCount" type="number" value="6" min="2"></div>' +
                            '<div class="field-stack"><label for="circleRadius">Radius</label><input id="circleRadius" type="number" value="240" min="10"></div>' +
                        "</div>" +
                        '<div class="action-row"><button id="createCircleRigBtn">Create Circle Rig</button><button id="listGraphPresetsBtn">List Graph Presets</button></div>' +
                    "</div>" +
                    '<div class="column section-block">' +
                        "<h3>Motion architecture</h3>" +
                        '<ul class="status-list">' +
                            '<li class="status-item"><strong class="status-title">Graph presets</strong><span class="list-meta">Built-in and saved presets share one schema.</span></li>' +
                            '<li class="status-item"><strong class="status-title">Proximity animator</strong><span class="list-meta">Reserved as a configurable command family for later animation logic.</span></li>' +
                            '<li class="status-item"><strong class="status-title">Anchor point tools</strong><span class="list-meta">Layer transform helpers are part of the command base now.</span></li>' +
                        "</ul>" +
                    "</div>" +
                "</section>";
        },
        bind: function (root) {
            root.querySelector("#createCircleRigBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("motion.createCircleRig", {
                    mode: root.querySelector("#circleMode").value,
                    count: Number(root.querySelector("#circleCount").value),
                    radius: Number(root.querySelector("#circleRadius").value)
                }, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        VortexApp.notifications.showToast("Circle rig failed", "error");
                        return;
                    }

                    VortexApp.notifications.setBanner("Created " + result.data.controllerCount + " rig controllers with " + result.data.angleStep + " degree spacing.");
                    VortexApp.notifications.showToast("Circle rig created");
                    VortexApp.store.rememberTool("Motion • Circle rig");
                });
            });

            root.querySelector("#listGraphPresetsBtn").addEventListener("click", function () {
                VortexApp.commandClient.execute("motion.listGraphPresets", {}, function (result) {
                    if (!result.ok) {
                        VortexApp.notifications.setBanner(result.error.message, "error");
                        return;
                    }

                    var names = result.data.presets.map(function (preset) {
                        return preset.name;
                    }).join(", ");

                    VortexApp.notifications.setBanner("Graph presets: " + names);
                    VortexApp.store.rememberTool("Motion • Graph presets");
                });
            });
        }
    };
})(this);

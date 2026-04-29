(function (global) {
    var VortexApp = global.VortexApp = global.VortexApp || {};

    function renderRecentList(items, emptyLabel) {
        if (!items || !items.length) {
            return '<div class="empty-state"><p class="empty-copy">' + emptyLabel + "</p></div>";
        }

        return '<ul class="status-list">' + items.map(function (item) {
            return '<li class="status-item"><strong class="status-title">' + item + "</strong></li>";
        }).join("") + "</ul>";
    }

    VortexApp.modules = VortexApp.modules || {};
    VortexApp.modules.home = {
        meta: {
            title: "Home",
            eyebrow: "Platform overview"
        },
        render: function () {
            var state = VortexApp.store.getState();
            var recentAssets = state.recentAssets || [];

            return '' +
                '<section class="hero-panel">' +
                    "<div>" +
                        "<h3>Vortex is now structured as a tool platform</h3>" +
                        '<p class="card-copy">The shell is organized by subsystem so future tools can slot into Text, Motion, Layers, Media, Templates, and Settings without reshaping the panel again.</p>' +
                    "</div>" +
                    '<div class="hero-metrics">' +
                        '<div class="metric"><span class="meta-label">Sections</span><strong>7</strong></div>' +
                        '<div class="metric"><span class="meta-label">Host protocol</span><strong>Named commands</strong></div>' +
                        '<div class="metric"><span class="meta-label">Library mode</span><strong>Shared Vortex library</strong></div>' +
                    "</div>" +
                "</section>" +
                '<section class="card-grid">' +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Quick Actions</h3><span class="tool-tag">Working now</span></div>' +
                        '<p class="card-copy">Launch the migrated effect copy workflow, inspect saved library assets, or move into a subsystem to continue building.</p>' +
                        '<div class="card-actions">' +
                            '<button data-nav-section="layers">Open Layers</button>' +
                            '<button data-nav-section="templates">Browse Templates</button>' +
                        "</div>" +
                    "</article>" +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Recent Tools</h3><span class="tool-tag">Session state</span></div>' +
                        renderRecentList(state.recentTools, "Recent tools will appear here as commands are used.") +
                    "</article>" +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Recent Assets</h3><span class="tool-tag">Library</span></div>' +
                        (recentAssets.length ? '<ul class="asset-list">' + recentAssets.map(function (asset) {
                            return '<li class="asset-item"><strong class="asset-title">' + asset.name + '</strong><span class="list-meta">' + asset.type + " • " + asset.updatedAt + "</span></li>";
                        }).join("") + "</ul>" : '<div class="empty-state"><p class="empty-copy">Save templates or presets and they will show up here for quick reuse.</p></div>') +
                    "</article>" +
                "</section>";
        },
        bind: function (root, shell) {
            var buttons = root.querySelectorAll("[data-nav-section]");
            Array.prototype.forEach.call(buttons, function (button) {
                button.addEventListener("click", function () {
                    shell.navigate(button.getAttribute("data-nav-section"));
                });
            });
        }
    };
})(this);

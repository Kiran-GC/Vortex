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
            title: "Vortex",
            eyebrow: "Main menu"
        },
        render: function () {
            var state = VortexApp.store.getState();
            var recentAssets = state.recentAssets || [];
            var hostState = state.hostState || {};

            return '' +
                '<section class="menu-grid">' +
                    '<button class="menu-card" data-nav-section="text"><strong>Text</strong><span>Captions, SRT, split tools, saved animations</span></button>' +
                    '<button class="menu-card" data-nav-section="motion"><strong>Motion</strong><span>Circle rigs, graph presets, proximity tools</span></button>' +
                    '<button class="menu-card" data-nav-section="layers"><strong>Layers</strong><span>Effects copy, trueComp, anchor tools</span></button>' +
                    '<button class="menu-card" data-nav-section="media"><strong>Media</strong><span>Clipboard image import and future cleanup tools</span></button>' +
                    '<button class="menu-card" data-nav-section="templates"><strong>Templates</strong><span>Comp templates and reusable preset storage</span></button>' +
                    '<button class="menu-card" data-nav-section="settings"><strong>Settings</strong><span>Library path and host configuration</span></button>' +
                '</section>' +
                '<section class="card-grid compact-grid">' +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Host Status</h3><span class="tool-tag">' + (hostState.connected ? 'Connected' : 'Offline') + '</span></div>' +
                        '<p class="card-copy">' + (hostState.message || 'Waiting for After Effects host.') + '</p>' +
                    "</article>" +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Recent Tools</h3><span class="tool-tag">Session state</span></div>' +
                        renderRecentList(state.recentTools, "Recent tools will appear here as commands are used.") +
                    "</article>" +
                    '<article class="card">' +
                        '<div class="card-header"><h3>Recent Assets</h3><span class="tool-tag">Library</span></div>' +
                        (recentAssets.length ? '<ul class="asset-list">' + recentAssets.map(function (asset) {
                            return '<li class="asset-item"><strong class="asset-title">' + asset.name + '</strong><span class="list-meta">' + asset.type + " - " + asset.updatedAt + "</span></li>";
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

const { Plugin } = require("powercord/entities");
const { uninject } = require("powercord/injector");
const Settings = require("./Settings");
const { InjectionIDs } = require("./Constants");
require("./utils/bootstrap");

module.exports = class PinDMs extends Plugin {
  /**
   * Start the plugin
   */
  async startPlugin() {
    // Default settings handler
    this.DEFAULT_SETTINGS = {
      favfriends: [],
      notifsounds: {},
      infomodal: true,
      displaystar: true,
      statuspopup: true,

      // Updated settings
      general: {
        pinIcon: true,
        unreadAmount: true,
        channelAmount: true,
      },
      recentOrder: {
        channelList: false,
        guildList: false,
      },
      dmCategories: {},
      preCategories: {
        friends: {
          enabled: false,
          collapsed: false,
        },
        blocked: {
          enabled: false,
          collapsed: false,
        },
        groups: {
          enabled: false,
          collapsed: false,
        },
      },
    };

    // Register settings menu for PinDMs
    powercord.api.settings.registerSettings("pindms", {
      category: this.entityID,
      label: "PinDMs",
      render: Settings,
    });
    // Handle CSS
    this.loadStylesheet("style.scss");

    // Constants

    await this.start();
  }

  async start() {
    this.instances = {};
    this.FAV_FRIENDS = this.settings.get("favfriends");
    if (!this.FAV_FRIENDS) {
      this.FAV_FRIENDS = [];
      for (const setting of Object.keys(this.DEFAULT_SETTINGS)) {
        if (this.DEFAULT_SETTINGS[setting] === undefined && !this.FAV_FRIENDS) {
          /* eslint-disable-line */ /* I know this is bad practice, hopefully I'll find a better solution soon */
          this.settings.set(
            this.settings.get(setting, this.DEFAULT_SETTINGS[setting])
          );
        }
      }
    }

    /*
     * Modules
     * Handled by the module resolver outside of `startPlugin`.
     * All modules are created by Nevulo#0007 unless stated otherwise. Contributors will be listed as well
     */

    // Store each of the modules above into this object where we can load them later
    this.MODULES = require("./modules");
    for (const module of Object.keys(this.MODULES)) {
      this.MODULES[module] = this.MODULES[module].bind(this);
    }

    // Unload all modules if this user has no favorite friends
    if (this.FAV_FRIENDS && this.FAV_FRIENDS.length >= 0) {
      await this.load();
    }
  }

  /*
   * Module Resolver + Handler
   * Handles the loading and unloading of all modules.
   */

  /**
   * Load one or multiple modules
   * When no module is specified, all modules are loaded by default.
   * @param {String} specific Pass a specific module name to load only that module
   */
  load(specific) {
    if (specific) {
      this.MODULES[specific]();
    } else {
      for (const load of Object.keys(this.MODULES)) {
        this.MODULES[load]();
      }
    }
  }

  /**
   * Unload one or multiple modules
   * When no module is specified, the entire plugin is unloaded from Powercord.
   * @param {String} specific Pass a specific module name to unload only that module
   */
  unload(specific) {
    if (specific) {
      for (const injection of InjectionIDs[specific]) {
        uninject(injection);
      }
    } else {
      this.log("Plugin stopped");
      for (const unload of Object.keys(this.MODULES)) {
        for (const injection of InjectionIDs[unload] || []) {
          uninject(injection);
        }
      }
    }
  }

  pluginWillUnload() {
    powercord.api.settings.unregisterSettings("pindms");
    this.unload();
  }

  /**
   * Reload (unload and then load) one or multiple modules
   * When no module is specified, the entire plugin will reload
   * @param {String} specific Pass a specific module name to reload only that module
   */
  async reload(...specific) {
    if (specific && specific.length) {
      for (const mod of specific) {
        this.log(`Reloading module '${mod}'`);
        this.unload(mod);
        this.load(mod);
      }
    } else {
      this.log("Reloading all modules");
      this.unload();
      await this.start();
    }
  }

  /**
   * Log a string or data to the developer console
   * Overwrites the normal Powercord .log method.
   * @param {any} data Data to log
   */
  log(data) {
    console.log("%c[PinDMs]", "color: #ffeb3b", data);
  }
};

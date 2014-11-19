// Plugin is a component which offer the scriptability to user
define(function (require) {

    'use strict';

    var Component = require('../Component');

    var PluginComponent = Component.derive({
        /**
         * Context can only be assigned on create
         */
        context: null
    }, function (context) {
        this.context = context;
    }, {
        type: 'PLUGIN',

        $init: function (entity) {
            Component.prototype.$init.call(this, entity);
            this._invokeContextMethod('init');
        },

        $frame: function () {
            Component.prototype.$frame.call(this);
            this._invokeContextMethod('frame');
        },

        $dispose: function () {
            Component.prototype.$dispose.call(this);
            this._invokeContextMethod('dispose');
        },

        _invokeContextMethod: function (name) {
            if (this.context && this.context[name]) {
                this.context[name](this.getEntity());
            }
        }
    });

    return PluginComponent;
});
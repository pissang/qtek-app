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

        $dispatchEvent: function (name) {
            this._invodeContextMethodWithArguments('on' + name);
        },

        _invokeContextMethod: function (name) {
            if (this.context && this.context[name]) {
                this.context[name](this.getEntity());
            }
        },

        _invodeContextMethodWithArguments: function (name) {
            if (this.context && this.context[name]) {
                var args = arguments;
                var handler = this.context[name];
                var entity = this.getEntity();
                switch (args.length) {
                    case 1:
                        handler(entity);
                        break;
                    case 2:
                        handler(entity, args[1]);
                        break;
                    case 3:
                        handler(entity, args[1], args[2]);
                        break;
                    case 4:
                        handler(entity, args[1], args[2], args[3]);
                        break;
                    default:
                        handler.apply(this, Array.prototype.slice.call(args, 1));
                        break;
                }
            }
        }
    });

    return PluginComponent;
});
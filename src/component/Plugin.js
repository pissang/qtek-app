// Plugin is a component which offer the scriptability to user
define(function (require) {

    'use strict';

    var Component = require('../Component');

    var PluginComponent = Component.derive({
        /**
         * Context can only be assigned on create
         */
        _context: null,

        _ContextCtor: null
    }, function (entity, ContextCtor) {
        if (ContextCtor) {
            this._context = new ContextCtor();
        }

        this._ContextCtor = ContextCtor;
    }, {
        type: 'PLUGIN',

        $init: function () {
            Component.prototype.$init.call(this);
            this._invokeContextMethod('init');
        },

        $frame: function () {
            Component.prototype.$frame.call(this);
            this._invokeContextMethod('frame');
        },

        $dispose: function () {
            this._invokeContextMethod('dispose');
            Component.prototype.$dispose.call(this);
        },

        $dispatchEvent: function (name) {
            if (this._context && this._context[name]) {
                var args = arguments;
                var handler = this._context[name];
                var entity = this.getEntity();
                switch (args.length) {
                    case 1:
                        handler.call(this._context, entity);
                        break;
                    case 2:
                        handler.call(this._context, entity, args[1]);
                        break;
                    case 3:
                        handler.call(this._context, entity, args[1], args[2]);
                        break;
                    case 4:
                        handler.call(this._context, entity, args[1], args[2], args[3]);
                        break;
                    default:
                        handler.apply(this._context, Array.prototype.slice.call(args, 1));
                        break;
                }
            }
        },

        setContext: function (ContextCtor) {
            this._context = new ContextCtor();

            this._ContextCtor = ContextCtor;
        },

        setParameters: function (parameters) {
            if (parameters) {
                // TODO parameters is a vector
                for (var name in parameters) {
                    if (parameters.hasOwnProperty(name)) {
                        this._context[name] = parameters[name];
                    }
                }
            }
        },

        _invokeContextMethod: function (name) {
            if (this._context && this._context[name]) {
                this._context[name](this.getEntity());
            }
        },

        clone: function (entity) {
            // TODO Paramters
            var plugin = new PluginComponent(entity, this._ContextCtor);
            return plugin;
        }
    });

    return PluginComponent;
});
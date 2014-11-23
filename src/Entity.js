define(function (require) {

    'use strict';

    var Clazz = require('./Clazz');

    var Entity = Clazz.derive({
        
        _components: null,

        _frameTime: 0,

        _appInstance: null,

        _sceneNode: null,

        _initialized: false

    }, function (app3d, sceneNode) {
        this._components = [];

        this._sceneNode = sceneNode;

        this._appInstance = app3d;
    }, {

        $init: function () {
            for (var i = 0; i < this._components.length; i++) {
                this._components[i].$init();
            }
            this._initialized = true;
        },

        $frame: function (frameTime) {
            this._frameTime = frameTime;

            for (var i = 0; i < this._components.length; i++) {
                this._components[i].$frame(frameTime);
            }

            // Scene node a particle system
            if (this._sceneNode.updateParticles) {
                this._sceneNode.updateParticles(frameTime);
            }
        },

        $dispose: function () {
            for (var i = 0; i < this._components.length; i++) {
                this._components[i].$dispose();
            }
        },

        $remove: function () {
            this._appInstance = null;
        },

        getSceneNode: function () {
            return this._sceneNode;
        },

        /**
         * @return {number}
         */
        getFrameTime: function () {
            return this._frameTime;
        },

        getWorld: function () {
            if (this._appInstance) {
                return this._appInstance.getWorld();
            }
        },

        getAppInstance: function () {
            return this._appInstance;
        },

        addComponent: function (component) {
            if (this._components.indexOf(component) < 0) {
                this._components.push(component);
            }
            // Component is added after initialize
            if (this._initialized) {
                component.$init();
            }
        },

        getComponentByType: function (type) {
            for (var i = 0; i < this._components.length; i++) {
                if (this._components[i].type.toLowerCase() === type.toLowerCase()) {
                    return this._components[i];
                }
            }
        },

        broadcastComponentEvent: function () {
            for (var i = 0; i < this._components.length; i++) {
                var component = this._components[i];
                // TODO apply performance ?
                if (component.$dispatchEvent) {
                    component.$dispatchEvent.apply(component, arguments);
                }
            }
        },

        clone: function (sceneNode) {
            var entity = new Entity(this._appInstance, sceneNode || this._sceneNode.clone());

            for (var i = 0; i < this._components.length; i++) {
                entity.addComponent(this._components[i].clone(entity));
            }

            return entity;
        }
    });

    return Entity;
});
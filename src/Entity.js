define(function (require) {

    'use strict';

    var Clazz = require('./Clazz');

    var Entity = Clazz.derive({
        
        _components: null,

        _frameTime: 0,

        _world: null,

        _sceneNode: null

    }, function (sceneNode) {
        this._components = [];

        this._sceneNode = sceneNode;
    }, {

        $init: function (world) {
            this._world = world;
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
            this._world = null;
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
            return this._world;
        },

        getAppInstance: function () {
            return this._world.getAppInstance();
        },

        addComponent: function (component) {
            component.$init(this);
            this._components.push(component);
        },

        getComponentByType: function (type) {
            for (var i = 0; i < this._components.length; i++) {
                if (this._components[i].type.toLowerCase() === type.toLowerCase()) {
                    return this._components[i];
                }
            }
        }

    });

    return Entity;
});
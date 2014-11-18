define(function (require) {

    'use strict';

    var Base = require('qtek/core/Base');

    var Entity = Base.derive({
        
        _components: null,

        _frameTime: 0,

        _world: null,

        _sceneNode: null

    }, function () {
        this._components = [];
    }, {

        $init: function (world, sceneNode) {
            this._world = world;
            this._sceneNode = sceneNode;
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
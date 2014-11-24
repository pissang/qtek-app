define(function (require) {
    
    'use strict';

    var Base = require('qtek/core/Base');
    var Renderer = require('qtek/Renderer');
    var Animation = require('qtek/animation/Animation');
    var World = require('./World');
    var ResourceManager = require('./ResourceManager');
    var GraphicManager = require('./GraphicManager');

    var App3D = Base.derive({

        _renderer: null,

        _animation: null,

        _frameTime: 0,

        _currentWorld: null,

        _el: null,

        _resourceManger: null,

        _graphicManager: null,

        _prefabs: []
    }, {

        init: function (el) {
            this._el = el;

            this._renderer = new Renderer({
                devicePixelRatio: 1.0
            });
            this._animation = new Animation();

            this._resourceManger = new ResourceManager();
            this._resourceManger.$init(this);

            this._graphicManager = new GraphicManager();
            this._graphicManager.$init(this);

            el.appendChild(this._renderer.canvas);

            this._animation.on('frame', this._frame, this);

            this.resize();

            this.trigger('init');
        },

        resize: function () {
            var width = this._el.clientWidth;
            var height = this._el.clientHeight;

            this._renderer.resize(width, height);
        },

        getFrameTime: function () {
            return this._frameTime;
        },

        getRenderer: function () {
            return this._renderer;
        },

        getAnimationInstance: function () {
            return this._animation;
        },

        loadWorld: function (config) {
            if (this._currentWorld) {
                this.unloadWorld();
            }

            var world = this._resourceManger.loadWorld(config);

            this._currentWorld = world;

            return world;
        },

        unloadWorld: function () {
            if (this._currentWorld) {
                this._currentWorld.$dispose();
                this._currentWorld = null;
            }
        },

        loadPrefab: function (config) {
            var self = this;
            var prefab = this._resourceManger.loadPrefab(config, function () {

                self._prefabs.push(prefab);
            });

            return prefab;
        },

        getWorld: function () {
            return this._currentWorld;
        },

        setGraphic: function (config) {
            if (config.shadow) {
                this._graphicManager.setShadow(config.shadow);
            }
            
            if (config.postProcessing) {
                this._graphicManager.setPostProcessing(config.postProcessing);
            }
        },

        setCompositor: function (compositor) {
            
        },

        start: function () {
            this._animation.start();
        },

        stop: function () {
            this._animation.stop();
        },

        _frame: function (frameTime) {
            this._frameTime = frameTime;
            if (this._currentWorld) {
                var scene = this._currentWorld.getScene();
                var camera = this._currentWorld.getMainCamera();

                if (scene && camera) {
                    this._currentWorld.$frame(frameTime);
                    // Adjust aspect dynamically
                    camera.aspect = this._renderer.width / this._renderer.height;

                    this._graphicManager.render(scene, camera);
                }
            }

            this.trigger('frame', frameTime);
        },

        broadcastEntityEvent: function () {
            if (this._currentWorld) {
                var entities = this._currentWorld.$getEntities();
                for (var i = 0; i < entities.length; i++) {
                    // TODO apply performance ?
                    entities[i].trigger.apply(entities[i], arguments);
                    entities[i].broadcastComponentEvent.apply(entities[i], arguments);
                }
            }
        }
    });

    return App3D;
});
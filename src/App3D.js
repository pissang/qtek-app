define(function (require) {
    
    'use strict';

    var Base = require('qtek/core/Base');
    var Renderer = require('qtek/Renderer');
    var Animation = require('qtek/animation/Animation');
    var World = require('./World');
    var ResourceManager = require('./ResourceManager');

    var App3D = Base.derive({

        _renderer: null,

        _animation: null,

        _frameTime: 0,

        _currentWorld: null,

        _el: null,

        _resourceManger: null
    }, {

        init: function (el) {
            this._el = el;

            this._renderer = new Renderer();
            this._animation = new Animation();

            this._resourceManger = new ResourceManager();
            this._resourceManger.$init(this);

            el.appendChild(this._renderer.canvas);
            this._animation.start();

            this._animation.on('frame', this._frame, this);

            this.resize();
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
        },

        unloadWorld: function () {
            if (this._currentWorld) {
                this._currentWorld.$dispose();
                this._currentWorld = null;
            }
        },

        getWorld: function () {
            return this._currentWorld;
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
                    this._renderer.render(scene, camera);
                }
            }
        }
    });

    return App3D;
});
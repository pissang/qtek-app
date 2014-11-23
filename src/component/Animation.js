define(function (require) {
    
    'use strict';

    var Component = require('../Component');

    var AnimationComponent = Component.derive({
        
        autoPlayClip : '',

        _currentPlayClip: null
        
    }, function () {
        
        this._clipsMap = {};

        this._skeletons = [];

    }, {
        type: 'ANIMATION',

        $init: function () {
            Component.prototype.$init.call(this);

            var sceneNode = this._entity.getSceneNode();
            sceneNode.traverse(this._findSkeletons, this);

            if (this.autoPlayClip) {
                this.playClip(this.autoPlayClip);
            }
        },

        _findSkeletons: function (node) {
            if (node.skeleton) {
                if (this._skeletons.indexOf(node.skeleton) === -1) {
                    this._skeletons.push(node.skeleton);
                }
            }
        },

        addClip: function (clip) {
            this._clipsMap[clip.name] = clip;
        },

        getClip: function (name) {
            return this._clipsMap[name];
        },

        playClip: function (name, fromStart) {
            if (fromStart == null) {
                fromStart = true;
            }
            this.stopClip();

            var clip = this._clipsMap[name];
            if (clip) {
                var animation = this.getAppInstance().getAnimationInstance();
                animation.addClip(clip);
                
                if (fromStart) {
                    clip.restart();
                }

                for (var i = 0; i < this._skeletons.length; i++) {
                    this._skeletons[i].addClip(clip.output == null ? clip : clip.output);
                }

                this._currentPlayClip = clip;
            }
            return clip;
        },

        stopClip: function () {
            for (var i = 0; i < this._skeletons.length; i++) {
                this._skeletons[i].removeClipsAll();
            }
            if (this._currentPlayClip) {
                var animation = this.getAppInstance().getAnimationInstance();
                animation.removeClip(this._currentPlayClip);
                this._currentPlayClip = null;
            }
        },

        $frame: function () {
            Component.prototype.$frame.call(this);
            
            if (this._currentPlayClip) {
                for (var i = 0; i < this._skeletons.length; i++) {
                    this._skeletons[i].setPose(0);
                }
            }
        },

        $dispose: function () {
            Component.prototype.$dispose.call(this);
            this.stopClip();
        },

        clone: function (entity) {
            var component = Component.prototype.clone.call(this, entity);
            for (var name in this._clipsMap) {
                component.addClip(this._clipsMap[name].clone());
            }
            component.autoPlayClip = this.autoPlayClip;
            return component;
        }
    });

    return AnimationComponent;
});
define(function (require) {
    
    'use strict';

    var Component = require('../Component');

    var AnimationComponent = Component.derive({
        
        _currentPlayClip: null
        
    }, function (entity) {
        
        this._clips = {};

        this._skeletons = [];

        var sceneNode = entity.getSceneNode();

        // TODO Hierarchy changed
        sceneNode.traverse(this._findSkeletons, this);
    }, {
        type: 'ANIMATION',

        $init: function () {
            Component.prototype.$init.call(this);
        },

        _findSkeletons: function (node) {
            if (node.skeleton) {
                if (this._skeletons.indexOf(node.skeleton) === -1) {
                    this._skeletons.push(node.skeleton);
                }
            }
        },

        addClip: function (clip) {
            this._clips[clip.name] = clip;
        },

        getClip: function (name) {
            return this._clips[name];
        },

        playClip: function (name, fromStart) {
            if (fromStart == null) {
                fromStart = true;
            }
            this.stopClip();

            var clip = this._clips[name];
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
        }
    });

    return AnimationComponent;
});
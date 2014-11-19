define(function (require) {
    
    'use strict';

    var Component = require('../Component');

    var AnimationComponent = Component.derive({
        
        _currentPlayClip: null
        
    }, function () {
        
        this._clips = {};

        this._skeletons = [];
    }, {
        type: 'ANIMATION',

        $init: function (entity) {
            Component.prototype.$init.call(this, entity);
            var sceneNode = this.getEntity().getSceneNode();

            // TODO Hierarchy changed
            sceneNode.traverse(this._findSkeletons, this);
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
                if (fromStart) {
                    clip.restart();
                }
                animation.addClip(clip);

                for (var i = 0; i < this._skeletons.length; i++) {
                    this._skeletons[i].addClip(clip.output == null ? clip : clip.output);
                }
            }
        },

        stopClip: function () {
            for (var i = 0; i < this._skeletons.length; i++) {
                this._skeletons[i].removeClipsAll();
            }
            if (this._currentPlayClip) {
                var animation = this.getAppInstance().getAnimationInstance();
                animation.removeClip(clip);
            }
        },

        $frame: function () {
            Component.prototype.$frame.call(this);
            
            for (var i = 0; i < this._skeletons.length; i++) {
                this._skeletons[i].setPose(0);
            }
        },

        $dispose: function () {
            Component.prototype.$dispose.call(this);
            this.stopClip();
        }
    });

    return AnimationComponent;
});
define(function (require) {

    var Vector2 = require('qtek/math/Vector2');
    var Vector3 = require('qtek/math/Vector3');

    var Matrix4 = require('qtek/math/Matrix4');

    return function () {

        return {
            init: function (entity) {
            },

            frame: function (entity) {
            },

            dispose: function (entity) {
            },

            updatePositionAndRotation: function (entity, position, rotation) {
                var sceneNode = entity.getSceneNode();
                sceneNode.position.setArray(position);
                sceneNode.rotation.setArray(rotation);

            },

            characterChangeSpeed: function (entity, x, y) {
                entity.getAnimationClip('move').position.set(x, y);
            },

            otherJump: function (entity) {
                entity.playAnimationClip('jump', true).ondestroy = function () {
                    self._jumping = false;
                    // TODO Animation transition
                    // TODO Not override ondestroy method
                    entity.playAnimationClip('move', true);
                }
            },

            characterUserInit: function (entity, userData) {
                var sceneNode = entity.getSceneNode();
                sceneNode.position.setArray(userData.position);
                sceneNode.traverse(function (node) {
                    if (node.material) {
                        node.material.set('color', userData.color);
                    }
                });
            }
        }
    }
});
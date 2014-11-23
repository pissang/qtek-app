define(function (require) {

    var Vector2 = require('qtek/math/Vector2');
    var Vector3 = require('qtek/math/Vector3');

    var Matrix4 = require('qtek/math/Matrix4');

    return function () {

        return {
            init: function (entity) {
                var sceneNode = entity.getSceneNode();
                var color = [Math.random(), Math.random(), Math.random()];
                sceneNode.traverse(function (mesh) {
                    if (mesh.material) {
                        mesh.material.set('color', color);
                    }
                });              
            },

            frame: function (entity) {
            },

            dispose: function (entity) {
            }
        }
    }
});
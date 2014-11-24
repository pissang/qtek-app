define(function () {

    return function () {
        return {
            
            _speedChanged: 0,

            userInit: function (entity, userData) {
                var sceneNode = entity.getSceneNode();
                sceneNode.position.setArray(userData.position);
                sceneNode.traverse(function (node) {
                    if (node.material) {
                        node.material.set('color', userData.color);
                    }
                });
            },

            frame: function (entity) {
                var sceneNode = entity.getSceneNode();
                var app = entity.getAppInstance();
                var moveClip = entity.getAnimationClip('move');
                if (moveClip.position.x || moveClip.position.y) {
                    app.trigger('selfSync', {
                        position: Array.prototype.slice.call(sceneNode.position._array),
                        rotation: Array.prototype.slice.call(sceneNode.rotation._array)
                    });
                }
                if (this._speedChanged) {
                    app.trigger('selfSync', {
                        speed: {
                            x: moveClip.position.x,
                            y: moveClip.position.y
                        }
                    })
                }
            },

            changeSpeed: function (entity, x, y) {
                this._speedChanged = true;
            }
        }
    }
});
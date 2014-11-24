define(function (require) {

    var OrbitControl = require('qtek/plugin/OrbitControl');

    return function () {
        return {

            _stickX: 0,

            _stickY: 0,

            init: function (entity) {
                
                var camera = entity.getSceneNode();

                this._orbitControl = new OrbitControl({
                    domElement: document.body,
                    maxPolarAngle : Math.PI / 1.7,
                    minPolarAngle : 1,
                    target: camera
                });

                // Turn to manual control
                this._orbitControl.disable();
            },

            frame: function (entity) {
                if (this._orbitControl) {
                    this._orbitControl._offsetRoll = this._stickY / 30;
                    this._orbitControl._offsetPitch = -this._stickX / 15;
                    this._orbitControl._op = 0;
                    this._orbitControl.update(entity.getFrameTime());
                }
            },

            orbit: function (entity, x, y) {
                this._stickY = y;
                this._stickX = x;
            }
        }
    }
});
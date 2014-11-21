define(function (require) {

    var Vector2 = require('qtek/math/Vector2');
    var Vector3 = require('qtek/math/Vector3');

    var Matrix4 = require('qtek/math/Matrix4');

    var tmpM4 = new Matrix4();

    return function () {

        return {
            elapsedTime: 0,

            speed: new Vector2(),

            forwardMaxSpeed: 0,

            sideMaxSpeed: 0,

            _orientationChanged: 0,

            init: function (entity) {
                
            },

            frame: function (entity) {
                if (this._orientationChanged && (this.speed.x > 0 || this.speed.y > 0)) {
                    var world = entity.getWorld();
                    var male = entity.getSceneNode();
                    var cameraWorldTransform = world.getMainCamera().worldTransform;
                    tmpM4.copy(cameraWorldTransform);
                    var forward = cameraWorldTransform.forward.negate();
                    var right = cameraWorldTransform.right.negate();
                    forward.y = 0;
                    right.y = 0;
                    forward.normalize();
                    right.normalize();

                    male.worldTransform.forward = forward;
                    male.worldTransform.right = right;
                    male.worldTransform.up = Vector3.UP;
                    male.decomposeWorldTransform();
                    male.update(true);

                    // Keep camera world transform
                    cameraWorldTransform.copy(tmpM4);
                    world.getMainCamera().decomposeWorldTransform();

                    this._orientationChanged = false;
                }

                var world = entity.getWorld();
                var forward = world.getMainCamera().worldTransform.forward.normalize().negate();
                forward.y = 0;
                var right = world.getMainCamera().worldTransform.right.normalize();
                right.y = 0;

                var male = entity.getSceneNode();
                male.position.scaleAndAdd(forward, this.speed.y * entity.getFrameTime() / 10);
                male.position.scaleAndAdd(right, this.speed.x * entity.getFrameTime() / 10);
            },

            dispose: function (entity) {
                
            },

            onchangeSpeed: function (entity, x, y) {
                var b2 = this.forwardMaxSpeed;
                var a2 = this.sideMaxSpeed;

                y *= b2;
                x *= a2;

                y = Math.max(y, 0);

                this.speed.set(x, y);

                // Clamp speed
                var a1 = Math.abs(this.speed.x);
                var b1 = Math.abs(this.speed.y);
                var x = (a1 * a2 * b2) / (a2 * b1 + a1 * b2);
                var y = x * b1 / a1;
                var lenSquared = x * x + y * y;
                var clampedSpeed = this.speed.clone();
                if (lenSquared < this.speed.squaredLength()) {
                    clampedSpeed.normalize().scale(Math.sqrt(lenSquared) - 0.01);
                }
                var animationComponent = entity.getComponentByType('animation');
                animationComponent.getClip('move').position.copy(clampedSpeed);
                this.speed.copy(clampedSpeed);
            },

            onjump: function (entity) {
                var animationComponent = entity.getComponentByType('animation');
                animationComponent.playClip('jump', true).ondestroy = function () {
                    // TODO Animation transition
                    // TODO Not override ondestroy method
                    animationComponent.playClip('move', true);
                }
            },

            onorbit: function () {
                this._orientationChanged = true;
            }
        }
    }
});
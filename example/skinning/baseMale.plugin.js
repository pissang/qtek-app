define(function (require) {

    var Vector2 = require('qtek/math/Vector2');

    return function () {

        return {
            elapsedTime: 0,

            speed: new Vector2(),

            init: function (entity) {

            },

            frame: function (entity) {
                this.elapsedTime += entity.getFrameTime() / 1000;
            },

            dispose: function (entity) {
                
            },

            onchangeSpeed: function (entity, x, y) {
                var b2 = 4;
                var a2 = 2;

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
            }
        }
    }
});
define(function (require) {

    return {

        elapsedTime: 0,

        init: function (entity, component) {

        },

        frame: function (entity, component) {
            this.elapsedTime += entity.getFrameTime() / 1000;
            var animationComponent = entity.getComponentByType('animation');
            animationComponent.getClip('move').position.y = Math.sin(this.elapsedTime) * 2 + 2;
        },

        dispose: function (entity, component) {
            
        }
    }
});
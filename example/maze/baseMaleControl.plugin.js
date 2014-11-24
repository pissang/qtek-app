define(function (require) {

    var Vector2 = require('qtek/math/Vector2');
    var Vector3 = require('qtek/math/Vector3');

    var Matrix4 = require('qtek/math/Matrix4');

    var tmpM4 = new Matrix4();

    var Collider = require('qtek-physics/Collider');
    var Material = require('qtek-physics/Material');
    var BoxShape = require('qtek-physics/shape/Box');
    var RigidBody = require('qtek-physics/RigidBody');
    var CompoundShape = require('qtek-physics/shape/Compound');

    var SceneNode = require('qtek/Node');

    return function () {

        return {
            elapsedTime: 0,

            speed: new Vector2(),

            forwardMaxSpeed: 0,

            sideMaxSpeed: 0,

            collider: null,

            _stickX: 0,

            _stickY: 0,

            _jumping: false,

            init: function (entity) {
                var compoundShape = new CompoundShape();
                compoundShape.addChildShape(new BoxShape({
                    halfExtents: new Vector3(50, 100, 50)
                }), new Vector3(0, 100, 0));
                var body = new RigidBody({
                    shape: compoundShape
                });
                body.mass = 10;
                var collider = new Collider({
                    physicsMaterial: new Material(),
                    sceneNode: new SceneNode(),
                    collisionObject: body
                });

                entity.getSceneNode().getWorldPosition(collider.sceneNode.position);

                this.collider = collider;

                entity.getAppInstance().physicsEngine.addCollider(collider);
            },

            frame: function (entity) {

                this._applyOrientationChange(entity);

                // Force the rotation and y position to be identity
                // In case it is modified by the physics engine
                if (this.collider) {
                    this.collider.sceneNode.position.y = 0;
                    this.collider.sceneNode.rotation.identity();

                    entity.getSceneNode().position.copy(this.collider.sceneNode.position);   
                }

                if (!this.speed.x && !this.speed.y) {
                    this.collider.collisionObject.linearVelocity.set(0, 0, 0);
                }
            },

            dispose: function (entity) {

            },

            changeSpeed: function (entity, x, y) {
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
                entity.getAnimationClip('move').position.copy(clampedSpeed);

                this._applyOrientationChange(entity);

                var world = entity.getWorld();
                var forward = world.getMainCamera().worldTransform.forward.normalize().negate();
                forward.y = 0;
                var right = world.getMainCamera().worldTransform.right.normalize();
                right.y = 0;

                var speed = this.collider.collisionObject.linearVelocity;

                speed.copy(forward).scale(clampedSpeed.y * 100);
                speed.scaleAndAdd(right, clampedSpeed.x * 100);

                this.speed.copy(clampedSpeed);
            },

            jump: function (entity) {
                if (this._jumping) {
                    return;
                }
                this._jumping = true;
                var self = this;
                entity.playAnimationClip('jump', true).ondestroy = function () {
                    self._jumping = false;
                    // TODO Animation transition
                    // TODO Not override ondestroy method
                    entity.playAnimationClip('move', true);
                }
            },

            orbit: function (entity, x, y) {
                this._stickY = y;
                this._stickX = x;

                this._orientationChanged = true;
            },
            
            _applyOrientationChange: function (entity) {
                if ((this._stickX !== 0 || this._stickY !== 0 || this._orientationChanged) && (this.speed.x !== 0 || this.speed.y !== 0)) {
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
            }
        }
    }
});
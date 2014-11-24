define(function (require) {

    var Collider = require('qtek-physics/Collider');
    var Material = require('qtek-physics/Material');
    var BoxShape = require('qtek-physics/shape/Box');
    var RigidBody = require('qtek-physics/RigidBody');
    var CompoundShape = require('qtek-physics/shape/Compound');

    var Vector3 = require('qtek/math/Vector3');

    return function () {
        return {
            init: function (entity) {
                var sceneNode = entity.getSceneNode();
                // Parent node of sceneNode is the instance root node
                var instanceRootNode = sceneNode.getParent();

                var mesh = sceneNode.queryNode('polySurface2129');
                var boundingBox = mesh.geometry.boundingBox;

                var compoundShape = new CompoundShape();
                compoundShape.addChildShape(new BoxShape({
                    halfExtents: new Vector3(422, 1000, 296)
                }), new Vector3(0, 1000, 0));
                var body = new RigidBody({
                    shape: compoundShape
                });
                var collider = new Collider({
                    isStatic: true,
                    physicsMaterial: new Material(),
                    sceneNode: instanceRootNode,
                    collisionObject: body
                });

                entity.getAppInstance().physicsEngine.addCollider(collider);
            }
        }
    }
});
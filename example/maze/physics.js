define(function (require) {

    var Engine = require('qtek-physics/Engine');
    var StaticPlane = require('qtek-physics/shape/StaticPlane');
    var RigidBody = require('qtek-physics/RigidBody');
    var Collider = require('qtek-physics/Collider');
    var Material = require('qtek-physics/Material');
    var Node = require('qtek/Node');

    var engine = new Engine({
        ammoUrl: '../dep/ammo.fast.js'
    });

    engine.init();

    var floorBody = new RigidBody({
        shape : new StaticPlane()
    });
    var floorNode = new Node();
    floorNode.rotation.rotateX(-Math.PI / 2);

    engine.addCollider(new Collider({
        collisionObject: floorBody,
        physicsMaterial: new Material(),
        sceneNode: floorNode,
        isStatic: true
    }));

    return engine;
});
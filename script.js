"use strict";

// const
const WIDTH = 256;
const HEIGHT = 512;
const BOWL_SIZE = 200;
const BOWL_THICKNESS = 10;
const RESTITUTION = 0.8;
const FRICTION = 0.1;
const SMALL_G = 9.8;
const fruits = [{}];
const IS_ANDROID = /Andorid/.test(window.navigator.userAgent);
const DEGREES = Math.PI / 180;
const MATTER_ELE = document.querySelector('#matter');

//============
// Matter.js

// modules
const { Engine, Render, Runner, Body, Bodies, Bounds, Common, Composite, Composites, Constraint, Events, Mouse, MouseConstraint, World, Sleeping} = Matter;

// classes
const engine = Engine.create();
const render = Render.create({
	element: MATTER_ELE,
	engine: engine,
	options: {
		width: WIDTH, height: HEIGHT,
		wireframes: true,
	}
});
Render.run(render);

//Bodies
const bowl = Composite.create();

let bowls = []
for (let i = 0; i < 225; i+= 45) {
    bowls[i] = Bodies.rectangle(BOWL_SIZE/2 + Math.cos(i * DEGREES) * BOWL_SIZE/2, BOWL_SIZE/2 + Math.sin(i * DEGREES) * BOWL_SIZE/2, BOWL_THICKNESS, BOWL_SIZE * (Math.sqrt(2) -1) + BOWL_THICKNESS , {angle: i *DEGREES, isStatic: true});
    Composite.add(bowl, bowls[i]);
}

Composite.add(engine.world, [bowl]);

// 反映
const runner = Runner.create();
Runner.run(runner, engine);


// ゴーストフルーツ

let ghostFruit = null;

function addGhostFruit() {
    ghostFruit = Bodies.circle(WIDTH/2, HEIGHT/2, 20, {isSensor: true, isStatic: true});
    Composite.add(engine.world, ghostFruit);
}


// クリック時

MATTER_ELE.addEventListener('click', () => {
    let fruit = Bodies.circle(WIDTH/2, HEIGHT/2, 20, {label: "fruit_1", render: {sprite: {texture: '../img/blackberry.png'}}});
    Composite.add(engine.world, fruit);
});


// センサーによって、重力を変化させる。
/*
if (IS_ANDROID) { 
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = -((x * Math.sqrt(x ** 2 + y ** 2)) * SMALL_G);
        engine.world.gravity.y = (y * Math.sqrt(x ** 2 + y ** 2) * SMALL_G);
    });
} else {
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = x * Math.sqrt(x ** 2 + y ** 2);
        engine.world.gravity.y = -(y * Math.sqrt(x ** 2 + y ** 2));
    });
}
*/


// 初回実行

addGhostFruit();
Composite.translate(bowl, { x: 28, y: 300 });

Events.on(engine, 'collisionStart', e => {
    const pairs = e.pairs;

    pairs.forEach(pair => {
        const {bodyA, bodyB} = pair;
        if (bodyA.label && bodyB.label && bodyA.label === bodyB.label) {
            // 剛体を静止状態に設定してから削除
            const position = [(bodyA.position.x + bodyB.position.x)/2, (bodyA.position.y + bodyB.position.y)/2];
            Sleeping.set(bodyA, true);
            Sleeping.set(bodyB, true);
            World.remove(engine.world, [bodyA, bodyB]);
            let fruit = Bodies.circle(...position, 15, {label: "fruit_2"});
            Composite.add(engine.world, fruit);
        }
    });
});

let fruit = Bodies.circle(WIDTH/2, HEIGHT/2, 20, {label: "fruit_1", render: {sprite: {texture: '../img/blackberry.png'}}});
Composite.add(engine.world, fruit);
"use strict";

//============
// Matter.js

// const
const WIDTH = 256;
const HEIGHT = 256;
const RESTITUTION = 0.8;
const FRICTION = 0.1;
const SMALL_G = 9.8;
const fruits = {"strawberry": {density: 1}};
const IS_ANDROID = /Andorid/.test(window.navigator.userAgent);

// modules
const { Engine, Render, Runner, Body, Bodies, Bounds, Common, Composite, Composites, Constraint, Events, Mouse, MouseConstraint} = Matter;

// この部分に具体的な記述をしていきます

// 1, 物理エンジン本体のクラス
const engine = Engine.create();

// 2, 画面を描画するクラス
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: WIDTH, height: HEIGHT,
		showAngleIndicator: true,
		showCollisions: true,
		showDebug: false,
		showIds: true,
		showVelocity: true,
		hasBounds: true,
		wireframes: true// Important!!
	}
});
Render.run(render);


// 1-1, Box, Ball, 地面を用意
const box = Bodies.rectangle(WIDTH/2-80, 0, 80, 80,
	{restitution: 0.8, friction: 0.1, angle: Common.random(0, 360)});
const ball = Bodies.circle(WIDTH/2+80, 0, 40, 
	{restitution: 0.8, friction: 0.1, angle: Common.random(0, 360)});
const ground = Bodies.rectangle(WIDTH/2, HEIGHT, WIDTH, 50,
	{isStatic: true});
// 1-2, Box, Ball, 地面を配置
Composite.add(engine.world, [box, ball, ground]);

// 2, マウスの設定
const mouse = Mouse.create(render.canvas);
render.mouse = mouse;
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: {visible: false}
	}
});
Composite.add(engine.world, mouseConstraint);


// 4, 物理世界を更新します
const runner = Runner.create();
Runner.run(runner, engine);

if (IS_ANDROID) { 
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = x * Math.sqrt(x ** 2 + y ** 2);
        engine.world.gravity.y = y * Math.sqrt(x ** 2 + y ** 2);
    });
} else {
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = -(x * Math.sqrt(x ** 2 + y ** 2));
        engine.world.gravity.y = -(y * Math.sqrt(x ** 2 + y ** 2));
    });
}
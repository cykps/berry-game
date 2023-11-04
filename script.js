"use strict";

// const
const WIDTH = 512;
const HEIGHT = 1024;
const BOWL_SIZE = 370;
const BOWL_THICKNESS = 20;
const RESTITUTION = 0.8;
const FRICTION = 0.1;
const SMALL_G = 9.8;
const fruits = [['cranberry', 30, 0.008], ['blueberry', 50, 0.008], ['strawberry', 70, 0.008], ['blackberry', 90, 0.008], ['raspberry', 120, 0.008]];
const IS_ANDROID = /Android/.test(window.navigator.userAgent);
const IS_IPhone = /iPhone/.test(window.navigator.userAgent);
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
		//showAngleIndicator: true,
		//showCollisions: true,
		//showDebug: false,
		//showIds: true,
		//showVelocity: true,
		//hasBounds: true,
        wireframes : false, //IMPORTANT

        background: "lightgreen",
	}
});

Render.run(render);

//Bodies
const bowl = Composite.create();

const background = Bodies.rectangle(HEIGHT/2, WIDTH/2, HEIGHT, WIDTH, {
    render: {
        fillStyle: 'red',
    }
});

let bowls = []
for (let i = 0; i < 225; i+= 45) {
    bowls[i] = Bodies.rectangle(BOWL_SIZE/2 + Math.cos(i * DEGREES) * BOWL_SIZE/2, BOWL_SIZE/2 + Math.sin(i * DEGREES) * BOWL_SIZE/2, BOWL_THICKNESS, BOWL_SIZE * (Math.sqrt(2) -1) + BOWL_THICKNESS , {
        angle: i *DEGREES,
        isStatic: true,
        render: {
            fillStyle: 'lightskyblue',
        }
    });
    Composite.add(bowl, bowls[i]);
}

Composite.add(engine.world, [bowl]);

Composite.translate(bowl, { x: WIDTH/2 - BOWL_SIZE/2, y: HEIGHT - WIDTH/2 - BOWL_SIZE/2});


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
    Composite.add(engine.world, fruitBody(0, [WIDTH/2, WIDTH/3]));
});


// センサーによって、重力を変化させる。

    // モーションセンサーが有効か？
    if (window.DeviceOrientationEvent) {
        // ★iOS13向け: ユーザーにアクセスの許可を求める関数があるか？
        if (DeviceOrientationEvent.requestPermission) {
            // ★モーションセンサーのアクセス許可をリクエストする
            DeviceOrientationEvent.requestPermission()
                .then(function (response) {
                // リクエストが許可されたら
                    if (response === "granted") {
                      // deviceorientationが有効化される
                    alert("モーションセンサーがONです🎉");
                }
            })
            .catch((e) => {
                console.log(e);
            });
            // iOS13以外
            } else {
            alert('設定から"モーションセンサー"をONにしてください🙇');
        }
    } else {
        // alert("モーションセンサーがありません😭");
    }


if (IS_ANDROID) { 
    window.addEventListener('deviceorientation', (e) => {
        engine.world.gravity.x = 0.01 * e.gamma;
    });
} else if (IS_IPhone) {
    window.addEventListener('deviceorientation', (e) => {
        engine.world.gravity.x = 0.01 * e.gamma;
    });
}



// 初回実行

addGhostFruit();

Events.on(engine, 'collisionStart', e => {
    const pairs = e.pairs;

    for (const pair of pairs) {
        const {bodyA, bodyB} = pair;
        if (bodyA.label === bodyB.label) {
            // 剛体を静止状態に設定してから削除
            const position = [(bodyA.position.x + bodyB.position.x)/2, (bodyA.position.y + bodyB.position.y)/2];
            Sleeping.set(bodyA, true);
            Sleeping.set(bodyB, true);
            World.remove(engine.world, [bodyA, bodyB]);
            let fruit = null;
            if (bodyA.label <= 3) {
                Composite.add(engine.world, fruitBody(bodyA.label + 1, position));
            }
            break;
        }
    };
});

function fruitBody(fruitNo, [x, y]) {
    const fruit = Bodies.circle(x, y, fruits[fruitNo][1], {
        label: fruitNo,
        render: {
            sprite: {
                texture: `./src/img/${fruits[fruitNo][0]}_256.png`,
                xScale: (fruits[fruitNo][1] * fruits[fruitNo][2]),
                yScale: (fruits[fruitNo][1] * fruits[fruitNo][2]),
            }
        }});
    console.log(fruit)
    return fruit;
};

setInterval(() => {
    Composite.add(engine.world, fruitBody(0, [WIDTH/2, WIDTH/3]));
},1000)
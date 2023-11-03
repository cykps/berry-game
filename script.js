"use strict";

// const
const WIDTH = 600;
const HEIGHT = 1024;
const BOWL_SIZE = 360;
const BOWL_THICKNESS = 20;
const RESTITUTION = 0.8;
const FRICTION = 0.1;
const SMALL_G = 9.8;
const fruits = [['cranberry', 20, 0.16], ['blueberry', 50, 0.4], ['strawberry', 80, 0.62], ['blackberry', 110, 0.9], ['raspberry', 140, 1.14]];
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
    let fruit = Bodies.circle(WIDTH/2, WIDTH/2, 20, {
        label: "1",
        render: {
            sprite: {
                texture: '/src/img/cranberry_256.png',
                xScale: 0.16,
                yScale: 0.16,
            }
        }
    });
    Composite.add(engine.world, fruit);
});


// センサーによって、重力を変化させる。

if (IS_ANDROID) { 
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = -((x * Math.sqrt(x ** 2 + y ** 2)) * SMALL_G);
        engine.world.gravity.y = (y * Math.sqrt(x ** 2 + y ** 2) * SMALL_G);
    });
} else if (IS_IPhone) {
    window.addEventListener('devicemotion', (e) => {
        const {x, y} = e.acceleration;
        engine.world.gravity.x = x * Math.sqrt(x ** 2 + y ** 2);
        engine.world.gravity.y = -(y * Math.sqrt(x ** 2 + y ** 2));
    });
}



// 初回実行

function start() {
    // alert("button");
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
        alert('設定から"モーションセンサー"をONにしてください');
      }
    } else {
      alert("モーションセンサーが使えないかも...");
    }
  }

addGhostFruit();

Events.on(engine, 'collisionStart', e => {
    const pairs = e.pairs;

    pairs.forEach(pair => {
        const {bodyA, bodyB} = pair;
        if (bodyA.label === bodyB.label) {
            // 剛体を静止状態に設定してから削除
            const position = [(bodyA.position.x + bodyB.position.x)/2, (bodyA.position.y + bodyB.position.y)/2];
            Sleeping.set(bodyA, true);
            Sleeping.set(bodyB, true);
            World.remove(engine.world, [bodyA, bodyB]);
            let fruit = null;
            switch (bodyA.label){
                case '0':
                    fruit = Bodies.circle(...position, fruits[0][1], {
                        label: "1",
                        render: {
                            sprite: {
                                texture: '/src/img/blackberry_256.png',
                                xScale: fruits[0][2],
                                yScale: fruits[0][2],
                            }
                        }
                    });
                    Composite.add(engine.world, fruit);
                    console.log(0,bodyA.label,bodyB.label);
                    break;
                case '1':
                    fruit = Bodies.circle(...position, fruits[1][1], {
                        label: "2",
                        render: {
                            sprite: {
                                texture: `/src/img/${fruits[1][0]}_256.png`,
                                xScale: fruits[1][2],
                                yScale: fruits[1][2],
                            }
                        }});
                    Composite.add(engine.world, fruit);
                    console.log(1,bodyA.label,bodyB.label);
                    break;
                case '2':
                    fruit = Bodies.circle(...position, fruits[2][1], {
                        label: "3",
                        render: {
                            sprite: {
                                texture: `/src/img/${fruits[2][0]}_256.png`,
                                xScale: fruits[2][2],
                                yScale: fruits[2][2],
                            }
                        }});
                    Composite.add(engine.world, fruit);
                    console.log(2,bodyA.label,bodyB.label);
                    break;
                case '3':
                    fruit = Bodies.circle(...position, fruits[3][1], {
                        label: "4",
                        render: {
                            sprite: {
                                texture: `/src/img/${fruits[3][0]}_256.png`,
                                xScale: fruits[3][2],
                                yScale: fruits[3][2],
                            }
                        }});
                    Composite.add(engine.world, fruit);
                    console.log(3,bodyA.label,bodyB.label);
                    break;
                case '4':
                    fruit = Bodies.circle(...position, fruits[4][1], {
                        label: "5",
                        render: {
                            sprite: {
                                texture: `/src/img/${fruits[4][0]}_256.png`,
                                xScale: fruits[4][2],
                                yScale: fruits[4][2],
                            }
                        }});
                    Composite.add(engine.world, fruit);
                    console.log(4,bodyA.label,bodyB.label);
                    break;
            }
        }
    });
});


"use strict";

// const
const WIDTH = 512;
const HEIGHT = 1024;
const BOWL_SIZE = 370;
const BOWL_THICKNESS = 20;
const RESTITUTION = 0;
const FRICTION = 0.2;
const BOWL_RESTITUTION = RESTITUTION;
const BOWL_FRICTION = FRICTION;
const SMALL_G = 9.8;
// [[fruitName, size, imgSize, point], ...]
const fruits = [['cranberry', 30, 0.008, 1], ['blueberry', 50, 0.008, 14], ['strawberry', 70, 0.008, 27], ['blackberry', 90, 0.008,41], ['raspberry', 120, 0.008, 55]];
const IS_ANDROID = /Android/.test(window.navigator.userAgent);
const IS_IPhone = /iPhone/.test(window.navigator.userAgent);
const DEGREES = Math.PI / 180;
const MATTER_ELE = document.querySelector('#matter');
const LIFEFRUIT_MARGIN = 4;
const LIFEFRUIT_SIZE = 24;

// variable
let score = 0;
let life = 0;
let maxLife = 8;
let lifeFruitNo = 2;
let isGaming = false;

// element
let scoreEle = document.querySelector('#score');
const startButtonEle = document.querySelector('#start');
const titleScreenEle = document.querySelector('#title-screen');
const phoneEle = document.querySelector('#phone');
const pcEle = document.querySelector('#pc');

// modules
const { Engine, Render, Runner, Body, Bodies, Bounds, Common, Composite, Composites, Constraint, Events, Mouse, MouseConstraint, World, Sleeping} = Matter;



//=======
// titie-screen




//========
// Matter.js

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

const ground = Bodies.rectangle( WIDTH/2, HEIGHT + fruits[fruits.length - 1][1] + 4, WIDTH * 5, 4 * 2, {
    label: 'ground',
    isStatic: true,
    removeOnRestart: false,
});

const bowl = Composite.create();
let bowls = [];
for (let i = 0; i < 225; i+= 45) {
    bowls[i] = Bodies.rectangle(BOWL_SIZE/2 + Math.cos(i * DEGREES) * BOWL_SIZE/2, BOWL_SIZE/2 + Math.sin(i * DEGREES) * BOWL_SIZE/2, BOWL_THICKNESS, BOWL_SIZE * (Math.sqrt(2) -1) + BOWL_THICKNESS , {
        label: 'bowl',
        removeOnRestart: false,
        angle: i *DEGREES,
        isStatic: true,
        render: {
            fillStyle: 'lightskyblue',
        }
    });
    Composite.add(bowl, bowls[i]);
};
Composite.add(engine.world, [ground, bowl]);
Composite.translate(bowl, { x: WIDTH/2 - BOWL_SIZE/2, y: HEIGHT - WIDTH/2 - BOWL_SIZE/2});



// 反映
const runner = Runner.create();
Runner.run(runner, engine);


/*
// ゴーストフルーツ
let ghostFruit = null;
function addGhostFruit() {
    ghostFruit = Bodies.circle(WIDTH/2, HEIGHT/2, 20, {isSensor: true, isStatic: true});
    Composite.add(engine.world, ghostFruit);
}
*/

/*
// クリック時
MATTER_ELE.addEventListener('click', () => {
    Composite.add(engine.world, fruitBody(0, [WIDTH/2, WIDTH/3]));
});
*/

// モーションセンサーの有効化
window.alert = () => {}; // for Dev

function enaSen() {
if(IS_IPhone) {
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
        alert("モーションセンサーがありません😭");
    }
}
}

// センサーによって、重力を変化させる。
if (IS_ANDROID) { 
    window.addEventListener('deviceorientation', (e) => {
        engine.world.gravity.x = 0.01 * e.gamma;
    });
} else if (IS_IPhone) {
    window.addEventListener('deviceorientation', (e) => {
        engine.world.gravity.x = 0.01 * e.gamma;
    });
};



//衝突判定
Events.on(engine, 'collisionStart', e => {
    const pairs = e.pairs;
    for (const pair of pairs) {
        const {bodyA, bodyB} = pair;

        // 地面に接地した時の処理
        if (bodyA.label === 'ground') {
            Sleeping.set(bodyB, true);
            World.remove(engine.world, bodyB);
            setLife(life - 1);
            console.log('接地');
        } else if (bodyB.label === 'ground') {
            Sleeping.set(bodyA, true);
            World.remove(engine.world, bodyA);
            setLife(life - 1);
            console.log('接地');
        }
        
        // フルーツの結合処理
        if (bodyA.label === bodyB.label) {
            const position = [(bodyA.position.x + bodyB.position.x)/2, (bodyA.position.y + bodyB.position.y)/2];
            Sleeping.set(bodyA, true);
            Sleeping.set(bodyB, true);
            World.remove(engine.world, [bodyA, bodyB]);
            let fruitNo = bodyA.label;
            if (bodyA.label < fruits.length - 1) {
                Composite.add(engine.world, fruitBody(fruitNo+ 1, position));
            } else if (bodyA.label === fruits.length) {
                setLife(lift + (2 ** ((fruits.length + 1) - lifeFruitNo)));
            }
            console.log(fruits[bodyA.label][0]);
            setScore(score + fruits[bodyA.label][3]);
        };
    break;
    };
});

// フルーツのBodyを返す関数
function fruitBody(fruitNo, [x, y]) {
    const fruit = Bodies.circle(x, y, fruits[fruitNo][1], {
        label: fruitNo,
        friction: FRICTION,
        restitution: RESTITUTION,
        removeOnRestart: true,
        
        render: {
            sprite: {
                texture: `./src/img/${fruits[fruitNo][0]}_256.png`,
                xScale: (fruits[fruitNo][1] * fruits[fruitNo][2]),
                yScale: (fruits[fruitNo][1] * fruits[fruitNo][2]),
            }
        }
    });
    return fruit;
};

// スコアにポイントを加算して表示
function setScore(newScore) {
    score = newScore;
    scoreEle.innerHTML = `Score: ${newScore}`
}

function setLife(newLife) {
    if (maxLife < newLife) {
        newLife = maxLife;
    }
    life = newLife
    for (let i = 0; i < maxLife; i++) {
        let color = null;
        if (i <= life) {
            color = true;
        } else {
            color =false;
        }
        Composite.add(engine.world, lifeFruitBody(lifeFruitNo, i, color));
        if (newLife <= 0) {
            if (isGaming) {
                finishGame();
            } else {
                startDemo();
            }
        }
    };
}

function lifeFruitBody(fruitNo, lifeFruitIndex, color) {
    let img = null;
    if (color) {
        img = `./src/img/${fruits[fruitNo][0]}_256.png`;
    } else {
        img = `./src/img/${fruits[fruitNo][0]}_gray_256.png`
    }
    const fruit = Bodies.circle(((LIFEFRUIT_SIZE * 2) + LIFEFRUIT_MARGIN) * lifeFruitIndex + (LIFEFRUIT_SIZE + LIFEFRUIT_MARGIN), LIFEFRUIT_SIZE + LIFEFRUIT_MARGIN, LIFEFRUIT_SIZE, {
        label: 'lifeFruit',
        removeOnRestart: true,

        isSensor: true,
        isStatic: true,
        
        render: {
            sprite: {
                texture: img,
                xScale: (LIFEFRUIT_SIZE * fruits[fruitNo][2]),
                yScale: (LIFEFRUIT_SIZE * fruits[fruitNo][2]),
            }
        }
    });
    return fruit;
}

// for Debag
setInterval(() => {
    Composite.add(engine.world, fruitBody(0, [WIDTH/2, WIDTH/3]));
},1000);


// Process

startDemo();

function startDemo() {
    setLife(maxLife);
    setScore(0);
    const bodiesToRemove = engine.world.bodies.filter(body => body.removeOnRestart === true);
    World.remove(engine.world, bodiesToRemove);
}

function startGame() {
    enaSen();
    const bodiesToRemove = engine.world.bodies.filter(body => body.removeOnRestart === true);
    World.remove(engine.world, bodiesToRemove);
    setLife(maxLife);
    console.log(bodiesToRemove);
    titleScreenEle.style.display = "none";
    isGaming = true;
}

function finishGame() {
    const bodiesToRemove = engine.world.bodies.filter(body => body.removeOnRestart === true);
    World.remove(engine.world, bodiesToRemove);
    titleScreenEle.style.display = "block";
    isGaming = false;
}

startButtonEle.addEventListener('click', startGame);

if (window.DeviceOrientationEvent) {
    pcEle.style.display = "none";
} else {
    phoneEle.style.display = "none";
}
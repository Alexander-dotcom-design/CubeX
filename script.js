const colorNames = {
    U: "Yellow",
    R: "Red",
    F: "Blue",
    D: "White",
    L: "Orange",
    B: "Green"
};

let cubeState = {
    U: Array(9).fill(null),
    R: Array(9).fill(null),
    F: Array(9).fill(null),
    D: Array(9).fill(null),
    L: Array(9).fill(null),
    B: Array(9).fill(null)
};

let solutionMoves = [];
let currentStep = 0;
let solverReady = false;

let demoCube = null;
let demoScene = null;
let demoLayer = null;
let demoState = null;

let animating = false;
let solutionStates = [];

let enteredCubeState = null;



const status =
    document.getElementById("status");

const selectedColorText =
    document.getElementById("selectedColor");

const stepElement =
    document.getElementById("step");

const explanationElement =
    document.getElementById("explanation");

const counterElement =
    document.getElementById("counter");

const finishElement =
    document.getElementById("finish");

const previousButton =
    document.getElementById("previous");

const nextButton =
    document.getElementById("next");

const moveLarge =
    document.getElementById("move-large");

const moveArrow =
    document.getElementById("moveArrow");

const solveButton =
    document.getElementById("solveButton");

const clearButton =
    document.getElementById("clearButton");

const demoCubeElement =
    document.getElementById("demoCube");



function getFaceName(face) {

    const names = {
        U: "Top",
        R: "Right",
        F: "Front",
        D: "Bottom",
        L: "Left",
        B: "Back"
    };

    return names[face] || face;
}



function detectButtonColor(button) {

    const rawData =
        (button.dataset.color || "")
            .toLowerCase()
            .trim();

    const aria =
        (button.getAttribute("aria-label") || "")
            .toLowerCase()
            .trim();

    const title =
        (button.getAttribute("title") || "")
            .toLowerCase()
            .trim();

    const text =
        (button.innerText ||
         button.textContent ||
         "")
            .toLowerCase()
            .trim();

    const classes =
        Array.from(button.classList)
            .join(" ")
            .toLowerCase();

    const combined = [
        rawData,
        aria,
        title,
        text,
        classes
    ].join(" ");


    if (combined.includes("yellow")) {
        return "U";
    }

    if (combined.includes("red")) {
        return "R";
    }

    if (combined.includes("blue")) {
        return "F";
    }

    if (combined.includes("white")) {
        return "D";
    }

    if (combined.includes("orange")) {
        return "L";
    }

    if (combined.includes("green")) {
        return "B";
    }


    if (rawData === "u") {
        return "U";
    }

    if (rawData === "r") {
        return "R";
    }

    if (rawData === "f") {
        return "F";
    }

    if (rawData === "d") {
        return "D";
    }

    if (rawData === "l") {
        return "L";
    }

    if (rawData === "b") {
        return "B";
    }

    return null;
}



let selectedColor = null;


function selectColor(color, clickedButton = null) {

    if (!colorNames[color]) {
        return;
    }

    selectedColor = color;

    document
        .querySelectorAll(".palette-color")
        .forEach(function(button) {

            button.classList.remove("selected");

        });


    if (clickedButton) {
        clickedButton.classList.add("selected");
    }


    if (selectedColorText) {

        selectedColorText.innerText =
            colorNames[selectedColor] +
            " selected";

    }
}



document
    .querySelectorAll(".palette-color")
    .forEach(function(button) {

        const detectedColor =
            detectButtonColor(button);

        if (detectedColor) {

            button.dataset.color =
                detectedColor;

        }


        button.addEventListener(
            "click",
            function() {

                const color =
                    detectButtonColor(button);

                if (!color) {

                    console.warn(
                        "Could not determine palette color:",
                        button
                    );

                    return;
                }

                selectColor(
                    color,
                    button
                );

            }
        );

    });


if (selectedColorText) {

    selectedColorText.innerText =
        "Select a color first";

}



function createCube() {

    const faces =
        document.querySelectorAll(".face");


    faces.forEach(function(face) {

        const faceName =
            face.dataset.face;

        face.innerHTML =
            "<h3>" +
            getFaceName(faceName) +
            "</h3>";


        for (let i = 0; i < 9; i++) {

            const sticker =
                document.createElement("div");

            sticker.className =
                "sticker";

            sticker.dataset.face =
                faceName;

            sticker.dataset.index =
                i;


            sticker.addEventListener(
                "click",
                function() {

                    paintSticker(
                        faceName,
                        i
                    );

                }
            );


            face.appendChild(sticker);

        }

    });


    renderCube();
}



function renderCube() {

    document
        .querySelectorAll(".face")
        .forEach(function(face) {

            const faceName =
                face.dataset.face;

            const stickers =
                face.querySelectorAll(".sticker");


            stickers.forEach(
                function(sticker, index) {

                    sticker.className =
                        "sticker";

                    const color =
                        cubeState[
                            faceName
                        ][index];


                    if (color) {

                        sticker.classList.add(
                            "color-" + color
                        );

                    }

                }
            );

        });
}




function paintSticker(face, index) {

 

    if (!selectedColor) {

        if (status) {

            status.innerText =
                "Select a color before painting a sticker.";

        }

        return;
    }


    cubeState[face][index] =
        selectedColor;


    renderCube();


    if (status) {

        status.innerText =
            colorNames[selectedColor] +
            " applied.";

    }
}



function copyCubeState(state) {

    return {

        U: [...state.U],
        R: [...state.R],
        F: [...state.F],
        D: [...state.D],
        L: [...state.L],
        B: [...state.B]

    };
}




function validateCube() {

    const counts = {
        U: 0,
        R: 0,
        F: 0,
        D: 0,
        L: 0,
        B: 0
    };


    const faces = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    for (const face of faces) {

        for (const sticker of cubeState[face]) {

            if (!sticker) {

                return {
                    valid: false,
                    message:
                        "Please fill every sticker before solving."
                };

            }

            counts[sticker]++;

        }

    }


    for (const color of faces) {

        if (counts[color] !== 9) {

            return {
                valid: false,
                message:
                    colorNames[color] +
                    " must appear exactly 9 times. " +
                    "Currently: " +
                    counts[color] +
                    "."
            };

        }

    }


    const centers = {
        U: cubeState.U[4],
        R: cubeState.R[4],
        F: cubeState.F[4],
        D: cubeState.D[4],
        L: cubeState.L[4],
        B: cubeState.B[4]
    };


    for (const face of faces) {

        if (centers[face] !== face) {

            return {
                valid: false,
                message:
                    getFaceName(face) +
                    " center must be " +
                    colorNames[face] +
                    "."
            };

        }

    }


    return {
        valid: true,
        message: "Cube is valid."
    };
}




function createFaceletString(state = cubeState) {

    const order = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    let result = "";


    for (const face of order) {

        for (const sticker of state[face]) {

            if (!sticker) {
                return null;
            }

            result += sticker;

        }

    }


    return result;
}


function loadSolverLibrary() {

  

    if (typeof Cube === "undefined") {

        console.error(
            "Cube.js was not found."
        );

        if (status) {

            status.innerText =
                "Cube.js could not be loaded.";

        }

        return false;
    }

    try {

        Cube.initSolver();

        solverReady = true;

        return true;

    } catch (error) {

        console.error(
            "Could not initialize Cube.js:",
            error
        );

        if (status) {

            status.innerText =
                "Solver initialization failed.";

        }

        return false;
    }
}



function colorStateToFaceletState(state) {

    const faceOrder = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    let facelets = "";


    for (const face of faceOrder) {

        for (const color of state[face]) {

            if (!color) {
                return null;
            }

            facelets += color;

        }

    }


    return facelets;
}

function buildSolutionStates(startState, moves) {

    const states = [];

    let workingState =
        copyCubeState(startState);


    states.push(
        copyCubeState(workingState)
    );


    for (const move of moves) {

        applyMoveToState(
            workingState,
            move
        );


        states.push(
            copyCubeState(workingState)
        );

    }


    return states;
}



function rotateFaceClockwise(face) {

    const old =
        [...face];


    face[0] = old[6];
    face[1] = old[3];
    face[2] = old[0];

    face[3] = old[7];
    face[4] = old[4];
    face[5] = old[1];

    face[6] = old[8];
    face[7] = old[5];
    face[8] = old[2];
}


function rotateFaceCounterClockwise(face) {

    const old =
        [...face];


    face[0] = old[2];
    face[1] = old[5];
    face[2] = old[8];

    face[3] = old[1];
    face[4] = old[4];
    face[5] = old[7];

    face[6] = old[0];
    face[7] = old[3];
    face[8] = old[6];
}




function moveU(state) {

    rotateFaceClockwise(
        state.U
    );


    const temp = [
        state.F[0],
        state.F[1],
        state.F[2]
    ];


    state.F[0] = state.R[0];
    state.F[1] = state.R[1];
    state.F[2] = state.R[2];


    state.R[0] = state.B[0];
    state.R[1] = state.B[1];
    state.R[2] = state.B[2];


    state.B[0] = state.L[0];
    state.B[1] = state.L[1];
    state.B[2] = state.L[2];


    state.L[0] = temp[0];
    state.L[1] = temp[1];
    state.L[2] = temp[2];
}



function moveD(state) {

    rotateFaceClockwise(
        state.D
    );


    const temp = [
        state.F[6],
        state.F[7],
        state.F[8]
    ];


    state.F[6] = state.L[6];
    state.F[7] = state.L[7];
    state.F[8] = state.L[8];


    state.L[6] = state.B[6];
    state.L[7] = state.B[7];
    state.L[8] = state.B[8];


    state.B[6] = state.R[6];
    state.B[7] = state.R[7];
    state.B[8] = state.R[8];


    state.R[6] = temp[0];
    state.R[7] = temp[1];
    state.R[8] = temp[2];
}




function moveR(state) {

    rotateFaceClockwise(
        state.R
    );


    const temp = [
        state.U[2],
        state.U[5],
        state.U[8]
    ];


    state.U[2] = state.F[2];
    state.U[5] = state.F[5];
    state.U[8] = state.F[8];


    state.F[2] = state.D[2];
    state.F[5] = state.D[5];
    state.F[8] = state.D[8];


    state.D[2] = state.B[6];
    state.D[5] = state.B[3];
    state.D[8] = state.B[0];


    state.B[6] = temp[0];
    state.B[3] = temp[1];
    state.B[0] = temp[2];
}



function moveL(state) {

    rotateFaceClockwise(
        state.L
    );


    const temp = [
        state.U[0],
        state.U[3],
        state.U[6]
    ];


    state.U[0] = state.B[8];
    state.U[3] = state.B[5];
    state.U[6] = state.B[2];


    state.B[8] = state.D[0];
    state.B[5] = state.D[3];
    state.B[2] = state.D[6];


    state.D[0] = state.F[0];
    state.D[3] = state.F[3];
    state.D[6] = state.F[6];


    state.F[0] = temp[0];
    state.F[3] = temp[1];
    state.F[6] = temp[2];
}




function moveF(state) {

    rotateFaceClockwise(
        state.F
    );


    const temp = [
        state.U[6],
        state.U[7],
        state.U[8]
    ];


    state.U[6] = state.L[8];
    state.U[7] = state.L[5];
    state.U[8] = state.L[2];


    state.L[2] = state.D[0];
    state.L[5] = state.D[1];
    state.L[8] = state.D[2];


    state.D[0] = state.R[6];
    state.D[1] = state.R[3];
    state.D[2] = state.R[0];


    state.R[0] = temp[0];
    state.R[3] = temp[1];
    state.R[6] = temp[2];
}




function applyMoveToState(state, move) {

    const baseMove =
        move.replace("'", "")
            .replace("2", "");


    let repetitions = 1;


    if (move.includes("2")) {

        repetitions = 2;

    }


    if (move.includes("'")) {

        repetitions = 3;

    }


    for (let i = 0; i < repetitions; i++) {

        switch (baseMove) {

            case "U":
                moveU(state);
                break;

            case "D":
                moveD(state);
                break;

            case "R":
                moveR(state);
                break;

            case "L":
                moveL(state);
                break;

            case "F":
                moveF(state);
                break;

        }

    }
}




function solveCube() {

    if (!solverReady) {

        if (!loadSolverLibrary()) {
            return;
        }

    }


    const validation =
        validateCube();


    if (!validation.valid) {

        if (status) {

            status.innerText =
                validation.message;

        }

        return;
    }


   

    enteredCubeState =
        copyCubeState(cubeState);


    const faceletString =
        createFaceletString(
            enteredCubeState
        );


    if (!faceletString) {

        if (status) {

            status.innerText =
                "Could not read the cube.";

        }

        return;
    }


    try {

        const cube =
            Cube.fromString(
                faceletString
            );


        const solution =
            cube.solve();


        if (!solution) {

            throw new Error(
                "No solution returned."
            );

        }


        solutionMoves =
            solution.trim()
                ? solution.trim().split(/\s+/)
                : [];


        currentStep = 0;


        /*
           Build every state from the
           exact user-entered cube.
        */

        solutionStates =
            buildSolutionStates(
                enteredCubeState,
                solutionMoves
            );


        demoState =
            copyCubeState(
                enteredCubeState
            );


        renderDemoCube();


        updateStepDisplay();


        if (status) {

            status.innerText =
                solutionMoves.length === 0
                    ? "Cube is already solved."
                    : "Solution found.";

        }


        if (solutionMoves.length === 0) {

            solverReady = true;

            return;
        }


        solverReady = true;


    } catch (error) {

        console.error(
            "Solve error:",
            error
        );


        if (status) {

            status.innerText =
                "This cube configuration could not be solved.";

        }

    }
}




function clearCube() {

    cubeState = {

        U: Array(9).fill(null),
        R: Array(9).fill(null),
        F: Array(9).fill(null),
        D: Array(9).fill(null),
        L: Array(9).fill(null),
        B: Array(9).fill(null)

    };


    enteredCubeState = null;

    solutionMoves = [];

    solutionStates = [];

    currentStep = 0;

    demoState = null;

    solverReady = false;


    renderCube();

    updateStepDisplay();


    if (selectedColorText) {

        selectedColorText.innerText =
            "Select a color first";

    }


    selectedColor = null;


    document
        .querySelectorAll(".palette-color")
        .forEach(function(button) {

            button.classList.remove(
                "selected"
            );

        });


    if (status) {

        status.innerText =
            "Cube cleared.";

    }


    if (finishElement) {

        finishElement.style.display =
            "none";

    }
}


if (solveButton) {

    solveButton.addEventListener(
        "click",
        solveCube
    );

}


if (clearButton) {

    clearButton.addEventListener(
        "click",
        clearCube
    );
}



function updateStepDisplay() {

    const total =
        solutionMoves.length;


    if (counterElement) {

        counterElement.innerText =
            total === 0
                ? "0 / 0"
                : currentStep +
                  " / " +
                  total;

    }


    if (total === 0) {

        if (moveLarge) {
            moveLarge.innerText = "—";
        }

        if (moveArrow) {
            moveArrow.innerText = "";
        }

        if (explanationElement) {

            explanationElement.innerText =
                "Enter a cube and solve it to see the steps.";

        }

        return;
    }


    if (currentStep >= total) {

        if (moveLarge) {

            moveLarge.innerText =
                "✓";

        }

        if (moveArrow) {

            moveArrow.innerText =
                "";

        }

        if (explanationElement) {

            explanationElement.innerText =
                "Cube solved!";

        }

        if (finishElement) {

            finishElement.style.display =
                "block";

        }

        return;
    }


    const move =
        solutionMoves[currentStep];


    if (moveLarge) {

        moveLarge.innerText =
            move;

    }


    if (moveArrow) {

        moveArrow.innerText =
            "→";

    }


    if (explanationElement) {

        explanationElement.innerText =
            explainMove(move);

    }


    if (finishElement) {

        finishElement.style.display =
            "none";

    }
}




function explainMove(move) {

    const explanations = {

        U:
            "Turn the top face clockwise.",

        "U'":
            "Turn the top face counter-clockwise.",

        U2:
            "Turn the top face twice.",

        R:
            "Turn the right face clockwise.",

        "R'":
            "Turn the right face counter-clockwise.",

        R2:
            "Turn the right face twice.",

        F:
            "Turn the front face clockwise.",

        "F'":
            "Turn the front face counter-clockwise.",

        F2:
            "Turn the front face twice.",

        D:
            "Turn the bottom face clockwise.",

        "D'":
            "Turn the bottom face counter-clockwise.",

        D2:
            "Turn the bottom face twice.",

        L:
            "Turn the left face clockwise.",

        "L'":
            "Turn the left face counter-clockwise.",

        L2:
            "Turn the left face twice.",

        B:
            "Turn the back face clockwise.",

        "B'":
            "Turn the back face counter-clockwise.",

        B2:
            "Turn the back face twice."

    };


    return (
        explanations[move] ||
        "Perform move " + move + "."
    );
}




createCube();

loadSolverLibrary();

updateStepDisplay();


const demoColors = {

    U: "#FFD800",   // Yellow
    R: "#E53935",   // Red
    F: "#1976D2",   // Blue
    D: "#FFFFFF",   // White
    L: "#FF8C00",   // Orange
    B: "#22A447"    // Green

};


/* =========================================================
   FACELET COORDINATES
========================================================= */

function faceletCoordinate(face, index) {

    const row =
        Math.floor(index / 3);

    const col =
        index % 3;


    let x = 0;
    let y = 0;
    let z = 0;


    if (face === "F") {

        x = col - 1;
        y = 1 - row;
        z = 1;

    }


    else if (face === "B") {

        x = 1 - col;
        y = 1 - row;
        z = -1;

    }


    else if (face === "R") {

        x = 1;
        y = 1 - row;
        z = 1 - col;

    }


    else if (face === "L") {

        x = -1;
        y = 1 - row;
        z = col - 1;

    }


    else if (face === "U") {

        x = col - 1;
        y = 1;
        z = row - 1;

    }


    else if (face === "D") {

        x = col - 1;
        y = -1;
        z = 1 - row;

    }


    return {
        x,
        y,
        z
    };
}



function buildCubieData(state) {

    const cubies = {};


    const faces = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    for (const face of faces) {

        for (let index = 0; index < 9; index++) {

            const color =
                state[face][index];


            if (!color) {
                continue;
            }


            const position =
                faceletCoordinate(
                    face,
                    index
                );


            const key =
                position.x +
                "," +
                position.y +
                "," +
                position.z;


            if (!cubies[key]) {

                cubies[key] = {

                    x: position.x,
                    y: position.y,
                    z: position.z,

                    stickers: {}

                };

            }


            cubies[key].stickers[face] =
                color;

        }

    }


    return Object.values(cubies);
}




function createVisualCubie(data) {

    const cubie =
        document.createElement("div");

    cubie.className =
        "demo-cubie";


    cubie.style.position =
        "absolute";


    cubie.dataset.x =
        data.x;

    cubie.dataset.y =
        data.y;

    cubie.dataset.z =
        data.z;


    

    const size = 60;


    cubie.style.width =
        size + "px";

    cubie.style.height =
        size + "px";


    cubie.style.transformStyle =
        "preserve-3d";


    

    const px =
        data.x * size;

    const py =
        -data.y * size;

    const pz =
        data.z * size;


    cubie.style.transform =
        "translate3d(" +
        px +
        "px, " +
        py +
        "px, " +
        pz +
        "px)";


  

    const stickers = [

        {
            face: "F",
            transform:
                "translateZ(" +
                (size / 2) +
                "px)"
        },

        {
            face: "B",
            transform:
                "rotateY(180deg) translateZ(" +
                (size / 2) +
                "px)"
        },

        {
            face: "R",
            transform:
                "rotateY(90deg) translateZ(" +
                (size / 2) +
                "px)"
        },

        {
            face: "L",
            transform:
                "rotateY(-90deg) translateZ(" +
                (size / 2) +
                "px)"
        },

        {
            face: "U",
            transform:
                "rotateX(90deg) translateZ(" +
                (size / 2) +
                "px)"
        },

        {
            face: "D",
            transform:
                "rotateX(-90deg) translateZ(" +
                (size / 2) +
                "px)"
        }

    ];


    stickers.forEach(function(info) {

        const sticker =
            document.createElement("div");

        sticker.className =
            "demo-sticker";


        sticker.style.position =
            "absolute";


        sticker.style.width =
            size + "px";

        sticker.style.height =
            size + "px";


        sticker.style.transform =
            info.transform;


        sticker.style.backfaceVisibility =
            "hidden";


        sticker.style.background =
            demoColors[
                data.stickers[info.face] ||
                "B"
            ];


        sticker.style.border =
            "2px solid rgba(0,0,0,0.35)";


        if (!data.stickers[info.face]) {

            sticker.style.background =
                "#111";

        }


        cubie.appendChild(
            sticker
        );

    });


    return cubie;
}



function renderDemoCube() {

    if (!demoCubeElement) {
        return;
    }


    demoCubeElement.innerHTML =
        "";


    const state =
        demoState ||
        cubeState;


    const cubies =
        buildCubieData(state);


    cubies.forEach(function(data) {

        const cubie =
            createVisualCubie(data);


        demoCubeElement.appendChild(
            cubie
        );

    });
}




function setDemoState(state) {

    demoState =
        copyCubeState(state);


    renderDemoCube();
}



function getDemoCubies() {

    if (!demoCubeElement) {
        return [];
    }


    return Array.from(
        demoCubeElement.querySelectorAll(
            ".demo-cubie"
        )
    );
}



function getMoveInformation(move) {

    const base =
        move
            .replace("'", "")
            .replace("2", "");


    const clockwise =
        !move.includes("'");


    let axis = "y";
    let layer = 1;
    let direction = 1;




    if (base === "R") {

        axis = "x";
        layer = 1;
        direction = clockwise
            ? 1
            : -1;

    }


    else if (base === "L") {

        axis = "x";
        layer = -1;
        direction = clockwise
            ? -1
            : 1;

    }


    

    else if (base === "U") {

        axis = "y";
        layer = 1;
        direction = clockwise
            ? 1
            : -1;

    }


    else if (base === "D") {

        axis = "y";
        layer = -1;
        direction = clockwise
            ? -1
            : 1;

    }


    

    else if (base === "F") {

        axis = "z";
        layer = 1;
        direction = clockwise
            ? -1
            : 1;

    }


    else if (base === "B") {

        axis = "z";
        layer = -1;
        direction = clockwise
            ? 1
            : -1;

    }


    let turns = 1;


    if (move.includes("2")) {
        turns = 2;
    }


    return {

        axis,
        layer,
        direction,
        turns

    };
}



function getMoveCubies(move) {

    const info =
        getMoveInformation(move);


    const cubies =
        getDemoCubies();


    return cubies.filter(
        function(cubie) {

            const value =
                Number(
                    cubie.dataset[
                        info.axis
                    ]
                );


            return value === info.layer;

        }
    );
}



function createAnimationLayer(cubies) {

    if (!demoCubeElement) {
        return null;
    }


    const layer =
        document.createElement("div");


    layer.className =
        "demo-animation-layer";


    layer.style.position =
        "absolute";


    layer.style.width =
        "0px";

    layer.style.height =
        "0px";


    layer.style.left =
        "50%";

    layer.style.top =
        "50%";


    layer.style.transformStyle =
        "preserve-3d";


    layer.style.pointerEvents =
        "none";


    demoCubeElement.appendChild(
        layer
    );


    cubies.forEach(
        function(cubie) {

            layer.appendChild(
                cubie
            );

        }
    );


    return layer;
}



function animateMove(move, callback) {

    if (animating) {
        return;
    }


    animating = true;


    const info =
        getMoveInformation(move);


    const cubies =
        getMoveCubies(move);


    if (!cubies.length) {

        animating = false;

        if (callback) {
            callback();
        }

        return;
    }


    const layer =
        createAnimationLayer(
            cubies
        );


    if (!layer) {

        animating = false;

        if (callback) {
            callback();
        }

        return;
    }


    demoLayer =
        layer;


    const degrees =
        90 *
        info.direction *
        info.turns;


    const duration =
        550 *
        info.turns;


    layer.style.transition =
        "transform " +
        duration +
        "ms cubic-bezier(" +
        "0.22, 0.61, 0.36, 1)";


   

    layer.offsetHeight;


    if (info.axis === "x") {

        layer.style.transform =
            "rotateX(" +
            degrees +
            "deg)";

    }


    else if (info.axis === "y") {

        layer.style.transform =
            "rotateY(" +
            degrees +
            "deg)";

    }


    else {

        layer.style.transform =
            "rotateZ(" +
            degrees +
            "deg)";

    }


    setTimeout(
        function() {

         

            if (
                currentStep <
                solutionStates.length
            ) {

                demoState =
                    copyCubeState(
                        solutionStates[
                            currentStep
                        ]
                    );

            }


            if (layer.parentNode) {

                layer.parentNode.removeChild(
                    layer
                );

            }


            demoLayer = null;

            animating = false;


            renderDemoCube();


            if (callback) {
                callback();
            }

        },
        duration + 40
    );
}



function playCurrentMove() {

    if (
        !solutionMoves.length ||
        currentStep >= solutionMoves.length
    ) {

        updateStepDisplay();

        return;
    }


    const move =
        solutionMoves[currentStep];


    animateMove(
        move,
        function() {

            currentStep++;

            updateStepDisplay();

        }
    );
}



function nextStep() {

    if (animating) {
        return;
    }


    if (
        !solutionMoves.length
    ) {
        return;
    }


    if (
        currentStep >=
        solutionMoves.length
    ) {

        return;
    }


    playCurrentMove();
}




function previousStep() {

    if (animating) {
        return;
    }


    if (
        currentStep <= 0
    ) {

        return;
    }


    currentStep--;


    if (
        solutionStates[
            currentStep
        ]
    ) {

        demoState =
            copyCubeState(
                solutionStates[
                    currentStep
                ]
            );

    }


    renderDemoCube();

    updateStepDisplay();
}




if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextStep
    );

}


if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousStep
    );

}




document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowRight"
        ) {

            nextStep();

        }


        if (
            event.key === "ArrowLeft"
        ) {

            previousStep();

        }

    }
);



function initializeDemo() {

    if (!demoCubeElement) {
        return;
    }


    demoState =
        copyCubeState(
            cubeState
        );


    renderDemoCube();
}


initializeDemo();



function syncDemoWithCurrentState() {

    if (!cubeState) {
        return;
    }


    demoState =
        copyCubeState(
            cubeState
        );


    renderDemoCube();
}




function resetDemoToEnteredCube() {

    if (!enteredCubeState) {

        demoState =
            copyCubeState(
                cubeState
            );

    }

    else {

        demoState =
            copyCubeState(
                enteredCubeState
            );

    }


    currentStep = 0;


    renderDemoCube();

    updateStepDisplay();
}




function showSolutionState(step) {

    if (
        !solutionStates ||
        !solutionStates.length
    ) {

        return;
    }


    if (
        step < 0 ||
        step >= solutionStates.length
    ) {

        return;
    }


    demoState =
        copyCubeState(
            solutionStates[step]
        );


    renderDemoCube();
}

function isSolutionFinished() {

    return (
        solutionMoves.length > 0 &&
        currentStep >=
        solutionMoves.length
    );
}



function updateNavigationButtons() {

    if (previousButton) {

        previousButton.disabled =
            currentStep <= 0 ||
            animating;

    }


    if (nextButton) {

        nextButton.disabled =
            currentStep >=
            solutionMoves.length ||
            animating;

    }
}




function updateStepDisplayWithButtons() {

    updateStepDisplay();

    updateNavigationButtons();
}



const originalUpdateStepDisplay =
    updateStepDisplay;


function refreshStepDisplay() {

    originalUpdateStepDisplay();

    updateNavigationButtons();
}





function saveEnteredCube() {

    enteredCubeState =
        copyCubeState(
            cubeState
        );


    demoState =
        copyCubeState(
            enteredCubeState
        );


    renderDemoCube();
}



function isCubeComplete() {

    const faces = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    for (const face of faces) {

        for (
            const sticker
            of cubeState[face]
        ) {

            if (!sticker) {
                return false;
            }

        }

    }


    return true;
}



function getColorCounts(state = cubeState) {

    const counts = {

        U: 0,
        R: 0,
        F: 0,
        D: 0,
        L: 0,
        B: 0

    };


    const faces = [
        "U",
        "R",
        "F",
        "D",
        "L",
        "B"
    ];


    for (const face of faces) {

        for (
            const color
            of state[face]
        ) {

            if (
                color &&
                counts[color] !== undefined
            ) {

                counts[color]++;

            }

        }

    }


    return counts;
}


function updateColorCountDisplay() {

    const counts =
        getColorCounts();


    const elements =
        document.querySelectorAll(
            "[data-color-count]"
        );


    elements.forEach(
        function(element) {

            const color =
                element.dataset.colorCount;


            if (
                counts[color] !== undefined
            ) {

                element.innerText =
                    counts[color];

            }

        }
    );
}




const originalPaintSticker =
    paintSticker;


paintSticker = function(
    face,
    index
) {

    originalPaintSticker(
        face,
        index
    );


    updateColorCountDisplay();

};




const originalClearCube =
    clearCube;


clearCube = function() {

    originalClearCube();

    updateColorCountDisplay();

    updateNavigationButtons();

};




const originalSolveCube =
    solveCube;


solveCube = function() {

    originalSolveCube();

    updateColorCountDisplay();

    updateNavigationButtons();

};


/* =========================================================
   RE-ATTACH SOLVE BUTTON
========================================================= */

if (solveButton) {

    solveButton.onclick = null;

    solveButton.addEventListener(
        "click",
        function() {

            /*
               Take the exact user input
               before starting the solver.
            */

            if (isCubeComplete()) {

                enteredCubeState =
                    copyCubeState(
                        cubeState
                    );

            }


            originalSolveCube();

            updateColorCountDisplay();

            updateNavigationButtons();

        }
    );

}


/* =========================================================
   RE-ATTACH CLEAR BUTTON
========================================================= */

if (clearButton) {

    clearButton.onclick = null;

    clearButton.addEventListener(
        "click",
        function() {

            originalClearCube();

            updateColorCountDisplay();

            updateNavigationButtons();

        }
    );

}




document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateColorCountDisplay();

        updateNavigationButtons();

        renderCube();

        renderDemoCube();

    }
);



window.addEventListener(
    "resize",
    function() {

        if (demoCubeElement) {

            renderDemoCube();

        }

    }
);




(function initializeRubiksSolver() {

    try {

        renderCube();

        updateColorCountDisplay();

        initializeDemo();

        updateNavigationButtons();

    }

    catch (error) {

        console.error(
            "Rubik's Cube initialization error:",
            error
        );

    }

})();

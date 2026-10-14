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

let solutionStates = [];

let currentStep = 0;

let solverReady = false;

let enteredCubeState = null;



let demoState = null;

let demoCubeElement = null;

let demoScene = null;

let demoLayer = null;

let animating = false;




let rotationX = -25;

let rotationY = -35;

let dragging = false;

let lastX = 0;

let lastY = 0;




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


demoCubeElement =
    document.getElementById("demoCube");




let selectedColor = null;




const demoColors = {

    U: "#f5d742",
    R: "#D92525",
    F: "#1769D2",
    D: "#F5F5F5",
    L: "#F28A18",
    B: "#20A447"

};




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
        (
            button.innerText ||
            button.textContent ||
            ""
        )
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




function selectColor(
    color,
    clickedButton = null
) {

    if (!colorNames[color]) {
        return;
    }


    selectedColor = color;


    document
        .querySelectorAll(".palette-color")
        .forEach(function(button) {

            button.classList.remove(
                "selected"
            );

        });


    if (clickedButton) {

        clickedButton.classList.add(
            "selected"
        );

    }


    if (selectedColorText) {

        selectedColorText.innerText =
            colorNames[color] +
            " selected";

    }

}




document
    .querySelectorAll(".palette-color")
    .forEach(function(button) {

        const color =
            detectButtonColor(button);


        if (color) {

            button.dataset.color =
                color;

        }


        button.addEventListener(
            "click",
            function() {

                const detected =
                    detectButtonColor(
                        button
                    );


                if (!detected) {

                    return;

                }


                selectColor(
                    detected,
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
        document.querySelectorAll(
            ".face"
        );


    faces.forEach(function(face) {

        const faceName =
            face.dataset.face;


        face.innerHTML =
            "<h3>" +
            getFaceName(faceName) +
            "</h3>";


        for (
            let i = 0;
            i < 9;
            i++
        ) {

            const sticker =
                document.createElement(
                    "div"
                );


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


            face.appendChild(
                sticker
            );

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
                face.querySelectorAll(
                    ".sticker"
                );


            stickers.forEach(
                function(
                    sticker,
                    index
                ) {

                    sticker.className =
                        "sticker";


                    const color =
                        cubeState[
                            faceName
                        ][index];


                    if (color) {

                        sticker.classList.add(
                            "color-" +
                            color
                        );

                    }

                }
            );

        });

}




function paintSticker(
    face,
    index
) {

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

    updateColorCountDisplay();


    if (status) {

        status.innerText =
            colorNames[selectedColor] +
            " applied.";

    }

}



function getColorCounts(
    state = cubeState
) {

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


    faces.forEach(function(face) {

        state[face].forEach(
            function(color) {

                if (
                    color &&
                    counts[color] !== undefined
                ) {

                    counts[color]++;

                }

            }
        );

    });


    return counts;

}




function updateColorCountDisplay() {

    const counts =
        getColorCounts();


    document
        .querySelectorAll(
            "[data-color-count]"
        )
        .forEach(function(element) {

            const color =
                element.dataset.colorCount;


            if (
                counts[color] !== undefined
            ) {

                element.innerText =
                    counts[color];

            }

        });

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



function validateCube() {

    const faces = [

        "U",
        "R",
        "F",
        "D",
        "L",
        "B"

    ];


    const counts =
        getColorCounts();


    for (const face of faces) {

        if (
            counts[face] !== 9
        ) {

            return {

                valid: false,

                message:
                    colorNames[face] +
                    " must appear exactly 9 times. " +
                    "Currently: " +
                    counts[face] +
                    "."

            };

        }

    }


    return {

        valid: true,

        message:
            "Cube is valid."

    };

}



function createCenterColorMap(state) {

    const map = {};


    const faces = [

        "U",
        "R",
        "F",
        "D",
        "L",
        "B"

    ];


    for (const face of faces) {

        const center =
            state[face][4];


        if (!center) {

            return null;

        }


        map[center] =
            face;

    }


    return map;

}



function createNormalizedFaceletString(
    state
) {

    const centerMap =
        createCenterColorMap(
            state
        );


    if (!centerMap) {

        return null;

    }


    const faces = [

        "U",
        "R",
        "F",
        "D",
        "L",
        "B"

    ];


    let result = "";


    for (const face of faces) {

        for (
            const color
            of state[face]
        ) {

            if (!color) {

                return null;

            }


            const mapped =
                centerMap[color];


            if (!mapped) {

                return null;

            }


            result += mapped;

        }

    }


    return result;

}



function loadSolverLibrary() {

    if (
        typeof Cube ===
        "undefined"
    ) {

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

        if (
            !solverReady
        ) {

            Cube.initSolver();

            solverReady = true;

        }


        return true;

    }

    catch (error) {

        console.error(
            "Solver initialization failed:",
            error
        );


        if (status) {

            status.innerText =
                "Solver initialization failed.";

        }


        return false;

    }

}



function rotateFaceClockwise(
    face
) {

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



function applyMoveToState(
    state,
    move
) {

    const baseMove =
        move
            .replace("'", "")
            .replace("2", "");


    let repetitions = 1;


    if (
        move.includes("2")
    ) {

        repetitions = 2;

    }


    else if (
        move.includes("'")
    ) {

        repetitions = 3;

    }


    for (
        let i = 0;
        i < repetitions;
        i++
    ) {

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




function buildSolutionStates(
    startState,
    moves
) {

    const states = [];

    const normalizedStart =
        createNormalizedFaceletString(
            startState
        );

    if (!normalizedStart) {

        return states;

    }


    const solverCube =
        Cube.fromString(
            normalizedStart
        );


    const centerMap =
        createCenterColorMap(
            startState
        );

    if (!centerMap) {

        return states;

    }


    const reverseMap = {};

    for (const color in centerMap) {

        const face =
            centerMap[color];

        reverseMap[face] =
            color;

    }



    function convertSolverState(
        faceletString
    ) {

        const faces = [
            "U",
            "R",
            "F",
            "D",
            "L",
            "B"
        ];

        const result = {};

        let index = 0;


        for (const face of faces) {

            result[face] = [];

            for (let i = 0; i < 9; i++) {

                const solverFace =
                    faceletString[index++];

                const actualColor =
                    reverseMap[solverFace];

                result[face].push(
                    actualColor
                );

            }

        }


        return result;

    }


    

    states.push(
        copyCubeState(
            startState
        )
    );



    for (const move of moves) {

        solverCube.move(
            move
        );


        const solverState =
            solverCube.asString();


        const visualState =
            convertSolverState(
                solverState
            );


        states.push(
            visualState
        );

    }


    return states;

}




function solveCube() {

    if (!loadSolverLibrary()) {
        return;
    }


    if (!isCubeComplete()) {

        if (status) {
            status.innerText =
                "Please fill every sticker before solving.";
        }

        return;
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



    const faceletString =
        createNormalizedFaceletString(
            cubeState
        );


    if (!faceletString) {

        if (status) {
            status.innerText =
                "Could not determine the cube's center colors.";
        }

        return;
    }


    let cube;

    try {

        cube =
            Cube.fromString(
                faceletString
            );

    }

    catch (error) {

        console.error(
            "Cube creation error:",
            error
        );

        if (status) {
            status.innerText =
                "Invalid cube configuration.";
        }

        return;
    }


    

    const solvedFaceletString =
        "UUUUUUUUU" +
        "RRRRRRRRR" +
        "FFFFFFFFF" +
        "DDDDDDDDD" +
        "LLLLLLLLL" +
        "BBBBBBBBB";


    if (
        faceletString ===
        solvedFaceletString
    ) {

        enteredCubeState =
            copyCubeState(
                cubeState
            );


        solutionMoves = [];

        solutionStates = [
            copyCubeState(
                cubeState
            )
        ];

        currentStep = 0;


        demoState =
            copyCubeState(
                cubeState
            );


        renderDemoCube();

        updateStepDisplay();

        updateNavigationButtons();


        if (status) {

            status.innerText =
                "Cube is already solved.";

        }

        return;
    }



    if (
        cube.asString() !==
        faceletString
    ) {

        if (status) {

            status.innerText =
                "This cube configuration is impossible. Check the corner and edge stickers.";

        }

        console.warn(
            "Impossible cube state:",
            faceletString
        );

        return;
    }



    enteredCubeState =
        copyCubeState(
            cubeState
        );


    try {



        const solution =
            cube.solve();


        if (
            solution === null ||
            solution === undefined
        ) {

            if (status) {

                status.innerText =
                    "No solution could be found for this cube.";

            }

            return;
        }



        solutionMoves =
            solution.trim()
                ? solution
                    .trim()
                    .split(/\s+/)
                : [];


        currentStep = 0;



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

        updateNavigationButtons();


        if (status) {

            status.innerText =
                solutionMoves.length === 0
                    ? "Cube is already solved."
                    : "Solution found.";

        }

    }

    catch (error) {

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

    demoLayer = null;

    animating = false;


    renderCube();

    updateColorCountDisplay();

    updateStepDisplay();

    updateNavigationButtons();


    selectedColor = null;


    if (selectedColorText) {

        selectedColorText.innerText =
            "Select a color first";

    }


    document
        .querySelectorAll(
            ".palette-color"
        )
        .forEach(function(button) {

            button.classList.remove(
                "selected"
            );

        });


    if (finishElement) {

        finishElement.style.display =
            "none";

    }


    if (demoCubeElement) {

        demoCubeElement.innerHTML =
            "";

    }


    if (status) {

        status.innerText =
            "Cube cleared.";

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


    if (
        total === 0
    ) {

        if (stepElement) {

            stepElement.innerText =
                "Enter your physical cube.";

        }


        if (moveLarge) {

            moveLarge.innerText =
                "—";

        }


        if (moveArrow) {

            moveArrow.innerText =
                "";

        }


        if (explanationElement) {

            explanationElement.innerText =
                "Enter a cube and solve it to see the steps.";

        }


        if (finishElement) {

            finishElement.style.display =
                "none";

        }


        return;

    }


    if (
        currentStep >= total
    ) {

        if (stepElement) {

            stepElement.innerText =
                "Finished";

        }


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
        solutionMoves[
            currentStep
        ];


    if (stepElement) {

        stepElement.innerText =
            "Step " +
            (currentStep + 1);

    }


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



function installDemoStyles() {

    if (
        document.getElementById(
            "cubeXProfessionalStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "cubeXProfessionalStyles";


    style.textContent = `

        #demoCube {

            position: relative !important;

            width: 180px !important;

            height: 180px !important;

            transform-style:
                preserve-3d !important;

            transform-origin:
                50% 50% 0;

            transform:
                rotateX(-25deg)
                rotateY(-35deg);

            user-select: none;

            touch-action: none;

            cursor: grab;

        }


        #demoCube:active {

            cursor: grabbing;

        }


        .cubeX-demo-scene {

            position: absolute;

            left: 50%;

            top: 50%;

            width: 0;

            height: 0;

            transform-style:
                preserve-3d;

        }


        .cubeX-demo-layer {

            position: absolute;

            left: 0;

            top: 0;

            width: 0;

            height: 0;

            transform-style:
                preserve-3d;

            transform-origin:
                0 0 0;

            pointer-events:
                none;

            will-change:
                transform;

        }


        .cubeX-demo-cubie {

            position: absolute;

            left: 0;

            top: 0;

            width: 52px;

            height: 52px;

            margin-left: -26px;

            margin-top: -26px;

            transform-style:
                preserve-3d;

            backface-visibility:
                visible;

        }


        .cubeX-demo-face {

            position: absolute;

            left: 0;

            top: 0;

            width: 52px;

            height: 52px;

            box-sizing: border-box;

            border:
                4px solid #111;

            border-radius:
                7px;

            backface-visibility:
                hidden;

            box-shadow:

                inset
                0 1px 1px
                rgba(255,255,255,0.25),

                inset
                0 -4px 7px
                rgba(0,0,0,0.18),

                0 0 1px
                rgba(0,0,0,0.5);

        }


        .cubeX-demo-face.U {

            background:
                ${demoColors.U};

        }


        .cubeX-demo-face.R {

            background:
                ${demoColors.R};

        }


        .cubeX-demo-face.F {

            background:
                ${demoColors.F};

        }


        .cubeX-demo-face.D {

            background:
                ${demoColors.D};

        }


        .cubeX-demo-face.L {

            background:
                ${demoColors.L};

        }


        .cubeX-demo-face.B {

            background:
                ${demoColors.B};

        }

    `;


    document.head.appendChild(
        style
    );

}



function faceletCoordinate(
    face,
    index
) {

    const row =
        Math.floor(
            index / 3
        );


    const col =
        index % 3;


    let x = 0;

    let y = 0;

    let z = 0;


    if (
        face === "F"
    ) {

        x = col - 1;

        y = 1 - row;

        z = 1;

    }


    else if (
        face === "B"
    ) {

        x = 1 - col;

        y = 1 - row;

        z = -1;

    }


    else if (
        face === "R"
    ) {

        x = 1;

        y = 1 - row;

        z = 1 - col;

    }


    else if (
        face === "L"
    ) {

        x = -1;

        y = 1 - row;

        z = col - 1;

    }


    else if (
        face === "U"
    ) {

        x = col - 1;

        y = 1;

        z = row - 1;

    }


    else if (
        face === "D"
    ) {

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


function buildCubieData(
    state
) {

    const cubies = {};


    const faces = [

        "U",
        "R",
        "F",
        "D",
        "L",
        "B"

    ];


    faces.forEach(
        function(face) {

            state[face].forEach(
                function(
                    color,
                    index
                ) {

                    if (!color) {
                        return;
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

                            x:
                                position.x,

                            y:
                                position.y,

                            z:
                                position.z,

                            stickers: {}

                        };

                    }


                    cubies[key]
                        .stickers[face] =
                        color;

                }
            );

        }
    );


    return Object.values(
        cubies
    );

}



function createVisualCubie(
    data
) {

    const cubie =
        document.createElement(
            "div"
        );


    cubie.className =
        "cubeX-demo-cubie";


    cubie.dataset.x =
        data.x;

    cubie.dataset.y =
        data.y;

    cubie.dataset.z =
        data.z;


    const step =
        55;


    cubie.style.transform =

        "translate3d(" +

        (
            data.x *
            step
        ) +

        "px, " +

        (
            -data.y *
            step
        ) +

        "px, " +

        (
            data.z *
            step
        ) +

        "px)";


    const faces = [

        {
            name: "F",

            transform:
                "translateZ(26px)"

        },

        {
            name: "B",

            transform:
                "rotateY(180deg) translateZ(26px)"

        },

        {
            name: "R",

            transform:
                "rotateY(90deg) translateZ(26px)"

        },

        {
            name: "L",

            transform:
                "rotateY(-90deg) translateZ(26px)"

        },

        {
            name: "U",

            transform:
                "rotateX(90deg) translateZ(26px)"

        },

        {
            name: "D",

            transform:
                "rotateX(-90deg) translateZ(26px)"

        }

    ];


    faces.forEach(
        function(info) {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cubeX-demo-face " +
                info.name;


            element.style.transform =
                info.transform;


            const color =
                data.stickers[
                    info.name
                ];


            if (color) {

                element.style.background =
                    demoColors[color];

            }

            else {

                element.style.background =
                    "#101010";

            }


            cubie.appendChild(
                element
            );

        }
    );


    return cubie;

}



function renderDemoCube() {

    if (
        !demoCubeElement
    ) {

        return;

    }


    installDemoStyles();


    demoCubeElement.innerHTML =
        "";


    demoScene =
        document.createElement(
            "div"
        );


    demoScene.className =
        "cubeX-demo-scene";


    demoCubeElement.appendChild(
        demoScene
    );


    const state =
        demoState ||
        cubeState;


    const cubies =
        buildCubieData(
            state
        );


    cubies.forEach(
        function(data) {

            demoScene.appendChild(

                createVisualCubie(
                    data
                )

            );

        }
    );


    applyViewRotation();

}


function setDemoState(
    state
) {

    if (!state) {
        return;
    }


    demoState =
        copyCubeState(
            state
        );


    renderDemoCube();

}


function applyViewRotation() {

    if (
        !demoCubeElement
    ) {

        return;

    }


    demoCubeElement.style.transform =

        "rotateX(" +
        rotationX +
        "deg) " +

        "rotateY(" +
        rotationY +
        "deg)";

}



if (
    demoCubeElement
) {

    demoCubeElement.addEventListener(
        "mousedown",
        function(event) {

            if (animating) {
                return;
            }


            dragging = true;


            lastX =
                event.clientX;

            lastY =
                event.clientY;

        }
    );

}


document.addEventListener(
    "mouseup",
    function() {

        dragging = false;

    }
);


document.addEventListener(
    "mousemove",
    function(event) {

        if (
            !dragging ||
            animating
        ) {

            return;

        }


        const dx =
            event.clientX -
            lastX;


        const dy =
            event.clientY -
            lastY;


        rotationY +=
            dx * 0.45;


        rotationX -=
            dy * 0.45;


        rotationX =
            Math.max(
                -70,
                Math.min(
                    70,
                    rotationX
                )
            );


        lastX =
            event.clientX;


        lastY =
            event.clientY;


        applyViewRotation();

    }
);



if (
    demoCubeElement
) {

    demoCubeElement.addEventListener(
        "touchstart",
        function(event) {

            if (
                animating ||
                !event.touches.length
            ) {

                return;

            }


            dragging = true;


            lastX =
                event.touches[0]
                    .clientX;


            lastY =
                event.touches[0]
                    .clientY;

        },
        {
            passive: true
        }
    );

}


document.addEventListener(
    "touchend",
    function() {

        dragging = false;

    }
);


document.addEventListener(
    "touchmove",
    function(event) {

        if (
            !dragging ||
            animating ||
            !event.touches.length
        ) {

            return;

        }


        const touch =
            event.touches[0];


        const dx =
            touch.clientX -
            lastX;


        const dy =
            touch.clientY -
            lastY;


        rotationY +=
            dx * 0.45;


        rotationX -=
            dy * 0.45;


        rotationX =
            Math.max(
                -70,
                Math.min(
                    70,
                    rotationX
                )
            );


        lastX =
            touch.clientX;


        lastY =
            touch.clientY;


        applyViewRotation();

    },
    {
        passive: true
    }
);


function getMoveInformation(
    move
) {

    const base =
        move
            .replace("'", "")
            .replace("2", "");


    const prime =
        move.includes("'");


    let axis = "y";

    let layer = 1;

    let direction = 1;


    if (
        base === "R"
    ) {

        axis = "x";

        layer = 1;

        direction =
            prime ? -1 : 1;

    }


    else if (
        base === "L"
    ) {

        axis = "x";

        layer = -1;

        direction =
            prime ? 1 : -1;

    }


    else if (
        base === "U"
    ) {

        axis = "y";

        layer = 1;

        direction =
            prime ? -1 : 1;

    }


    else if (
        base === "D"
    ) {

        axis = "y";

        layer = -1;

        direction =
            prime ? 1 : -1;

    }


    else if (
        base === "F"
    ) {

        axis = "z";

        layer = 1;

        direction =
            prime ? 1 : -1;

    }


    else if (
        base === "B"
    ) {

        axis = "z";

        layer = -1;

        direction =
            prime ? -1 : 1;

    }


    let turns = 1;


    if (
        move.includes("2")
    ) {

        turns = 2;

    }


    return {

        axis,
        layer,
        direction,
        turns

    };

}


function getMoveCubies(
    move
) {

    if (!demoScene) {
        return [];
    }


    const info =
        getMoveInformation(
            move
        );


    const cubies =
        Array.from(

            demoScene.querySelectorAll(
                ".cubeX-demo-cubie"
            )

        );


    return cubies.filter(
        function(cubie) {

            return (

                Number(
                    cubie.dataset[
                        info.axis
                    ]
                )

                ===

                info.layer

            );

        }
    );

}



function createAnimationLayer(
    cubies
) {

    if (!demoScene) {
        return null;
    }


    const layer =
        document.createElement(
            "div"
        );


    layer.className =
        "cubeX-demo-layer";


    demoScene.appendChild(
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


function animateMove(
    move,
    callback
) {

    if (
        animating ||
        !demoScene
    ) {

        return;

    }


    animating = true;


    updateNavigationButtons();


    const info =
        getMoveInformation(
            move
        );


    const cubies =
        getMoveCubies(
            move
        );


    if (
        cubies.length !== 9
    ) {

        console.error(

            "CubeX animation error:",

            "Expected 9 cubies, found",
            cubies.length,

            "for move",
            move

        );


        animating = false;

        updateNavigationButtons();

        return;

    }


    const layer =
        createAnimationLayer(
            cubies
        );


    if (!layer) {

        animating = false;

        updateNavigationButtons();

        return;

    }


    demoLayer =
        layer;


    const degrees =

        90 *
        info.direction *
        info.turns;


    const duration =

        info.turns === 2

            ? 720

            : 520;


    const start =
        performance.now();


    function easeInOutCubic(t) {

        return t < 0.5

            ? 4 *
              t *
              t *
              t

            : 1 -
              Math.pow(
                  -2 * t + 2,
                  3
              ) / 2;

    }


    function animateFrame(
        now
    ) {

        const progress =

            Math.min(

                1,

                (
                    now -
                    start
                ) /
                duration

            );


        const eased =
            easeInOutCubic(
                progress
            );


        const angle =
            degrees *
            eased;


        if (
            info.axis === "x"
        ) {

            layer.style.transform =
                "rotateX(" +
                angle +
                "deg)";

        }


        else if (
            info.axis === "y"
        ) {

            layer.style.transform =
                "rotateY(" +
                angle +
                "deg)";

        }


        else {

            layer.style.transform =
                "rotateZ(" +
                angle +
                "deg)";

        }


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                animateFrame
            );

            return;

        }


        

        if (
            layer.parentNode
        ) {

            layer.parentNode.removeChild(
                layer
            );

        }


        demoLayer = null;


        if (
            solutionStates[
                currentStep + 1
            ]
        ) {

            demoState =
                copyCubeState(

                    solutionStates[
                        currentStep + 1
                    ]

                );

        }


        animating = false;


        renderDemoCube();


        updateNavigationButtons();


        if (callback) {

            callback();

        }

    }


    requestAnimationFrame(
        animateFrame
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


    const move =
        solutionMoves[
            currentStep
        ];


    animateMove(
        move,
        function() {

            currentStep++;

            updateStepDisplay();

            updateNavigationButtons();

        }
    );

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

    updateNavigationButtons();

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
            event.key ===
            "ArrowRight"
        ) {

            nextStep();

        }


        else if (
            event.key ===
            "ArrowLeft"
        ) {

            previousStep();

        }

    }
);



function initializeDemo() {

    if (
        !demoCubeElement
    ) {

        return;

    }


    installDemoStyles();


    demoState =
        copyCubeState(
            cubeState
        );


    renderDemoCube();

}


createCube();

initializeDemo();

updateColorCountDisplay();

updateStepDisplay();

updateNavigationButtons();

loadSolverLibrary();

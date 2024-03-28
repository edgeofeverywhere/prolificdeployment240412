import { initJsPsych } from 'jspsych';
import 'jspsych/css/jspsych.css';
import './styles/grid.css';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import 'ndarray';
import 'ndarray-ops';
import gaussian from 'gaussian'; 

// globals 
let imageLocations = [];
let isMask = false;
let correctJudgement = '';
let feedback = '';
let isPractice = false; // until practice procedure finalized - do not switch
let stimulusDuration = 500
let numofBreaks = 1; // temporary pokerap easteregg
let currentBlockDef = [];
let blockorder = [];
let experimental_trajectory = [];

//!! MASK DRAWING MATH !!

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateNoisyGreyscaleImage(width, height) {
    var image = new Array(height).fill(null).map(() => new Array(width).fill(0));
    // new greyscale image array
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            image[y][x] = Math.floor(Math.random() * 256); // random value between 0 and 255 (since rgb values have a max of 255!)
        }
    }
    // distribution parameters
    var distribution = gaussian(0, 30); // we will play around with this 
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            var noise = Math.round(distribution.ppf(Math.random())); // generates the dist
            image[y][x] = Math.max(0, Math.min(255, image[y][x] + noise));
        }
    }
    return image;
}

function imageDataUrl(image) {
  const width = image[0].length;
  const height = image.length;
  // makes a canvas element to display the mask
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // now draw the image
  var imageData = context.createImageData(width, height);
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const value = image[y][x];
          // set each image channel
          imageData.data[(y * width + x) * 4] = value; // Red channel
          imageData.data[(y * width + x) * 4 + 1] = value; // Green channel
          imageData.data[(y * width + x) * 4 + 2] = value; // Blue channel
          imageData.data[(y * width + x) * 4 + 3] = 255; // Alpha channel (opaque)
      }
  }
  context.putImageData(imageData, 0, 0);
  // returns embedded
  return canvas.toDataURL('image/png');
}

// !! MASK RENDER SETTINGS !! 
const maskImages = [];
const width = 338;
const height = 210;
for (let i = 0; i < 50; i++) {
    const noisyGreyscaleImage = generateNoisyGreyscaleImage(width, height);
    const RenderedMasks = imageDataUrl(noisyGreyscaleImage);
    maskImages.push(RenderedMasks);
}

// !! JSPSYCH INITIALIZE !!
const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.get().localSave('csv', 'results.csv');
    }
});

// !! MAIN EXPERIMENT HELPERS !!
function generateImagePaths(currentTrialType) {
    correctJudgement = judgements(currentTrialType);
    imageLocations.length = 0;
    if (isMask === true) {
        for (let i = 0; i < 9; i++) {    
        // shuffle wuffle!
            shuffleArray(maskImages);
            imageLocations.push(maskImages.slice(0, 1));
            }
        return imageLocations;
    } else {
    function randomDirection() {
        const randomDirectionInt = jsPsych.randomization.randomInt(0, 1);
        const randomDirection = randomDirectionInt === 0 ? 'Normal' : 'Reverse';
        return randomDirection;
    }

    function distractortrng() {
        const distractortrng = jsPsych.randomization.randomInt(1, 100);
        return distractortrng;
    }

    function targetrngBird() {
        const targetrngBird = jsPsych.randomization.randomInt(1, 30);
        return targetrngBird;
    }

    function targetrngGun() {
        const targetrngGun = jsPsych.randomization.randomInt(1, 40);
        return targetrngGun;
    }

    function targetrngPhone() {
        const targetrngPhone = jsPsych.randomization.randomInt(1, 31);
        return targetrngPhone;
    }

    function targetrngSpider() {
        const targetrngSpider = jsPsych.randomization.randomInt(1, 30);
        return targetrngSpider;
    }

    function innerforscopeRNG() {
        randomDirection();
        distractortrng();
    }
    // call them all/state them once!
    const randomDir = randomDirection();
    const targetRngBird = targetrngBird();
    const targetRngGun = targetrngGun();
    const targetRngPhone = targetrngPhone();
    const targetRngSpider = targetrngSpider();
    // switch and cases
    switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Gun${targetRngGun}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();        
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Ontogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Guns_White_${randomDir}/Phone${targetRngPhone}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_Nonthreat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/b${targetRngBird}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_Threat_target':
            imageLocations.push(`/img/Spiders_White_${randomDir}/s${targetRngSpider}.bmp`);
            for (let i = 0; i < 8; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        case 'Ontogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Guns_White_${randomDir}/Stapler${distractorTrng}.bmp`);
            }
            break;
        case 'Phylogenetic_Distractor_notarget':
            for (let i = 0; i < 9; i++) {
                const randomDir = randomDirection();
                const distractorTrng = distractortrng();
                innerforscopeRNG();
                imageLocations.push(`/img/Spiders_White_${randomDir}/bf${distractorTrng}.bmp`);
            }
            break;
        default:
            console.error('Unknown trial type:', currentTrialType);
            break;
    }
    }
    return imageLocations;
}

let target_location = 0

function randomizeTargetLocation() {
    const randomizeTargetLocation = jsPsych.randomization.randomInt(0, 9);
    return randomizeTargetLocation, target_location;
}

function judgements(currentTrialType) {
    switch(currentTrialType) {
    case 'Ontogenetic_Distractor_Threat_target':
    case 'Phylogenetic_Distractor_Threat_target':
        correctJudgement = 'q';
        return correctJudgement;
    case 'Ontogenetic_Distractor_Nonthreat_target':
    case 'Phylogenetic_Distractor_Nonthreat_target':
        correctJudgement = 'p';
        return correctJudgement;
    case 'Ontogenetic_Distractor_notarget':
    case 'Phylogenetic_Distractor_notarget':
        correctJudgement = 'space';
        return correctJudgement;
    
    }}

function addGridItem(imageLocation, position, totalImages, callback) {
    const gridContainer = document.getElementById('grid-container');
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    
    // Create an image element
    const image = new Image();
    image.onload = function() {
        gridItem.style.backgroundImage = `url(${imageLocation})`;
        gridContainer.appendChild(gridItem);
        // Check if all images have been loaded
        if (callback && position === totalImages) {
            callback(); // Call the callback function to indicate that all images have been loaded
        }
    };
    // Set the source of the image element to trigger loading
    image.src = imageLocation;
}

function assembleGrid(currentTrialType) {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    const gridReadyEvent = new Event('gridReady');
    let loadedImagesCount = 0;
    const imageLocations = generateImagePaths(currentTrialType);
    let target_location = 'N/A';
    // switch statement for special cases
    switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
        case 'Ontogenetic_Distractor_Nonthreat_target':
        case 'Phylogenetic_Distractor_Threat_target':
        case 'Phylogenetic_Distractor_Nonthreat_target':
            target_location = randomizeTargetLocation();
            // manipulate the array according to the randomized target location
            const targetImage = imageLocations.shift();
            imageLocations.splice(target_location - 1, 0, targetImage); // inject the target object back into array
            break;
        case 'Ontogenetic_Distractor_notarget':
        case 'Phylogenetic_Distractor_notarget':
            break;
        default:
            console.error('Unknown trial type:', currentTrialType); // should never trigger
            break;
    }
    const totalImages = imageLocations.length;
    // array to store promises for image loading
    const imagePromises = [];

    // loop through each image location
    imageLocations.forEach((imageLocation, index) => {
        const image = new Image();
        const promise = new Promise((resolve) => {
            image.onload = function() {
                loadedImagesCount++;
                // Call addGridItem for each image
                addGridItem(imageLocation, index + 1, totalImages, function() {
                    // Check if all images have been loaded
                    if (loadedImagesCount === totalImages) {
                        // Dispatch the gridReadyEvent
                        gridContainer.dispatchEvent(gridReadyEvent);
                        console.log('dispatched');
                        resolve(); // Resolve the promise once all images are loaded
                    }
                }); 
            };
        });
        // Set the source of the image element to trigger loading
        image.src = imageLocation;
        imagePromises.push(promise);
    });

    // Add an event listener for the gridReady event
    gridContainer.addEventListener('gridReady', function() {
        // Set all grid item background images at once
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach((gridItem, index) => {
            gridItem.style.backgroundImage = `url(${imageLocations[index]})`;
        });
    });

    // Wait for all images to be loaded before resolving
    Promise.all(imagePromises).then(() => {
        console.log('All images have been loaded');
    });
}


// !! TRIAL // BLOCK PARAMETERS HERE !!
let blocktypes = {
    arrayNames: ['Ontogenetic', 'Phylogenetic'],
    arrayNums: [2, 2]
}

// set the blockorder a priori - no funny bidness
function setBlockOrder() {
    blockorder = jsPsych.randomization.repeat(blocktypes.arrayNames, blocktypes.arrayNums);
    return blockorder;
}

setBlockOrder();
let currentBlock = blockorder[0]
// console.log(blockorder); // debug only
let blockticker = 0;

function getNextBlock() {
    blockticker = (blockticker + 1) % blockorder.length;
    let nextBlock = blockorder[blockticker];
    currentBlock = nextBlock;
    return nextBlock;
}

// console.log(`@start, the current block is: ${currentBlock}`)
function getValidTrialTypes(currentBlock) {
        switch(currentBlock) {
            case 'Ontogenetic':
                currentBlockDef = ['Ontogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_Nonthreat_target', 'Ontogenetic_Distractor_notarget'];
                return currentBlockDef;
            case 'Phylogenetic':
                currentBlockDef = ['Phylogenetic_Distractor_Threat_target', 'Phylogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_notarget'];
                return currentBlockDef;
        }
    }

// call immediately on bootup
getValidTrialTypes(currentBlock);
// !! SET Distribution of # of threats, # nonthreats, # of notargets BELOW !!
let blocktrialArray = {
    arrayNames: currentBlockDef,
    arrayNums: [5, 5, 1]
};

function updateBlocktrialArray() {
    blocktrialArray.arrayNames = currentBlockDef;
}

updateBlocktrialArray();

// todo - do we have these fixed??? const practice_rounds = ['Ontogenetic_Distractor_Threat_target', 'Phylogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_notarget', 'Ontogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_Threat_target']
// let ticker_practice = 0; TODO PRACTICE STUFF
// let currentTrialType_practice = practice_rounds[ticker_practice]; TODO (PRACTICE ROUND?)

function setexperimentalTrajectory() {
    experimental_trajectory = jsPsych.randomization.repeat(blocktrialArray.arrayNames, blocktrialArray.arrayNums);
    return experimental_trajectory;
}

setexperimentalTrajectory();
let ticker = 0;

function getNextTrialType() {
    let nextTrialType = experimental_trajectory[ticker];
    ticker = (ticker + 1) % experimental_trajectory.length;
    currentTrialType = nextTrialType;
}

let currentTrialType = experimental_trajectory[ticker];

function getStimulusDuration() {
    if (isPractice == true) {
        stimulusDuration = 3000;
        for (let i = 0; i < 14; i++);
        stimulusDuration = stimulusDuration - 100;
    } else { stimulusDuration = 700 }
}
 // !! EXPERIMENT TIMELINE + EVENTS BELOW !!
const timeline = [];
const instructions = {
        type: htmlKeyboardResponse,
        stimulus: `
            <p>Hello! This experiment will evaluate your ability to determine the type of objects in short periods of time.
            </p>
            <p>You will be shown a grid of nine images. One of these objects might be different in nature from the rest.</p>
            <p>If the object that is different from the rest is "threatening" in character, press the 'q' button on the keyboard.</p>
            <p>If the object that is different from the rest is "nonthreatening" in character, press the 'p' button on the keyboard.</p>
            <p>If all the objects are of the same character, press the spacebar.</p>
            <p>We will separate this out into a longer sequence later with pictures and a practice session, but for now, press any key to continue</p>
            </p>
            <div style='width: 100px;'>
            </div>
        `,
        post_trial_gap: 2000
};

const experimental_grid = {
    type: htmlKeyboardResponse,
    on_load: function() {
        assembleGrid(currentTrialType);
        isMask = true;
        }, 
    choices: [],
    stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
    stimulus_duration: stimulusDuration,
    response_ends_trial: false,
    trial_duration: 500,
};

const backmask = {
    type: htmlKeyboardResponse,
    on_load: function() {
    assembleGrid(currentTrialType);
    }, 
    choices: ['q', 'p', ' '],
    stimulus: `
    <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
    stimulus_duration: 100,
    on_finish: function(data) { data.task = currentTrialType;
        data.correctresponse = correctJudgement;
        data.targetimagelocation = target_location;
        data.blocktype = currentBlock;
        if(jsPsych.pluginAPI.compareKeys(data.response, correctJudgement)) {
            data.correct = true;
            if (isPractice == true) {
                data.roundtype = 'practice';
                feedback = 'Correct!';
            }
            data.roundtype = 'experimental';
                } else {
                    data.correct = false;
                    if (isPractice == true) {
                        data.roundtype = 'practice';
                        feedback = 'Incorrect!'; 
                } data.roundtype = 'experimental';
            }
                jsPsych.data.get().json();
                isMask = false;
            },
        post_trial_gap: 10
    };

const fixation = {
    type: htmlKeyboardResponse,
    stimulus: '+',
    stimulus_duration: 1500,
    trial_duration: 1500,
    response_ends_trial: false,
    on_start: function() {         
        getNextTrialType();
        getStimulusDuration();
        },
    };

const feedback_block = {
    type: htmlKeyboardResponse,
    stimulus: `${feedback}`,
    trial_duration: 1000,
    on_finish: function() {
        feedback = '';
        }
}

const debrief_block = {
    type: htmlKeyboardResponse,
    on_start: function () {
            jsPsych.data.get().localSave('csv', `results.csv`);
    },
    stimulus: function() {
        var trials = jsPsych.data.get().filter({roundtype: 'experimental'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        var rt = Math.round(correct_trials.select('rt').mean());

        return `<p>Congrats m8 - you responded correctly with ${accuracy}% of the trials.</p>
                <p>Your average response time was ${rt}ms.</p>
                <p>Don't like it? You only have yourself to blame.</p>
                <p>Press any key to complete the experiment.</p>`;
        },
    };

const test_procedure = {
    timeline: [fixation, experimental_grid, backmask],
    randomize_order: false,
    repetitions: 2,
    on_finish: function() {ticker = 0}}

const takeabreak = {
    type: htmlKeyboardResponse,
    on_start: function() {
        numofBreaks = numofBreaks + 1;
        ticker = 0;
        getNextBlock();
        getValidTrialTypes(currentBlock);
        updateBlocktrialArray();
        setexperimentalTrajectory();
        },
    stimulus: `
            <p>"Whoa, catch your breath man, shake out those lips!"
            "It's downhill from here, just ${blockorder.length - numofBreaks} blocks more to go!"
            "Now it gets tricky, so listen real good!"
            </p>
            <div style='width: 100px;'>
            </div>
        `,
    post_trial_gap: 2000
};

const practice_phase = {
        timeline: [fixation, experimental_grid, backmask, feedback_block],
        randomize_order: true,
        repetitions: 20,
        on_finish: function () {
            isPractice == false;
        }
}

timeline.push(instructions);
// timeline.push(practice_phase); implement later
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);
timeline.push(takeabreak);
timeline.push(test_procedure);

timeline.push(debrief_block);

jsPsych.run(timeline);

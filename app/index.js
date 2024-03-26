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
let final_judgement = '';

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
for (let i = 0; i < 70; i++) {
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
// !! this is the issue... - when ran as a callback, has no access to globals !!
function addPropertiesToData() {
    jsPsych.data.addProperties({
        task: currentTrialType,
        image_location: target_location, 
        correct_response: final_judgement,
    });
}

// !! MAIN EXPERIMENT HELPERS !!
function generateImagePaths(currentTrialType) {
    final_judgement = judgements(currentTrialType);
    console.log(final_judgement);
    imageLocations.length = 0;
    if (isMask === true) {
            // shuffle wuffle!
            shuffleArray(maskImages);
            imageLocations.push(...maskImages.slice(0, 9));
        
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
        const targetrngBird = jsPsych.randomization.randomInt(1, 40);
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

// !! TRIAL PARAMETERS HERE !!
const trialTypeDefs = {
arrayNames: ['Ontogenetic_Distractor_Threat_target', 'Ontogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_Nonthreat_target', 'Phylogenetic_Distractor_Threat_target','Ontogenetic_Distractor_notarget', 'Phylogenetic_Distractor_notarget'],
arrayNums: [25, 25, 25, 25, 5, 5]
}

const experimental_trajectory = jsPsych.randomization.repeat(trialTypeDefs.arrayNames, trialTypeDefs.arrayNums);
console.log(experimental_trajectory) // debug only

let ticker = 0;
let currentTrialType = experimental_trajectory[ticker];

function getNextTrialType() {
    const nextTrialType = experimental_trajectory[ticker];
    ticker = (ticker + 1) % experimental_trajectory.length;
    currentTrialType = nextTrialType;
}

function judgements(currentTrialType) {
    switch(currentTrialType) {
    case 'Ontogenetic_Distractor_Threat_target':
    case 'Phylogenetic_Distractor_Threat_target':
        final_judgement = 'q';
        return final_judgement;
    case 'Ontogenetic_Distractor_Nonthreat_target':
    case 'Phylogenetic_Distractor_Threat_target':
        final_judgement = 'p';
        return final_judgement;
    case 'Ontogenetic_Distractor_notarget':
    case 'Phylogenetic_Distractor_notarget':
        final_judgement = 'space';
        return final_judgement;
    
    }}

function assembleGridImageLocations(currentTrialType) {
    let target_location = 'N/A';
    let imageLocations = generateImagePaths(currentTrialType);
    // switchie
    switch (currentTrialType) {
        case 'Ontogenetic_Distractor_Threat_target':
        case 'Ontogenetic_Distractor_Nonthreat_target':
        case 'Phylogenetic_Distractor_Threat_target':
        case 'Phylogenetic_Distractor_Nonthreat_target':
            target_location = randomizeTargetLocation();
            
            // manipulate the array according to the randomized target location
            const targetImage = imageLocations.shift();
            imageLocations.splice(target_location - 1, 0, targetImage); // inject the target object back into array
            console.log(`your chosen pics are ${imageLocations}`); // debug only
            break;

        case 'Ontogenetic_Distractor_notarget':
        case 'Phylogenetic_Distractor_notarget':
            console.log(`your chosen pics are ${imageLocations}`); // debug only 
            break;

        default:
            console.error('Unknown trial type:', currentTrialType); // should never trigger
            break;
    }
}

function addGridItem(imageLocation, position, callback) {
    const gridContainer = document.getElementById('grid-container');
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    // Create an image element
    const image = new Image();
    image.onload = function() {
        // When the image has loaded, set it as the background image of the grid item
        gridItem.style.backgroundImage = `url(${imageLocation})`;
        // gridItem.innerText = position; // debug only
        gridContainer.appendChild(gridItem);
        console.log(`added grid item ${imageLocation}`); // debug only
        
        // Check if this is the last image to load
        if (callback && position === imageLocations.length) {
            callback(); // Call the callback function to indicate that all images have been loaded
        }
    };
    // Set the source of the image element to trigger loading
    image.src = imageLocation;
}

function assembleGridArray(imageLocations) {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    
    // Define a custom event
    const gridReadyEvent = new Event('gridReady');
    let loadedImagesCount = 0;

    // do the loop with the callback for rendering
    imageLocations.forEach((imageLocation, index) => {
        addGridItem(imageLocation, index + 1, function() {
            loadedImagesCount++;
            if (loadedImagesCount === imageLocations.length) {
                console.log('All images have been loaded. Display the grid now.');
                gridContainer.dispatchEvent(gridReadyEvent);
            }
        }); 
    });
}
    // !! EXPERIMENT TIMELINE BELOW !!

    const timeline = [];
    const instructions = {
        type: htmlKeyboardResponse,
        stimulus: `
            <p>ignore this text it's not signifying anything rn since we are still building.
            </p>
            <div style='width: 100px;'>
            </div>
        `,
        post_trial_gap: 2000
    };

    const experimental_grid = {
        type: htmlKeyboardResponse,
        on_load: function() {
            assembleGridImageLocations(currentTrialType);
            assembleGridArray(imageLocations);
            isMask = true;
        }, 
        choices: [],
        stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
        stimulus_duration: 400,
        trial_duration: 400,
    };

    const backmask = {
        type: htmlKeyboardResponse,
        on_load: function() {
            assembleGridImageLocations(currentTrialType);
            assembleGridArray(imageLocations);
        }, 
        choices: ['q', 'p', 'space'],
        stimulus: `
        <div id="grid-container">
        <!-- Grid items will be dynamically added here -->
    </div>    `, 
    stimulus_duration: 100,
        on_finish: function() { addPropertiesToData();
            isMask = false;        
        },
        post_trial_gap: 10
    };

    const fixation = {
        type: htmlKeyboardResponse,
        stimulus: '+',
        stimulus_duration: 500,
        trial_duration: 500,
        on_start: function() {
            getNextTrialType();
            console.log(`upcoming trial is ${currentTrialType}`); // debug only
        },
    };

    const debrief_block = {
        type: htmlKeyboardResponse,
        on_start: function () {
            jsPsych.data.get().localSave('csv', `results.csv`);
        },
        stimulus: function() {
            var trials = jsPsych.data.get().filter({task: 'response'});
            var correct_trials = trials.filter({correct: true});
            var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
            var rt = Math.round(correct_trials.select('rt').mean());

            return `<p>You responded correctly on ${accuracy}% of the trials.</p>
                <p>Your average response time was ${rt}ms.</p>
                <p>Press any key to complete the experiment.</p>`;
        },
    };

    const test_procedure = {
        timeline: [fixation, experimental_grid, backmask],
        randomize_order: true,
        repetitions: 3
    };

    timeline.push(instructions);
    timeline.push(test_procedure);
    timeline.push(debrief_block);

    jsPsych.run(timeline);
    ;
// Yi-Chia Chen

// ########     ###    ########     ###    ##     ## ######## ######## ######## ########
// ##     ##   ## ##   ##     ##   ## ##   ###   ### ##          ##    ##       ##     ##
// ##     ##  ##   ##  ##     ##  ##   ##  #### #### ##          ##    ##       ##     ##
// ########  ##     ## ########  ##     ## ## ### ## ######      ##    ######   ########
// ##        ######### ##   ##   ######### ##     ## ##          ##    ##       ##   ##
// ##        ##     ## ##    ##  ##     ## ##     ## ##          ##    ##       ##    ##
// ##        ##     ## ##     ## ##     ## ##     ## ########    ##    ######## ##     ##

// data saving
const FORMAL = false;
const EXPERIMENT_NAME = 'sfRecog';
const EXPERIMENT_VERSION = 'pretestTrajc';
const SUBJ_NUM_FILE = 'subjNum_' + EXPERIMENT_NAME + '_' + EXPERIMENT_VERSION + '.txt';
const TRIAL_FILE = 'trial_' + EXPERIMENT_NAME + '_' + EXPERIMENT_VERSION + '.txt';
const SUBJ_FILE = 'subj_' + EXPERIMENT_NAME + '_' + EXPERIMENT_VERSION + '.txt';
const VISIT_FILE = 'visit_' + EXPERIMENT_NAME + '_' + EXPERIMENT_VERSION + '.txt';
const ATTRITION_FILE = 'attrition_' + EXPERIMENT_NAME + '_' + EXPERIMENT_VERSION + '.txt';
const SAVING_SCRIPT = 'php/save.php';
const SUBJ_NUM_SCRIPT = 'php/subjNum.php';
const SAVING_DIR = FORMAL ? '../data/formal' : '../data/testing';
const ID_GET_VARIABLE_NAME = 'sonacode';
const COMPLETION_URL = 'https://github.com/Yi-Chia-Chen/self-representation';

// stimuli
const STIM_PATH = 'images/';
const IMG_LIST = [
    'maximize_window.png',
    'game_display.jpg',
    'sea.jpg',
    'guide-boat.png',
    'rescue-boat.png',
    'person.png'
];

// Object variables
let instr, subj, trial, game;

// criteria
const VIEWPORT_MIN_W = 825;
const VIEWPORT_MIN_H = 625;
const INSTR_READING_TIME_MIN = 0.75;

// task
const CUE_DURATION = 1;
const GUIDE_SPEED = 300;
const RESCUE_SPEED = GUIDE_SPEED / 2;
const COOL_OFF_DURATION = 0.2;
const INTERTRIAL_INTERVAL = 0.5;
const TRIAL_TYPE_DICT = {
    'watching': 'AUTO MODE',
    'performing': 'MANUAL MODE'
};


// ########  ########    ###    ########  ##    ##
// ##     ## ##         ## ##   ##     ##  ##  ##
// ##     ## ##        ##   ##  ##     ##   ####
// ########  ######   ##     ## ##     ##    ##
// ##   ##   ##       ######### ##     ##    ##
// ##    ##  ##       ##     ## ##     ##    ##
// ##     ## ######## ##     ## ########     ##

$(document).ready(function () {
    LOAD_IMG(0, STIM_PATH, IMG_LIST, function () { });
    subj = new subjObject(subj_options);
    subj.id = subj.getID(ID_GET_VARIABLE_NAME);
    subj.visitFile = subj.id + '_' + VISIT_FILE;
    subj.attritionFile = subj.id + '_' + ATTRITION_FILE;
    subj.subjFile = subj.id + '_' + SUBJ_FILE;
    trial_options['dataFile'] = subj.id + '_' + TRIAL_FILE;
    subj.saveVisit();
    if (subj.phone) {
        HALT_EXPERIMENT('It seems that you are using a touchscreen device or a phone. Please use a laptop or desktop instead.<br /><br />If you believe you have received this message in error, please contact the experimenter at XXX<br /><br />Otherwise, please switch to a laptop or a desktop computer for this experiment.');
    } else {
        INSTRUCTION_START();
    }
});

function HALT_EXPERIMENT(explanation) {
    $('.page-box').hide();
    $('#instr-text').html(explanation);
    $('#next-button').hide();
    $('#instr-box').show();
}

function AJAX_FAILED() {
    HALT_EXPERIMENT('Oops! An error has occurred. Please contact the experimenter at XXX with the code "CAPTCHA_AJAX_ERR". Sorry!');
}


//  ######  ##     ## ########        ## ########  ######  ########
// ##    ## ##     ## ##     ##       ## ##       ##    ##    ##
// ##       ##     ## ##     ##       ## ##       ##          ##
//  ######  ##     ## ########        ## ######   ##          ##
//       ## ##     ## ##     ## ##    ## ##       ##          ##
// ##    ## ##     ## ##     ## ##    ## ##       ##    ##    ##
//  ######   #######  ########   ######  ########  ######     ##

const SUBJ_TITLES = [
    'num',
    'date',
    'startTime',
    'id',
    'userAgent',
    'endTime',
    'duration',
    'instrRepeatN',
    'instrQuizAttemptN',
    'instrReadingTimes',
    'quickReadingPageN',
    'hiddenCount',
    'hiddenDurations',
    'device',
    'otherDevice',
    'strategy',
    'serious',
    'problems',
    'gender',
    'age',
    'inView',
    'viewportW',
    'viewportH'
];

function SUBJ_NUM_CALLBACK() {
    if (typeof trial !== 'undefined') {
        trial.num = subj.num;
    }
}

function HANDLE_VISIBILITY_CHANGE() {
    if (document.hidden) {
        subj.hiddenCount += 1;
        subj.hiddenStartTime = Date.now();
    } else {
        subj.hiddenDurations.push((Date.now() - subj.hiddenStartTime) / 1000);
    }
}

function SUBMIT_DEBRIEFING_Q() {
    subj.device = $('input[name="device"]:checked').val();
    subj.otherDevice = $('#other-device').val();
    subj.strategy = $('#strategy').val();
    subj.serious = $('input[name="serious"]:checked').val();
    subj.problems = $('#problems').val();
    subj.gender = $('input[name="gender"]:checked').val();
    subj.age = $('#age').val();
    const OPEN_ENDED_LIST = [subj.strategy, subj.problems, subj.age];
    const CHOICE_LIST = [subj.device, subj.serious, subj.gender];
    if (subj.device == 'other') {
        OPEN_ENDED_LIST.push(subj.otherDevice);
    }
    if (CHECK_IF_RESPONDED(OPEN_ENDED_LIST, CHOICE_LIST)) {
        for (let i = 0; i < OPEN_ENDED_LIST.length; i++) {
            OPEN_ENDED_LIST[i] = OPEN_ENDED_LIST[i].replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        subj.instrRepeatN = instr.repeatN;
        subj.instrQuizAttemptN = instr.quizAttemptN['onlyQ'];
        subj.instrReadingTimes = JSON.stringify(instr.readingTimes);
        subj.quickReadingPageN = Object.values(instr.readingTimes).filter(d => d < INSTR_READING_TIME_MIN).length;
        subj.submitQ();
        $('#questions-box').hide();
        ALLOW_SELECTION();
        $('#debriefing-box').show();
        $('html')[0].scrollIntoView();
    } else {
        $('#q-warning').text('Please answer all questions to complete the experiment. Thank you!');
    }
}

function TOGGLE_OTHER_DEVICE_QUESTION() {
    if ($('input[name="device"]:checked').val() == 'other') {
        $('#other-device-question').show();
    }
    else {
        $('#other-device-question').hide();
    }
}

function END_TO_SONA() {
    window.location.href = COMPLETION_URL;
}

function ALLOW_SELECTION() {
    $('body').css({
        '-webkit-user-select': 'text',
        '-moz-user-select': 'text',
        '-ms-user-select': 'text',
        'user-select': 'text'
    });
}

let subj_options = {
    subjNumFile: SUBJ_NUM_FILE,
    subjNumCallback: SUBJ_NUM_CALLBACK,
    titles: SUBJ_TITLES,
    viewportMinW: VIEWPORT_MIN_W,
    viewportMinH: VIEWPORT_MIN_H,
    savingScript: SAVING_SCRIPT,
    subjNumScript: SUBJ_NUM_SCRIPT,
    visitFile: VISIT_FILE,
    attritionFile: ATTRITION_FILE,
    subjFile: SUBJ_FILE,
    savingDir: SAVING_DIR,
    handleVisibilityChange: HANDLE_VISIBILITY_CHANGE
};


// #### ##    ##  ######  ######## ########
//  ##  ###   ## ##    ##    ##    ##     ##
//  ##  ####  ## ##          ##    ##     ##
//  ##  ## ## ##  ######     ##    ########
//  ##  ##  ####       ##    ##    ##   ##
//  ##  ##   ### ##    ##    ##    ##    ##
// #### ##    ##  ######     ##    ##     ##

function INSTRUCTION_START() {
    let guide = new agentObject($('#guide-boat'), [0, 0], 0, GUIDE_SPEED, $('#playground'));
    let rescue = new agentObject($('#rescue-boat'), [0, 0], 0, RESCUE_SPEED, $('#playground'));
    let spawner = new spawnerObject($('#passenger'), $('#playground'), TARGET_MARGIN);
    game = new gameObject(guide, rescue, spawner, COOL_OFF_DURATION, TARGET_N, 2);
    trial_options['subj'] = subj;
    trial = new trialObject(trial_options);
    instr = new instrObject(instr_options);
    instr.repeatN = 0;
    instr.start();
}

const MAIN_INSTRUCTIONS_DICT = {
    0: [false, false, 'Thank you very much!<br /><br />This study will take about 10 minutes. Please read the instructions carefully, and avoid using the refresh or back buttons.'],
    1: [SHOW_MAXIMIZE_WINDOW, false, 'Now, please maximize your browser window.'],
    2: [HIDE_INSTR_IMG, false, 'You will be playing a game in this study, where you will be controlling 2 boats to rescue passengers who have fallen into the sea in an accident.'],
    3: [SHOW_GAME_DISPLAY, false, "Here's what a scene in the game looks like. You can see that there are 2 boats and a passenger in the seawater."],
    4: [false, SCROLL_UP, 'The 2 boats play different roles in this rescue mission. The "Guide" boat in white will guide the "Rescue" boat in black to the passenger. Only the rescue boat can officially pick up the passenger.'],
    5: [HIDE_INSTR_IMG, false, 'In the game, the guide boat will follow your mouse movements, and the rescue boat will follow the guide boat. And you will need to control the 2 boats this way to get to the passenger.'],
    6: [false, false, 'Hit the NEXT button to see an example video of me playing the game once.'],
    7: [false, SHOW_EXAMPLE_GAME, ''],
    8: [RETURN_TO_INSTRUCTIONS, false, 'As you see in the video, the passenger is discovered and rescued one by one. Per game, 2 passengers will need to be rescued.'],
    9: [false, false, 'Note that the mouse cursor will be hidden during the game to reduce distraction from seeing it. It will still control the movements of the 2 boats normally though.'],
    10: [false, false, "Now, hit the NEXT button to play the game once to see what it's like!"],
    11: [false, PLAY_EXAMPLE_GAME, ''],
    12: [RETURN_TO_INSTRUCTIONS, false, "Please try to make the rescue as soon as possible, and don't use any unusual movements (just move the cursor the way you normally do). We will be recording how fast the mission can be completed for each game."],
    13: [SHOW_REPEAT_BUTTON, false, 'Got it? If you would like to read the instructions again, please hit the REPEAT button. Otherwise, hit NEXT to continue.'],
    14: [HIDE_REPEAT_BUTTON, false, "You will be playing this game many times. After each game your memory of what happened during the rescue mission will be tested.<br /><br />Specifically, you will be shown a segment of the path from one of the 2 boats from the game. Your job is to answer if the path shown is the same as what happened in the game, or a different path?<br /><br />Hit NEXT to see an example of a replay path memory test."],
    15: [false, SHOW_EXAMPLE_REPLAY, ''],
    16: [RETURN_TO_INSTRUCTIONS, false, "After seeing the replay, you will press one of two keys to respond.<br /><br />Press S if the replay looks the same.<br />Press D if the replay looks different.<br /><br />Hit NEXT to play the game with the memory test once!"],
    17: [false, SHOW_EXAMPLE_TRIAL, ''],
    18: [RETURN_TO_INSTRUCTIONS, false, 'Last note before we start:<br /><br />Over the course of this study, half of the games will be played by you. The other half will simply be the display from another player. Before each game, this will be announced directly with "MANUAL MODE" meaning ' + "it's" + ' your turn, or "AUTO MODE" meaning ' + "it's a game from another player.<br /><br />When it's in AUTO MODE, you just need to watch the game closely as if you are playing it yourself and answer the same memory test after it."],
    19: [false, false, "That's it! The next page is a quick instruction quiz. (It's very simple!)"],
    20: [false, SHOW_INSTR_QUESTION, ''],
    21: [SHOW_CONSENT, false, "Great! You can press SPACE to start. Please focus after you start (Don't switch to other windows or tabs!)"],
};

function SHOW_INSTR_IMG(file_name) {
    $('#instr-img').attr('src', STIM_PATH + file_name);
    $('#instr-img').css('display', 'block');
}

function HIDE_INSTR_IMG() {
    $('#instr-img').css('display', 'none');
}

function SHOW_MAXIMIZE_WINDOW() {
    SHOW_INSTR_IMG('maximize_window.png');
}

function SCROLL_UP() {
    $('#instr-box').animate({ scrollTop: "0" }, 200);
}

function SHOW_GAME_DISPLAY() {
    SHOW_INSTR_IMG('game_display.jpg');
}

function SHOW_EXAMPLE_GAME() {
    $('#instr-box').hide();
    $('#task-box').show();
    game.update(EXAMPLE_TARGET_LIST);
    game.start(true, 'watching', EXAMPLE_TRAJECTORY, function () {
        instr.next();
    });
}

function RETURN_TO_INSTRUCTIONS() {
    $('#task-box').hide();
}

function PLAY_EXAMPLE_GAME() {
    $('#instr-box').hide();
    $('#task-box').show();
    game.update(EXAMPLE_TARGET_LIST);
    game.start(true, 'performing', EXAMPLE_TRAJECTORY, function () {
        instr.next();
    });
}

function SHOW_REPEAT_BUTTON() {
    $('#repeat-button').css('display', 'block');
}

function HIDE_REPEAT_BUTTON() {
    $('#repeat-button').hide();
}

function REPEAT_INSTRUCTIONS() {
    HIDE_REPEAT_BUTTON();
    instr.index = 1;
    instr.repeatN += 1;
    instr.next();
}

function SHOW_EXAMPLE_REPLAY() {
    $('#instr-box').hide();
    $('#task-box').show();
    let testedTrajectory = game.generate_test_trajectory('guide', true);
    game.replay(true, true, 'guide', testedTrajectory, function () {
        instr.next();
    });
}

function SHOW_EXAMPLE_TRIAL() {
    $('#instr-box').hide();
    $('#task-box').show();
    game.update(EXAMPLE_TARGET_LIST);
    game.start(true, 'performing', EXAMPLE_TRAJECTORY, function () {
        $('#show_button').mouseup(SHOW_EXAMPLE_TRIAL_REPLAY);
        $('#show_button').css('display', 'block');
    });
}

function SHOW_EXAMPLE_TRIAL_REPLAY() {
    $('#show_button').hide();
    $('#show_button').off('mouseup');
    let testedTrajectory = game.generate_test_trajectory('rescue', false);
    game.replay(false, true, 'rescue', testedTrajectory, function () {
        instr.next();
        $('#show_button').mouseup(SHOW_REPLAY);
    });
}

function SHOW_INSTR_QUESTION() {
    $('#instr-box').hide();
    $('#instr-q-box').show();
}

function SUBMIT_INSTR_Q() {
    let instrChoice = $('input[name="instr-q"]:checked').val();
    if (typeof instrChoice === 'undefined') {
        $('#instr-q-warning').text('Please answer the question. Thank you!');
    } else if (instrChoice != 'remember') {
        instr.qAttemptN['onlyQ'] += 1;
        instr.saveReadingTime();
        $('#instr-text').html('You have given an incorrect answer. Please read the instructions again carefully.');
        $('#instr-box').show();
        $('#instr-q-box').hide();
        $('input[name="instr-q"]:checked').prop('checked', false);
        instr.index = -1;
    } else {
        instr.saveReadingTime();
        instr.next();
        $('#instr-q-box').hide();
    }
}

function SHOW_CONSENT() {
    $('#next-button').hide();
    // $('#consent-box').show();
    $(document).keyup(function (e) {
        if (e.code == 'Space') {
            $(document).off('keyup');
            instr.saveReadingTime();
            $('#instr-box').hide();
            // $('#consent-box').hide();
            subj.saveAttrition();
            SHOW_GAME();
        }
    });
}

let instr_options = {
    textBox: $('#instr-box'),
    textElement: $('#instr-text'),
    dict: MAIN_INSTRUCTIONS_DICT,
    quizConditions: ['onlyQ']
};


// ######## ########  ####    ###    ##
//    ##    ##     ##  ##    ## ##   ##
//    ##    ##     ##  ##   ##   ##  ##
//    ##    ########   ##  ##     ## ##
//    ##    ##   ##    ##  ######### ##
//    ##    ##    ##   ##  ##     ## ##
//    ##    ##     ## #### ##     ## ########

const TRIAL_TITLES = [
    'num',
    'date',
    'subjStartTime',
    'blockNum',
    'restCount',
    'trialNum',
    'type',
    'trajectoryNum',
    'targetList',
    'targetRts',
    'allTrajectory',
    'guideTrajectory',
    'rescueTrajectory',
    'testBoat',
    'testSame',
    'testedTrajectory',
    'inView',
    'response',
    'rt'
];

function SHOW_GAME() {
    $('#task-box').show();
    trial.blockNum = 1;
    trial.restCount = 0;
    trial.run();
}

function TRIAL_UPDATE(formal_trial, last, this_trial, next_trial, path) {
    trial.type = this_trial['type'];
    if (trial.type == 'watching') {
        trial.trajectoryNum = this_trial['trajectoryNum'];
        trial.trajectory = TRAJECTORY_DICT[trial.trajectoryNum];
    } else {
        trial.trajectoryNum = -1;
        trial.trajectory = [];
    }
    trial.targetList = this_trial['targetList'];
    trial.testBoat = this_trial['boat'];
    trial.testSame = this_trial['same'];
    game.update(trial.targetList);
}

function TRIAL() {
    const NOW_TYPE = TRIAL_TYPE_DICT[trial.type];
    $('#task-cue').removeClass('half-transparent');
    $('#task-cue').text(NOW_TYPE);
    $('#task-cue').css('display', 'block');
    setTimeout(function () {
        $('#task-cue').addClass('half-transparent');
        trial.inView = CHECK_FULLY_IN_VIEW($('#playground'));
        game.start(false, trial.type, trial.trajectory, false);
    }, CUE_DURATION * 1000);
}

function START_REPLAY() {
    $('#task-cue').hide();
    $('#show_button').css('display', 'block');
}

function SHOW_REPLAY() {
    $('#show_button').hide();
    trial.testedTrajectory = game.generate_test_trajectory(trial.testBoat, trial.testSame);
    game.replay(false, false, trial.testBoat, trial.testedTrajectory, false);
}

function START_RESPONSE(example, callback) {
    $('#task-prompt').show();
    trial.startTime = Date.now();
    $(document).keyup(function (e) {
        if (e.code == 'KeyS' || e.code == 'KeyD') {
            $(document).off('keyup');
            $('#task-prompt').hide();
            if (example) {
                callback();
            } else {
                trial.targetList = TWO_D_ARRAY_TO_STRING(trial.targetList);
                trial.allTrajectory = game.allTrajectory.slice(0, -1) + ']';
                trial.guideTrajectory = TWO_D_ARRAY_TO_STRING(game.guideTrajectory);
                trial.rescueTrajectory = TWO_D_ARRAY_TO_STRING(game.rescueTrajectory);
                trial.testedTrajectory = TWO_D_ARRAY_TO_STRING(trial.testedTrajectory);
                trial.targetRts = '[' + game.targetRts.toString() + ']';
                RECORD_TRIAL(e.code);
            }
        }
    });
}

function RECORD_TRIAL(resp) {
    trial.rt = (Date.now() - trial.startTime) / 1000;
    trial.response = resp;
    if (trial.trialNum > 0) {
        const DATA = LIST_FROM_ATTRIBUTE_NAMES(trial, trial.titles);
        trial.allData += LIST_TO_FORMATTED_STRING(DATA);
    }
    NEXT_ACTION();
}

function NEXT_ACTION() {
    if (trial.trialNum < trial.trialN) {
        if (trial.trialNum % REST_TRIAL_N == 0 && trial.trialNum > 0) {
            REST();
        } else {
            trial.run();
        }
    } else {
        trial.complete = true;
        trial.endExptFunc();
    }
}

function REST() {
    $('#task-box').hide();
    trial.rest($('#rest-box'), $('#rest-text'), function () {
        $('#task-box').show();
        trial.blockNum += 1;
        trial.restCount += 1;
        trial.run();
    });
}

function END_TRIALS() {
    $('#task-box').hide();
    $('body').css('overflow-y', 'auto');
    $('input:radio[name="device"]').change(TOGGLE_OTHER_DEVICE_QUESTION);
    $('#questions-box').show();
    trial.save();
}

let trial_options = {
    titles: TRIAL_TITLES,
    pracTrialN: PRACTICE_TRIAL_N,
    trialN: TRIAL_N,
    stimPath: STIM_PATH,
    dataFile: TRIAL_FILE,
    savingScript: SAVING_SCRIPT,
    savingDir: SAVING_DIR,
    trialList: Array.from(TRIAL_LIST),
    pracList: Array.from(PRACTICE_LIST),
    intertrialInterval: INTERTRIAL_INTERVAL,
    updateFunc: TRIAL_UPDATE,
    trialFunc: TRIAL,
    endExptFunc: END_TRIALS,
    progressInfo: true
}

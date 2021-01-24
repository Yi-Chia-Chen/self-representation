// Generated 2020.09.20

const TRIAL_TYPES = ['watching','performing'];
// from trajectories.js:
// const TRAJECTORY_DICT = {'13':trajectory, ...};
// key: str(target list index)+str(0-3 trajectory number)
// value: [[time1, [guideX,guideY,guideOri], [rescueX,rescueY,rescueOri], [targetX,targetY,targetOn]], [time2, ...], ...]

const TARGET_N = 2;
const TARGET_MARGIN = 150;

const TARGET_LIST_DICT = {
    0: [[647, 256], [345, 183]],
    1: [[638, 414], [232, 234]],
    2: [[165, 190], [542, 396]],
    3: [[168, 418], [282, 233]],
    4: [[153, 449], [319, 166]],
    5: [[645, 225], [358, 177]],
    6: [[570, 443], [463, 190]],
    7: [[168, 314], [475, 231]],
    8: [[210, 155], [464, 385]],
    9: [[185, 334], [605, 280]]
};
const EXAMPLE_TARGET_LIST_KEY = 8;
const PRACTICE_TARGET_LIST_KEY = 9;
const EXAMPLE_TARGET_LIST = TARGET_LIST_DICT[EXAMPLE_TARGET_LIST_KEY];
const PRACTICE_TARGET_LIST = TARGET_LIST_DICT[PRACTICE_TARGET_LIST_KEY];
const EXAMPLE_TRAJECTORY_KEY = EXAMPLE_TARGET_LIST_KEY.toString()+'0';
const PRACTICE_TRAJECTORY_KEY = PRACTICE_TARGET_LIST_KEY.toString()+'0';

const EXAMPLE_TRAJECTORY = TRAJECTORY_DICT[EXAMPLE_TRAJECTORY_KEY];

const TEST_BOAT = ['guide', 'rescue'];
const TEST_SAME = [true, false];

const CONDITION_TRIAL_N = Object.keys(TARGET_LIST_DICT).length - 2; // 8
const BLOCK_N = CONDITION_TRIAL_N;

function CREATE_TRIAL_LIST() {
    var block_trial_dict = {}
    for (let i=0; i<BLOCK_N; i++) {
        var block_trial_list = [];
        let count = 0;
        for (let j=0; j<TRIAL_TYPES.length; j++) {
            for (let k=0; k<TEST_BOAT.length; k++) {
                for (let l=0; l<TEST_SAME.length; l++){
                    let trajectory_num = (count+i) % BLOCK_N;
                    block_trial_list.push(
                        {
                            'type': TRIAL_TYPES[j],
                            'trajectoryNum': trajectory_num.toString()+(k*2+l).toString(),
                            'targetList':TARGET_LIST_DICT[trajectory_num],
                            'boat': TEST_BOAT[k],
                            'same': TEST_SAME[l]
                        });
                    count++;
                }
            }
        }
        block_trial_dict[i] = SHUFFLE_ARRAY(block_trial_list);
    }

    var trial_list = [];
    const BLOCK_ORDER = SHUFFLE_ARRAY(RANGE(0, BLOCK_N));
    for (let i=0; i<BLOCK_N; i++) {
        trial_list = trial_list.concat(block_trial_dict[BLOCK_ORDER[i]]);
    }
    return trial_list;
}
const TRIAL_LIST = CREATE_TRIAL_LIST();
const TRIAL_N = TRIAL_LIST.length;
const REST_TRIAL_N = TRIAL_N / BLOCK_N;

const PRACTICE_LIST = [
    {
        'type': 'watching',
        'trajectoryNum': PRACTICE_TRAJECTORY_KEY,
        'targetList':PRACTICE_TARGET_LIST,
        'boat': 'guide',
        'same': true
    },{
        'type': 'performing',
        'trajectoryNum': PRACTICE_TRAJECTORY_KEY,
        'targetList':PRACTICE_TARGET_LIST,
        'boat': 'rescue',
        'same': true
    }];
const PRACTICE_TRIAL_N = PRACTICE_LIST.length;

const INSTR_TRIAL_N = PRACTICE_TRIAL_N + TRIAL_N;
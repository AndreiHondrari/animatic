'use strict';


const AnimationStatus = Object.freeze({
    RUNNING: Symbol("RUNNING"),
    PAUSED: Symbol("PAUSED"),
    COMPLETED:  Symbol("COMPLETED"),
});

const AnimationDirection = Object.freeze({
    FORWARD: Symbol("FORWARD"),
    BACKWARD: Symbol("BACKWARD"),
})


export {
    AnimationStatus,
    AnimationDirection
};

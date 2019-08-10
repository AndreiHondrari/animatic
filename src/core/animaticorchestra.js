'use strict';


import { AnimationStatus, AnimationDirection } from './constants.js';


class AnimaticOrchestra {
    constructor() {
        this._rootNodes = new Map();
        this._nodes = new Map();
        this._activeNodes = new Map();
        this._isAnimationStarted = false;

        this._onBeginCallbacks = new Array();
        this._onCompleteCallbacks = new Array();
        this._onCompletePromises = new Array();

        this._animationStatus = AnimationStatus.PAUSED;
    }

    // properties
    get rootNodes() {
        return this._rootNodes;
    }

    get allNodes() {
        return this._nodes;
    }

    get activeNodes() {
        return this._activeNodes;
    }

    get animationStarted() {
        return this._isAnimationStarted;
    }

    get finished() {
        const self = this;

        return new Promise(function(resolve, reject) {
            self._onCompletePromises.push(function(direction) {
                resolve(direction);
            });
        });
    }

    get status() {
        return this._animationStatus;
    }

    // connections
    add(node) {
        if (this._isAnimationStarted)
            throw Error("Can't add new animatic nodes once the orchestration started!");

        this._rootNodes.set(node.id, node);
        this._activeNodes.set(node.id, node);
        this._nodes.set(node.id, node);
        node.orchestra = this;

        return node;
    }

    _splitList(source, targets) {
        for (const target of targets) {
            source.to(target);
        }
    }

    split(source, firstTarget, ...otherTargets) {

        if (!this._nodes.has(source.id))
            throw Error(`${source} is not part of the orchestra!`);

        if (firstTarget instanceof Array) {
            let targets = firstTarget;
            this._splitList(source, targets);
        } else {
            source.to(firstTarget);
            this._splitList(source, otherTargets);
        }
    }

    _uniteList(target, sources) {
        for (const source of sources) {
            source.to(target);
        }
    }

    unite(target, firstSource, ...otherSources) {
        if (firstSource instanceof Array) {
            let sources = firstSource;
            this._uniteList(target, sources);
        } else {
            firstSource.to(target);
            this._uniteList(target, otherSources);
        }

        return target;
    }

    // control
    play() {
        this._animationStatus = AnimationStatus.RUNNING;
        for (const [id, rootNode] of this._rootNodes) {
            rootNode.forward();
        }
    }

    pause() {
        this._animationStatus = AnimationStatus.PAUSED;
        for (const [id, activeNode] of new Map(this._activeNodes)) {
            activeNode.pause();
        }
    }

    reset() {
        this._animationStatus = AnimationStatus.PAUSED;
        for (const [id, node] of this._nodes) {
            node.reset();
        }
        this._activeNodes = {...this._rootNodes};
    }

    reverse() {
        this._animationStatus = AnimationStatus.RUNNING;
        for (const [id, activeNode] of new Map(this._activeNodes)) {
            activeNode.backward();
        }
    }

    fakePlay() {
        this._animationStatus = AnimationStatus.RUNNING;
        for (const [id, rootNode] of this._rootNodes) {
            rootNode.forward({fake: true});
        }
    }

    fakeReverse() {
        this._animationStatus = AnimationStatus.RUNNING;
        for (const [id, activeNode] of new Map(this._activeNodes)) {
            activeNode.backward({fake: true});
        }
    }

    // callbacks
    onBegin(callback) {
        this._onBeginCallbacks.push(callback);
    }

    onComplete(callback) {
        this._onCompleteCallbacks.push(callback);
    }

    // notifications
    _callBegan() {
        for (const callback of this._onBeginCallbacks) {
            callback();
        }
    }

    _callCompleted(direction) {
        for (const callback of this._onCompleteCallbacks) {
            callback(direction);
        }
        for (const promiseCallback of this._onCompletePromises) {
            promiseCallback(direction);
        }
        this._onCompletePromises = new Array();
    }

    activateNode(nodeId) {
        this._activeNodes.set(nodeId, this._nodes.get(nodeId));
    }

    disableNode(nodeId) {
        this._activeNodes.delete(nodeId);
    }

    touchStart() {
        let previousCount = 0;
        let anyIncompleteNode = false;

        for (const [id, node] of this._activeNodes) {
            previousCount += node.previousCount;
            anyIncompleteNode = (anyIncompleteNode || node.status != AnimationStatus.COMPLETED);
        }

        if (previousCount == 0 && !anyIncompleteNode) {
            this._animationStatus = AnimationStatus.COMPLETED;
            this._callCompleted(AnimationDirection.BACKWARD);
        }
    }

    touchEnd() {
        let nextCount = 0;
        let anyIncompleteNode = false;

        for (const [id, node] of this._activeNodes) {
            nextCount += node.nextCount;
            anyIncompleteNode = (anyIncompleteNode || node.status != AnimationStatus.COMPLETED);
        }

        if (nextCount == 0 && !anyIncompleteNode) {
            this._animationStatus = AnimationStatus.COMPLETED;
            this._callCompleted(AnimationDirection.FORWARD);
        }
    }
}


export default AnimaticOrchestra;

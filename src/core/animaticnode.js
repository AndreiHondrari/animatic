'use strict';


import { AnimationStatus } from './constants.js';


class AnimaticNode {

    static _idCounter = 0;

    static _getNewId() {
        return this._idCounter++;
    }

    constructor(args) {
        this._handler = args.handler || null;
        this._backwardFunction = args.backward || null;
        this._pauseFunction = args.pause || null;
        this._resetFunction = args.reset || null;
        this._isFunctionHandler = (args.handler instanceof Function);

        this._id = AnimaticNode._getNewId();
        this._orchestra = null;
        this._animationStatus = AnimationStatus.PAUSED;

        this._previousNodes = new Map();
        this._previousCountdown = 0;
        this._nextNodes = new Map();
        this._nextCountdown = 0;
    }

    // properties
    get id() {
        return this._id;
    }

    get orchestra() {
        return this._orchestra;
    }

    set orchestra(newOrchestra) {
        if (this._orchestra !== null && this._orchestra != newOrchestra)
            throw Error(`AnimaticNode with id ${this.id} already belongs to an orchestra!`);

        this._orchestra = newOrchestra;
    }

    get previousCount() {
        return this._previousNodes.size;
    }

    get previousCountdown() {
        return this._previousCountdown;
    }

    get nextCount() {
        return this._nextNodes.size;
    }

    get nextCountdown() {
        return this._nextCountdown;
    }

    get status() {
        return this._animationStatus;
    }

    // connections
    to(toNode) {

        if (this.orchestra === null)
            throw Error("Can't append to a stray node! Add it as an orchestra root first!");

        if (this.orchestra.animationStarted)
            throw Error("Can't add new animatic nodes once the orchestration started!");

        // connect new node with orchestra of source node
        toNode.orchestra = this.orchestra;
        this.orchestra._nodes.set(toNode.id, toNode);

        this._nextNodes.set(toNode.id, toNode);

        // establish reverse relation
        toNode._previousNodes.set(this.id, this);
        toNode._previousCountdown++;

        return toNode;
    }

    split(firstTarget, ...otherTargets) {
        if (this.orchestra === null)
            return;

        this.orchestra.split(this, firstTarget, ...otherTargets);
    }

    unite(firstSource, ...otherSources) {
        if (this.orchestra === null)
            return;

        this.orchestra.split(this, firstSource, ...otherSources);
        return this;
    }

    // control
    forward() {
        this._animationStatus = AnimationStatus.RUNNING;
        const self = this;

        this._previousCountdown--;

        if (this._previousCountdown > 0)
            return;

        this._previousCountdown = 0;

        function _touchEnd() {
            self._animationStatus = AnimationStatus.COMPLETED;

            if (self.nextCount != 0) {
                self.orchestra.disableNode(self.id);
            } else {
                self.orchestra.touchEnd();
            }

            self._nextCountdown = self.nextCount;

            for (const [id, node] of self._nextNodes) {
                node.forward();
            }
        };

        this.orchestra.activateNode(this.id);

        if (this._isFunctionHandler) {
            if (this._handler === null)
                _touchEnd();

            this._handler(_touchEnd);
        } else {
            this._handler.forward(_touchEnd);
        }
    }

    pause() {
        if (this._pauseFunction === null)
            return;

        this._animationStatus = AnimationStatus.PAUSED;

        if (this._isFunctionHandler) {
            this._pauseFunction();
        } else {
            this._handler.pause();
        }
    }

    backward() {
        this._animationStatus = AnimationStatus.RUNNING;
        const self = this;

        this._nextCountdown--;

        if (this._nextCountdown > 0)
            return;

        this._nextCountdown = 0;

        function _touchStart() {
            self._animationStatus = AnimationStatus.COMPLETED;

            if (self.previousCount != 0) {
                self.orchestra.disableNode(self.id);
            } else {
                self.orchestra.touchStart();
            }

            self._previousCountdown = self.previousCount;

            for (const [id, node] of self._previousNodes) {
                node.backward();
            }
        };

        this.orchestra.activateNode(this.id);

        if (this._isFunctionHandler) {
            if (this._backwardFunction === null)
                _touchStart();

            this._backwardFunction(_touchStart);
        } else {
            this._handler.backward(_touchStart);
        }
    }

    reset() {
        if (this._resetFunction === null)
            return;

        this._animationStatus = AnimationStatus.PAUSED;

        if (this._isFunctionHandler) {
            this._resetFunction();
        } else {
            this._handler.reset();
        }
    }

}

export default AnimaticNode;

'use strict';


import { AnimationStatus } from './constants.js';


class AnimaticNode {

    static _idCounter = 0;

    static _getNewId() {
        return this._idCounter++;
    }

    constructor({handler=null, backward=null, pause=null, reset=null} = {}) {
        this._handler = handler;
        this._backwardFunction = backward;
        this._pauseFunction = pause;
        this._resetFunction = reset;
        this._isFunctionHandler = (handler instanceof Function);

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
    forward({fake=false} = {}) {
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
                node.forward({fake: fake});
            }
        };

        this.orchestra.activateNode(this.id);

        if (this._handler === null || fake) {
            _touchEnd();
            return;
        }

        // call a forward function or an adapter forward method
        if (this._isFunctionHandler) {
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

    backward({fake=false} = {}) {
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
                node.backward({fake: fake});
            }
        };

        this.orchestra.activateNode(this.id);

        if (this._backwardFunction === null || fake) {
            _touchStart();
            return;
        }

        // call a backwad function or an adapter backward method
        if (this._isFunctionHandler) {
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

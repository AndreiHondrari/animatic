'use strict';

let Animatic = (function() {

    const AnimationStatus = Object.freeze({
        RUNNING: Symbol("RUNNING"),
        PAUSED: Symbol("PAUSED"),
        COMPLETED:  Symbol("COMPLETED"),
    });

    // abstract classes
    class AbstractAnimaticAdapterNode {

        get adaptee() {
            throw Error("Not implemented!");
        }

        forward() {
            throw Error("Not implemented!");
        }

        pause() {
            throw Error("Not implemented!");
        }

        backward() {
            throw Error("Not implemented!");
        }
    }

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

    class AnimaticOrchestra {
        constructor() {
            this._rootNodes = new Map();
            this._nodes = new Map();
            this._activeNodes = new Map();
            this._isAnimationStarted = false;

            this._onBeginCallbacks = new Array();
            this._onCompleteCallbacks = new Array();
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

        _callCompleted() {
            for (const callback of this._onCompleteCallbacks) {
                callback();
            }
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
                this._callCompleted();
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
                this._callCompleted();
            }
        }
    }

    // main class
    class AnimaticMain {
        AnimationStatus = AnimationStatus;
        AbstractAnimaticAdapterNode = AbstractAnimaticAdapterNode;
        AnimaticNode = AnimaticNode;
        AnimaticOrchestra = AnimaticOrchestra;

        orchestra() {
            return new AnimaticOrchestra();
        }

        node(args) {
            return new AnimaticNode(args);
        }

    }

    return new AnimaticMain();
})();

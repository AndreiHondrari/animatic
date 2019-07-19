/*
    AnimaticJS - JavaScript library for execution orchestration.

    Author: Andrei-George Hondrari
    E-mail: andrei.hondrari@gmail.com
    Website: https://andreihondrari.com
    Github: https://github.com/AndreiHondrari
    Created on: July 2019
*/


var Animatic = (function () {
    'use strict';

    var AnimationStatus = Object.freeze({
      RUNNING: Symbol("RUNNING"),
      PAUSED: Symbol("PAUSED"),
      COMPLETED: Symbol("COMPLETED")
    });

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys(source, true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(source).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }

    var AbstractAnimaticAdapterNode =
    /*#__PURE__*/
    function () {
      function AbstractAnimaticAdapterNode() {
        _classCallCheck(this, AbstractAnimaticAdapterNode);
      }

      _createClass(AbstractAnimaticAdapterNode, [{
        key: "forward",
        value: function forward() {
          throw Error("Not implemented!");
        }
      }, {
        key: "pause",
        value: function pause() {
          throw Error("Not implemented!");
        }
      }, {
        key: "backward",
        value: function backward() {
          throw Error("Not implemented!");
        }
      }, {
        key: "adaptee",
        get: function get() {
          throw Error("Not implemented!");
        }
      }]);

      return AbstractAnimaticAdapterNode;
    }();

    var AnimaticNode =
    /*#__PURE__*/
    function () {
      _createClass(AnimaticNode, null, [{
        key: "_getNewId",
        value: function _getNewId() {
          return this._idCounter++;
        }
      }]);

      function AnimaticNode(args) {
        _classCallCheck(this, AnimaticNode);

        this._handler = args.handler || null;
        this._backwardFunction = args.backward || null;
        this._pauseFunction = args.pause || null;
        this._resetFunction = args.reset || null;
        this._isFunctionHandler = args.handler instanceof Function;
        this._id = AnimaticNode._getNewId();
        this._orchestra = null;
        this._animationStatus = AnimationStatus.PAUSED;
        this._previousNodes = new Map();
        this._previousCountdown = 0;
        this._nextNodes = new Map();
        this._nextCountdown = 0;
      } // properties


      _createClass(AnimaticNode, [{
        key: "to",
        // connections
        value: function to(toNode) {
          if (this.orchestra === null) throw Error("Can't append to a stray node! Add it as an orchestra root first!");
          if (this.orchestra.animationStarted) throw Error("Can't add new animatic nodes once the orchestration started!"); // connect new node with orchestra of source node

          toNode.orchestra = this.orchestra;

          this.orchestra._nodes.set(toNode.id, toNode);

          this._nextNodes.set(toNode.id, toNode); // establish reverse relation


          toNode._previousNodes.set(this.id, this);

          toNode._previousCountdown++;
          return toNode;
        }
      }, {
        key: "split",
        value: function split(firstTarget) {
          var _this$orchestra;

          if (this.orchestra === null) return;

          for (var _len = arguments.length, otherTargets = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            otherTargets[_key - 1] = arguments[_key];
          }

          (_this$orchestra = this.orchestra).split.apply(_this$orchestra, [this, firstTarget].concat(otherTargets));
        }
      }, {
        key: "unite",
        value: function unite(firstSource) {
          var _this$orchestra2;

          if (this.orchestra === null) return;

          for (var _len2 = arguments.length, otherSources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            otherSources[_key2 - 1] = arguments[_key2];
          }

          (_this$orchestra2 = this.orchestra).split.apply(_this$orchestra2, [this, firstSource].concat(otherSources));

          return this;
        } // control

      }, {
        key: "forward",
        value: function forward() {
          this._animationStatus = AnimationStatus.RUNNING;
          var self = this;
          this._previousCountdown--;
          if (this._previousCountdown > 0) return;
          this._previousCountdown = 0;

          function _touchEnd() {
            self._animationStatus = AnimationStatus.COMPLETED;

            if (self.nextCount != 0) {
              self.orchestra.disableNode(self.id);
            } else {
              self.orchestra.touchEnd();
            }

            self._nextCountdown = self.nextCount;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = self._nextNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 2),
                    id = _step$value[0],
                    node = _step$value[1];

                node.forward();
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }
          this.orchestra.activateNode(this.id);

          if (this._isFunctionHandler) {
            if (this._handler === null) _touchEnd();

            this._handler(_touchEnd);
          } else {
            this._handler.forward(_touchEnd);
          }
        }
      }, {
        key: "pause",
        value: function pause() {
          if (this._pauseFunction === null) return;
          this._animationStatus = AnimationStatus.PAUSED;

          if (this._isFunctionHandler) {
            this._pauseFunction();
          } else {
            this._handler.pause();
          }
        }
      }, {
        key: "backward",
        value: function backward() {
          this._animationStatus = AnimationStatus.RUNNING;
          var self = this;
          this._nextCountdown--;
          if (this._nextCountdown > 0) return;
          this._nextCountdown = 0;

          function _touchStart() {
            self._animationStatus = AnimationStatus.COMPLETED;

            if (self.previousCount != 0) {
              self.orchestra.disableNode(self.id);
            } else {
              self.orchestra.touchStart();
            }

            self._previousCountdown = self.previousCount;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = self._previousNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _step2$value = _slicedToArray(_step2.value, 2),
                    id = _step2$value[0],
                    node = _step2$value[1];

                node.backward();
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
          this.orchestra.activateNode(this.id);

          if (this._isFunctionHandler) {
            if (this._backwardFunction === null) _touchStart();

            this._backwardFunction(_touchStart);
          } else {
            this._handler.backward(_touchStart);
          }
        }
      }, {
        key: "reset",
        value: function reset() {
          if (this._resetFunction === null) return;
          this._animationStatus = AnimationStatus.PAUSED;

          if (this._isFunctionHandler) {
            this._resetFunction();
          } else {
            this._handler.reset();
          }
        }
      }, {
        key: "id",
        get: function get() {
          return this._id;
        }
      }, {
        key: "orchestra",
        get: function get() {
          return this._orchestra;
        },
        set: function set(newOrchestra) {
          if (this._orchestra !== null && this._orchestra != newOrchestra) throw Error("AnimaticNode with id ".concat(this.id, " already belongs to an orchestra!"));
          this._orchestra = newOrchestra;
        }
      }, {
        key: "previousCount",
        get: function get() {
          return this._previousNodes.size;
        }
      }, {
        key: "previousCountdown",
        get: function get() {
          return this._previousCountdown;
        }
      }, {
        key: "nextCount",
        get: function get() {
          return this._nextNodes.size;
        }
      }, {
        key: "nextCountdown",
        get: function get() {
          return this._nextCountdown;
        }
      }, {
        key: "status",
        get: function get() {
          return this._animationStatus;
        }
      }]);

      return AnimaticNode;
    }();

    _defineProperty(AnimaticNode, "_idCounter", 0);

    var AnimaticOrchestra =
    /*#__PURE__*/
    function () {
      function AnimaticOrchestra() {
        _classCallCheck(this, AnimaticOrchestra);

        this._rootNodes = new Map();
        this._nodes = new Map();
        this._activeNodes = new Map();
        this._isAnimationStarted = false;
        this._onBeginCallbacks = new Array();
        this._onCompleteCallbacks = new Array();
        this._animationStatus = AnimationStatus.PAUSED;
      } // properties


      _createClass(AnimaticOrchestra, [{
        key: "add",
        // connections
        value: function add(node) {
          if (this._isAnimationStarted) throw Error("Can't add new animatic nodes once the orchestration started!");

          this._rootNodes.set(node.id, node);

          this._activeNodes.set(node.id, node);

          this._nodes.set(node.id, node);

          node.orchestra = this;
          return node;
        }
      }, {
        key: "_splitList",
        value: function _splitList(source, targets) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = targets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var target = _step.value;
              source.to(target);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }, {
        key: "split",
        value: function split(source, firstTarget) {
          if (!this._nodes.has(source.id)) throw Error("".concat(source, " is not part of the orchestra!"));

          if (firstTarget instanceof Array) {
            var targets = firstTarget;

            this._splitList(source, targets);
          } else {
            source.to(firstTarget);

            for (var _len = arguments.length, otherTargets = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              otherTargets[_key - 2] = arguments[_key];
            }

            this._splitList(source, otherTargets);
          }
        }
      }, {
        key: "_uniteList",
        value: function _uniteList(target, sources) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = sources[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var source = _step2.value;
              source.to(target);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }, {
        key: "unite",
        value: function unite(target, firstSource) {
          if (firstSource instanceof Array) {
            var sources = firstSource;

            this._uniteList(target, sources);
          } else {
            firstSource.to(target);

            for (var _len2 = arguments.length, otherSources = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
              otherSources[_key2 - 2] = arguments[_key2];
            }

            this._uniteList(target, otherSources);
          }

          return target;
        } // control

      }, {
        key: "play",
        value: function play() {
          this._animationStatus = AnimationStatus.RUNNING;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = this._rootNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _step3$value = _slicedToArray(_step3.value, 2),
                  id = _step3$value[0],
                  rootNode = _step3$value[1];

              rootNode.forward();
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      }, {
        key: "pause",
        value: function pause() {
          this._animationStatus = AnimationStatus.PAUSED;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = new Map(this._activeNodes)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var _step4$value = _slicedToArray(_step4.value, 2),
                  id = _step4$value[0],
                  activeNode = _step4$value[1];

              activeNode.pause();
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }, {
        key: "reset",
        value: function reset() {
          this._animationStatus = AnimationStatus.PAUSED;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this._nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _step5$value = _slicedToArray(_step5.value, 2),
                  id = _step5$value[0],
                  node = _step5$value[1];

              node.reset();
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          this._activeNodes = _objectSpread2({}, this._rootNodes);
        }
      }, {
        key: "reverse",
        value: function reverse() {
          this._animationStatus = AnimationStatus.RUNNING;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = new Map(this._activeNodes)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _step6$value = _slicedToArray(_step6.value, 2),
                  id = _step6$value[0],
                  activeNode = _step6$value[1];

              activeNode.backward();
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        } // callbacks

      }, {
        key: "onBegin",
        value: function onBegin(callback) {
          this._onBeginCallbacks.push(callback);
        }
      }, {
        key: "onComplete",
        value: function onComplete(callback) {
          this._onCompleteCallbacks.push(callback);
        } // notifications

      }, {
        key: "_callBegan",
        value: function _callBegan() {
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = this._onBeginCallbacks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var callback = _step7.value;
              callback();
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                _iterator7["return"]();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }
        }
      }, {
        key: "_callCompleted",
        value: function _callCompleted() {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = this._onCompleteCallbacks[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var callback = _step8.value;
              callback();
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      }, {
        key: "activateNode",
        value: function activateNode(nodeId) {
          this._activeNodes.set(nodeId, this._nodes.get(nodeId));
        }
      }, {
        key: "disableNode",
        value: function disableNode(nodeId) {
          this._activeNodes["delete"](nodeId);
        }
      }, {
        key: "touchStart",
        value: function touchStart() {
          var previousCount = 0;
          var anyIncompleteNode = false;
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = this._activeNodes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var _step9$value = _slicedToArray(_step9.value, 2),
                  id = _step9$value[0],
                  node = _step9$value[1];

              previousCount += node.previousCount;
              anyIncompleteNode = anyIncompleteNode || node.status != AnimationStatus.COMPLETED;
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          if (previousCount == 0 && !anyIncompleteNode) {
            this._animationStatus = AnimationStatus.COMPLETED;

            this._callCompleted();
          }
        }
      }, {
        key: "touchEnd",
        value: function touchEnd() {
          var nextCount = 0;
          var anyIncompleteNode = false;
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = this._activeNodes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var _step10$value = _slicedToArray(_step10.value, 2),
                  id = _step10$value[0],
                  node = _step10$value[1];

              nextCount += node.nextCount;
              anyIncompleteNode = anyIncompleteNode || node.status != AnimationStatus.COMPLETED;
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                _iterator10["return"]();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }

          if (nextCount == 0 && !anyIncompleteNode) {
            this._animationStatus = AnimationStatus.COMPLETED;

            this._callCompleted();
          }
        }
      }, {
        key: "rootNodes",
        get: function get() {
          return this._rootNodes;
        }
      }, {
        key: "allNodes",
        get: function get() {
          return this._nodes;
        }
      }, {
        key: "activeNodes",
        get: function get() {
          return this._activeNodes;
        }
      }, {
        key: "animationStarted",
        get: function get() {
          return this._isAnimationStarted;
        }
      }, {
        key: "finished",
        get: function get() {
          return new Promise(function (resolve, reject) {});
        }
      }, {
        key: "status",
        get: function get() {
          return this._animationStatus;
        }
      }]);

      return AnimaticOrchestra;
    }();

    var animatic = {
      AnimationStatus: AnimationStatus,
      AbstractAnimaticAdapterNode: AbstractAnimaticAdapterNode,
      AnimaticNode: AnimaticNode,
      AnimaticOrchestra: AnimaticOrchestra,
      orchestra: function orchestra() {
        return new AnimaticOrchestra();
      },
      node: function node(args) {
        return new AnimaticNode(args);
      }
    };

    return animatic;

}());

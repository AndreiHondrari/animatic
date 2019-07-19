/*
    AnimaticJS - JavaScript library for execution orchestration.

    Author: Andrei-George Hondrari
    E-mail: andrei.hondrari@gmail.com
    Website: https://andreihondrari.com
    Github: https://github.com/AndreiHondrari
    Created on: July 2019
*/


(function (Animatic) {
  'use strict';

  Animatic = Animatic && Animatic.hasOwnProperty('default') ? Animatic['default'] : Animatic;

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

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var AnimeAdapterNode =
  /*#__PURE__*/
  function (_Animatic$AbstractAni) {
    _inherits(AnimeAdapterNode, _Animatic$AbstractAni);

    function AnimeAdapterNode(opts) {
      var _this;

      _classCallCheck(this, AnimeAdapterNode);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(AnimeAdapterNode).call(this));
      opts.autoplay = false;
      _this._animationInstance = anime(opts);
      return _this;
    } // properties


    _createClass(AnimeAdapterNode, [{
      key: "forward",
      // control
      value: function forward(done) {
        this._animationInstance.finished.then(function () {
          done();
        });

        this._animationInstance.direction = "normal";

        this._animationInstance.play();
      }
    }, {
      key: "pause",
      value: function pause() {
        this._animationInstance.pause();
      }
    }, {
      key: "backward",
      value: function backward(done) {
        var self = this;

        this._animationInstance.finished.then(function () {
          done();
        });

        setTimeout(function () {
          self._animationInstance.direction = "reverse";

          self._animationInstance.play();
        }, 0);
      }
    }, {
      key: "adaptee",
      get: function get() {
        return this._animationInstance;
      }
    }]);

    return AnimeAdapterNode;
  }(Animatic.AbstractAnimaticAdapterNode);

  var AnimeTimelineAdapterNode =
  /*#__PURE__*/
  function (_Animatic$AbstractAni2) {
    _inherits(AnimeTimelineAdapterNode, _Animatic$AbstractAni2);

    function AnimeTimelineAdapterNode(args) {
      var _this2;

      _classCallCheck(this, AnimeTimelineAdapterNode);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(AnimeTimelineAdapterNode).call(this));
      var timelineOpts = args.opts || {};
      var timeNodes = args.nodes || []; // make sure the node has full control

      timelineOpts.autoplay = false;
      _this2._timelineInstance = anime.timeline(timelineOpts);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = timeNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          _this2._timelineInstance.add(node);
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

      return _this2;
    } // properties


    _createClass(AnimeTimelineAdapterNode, [{
      key: "forward",
      value: function forward(done) {
        this._timelineInstance.finished.then(function () {
          done();
        });

        this._timelineInstance.direction = "normal";

        this._timelineInstance.play();
      }
    }, {
      key: "pause",
      value: function pause() {
        this._timelineInstance.pause();
      }
    }, {
      key: "backward",
      value: function backward(done) {
        this._timelineInstance.finished.then(function () {
          done();
        });

        this._timelineInstance.direction = "reverse";

        this._timelineInstance.play();
      }
    }, {
      key: "adaptee",
      get: function get() {
        return this._timelineInstance;
      }
    }]);

    return AnimeTimelineAdapterNode;
  }(Animatic.AbstractAnimaticAdapterNode);

  Animatic.AnimeAdapterNode = AnimeAdapterNode;
  Animatic.AnimeTimelineAdapterNode = AnimeTimelineAdapterNode;

  Animatic.animeNode = function (opts) {
    return Animatic.node({
      handler: new AnimeAdapterNode(opts)
    });
  };

  Animatic.animeTimelineNode = function (opts) {
    return Animatic.node({
      handler: new AnimeTimelineAdapterNode(opts)
    });
  };

}(Animatic));

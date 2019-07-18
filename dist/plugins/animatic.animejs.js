/*
    AnimaticJS - JavaScript library for execution orchestration.

    Author: Andrei-George Hondrari
    E-mail: andrei.hondrari@gmail.com
    Website: https://andreihondrari.com
    Github: https://github.com/AndreiHondrari
    Created on: July 2019
*/


(function() {
    class AnimeAdapterNode extends Animatic.AbstractAnimaticAdapterNode {

        constructor(opts) {
            super();
            opts.autoplay = false;
            this._animationInstance = anime(opts);
        }

        // properties
        get adaptee() {
            return this._animationInstance;
        }

        // control
        forward(done) {
            this._animationInstance.finished.then(function() {
                done();
            });

            this._animationInstance.direction = "normal";
            this._animationInstance.play();
        }

        pause() {
            this._animationInstance.pause();
        }

        backward(done) {
            const self = this;
            this._animationInstance.finished.then(function() {
                done();
            });

            setTimeout(function () {
                self._animationInstance.direction = "reverse";
                self._animationInstance.play();
            }, 0);
        }
    };

    class AnimeTimelineAdapterNode extends Animatic.AbstractAnimaticAdapterNode {
        constructor(args) {
            super();

            const timelineOpts = args.opts || {};
            const timeNodes = args.nodes || [];

            // make sure the node has full control
            timelineOpts.autoplay = false;

            this._timelineInstance = anime.timeline(timelineOpts);

            for (const node of timeNodes) {
                this._timelineInstance.add(node);
            }
        }

        // properties
        get adaptee() {
            return this._timelineInstance;
        }

        forward(done) {
            this._timelineInstance.finished.then(function() {
                done();
            });

            this._timelineInstance.direction = "normal";
            this._timelineInstance.play();
        }

        pause() {
            this._timelineInstance.pause();
        }

        backward(done) {
            this._timelineInstance.finished.then(function() {
                done();
            });

            this._timelineInstance.direction = "reverse";
            this._timelineInstance.play();
        }
    }

    Animatic.AnimeAdapterNode = AnimeAdapterNode;
    Animatic.AnimeTimelineAdapterNode = AnimeTimelineAdapterNode;

    Animatic.animeNode = function(opts) {
        return Animatic.node({handler: new AnimeAdapterNode(opts)});
    };

    Animatic.animeTimelineNode = function(opts) {
        return Animatic.node({handler: new AnimeTimelineAdapterNode(opts)});
    };
})();

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
        constructor(timelineInstance) {
            super();
            this._timelineInstance = timelineInstance;

            // make sure the node has full control
            this._timelineInstance.pause();
            this._timelineInstance.restart();
        }

        // properties
        get adaptee() {
            return this._timelineInstance;
        }

        forward(done) {
            this._timelineInstance.finished.then(function() {
                done();
            });

            this._timelineInstance.play();
        }

        pause() {
            throw Error("Not implemented!");
        }

        backward(done) {
            this._timelineInstance.finished.then(function() {
                done();
            });

            this._timelineInstance.reverse();
        }
    }

    Animatic.AnimeAdapterNode = AnimeAdapterNode;
    // Animatic.AnimeTimelineAdapterNode = AnimeTimelineAdapterNode;

    Animatic.animeNode = function(opts) {
        return Animatic.node({handler: new AnimeAdapterNode(opts)});
    };

    // Animatic.animeTimelineNode = function(opts) {
    //     return Animatic.node({handler: new AnimeTimelineAdapterNode(opts)});
    // };
})();

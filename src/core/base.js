'use strict';


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


export {
    AbstractAnimaticAdapterNode
}

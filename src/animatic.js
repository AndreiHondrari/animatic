'use strict';

import { AnimationStatus } from './core/constants.js';
import { AbstractAnimaticAdapterNode } from './core/base.js';
import AnimaticNode from './core/animaticnode.js';
import AnimaticOrchestra from './core/animaticorchestra.js';


export default {
    AnimationStatus: AnimationStatus,
    AbstractAnimaticAdapterNode: AbstractAnimaticAdapterNode,
    AnimaticNode: AnimaticNode,
    AnimaticOrchestra: AnimaticOrchestra,

    orchestra: function() {
        return new AnimaticOrchestra();
    },

    node: function(args) {
        return new AnimaticNode(args);
    }
}

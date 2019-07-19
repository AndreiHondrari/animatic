
import {src, dest, series, parallel} from 'gulp';
import path from 'path';
import del from 'del';
import rename from 'gulp-rename';
import merge from 'merge2';
import concat from 'gulp-concat';
import insert from 'gulp-append-prepend';

import rollup from 'gulp-better-rollup';
import babelPlugin from 'rollup-plugin-babel';
import { uglify as uglifyPlugin } from 'rollup-plugin-uglify';

const SRC_DIR = "./src/";
const PLUGINS_DIR = "plugins/";
const DIST_DIR = "./dist/";
const INTRO_FILE = path.join(SRC_DIR, "credits", "intro.js");

function clean(cb) {
    return del(DIST_DIR);
}

function getDistCleaner(subDistPath) {
    return function(cb) {
        return del(path.join(DIST_DIR, subDistPath));
    }
}

function _buildDevelopment(cb) {
    return src(path.join(SRC_DIR, "animatic.js"))
        .pipe(rollup({
            plugins: [babelPlugin()],
        }, {
            format: "iife",
            name: "Animatic",
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildDevelopmentPlugins(cb) {
    return src(path.join(SRC_DIR, PLUGINS_DIR, "*.js"))
        .pipe(rollup({
            plugins: [babelPlugin()],
            external: ["Animatic"],
        }, {
            format: "iife",
            globals: {
                Animatic: "Animatic"
            }
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(path.join(DIST_DIR, PLUGINS_DIR)));
}

function _buildProduction(cb) {
    return src(path.join(SRC_DIR, "*.js"))
        .pipe(rollup({
            plugins: [babelPlugin(), uglifyPlugin()],
        }, {
            format: "iife",
            name: "Animatic",
        }))
        .pipe(rename(function(filePath) {
            filePath.basename += ".min";
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildProductionPlugins(cb) {
    return src(path.join(SRC_DIR, PLUGINS_DIR, "*.js"))
        .pipe(rollup({
            plugins: [babelPlugin(), uglifyPlugin()],
            external: ["Animatic"],
        }, {
            format: "iife",
            globals: {
                Animatic: "Animatic"
            }
        }))
        .pipe(rename(function(filePath) {
            filePath.basename += ".min";
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(path.join(DIST_DIR, PLUGINS_DIR)));
}

function _buildDevelopmentBundle(cb) {

    const animaticStream = src(path.join(SRC_DIR, "animatic.js"))
        .pipe(rollup({
            plugins: [babelPlugin()],
        }, {
            format: "iife",
            name: "Animatic",
        }));

    const pluginsStream = src(path.join(SRC_DIR, PLUGINS_DIR, "*.js"))
        .pipe(rollup({
            plugins: [babelPlugin()],
            external: ["Animatic"],
        }, {
            format: "iife",
            globals: {
                Animatic: "Animatic"
            }
        }));

    return merge([animaticStream, pluginsStream])
        .pipe(concat("animatic.bundle.js"))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildBundle(cb) {

    const animaticStream = src(path.join(SRC_DIR, "animatic.js"))
        .pipe(rollup({
            plugins: [babelPlugin(), uglifyPlugin()],
        }, {
            format: "iife",
            name: "Animatic",
        }));

    const pluginsStream = src(path.join(SRC_DIR, PLUGINS_DIR, "*.js"))
        .pipe(rollup({
            plugins: [babelPlugin(), uglifyPlugin()],
            external: ["Animatic"],
        }, {
            format: "iife",
            globals: {
                Animatic: "Animatic"
            }
        }));

    return merge([animaticStream, pluginsStream])
        .pipe(concat("animatic.bundle.min.js"))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}


const buildAnimaticDevelopment = series(
    getDistCleaner("*.js"),
    _buildDevelopment
);

const buildDevelopmentPlugins = series(
    getDistCleaner(PLUGINS_DIR),
    _buildDevelopmentPlugins
);

const buildAnimaticProduction = series(
    getDistCleaner("*.min.js"),
    _buildProduction
);

const buildProductionPlugins = series(
    getDistCleaner(PLUGINS_DIR),
    _buildProductionPlugins
);

const buildDevelopmentBundle = series(
    getDistCleaner("*.bundle.js"),
    _buildDevelopmentBundle
);

const buildBundle = series(
    getDistCleaner("*.bundle.min.js"),
    _buildBundle
);

const build = series(
    clean,
    parallel(
        buildAnimaticDevelopment,
        buildDevelopmentPlugins,
        buildAnimaticProduction,
        buildProductionPlugins,
        buildBundle
    )
)

export {
    clean,
    build,
    buildAnimaticDevelopment,
    buildDevelopmentPlugins,
    buildAnimaticProduction,
    buildProductionPlugins,
    buildDevelopmentBundle,
    buildBundle
}


import {src, dest, series, parallel} from 'gulp';
import path from 'path';
import del from 'del';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import insert from 'gulp-append-prepend';

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
    return src(path.join(SRC_DIR, "*.js"))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildDevelopmentPlugins(cb) {
    return src(path.join(SRC_DIR, PLUGINS_DIR, "**/*.js"))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(path.join(DIST_DIR, PLUGINS_DIR)));
}

function _buildProduction(cb) {
    return src(path.join(SRC_DIR, "*.js"))
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename(function(filePath) {
            filePath.basename += ".min";
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildProductionPlugins(cb) {
    return src(path.join(SRC_DIR, PLUGINS_DIR, "**/*.js"))
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename(function(filePath) {
            filePath.basename += ".min";
        }))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(path.join(DIST_DIR, PLUGINS_DIR)));
}

function _buildDevelopmentBundle(cb) {
    return src([
        path.join(SRC_DIR, "*.js"),
        path.join(SRC_DIR, PLUGINS_DIR, "**/*.js")
    ])
        .pipe(concat("animatic.bundle.js"))
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}

function _buildBundle(cb) {
    return src([
        path.join(SRC_DIR, "*.js"),
        path.join(SRC_DIR, PLUGINS_DIR, "**/*.js")
    ])
        .pipe(concat("animatic.bundle.min.js"))
        .pipe(babel())
        .pipe(uglify())
        .pipe(insert.prependFile(INTRO_FILE, "\n\n\n"))
        .pipe(dest(DIST_DIR));
}


const buildDevelopment = series(
    getDistCleaner("*.js"),
    _buildDevelopment
);

const buildDevelopmentPlugins = series(
    getDistCleaner(path.join(PLUGINS_DIR)),
    _buildDevelopmentPlugins
);

const buildProduction = series(
    getDistCleaner("*.js"),
    _buildProduction
);

const buildProductionPlugins = series(
    getDistCleaner(path.join(PLUGINS_DIR)),
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
        buildDevelopment,
        buildDevelopmentPlugins,
        buildProduction,
        buildProductionPlugins,
        buildBundle
    )
)

export {
    clean,
    build,
    buildDevelopment,
    buildDevelopmentPlugins,
    buildProduction,
    buildProductionPlugins,
    buildDevelopmentBundle,
    buildBundle
}

'use strict';

var async = require('grunt').util.async;

module.exports = function (task, exec, done) {
    var options = task.options({
        message: 'Commit',
        ignoreEmpty: false
    });

    function addFiles(files, cb) {
        async.forEachSeries(files.src, addFile, cb);
    }

    function addFile(file, cb) {
        exec("add", file, options.spawn_opts || {}, cb);
    }

    function checkStaged(cb) {
        exec("diff", "--cached", "--exit-code", options.spawn_opts || {}, function (err, result, code) {
            cb(null, code);
        });
    }

    async.forEachSeries(task.files, addFiles, function (err) {
        if (err) {
            return done(err);
        }

        checkStaged(function (err, staged) {
            if (err) {
                return done(err);
            }

            if (!options.ignoreEmpty || staged) {
                exec("commit", "-m", options.message, options.spawn_opts || {}, done);
            } else {
                done();
            }
        });
    });
};

module.exports.description = 'Commit a git repository.';

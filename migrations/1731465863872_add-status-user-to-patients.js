/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("patients", {
        status_user: {
            type: "INTEGER",
            default: 0,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumns("patients", ["status_user"]);
};
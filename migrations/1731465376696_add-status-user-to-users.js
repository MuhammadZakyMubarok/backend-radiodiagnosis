/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("users", {
        status_user: {
            type: "INTEGER",
            default: 0,
        },
    });
};

exports.down = pgm => {
    pgm.dropColumns("users", ["status_user"]);
};
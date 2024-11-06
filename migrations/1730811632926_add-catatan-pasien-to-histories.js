/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns("histories", {
        catatan_pasien: {
            type: "varchar(100)",
        },
    });
};

exports.down = pgm => {
    pgm.dropColumns("histories", ["catatan_pasien"]);
};

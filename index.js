var Filter = class {
    constructor(enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing, pokemon, min_cp, max_cp, min_atk, max_atk, min_def, max_def, min_sta, max_sta, quick_move, charge_move, size, gender) {
        enabled         = enabled || "True";
        min_dist        = min_dist || "0";
        max_dist        = max_dist || "inf";
        min_cp          = min_cp || "0";
        max_cp          = max_cp || "4760";
        min_iv          = min_iv || "0";
        max_iv          = max_iv || "100";
        min_atk         = min_atk || "0";
        max_atk         = max_atk || "15";
        min_def         = min_def || "0";
        max_def         = max_def || "15";
        min_sta         = min_sta || "0";
        max_sta         = max_sta || "15";
        quick_move      = quick_move || null;
        charge_move     = charge_move || null;
        size            = size || null;
        gender          = gender || null;
        ignore_missing  = ignore_missing || "False";

        this.enabled                = enabled;
        this.default                = {};
        this.default.min_dist       = min_dist;
        this.default.max_dist       = max_dist;
        this.default.min_cp         = min_cp;
        this.default.max_cp         = max_cp;
        this.default.min_iv         = min_iv;
        this.default.max_iv         = max_iv;
        this.default.min_atk        = min_atk;
        this.default.max_atk        = max_atk;
        this.default.min_def        = min_def;
        this.default.max_def        = max_def;
        this.default.min_sta        = min_sta;
        this.default.max_sta        = max_sta;
        this.default.quick_move     = quick_move;
        this.default.charge_move    = charge_move;
        this.default.moveset        = null;
        this.default.size           = size;
        this.default.gender         = gender;
        this.default.ignore_missing = ignore_missing;
    }
};

var fs          = require('fs');
var beautify    = require('json-beautify');
var config      = require('./config.json');

// Todo: Get JSON from RM github raw content.
var pokemon = require('./pokemon.json');

/**
 * Generates a pokealarm filter based for a specified rarity/rarities.
 *
 * @param string types              Comma separated string of types with no spaces i.e. "grass,fighting" or "grass".
 * @param string enabled            Enable the filter? Default True.
 * @param Array additional_pokemon  An array of objects i.e. [{"Pokemon":"True"}]
 * @param string min_dist           Minimum distance. Default 0.
 * @param string max_dist           Maximum distance. Default inf.
 * @param string min_iv             Minimum IV of Pokemon. Default 0.
 * @param string max_iv             Maximum IV of Pokemon. Default 100.
 * @param string ignore_missing     Default False.
 */
pokemon.generateFilter = function(types, additional_pokemon, enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing) {
    console.log("PokeAlarm filter generator - Created by 3my\n");

    if (typeof types !== "string") {
        console.log("types parameter not given. Setting to default ['grass'].");
        types = ['grass'];
    } else {
        // Just incase the format is incorrect, set default (common).
        if (!(types.split(',') instanceof Array)) {
            console.error("invalid format for types. Setting to default ['grass']");
            types = ['grass'];
        } else {
            console.log("multiple types provided (" + types + ")");
            types = types.split(',');
        }
    }

    additional_pokemon = additional_pokemon || [];

    if (!(additional_pokemon instanceof Array)) {
        console.error("param additional_pokemon isn't an Array. Forcing an array.");
        additional_pokemon = [];
    }

    for (var i = 0; i < types.length; i++) {
        // Create a filter object for this type.
        var filter = new Filter(enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing);

        for (var key in this) {
            var pokemonObject = this[key];

            for (var type in pokemonObject.types) {
                var pokemonType = this[key].types[type].type;

                // Found something of the specified type. Add to the filter.
                if (pokemonType.toLowerCase() == types[i]) {
                    filter[pokemonObject.name] = "True";
                }
            }
        }

        var type = types[i];
        var filename = type.split(' ').join('') + ".json";

        writeFilter(type, filename, filter);
    }
};

var writeFilter = function(type, filename, filter) {
    var beautifulJSON = beautify({"pokemon": filter}, null, 2, 132);

    var directory = "filters/";

    // Why isn't this just included in the repo?
    if (!fs.existsSync(directory)) {
        console.log("Creating a directory to put filters in.");
        fs.mkdirSync(directory);
    }

    filename = directory + filename;

    fs.writeFile(filename, beautifulJSON, function(error) {
        if (error) {
            return console.error(error);
        }

        console.log(
            "\nPokeAlarm JSON filter file for Pokemon that are " + type + " were written to the file " + filename + "!"
        );
    });
};

pokemon.generateFilter(config.types, config.additional_pokemon);


var Filter = class {
    constructor(enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing, pokemon) {
        enabled         = enabled || "True";
        min_dist        = min_dist || "0";
        max_dist        = max_dist || "inf";
        min_iv          = min_iv || "0";
        max_iv          = max_iv || "100";
        ignore_missing  = ignore_missing || "False"

        this.enabled        = enabled;
        this.min_dist       = min_dist;
        this.max_dist       = max_dist;
        this.min_iv         = min_iv;
        this.max_iv         = max_iv;
        this.ignore_missing = ignore_missing;
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
 * @param string rarity             Comma separated string of rarities with no spaces i.e. "very rare,rare" or "rare".
 *                                  Options: Common, Uncommon, Rare, Very Rare, Ultra Rare.
 * @param string enabled            Enable the filter? Default True.
 * @param Array additional_pokemon  An array of objects i.e. [{"Pokemon":"True"}]
 * @param string min_dist           Minimum distance. Default 0.
 * @param string max_dist           Maximum distance. Default inf.
 * @param string min_iv             Minimum IV of Pokemon. Default 0.
 * @param string max_iv             Maximum IV of Pokemon. Default 100.
 * @param string ignore_missing     Default False.
 */
pokemon.generateFilter = function(rarities, additional_pokemon, enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing) {
    console.log("PokeAlarm filter generator - Created by 3my\n");

    if (typeof rarities !== "string") {
        console.log("rarities parameter not given. Setting to default ['common'].");
        rarities = ['common'];
    } else {
        // Just incase the format is incorrect, set default (common).
        if (!(rarities.split(',') instanceof Array)) {
            console.error("invalid format for rarities. Setting to default ['common']");
            rarities = ['common'];
        } else {
            console.log("multiple rarities provided (" + rarities + ")");
            rarities = rarities.split(',');
        }
    }

    additional_pokemon = additional_pokemon || [];

    if (!(additional_pokemon instanceof Array)) {
        console.error("param additional_pokemon isn't an Array. Forcing an array.");
        additional_pokemon = [];
    }

    var filenames = [];

    var filter = new Filter(enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing);

    for (var i = 0; i < rarities.length; i++) {
        if (config.same_file === "True") {
            console.log("Adding Pokemon rarity " + rarities[i] + " to the same filter!");
        }

        if (config.same_file === "False" && i > 0) {
            console.log("Creating a new filter for Pokemon rarity " + rarities[i] + "!");
            var filter = new Filter(enabled, min_dist, max_dist, min_iv, max_iv, ignore_missing);
        }

        for (var key in this) {
            var pokemonObject = this[key];

            if (pokemonObject.rarity === 'undefined') {
                continue;
            }

            if (typeof pokemonObject === 'function') {
                continue;
            }

            pokemonObject.rarity = pokemonObject.rarity.toLowerCase();

            if (rarities[i].toLowerCase() === pokemonObject.rarity) {
                console.log("Adding " + pokemonObject.name + " to the PokeAlarm filter.");
                filter[pokemonObject.name] = "True";
            }
        }

        for (var j = 0; j < additional_pokemon.length; j++) {
            if (!filter.hasOwnProperty(additional_pokemon[j].Name)) {
                console.log("Adding additional Pokemon " + additional_pokemon[j].Name + " to the PokeAlarm filter.");
                filter[additional_pokemon[j].Name] = "True"
            }
        }

        var rarity = rarities[i];
        var filename = rarity.split(' ').join('') + ".json";

        filenames.push(rarity.split(' ').join(''));

        if (config.same_file === "True") {
            if (i === rarities.length - 1) {
                filename = filenames.join('_') + ".json";
                writeFilter(rarity, filename, filter);
            }
        } else {
            writeFilter(rarity, filename, filter);
        }

        console.log("\n");
    }
};

var writeFilter = function(rarity, filename, filter) {
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
            "\nPokeAlarm JSON filter file for Pokemon that are " + rarity + " were written to the file " + filename + "!"
        );
    });
};

pokemon.generateFilter(config.rarities, config.additional_pokemon);


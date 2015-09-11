var _ = require('lodash'),
    Localizer = require('./lib/localizer'),
    Path = require('path'),
    Fs = require('fs'),
    Handlebars = require('handlebars'),
    internals = {
        options: {
            preventIndent: true
        }
    },
    Helpers = [];

// Load Helpers
Fs.readdirSync(Path.join(__dirname, 'helpers')).forEach(function(file) {
    Helpers.push(require('./helpers/' + file));
});


/**
 * Theme renderer constructor
 * @param {Object} templates
 * @param {String} themeId
 * @param {Object} cache
 */
function Theme(templates, themeId, cache) {
    var self = this,
        handlebars = Handlebars.create();

    handlebars.templates = {};

    self.options = internals.options;
    self.translate;
    self.inject = {};
    self.helpers = [];
    self.decorators = [];

    // Register Partials/Templates and optionally cache them
    _.forOwn(templates, function (content, fileName) {
        var precompiled,
            cacheKey = 'theme:' + themeId + ':' + fileName;

        if (cache) {
            if (cache.has(cacheKey)) {
                precompiled = cache.get(cacheKey);
            } else {
                precompiled = handlebars.precompile(content, self.options);
                cache.set(cacheKey, precompiled);
            }
            
            eval('var template = ' + precompiled);
            handlebars.templates[fileName] = handlebars.template(template);

        } else {
            handlebars.templates[fileName] = handlebars.compile(content, self.options);
        }
    });

    _.each(Helpers, function(Helper) {
        self.helpers.push(new Helper(handlebars));
    });

    /**
     * @param {String} acceptLanguage
     * @param {Object} translations
     */
    self.loadTranslations = function (acceptLanguage, translations) {
        // Make translations available to the helpers
        self.translate =  Localizer(acceptLanguage, translations);
    };

    /**
     * @param {Function} decorator
     */
    self.addDecorator = function (decorator) {
        self.decorators.push(decorator);
    }

    /**
     * @param {String} path
     * @param {Object} context
     * @return {String}
     */
    self.render = function (path, context) {
        var output;

        _.each(self.helpers, function(helper) {
            helper.register(context, self);
        });

        handlebars.partials = handlebars.templates;

        output = handlebars.templates[path](context);

        _.each(self.decorators, function (decorator) {
            output = decorator(output);
        });

        return output;
    };
}


/**
 * @param {Object} cache
 * @return {Object}
 */
module.exports = function (cache) {
    return {
        /**
         * @param {Object} templates
         * @param {String} themeId
         * @param {Object} cache
         * @return {Object}
         */
        make: function (templates, themeId) {
            return new Theme(templates, themeId || '1', cache);
        }
    };
};

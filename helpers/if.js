'use strict';

var _ = require('lodash');

function helper(paper) {
    paper.handlebars.registerHelper('if', function (lvalue, operator, rvalue) {
        const options = arguments[arguments.length - 1];
        var result;

        function isOptions(obj) {
            return _.isObject(obj) && obj.fn;
        }

        // Only parameter
        if (isOptions(operator)) {

            // If an array is passed as the only parameter
            if (_.isArray(lvalue)) {
                result = lvalue.length;
            }
            // If an empty object is passed, treat as false
            else if (_.isEmpty(lvalue) && _.isObject(lvalue)) {
                result = false;
            }
            // Everything else
            else {
                result = lvalue;
            }
        } else {

            if (isOptions(rvalue)) {
                // @TODO: this is block is for backwards compatibility with 'compare' helper
                // Remove after operator='==' is removed from stencil theme
                rvalue = operator;
                operator = options.hash.operator || "==";
            }

            switch (operator) {
            case '==':
                result = (lvalue == rvalue);
                break;

            case '===':
                result = (lvalue === rvalue);
                break;

            case '!=':
                result = (lvalue != rvalue);
                break;

            case '!==':
                result = (lvalue !== rvalue);
                break;

            case '<':
                result = (lvalue < rvalue);
                break;

            case '>':
                result = (lvalue > rvalue);
                break;

            case '<=':
                result = (lvalue <= rvalue);
                break;

            case '>=':
                result = (lvalue >= rvalue);
                break;

            case 'typeof':
                result = (typeof lvalue === rvalue);
                break;

            default:
                throw new Error("Handlerbars Helper 'if' doesn't know the operator " + operator);
            }
        }

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
}

module.exports = helper;

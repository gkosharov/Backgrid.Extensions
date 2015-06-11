/**
 * Created by g.kosharov on 20.5.2015 г..
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["backbone", "underscore", "backgrid"], factory);
    } else if (typeof exports == "object") {
        // CommonJS
        module.exports = factory(require("backbone"), require("backgrid"), require("underscore"));
    }
    // Browser
    else factory(root.Backbone, root._);

}(this, function (Backbone, _) {

    "use strict";
    /**
     ActionRow is a row that triggers action on click

     @class Backgrid.Extension.ActionRow
     @extends Backgrid.Row
     */
    var ActionRow = Backgrid.Extension.ActionRow = Backgrid.Row.extend({
        initialize: function (options) {
            console.log("Row initialized");
            var columns = options.columns;
            this.entity = options.model.collection.entity;
            this.action = options.model.collection.action;
            Backgrid.Row.prototype.initialize.call(this, options);
        },
        events: {
            "click": "onClick"
        },
        onClick: function (event) {
            var event = "select-row";

            this.model.action = this.action ? this.action : null;

            var selectedRow = this.$el.siblings('.selected-row');
            if (selectedRow) {
                selectedRow.removeClass('selected-row');
            }
            //TODO implement multi select on one table if needed
            this.el.classList.add('selected-row');
            this.el.classList.add('check');
            Backbone.trigger("row:selected", this.model);
        }
    });

}));
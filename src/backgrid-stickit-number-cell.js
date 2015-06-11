/**
 * Created by g.kosharov on 1.6.2015 г..
 */
/**
 * Created by g.kosharov on 21.5.2015 г..
 * @module Backgrid.StickitNumberCell
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(["backbone", "backgrid", "underscore", "stickit"], factory);
    } else if (typeof exports == "object") {
        // CommonJS
        module.exports = factory(require("backbone"), require("backgrid"), require("underscore"), require("stickit"));
    }
    // Browser
    else factory(root.Backbone, root.Backgrid, root._);

}(this, function (Backbone, Backgrid, _) {

    if(!Backgrid) Backgrid = window.Backgrid;
    /**
     * @exports StickitNumberCell
     * @class StickitNumberCell
     * @constructor
     * @augments Backbone.View
     * @classdesc A number cell for the backgrid which uses Backbone.Stickit for model-view binding
     */
    var StickitNumberCell = Backgrid.StickitNumberCell = Backbone.View.extend({

        /** @property */
        tagName: "td",
        /** @property */
        className: "number-cell text-right",
        /** @property */
        bindings: {},

        /**
         * @public
         * @param options
         */
        initialize: function (options) {
            this.column = options.column;
            if (!(this.column instanceof Backgrid.Column)) {
                this.column = new Backgrid.Column(this.column);
            }

            var column = this.column, model = this.model, $el = this.$el;
            this.$el.attr("data-name", column.get("name"));
            this.$el.attr("id", column.get("name"));
            this.listenTo(model, "backgrid:error", this.renderError);
            if (Backgrid.callByNeed(column.editable(), column, model)) $el.addClass("editable");
            if (Backgrid.callByNeed(column.sortable(), column, model)) $el.addClass("sortable");
            if (Backgrid.callByNeed(column.renderable(), column, model)) $el.addClass("renderable");

        },

        render: function () {
            var child = this.getChildModel();
            var domEl = "div";
            if(child.get("readonly")) {
                if (!this.$("div").length) {
                    this.$el.append("<div></div>");
                }
            }else{
                if (!this.$("input").length) {
                    this.$el.append("<input/>");
                    domEl = "input";
                }
            }
            this._setupValidation();
            this._setupBinding(domEl);
            this.stickit();

            return this;
        },
        getChildModel: function(){
            var properties = this.model.get("properties");
            var result;
            if(properties instanceof Backbone.Collection){
                result = properties.findWhere({id: this.column.get("name")});
            }
            return result;
        },

        _setupValidation: function(){
            var id = this.column.get("name");

            var cellModel = this.getChildModel();
            var required = false;
            if(cellModel) {
                required = cellModel.get("required");
            }
            this.model.validation[id] = {};
            this.model.validation[id].required = required;
        },
        /**
         * @private
         * @desc adds model-view binding for the number element by calling the addBinding method from stickit
         */
        _setupBinding: function(domEl){

            var formatFn = this._format;
            this.addBinding(this.model, domEl, {

                observe: this.column.get("name"),

                onGet: function (val, options) {
                    return formatFn(val);
                },
                onSet: function (val, options) {
                    try {
                        console.log("set " + val);
                        var target = options.observe;
                        var model = options.view.model;
                        var properties = model.get("properties");
                        if (properties) {
                            var targetModel = properties.findWhere({"id": target});
                            targetModel.set({"value": val});
                        }
                    } catch (e) {
                        console.log("failed to set " + options.observe);
                    }
                    return val;
                }

            });
        },
        _format: function(val){
            return Backbone.Radio.channel("global").request("format:number", val);
        }
    });

}));

/**
 * Created by g.kosharov on 21.5.2015 г..
 * @module Backgrid.StickitSelectCell
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
     * @exports StickitSelectCell
     * @class StickitSelectCell
     * @constructor
     * @augments Backbone.View
     * @classdesc A select cell for the backgrid wihch uses Backbone.Stickit for model-view binding
     */
    var StickitSelectCell = Backgrid.StickitSelectCell = Backbone.View.extend({

        /** @property */
        tagName: "td",
        /** @property */
        className: "select-cell",
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
            this.id = column.get("name");
            this.$el.attr("data-name", column.get("name"));
            this.$el.attr("id", column.get("name"));
            this.listenTo(model, "backgrid:error", this.renderError);
            if (Backgrid.callByNeed(column.editable(), column, model)) $el.addClass("editable");
            if (Backgrid.callByNeed(column.sortable(), column, model)) $el.addClass("sortable");
            if (Backgrid.callByNeed(column.renderable(), column, model)) $el.addClass("renderable");
            this._setupValidation();
        },
        /**
         * @public
         * @returns {Backgrid.VisibleSelectCell}
         */
        render: function () {
            this.$el.append("<select></select>");
            this._setupBinding();
            this.stickit();

            return this;
        },
        /**
         * @desc The model of the row contains attributes in the following structure model.properties(id:selectItem).dataSource. We use the dataSource propoerty to build the collection for the stickit select.
         * @returns {*}
         */
        getOptionValues: function(){
            try {
                var dataSource = this.model.get("properties").findWhere({"id":this.column.get("name")}).get("dataSource");
                var collection = [];
                if (dataSource) {
                    for (var attribute in dataSource.attributes) {
                        collection.push({label: dataSource.get(attribute), value: attribute});
                    }
                }
                return collection;
            }catch(exception){
                return new Backbone.Collection();
            }

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
                required = cellModel.get("required") || false;
            }
            this.model.validation[id] = {};
            this.model.validation[id].required = required;
            if(!this._isBound()) {
                Backbone.Validation.bind(this);
            }
        },
        _isBound: function(){
            var cid = this.cid;
            var associatedViews = this.model.associatedViews;
            for(var i=0; i<associatedViews.length;i++){
                if(associatedViews[i].cid == cid){
                    return true;
                }
            }
            return false;
        },
        /**
         *
         * @private
         * @desc adds model-view binding for the select element by calling the addBinding method from stickit
         */
        _setupBinding: function(){
            var collection = this.getOptionValues();

            this.addBinding(this.model, "select", {

                observe: this.column.get("name"),
                /* default value of the select should be empty string */
                selectOptions: {
                    defaultOption: {
                        label: "",
                        value: ""
                    },
                    validate: true,
                    collection: collection
                },

                onSet: function (val, options) {
                    try {
                        console.log("set " + val);
                        this.$el.find("select").attr("data-val", val);
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
                },
                /* it is necessary to set the data-val attribute of the select element so that it can reliably retrieve the currently selected value from the dom (used for the preview-pane in AVIVA )*/
                onGet: function(val, options){
                    this.$el.find("select").attr("data-val", val);
                    return val;
                }
            });
        },
        remove: function(){
            try {
                Backbone.Validation.unbind(this);
            }catch(exception){
                console.log("Backbone Validation unbind failed for " + this.model.get("id"));
            }
            this.unstickit();
        }
    });

}));
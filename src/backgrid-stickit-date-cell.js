/**
 * Created by g.kosharov on 26.5.2015 г..
 * @author Georgi Kosharov
 * @module StickitDateCell
 * @desc Backgrid.Date cell which uses backbone.stickit to perform two-way data binding
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

    var StickitDateCell = Backgrid.StickitDateCell = Backbone.View.extend({

        /** @property */
        tagName: "td",

        /** @property */
        className: "date-cell",

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
            this.listenTo(model, "backgrid:error", this.renderError);
            if (Backgrid.callByNeed(column.editable(), column, model)) $el.addClass("editable");
            if (Backgrid.callByNeed(column.sortable(), column, model)) $el.addClass("sortable");
            if (Backgrid.callByNeed(column.renderable(), column, model)) $el.addClass("renderable");
            this._setupValidation();
        },
        /**
         * @public
         * @returns {Backgrid.StickitDateCell}
         */
        render: function () {
            //added condition, since backgrid-select-filter causes double render initially
            var child = this.getChildModel();
            var domEl = "div";
            if(child.get("readonly")) {
                if (!this.$("div").length) {
                    this.$el.append("<div></div>");
                }
            }else{
                if (!this.$("input").length) {
                    this.$el.append("<input class='datepicker'/>");
                    this.$(".datepicker").datepicker({
                        format: 'dd/mm/yyyy',
                        orientation: "auto top"
                    });
                    domEl = "input";
                }
            }

            this._setupBinding();
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

            Backbone.Validation.bind(this);
        },
        _setupBinding: function(domEl){
            var formatFn = this._formatDate;
            this.addBinding(this.model, domEl, {
                observe: this.column.get("name"),
                selectOptions: {
                    validate: true
                },
                onGet: function (val, options) {
                    if (val && val !== "") {
                        var result = formatFn(val, {
                            type: "date",
                            inbound: "yyyy-mm-dd",
                            outbound: "dd/mm/yyyy"
                        });
                        return result;
                    } else {
                        return "";
                    }
                },
                onSet: function (val, options) {
                    if (val && val !== "") {
                        var result = formatFn(val, {
                            type: "date",
                            inbound: "dd/mm/yyyy",
                            outbound: "yyyy-mm-dd"
                        });
                        return result;
                    } else {
                        return "";
                    }
                }
            });
        },
        _formatDate: function (val, options) {
            return Backbone.Radio.channel("global").request("format:date", val, options);
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

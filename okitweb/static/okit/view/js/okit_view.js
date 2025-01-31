/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT View Javascript');

class OkitJsonView {
    constructor(okitjson=null, oci_data=null, resource_icons=null, parent_id=null) {
        // Specify / Assign Model
        if (okitjson === null || okitjson === undefined) {
            this.okitjson = new OkitJson();
        } else if (typeof okitjson === 'string') {
            this.okitjson = new OkitJson(okitjson);
        } else if (okitjson instanceof Object) {
            this.okitjson = okitjson;
        } else {
            this.okitjson = new OkitJson();
        }
        if (oci_data !== null) this.oci_data = oci_data;
        if (parent_id !== null) this.parent_id = parent_id;
        if (resource_icons !== null) this.resource_icons = resource_icons;
        console.info(this.constructor.name, this.resource_icons)
        // Define Canvas Root SVG
        // this.canvas = new CanvasView(new Canvas(okitjson), this);
        // Define View Lists
        this.init();
        this.clear();
        // Load Model to View
        this.load();
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static toSvgIconDef(title) {return title.replace(/ /g, '').toLowerCase() + 'Svg';}

    get small_grid_size() {return 8;}
    get grid_size() {return this.small_grid_size * 10;}
    get stroke_colours() {
        return {
            red: "#F80000",
            bark: "#312D2A",
            gray: "#5f5f5f",
            blue: "#0066cc",
            orange: "#ff6600",
            purple: "#400080",
            icon_colour_01: "#F80000",
            icon_colour_02: "#5f5f5f",
            icon_colour_03: "#ff6600",
        };
    }
    get svg_highlight_colour() {return "#00cc00";}
    get top_level_compartment() {let tlc = this.getCompartments().filter(compartment => compartment.isTopLevel())[0]; console.info(`TLC ${tlc}`); console.info(tlc); return tlc;}

    getSafeId(id) {return safeId(id)}

    drop(source, target) {
        let newFunction = 'new' + source.name;
        let getFunction = 'get' + target.type.split(' ').join('');
        console.debug('OkitJsonView: New:', newFunction,'Get:', getFunction)
    }

    init() {return}

    clear() {
        for (const [key, value] of Object.entries(this)) {
            if (Array.isArray(value)) this[key] = [];
        }
    }

    load() {
        this.clear();
        for (const [key, value] of Object.entries(this.getOkitJson())) {
            if (Array.isArray(value)) {
                const func_name = titleCase(key.split('_').join(' ')).split(' ').join('');
                const get_function = `get${func_name}`;
                const new_function = `new${func_name.slice(0, -1)}`;
                // console.warn('Functions:', get_function, new_function);
                for (const resource of this.getOkitJson()[get_function]()) {this[new_function](resource);}
            }
        }
    }

    update(model) {
        if (model && model != null )
        {
            this.okitjson = model;
        }
        this.load();
        this.draw();
    }

    draw(for_export=false) {
        console.warn('draw() function has not been implemented.');
    }

    getOkitJson() {
        return this.okitjson;
    }

    /*
    ** Common View Functions
     */
    addGrid(canvas_svg) {
        canvas_svg.append('rect')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "url(#grid)");
    }

    /*
    ** Artefact Processing
     */
    getResources = () => Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])
    getResource = (id='') => this.getResources().find((r) => r.id === id)
    getFunction(resource_type) {return `get${titleCase(resource_type).split(' ').join('')}`}
    getArrayFunction(resource_type) {return `${this.getFunction(resource_type)}s`}

    // getResource(id='') {
    //     // const resource = Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.id === id)[0]
    //     const resource = Object.values(this).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).find((r) => r.id === id)
    //     console.info('Resource', resource)
    //     return resource
    // }

    // Fragment
    dropFragmentView(target) {
        let view_artefact = this.newFragment(target);
        view_artefact.load();
    }
    newFragment(target) {
        return new FragmentView(this.okitjson.newFragment(target), this);
    }
}

/*
** Simple Artefact View Class for all artefacts that are not Containers
 */
const model_proxy_handler = {}

class OkitArtefactView {
    static cut_copy_paste = {resource: undefined, paste_count: 0, is_cut: false};
    // Class Constants
    // -- Icon
    static get icon_height() {return 45;}
    static get icon_width() {return 45;}
    static get icon_x_tranlation() {return 0;}
    static get icon_y_tranlation() {return 0;}
    static get icon_v_align() {return 'top';}
    static get icon_h_align() {return 'middle';}
    // -- Rectangle
    static get rect_x() {return 0;}
    static get rect_y() {return 0;}
    static get rect_rx() {return 0;}
    static get rect_ry() {return 0;}
    static get rect_fill() {return 'white';}
    static get rect_fill_style() {return 'fill-opacity: .25;';}
    static get rect_stroke_colour() {return this.stroke_colours.bark;}
    static get rect_stroke_width() {return 1;}
    static get rect_stroke_dash() {return 2;}
    static get rect_stroke_space() {return 1;}
    static get rect_stroke_dasharray() {return `${this.rect_stroke_dash}, ${this.rect_stroke_space}`;}
    static get rect_stroke_opacity() {return 0;}
    // -- Foreign Object
    static get fo_width() {return 150}
    static get fo_height() {return '3em'}
    static get fo_x_tranlation() {return this.icon_width + 5;}
    static get fo_y_tranlation() {return 0;}

    constructor(artefact, json_view) {
        this.artefact = artefact;
        // this.view = json_view
        // this.artefact = new Proxy(artefact, model_proxy_handler);
        this.collapsed = true;
        this._recalculate_dimensions = true;
        // Raise Artefact Elements to View Class
        if (this.artefact) {
            Object.entries(this.artefact).forEach(
                ([key, value]) => {
                    if (!(value instanceof Function)) {
                        Object.defineProperty(this, key, {
                            get: function () {
                                // console.warn(`${this.constructor.name} accessing ${key} directly (${typeof value}) ${value}`)
                                return this.artefact[key];
                            }
                        });
                    }
                }
            );
        }
        this.getJsonView = function() {return json_view};
        console.info(this.getOkitJson)
        if (!this.getOkitJson) this.getOkitJson = function() {return json_view.getOkitJson()};
        // Create Properties Sheet Object
        this.newPropertiesSheet()
    }
    get model() {return this.view.model}
    get view() {return this.getJsonView()}

    getChildren = () => Object.values(this.view()).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.parent_id === this.id)
    getThemeCssClass = () => this.getArtifactReference().toLowerCase().replaceAll(' ', '-')
    getAttachedIds = () => []

    get resource() {return this.artefact}
    // Instance Constants
    // -- Reference
    get resource_type() {return this.getArtifactReference();}
    get json_view() {return this.getJsonView();}
    get okit_json() {return this.getJsonView().getOkitJson();}
    get list_name() {return `${this.resource_type.toLowerCase().split(' ').join('_')}s`;}
    get json_model_list() {return this.okit_json[this.list_name];}
    // set json_model_list(list) {this.okit_json[this.list_name] = list;}
    get json_view_list() {return this.json_view[this.list_name];}
    set json_view_list(list) {this.json_view[this.list_name] = list;}
    //get id() {return this.artefact ? this.artefact.id : '';}
    get artefact_id() {return this.artefact ? this.artefact.id : '';}
    get attached() {return false;}
    get compartment_id() {return this.artefact ? this.artefact.compartment_id : '';}
    get parent_id() {return null;}
    get parent() {return null;}
    get children() {return Object.values(this.getJsonView()).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.parent_id === this.id)}
    // get children() {return [];}
    get display_name() {return this.artefact ? this.artefact.display_name : '';}
    get documentation() {return this.artefact ? this.artefact.documentation : '';}
    get is_collapsed() {return this.parent ? this.collapsed || this.parent.is_collapsed : this.collapsed;}
    // -- SVG Definitions
    // --- Standard
    get theme_classname() {return this.resource_type.toLowerCase().replaceAll(' ', '-')}
    get stroke_colours() {
        return {
            red: "#F80000",
            bark: "#312D2A",
            gray: "#5f5f5f",
            blue: "#0066cc",
            orange: "#ff6600",
            purple: "#400080",
            icon_colour_01: "#F80000",
            icon_colour_02: "#5f5f5f",
            icon_colour_03: "#ff6600",
        };
    }
    get parent_svg_id() {return this.parent_id + "-svg";}
    get definition() {
        return {
            artefact: this.artefact,
            data_type: this.artefact ? this.artefact.getArtifactReference() : '',
            name: {
                show: false,
                text: this.display_name
            },
            label: {
                show: false,
                text: this.artefact ? this.artefact.getArtifactReference() : ''
            },
            info: {
                show: false,
                text: this.artefact ? this.artefact.getArtifactReference() : ''
            },
            svg: {
                x: this.svg_x,
                y: this.svg_y,
                width: this.svg_width,
                height: this.svg_height
            },
            rect: {
                x: this.rect_x,
                y: this.rect_y,
                width: this.rect_width,
                height: this.rect_height,
                width_adjust: this.rect_width_adjust,
                height_adjust: this.rect_height_adjust,
                stroke: {
                    colour: this.rect_stroke_colour,
                    dash: this.rect_stroke_dash,
                    opacity: this.rect_stroke_opacity
                },
                fill: this.rect_fill,
                style: this.rect_fill_style
            }, icon: {
                show: true,
                x_translation: this.icon_x_tranlation,
                y_translation: this.icon_y_tranlation
            },
            title_keys: []
        };
    }
    // --- Dimensions
    get recalculate_dimensions() {return this._recalculate_dimensions;}
    set recalculate_dimensions(recalculate) {this._recalculate_dimensions = true;this.parent ? this.parent.recalculate_dimensions = true : recalculate = false;}
    // get width_multiplier() {return this.show_label ? okitSettings.show_label === 'name' ? 1.5 : 2 : 1;}
    get width_multiplier() {return this.show_label ? okitSettings.show_label === 'name' ? 2.5 : 2.5 : 1;}
    get height_multiplier() {return this.show_label ?  1.5 : 1;}
    get icon_dimensions() {return {width: this.icon_width, height: this.icon_height};}
    get collapsed_dimensions() {return {width: this.icon_width * this.width_multiplier, height: this.icon_height * this.height_multiplier};}
    get minimum_dimensions() {return {width: this.icon_width * this.width_multiplier, height: this.icon_height * this.height_multiplier};}
    get dimensions() {return this.collapsed ? this.collapsed_dimensions : this.minimum_dimensions;}
    // --- Definitions
    get svg_definition() {
        return {
            id: this.svg_id,
            x: this.svg_x,
            y: this.svg_y,
            width: this.svg_width,
            height: this.svg_height,
            viewbox: this.viewbox
        }
    }
    get rect_definition() {
        let rect_x = this.rect_x;
        let rect_y = this.rect_y;
        let rect_width = this.rect_width + this.rect_width_adjust;
        let rect_height = this.rect_height + this.rect_height_adjust;
        if (this.icon_y_tranlation < 0) {
            rect_y = Math.abs(this.icon_y_tranlation);
            rect_height -= rect_y * 2;
        }
        if (this.icon_x_tranlation < 0) {
            rect_x = Math.abs(this.icon_x_tranlation);
            rect_width -= rect_x * 2;
        }
        return {
            id: this.rect_id,
            x: rect_x,
            y: rect_y,
            rx: this.rect_rx,
            ry: this.rect_ry,
            width: rect_width,
            height: rect_height,
            fill: this.rect_fill,
            style: this.rect_fill_style,
            stroke_colour: this.rect_stroke_colour,
            stroke_width: this.rect_stroke_width,
            stroke_opacity: this.rect_stroke_opacity,
            stroke_dasharray: this.rect_stroke_dasharray
        };
    }
    getIconDefinition() {
        const definition = {
            id: this.icon_definition_id,
            transform: this.icon_transform
        }
        return definition
    }
    getForeignObjectDefinition() {
        const definition = {
            x: 0,
            y: 0,
            width: this.constructor.fo_width,
            height: this.constructor.fo_height,
            transform: `translate(${this.constructor.fo_x_tranlation}, ${this.constructor.fo_y_tranlation})`
        }
        return definition
    }
    // ---- Svg
    get svg_id() {return this.artefact_id + '-svg';}
    get svg_x() {
        if (this.parent) {
            const offset = this.parent.getChildOffset(this.getArtifactReference());
            return offset.dx;
        } else {
            return 0;
        }
    }
    get svg_y() {
        if (this.parent) {
            const offset = this.parent.getChildOffset(this.getArtifactReference());
            return offset.dy;
        } else {
            return 0;
        }
    }
    get svg_height() {return this.collapsed ? this.collapsed_dimensions.height : this.dimensions.height;}
    get svg_width() {return this.collapsed ? this.collapsed_dimensions.width : this.dimensions.width;}
    // ---- ViewBox
    get viewbox_x() {return 0;}
    get viewbox_y() {return 0;}
    get viewbox_height() {return this.svg_height;}
    get viewbox_width() {return this.svg_width;}
    get viewbox() {return `${this.viewbox_x} ${this.viewbox_y} ${this.viewbox_width} ${this.viewbox_height}`;}
    // ---- Rectangle
    get rect_id() {return this.artefact_id;}
    get rect_x() {return 0;}
    get rect_y() {return 0;}
    get rect_rx() {return 0;}
    get rect_ry() {return 0;}
    get rect_height() {return this.svg_height;}
    get rect_width() {return this.svg_width;}
    get rect_height_adjust() {return 0;}
    get rect_width_adjust() {return 0;}
    get rect_fill() {return 'white';}
    get rect_fill_style() {return 'fill-opacity: .25;';}
    get rect_stroke_colour() {return this.stroke_colours.bark;}
    get rect_stroke_width() {return 1;}
    get rect_stroke_dash() {return 2;}
    get rect_stroke_space() {return 1;}
    get rect_stroke_dasharray() {return `${this.rect_stroke_dash}, ${this.rect_stroke_space}`;}
    get rect_stroke_opacity() {return 0;}
    // ---- Icon
    get icon_definition_id() {return OkitJsonView.toSvgIconDef(this.getArtifactReference());}
    // get icon_definition_id() {return this.getArtifactReference().replace(/ /g, '') + 'Svg';}
    get icon_height() {return 45;}
    get icon_width() {return 45;}
    get icon_x_tranlation() {return 0;}
    get icon_y_tranlation() {return 0;}
    get icon_v_align() {return 'top';}
    get icon_h_align() {return 'middle';}
    get icon_transform() {
        let dx = 0;
        let dy = 0;
        // Horizontal
        if (this.icon_h_align === 'middle' || this.icon_h_align === 'center' || this.icon_h_align === 'centre') {
            dx = this.svg_width/2 - this.icon_width/2;
        } else if (this.icon_h_align === 'end' || this.icon_h_align === 'right') {
            dx = this.svg_width - this.icon_width;
        }
        // Vertical
        if (this.icon_v_align === 'middle' || this.icon_v_align === 'center' || this.icon_v_align === 'centre') {
            dy = this.svg_height/2 - this.icon_height/2;
        } else if (this.icon_v_align === 'end' || this.icon_v_align === 'bottom') {
            dy = this.svg_height - this.icon_height;
        }
        return `translate(${dx}, ${dy})`;
    }
    // ---- Foreign Object
    get fo_width() {return 100}
    get fo_transform() {
        let dx = 0;
        let dy = 0;
        // Horizontal
        if (this.icon_h_align === 'middle' || this.icon_h_align === 'center' || this.icon_h_align === 'centre') {
            dx = this.svg_width/2 - this.icon_width/2;
        } else if (this.icon_h_align === 'end' || this.icon_h_align === 'right') {
            dx = this.svg_width - this.icon_width;
        }
        // Vertical
        if (this.icon_v_align === 'middle' || this.icon_v_align === 'center' || this.icon_v_align === 'centre') {
            dy = this.svg_height/2 - this.icon_height/2;
        } else if (this.icon_v_align === 'end' || this.icon_v_align === 'bottom') {
            dy = this.svg_height - this.icon_height;
        }
        return `translate(${dx + this.icon_width}, ${dy})`;
    }
    // ---- Padding
    get padding_dx() {return 0;}
    get padding_dy() {return 0;}
    get padding() {return {dx: this.padding_dx, dy: this.padding_dy};}
    // ---- Text
    get svg_name_text() {return {show: this.show_name, v_align: this.name_v_align, h_align: this.name_h_align, text: this.name_text, suffix: 'display-name'};}
    get svg_type_text() {return {show: this.show_type, v_align: this.type_v_align, h_align: this.type_h_align, text: this.type_text, suffix: 'type-name'};}
    get svg_info_text() {return {show: this.show_info, v_align: this.info_v_align, h_align: this.info_h_align, text: this.info_text, suffix: 'info'};}
    get svg_label_text() {return {show: this.show_label, v_align: this.label_v_align, h_align: this.label_h_align, text: this.label_text, suffix: 'label'};}
    // ----- Name
    get show_name() {return false;}
    get name_v_align() {return 'top';}
    get name_h_align() {return 'start';}
    get name_text() {return this.display_name;}
    // ----- Type
    get show_type() {return false;}
    get type_v_align() {return 'bottom';}
    get type_h_align() {return 'start';}
    get type_text() {return this.getArtifactReference();}
    // ----- Info
    get show_info() {return false;}
    get info_v_align() {return 'bottom';}
    get info_h_align() {return 'end';}
    get info_text() {return '';}
    // ----- Label
    get show_label() {return okitSettings.show_label && okitSettings.show_label !== 'none';}
    get label_v_align() {return 'bottom';}
    get label_h_align() {return 'middle';}
    get label_text() {
        if (okitSettings.show_label) {
            if (okitSettings.show_label === 'name') {
                return this.name_text;
            } else if (okitSettings.show_label === 'type') {
                return this.type_text;
            } else {
                return '';
            }
        }
        return '';
    }
    // ----- Tooltip (title)
    get title() {
        if (okitSettings.tooltip_type) {
            if (okitSettings.tooltip_type === 'simple') {
                return this.simple_tooltip;
            } else if (okitSettings.tooltip_type === 'definition') {
                return this.definition_tooltip;
            } else if (okitSettings.tooltip_type === 'summary') {
                return this.summary_tooltip;
            } else {
                return '';
            }
        }
        return this.display_name;
    }
    get simple_tooltip() {return this.display_name;}
    get definition_tooltip() {return `Name: ${this.display_name} \nDefinition: ${this.definition}`;}
    get summary_tooltip() {return this.display_name;}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return true;}
    // ---- Okit View Functions
    get new_function() {return `new${this.getArtifactReference().split(' ').join('')}`}
    get cloneable() {return true;}
    get moveable() {return true;}
    get pasteableOrig() {return this.json_view.copied_artefact ? this.json_view.copied_artefact.getDropTargets().includes(this.getArtifactReference()) : false;}
    get pasteable() {return OkitArtefactView.cut_copy_paste.resource ? OkitArtefactView.cut_copy_paste.resource.getDropTargets().includes(this.getArtifactReference()) : false;}
    get pasteableNew() {
        return OkitArtefactView.cut_copy_paste.resource ? OkitArtefactView.cut_copy_paste.resource.getDropTargets().includes(this.getArtifactReference()) : false;
    }

    newPropertiesSheet() {}
    getFunction(resource_type) {return `get${titleCase(resource_type).split(' ').join('')}`}
    getArrayFunction(resource_type) {return `${this.getFunction(resource_type)}s`}

    getArtefact() {return this.artefact;}
    getResource() {return this.getArtefact();}

    static new(artefact, json_view) {return new this(artefact, json_view);}

    cut() {OkitArtefactView.cut_copy_paste.resource = this; OkitArtefactView.cut_copy_paste.paste_count = 0; this.json_view.is_cut = true; this.deleteSvg();}

    copy() {OkitArtefactView.cut_copy_paste.resource = this; OkitArtefactView.cut_copy_paste.paste_count = 0; this.json_view.is_cut = false;}

    paste(drop_target) {
        const clone = OkitArtefactView.cut_copy_paste.resource.artefact.clone();
        if (!OkitArtefactView.cut_copy_paste.is_cut) clone.display_name += 'Copy';
        if (OkitArtefactView.cut_copy_paste.paste_count > 0) {clone.display_name += `-${OkitArtefactView.cut_copy_paste.paste_count}`;}
        OkitArtefactView.cut_copy_paste.paste_count += 1;
        clone.id = clone.okit_id;
        drop_target.updateCloneIds(clone);
        this.json_model_list.push(clone);
        return clone;
    }

    clone() {
        const clone = this.artefact.clone();
        if (!this.json_view.is_cut) clone.display_name += 'Copy';
        clone.id = clone.okit_id;
        this.json_model_list.push(clone);
        return clone;
    }

    delete() {
        // this.json_model_list = this.json_model_list.filter((e) => e.id != this.id)
        this.artefact.delete();
        this.json_view_list = this.json_view_list.filter((e) => e.id != this.id)
        // Remove SVG Element
        if ($(jqId(this.svg_id)).length) {$(jqId(this.svg_id)).remove()}
    }

    draw() {
        // console.warn('Drawing', this)
        if ((!this.parent || !this.parent.is_collapsed) && (!okitSettings.hide_attached || !this.attached)) {
            // console.info(`Drawing ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id}) [${this.parent_id}]`);
            const svg = this.drawSvg();
            this.drawRect(svg);
            this.drawText(svg, this.svg_name_text);
            this.drawText(svg, this.svg_type_text);
            this.drawText(svg, this.svg_info_text);
            this.drawText(svg, this.svg_label_text);
            this.drawTitle(svg);
            const icon = this.drawIcon(svg);
            // const foreign = this.drawForeignObject(svg);
            // Add standard / common click event
            this.addClickEvent(svg);
            // Add standard / common mouse over event
            this.addMouseOverEvents(svg);
            // Add Mouse Over / Exist Events
            this.addMouseEvents(svg);
            // Add Drag Handling Events
            this.addDragEvents(svg);
            // this.addIconDragEvents(icon);
            // Add Context Menu (Right-Click)
            this.addContextMenu(svg);
            // Add Custom Data Attributes
            this.addCustomAttributes(svg)
            // Add Attached Resources
            this.drawAttachments();
            // Return
            return svg;
        }
    }

    drawSvg() {
        const parent_svg = d3.select(d3Id(this.parent_svg_id));
        // console.warn('Parent SVG Id', this.parent_svg_id)
        // Get attributes as local constant before create to stop NaN because append adds element before adding attributes.
        const definition = this.svg_definition;
        // const g = parent_svg.append("g")
        //     .attr("transform", `translate(${definition.x}, ${definition.y})`)
        const svg_class = this.artefact ? this.artefact.read_only ? 'top-level' : this.artefact.read_only ? 'read-only' : '' : ''
        const svg = parent_svg.append("svg")
            .attr("class", svg_class)
            .attr("id",        definition.id)
            .attr("data-type", this.artefact ? this.artefact.getArtifactReference() : '')
            .attr("x",         definition.x)
            .attr("y",         definition.y)
            .attr("width",     definition.width)
            .attr("height",    definition.height)
            .attr("viewBox",   definition.viewbox)
            .attr("preserveAspectRatio", "xMinYMax meet");
        return svg;
    }

    drawRect(svg) {
        const definition = this.rect_definition;
        const rect = svg.append("rect")
            .attr("class",            okitSettings.show_state ? this.artefact.lifecycle_state ? this.artefact.lifecycle_state.toLowerCase() : '' : '')
            .attr("id",               definition.id)
            .attr("x",                definition.x)
            .attr("y",                definition.y)
            .attr("rx",               definition.rx)
            .attr("ry",               definition.ry)
            .attr("width",            definition.width)
            .attr("height",           definition.height)
            .attr("fill",             definition.fill)
            .attr("style",            definition.style)
            .attr("stroke",           definition.stroke_colour)
            .attr("stroke-width",     definition.stroke_width)
            .attr("stroke-opacity",   definition.stroke_opacity)
            .attr("stroke-dasharray", definition.stroke_dasharray);
        return rect;
    }

    // drawIcon1(svg) {
    //     const icon = svg.append('svg')
    //         .attr("width",     icon_width)
    //         .attr("height",    icon_height)
    //         .append('g')
    //             .attr("style", "pointer-events: bounding-box;")
    //             .append("use")
    //             .attr("xlink:href",`#${this.icon_definition_id}`)
    //             .attr("transform", this.icon_transform);
    //     return icon;
    // }

    drawIcon(svg) {
        const definition = this.getIconDefinition()
        const icon = svg.append('g')
            .attr("style", "pointer-events: bounding-box;")
            // .attr("class", this.artefact && this.artefact.read_only ? 'read-only' : '')
            .append("use")
                .attr("xlink:href",`#${this.icon_definition_id}`)
                .attr("transform", this.icon_transform);
        return icon;
    }

    drawForeignObject(svg) {
        const definition = this.getForeignObjectDefinition()
        const foreignObject = svg.append('foreignObject').attr('width', definition.width).attr('height', definition.height).attr('transform', definition.transform)
        const details_div = foreignObject.append('xhtml:div').attr('xmlns', 'http://www.w3.org/1999/xhtml').attr('class', `okit-resource-svg-details`)
        details_div.append('xhtml:div').attr('xmlns', 'http://www.w3.org/1999/xhtml').attr('class', 'okit-resource-svg-title').append('xhtml:label').attr('xmlns', 'http://www.w3.org/1999/xhtml').text(this.type_text)
        details_div.append('xhtml:div').attr('xmlns', 'http://www.w3.org/1999/xhtml').attr('class', 'okit-resource-svg-input').append('xhtml:input').attr('xmlns', 'http://www.w3.org/1999/xhtml').attr('class', 'okit-resource-svg-display-name').attr('tabindex', -1)
            .attr('type', 'text')
            .attr('name', `${this.resource_name}_display_name`)
            .attr('value', `${this.display_name}`)
            .on('change', (d, i, n) => {this.artefact.display_name = n[i].value})
    }

    drawText(svg, svg_text) {
        if (svg_text.show) {
            const rect = this.rect_definition;
            let text_anchor = 'start';
            let dx = 10;
            let dy = 10;
            // Horizontal Positioning
            if (svg_text.h_align === 'middle' || svg_text.h_align === 'centre' || svg_text.h_align === 'center') {
                dx = Math.round(this.svg_width / 2);
                text_anchor = 'middle';
            } else if (svg_text.h_align === 'end' || svg_text.h_align === 'right') {
                dx = this.svg_width - 10;
                text_anchor = 'end';
                if (!this.collapsed) {dx -= rect.x;}
            } else {
                dx = 10;
                text_anchor = 'start';
                if (!this.collapsed) {dx += rect.x;}
            }
            // Vertical Positioning
            if (svg_text.v_align === 'middle' || svg_text.v_align === 'centre' || svg_text.v_align === 'center') {
                dy = Math.round(this.svg_height / 2);
            } else if (svg_text.v_align === 'end' || svg_text.v_align === 'bottom') {
                dy = this.svg_height - 10;
                if (!this.collapsed) {dy -= rect.y;}
            } else {
                dy = 10;
                if (!this.collapsed) {dy += rect.y + this.icon_height / 2;}
            }
            const text = svg.append("text")
                .attr("class", "svg-text")
                .attr("id", `${this.artefact_id}-${svg_text.suffix}`)
                .attr("x", dx)
                .attr("y", dy)
                .attr("text-anchor", text_anchor)
                .attr("vector-effects", "non-scaling-size")
                .text(svg_text.text);
        }
    }

    drawTitle(svg) {
        svg.append("title")
            .attr("id", `${this.artefact_id}-title`)
            .text(this.title);
    }

    addClickEvent(svg) {
        const self = this;
        svg.on("click", function(event) {
            event = d3.event // Temp Work around for v0.67.0 release
            event.preventDefault(); // event replaces d3.event
            event.stopPropagation();
            self.loadSlidePanels();
            $(jqId("context-menu")).addClass("hidden");
        });
        svg.on("dblclick", (event) => {
            event = d3.event // Temp Work around for v0.67.0 release
            event.preventDefault(); // event replaces d3.event
            event.stopPropagation();
            // self.loadSlidePanels();
            // $(jqId("context-menu")).addClass("hidden");
            // const open = $('#toggle_properties_button').hasClass('okit-bar-panel-displayed');
            // if (!open) $('#toggle_properties_button').trigger('click');
            $(this).trigger('click');
            $('#properties_toolbar_button').trigger('click');
            window.getSelection().removeAllRanges();
        });
    }

    addMouseOverEvents(svg) {
        const self = this;
        const display_mouseover_links = okitSettings.show_connections_on_mouseover && !okitSettings.show_all_connections && !this.resource.show_connections
        svg.on('mouseenter', (event) => {
            event = d3.event // Temp Work around for v0.67.0 release
            event.stopPropagation(); // event replaces d3.event
            event.preventDefault();
            if (okitSettings.highlight_association) {self.addAssociationHighlighting();}
            if (display_mouseover_links) {this.getLinks().forEach((id) => this.drawConnection(this.id, id))}
            $(jqId(self.id)).addClass('highlight-rect');
        })
        svg.on('mouseleave', (event) => {
            event = d3.event // Temp Work around for v0.67.0 release
            event.stopPropagation(); // event replaces d3.event
            event.preventDefault();
            if (okitSettings.highlight_association) {self.removeAssociationHighlighting();}
            if (display_mouseover_links) {this.getLinks().forEach((id) => this.removeConnection(this.id, id))}
            $(jqId(self.id)).removeClass('highlight-rect');
        });
    }

    getAssociations() {return this.getResource().getAssociations().filter((id) => id !== this.compartment_id && id !== this.parent_id && !this.children.includes(id))}
    getLinks() {return this.getResource().getLinks().filter((id) => id !== this.compartment_id && id !== this.parent_id && id !== this.parent.parent_id && !this.children.includes(id) && !this.getAttachedIds().includes(id))}

    // addAssociationHighlighting() {}

    // removeAssociationHighlighting() {}

    addDragEvents(svg) {
        svg.on("dragenter",  dragEnter)
            .on("dragover",  dragOver)
            .on("dragleave", dragLeave)
            .on("drop",      dragDrop)
            .on("dragend",   dragEnd);
    }

    addIconDragEvents(svg) {
        const self = this
        svg.call(d3.drag()
            .on("start", () => console.warn(`'Drag Start Event' ${self.display_name}`))
            .on("drag", () => console.warn(`'Drag Event' ${self.display_name}`))
            .on("end", () => console.warn(`'Drag End Event' ${self.display_name}`))
            )
    }

    addContextMenu(svg) {
        const self = this;
        svg.on("contextmenu", function (event) {
            event = d3.event // Temp Work around for v0.67.0 release
            event.preventDefault(); // event replaces d3.event
            event.stopPropagation();
            const canvas_position = $(jqId("canvas-div")).offset();
            const position = {top: event.pageY - canvas_position.top, left: event.pageX - 5};
            $(jqId("context-menu")).empty();
            $(jqId("context-menu")).css(position);
            const contextmenu = d3.select(d3Id("context-menu"));
            contextmenu.on('mouseenter', function () {
                    $(jqId("context-menu")).removeClass("hidden");
                })
                .on('mouseleave', function () {
                    $(jqId("context-menu")).addClass("hidden");
                });

            contextmenu.append('label')
                .attr('class', 'okit-context-menu-title')
                .text(self.display_name)
            const ul = contextmenu.append('ul')
                .attr('class', 'okit-context-menu-list');
            if (self.compartment_id) {
                // Delete
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text('Delete')
                    .on('click', function () {
                        const parent = self.parent
                        self.delete();
                        self.json_view.update(self.okit_json);
                        $(jqId("context-menu")).addClass("hidden");
                        parent.loadSlidePanels()
                        slideRightPanel()
                    });
                // Cut
                if (self.moveable) {
                    ul.append('li').append('a')
                        .attr('class', 'parent-item')
                        .attr('href', 'javascript:void(0)')
                        .text('Cut')
                        .on('click', function () {
                            OkitArtefactView.cut_copy_paste = {paste_count: 0, is_cut: true};
                            self.cut();
                            //self.json_view.update(self.okit_json);
                            $(jqId("context-menu")).addClass("hidden");
                        });
                }
                // Clone
                if (self.cloneable) {
                    ul.append('li').append('a')
                        .attr('class', 'parent-item')
                        .attr('href', 'javascript:void(0)')
                        .text('Clone')
                        .on('click', function () {
                            self.clone();
                            self.json_view.update(self.okit_json);
                            $(jqId("context-menu")).addClass("hidden");
                        });
                }
                // Copy
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text('Copy')
                    .on('click', function () {
                        OkitArtefactView.cut_copy_paste = {paste_count: 0, is_cut: false};
                        self.copy();
                        $(jqId("context-menu")).addClass("hidden");
                    });
                $(jqId("context-menu")).removeClass("hidden");
            }
            // Paste
            if (self.pasteable) {
                ul.append('li').append('a')
                    .attr('class', 'parent-item')
                    .attr('href', 'javascript:void(0)')
                    .text(`Paste ${OkitArtefactView.cut_copy_paste.resource.getArtifactReference()} ${OkitArtefactView.cut_copy_paste.resource.display_name}`)
                    .on('click', function () {
                        OkitArtefactView.cut_copy_paste.resource.paste(self);
                        if (OkitArtefactView.cut_copy_paste.is_cut) OkitArtefactView.cut_copy_paste.resource.delete();
                        self.json_view.update(self.okit_json);
                        $(jqId("context-menu")).addClass("hidden");
                    });
                $(jqId("context-menu")).removeClass("hidden");
            }
        });
    }

    addCustomAttributes(svg) {
        svg.attr("data-type",                  this.artefact ? this.artefact.getArtifactReference() : '')
            .attr("data-okit-id",        this.artefact_id)
            .attr("data-parent-id",      this.parent_id)
            .attr("data-compartment-id", this.compartment_id)
            .selectAll("*")
                .attr("data-type",                 this.artefact ? this.artefact.getArtifactReference() : '')
                .attr("data-okit-id",        this.artefact_id)
                .attr("data-parent-id",      this.parent_id)
                .attr("data-compartment-id", this.compartment_id);
    }

    addMouseEvents(svg) {}

    drawAttachments() {}

    // drawConnections() {this.getLinks().forEach((id) => this.drawConnection(this.id, id))}
    drawConnections() {if (okitSettings.show_all_connections || this.resource.show_connections) this.getLinks().forEach((id) => this.drawConnection(this.id, id))}

    drawConnection(start_id, end_id) {
        if (this.parent && !this.parent.is_collapsed) {
            const canvas_svg = d3.select(d3Id('canvas-svg'));
            const canvas_rect = d3.select(d3Id('canvas-rect'));
            const svgStartPoint = canvas_svg.node().createSVGPoint();
            const svgEndPoint = canvas_svg.node().createSVGPoint();
            const screenCTM = canvas_rect.node().getScreenCTM();
            if (start_id && start_id !== '' && end_id && end_id !== '' && document.getElementById(start_id) && document.getElementById(end_id)) {
                let start_bcr = document.getElementById(start_id).getBoundingClientRect();
                let end_bcr = document.getElementById(end_id).getBoundingClientRect();
                let horizontal = false;
                if (this.top_bottom_connectors_preferred && start_bcr.y > end_bcr.y) {
                    // Start Connector on the top edge
                    svgStartPoint.x = Math.round(start_bcr.x + (start_bcr.width / 2));
                    svgStartPoint.y = start_bcr.y;
                    // End Connector on the bottom edge
                    svgEndPoint.x = Math.round(end_bcr.x + (end_bcr.width / 2));
                    svgEndPoint.y = Math.round(end_bcr.y + end_bcr.height);
                } else if (this.top_bottom_connectors_preferred && start_bcr.y < end_bcr.y) {
                    // Start Connector on the bottom edge
                    svgStartPoint.x = Math.round(start_bcr.x + (start_bcr.width / 2));
                    svgStartPoint.y = Math.round(start_bcr.y + start_bcr.height);
                    // End Connector on top edge
                    svgEndPoint.x = Math.round(end_bcr.x + (end_bcr.width / 2));
                    svgEndPoint.y = end_bcr.y;
                } else if (start_bcr.x < end_bcr.x) {
                    // Start Connector on right edge
                    svgStartPoint.x = Math.round(start_bcr.x + start_bcr.width);
                    svgStartPoint.y = Math.round(start_bcr.y + (start_bcr.height / 2));
                    // End Connector on left edge
                    svgEndPoint.x = end_bcr.x;
                    svgEndPoint.y = Math.round(end_bcr.y + (end_bcr.height / 2));
                    // Draw Horizontal
                    horizontal = true;
                } else if (start_bcr.x > end_bcr.x) {
                    // Start Connector on left edge
                    svgStartPoint.x = start_bcr.x;
                    svgStartPoint.y = Math.round(start_bcr.y + (start_bcr.height / 2));
                    // End Connector on right edge
                    svgEndPoint.x = Math.round(end_bcr.x + end_bcr.width);
                    svgEndPoint.y = Math.round(end_bcr.y + (end_bcr.height / 2));
                    // Draw Horizontal
                    horizontal = true;
                }
                let connector_start = svgStartPoint.matrixTransform(screenCTM.inverse());
                let connector_end = svgEndPoint.matrixTransform(screenCTM.inverse());

                if (horizontal) {
                    this.drawHorizontalConnector(canvas_svg, this.generateConnectorId(end_id, start_id), connector_start, connector_end);
                } else {
                    this.drawVerticalConnector(canvas_svg, this.generateConnectorId(end_id, start_id), connector_start, connector_end);
                }

            }
        }
    }

    drawVerticalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0},) {
        if (path_connector) {
            let radius = corner_radius;
            let dy = Math.round((end['y'] - start['y']) / 2);
            let dx = end['x'] - start['x'];
            let arc1 = '';
            let arc2 = '';
            if (dy > 0 && dx > 0) {
                // First turn down and right with counter clockwise arc
                arc1 = 'a5,5 0 0 0 5,5';
                arc1 = generateArc(radius, 0, '', '');
                // Second turn right and down with clockwise arc
                arc2 = 'a5,5 0 0 1 5,5';
                arc2 = generateArc(radius, 1, '', '');
                // Reduce dy by radius
                dy -= radius;
                // Reduce dx by 2 * radius
                dx -= radius * 2;
            } else if (dy > 0 && dx < 0) {
                // First turn down and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,5';
                arc1 = generateArc(radius, 1, '-', '');
                // Second turn left and down with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,5';
                arc2 = generateArc(radius, 0, '-', '');
                // Reduce dy by radius
                dy -= radius;
                // Increase dx by 2 * radius
                dx += radius * 2;
            } else if (dy < 0 && dx < 0) {
                // First turn up and left with counter clockwise arc
                arc2 = 'a5,5 0 0 1 -5,-5';
                arc2 = generateArc(radius, 1, '-', '-');
                // Second turn left and up with clockwise arc
                arc1 = 'a5,5 0 0 0 -5,-5';
                arc1 = generateArc(radius, 0, '-', '-');
                // Increase dy by radius
                dy += radius;
                // Reduce dx by 2 * radius
                dx -= radius * 2;
            } else if (dy < 0 && dx > 0) {
                // First turn up and right with counter clockwise arc
                arc2 = 'a5,5 0 0 0 5,-5';
                arc2 = generateArc(radius, 0, '', '-');
                // Second turn right and up with clockwise arc
                arc1 = 'a5,5 0 0 1 5,-5';
                arc1 = generateArc(radius, 1, '', '-');
                // Reduce dy by radius
                dy += radius;
                // Increase dx by 2 * radius
                dx -= radius * 2;
            }
            let points = "m" + this.coordString(start) + " v" + dy + " " + arc1 + " h" + dx + " " + arc2 + " v" + dy;
            let path = parent_svg.append('path')
                .attr("id", id)
                .attr("d", points)
                //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
            //return path;
        } else {
            // Calculate Polyline points
            let ydiff = end['y'] - start['y'];
            let ymid = Math.round(start['y'] + ydiff / 2);
            let mid1 = {x: start['x'], y: ymid};
            let mid2 = {x: end['x'], y: ymid};
            let points = this.coordString(start) + " " + this.coordString(mid1) + " " + this.coordString(mid2) + " " + this.coordString(end);
            let polyline = parent_svg.append('polyline')
                .attr("id", id)
                .attr("points", points)
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
            //return polyline;
        }
    }

    drawHorizontalConnector(parent_svg, id, start={x:0, y:0}, end={x:0, y:0}) {
        if (path_connector) {
            let radius = corner_radius;
            let dy = end['y'] - start['y'];
            let dx = Math.round((end['x'] - start['x']) / 2);
            let arc1 = '';
            let arc2 = '';
            if (dy > 0 && dx > 0) {
                // First turn right and down with clockwise arc
                arc1 = 'a5,5 0 0 1 5,5';
                arc1 = generateArc(radius, 1, '', '');
                // Second turn down and right with counter clockwise arc
                arc2 = 'a5,5 0 0 0 5,5';
                arc2 = generateArc(radius, 0, '', '');
                // Reduce dx by radius
                dx -= radius;
                // Reduce dy by 2 * radius
                dy -= radius * 2;
            } else if (dy > 0 && dx < 0) {
                // First turn down and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,5';
                arc1 = generateArc(radius, 1, '-', '');
                // Second turn left and down with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,5';
                arc2 = generateArc(radius, 0, '-', '');
                // Increase dx by radius
                dx += radius;
                // Reduce dy by 2 * radius
                dy -= radius * 2;
            } else if (dy < 0 && dx < 0) {
                // First turn up and left with counter clockwise arc
                arc1 = 'a5,5 0 0 1 -5,-5';
                arc1 = generateArc(radius, 1, '-', '-');
                // Second turn left and up with clockwise arc
                arc2 = 'a5,5 0 0 0 -5,-5';
                arc2 = generateArc(radius, 0, '-', '-');
                // Reduce dx by radius
                dx -= radius;
                // Increase dy by 2 * radius
                dy += radius * 2;
            } else if (dy < 0 && dx > 0) {
                // First turn up and right with counter clockwise arc
                arc1 = 'a5,5 0 0 0 5,-5';
                arc1 = generateArc(radius, 0, '', '-');
                // Second turn right and up with clockwise arc
                arc2 = 'a5,5 0 0 1 5,-5';
                arc2 = generateArc(radius, 1, '', '-');
                // Reduce dx by radius
                dx -= radius;
                // Increase dy by 2 * radius
                dy += radius * 2;
            }
            let points = "m" + this.coordString(start) + " h" + dx + " " + arc1 + " " + " v" + dy + arc2 + " h" + dx;
            let path = parent_svg.append('path')
                .attr("id", id)
                .attr("d", points)
                //.attr("d", "M100,100 h50 a5,5 0 0 0 5,5 v50 a5,5 0 0 1 -5,5 h-50 a5,5 0 0 1 -5,-5 v-50 a5,5 0 0 1 5,-5 z")
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
        } else {
            // Calculate Polyline points
            let ydiff = end['y'] - start['y'];
            let ymid = Math.round(start['y'] + ydiff / 2);
            let mid1 = {x: start['x'], y: ymid};
            let mid2 = {x: end['x'], y: ymid};
            let points = this.coordString(start) + " " + this.coordString(mid1) + " " + this.coordString(mid2) + " " + this.coordString(end);
            let polyline = parent_svg.append('polyline')
                .attr("id", id)
                .attr("points", points)
                .attr("stroke-width", "2")
                .attr("stroke", connector_colour)
                .attr("fill", "none")
                .attr("marker-start", "url(#connector-end-circle)")
                .attr("marker-end", "url(#connector-end-circle)");
        }
    }

    removeConnections() {this.getLinks().forEach((id) => this.removeConnection(this.id, id))}

    removeConnection(start_id, end_id) {
        d3.select(`#${this.generateConnectorId(end_id, start_id)}`).remove()
    }

    hideConnection = (start_id, end_id) => d3.select(`#${this.generateConnectorId(end_id, start_id)}`).classed('hidden', true)
    showConnection = (start_id, end_id) => d3.select(`#${this.generateConnectorId(end_id, start_id)}`).classed('hidden', false)
    addAssociationHighlighting = () => this.getAssociations().forEach((id) => $(jqId(id)).addClass('highlight-association'))
    removeAssociationHighlighting = () => this.getAssociations().forEach((id) => $(jqId(id)).removeClass('highlight-association'))

    coordString(coord) {
        let coord_str = coord['x'] + ',' + coord['y'];
        return coord_str;
    }

    deleteSvg() {
        // Remove SVG Element
        if ($(jqId(this.svg_id)).length) {$(jqId(this.svg_id)).remove()}
    }

    /*
    ** Load Slide Panels Functions
     */
    loadSlidePanels() {
        this.loadProperties();
        this.loadValueProposition();
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        $(jqId(PROPERTIES_PANEL)).empty()
        this.properties_sheet.show(document.getElementById(PROPERTIES_PANEL))
        this.properties_sheet.load()
    }


    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/oci.html");
    }

    /*
    ** Child Offset Functions
     */
    getChildOffset(child_type) {
        let offset = {dx: 0, dy: 0};
        if (this.getTopEdgeArtifacts().includes(child_type)) {
            offset = this.getTopEdgeChildOffset();
        } else if (this.getTopArtifacts().includes(child_type)) {
            offset = this.getTopChildOffset();
        } else if (this.getContainerArtifacts().includes(child_type)) {
            offset = this.getContainerChildOffset();
        } else if (this.getBottomArtifacts().includes(child_type)) {
            offset = this.getBottomChildOffset();
        } else if (this.getBottomEdgeArtifacts().includes(child_type)) {
            offset = this.getBottomEdgeChildOffset();
        } else if (this.getLeftEdgeArtifacts().includes(child_type)) {
            offset = this.getLeftEdgeChildOffset();
        } else if (this.getLeftArtifacts().includes(child_type)) {
            offset = this.getLeftChildOffset();
        } else if (this.getRightArtifacts().includes(child_type)) {
            offset = this.getRightChildOffset();
        } else if (this.getRightEdgeArtifacts().includes(child_type)) {
            offset = this.getRightEdgeChildOffset();
        } else {
            console.warn(child_type + ' Not Found for ' + this.display_name);
        }
        return offset
    }

    getFirstChildOffset() {
        alert('Get First Child function "getFirstChildOffset()" has not been implemented.');
    }

    getVerticalGroupMaxDimensions(children) {
        let max_dimensions = {height: 0, width: 0};
        for (const child of children) {
            for(const resource of this.json_view[this.getArrayFunction(child)]()) {
                if (resource.parent_id === this.id && (!resource.attached || !okitSettings.hide_attached)) {
                    const dimension = resource.dimensions;
                    max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
                    max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
                }
            }
        }
        return max_dimensions;
    }

    getHorizontalGroupMaxDimensions(children) {
        let max_dimensions = {height: 0, width: 0};
        for (const child of children) {
            for(const resource of this.json_view[this.getArrayFunction(child)]()) {
                if (resource.parent_id === this.id && (!resource.attached || !okitSettings.hide_attached)) {
                    const dimension = resource.dimensions;
                    max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
                    max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
                }
            }
        }
        return max_dimensions;
    }

    // Top Edge
    hasTopEdgeChildren() {
        let children = false;
        let key = this.getParentKey();
        for (let group of this.getTopEdgeArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact[key] === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getTopEdgeChildrenMaxDimensions() {
        return this.getHorizontalGroupMaxDimensions(this.getTopEdgeArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getTopEdgeArtifacts()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
        //             max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstTopEdgeChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.padding.x * 2 + positional_adjustments.spacing.x * 2),
            dy: 0
        };
        return offset;
    }

    getTopEdgeChildOffset() {
        alert('Get Top Edge Child function "getTopEdgeChildOffset()" has not been implemented.');
    }

    // Top
    hasTopChildren() {
        let children = false;
        for (let group of this.getTopArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getTopChildrenMaxDimensions() {
        return this.getHorizontalGroupMaxDimensions(this.getTopArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getTopArtifacts()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
        //             max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstTopChildOffset() {
        let offset = this.getFirstLeftChildOffset();
        if (this.hasLeftChildren()) {
            offset.dx += Math.round(this.getLeftChildrenMaxDimensions().width + positional_adjustments.spacing.x);
        }
        return offset;
    }

    getTopChildOffset() {
        alert('Get Top Child function "getTopEdgeChildOffset()" has not been implemented.');
    }

    // Container
    hasContainerChildren() {
        let children = false;
        for (let group of this.getContainerArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getContainerChildrenMaxDimensions() {
        return this.getVerticalGroupMaxDimensions(this.getContainerArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getContainerArtifacts()) {
        //     // for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
        //             max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstContainerChildOffset() {
        let offset = this.getFirstTopChildOffset();
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y);
        }
        return offset;
    }

    getContainerChildOffset() {
        alert('Get Container Child function "getContainerChildOffset()" has not been implemented.');
    }

    // Bottom
    hasBottomChildren() {
        let children = false;
        for (let group of this.getBottomArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getBottomChildrenMaxDimensions() {
        return this.getHorizontalGroupMaxDimensions(this.getBottomArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getBottomArtifacts()) {
        //     const resources = this.json_view[this.artefact.artefactToElement(group)];
        //     console.warn(this.getArtifactReference(), 'Group', group, resources)
        //     if (resources) {
        //         for(let artefact of resources) {
        //             if (artefact.parent_id === this.id && (!artefact.attached || !okitSettings.hide_attached)) {
        //                 let dimension = artefact.dimensions;
        //                 max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
        //                 max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
        //             }
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstBottomChildOffset() {
        let offset = this.getFirstTopChildOffset();
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y * 4);
        }
        if (this.hasContainerChildren()) {
            let dimensions = this.getContainerChildrenMaxDimensions();
            offset.dy += Math.round(dimensions.height + positional_adjustments.spacing.y);
        }
        return offset;
    }

    getBottomChildOffset() {
        alert('Get Bottom Child function "getBottomEdgeChildOffset()" has not been implemented.');
    }

    // Bottom Edge
    hasBottomEdgeChildren() {
        let children = false;
        for (let group of this.getBottomEdgeArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getBottomEdgeChildrenMaxDimensions() {
        return this.getHorizontalGroupMaxDimensions(this.getBottomEdgeArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getBottomEdgeArtifacts()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height = Math.max(max_dimensions.height, dimension.height);
        //             max_dimensions.width += Math.round(dimension.width + positional_adjustments.spacing.x);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstBottomEdgeChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.spacing.x),
            dy: 0
        };
        return offset;
    }

    getBottomEdgeChildOffset() {
        alert('Get Bottom Edge Child function "getBottomEdgeChildOffset()" has not been implemented.');
    }

    // Left Edge
    getFirstLeftEdgeChildOffset() {
        let offset = {
            dx: 0,
            dy: Math.round(positional_adjustments.padding.y * 2 + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getLeftEdgeChildOffset() {
        alert('Get Left Edge Child function "getLeftEdgeChildOffset()" has not been implemented.');
    }

    // Left
    hasLeftChildren() {
        let children = false;
        for (let group of this.getLeftArtifacts()) {
                for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                    if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getLeftChildrenMaxDimensions() {
        return this.getVerticalGroupMaxDimensions(this.getLeftArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getLeftArtifacts()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
        //             max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstLeftChildOffset() {
        let offset = {
            dx: Math.round(positional_adjustments.spacing.x * 4),
            dy: Math.round((this.icon_height * OkitArtefactView.prototype.height_multiplier) + positional_adjustments.spacing.y * 2)
        };
        return offset;
    }

    getLeftChildOffset() {
        alert('Get Left Child function "getLeftEdgeChildOffset()" has not been implemented.');
    }

    // Right
    hasRightChildren() {
        let children = false;
        for (let group of this.getRightArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getRightChildrenMaxDimensions() {
        return this.getVerticalGroupMaxDimensions(this.getRightArtifacts())
        // let max_dimensions = {height: 0, width: 0};
        // for (let group of this.getRightArtifacts()) {
        //     for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
        //         if (artefact.parent_id === this.id) {
        //             let dimension = artefact.dimensions;
        //             max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
        //             max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
        //         }
        //     }
        // }
        // return max_dimensions;
    }

    getFirstRightChildOffset() {
        let offset = this.getFirstLeftChildOffset();
        if (this.hasLeftChildren()) {
            const dimensions = this.getLeftChildrenMaxDimensions()
            offset.dx += dimensions.width
            // offset.dx += Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x);
        }
        let dx_adjustment = 0;
        if (this.hasTopChildren()) {
            let dimensions = this.getTopChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        if (this.hasContainerChildren()) {
            const dimensions = this.getContainerChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        if (this.hasBottomChildren()) {
            let dimensions = this.getBottomChildrenMaxDimensions();
            dx_adjustment = Math.max(dimensions.width, dx_adjustment);
        }
        offset.dx += dx_adjustment;
        offset.dx += positional_adjustments.spacing.x;
        offset.dx += positional_adjustments.padding.x;
        return offset;
    }

    getRightChildOffset() {
        alert('Get Right Child function "getRightChildOffset()" has not been implemented.');
    }

    // Right Edge
    hasRightEdgeChildren() {
        let children = false;
        for (let group of this.getRightEdgeArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    children = true;
                    break;
                }
            }
        }
        return children;
    }

    getRightEdgeChildrenMaxDimensions() {
        let max_dimensions = {height: 0, width: 0};
        for (let group of this.getRightEdgeArtifacts()) {
            for(let artefact of this.json_view[this.getArrayFunction(group)]()) {
                if (artefact.parent_id === this.id) {
                    let dimension = artefact.dimensions;
                    max_dimensions.height += Math.round(dimension.height + positional_adjustments.spacing.y);
                    max_dimensions.width = Math.max(max_dimensions.width, dimension.width);
                }
            }
        }
        return max_dimensions;
    }

    getFirstRightEdgeChildOffset() {
        const width = this.dimensions.width;
        const icon_width = this.icon_width;
        const width_multiplier = OkitArtefactView.prototype.width_multiplier;
        let offset = {
            dx: Math.round(width - (icon_width * width_multiplier)),
            dy: Math.round(positional_adjustments.padding.y)
        };
        return offset;
    }

    getRightEdgeChildOffset() {
        alert('Get Right Edge Child function "getRightEdgeChildOffset()" has not been implemented.');
    }


    /*
    ** Child Type Functions
     */
    getTopEdgeArtifacts() {
        return [];
    }

    getTopArtifacts() {
        return [];
    }

    getContainerArtifacts() {
        return [];
    }

    getBottomArtifacts() {
        return [];
    }

    getBottomEdgeArtifacts() {
        return [];
    }

    getLeftEdgeArtifacts() {
        return [];
    }

    getLeftArtifacts() {
        return [];
    }

    getRightArtifacts() {
        return [];
    }

    getRightEdgeArtifacts() {
        return [];
    }

    /*
    ** Default name generation
     */

    generateConnectorId(sourceid, destinationid) {
        const id = `${sourceid}-${destinationid}`
        const safeid = id.replace(/[\W_]+/g,"_")
        return safeid
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        alert('Get Artifact Reference function "getArtifactReference()" has not been implemented.');
        return;
    }

    static getDropTargets() {
        console.warn('Get Drop Targets not implements');
        return [];
    }

    static getConnectTargets() {
        console.warn('Get Connect Targets not implements');
        return [];
    }

    /*
    ** Instance Versions of Static Functions
     */

    getArtifactReference() {
        return this.constructor.getArtifactReference();
    }

    getDropTargets() {
        // Return list of Artifact names
        return this.constructor.getDropTargets();
    }

    getConnectTargets() {
        return this.constructor.getgetConnectTargets();
    }

    /*
    ** Common Single Select Input build & load functions
     */

    // loadDynamicRoutingGatewaySelect(id) {
    //     // Build Dynamic Routing Gateways
    //     let drg_select = $(jqId(id));
    //     $(drg_select).empty();
    //     drg_select.append($('<option>').attr('value', '').text(''));
    //     for (const drg of this.getOkitJson().getDynamicRoutingGateways()) {
    //         drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
    //     }
    // }

    // loadSubnetSelect(id, vcn_id=undefined) {
    //     // Build Subnet Select
    //     let select = $(jqId(id));
    //     $(select).empty();
    //     select.append($('<option>').attr('value', '').text(''));
    //     for (const resource of this.getOkitJson().getSubnets().filter((s) => vcn_id === undefined || s.vcn_id === vcn_id)) {
    //         select.append($('<option>').attr('value', resource.id).text(resource.display_name));
    //     }
    // }

    // loadVirtualCloudNetworkSelect(id) {
    //     // Build Virtual Cloud Network
    //     let select = $(jqId(id));
    //     $(select).empty();
    //     select.append($('<option>').attr('value', '').text(''));
    //     for (const resource of this.getOkitJson().getVirtualCloudNetworks()) {
    //         select.append($('<option>').attr('value', resource.id).text(resource.display_name));
    //     }
    // }

    /*
    ** Property Creation Routines
    */
    addPropertyHTML(parent, type='text', label='', id='', idx=0, callback=undefined, data={}) {
        let element = undefined;
        parent = (typeof parent === 'string') ? d3.select(`#${parent}`) : parent
        // Check to see if we require a collapsable group
        if (type === 'array') {
            const table = parent.append('div').attr('class', 'table okit-table')
            const thead = table.append('div').attr('class', 'thead')
            const row = thead.append('div').attr('class', 'tr')
            row.append('div').attr('class', 'th').text(label)
            row.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', callback)
            // element = table.append('div').attr('class', 'tbody').attr('id', `${label.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`)
            element = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        } else if (type === 'object') {
            const details = parent.append('details').attr('class', 'okit-details').attr('open', 'open')
            details.append('summary').text(label)
            element = details.append('div').attr('class', 'okit-details-body')
        } else if (type === 'object-input') {
            const details = parent.append('details').attr('class', 'okit-details').attr('open', 'open')
            details.append('summary').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').on('blur', callback)
            element = details.append('div').attr('class', 'okit-details-body')
        } else if (type === 'row') {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            element = row.append('div').attr('class', 'td')
            row.append('div').attr('class', 'td delete-property action-button-background delete').on('click', callback)
        } else if (type === 'properties') {
            const table = parent.append('div').attr('class', 'table okit-table okit-properties-table')
            element = table.append('div').attr('class', 'tbody')
        } else if (type === 'checkbox') {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            row.append('div').attr('class', 'td')
            const cell = row.append('div').attr('class', 'td')
            element = cell.append('input').attr('type', 'checkbox').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('input', callback)
            cell.append('label').attr('for', this.inputId(id, idx)).text(label)
        } else {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            row.append('div').attr('class', 'td').text(label)
            if (['text', 'password', 'email', 'date', 'number'].includes(type)) {
                element = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
                if (data) {
                    if (data.min) element.attr('min', data.min)
                    if (data.max) element.attr('max', data.max)
                }
            } else if (type === 'ipv4_cidr') {
                const placeholder = '0.0.0.0/0'
                const ipv4_cidr_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+"
                element = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "IPv4 CIDR block").attr('placeholder', placeholder).on('blur', callback)
            } else if (type === 'select') {
                element = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            } else if (type === 'multiselect') {
                element = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
            }
        }
        return element;
    }
    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`
    // generateTBodyId(id, idx) {return `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`}
}

/*
** Container Artefact View class for Compartments / VCN / Subnets that can contain other artefacts.
 */
class OkitContainerArtefactView extends OkitArtefactView {
    constructor(artefact = null, json_view) {
        super(artefact, json_view);
        this.collapsed = false;
        this._dimensions = {width: 0, height: 0};
    }

    // get children() {return Object.values(this.getJsonView()).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []).filter((r) => r.parent_id === this.id)}

    // -- SVG Definitions
    // --- Dimensions
    get minimum_dimensions() {return {width: 300, height: 150};}
    get dimensions() {
        if (this.collapsed) {
            return this.collapsed_dimensions;
        } else if (this.recalculate_dimensions) {
            console.info(`Getting Dimensions of ${this.getArtifactReference()} : ${this.display_name} (${this.artefact_id})`);
            let padding = this.getPadding();
            let dimensions = {width: 0, height: 0};
            let offset = {dx: 0, dy: 0};
            // Process Top Edge Artifacts
            offset = this.getFirstTopEdgeChildOffset();
            const top_edge_dimensions = this.getTopEdgeChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, top_edge_dimensions.width + offset.dx - padding.dx);
            dimensions.height = Math.max(dimensions.height, top_edge_dimensions.height);
            // Process Top Artifacts
            offset = this.getFirstTopChildOffset();
            const top_dimensions = this.getTopChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, top_dimensions.width);
            dimensions.height += top_dimensions.height;
            // Process Container Artifacts
            offset = this.getFirstContainerChildOffset();
            const container_dimensions = this.getContainerChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, container_dimensions.width);
            dimensions.height += container_dimensions.height;
            // Process Bottom Artifacts
            offset = this.getFirstBottomChildOffset();
            const bottom_dimensions = this.getBottomChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, bottom_dimensions.width);
            dimensions.height += bottom_dimensions.height;
            // Process Bottom Edge Artifacts
            offset = this.getFirstBottomEdgeChildOffset();
            const bottom_edge_dimensions = this.getBottomEdgeChildrenMaxDimensions();
            dimensions.width = Math.max(dimensions.width, bottom_edge_dimensions.width);
            dimensions.height = Math.max(dimensions.height, bottom_edge_dimensions.height);
            // Process Left Edge Artifacts
            // Process Left Artifacts
            const left_dimensions = this.getLeftChildrenMaxDimensions();
            dimensions.width += left_dimensions.width;
            dimensions.height = Math.max(dimensions.height, left_dimensions.height);
            // Process Right Artifacts
            const right_dimensions = this.getRightChildrenMaxDimensions();
            dimensions.width += right_dimensions.width;
            dimensions.height = Math.max(dimensions.height, right_dimensions.height);
            if (this.hasRightChildren()) {
                dimensions.width += positional_adjustments.spacing.x;
                dimensions.width += positional_adjustments.padding.x;
            }
            // Process Right Edge Artifacts
            const right_edge_dimensions = this.getRightEdgeChildrenMaxDimensions();
            dimensions.width += right_dimensions.width;
            dimensions.height = Math.max(dimensions.height, right_edge_dimensions.height);
            if (this.hasRightEdgeChildren()) {
                dimensions.width += positional_adjustments.spacing.x;
                dimensions.width += positional_adjustments.padding.x;
            }
            // Add Padding
            dimensions.width += padding.dx * 2;
            dimensions.height += padding.dy * 2;
            // Check size against minimum
            dimensions['width'] = Math.max(dimensions['width'], this.minimum_dimensions.width);
            dimensions['height'] = Math.max(dimensions['height'], this.minimum_dimensions.height);
            this._recalculate_dimensions = false;
            this._dimensions = dimensions;
            return dimensions;
        } else {
            return this._dimensions;
        }
    }
    // ---- Icon
    get icon_x_tranlation() {return this.collapsed ? super.icon_x_tranlation : -20;}
    get icon_y_tranlation() {return this.collapsed ? super.icon_y_tranlation : -20;}
    get icon_h_align() {return this.collapsed ? super.icon_h_align : 'start';}
    // ---- Rectangle
    get rect_stroke_dash() {return this.collapsed ? super.rect_stroke_dash : 5;}
    get rect_stroke_space() {return this.collapsed ? super.rect_stroke_space : 2;}
    get rect_stroke_opacity() {return this.collapsed ? super.rect_stroke_opacity : 1;}
    // ---- Text
    // ----- Name
    get show_name() {return this.collapsed ? super.show_name : true;}
    // ----- Type
    get show_type() {return this.collapsed ? super.show_type : true;}
    // ----- Info
    get show_info() {return this.collapsed ? super.show_info : true;}
    // ----- Label
    get show_label() {return this.collapsed ? super.show_label : false;}
    // ---- Okit View Functions

    paste(drop_target) {
        const clone = super.paste(drop_target);
        this.cloneChildren(clone);
        return clone;
    }

    updateCloneIds(clone) {
        if (this.getArtifactReference() === Subnet.getArtifactReference()) {
            clone.subnet_id = this.id;
            clone.compartment_id = this.compartment_id;
        } else if (this.getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            clone.vcn_id = this.id;
            clone.compartment_id = this.compartment_id;
        } else {
            clone.compartment_id = this.id;
        }
        return clone;
    }

/*
** SVG Functions
 */
    drawIcon(svg) {
        const icon = super.drawIcon(svg);
        // Add Click Event to toggle collapsed
        const self = this;
        icon.on("click", function() {
            self.collapsed = !self.collapsed;
            self.recalculate_dimensions = true;
            self.getJsonView().draw();
        });
        return icon
    }

    getPadding() {
        let padding = {
            dx: Math.round(positional_adjustments.spacing.x * 4),
            dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
        };
        return padding;
    }

    getChildTypes() {
        let child_types = this.getContainerArtifacts().concat(
            this.getLeftEdgeArtifacts(),   this.getLeftArtifacts(),
            this.getRightEdgeArtifacts(),  this.getRightArtifacts(),
            this.getTopEdgeArtifacts(),    this.getTopArtifacts(),
            this.getBottomEdgeArtifacts(), this.getBottomArtifacts()
        );
        return child_types;
    }

    getChildElements() {
        let child_elements = [];
        this.getChildTypes().forEach(element => child_elements.push(this.artefact.artefactToElement(element)));
        return child_elements;
    }

    /*
    ** Child Offset Functions
     */
    getDxOffset(offset, artefacts) {
        for (let child of artefacts) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(function() {
                offset.dx += Math.round(Number($(this).attr('width')) + positional_adjustments.spacing.x);
            });
        }
        return offset;
    }

    getDyOffset(offset, artefacts) {
        for (let child of artefacts) {
            $(jqId(this.id + '-svg')).children("svg[data-type='" + child + "']").each(function() {
                offset.dy += Math.round(Number($(this).attr('height')) + positional_adjustments.spacing.y);
            });
        }
        return offset;
    }

    getTopEdgeChildOffset() {
        return this.getDxOffset(this.getFirstTopEdgeChildOffset(), this.getTopEdgeArtifacts());
    }

    getTopChildOffset() {
        return this.getDxOffset(this.getFirstTopChildOffset(), this.getTopArtifacts());
    }

    getContainerChildOffset() {
        return this.getDyOffset(this.getFirstContainerChildOffset(), this.getContainerArtifacts());
    }

    getBottomChildOffset() {
        return this.getDxOffset(this.getFirstBottomChildOffset(), this.getBottomArtifacts());
    }

    getBottomEdgeChildOffset() {
        return this.getDxOffset(this.getFirstBottomEdgeChildOffset(), this.getBottomEdgeArtifacts());
    }

    getLeftEdgeChildOffset() {
        return this.getDyOffset(this.getFirstLeftEdgeChildOffset(), this.getLeftEdgeArtifacts());
    }

    getLeftChildOffset() {
        return this.getDyOffset(this.getFirstLeftChildOffset(), this.getLeftArtifacts());
    }

    getRightChildOffset() {
        return this.getDyOffset(this.getFirstRightChildOffset(), this.getRightArtifacts());
    }

    getRightEdgeChildOffset() {
        return this.getDyOffset(this.getFirstRightEdgeChildOffset(), this.getRightEdgeArtifacts());
    }

}

/*
** Define Root Canvas View Artifact Class
 */
class Canvas extends OkitArtifact {
    constructor(okitjson) {
        super(okitjson)
    }
    get okit_id() {return 'pseudo-compartment'}
    /*
    ** Static Functionality
     */
    static getArtifactReference() {return 'Pseudo Compartment'}
}

/*
** Define Root Canvas View Artifact Class
 */
class CanvasView extends OkitContainerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
        this.export = false;

    }

    get parent_id() {return 'canvas'}
    get parent() {return undefined}
    get children() {return this.json_view.getCompartments().filter(child => child.parent_id === undefined || child.parent_id === null || child.parent_id === '' || child.parent_id === 'canvas' || child.parent_id === child.id)}
    get minimum_dimensions() {return {width: $(`#${this.json_view.parent_id}`).width(), height: $(`#${this.json_view.parent_id}`).height()}}

    /*
    ** Child Type Functions
     */
    getContainerArtifacts() {
        return [Compartment.getArtifactReference()];
    }
    /*
    ** Static Functionality
     */
    static getArtifactReference() {return Canvas.getArtifactReference()}

}

// Define Arrays to contain View Classes and Objects
const okitViewClasses = [];
const okitViews = [];

const updateViews = (model) => {okitViews.forEach((v) => v.update(model ? model : okitJsonModel));redrawViews()}
const redrawViews = () => {okitViews.forEach((v) => v.draw())}
const newModel = (data) => {okitJsonModel = new OkitJson(data)}
// const newModel = (data) => {okitJsonModel = new OkitJson(data);updateViews()}

let okitJsonView = null;

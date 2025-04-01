/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Ready Javascript');

/*
** Define variables for Artefact classes
 */
//let okitJsonModel = new OkitJson();
let okitSessionOciConfigs = undefined;
let okitOciConfig = undefined;
let okitOciData = undefined;
let okitSettings = undefined;
let okitGitConfig = undefined;
let okitAutoSave = undefined;
let okitRegions = undefined;
//let okitTabularView = new OkitTabularJsonView();
const initialiseGlobals = () => {
    okitSessionOciConfigs = new OkitSessionOCIConfigs();
    okitSettings = new OkitSettings();
    okitOciConfig = new OkitOCIConfig(loadHeaderConfigDropDown);
    if (pca_mode || c3_mode) {
        okitRegions = new OkitPCARegions(loadHeaderRegionsDropDown);
        okitOciData = new OkitPCAData(okitSettings.profile, okitSettings.region);
    } else {
        okitRegions = new OkitRegions(loadHeaderRegionsDropDown);
        okitOciData = new OkitOCIData(okitSettings.profile, okitSettings.region);
    }
    okitGitConfig = new OkitGITConfig();
    okitOciProductPricing = new OkitOciProductPricing()

}
/*
** Ready function initiated on page load.
 */
$(document).ready(function() {
    /*
    ** Initialise OKIT Variables
     */
    initialiseGlobals()
    // okitSessionOciConfigs = new OkitSessionOCIConfigs();
    // okitSettings = new OkitSettings();
    // okitOciConfig = new OkitOCIConfig(loadHeaderConfigDropDown);
    // okitRegions = new OkitRegions(loadHeaderRegionsDropDown);
    // okitOciData = new OkitOCIData(okitSettings.profile, okitSettings.region);
    // okitGitConfig = new OkitGITConfig();
    // okitOciProductPricing = new OkitOciProductPricing()
    // // okitJsonModel = new OkitJson();
    newModel()
    okitJsonView = OkitCompartmentJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    // okitJsonView = new OkitCompartmentJsonView(okitJsonModel);
    // okitTabularView = new OkitTabularJsonView(okitJsonModel);
    okitTabularView = OkitTabularJsonView.newView(okitJsonModel, okitOciData, resource_icons);
    console.info(okitJsonView);
    // okitViews = [];
    console.info(`>>>>>>> Resource Icons:`, resource_icons)
    for (let view_class of okitViewClasses) {
        console.warn('View Class:', view_class);
        okitViews.push(view_class.newView(okitJsonModel, okitOciData, resource_icons))
    }
    for (let view of okitViews) {console.warn('Okit View:', view)}
    /*
    ** Configure Auto Save
     */
    okitAutoSave = new OkitAutoSave(hideRecoverMenuItem);
    // Test is Auto Save exists
    recovered_model = okitAutoSave.getOkitJsonModel();
    if (recovered_model) {$(jqId('file_recover_menu_item_li')).removeClass('hidden');}
    if (okitSettings && okitSettings.auto_save) {
        okitAutoSave.startAutoSave();
    }
    /*
    ** Add handler functionality
     */
    console.info('Adding Compartment Handlers');

    // Left Bar & Panels
    /*
    ** Simple Icon Left Bar
    */ 
    // Palette
    d3.select(d3Id('console_left_bar')).append('div')
        .attr('id', 'toggle_palette_button')
        .attr('class', 'okit-pointer-cursor palette okit-toolbar-button')
        .attr('title', 'Palette')
        .on('click', function () {
            slideLeftPanel('icons_palette')
        });
    // Compartment Explorer
    d3.select(d3Id('console_left_bar')).append('div')
        .attr('id', 'toggle_explorer_button')
        .attr('class', 'okit-pointer-cursor explorer okit-toolbar-button')
        .attr('title', 'Model Explorer')
        .on('click', function () {
            let okit_tree = new OkitJsonTreeView(okitJsonModel, 'explorer_panel');
            okit_tree.draw();
            slideLeftPanel('explorer_panel')
        });
    // Container
    d3.select(d3Id('console_left_bar')).append('div')
        .attr('id', 'toggle_local_button')
        .attr('class', 'okit-pointer-cursor folders okit-toolbar-button')
        .attr('title', 'Container Files')
        .on('click', function () {
            slideLeftPanel('local_panel')
        });
    // Templates
    d3.select(d3Id('console_left_bar')).append('div')
        .attr('id', 'toggle_templates_button')
        .attr('class', 'okit-pointer-cursor templates okit-toolbar-button')
        .attr('title', 'Templates')
        .on('click', function () {
            slideLeftPanel('templates_panel')
        });
    // Git
    d3.select(d3Id('console_left_bar')).append('div')
        .attr('id', 'toggle_git_button')
        .attr('class', 'okit-pointer-cursor git okit-toolbar-button')
        .attr('title', 'Git Version control')
        .on('click', function () {
            slideLeftPanel('git_panel')
        });

    console.info('Added Compartment Handlers');

    /*
    ** Add Load File Handling
     */
    //document.getElementById('files').addEventListener('change', handleFileSelect, false);

    /*
    ** Load Empty Properties Sheet
     */
    $(jqId(PROPERTIES_PANEL)).load('propertysheets/empty.html');

    /*
    ** Add Drag Bar Functionality
     */
    $(jqId('right_column_dragbar')).mousedown(function(e) {
        e.preventDefault();
        right_drag_bar_start_x = e.pageX;
        dragging_right_drag_bar = true;
        let main_panel = $('.main');
        let ghostbar = $('<div>',
            {
                id: 'ghostbar',
                css: {
                    height: main_panel.outerHeight(),
                    top: main_panel.offset().top,
                    left: main_panel.offset().left
                },
                class: 'okit-vertical-ghost-bar'
            }).appendTo('body');

        $(document).mousemove(function(e) {
            ghostbar.css("left",e.pageX+2);
        });
    });

    /**/
    $(document).mouseup(function (e) {
        if (dragging_right_drag_bar) {
            let center_column_width = $(jqId('designer_center_column')).width();
            let right_column_width = $(jqId('designer_right_column')).width();
            let moved = right_drag_bar_start_x - e.pageX;
            let new_width = right_column_width + moved;
            // Remove Bar artefacts
            $(jqId('ghostbar')).remove();
            $(document).unbind('mousemove');
            dragging_right_drag_bar = false;
            // Set Width
            $(jqId('designer_right_column')).width(new_width);
            if (new_width > 250) {
                $(jqId('designer_right_column')).css('min-width', new_width);
            } else {
                $(jqId('designer_right_column')).css('min-width', 250);
            }
            setTimeout(redrawSVGCanvas, 260);
        }
    });
    /**/

    $(jqId('navigation_menu_button')).click(function(e) {
        slideRightPanelsOffScreen();
        $(jqId('designer_right_column')).addClass('okit-slide-hide-right');
    });



    setOCILink();

    /*
    ** Check Palette layout
     */

    if (!okitSettings.icons_only) {
        $(jqId("icons_and_text")).prop('checked', 'checked');
        $(jqId("icons_and_text")).click();
    }
    if (okitSettings.target) {
        $(jqId(`${okitSettings.target}_palette`)).prop('checked', 'checked');
        $(jqId(`${okitSettings.target}_palette`)).click();
    }


    /*
    ** Display New Canvas
     */
    newDiagram();
    redrawSVGCanvas();

    /*
    ** Add redraw on resize
     */
    // window.addEventListener('resize', () => { redrawSVGCanvas(true) });

    /*
    ** Load Side Panels in Background
    */

    loadTemplatePanel()
    loadGitPanel()
    loadFileSystemPanel()

});

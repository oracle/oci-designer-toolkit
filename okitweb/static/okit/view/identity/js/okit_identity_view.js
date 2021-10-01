/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Identity View Javascript');

class OkitIdentityView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'identity-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'identity-div') {
        return new OkitIdentityView((model, oci_data, parent_id, resource_icons))
    }

    draw(for_export=false) {
        this.newCanvas()
        // Add Users Div
        const identify_panel = d3.select(`#${this.parent_id}`)
        this.drawUsersPanel(d3.select('#identity_users_div'))
        this.drawGroupsPanel(d3.select('#identity_user_groups_div'))
    }

    drawUsersPanel(parent) {
        const self = this
        const users_panel = parent.append('div').attr('id', 'identity_users_panel').attr('class', 'okit-users-grid okit-users-panel')
        self.model.getUsers().forEach((user) => self.addUserToPanel(users_panel, user))
    }

    addUserToPanel(parent, user) {
        const self = this
        const users_div = parent.append('div').attr('class', 'oci-user okit-user')
            .attr('title', `${user.display_name}`)
            .on('click', (e) => {d3.event.stopPropagation(); $(jqId(PROPERTIES_PANEL)).load("propertysheets/user.html", () => {loadPropertiesSheet(user);})});
        const details_div = users_div.append('div').attr('class', 'okit-resource-details')
        details_div.append('div').attr('class', 'okit-resource-title').text('User')
        details_div.append('div').append('input').attr('class', 'okit-resource-display-name').attr('tabindex', -1)
            .attr('type', 'text')
            .attr('name', `user_${user.display_name.replaceAll(' ','_')}`)
            .attr('value', `${user.display_name}`)
            .on('change', (d, i, o) => {
                self.updateUserDisplayName(user.display_name, o[0].value)
                user.display_name = o[0].value
            })
    }

    updateUserDisplayName(existing, updated) {
        const val_query = `#identity-div input[name="user_${existing.replaceAll(' ','_')}"][value="${existing}"]`
        // const val_query = `input[name="user_${existing.replaceAll(' ','_')}"]`
        const name_query = `#identity-div input[name="user_${existing.replaceAll(' ','_')}"]`
        console.info('Query', val_query)
        $(val_query).val(updated)
        $(name_query).attr('value', updated)
        $(name_query).attr('name', `user_${updated.replaceAll(' ','_')}`)
    }

    drawGroupsPanel(parent) {
        const self = this
        const groups_panel = parent.append('div').attr('id', 'identity_groups_panel').attr('class', 'okit-group-grid okit-groups-panel')
        self.model.getGroups().forEach((group) => self.addGroupToPanel(groups_panel, group))
    }

    addGroupToPanel(parent, group) {
        const self = this
        const groups_div = parent.append('div').attr('class', 'oci-user-group okit-user-group')
            .on('click', () => {$(jqId(PROPERTIES_PANEL)).load("propertysheets/group.html", () => {loadPropertiesSheet(group);})});
        const details_div = groups_div.append('div').attr('class', 'okit-resource-details')
        details_div.append('div').append('label').attr('class', 'okit-resource-title').text('User Group')
        // details_div.append('div').append('label').attr('class', 'okit-resource-display-name').text(`${group.display_name}`)
        details_div.append('div').append('input').attr('class', 'okit-resource-display-name').attr('tabindex', -1)
            .attr('type', 'text')
            .attr('name', `group_${group.display_name.replaceAll(' ','_')}`)
            .attr('value', `${group.display_name}`)
            .on('change', (d, i, o) => {
                self.updateGroupDisplayName(group.display_name, o[0].value)
                group.display_name = o[0].value
            })

        group.users.forEach((user) => self.addUserToPanel(groups_div, self.model.getUser(user)))
    }

    updateGroupDisplayName(existing, updated) {
        const val_query = `#identity-div input[name="group_${existing.replaceAll(' ','_')}"][value="${existing}"]`
        // const val_query = `input[name="user_${existing.replaceAll(' ','_')}"]`
        const name_query = `#identity-div input[name="group_${existing.replaceAll(' ','_')}"]`
        console.info('Query', val_query)
        $(val_query).val(updated)
        $(name_query).attr('value', updated)
        $(name_query).attr('name', `group_${updated.replaceAll(' ','_')}`)
    }

    addUser() {
        const users_panel = d3.select('#identity_users_panel')
        const user = new User({}, this.model)
        this.model.getUsers().push(user)
        this.addUserToPanel(users_panel, user)
    }

    addUserGroup() {
        const groups_panel = d3.select('#identity_groups_panel')
        const group = new Group({}, this.model)
        this.model.getGroups().push(group)
        this.addGroupToPanel(groups_panel, group)
    }

   newCanvas() {
        const self = this
        $(`#${this.parent_id}`).empty()
        const identify_panel = d3.select(`#${this.parent_id}`)
        // Users
        const users_details = identify_panel.append('div').attr('id', 'identity_users_div').attr('class', 'okit-identity-details')
        const user_details_title = users_details.append('div').attr('class', 'okit-data-entry-title')
        user_details_title.append('label').text('Users')
        user_details_title.append('div').attr('class', 'cancel action-button-background')
            .on('click', () => {self.addUser()})
        // User Groups
        const groups_details = identify_panel.append('div').attr('id', 'identity_user_groups_div').attr('class', 'okit-identity-details')
        const group_details_title = groups_details.append('div').attr('class', 'okit-data-entry-title')
        group_details_title.append('label').text('User Groups')
        group_details_title.append('div').attr('class', 'cancel action-button-background')
            .on('click', () => {self.addUserGroup()})
    }

}

okitViewClasses.push(OkitIdentityView);

let okitIdentityView = null;

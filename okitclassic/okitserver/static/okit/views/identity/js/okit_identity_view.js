/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Identity View Javascript');

class OkitIdentityView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'identity-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'identity-div') {
        console.info(`>>>>>>> Resource Icons:`, resource_icons)
        return new OkitIdentityView(model, oci_data, resource_icons, parent_id)
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
        const users_panel = parent.append('div').attr('class', 'okit-identity-scroll-panel').append('div').attr('id', 'identity_users_panel').attr('class', 'okit-users-grid okit-users-panel')
        self.model.getUsers().forEach((user) => self.addUserToPanel(users_panel, user))
    }

    addUserToPanel(parent, user, group) {
        const self = this
        const user_div = parent.append('div').attr('class', 'oci-user okit-user')
            .attr('title', `${user.display_name}`)
            .on('click', (event) => {
                event = d3.event // Temp Work around for v0.67.0 release
                event.stopPropagation();  // event replaces d3.event
                $(jqId(PROPERTIES_PANEL)).load("propertysheets/user.html", () => {loadPropertiesSheet(user);})
            });
        const details_div = user_div.append('div').attr('class', 'okit-resource-details')
        details_div.append('div').attr('class', 'okit-resource-title').text('User')
        details_div.append('div').append('input').attr('class', 'okit-resource-display-name').attr('tabindex', -1)
            .attr('type', 'text')
            .attr('name', `user_${user.display_name.replaceAll(' ','_')}`)
            .attr('value', `${user.display_name}`)
            .on('change', (d, i, o) => {
                self.updateUserDisplayName(user.display_name, o[0].value)
                user.display_name = o[0].value
            })
        user_div.append('div').attr('class', 'cancel action-button-background cancel-overlay')
            .on('click', () => {group ? self.deleteUserFromGroup(user, group) : self.deleteUser(user.id)})
        if (!group) {
            user_div.attr('draggable', 'true').on('dragstart', (event) => {
                event = d3.event // Temp Work around for v0.67.0 release
                event.dataTransfer.setData('text/plain', user.id) // event replaces d3.event
            })
        }
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
        const groups_panel = parent.append('div').attr('class', 'okit-identity-scroll-panel').append('div').attr('id', 'identity_groups_panel').attr('class', 'okit-group-grid okit-groups-panel')
        self.model.getGroups().forEach((group) => self.addGroupToPanel(groups_panel, group))
    }

    addGroupToPanel(parent, group) {
        const self = this
        const group_div = parent.append('div').attr('class', 'oci-user-group okit-user-group')
            .on('click', () => {$(jqId(PROPERTIES_PANEL)).load("propertysheets/group.html", () => {
                self.loadUsersMultiSelect('user_ids')
                loadPropertiesSheet(group)
                $('#user_ids').find("input:checkbox").each(function() {
                    console.info('Adding Click event')
                    $(this).on('change', () => {self.draw(); console.info('Clicked')});
                });    
            })});
        const details_div = group_div.append('div').attr('class', 'okit-resource-details')
        details_div.append('div').append('label').attr('class', 'okit-resource-title').text('User Group')
        details_div.append('div').append('input').attr('class', 'okit-resource-display-name').attr('tabindex', -1)
            .attr('type', 'text')
            .attr('name', `group_${group.display_name.replaceAll(' ','_')}`)
            .attr('value', `${group.display_name}`)
            .on('change', (d, i, o) => {
                self.updateGroupDisplayName(group.display_name, o[0].value)
                group.display_name = o[0].value
            })

        group.user_ids.forEach((id) => self.addUserToPanel(group_div, self.model.getUser(id), group))
        group_div.append('div').attr('class', 'cancel action-button-background cancel-overlay')
            .on('click', () => {self.deleteUserGroup(group.id)})
        group_div.on('dragover', (event) => {event.preventDefault()})
            .on('drop', (event) => { // event replaces d3.event
                event = d3.event // Temp Work around for v0.67.0 release
                const user_id = event.dataTransfer.getData('text/plain') // event replaces d3.event
                if (!group.user_ids.includes(user_id)) group.user_ids.push(user_id)
                self.draw()
            })
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
        const user = this.model.newUser({})
        this.addUserToPanel(users_panel, user)
    }

    deleteUser(id) {
        this.model.deleteUser(id)
        this.model.getGroups().forEach((g) => g.user_ids = g.user_ids ? g.user_ids.filter((uid) => uid !== id) : [])
        this.draw()
    }

    deleteUserFromGroup(user, group) {
        group.user_ids = group.user_ids.filter((id) => id !== user.id)
        this.draw()
    }

    addUserGroup() {
        const groups_panel = d3.select('#identity_groups_panel')
        const group = this.model.newGroup({})
        this.addGroupToPanel(groups_panel, group)
    }

    deleteUserGroup(id) {
        this.model.deleteGroup(id)
        this.draw()
    }

   newCanvas() {
        const self = this
        $(`#${this.parent_id}`).empty()
        const identify_panel = d3.select(`#${this.parent_id}`)
        // Users
        const users_details = identify_panel.append('div').attr('id', 'identity_users_div').attr('class', 'okit-identity-details')
        const user_details_title = users_details.append('div').attr('class', 'okit-data-entry-title')
        user_details_title.append('label').text('Users')
        user_details_title.append('div').attr('class', 'okit-user-add user-button-background')
            .on('click', () => {self.addUser()})
        // User Groups
        const groups_details = identify_panel.append('div').attr('id', 'identity_user_groups_div').attr('class', 'okit-identity-details')
        const group_details_title = groups_details.append('div').attr('class', 'okit-data-entry-title')
        group_details_title.append('label').text('User Groups')
        group_details_title.append('div').attr('class', 'okit-user-group-add user-group-button-background')
            .on('click', () => {self.addUserGroup()})
    }

}

okitViewClasses.push(OkitIdentityView);

let okitIdentityView = null;

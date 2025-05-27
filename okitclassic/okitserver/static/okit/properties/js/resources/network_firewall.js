/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Firewall Properties Javascript');

/*
** Define Network Firewall Properties Class
*/
class NetworkFirewallProperties extends OkitResourceProperties {
    type_data = {options: {SSL_FORWARD_PROXY: 'SSL Forward Proxy', SSL_INBOUND_INSPECTION: 'SSL Inbound Inspection'}}

    constructor (resource) {
        const resource_tabs = ['Policy']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Networking
        const networking = this.createDetailsSection('Networking', `${this.id}_networking_details`)
        this.append(this.properties_contents, networking.details)
        this.networking_div = networking.div
        const networking_table = this.createTable('', `${this.id}_networking`)
        this.networking_tbody = networking_table.tbody
        this.append(this.networking_div, networking_table.table)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => this.resource.subnet_id = n[i].value)
        this.append(this.networking_tbody, subnet.row)
        this.subnet_id = subnet.input
        // NSG Lists
        const network_security_group_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_network_security_group_ids`, '', (d, i, n) => this.resource.network_security_group_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.network_security_group_ids = network_security_group_ids.input
        this.append(this.networking_tbody, network_security_group_ids.row)
        // Pricing Estimates
        const pricing_estimates_details = this.createDetailsSection('Pricing Estimates', `${this.id}_pricing_estimates_details`)
        this. pricing_estimates_details =  pricing_estimates_details.details
        this.append(this.properties_contents, pricing_estimates_details.details)
        const pricing_estimates_table = this.createTable('', `${this.id}_pricing_estimates_properties`)
        this.pricing_estimates_tbody = pricing_estimates_table.tbody
        this.append(pricing_estimates_details.div, pricing_estimates_table.table)
        // Data Processed
        const estimated_gb_data_processed_data = {min: 0}
        const estimated_gb_data_processed = this.createInput('number', 'Network Firewall Data Processing (GB)', `${this.id}_estimated_gb_data_processed`, '', (d, i, n) => {n[i].reportValidity(); this.resource.pricing_estimates.estimated_gb_data_processed = n[i].value}, estimated_gb_data_processed_data)
        this.append(this.pricing_estimates_tbody, estimated_gb_data_processed.row)
        this.estimated_gb_data_processed = estimated_gb_data_processed.input
        this.estimated_gb_data_processed_row = estimated_gb_data_processed.row
        // Policy
        const policy_details = this.createDetailsSection('Policy', `${this.id}_policy_details`)
        this.append(this.policy_contents, policy_details.details)
        this.policy_div = policy_details.div
        const policy_props = this.createTable('', `${this.id}_policy_props`, '')
        this.policy_tbody = policy_props.tbody
        this.append(this.policy_div, policy_props.table)    
        // Display Name
        const policy_display_name = this.createInput('text', 'Name', `${this.id}_policy_display_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.network_firewall_policy.display_name = n[i].value})
        this.policy_display_name = policy_display_name.input
        this.append(this.policy_tbody, policy_display_name.row)
        // IP Addresses
        const ip_address_lists = this.createDetailsSection('IP Address Lists', `${this.id}_ip_address_lists_details`)
        this.append(this.policy_div, ip_address_lists.details)
        this.ip_address_lists_div = ip_address_lists.div
        const ip_address_lists_table = this.createMapTable('IP Addresses', `${this.id}_ip_address_lists`, '', () => this.addIPAddressList())
        this.ip_address_lists_tbody = ip_address_lists_table.tbody
        this.append(ip_address_lists.div, ip_address_lists_table.table)
        // URLs
        const url_lists = this.createDetailsSection('URL Lists', `${this.id}_url_lists_details`)
        this.append(this.policy_div, url_lists.details)
        this.url_lists_div = url_lists.div
        const url_lists_table = this.createMapTable('URLs', `${this.id}_url_lists`, '', () => this.addURLList())
        this.url_lists_tbody = url_lists_table.tbody
        this.append(url_lists.div, url_lists_table.table)
        // Mapped Secrets
        const mapped_secrets = this.createDetailsSection('Mapped Secrets', `${this.id}_mapped_secrets_details`)
        this.append(this.policy_div, mapped_secrets.details)
        this.mapped_secrets_div = mapped_secrets.div
        const mapped_secrets_table = this.createArrayTable('Secrets', `${this.id}_mapped_secrets`, '', () => this.addMappedSecret())
        this.mapped_secrets_tbody = mapped_secrets_table.tbody
        this.append(mapped_secrets.div, mapped_secrets_table.table)
        // Decryption Profiles
        const decryption_profiles = this.createDetailsSection('Decryption Profiles', `${this.id}_decryption_profiles_details`)
        this.append(this.policy_div, decryption_profiles.details)
        this.decryption_profiles_div = decryption_profiles.div
        const decryption_profiles_table = this.createArrayTable('Profiles', `${this.id}_decryption_profiles`, '', () => this.addDecryptionProfile())
        this.decryption_profiles_tbody = decryption_profiles_table.tbody
        this.append(decryption_profiles.div, decryption_profiles_table.table)
        // Decryption Rules
        const decryption_rules = this.createDetailsSection('Decryption Rules', `${this.id}_decryption_rules_details`)
        this.append(this.policy_div, decryption_rules.details)
        this.decryption_rules_div = decryption_rules.div
        const decryption_rules_table = this.createArrayTable('Rules', `${this.id}_decryption_rules`, '', () => this.addDecryptionRule())
        this.decryption_rules_tbody = decryption_rules_table.tbody
        this.append(decryption_rules.div, decryption_rules_table.table)
        // Security Rules
        const security_rules = this.createDetailsSection('Security Rules', `${this.id}_security_rules_details`)
        this.append(this.policy_div, security_rules.details)
        this.security_rules_div = security_rules.div
        const security_rules_table = this.createArrayTable('Rules', `${this.id}_security_rules`, '', () => this.addSecurityRule())
        this.security_rules_tbody = security_rules_table.tbody
        this.append(security_rules.div, security_rules_table.table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        // Networking
        this.setMultiSelect(this.network_security_group_ids, this.resource.network_security_group_ids)
        this.subnet_id.property('value', this.resource.subnet_id)
        // Pricing
        this.estimated_gb_data_processed.property('value', this.resource.pricing_estimates.estimated_gb_data_processed)

        // Policy
        // Display Name
        this.policy_display_name.property('value', this.resource.network_firewall_policy.display_name)
        // IP Lists
        this.loadIPAddressLists()
        // URL Lists
        this.loadURLLists()
        // Decryption Profiles
        this.loadDecryptionProfiles()
        // Mapped Secrets
        this.loadMappedSecrets()
        // Security Rules
        this.loadSecurityRules()
        // Decryption Rules
        this.loadDecryptionRules()
    }
    // IP Address Lists
    loadIPAddressLists() {
        this.ip_address_lists_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.ip_address_lists).forEach(([k, v], i) => this.addIPAddressListHtml(k, v, i+1))
        this.ip_address_lists_idx = Object.keys(this.resource.network_firewall_policy.ip_address_lists).length;
    }
    addIPAddressListHtml(key, value, idx) {
        const id = `${this.id}_ip_list`
        const key_changed = (d, i, n) => {
            const ip_address_lists = this.resource.network_firewall_policy.ip_address_lists
            this.resource.network_firewall_policy.ip_address_lists = Object.fromEntries(Object.entries(ip_address_lists).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadIPAddressLists()
        }
        const value_changed = (d, i, n) => {
            const ip_address_lists = this.resource.network_firewall_policy.ip_address_lists
            ip_address_lists[key] = n[i].value.split(',')
        }
        const delete_row = this.createMapDeleteRow('ipv4_cidr_list', id, idx, key_changed, value_changed, () => this.deleteIPAddressList(id, idx, key))
        this.append(this.ip_address_lists_tbody, delete_row.row)
        delete_row.key_input.property('value', key)
        delete_row.val_input.property('value', value.join(','))
    }
    addIPAddressList() {
        this.ip_address_lists_idx += 1
        const key = `IPList${this.ip_address_lists_idx}`
        const value = []
        this.resource.network_firewall_policy.ip_address_lists[key] = value
        this.addIPAddressListHtml(key, value, this.ip_address_lists_idx)
    }
    deleteIPAddressList(id, idx, key) {
        delete this.resource.network_firewall_policy.ip_address_lists[key]
        this.loadIPAddressLists()
    }
    // URL Lists
    loadURLLists() {
        this.url_lists_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.url_lists).forEach(([k, v], i) => this.addURLListHtml(k, v, i+1))
        this.url_lists_idx = Object.keys(this.resource.network_firewall_policy.url_lists).length;
    }
    addURLListHtml(key, value, idx) {
        const id = `${this.id}_url_list`
        const key_changed = (d, i, n) => {
            const url_lists = this.resource.network_firewall_policy.url_lists
            this.resource.network_firewall_policy.url_lists = Object.fromEntries(Object.entries(url_lists).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadURLLists()
        }
        const value_changed = (d, i, n) => {
            const url_lists = this.resource.network_firewall_policy.url_lists
            url_lists[key] = n[i].value.split('\n').map(v => {return {pattern: v, type: 'SIMPLE'}})
        }
        const delete_row_data = {rows: 10}
        const delete_row = this.createMapDeleteRow('textarea', id, idx, key_changed, value_changed, () => this.deleteURLList(id, idx, key), delete_row_data)
        this.append(this.url_lists_tbody, delete_row.row)
        delete_row.key_input.property('value', key)
        delete_row.val_input.property('value', value.map(v => v.pattern).join('\n'))
    }
    addURLList() {
        this.url_lists_idx += 1
        const key = `URLList${this.url_lists_idx}`
        const value = []
        this.resource.network_firewall_policy.url_lists[key] = value
        this.addURLListHtml(key, value, this.url_lists_idx)
    }
    deleteURLList(id, idx, key) {
        delete this.resource.network_firewall_policy.url_lists[key]
        this.loadURLLists()
    }
    // Decryption Profiles
    loadDecryptionProfiles() {
        this.decryption_profiles_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.decryption_profiles).forEach(([k, v], i) => this.addDecryptionProfileHtml(k, v, i+1))
        this.decryption_profile_idx = Object.keys(this.resource.network_firewall_policy.decryption_profiles).length;
    }
    addDecryptionProfileHtml(key, value, idx) {
        const id = `${this.id}_decryption_profile`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteDecryptionProfile(id, idx, key))
        this.append(this.decryption_profiles_tbody, delete_row.row)
        const rd = this.createDetailsSection('Profile', `${id}_details`, idx)
        this.append(delete_row.div, rd.details)
        const rt = this.createTable('', `${id}_table`, '')
        this.append(rd.div, rt.table)
        // Name (Key)
        const name = this.createInput('text', 'Name', `${id}_name`, '', (d, i, n) => {
            const decryption_profiles = this.resource.network_firewall_policy.decryption_profiles
            this.resource.network_firewall_policy.decryption_profiles = Object.fromEntries(Object.entries(decryption_profiles).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadDecryptionProfiles()
        })
        this.append(rt.tbody, name.row)
        name.input.property('value', key)
        // Profile Type
        const dptype_data = this.type_data
        const dptype = this.createInput('select', 'Decryption Type', `${id}_decryption_type`, idx, (d, i, n) => {value.type = n[i].value; this.showDecryptionProfileTypeRows(value, id, idx)}, dptype_data)
        this.append(rt.tbody, dptype.row)
        dptype.input.property('value', value.type)
        // Block Out Of Capacity Blocked
        const is_out_of_capacity_blocked = this.createInput('checkbox', 'Block Out Of Resources', `${id}_is_out_of_capacity_blocked`, idx, (d, i, n) => value.is_out_of_capacity_blocked = n[i].checked)
        this.append(rt.tbody, is_out_of_capacity_blocked.row)
        is_out_of_capacity_blocked.input.property('checked', value.is_out_of_capacity_blocked)
        // UBlock nsupported Cypher
        const is_unsupported_cipher_blocked = this.createInput('checkbox', 'Block Unsupported Cypher', `${id}_is_unsupported_cipher_blocked`, idx, (d, i, n) => value.is_unsupported_cipher_blocked = n[i].checked)
        this.append(rt.tbody, is_unsupported_cipher_blocked.row)
        is_unsupported_cipher_blocked.input.property('checked', value.is_unsupported_cipher_blocked)
        // Block Unsupported Version
        const is_unsupported_version_blocked = this.createInput('checkbox', 'Block Unsupported Version', `${id}_is_unsupported_version_blocked`, idx, (d, i, n) => value.is_unsupported_version_blocked = n[i].checked)
        this.append(rt.tbody, is_unsupported_version_blocked.row)
        is_unsupported_version_blocked.input.property('checked', value.is_unsupported_version_blocked)
        // Block Expired Certificates
        const is_expired_certificate_blocked = this.createInput('checkbox', 'Block Expired Certificates', `${id}_is_expired_certificate_blocked`, idx, (d, i, n) => value.is_expired_certificate_blocked = n[i].checked)
        this.append(rt.tbody, is_expired_certificate_blocked.row)
        is_expired_certificate_blocked.input.property('checked', value.is_expired_certificate_blocked)
        // Block Untrusted Issuer
        const is_untrusted_issuer_blocked = this.createInput('checkbox', 'Block Untrusted Issuer', `${id}_is_untrusted_issuer_blocked`, idx, (d, i, n) => value.is_untrusted_issuer_blocked = n[i].checked)
        this.append(rt.tbody, is_untrusted_issuer_blocked.row)
        is_untrusted_issuer_blocked.input.property('checked', value.is_untrusted_issuer_blocked)
        // Block Unknown Certificate
        const is_unknown_revocation_status_blocked = this.createInput('checkbox', 'Block Unknown Certificate', `${id}_is_unknown_revocation_status_blocked`, idx, (d, i, n) => value.is_unknown_revocation_status_blocked = n[i].checked)
        this.append(rt.tbody, is_unknown_revocation_status_blocked.row)
        is_unknown_revocation_status_blocked.input.property('checked', value.is_unknown_revocation_status_blocked)
        // Block Certificate Timeout
        const is_revocation_status_timeout_blocked = this.createInput('checkbox', 'Block Certificate Timeout', `${id}_is_revocation_status_timeout_blocked`, idx, (d, i, n) => value.is_revocation_status_timeout_blocked = n[i].checked)
        this.append(rt.tbody, is_revocation_status_timeout_blocked.row)
        is_revocation_status_timeout_blocked.input.property('checked', value.is_revocation_status_timeout_blocked)
        // Restrict Certificate Extension
        const are_certificate_extensions_restricted = this.createInput('checkbox', 'Restrict Certificate Extension', `${id}_are_certificate_extensions_restricted`, idx, (d, i, n) => value.are_certificate_extensions_restricted = n[i].checked)
        this.append(rt.tbody, are_certificate_extensions_restricted.row)
        are_certificate_extensions_restricted.input.property('checked', value.are_certificate_extensions_restricted)
        // Auto Include Alternative Name
        const is_auto_include_alt_name = this.createInput('checkbox', 'Auto Include Alternative Name', `${id}_is_auto_include_alt_name`, idx, (d, i, n) => value.is_auto_include_alt_name = n[i].checked)
        this.append(rt.tbody, is_auto_include_alt_name.row)
        is_auto_include_alt_name.input.property('checked', value.is_auto_include_alt_name)
        this.showDecryptionProfileTypeRows(value, id, idx)
    }
    addDecryptionProfile() {
        this.decryption_profile_idx += 1
        const key = `DecryptionProfile${this.decryption_profile_idx}`
        const value = this.resource.newDecryptionProfile()
        this.resource.network_firewall_policy.decryption_profiles[key] = value
        this.addDecryptionProfileHtml(key, value, this.decryption_profile_idx)
    }
    deleteDecryptionProfile(id, idx, key) {
        delete this.resource.network_firewall_policy.decryption_profiles[key]
        this.loadDecryptionProfiles()
    }
    showDecryptionProfileTypeRows(value, id, idx) {
        const inspection_flags = [
            'are_certificate_extensions_restricted', 
            'is_auto_include_alt_name',
            'is_expired_certificate_blocked',
            'is_revocation_status_timeout_blocked',
            'is_unknown_revocation_status_blocked',
            'is_untrusted_issuer_blocked'
        ]
        if (value.type === 'SSL_FORWARD_PROXY') {inspection_flags.forEach(f => this.showProperty(`${id}_${f}`, idx))}
        else {inspection_flags.forEach(f => this.hideProperty(`${id}_${f}`, idx))}
    }

    // Mapped Secrets
    loadMappedSecrets() {
        this.mapped_secrets_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.mapped_secrets).forEach(([k, v], i) => this.addMappedSecretHtml(k, v, i+1))
        this.mapped_secret_idx = Object.keys(this.resource.network_firewall_policy.mapped_secrets).length;
    }
    addMappedSecretHtml(key, value, idx) {
        const id = `${this.id}_mapped_secret`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteMappedSecret(id, idx, key))
        this.append(this.mapped_secrets_tbody, delete_row.row)
        const rd = this.createDetailsSection('Secret', `${id}_details`, idx)
        this.append(delete_row.div, rd.details)
        const rt = this.createTable('', `${id}_table`, '')
        this.append(rd.div, rt.table)
        // Name (Key)
        const name = this.createInput('text', 'Name', `${id}_name`, '', (d, i, n) => {
            const mapped_secrets = this.resource.network_firewall_policy.mapped_secrets
            this.resource.network_firewall_policy.mapped_secrets = Object.fromEntries(Object.entries(mapped_secrets).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadDecryptionProfiles()
        })
        this.append(rt.tbody, name.row)
        name.input.property('value', key)
        // Profile Type
        const mstype_data = this.type_data
        const mstype = this.createInput('select', 'Secret Type', `${id}_decryption_type`, idx, (d, i, n) => {value.type = n[i].value; this.showDecryptionProfileTypeRows(value, id, idx)}, mstype_data)
        this.append(rt.tbody, mstype.row)
        mstype.input.property('value', value.type)
        // Secret
        const vault_secret_id = this.createInput('select', 'Secret', `${id}_vault_secret_id`, idx, (d, i, n) => {value.vault_secret_id = n[i].value})
        this.append(rt.tbody, vault_secret_id.row)
        this.loadSelect(vault_secret_id.input, 'vault_secrets', true)
        vault_secret_id.input.property('value', value.vault_secret_id)
    }
    addMappedSecret() {
        this.mapped_secret_idx += 1
        const key = `MappedSecret${this.mapped_secret_idx}`
        const value = this.resource.newMappedSecret()
        this.resource.network_firewall_policy.mapped_secrets[key] = value
        this.addMappedSecretHtml(key, value, this.mapped_secret_idx)
    }
    deleteMappedSecret(id, idx, key) {
        delete this.resource.network_firewall_policy.mapped_secrets[key]
        this.loadMappedSecrets()
    }

    // Security Rules
    loadSecurityRules() {
        this.security_rules_tbody.selectAll('*').remove()
        this.resource.network_firewall_policy.security_rules.forEach((e, i) => this.addSecurityRuleHtml(e, i+1))
        this.security_rule_idx = this.resource.network_firewall_policy.security_rules.length;
    }
    addSecurityRuleHtml(rule, idx) {
        const id = `${this.id}_security_rule${idx}`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteSecurityRule(id, idx, rule))
        this.append(this.security_rules_tbody, delete_row.row)
        const rule_details = this.createDetailsSection('Rule', `${id}_details`, idx)
        this.append(delete_row.div, rule_details.details)
        const rule_table = this.createTable('', `${id}_table`, '')
        this.append(rule_details.div, rule_table.table)
        // Name
        const name = this.createInput('text', 'Name', `${id}_name`, '', (d, i, n) => rule.name = n[i].value)
        this.append(rule_table.tbody, name.row)
        name.input.property('value', rule.name)
        // Action
        const action_data = {
            options: {
                ALLOW: 'Allow',
                DROP: 'Drop',
                INSPECT: 'Inspect',
                REJECT: 'Reject'
            }
        }
        const action = this.createInput('select', 'Action', `${id}_action${idx}`, '', (d, i, n) => {rule.action = n[i].value; this.showInspectionRows(rule, id, idx)}, action_data)
        this.append(rule_table.tbody, action.row)
        action.input.property('value', rule.action)
        // Inspection
        const inspection_data = {
            options: {
                INTRUSION_DETECTION: 'Intrusion Detection',
                INTRUSION_PREVENTION: 'Intrusion Prevention'
            }
        }
        const inspection = this.createInput('select', 'Inspection', `${id}_inspection${idx}`, '', (d, i, n) => rule.inspection = n[i].value, inspection_data)
        this.append(rule_table.tbody, inspection.row)
        inspection.input.property('value', rule.inspection)
        // Sources
        const sources = this.createInput('multiselect', 'Source IPs', `${id}_sources`, '', (d, i, n) => {rule.condition.sources = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, sources.row)
        this.loadMultiSelectFromList(sources.input, Object.keys(this.resource.network_firewall_policy.ip_address_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(sources.input, rule.condition.sources)
        // Destinations
        const destinations = this.createInput('multiselect', 'Destination IPs', `${id}_destinations`, '', (d, i, n) => {rule.condition.destinations = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, destinations.row)
        this.loadMultiSelectFromList(destinations.input, Object.keys(this.resource.network_firewall_policy.ip_address_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(destinations.input, rule.condition.destinations)
        // Applications
        const applications = this.createInput('multiselect', 'Applications', `${id}_applications`, '', (d, i, n) => {rule.condition.applications = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, applications.row)
        this.loadMultiSelectFromList(applications.input, Object.keys(this.resource.network_firewall_policy.application_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(applications.input, rule.condition.applications)
        // URLs
        const urls = this.createInput('multiselect', 'URLs', `${id}_urls`, '', (d, i, n) => {rule.condition.urls = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, urls.row)
        this.loadMultiSelectFromList(urls.input, Object.keys(this.resource.network_firewall_policy.url_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(urls.input, rule.condition.urls)

        this.showInspectionRows(rule, id, idx)
    }
    addSecurityRule() {
        const rule = this.resource.newSecurityRule();
        this.resource.network_firewall_policy.security_rules.push(rule);
        this.security_rule_idx += 1
        this.addSecurityRuleHtml(rule, this.security_rule_idx);
    }
    deleteSecurityRule(id, idx, rule) {
        this.resource.network_firewall_policy.security_rules = this.resource.network_firewall_policy.security_rules.filter((e) => e !== rule)
        $(`#${id}${idx}_row`).remove()
    }
    showInspectionRows(value, id, idx) {
        console.info(`Action: ${value.action} Id: ${id}_inspection ${idx}`)
        if (value.action === 'INSPECT') {
            this.showProperty(`${id}_inspection`, idx)
            if (!value.inspection || value.inspection === '') value.inspection ='INTRUSION_DETECTION'
            this.setPropertyValue(`${id}_inspection`, idx, value.inspection)
        }
        else {
            this.hideProperty(`${id}_inspection`, idx)
            value.inspection = ''
        }
    }

    // Decryption Rules
    loadDecryptionRules() {
        this.decryption_rules_tbody.selectAll('*').remove()
        this.resource.network_firewall_policy.decryption_rules.forEach((e, i) => this.addDecryptionRuleHtml(e, i+1))
        this.decryption_rule_idx = this.resource.network_firewall_policy.decryption_rules.length;
    }
    addDecryptionRuleHtml(rule, idx) {
        const id = `${this.id}_decryption_rule${idx}`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteDecryptionRule(id, idx, rule))
        this.append(this.decryption_rules_tbody, delete_row.row)
        const rule_details = this.createDetailsSection('Rule', `${id}_details`, idx)
        this.append(delete_row.div, rule_details.details)
        const rule_table = this.createTable('', `${id}_table`, '')
        this.append(rule_details.div, rule_table.table)
        // Name
        const name = this.createInput('text', 'Name', `${id}_name`, '', (d, i, n) => rule.name = n[i].value)
        this.append(rule_table.tbody, name.row)
        name.input.property('value', rule.name)
        // Action
        const action_data = {
            options: {
                DECRYPT: 'Decrypt',
                NO_DECRYPT: 'Do not Decrypt'
            }
        }
        const action = this.createInput('select', 'Action', `${id}_action${idx}`, '', (d, i, n) => {rule.action = n[i].value; this.showDecryptionRows(rule, id, idx)}, action_data)
        this.append(rule_table.tbody, action.row)
        action.input.property('value', rule.action)
        // Sources
        const sources = this.createInput('multiselect', 'Source IPs', `${id}_sources`, '', (d, i, n) => {rule.condition.sources = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, sources.row)
        this.loadMultiSelectFromList(sources.input, Object.keys(this.resource.network_firewall_policy.ip_address_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(sources.input, rule.condition.sources)
        // Destinations
        const destinations = this.createInput('multiselect', 'Destination IPs', `${id}_destinations`, '', (d, i, n) => {rule.condition.destinations = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.append(rule_table.tbody, destinations.row)
        this.loadMultiSelectFromList(destinations.input, Object.keys(this.resource.network_firewall_policy.ip_address_lists).map((k) => {return {id: k, display_name: k}}))
        this.setMultiSelect(destinations.input, rule.condition.destinations)
        // Decryption Profile
        const decryption_profile = this.createInput('select', 'Decription Profile', `${id}_decryption_profile${idx}`, '', (d, i, n) => {rule.decryption_profile = n[i].value})
        this.append(rule_table.tbody, decryption_profile.row)
        decryption_profile.input.property('value', rule.decryption_profile)
        this.loadSelectFromList(decryption_profile.input, Object.keys(this.resource.network_firewall_policy.decryption_profiles).map((k) => {return {id: k, display_name: k}}))
        decryption_profile.input.property('value', rule.decryption_profile)
        // Secret
        const secret = this.createInput('select', 'Secret', `${id}_secret${idx}`, '', (d, i, n) => {rule.secret = n[i].value})
        this.append(rule_table.tbody, secret.row)
        secret.input.property('value', rule.secret)
        this.loadSelectFromList(secret.input, Object.keys(this.resource.network_firewall_policy.mapped_secrets).map((k) => {return {id: k, display_name: k}}))
        secret.input.property('value', rule.secret)

        this.showDecryptionRows(rule, id, idx)
    }
    addDecryptionRule() {
        const rule = this.resource.newDecryptionRule();
        this.resource.network_firewall_policy.decryption_rules.push(rule);
        this.decryption_rule_idx += 1
        this.addDecryptionRuleHtml(rule, this.decryption_rule_idx);
    }
    deleteDecryptionRule(id, idx, rule) {
        this.resource.network_firewall_policy.decryption_rules = this.resource.network_firewall_policy.decryption_rules.filter((e) => e !== rule)
        $(`#${id}${idx}_row`).remove()
    }
    showDecryptionRows(value, id, idx) {
        console.info(`Action: ${value.action} Id: ${id} ${idx}`)
        if (value.action === 'DECRYPT') {
            this.showProperty(`${id}_decryption_profile`, idx)
            this.setPropertyValue(`${id}_decryption_profile`, idx, value.decryption_profile)
            this.showProperty(`${id}_secret`, idx)
            this.setPropertyValue(`${id}_secret`, idx, value.secret)
        }
        else {
            this.hideProperty(`${id}_decryption_profile`, idx)
            value.decryption_profile = ''
            this.hideProperty(`${id}_secret`, idx)
            value.secret = ''
        }
    }
}

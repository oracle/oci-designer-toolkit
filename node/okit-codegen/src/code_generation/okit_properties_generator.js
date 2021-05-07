/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitCodeGenerator } from './okit_code_generator.js'

class OkitPropertiesGenerator extends OkitCodeGenerator {
    root_class = 'OkitResourceProperties'
    root_class_js = 'okit_resource_properties.js'
}

export default OkitPropertiesGenerator
export { OkitPropertiesGenerator }


/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitCodeGenerator } from './okit_code_generator.js'

class OkitTerraformGenerator extends OkitCodeGenerator {
    root_class = 'OkitResourceTerraform'
    root_class_js = 'okit_resource_terraform.js'
}

export default OkitTerraformGenerator
export { OkitTerraformGenerator }


/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "../../model/OcdDesign";
import { OciResource } from "../../model/provider/oci/OciResource";
import OcdExporter from "../OcdExporter";
import * as Model  from '../../model/provider/oci/resources'
import * as Terraform  from './provider/oci/resources'


export class OcdTerraformExporter extends OcdExporter {
    terraform: string = ''
    export = (design: OcdDesign): string => {
        this.design = design
        return this.terraform
    }
}

export default OcdTerraformExporter

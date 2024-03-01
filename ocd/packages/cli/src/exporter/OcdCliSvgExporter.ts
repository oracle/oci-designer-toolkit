/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'fs'
import path from 'path'
import { OcdCliExporter } from './OcdCliExporter'

export class OcdCliSvgExporter extends OcdCliExporter {}

export default OcdCliSvgExporter
module.exports = { OcdCliSvgExporter }

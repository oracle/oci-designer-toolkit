/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export { OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewConnector, OcdViewCoordsStyle } from './OcdDesign'
export { OcdResources, OciResources, OcdVariable } from './OcdDesign'
export { OciDefinedTag, OciFreeformTag } from './OcdDesign'
export { OcdResource } from './OcdResource'

export { PaletteGroup, PaletteResource } from './OcdPalette'

export { OciResource } from './provider/oci/OciResource'
export { OcdValidationResult } from './validator/OcdResourceValidator'
export { OcdValidator } from './OcdValidator'
export { OcdAutoLayout } from './OcdAutoLayout'
export * as OciModelResources from './provider/oci/resources'
export * as OciResourceValidation from './validator/provider/oci/resources'

export { AzureResource } from './provider/azure/AzureResource'
export * as AzureModelResources from './provider/azure/resources'

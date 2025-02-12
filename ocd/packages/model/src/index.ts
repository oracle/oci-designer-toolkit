/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export { OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewConnector, OcdViewCoordsStyle, OcdResources, OcdVariable, OcdTag } from './OcdDesign.js'
export { OcdResource } from './OcdResource.js'
export { OcdValidationResult } from './validator/OcdResourceValidator.js'
export { OcdValidator } from './OcdValidator.js'
export { OcdAutoLayout } from './OcdAutoLayout.js'

export { PaletteGroup, PaletteResource } from './OcdPalette.js'
// Oci
export { OciDefinedTag, OciDefinedTags, OciFreeformTag, OciFreeformTags, OciResources } from './OcdDesign.js'
export { OciResource } from './provider/oci/OciResource.js'
export * as OciModelResources from './provider/oci/resources.js'
export * as OciResourceValidation from './validator/provider/oci/resources.js'
// Azure
export { AzureResources } from './OcdDesign.js'
export { AzureResource } from './provider/azure/AzureResource.js'
export * as AzureModelResources from './provider/azure/resources.js'
export * as AzureResourceValidation from './validator/provider/azure/resources.js'
// Google
export { GoogleResources } from './OcdDesign.js'
export { GoogleResource } from './provider/google/GoogleResource.js'
export * as GoogleModelResources from './provider/google/resources.js'
export * as GoogleResourceValidation from './validator/provider/google/resources.js'

export { GeneralResource } from './provider/general/GeneralResource.js'
export * as GeneralModelResources from './provider/general/resources.js'

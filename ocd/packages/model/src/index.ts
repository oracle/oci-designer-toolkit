/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export { OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewConnector, OcdViewCoordsStyle, OcdResources, OcdVariable, OcdTag } from './OcdDesign'
export { OcdResource } from './OcdResource'
export { OcdValidationResult } from './validator/OcdResourceValidator'
export { OcdValidator } from './OcdValidator'
export { OcdAutoLayout } from './OcdAutoLayout'

export { PaletteGroup, PaletteResource } from './OcdPalette'
// Oci
export { OciDefinedTag, OciFreeformTag, OciResources } from './OcdDesign'
export { OciResource } from './provider/oci/OciResource'
export * as OciModelResources from './provider/oci/resources'
export * as OciResourceValidation from './validator/provider/oci/resources'
// Azure
export { AzureResources } from './OcdDesign'
export { AzureResource } from './provider/azure/AzureResource'
export * as AzureModelResources from './provider/azure/resources'
export * as AzureResourceValidation from './validator/provider/azure/resources'
// Google
export { GoogleResources } from './OcdDesign'
export { GoogleResource } from './provider/google/GoogleResource'
export * as GoogleModelResources from './provider/google/resources'
export * as GoogleResourceValidation from './validator/provider/google/resources'

export { GeneralResource } from './provider/general/GeneralResource'
export * as GeneralModelResources from './provider/general/resources'

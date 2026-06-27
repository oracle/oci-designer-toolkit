/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Hand-authored AWS model resource barrel (there is no codegen for AWS — each
** resource namespace is self-contained, see ./resources/AwsVpc.ts).
*/

export { AwsVpc } from './resources/AwsVpc.js'
export { AwsSubnet } from './resources/AwsSubnet.js'
export { AwsInternetGateway } from './resources/AwsInternetGateway.js'
export { AwsSecurityGroup } from './resources/AwsSecurityGroup.js'
export { AwsInstance } from './resources/AwsInstance.js'
export { AwsRouteTable } from './resources/AwsRouteTable.js'
export { AwsNatGateway } from './resources/AwsNatGateway.js'
export { AwsS3Bucket } from './resources/AwsS3Bucket.js'
export { AwsEbsVolume } from './resources/AwsEbsVolume.js'
export { AwsRdsInstance } from './resources/AwsRdsInstance.js'
export { AwsLoadBalancer } from './resources/AwsLoadBalancer.js'
export { AwsIamRole } from './resources/AwsIamRole.js'
export { AwsLambdaFunction } from './resources/AwsLambdaFunction.js'
export { AwsCloudfrontDistribution } from './resources/AwsCloudfrontDistribution.js'
export { AwsSnsTopic } from './resources/AwsSnsTopic.js'
export { AwsSqsQueue } from './resources/AwsSqsQueue.js'
export { AwsEcsCluster } from './resources/AwsEcsCluster.js'
export { AwsApiGateway } from './resources/AwsApiGateway.js'
export { AwsDynamodbTable } from './resources/AwsDynamodbTable.js'

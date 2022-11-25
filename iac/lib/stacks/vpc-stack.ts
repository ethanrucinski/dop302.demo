import { StackProps } from "aws-cdk-lib";
import {
  GatewayVpcEndpointAwsService,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { Dop302Stack } from "../constructs/dop302-stack";

/**
 * A stack for deploying a VPC with an S3 endpoint
 */
export class VpcStack extends Dop302Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "Vpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "private",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    const s3Endpoint = vpc.addGatewayEndpoint("S3Endpoint", {
      service: GatewayVpcEndpointAwsService.S3,
    });

    new StringParameter(this, "S3EndpointIdParameter", {
      parameterName: `/dop302/S3_ENDPOINT_ID`,
      stringValue: s3Endpoint.vpcEndpointId,
    });
  }
}

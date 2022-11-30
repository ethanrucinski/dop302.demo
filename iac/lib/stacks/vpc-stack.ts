import { StackProps } from "aws-cdk-lib";
import { GatewayVpcEndpointAwsService, IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { Dop302Stack } from "../constructs/dop302-stack";

export class VpcStack extends Dop302Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpc = new Vpc(this, 'Vpc', {
            availabilityZones: this.availabilityZones.slice(0,2),
            subnetConfiguration: [
                {
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    name: 'private'
                }
            ],
            ipAddresses: IpAddresses.cidr('10.0.0.0/16')
        });

        const s3Endpoint = vpc.addGatewayEndpoint('Endpoint', {
            service: GatewayVpcEndpointAwsService.S3
        });

        new StringParameter(this, 'S3EndpointId', {
            parameterName: `/dop302/S3_ENDPOINT_ID`,
            stringValue: s3Endpoint.vpcEndpointId
        })
    }
}
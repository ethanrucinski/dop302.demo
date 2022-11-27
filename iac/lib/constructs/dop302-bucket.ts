import { Stack } from "aws-cdk-lib";
import {
    ArnPrincipal,
    CanonicalUserPrincipal,
    Effect,
    PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { Bucket, BucketProps } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class Dop302Bucket extends Bucket {
    constructor(scope: Construct, id: string, props?: BucketProps) {
        super(scope, id, props);

        const vpcEndpointId = StringParameter.valueFromLookup(
            this,
            `/dop302/S3_ENDPOINT_ID`
        );

        const stack = Stack.of(this);

        this.addToResourcePolicy(
            new PolicyStatement({
                notPrincipals: [
                    new ArnPrincipal(
                        `arn:aws:iam::${stack.account}:user/ethan.rucinski`
                    ),
                    new ArnPrincipal(
                        `arn:aws:iam::${stack.account}:role/cdk-base-cfn-exec-role-${stack.account}-${stack.region}`
                    ),
                    new ArnPrincipal(
                        `arn:aws:sts::${stack.account}:assumed-role/cdk-base-cfn-exec-role-${stack.account}-${stack.region}/AWSCloudFormation`
                    ),
                ],
                effect: Effect.DENY,
                actions: ["*"],
                conditions: {
                    StringNotEquals: {
                        "aws:SourceVpce": vpcEndpointId,
                    },
                },
                resources: [this.bucketArn, this.arnForObjects("*")],
            })
        );
    }
}

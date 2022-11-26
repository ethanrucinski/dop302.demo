import { Aspects, IAspect, Stack, StackProps, Tags } from "aws-cdk-lib";
import { IVpc, Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnPolicy, Effect, Policy, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";

/**
 * A construct for defining a policy-compliant stack for the DOP 302 demo
 */
export class Dop302Stack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        /**
         * Add required tags to all resources
         */
        Tags.of(this).add("project", "dop302-demo");

        Aspects.of(this).add(new LambdaVpcAttacher());
    }

    // Look up the dop302 demo vpc
    public getVpc(): IVpc {
        return Vpc.fromLookup(this, "Vpc", {
            isDefault: false,
            tags: {
                project: "dop302-demo",
            },
        });
    }
}

/**
 * Aspect for adding the VPC to lambdas
 */
class LambdaVpcAttacher implements IAspect {
    public visit(node: IConstruct): void {
        // Check that this is a lambda function
        if (node instanceof CfnFunction) {
            if (!node.vpcConfig) {
                // Find VPC to attach this lambda to
                const stack = Stack.of(node) as Dop302Stack;
                const vpc = stack.getVpc();

                // Create a new security group allowing 443 out
                const securityGroup = new SecurityGroup(
                    stack,
                    "FunctionSecurityGroup",
                    {
                        allowAllOutbound: false,
                        vpc: vpc,
                    }
                );
                securityGroup.addEgressRule(
                    Peer.anyIpv4(),
                    Port.tcp(443)
                );

                const lambdaPolicy = new Policy(stack, "LambdaVpcPolicy", {
                    roles: [Role.fromRoleArn(stack, "LambdaRole", node.role)],
                });
                lambdaPolicy.addStatements(
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "ec2:CreateNetworkInterface",
                            "ec2:DescribeNetworkInterfaces",
                            "ec2:DeleteNetworkInterface",
                        ],
                        resources: ["*"],
                    })
                );

                // Add VPC configuration
                node.addPropertyOverride("VpcConfig", {
                    SubnetIds: vpc.isolatedSubnets.map(
                        (subnet) => subnet.subnetId
                    ),

                    SecurityGroupIds: [securityGroup.securityGroupId],
                });

                node.addDependsOn(lambdaPolicy.node.defaultChild as CfnPolicy)
            }
        }
    }
}

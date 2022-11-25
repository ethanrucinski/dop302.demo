import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";

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
  }
}

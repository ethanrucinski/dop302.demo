#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/stacks/vpc-stack";
import { ApplicationStack } from "../lib/stacks/application-stack";

const app = new cdk.App();

new VpcStack(app, "VpcStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-2" },
});

new ApplicationStack(app, "ApplicationStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-2" },
});

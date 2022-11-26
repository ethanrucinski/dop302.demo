import { StackProps } from "aws-cdk-lib";
import { DockerImageCode, DockerImageFunction, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Dop302Bucket } from "../constructs/dop302-bucket";
import { Dop302Stack } from "../constructs/dop302-stack";

export class ApplicationStack extends Dop302Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Dop302Bucket(this, "Bucket");

    const putObjectFunction = new DockerImageFunction(this, 'PutObjectFunction', {
      code: DockerImageCode.fromImageAsset("../put-object"),
      environment: {
        BUCKET_NAME: bucket.bucketName
      }
    })

    putObjectFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE
    })
    bucket.grantWrite(putObjectFunction)
  }
}

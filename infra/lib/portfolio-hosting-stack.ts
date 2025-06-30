import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class SpaHostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1) Private, encrypted bucket
    const portfolioBucket = new Bucket(this, "PortfolioBucket", {
      bucketName: `portfolio-website-${this.stackName.toLowerCase()}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: BucketEncryption.S3_MANAGED,
    });

    // 2) Create an Origin Access Identity (OAI)
    const oai = new OriginAccessIdentity(this, "PortfolioOAI", {
      comment: `OAI for ${this.stackName}`,
    });

    portfolioBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [portfolioBucket.arnForObjects("*")],
        principals: [
          new CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );
    portfolioBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:ListBucket"],
        resources: [portfolioBucket.bucketArn],
        principals: [
          new CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // 3) Wire that OAI into a concrete S3BucketOrigin
    const s3Origin = S3BucketOrigin.withOriginAccessIdentity(portfolioBucket, {
      originAccessIdentity: oai,
    });

    // 4) CloudFront distribution
    const distribution = new Distribution(this, "PortfolioDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(0),
        },
      ],
    });

    // 5) Deploy your built Angular files and invalidate cache
    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("../frontend/dist/portfolio-website/browser")],
      destinationBucket: portfolioBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // 6) Output the CloudFront URL
    new CfnOutput(this, "CloudFrontURL", {
      description: "Static Angular SPA hosted on CloudFront + S3",
      value: `https://${distribution.domainName}`,
    });
  }
}

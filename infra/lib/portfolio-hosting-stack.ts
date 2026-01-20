import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  CacheCookieBehavior,
  CacheHeaderBehavior,
  CachePolicy,
  CacheQueryStringBehavior,
  Function as CfFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  OriginAccessIdentity,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  AaaaRecord,
  ARecord,
  HostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { randomBytes } from "crypto";
import { SpaHostingStackProps } from "./types";

export class SpaHostingStack extends Stack {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: SpaHostingStackProps) {
    super(scope, id, props);

    if (!props.certificateArn) {
      throw new Error("CertificateARN is not in stack props");
    }

    const nonce =
      this.node.tryGetContext("cspNonce") ?? randomBytes(16).toString("base64");
    const handlerHash = this.node.tryGetContext("handlerHash") ?? "";

    // Access Logs  receives server-access logs (one line per object request: IP, user-agent, bytes, result).
    const logsBucket = new Bucket(this, "AccessLogs", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: Duration.days(14),
        },
      ],
    });

    // 1) Private, encrypted bucket
    const portfolioBucket = new Bucket(this, "PortfolioBucket", {
      bucketName: `portfolio-website-${this.stackName.toLowerCase()}-${
        props.stage || "dev"
      }-${Stack.of(this).region}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY, // Intentionally set to avoid costs and clean entirely
      autoDeleteObjects: true,
      encryption: BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: logsBucket,
      serverAccessLogsPrefix: "s3/",
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

    // Inject security headers via CloudFront
    const securityHeaders = new ResponseHeadersPolicy(this, "SecurityHeaders", {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        frameOptions: {
          frameOption: HeadersFrameOption.DENY,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy: [
            "default-src 'self'",
            `style-src-elem 'self' 'nonce-${nonce}'`,
            // "style-src-attr 'unsafe-inline'", // removed as angular uses nonce
            `script-src 'self' 'nonce-${nonce}' 'unsafe-hashes' 'sha256-${handlerHash}'`,
            "img-src 'self' data: https:",
            "upgrade-insecure-requests",
            "block-all-mixed-content",
          ].join("; "),
          override: true,
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          {
            header: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
            override: true,
          },
          {
            header: "Cross-Origin-Resource-Policy",
            value: "same-origin",
            override: true,
          },
        ],
      },
    });

    const spaCache = new CachePolicy(this, "SpaCachePolicy", {
      queryStringBehavior: CacheQueryStringBehavior.none(),
      headerBehavior: CacheHeaderBehavior.none(),
      cookieBehavior: CacheCookieBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      defaultTtl: Duration.days(1),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.days(365),
    });

    const zone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      "PortfolioCert",
      props.certificateArn
    );

    const redirectWww = new CfFunction(this, "RedirectWwwToApex", {
      comment: "301 www. → apex",
      code: FunctionCode.fromInline(`
     function handler(event) {
       var req = event.request;
       var host = req.headers.host.value;
       if (host.startsWith('www.')) {
         return {
           statusCode: 301,
           statusDescription: 'Moved Permanently',
           headers: {
             location: { value: 'https://' + host.slice(4) + req.uri }
           }
         };
       }
       return req;
     }
       `),
    });

    // 4) CloudFront distribution
    this.distribution = new Distribution(this, "PortfolioDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: securityHeaders,
        cachePolicy: spaCache,
        functionAssociations: [
          {
            eventType: FunctionEventType.VIEWER_REQUEST,
            function: redirectWww,
          },
        ],
      },
      priceClass: PriceClass.PRICE_CLASS_100,
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
      certificate,
      domainNames: [props.domainName, `www.${props.domainName}`],
      webAclId: props.webAclArn,
    });

    new ARecord(this, "ApexAlias", {
      zone,
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    });
    new AaaaRecord(this, "ApexAliasAAAA", {
      zone,
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    });

    new ARecord(this, "WwwAlias", {
      zone,
      recordName: `www.${props.domainName}`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    });
    new AaaaRecord(this, "WwwAliasAAAA", {
      zone,
      recordName: `www.${props.domainName}`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    });

    // 5) Deploy your built Angular files and invalidate cache
    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("../frontend/dist/portfolio-website/browser")],
      destinationBucket: portfolioBucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });

    // 6) Output the CloudFront URL
    new CfnOutput(this, "CloudFrontURL", {
      description: "Static Angular SPA hosted on CloudFront + S3",
      value: `https://${this.distribution.domainName}`,
    });
  }
}

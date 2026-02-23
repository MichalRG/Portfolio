import { CfnOutput, Duration, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import { AccessLogFormat } from "aws-cdk-lib/aws-apigateway";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
  HttpStage,
  LogGroupLogDestination,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import {
  Architecture,
  DockerImageCode,
  DockerImageFunction,
} from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";
import { PortfolioApiStackProps } from "./types";

export class PortfolioApiStack extends Stack {
  public readonly httpApi: HttpApi;
  public readonly apiOriginDomainName: string;

  constructor(scope: Construct, id: string, props: PortfolioApiStackProps) {
    super(scope, id, props);

    const removalPolicy = RemovalPolicy.DESTROY;
    const logRetention = RetentionDays.ONE_WEEK;
    const commentsTableName = "portfolio-comments";

    const commentsTable = new Table(this, "PortfolioCommentsTable", {
      tableName: commentsTableName,
      partitionKey: { name: "post_slug", type: AttributeType.STRING },
      sortKey: { name: "comment_id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expires_at",
      encryption: TableEncryption.AWS_MANAGED,
      removalPolicy,
    });

    const lambdaEnvironment: Record<string, string> = {
      PORTFOLIO_API_AWS_REGION: Stack.of(this).region,
      PORTFOLIO_API_COMMENTS_TABLE_NAME: commentsTable.tableName,
      PORTFOLIO_API_LOG_LEVEL: "INFO",
      PORTFOLIO_API_COMMENTS_REQUIRE_CAPTCHA:
        process.env["PORTFOLIO_API_COMMENTS_REQUIRE_CAPTCHA"] ?? "false",
    };
    const turnstileSecret = process.env["PORTFOLIO_API_TURNSTILE_SECRET_KEY"];
    if (turnstileSecret) {
      lambdaEnvironment["PORTFOLIO_API_TURNSTILE_SECRET_KEY"] = turnstileSecret;
    }
    const turnstileVerifyUrl = process.env["PORTFOLIO_API_TURNSTILE_VERIFY_URL"];
    if (turnstileVerifyUrl) {
      lambdaEnvironment["PORTFOLIO_API_TURNSTILE_VERIFY_URL"] = turnstileVerifyUrl;
    }

    const backendPath = path.resolve(__dirname, "../../app/backend");
    const apiFunction = new DockerImageFunction(this, "PortfolioApiFunction", {
      code: DockerImageCode.fromImageAsset(backendPath, {
        file: "Dockerfile.lambda",
      }),
      architecture: Architecture.X86_64,
      memorySize: 512,
      timeout: Duration.seconds(15),
      logRetention,
      environment: lambdaEnvironment,
    });
    commentsTable.grantReadWriteData(apiFunction);

    this.httpApi = new HttpApi(this, "PortfolioHttpApi", {
      apiName: `portfolio-api-${props.stage}`,
      createDefaultStage: false,
      corsPreflight: {
        allowMethods: [CorsHttpMethod.ANY],
        allowHeaders: [
          "Content-Type",
          "X-Requested-With",
          "X-Correlation-Id",
          "Authorization",
        ],
        allowOrigins: [
          `https://${props.domainName}`,
          `https://www.${props.domainName}`,
        ],
        maxAge: Duration.hours(1),
      },
    });

    const integration = new HttpLambdaIntegration(
      "PortfolioApiIntegration",
      apiFunction,
    );

    this.httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.ANY],
      integration,
    });

    this.httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.ANY],
      integration,
    });

    const accessLogs = new LogGroup(this, "PortfolioHttpApiAccessLogs", {
      retention: logRetention,
      removalPolicy,
    });

    new HttpStage(this, "PortfolioHttpApiDefaultStage", {
      httpApi: this.httpApi,
      stageName: "$default",
      autoDeploy: true,
      detailedMetricsEnabled: false,
      throttle: {
        burstLimit: 30,
        rateLimit: 15,
      },
      accessLogSettings: {
        destination: new LogGroupLogDestination(accessLogs),
        format: AccessLogFormat.custom(
          JSON.stringify({
            requestId: "$context.requestId",
            routeKey: "$context.routeKey",
            status: "$context.status",
            responseLength: "$context.responseLength",
            sourceIp: "$context.identity.sourceIp",
          }),
        ),
      },
    });

    this.apiOriginDomainName = Fn.select(
      2,
      Fn.split("/", this.httpApi.apiEndpoint),
    );

    new CfnOutput(this, "CommentsApiEndpoint", {
      value: this.httpApi.apiEndpoint,
    });
    new CfnOutput(this, "CommentsTableName", {
      value: commentsTable.tableName,
    });
  }
}

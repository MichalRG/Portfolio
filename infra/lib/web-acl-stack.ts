import { Stack } from "aws-cdk-lib";
import { CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";
import { SpaSecurityStackProps } from "./types";

export class SpaSecurityStack extends Stack {
  public readonly webAclArn: string;
  constructor(scope: Construct, id: string, props: SpaSecurityStackProps) {
    super(scope, id, props);

    const webAcl = new CfnWebACL(this, "SpaWebAcl", {
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: `${props.stage}-webacl`,
      },
      rules: [
        // 1a  Rate-limit rule
        {
          name: "RateLimit100Per5Min",
          priority: 10,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 100, // requests
              aggregateKeyType: "IP", // per-IP
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "RateLimit",
          },
        },
        // 1b  AWS Managed Core Rule Set
        {
          name: "AWS-AWSManagedRulesCommonRuleSet",
          priority: 20,
          overrideAction: { none: {} }, // keep provider’s action
          statement: {
            managedRuleGroupStatement: {
              name: "AWSManagedRulesCommonRuleSet",
              vendorName: "AWS",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: "AWSCommon",
          },
        },
      ],
    });

    this.webAclArn = webAcl.attrArn;
  }
}

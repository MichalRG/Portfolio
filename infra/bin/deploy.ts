import { App } from "aws-cdk-lib";
import { CertificateStack } from "../lib/certificate-stack";
import { SpaHostingStack } from "../lib/portfolio-hosting-stack";
import { SpaSecurityStack } from "../lib/web-acl-stack";

const app = new App();
const domainName = process.env["PORTFOLIO_DOMAIN"];
const awsAccountId = process.env["AWS_ACCOUNT_ID"];
const stage = app.node.tryGetContext("stage") ?? "dev";
const certArnCtx = app.node.tryGetContext("certArn");

if (!domainName || !awsAccountId) {
  throw new Error(
    "Environment variable PORTFOLIO_DOMAIN and AWS_ACCOUNT_ID are required"
  );
}

if (!certArnCtx) {
  // Creating certificate stack
  new CertificateStack(app, "CertificateStack", {
    domainName,
    env: { account: awsAccountId, region: "us-east-1" },
  });
} else {
  // Creating security stack with cross-stack reference to the distribution ARN
  const security = new SpaSecurityStack(app, "SpaSecurityStack", {
    env: { account: awsAccountId, region: "us-east-1" },
    stage,
    crossRegionReferences: true,
  });

  // Creating hosting stack with existing certificate
  const hosting = new SpaHostingStack(app, "SpaHostingStack", {
    stage,
    domainName,
    certificateArn: certArnCtx,
    webAclArn: security.webAclArn,
    env: { account: awsAccountId, region: "eu-central-1" },
    crossRegionReferences: true,
  });

  hosting.addDependency(security); // guarantees ordering
}

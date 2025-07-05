import { StackProps } from "aws-cdk-lib";

export interface SpaHostingStackProps extends StackProps {
  stage: string;
  domainName: string;
  certificateArn: string;
  env: { region: string; account: string };
}

export interface CertificateStackProps extends StackProps {
  domainName: string;
  env: { region: string; account: string };
}

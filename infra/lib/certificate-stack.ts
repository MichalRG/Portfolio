import { Stack } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { CertificateStackProps } from "./types";

export class CertificateStack extends Stack {
  public readonly certArn: string;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });

    const cert = new Certificate(this, "PortfolioCert", {
      domainName: props.domainName,
      subjectAlternativeNames: [`www.${props.domainName}`],
      validation: CertificateValidation.fromDns(zone),
    });

    this.certArn = cert.certificateArn;
  }
}

import { StackProps } from "aws-cdk-lib";

export interface SpaHostingStackProps extends StackProps {
  stage: string;
}

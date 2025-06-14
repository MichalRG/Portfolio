import { App } from 'aws-cdk-lib';
import { SpaHostingStack } from '../lib/portfolio-hosting-stack';

const app = new App();
new SpaHostingStack(app, 'SpaHostingStack');

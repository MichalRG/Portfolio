# Portfolio

It's [Michal Krzyzowski Portfolio@1.0.0](https://mkrzyzowski.com/)
I encourage you to visit mkrzyzowski.com to see it in action :) it's still not fully ready, but I think good enough :D so please don't be too harsh.

# Inspiration

[Vaonis Website](https://vaonis.com/)

# Local setup

1. Install deps and run local serve of frontend

```ts
cd frontend
npm i
npm run start
```

# Setup in the AWS Cloud

To setup this app from scratch for first time with brand new aws account run:

1. Bootstrap AWS environment account (once per region)
   For run of this app it's required to have bootstrapped account on us-east-1 as cert is required to deploy code

```ts
cd infra
npm i
npx cdk bootstrap aws://{{accountId}}//{{region}}
```

2. Build app

```ts
cd ../frontend
npm i
NONCE=$(openssl rand -base64 16) //generate NONCE for style file
CSP_NONCE="$NONCE" npm run build  //pass CSP_NONCE to build it runs later postbuild script that adds this nonce value
HANDLER_HASH=$(cat dist/handlerHash.txt) //for CSP to get rid console error
```

3. Check Infra file setup

```ts
cd ../infra
npx cdk synth
```

4. Deploy changes - it requires two deploys first one to create certificate stack
   if you want to deploy it to cloud you have to set ENV var PORTFOLIO-DOMAIN to the value of your domain that is required in hosted zone with NS values

```ts
npx cdk deploy
```

5. Second deploy - when cert is issued and connected to hosted zone related to your domain then you can deploy hosting app
   if you don't pass stage then it will assign value "dev"
   as certArn you have to set arn of your cert from the point 4th
   SpaSecuirtyStack is only necessary for first run then u can skip it

```ts
npx cdk deploy SpaSecurityStack SpaHostingStack -c stage=dev -c cspNonce="$NONCE" -c handlerHash="$HANDLER_HASH" -c certArn=arn:aws:acm:us-east-1:{{accountId}}:certificate/xxxx  //if you want to deploy as pointed environment
```

6. Pray

🙏🙏🙏

# Clean up

To clean up you can run to destroy hosting stack

```ts
cd infra
npx cdk destroy SpaHostingStack -c certArn=arn:aws:acm:us-east-1:{{accountId}}:certificate/xxxx
```

# History

1. To make this app work I had to register my domain so in route53 I requested for a new domain when it was processed with success I was able to deploy my cert and create A AAAA records for it.

# Hooks

Locally I use pre-push hook in .git/hooks/pre-push file

```bash
#!/bin/sh

if [ "$SKIP_SIMPLE_GIT_HOOKS" = "1" ]; then
    echo "[INFO] SKIP_SIMPLE_GIT_HOOKS is set to 1, skipping hook."
    exit 0
fi

if [ -f "$SIMPLE_GIT_HOOKS_RC" ]; then
    . "$SIMPLE_GIT_HOOKS_RC"
fi

cd frontend
npm run lint
```

I encourage to use and force lint for every run

# Useful commands:

1. Invalidation of cloudfront

```bash
aws cloudfront create-invalidation --distribution-id {{id}} --paths "/*"
```

# TODO:

- [x] change icon for navbar, use svg
- [x] add translation file to allow two languages
- [x] extened nav to allow to chang language
- [x] main section
- [x] project section
- [x] contact section
- [x] footer section
- [x] layouts section
- [x] animations section
- [x] authorization section
- [x] add github actions
- [x] add linter during pushing
- [x] add github rules to not push on master + require positive pipeline for merging
- [x] mobile styles - for current state seems to looks well
- [x] increase UX for landing page scrolling
- [x] implement faker for tests
- [ ] add docker for aws env

# Portfolio

It's Michal Krzyzowski Portfolio@0.1.0

# Inspiration

[Vaonis Website](https://vaonis.com/)

# Setup

To setup this app from scratch for first time with brand new aws account run:

1. Bootstrap AWS environment acocunt (once per region)

```ts
cd infra
cdk bootstrap
```

2. Build app

```ts
npm i
NONCE=$(openssl rand -base64 16) //generate NONCE for style file
CSP_NONCE="$NONCE" npm run build  //pass CSP_NONCE to build it runs later postbuild script that adds this nonce value
HANDLER_HASH=$(cat dist/handlerHash.txt) //for CSP to get rid console error
```

3. Check Infra file setup

```ts
cd infra
npm i
npx cdk synth
```

4. Deploy changes

```ts
npx cdk deploy
npx cdk deploy -c stage=dev -c cspNonce="$NONCE" -c handlerHash="$HANDLER_HASH"  //if you want to deploy as pointed environment
```

5. Pray

🙏🙏🙏

# Clean up

To clean up you can run

```ts
cd infra
npx cdk destroy
```

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

## Landing Page UX Improvements

The landing page now respects the user's `prefers-reduced-motion` setting and
reveals content slightly earlier while keeping animations quick. The scroll
indicator stays visible until the page is scrolled more than 100&nbsp;px and
fades out smoothly.

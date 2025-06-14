# Portfolio

It's Michal Krzyzowski Portfolio@0.1.0

# Inspiration

[Vaonis Website](https://vaonis.com/)

# Hooks

Localy I use pre-push hook in .git/hooks/pre-push file

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

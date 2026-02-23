🧼 ESLint Configuration Notes
This project uses ESLint with Angular, TypeScript, and Prettier support.

✅ Root-Level Config (.eslintrc.json)
"root": true
Declares this file as the top-most ESLint config.
Prevents ESLint from searching parent folders for other config files.

🚫 ignorePatterns
Not used by default in this project, because it only contains a single app.

If needed in the future (e.g., for generated files), you can add:
"ignorePatterns": ["dist/", "coverage/"]

🧩 Plugins and Extensions Used
@angular-eslint – for Angular best practices

@typescript-eslint – for TypeScript-specific rules

eslint-plugin-prettier + eslint-config-prettier – integrates Prettier into ESLint

📦 Installed Dev Dependencies
bash
Copy
Edit
npm install --save-dev \
 eslint \
 @angular-eslint/eslint-plugin \
 @angular-eslint/eslint-plugin-template \
 @angular-eslint/template-parser \
 @typescript-eslint/parser \
 @typescript-eslint/eslint-plugin \
 eslint-plugin-prettier \
 eslint-config-prettier

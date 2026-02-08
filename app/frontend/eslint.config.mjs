// eslint.config.js
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import templateParser from "@angular-eslint/template-parser";
import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: [".angular/**", "dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      "@angular-eslint": angular,
      prettier,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...angular.configs.recommended.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },
];

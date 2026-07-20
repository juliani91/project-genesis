#!/usr/bin/env node
const args = process.argv.slice(2);
console.log(args.length ? args.join(' ') : '{{PROJECT_NAME}} CLI ready');


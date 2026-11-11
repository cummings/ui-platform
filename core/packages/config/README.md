# @core/config

Shared configuration every platform app extends.

```jsonc
// tsconfig.json
{ "extends": "@core/config/tsconfig/nextjs.json" }
```

```js
// eslint.config.js
import platform from "@core/config/eslint";
export default [...platform];
```

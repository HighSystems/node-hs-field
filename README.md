@highsystems/field
========

[![npm license](https://img.shields.io/npm/l/@highsystems/field.svg)](https://www.npmjs.com/package/@highsystems/field) [![npm version](https://img.shields.io/npm/v/@highsystems/field.svg)](https://www.npmjs.com/package/@highsystems/field) [![npm downloads](https://img.shields.io/npm/dm/@highsystems/field.svg)](https://www.npmjs.com/package/@highsystems/field)

A lightweight, promise based abstraction layer for High Systems Fields

Written in TypeScript, targets Nodejs and the Browser

Install
-------
```
# Install
$ npm install --save @highsystems/field
```

Documentation
-------------

[TypeDoc Documentation](https://highsystems.github.io/field/)

Server-Side Example
-------------------
```typescript
import { HSField } from '@highsystems/field';
import { HighSystems } from '@highsystems/client';

const highsystems = new HighSystems({
    instance: 'www',
    userToken: 'xxx'
});

const hsField = new HSField({
	highsystems: highsystems,
    applicationId: 'xxxxxxxxx',
	tableId: 'xxxxxxxxx',
	fieldId: 'xxxxxxxxx'
});

(async () => {
    try {
        const results = await hsField.load();

        console.log(hsField.get('name'), results.name);
    }catch(err){
        console.error(err);
    }
})();
```

Client-Side Example
-------------------
Import `HSField` by loading `@highsystems/field.browserify.min.js`

```javascript
var highsystems = new HighSystems({
    instance: 'www'
});

var hsField = new HSField({
	highsystems: highsystems,
    applicationId: 'xxxxxxxxx',
	tableId: 'xxxxxxxxx',
	fieldId: 'xxxxxxxxx'
});

hsField.load().then(function(results){
    console.log(hsField.get('name'), results.name);
}).catch(function(err){
    console.error(err);
});
```

License
-------
Copyright 2023 High Systems, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

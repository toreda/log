# ArmorJS - Log

![CI](https://github.com/armorjs/log/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=armorjs_log&metric=coverage)](https://sonarcloud.io/dashboard?id=armorjs_log) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=armorjs_log&metric=alert_status)](https://sonarcloud.io/dashboard?id=armorjs_log)

@armorjs/log provides a lightweight and flexible logging typescript + javascript package that runs in node, web, and serverless environments. Use built-in logging, or write your own log handlers. Control when and how log messages are generated and send them anywhere.


## Contents
- [About ArmorJS](#about-armorjs)
- [Installation](#Installation)
- [Usage](#usage)
- [Build](#build)
- [Testing](#testing)
- [License](#license)

## About ArmorJS
ArmorJS solves unique challenges in the enterprise node ecosystem. Auditing projects for security, reliability, and even license compatibility are monumental tasks when a project includes thousands of frequently changing dependencies.

ArmorJS standards:
* Full typescript support.
* Consistent API between releases.
* Extremely small footprint (for webpacking).
* No more than 5 external dependencies (excluding dev dependencies).
* Compatible with web, node, and serverless deployment.
* Thorough test coverage.
* MIT License.

## Install

***With yarn (preferred):***
```yarn add @armorjs/config```

With NPM:
```npm install @armorjs/config```

## Usage

### Library Usage

#### Typescript
```
import { ArmorConfig } from '@armorjs/config';
```

#### Node 
```
const ArmorConfig = require('@armorjs/config');
```

## Build
Build (or rebuild) the config package:

***With Yarn (preferred):***
```
yarn install
yarn build
```

With NPM:
```
npm install
npm run-script build
```

## Testing

Config implements unit tests using jest. Run the following commands from the directory where config has been installed.

***With yarn (preferred):***
```
yarn install
yarn test
```

With NPM:
```
npm install
npm run-script test
```

## License
[MIT](LICENSE) &copy; Michael Brich
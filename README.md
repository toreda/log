# ArmorJS - Log

![CI](https://github.com/toreda/log/workflows/CI/badge.svg?branch=master) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=coverage)](https://sonarcloud.io/dashboard?id=toreda_log) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=toreda_log&metric=alert_status)](https://sonarcloud.io/dashboard?id=toreda_log)

@toreda/log provides a lightweight and flexible logging typescript + javascript package that runs in node, web, and serverless environments. Use built-in logging, or write your own log handlers. Control when and how log messages are generated and send them anywhere.

## Contents

-   [About ArmorJS](#about-armorjs)
-   [Installation](#Installation)
-   [Usage](#usage)
-   [Build](#build)
-   [Testing](#testing)
-   [License](#license)

## About ArmorJS

ArmorJS solves unique challenges in the enterprise node ecosystem. Auditing projects for security, reliability, and even license compatibility are monumental tasks when a project includes thousands of frequently changing dependencies.

ArmorJS standards:

-   Full typescript support.
-   Consistent API between releases.
-   Extremely small footprint (for webpacking).
-   No more than 5 external dependencies (excluding dev dependencies).
-   Compatible with web, node, and serverless deployment.
-   Thorough test coverage.
-   MIT License.

## Install

**_With yarn (preferred):_**
`yarn add @toreda/log`

With NPM:
`npm install @toreda/log`

## Usage

### Library Usage

#### Typescript

```
import { ArmorLog } from '@toreda/log';
```

#### Node

```
const ArmorLog = require('@toreda/log');
```

## Build

Build (or rebuild) the log package:

**_With Yarn (preferred):_**

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

Log implements unit tests using jest. Run the following commands from the directory where log has been installed.

**_With yarn (preferred):_**

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

module.exports = {
	roots: ['./'],
	coverageDirectory: './coverage',
	coveragePathIgnorePatterns: [
		'.node/',
		'coverage/',
		'jest/',
		'node_modules/',
		'tests/',
		'webpack.config.js'
	],
	moduleFileExtensions: ['ts', 'js', 'json'],
	moduleNameMapper: {'^src/(.*)': '<rootDir>/src$1'},
	verbose: true,
	testEnvironment: 'node',
	testPathIgnorePatterns: ['/node_modules/'],
	testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.ts$',
	testResultsProcessor: 'jest-sonar-reporter',
	transform: {'^.+\\.tsx?$': 'ts-jest'}
};

module.exports = {
	"roots": [
		"./"
	],
	"coverageDirectory": "./coverage",
	"coveragePathIgnorePatterns": [
		"tests/",
		"node_modules/",
		".node/",
		"jest/",
		"coverage/",
		"webpack.config.js"
	],
	"testPathIgnorePatterns": [
		"/node_modules/"
	],
	"testEnvironment": "node",
	"transform": {
		"^.+\\.tsx?$": "ts-jest"
	},
	"testRegex": "(/__tests__/.*|(\\.|/)(spec))\\.ts$",
	"moduleFileExtensions": [
		"ts",
		"js",
		"json"
	],
	"testResultsProcessor": "jest-sonar-reporter"
}

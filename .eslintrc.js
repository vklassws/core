/** @type {import('eslint').Linter.Config} */
module.exports = {
	'root': true,
	'env': {
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended'
	],
	'overrides': [
		{
			'files': '**/*.ts',
			'env': {
				'es2021': true,
				'node': true
			},
			'extends': [
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended'
			],
			'parser': '@typescript-eslint/parser',
			'parserOptions': {
				'ecmaVersion': 12,
				'sourceType': 'module'
			},
			'plugins': [
				'@typescript-eslint'
			],
			'rules': {
				'indent': [
					'error',
					'tab'
				],
				'linebreak-style': [
					'error',
					'unix'
				],
				'quotes': [
					'error',
					'single'
				],
				'semi': [
					'error',
					'never'
				],
				'@typescript-eslint/no-explicit-any': [
					'off'
				],
				'@typescript-eslint/ban-types': [
					'off'
				],
				'@typescript-eslint/explicit-module-boundary-types': [
					'warn',
					{
						'allowArgumentsExplicitlyTypedAsAny': true
					}
				],
				'@typescript-eslint/no-unused-vars': [
					'warn',
					{
						'argsIgnorePattern': '^_',
						'varsIgnorePattern': '^_',
						'ignoreRestSiblings': true
					}
				]
			}
		}
	],
	ignorePatterns: [
		'build'
	]
}

export default import('@kdt310722/eslint-config').then((m) => m.defineFlatConfig({}, { ignores: ['README.md', '**/protos', '**/src/clients/**/generated'] }, {
    rules: {
        'sonarjs/no-selector-parameter': 'off',
        'ts/prefer-promise-reject-errors': 'off',
    },
}))

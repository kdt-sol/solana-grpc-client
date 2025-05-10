export default import('@kdt310722/eslint-config').then((m) => m.defineFlatConfig({}, { ignores: ['**/protos', '**/src/clients/jetstream/generated', '**/src/clients/yellowstone/generated'] }, {
    rules: {
        'sonarjs/no-selector-parameter': 'off',
        'ts/prefer-promise-reject-errors': 'off',
    },
}))

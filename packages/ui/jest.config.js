/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'ui-package-tests',
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Se você tiver aliases no tsconfig.json do pacote ui, adicione-os aqui
    // Exemplo: '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json', // Garanta que este tsconfig seja o correto para o pacote ui
    }],
  },
  // Por padrão, o Jest procura arquivos .spec.js, .test.js, .spec.ts, .test.ts
  // Se seus arquivos de teste estiverem apenas em src/, você pode especificar:
  roots: ['<rootDir>/src'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

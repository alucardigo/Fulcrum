// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Aqui você pode adicionar mocks globais ou configurações específicas para os testes do pacote UI,
// se necessário. Por exemplo, mock de `matchMedia` se algum componente o utilizar.
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(), // deprecated
//     removeListener: jest.fn(), // deprecated
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });

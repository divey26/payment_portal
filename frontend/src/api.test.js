describe('api module interceptor', () => {
  let capturedReject;

  jest.mock('axios', () => {
    const mockInstance = {
      interceptors: {
        response: {
          use: (_ok, bad) => {
            capturedReject = bad;
          },
        },
      },
      get: jest.fn(),
      post: jest.fn(),
    };
    const create = jest.fn(() => mockInstance);
    // default export is callable object with create
    return {
      __esModule: true,
      default: Object.assign(mockInstance, { create }),
    };
  });

  it('normalizes error messages from response and generic error', async () => {
    const mod = await import('./api.js');
    expect(mod.api).toBeTruthy();

    await expect(capturedReject({ message: 'boom' })).rejects.toThrow('boom');
    await expect(
      capturedReject({ response: { data: { error: 'Invalid token' } } })
    ).rejects.toThrow('Invalid token');
  });
});

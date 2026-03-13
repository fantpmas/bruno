const { expect } = require('@jest/globals');
const { uuid } = require('../utils/testUtils');
const { environmentSchema } = require('./index');

describe('Environment Schema Validation', () => {
  const validEnvironment = () => ({
    uid: uuid(),
    name: 'Development',
    variables: [
      {
        uid: uuid(),
        name: 'baseUrl',
        value: 'https://api.example.com',
        type: 'text',
        enabled: true,
        secret: false
      }
    ]
  });

  it('should validate a basic environment without seq', async () => {
    const env = validEnvironment();
    const result = await environmentSchema.validate(env);
    expect(result).toBeTruthy();
  });

  it('should validate an environment with seq', async () => {
    const env = { ...validEnvironment(), seq: 1 };
    const result = await environmentSchema.validate(env);
    expect(result).toBeTruthy();
    expect(result.seq).toBe(1);
  });

  it('should validate an environment with seq and color', async () => {
    const env = { ...validEnvironment(), seq: 3, color: '#FF5733' };
    const result = await environmentSchema.validate(env);
    expect(result).toBeTruthy();
    expect(result.seq).toBe(3);
  });

  it('should reject a non-integer seq', async () => {
    const env = { ...validEnvironment(), seq: 1.5 };
    await expect(environmentSchema.validate(env)).rejects.toThrow();
  });

  it('should reject a non-positive seq', async () => {
    const env = { ...validEnvironment(), seq: 0 };
    await expect(environmentSchema.validate(env)).rejects.toThrow();
  });

  it('should reject a negative seq', async () => {
    const env = { ...validEnvironment(), seq: -1 };
    await expect(environmentSchema.validate(env)).rejects.toThrow();
  });
});

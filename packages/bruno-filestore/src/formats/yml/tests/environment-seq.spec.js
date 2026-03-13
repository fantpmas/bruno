const { parseEnvironment, stringifyEnvironment } = require('../../../index');

describe('Environment seq field - yml format', () => {
  it('should parse environment yml with seq field', () => {
    const yml = `name: Development\nseq: 2\nvariables:\n  - name: baseUrl\n    value: https://api.example.com\n`;
    const env = parseEnvironment(yml, { format: 'yml' });
    expect(env.name).toBe('Development');
    expect(env.seq).toBe(2);
    expect(env.variables).toHaveLength(1);
  });

  it('should parse environment yml without seq field', () => {
    const yml = `name: Production\nvariables:\n  - name: baseUrl\n    value: https://api.example.com\n`;
    const env = parseEnvironment(yml, { format: 'yml' });
    expect(env.name).toBe('Production');
    expect(env.seq).toBeUndefined();
  });

  it('should stringify environment with seq field', () => {
    const env = {
      uid: 'test123',
      name: 'Development',
      variables: [
        { uid: 'v1', name: 'baseUrl', value: 'https://api.example.com', type: 'text', enabled: true, secret: false }
      ],
      color: null,
      seq: 3
    };
    const yml = stringifyEnvironment(env, { format: 'yml' });
    expect(yml).toContain('seq: 3');
    expect(yml).toContain('name: Development');
  });

  it('should stringify environment without seq field', () => {
    const env = {
      uid: 'test123',
      name: 'Production',
      variables: [
        { uid: 'v1', name: 'baseUrl', value: 'https://api.example.com', type: 'text', enabled: true, secret: false }
      ],
      color: null
    };
    const yml = stringifyEnvironment(env, { format: 'yml' });
    expect(yml).not.toContain('seq');
  });

  it('should roundtrip environment with seq', () => {
    const env = {
      uid: 'test123',
      name: 'Staging',
      variables: [
        { uid: 'v1', name: 'baseUrl', value: 'https://staging.example.com', type: 'text', enabled: true, secret: false }
      ],
      color: '#FF5733',
      seq: 5
    };
    const yml = stringifyEnvironment(env, { format: 'yml' });
    const parsed = parseEnvironment(yml, { format: 'yml' });
    expect(parsed.seq).toBe(5);
    expect(parsed.name).toBe('Staging');
    expect(parsed.color).toBe('#FF5733');
    expect(parsed.variables).toHaveLength(1);
  });
});

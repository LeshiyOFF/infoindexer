/**
 * Authority Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { Authority } from './authority';
import { InvalidSanctionProgramError } from '../errors';

describe('Authority', () => {
  it('should create valid authority', () => {
    const authority = Authority.create('European Commission', 'EC');
    expect(authority.name).toBe('European Commission');
    expect(authority.shortName).toBe('EC');
  });

  it('should trim and uppercase short name', () => {
    const authority = Authority.create(' US Department of Treasury ', 'ofac');
    expect(authority.shortName).toBe('OFAC');
  });

  it('should be equal for same short name', () => {
    const auth1 = Authority.create('European Commission', 'EC');
    const auth2 = Authority.create('European Commission', 'ec');
    expect(auth1.equals(auth2)).toBe(true);
  });

  it('should throw for empty name', () => {
    expect(() => Authority.create('', 'EC')).toThrowError(InvalidSanctionProgramError);
    expect(() => Authority.create('   ', 'EC')).toThrowError(InvalidSanctionProgramError);
  });

  it('should throw for empty short name', () => {
    expect(() => Authority.create('European Commission', '')).toThrowError(
      InvalidSanctionProgramError
    );
  });

  it('should throw for short name > 5 characters', () => {
    expect(() => Authority.create('Name', 'TOOLONG')).toThrowError(
      InvalidSanctionProgramError
    );
  });

  it('should format to string', () => {
    const auth = Authority.create('European Commission', 'EC');
    expect(auth.toString()).toBe('EC — European Commission');
  });
});

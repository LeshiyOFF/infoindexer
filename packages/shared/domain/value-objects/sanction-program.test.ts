/**
 * SanctionProgram Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { SanctionProgram } from './sanction-program';
import { Authority } from './authority';
import { CountryCode } from './country-code';
import { InvalidSanctionProgramError } from '../errors';

describe('SanctionProgram', () => {
  it('should create valid program', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    const program = SanctionProgram.create(
      'EU Sanctions related to actions undermining Ukraine',
      'EU-RUSSIA-2022',
      authority,
      country
    );

    expect(program.name).toBe('EU Sanctions related to actions undermining Ukraine');
    expect(program.id).toBe('EU-RUSSIA-2022');
  });

  it('should trim name and id', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    const program = SanctionProgram.create(
      '  Name  ',
      '  ID-123  ',
      authority,
      country
    );

    expect(program.name).toBe('Name');
    expect(program.id).toBe('ID-123');
  });

  it('should be equal for same id', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    const prog1 = SanctionProgram.create('Name 1', 'ID-123', authority, country);
    const prog2 = SanctionProgram.create('Name 2', 'ID-123', authority, country);

    expect(prog1.equals(prog2)).toBe(true);
  });

  it('should throw for empty name', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    expect(() => SanctionProgram.create('', 'ID', authority, country)).toThrowError(
      InvalidSanctionProgramError
    );
  });

  it('should throw for empty id', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    expect(() => SanctionProgram.create('Name', '', authority, country)).toThrowError(
      InvalidSanctionProgramError
    );
  });

  it('should format to string', () => {
    const authority = Authority.create('European Commission', 'EC');
    const country = CountryCode.create('EU');

    const program = SanctionProgram.create('Test Program', 'TP-001', authority, country);
    expect(program.toString()).toBe('Test Program (TP-001)');
  });
});

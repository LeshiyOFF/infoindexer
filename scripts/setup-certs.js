#!/usr/bin/env node
/**
 * TLS Certificate Generator CLI
 *
 * @remarks
 * Standalone script for generating TLS certificates.
 * Part of Iteration 9.1: TLS Certificate Automation.
 *
 * Usage:
 *   node scripts/setup-certs.js
 *   npm run setup:certs
 *
 * This script is also called by postinstall hook.
 */

import { CertificateGenerator } from '../packages/shared/infrastructure/certificate-generator.service.js';

async function main() {
  try {
    const generated = await CertificateGenerator.generate({
      outputDir: './docker/certs',
      validityDays: 365,
      silent: false
    });

    if (generated) {
      console.log('');
      console.log('🔐 TLS certificates ready!');
      console.log('');
      console.log('To enable TLS in ClickHouse:');
      console.log('  1. Set CLICKHOUSE_SECURE=true');
      console.log('  2. Restart: docker-compose up -d');
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error.message);
    process.exit(1);
  }
}

main();

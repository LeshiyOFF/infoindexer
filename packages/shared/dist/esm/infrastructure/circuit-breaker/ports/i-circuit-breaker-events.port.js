"use strict";
/**
 * Circuit Breaker Events Port
 *
 * @remarks
 * Port for Circuit Breaker events (Observer Pattern).
 * Allows subscribing to Circuit Breaker state changes.
 *
 * Follows ISP: Minimal interface, focused on events only.
 * Follows DIP: Domain depends on this port, Infrastructure implements it.
 */
Object.defineProperty(exports, "__esModule", { value: true });

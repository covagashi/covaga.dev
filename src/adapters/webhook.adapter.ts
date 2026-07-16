/**
 * Delivers a dispatched event to a tenant's configured destination: a Microsoft
 * Teams incoming webhook (rendered as a MessageCard) or a raw webhook forward
 * (the event metadata, passed through untouched).
 */
import type { Destination } from "../models/automation.js";

/** Thrown when a destination webhook rejects the delivery or is unreachable. */
export class AdapterError extends Error {
  /**
   * @param message - Client-safe failure reason (recorded on the execution).
   */
  constructor(message: string) {
    super(message);
    this.name = "AdapterError";
  }
}

/** The event payload handed to a destination adapter. */
export interface DispatchEvent {
  /** Event id being delivered. */
  eventId: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Freeform event metadata supplied by the caller. */
  metadata: Record<string, unknown>;
}

const TEAMS_THEME_COLOR = "0076D7";
const MAX_MESSAGE_FIELDS = 5;

/** Build a short human-readable line from the event id and a few metadata fields. */
function buildMessage(event: DispatchEvent): string {
  const entries = Object.entries(event.metadata).slice(0, MAX_MESSAGE_FIELDS);
  const details = entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");

  return details.length > 0
    ? `Covaga event "${event.eventId}" -- ${details}`
    : `Covaga event "${event.eventId}"`;
}

/**
 * Build the JSON body for a destination: a Teams MessageCard, or the raw event
 * metadata for a webhook passthrough. Exported so the payload shape can be
 * asserted in tests without a network round-trip.
 *
 * @param destination - Destination whose `kind` selects the payload shape.
 * @param event - Event being delivered.
 * @returns The value to JSON-serialise as the request body.
 */
export function buildPayload(
  destination: Destination,
  event: DispatchEvent,
): unknown {
  switch (destination.kind) {
    case "teams":
      return {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: TEAMS_THEME_COLOR,
        title: `Covaga: ${event.eventId}`,
        text: buildMessage(event),
      };
    case "webhook":
      return event.metadata;
    default: {
      // Exhaustiveness guard -- the CHECK constraint on destinations.kind
      // should make this unreachable in practice.
      const neverKind: never = destination.kind;
      throw new AdapterError(`unsupported destination kind: ${String(neverKind)}`);
    }
  }
}

/**
 * Deliver an event to a single destination's incoming webhook.
 *
 * @param destination - Destination to POST to.
 * @param event - Event being delivered.
 * @throws {AdapterError} When the network call fails or the endpoint responds
 * with a non-2xx status.
 */
export async function deliver(
  destination: Destination,
  event: DispatchEvent,
): Promise<void> {
  const payload = buildPayload(destination, event);

  let response: Response;
  try {
    response = await fetch(destination.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "network error";
    throw new AdapterError(`delivery failed: ${reason}`);
  }

  if (!response.ok) {
    throw new AdapterError(
      `delivery failed: destination responded ${response.status}`,
    );
  }
}

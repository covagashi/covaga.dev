/**
 * Dispatch service: the heart of the automations dispatcher. Given an
 * authenticated tenant's event, it resolves the enabled routes, delivers to
 * each destination, and records an execution row per attempt (or a single
 * `skipped` row when no route matched). Delivery failures are recorded, not
 * thrown -- only an unknown event id surfaces as a thrown {@link HttpError}.
 */
import type { Env } from "../env.js";
import type { ExecutionResult, ExecutionStatus } from "../models/automation.js";
import { HttpError } from "../errors.js";
import { isKnownEventId } from "../models/automation.js";
import {
  findEnabledRoutes,
  insertExecution,
} from "../repositories/automation.repository.js";
import { AdapterError, deliver } from "../adapters/webhook.adapter.js";

/** Input describing a single event to dispatch for a tenant. */
export interface DispatchInput {
  /** Owning tenant id (already authenticated by the caller). */
  tenantId: string;
  /** Event id being dispatched. */
  eventId: string;
  /** Freeform event metadata supplied by the caller. */
  metadata: Record<string, unknown>;
}

/** The result of a dispatch: one execution per delivery attempt (or a skip). */
export interface DispatchOutcome {
  /** The executions recorded for this dispatch. */
  executions: ExecutionResult[];
}

/**
 * Validate the event, resolve the tenant's enabled routes for it, deliver to
 * every destination, and record the outcome of each attempt.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param input - Tenant id, event id, and event metadata.
 * @returns The executions recorded for this dispatch.
 * @throws {HttpError} 400 when the event id is not known.
 */
export async function dispatchEvent(
  env: Env,
  input: DispatchInput,
): Promise<DispatchOutcome> {
  if (!isKnownEventId(input.eventId)) {
    throw new HttpError(400, "unknown_event");
  }

  const routes = await findEnabledRoutes(env, input.tenantId, input.eventId);
  const createdAt = Date.now();

  if (routes.length === 0) {
    const id = crypto.randomUUID();
    await insertExecution(env, {
      id,
      tenantId: input.tenantId,
      eventId: input.eventId,
      destinationId: "",
      status: "skipped",
      detail: "no enabled route for this event",
      createdAt,
    });
    return { executions: [{ id, destinationId: "", status: "skipped" }] };
  }

  const executions: ExecutionResult[] = [];

  for (const route of routes) {
    const id = crypto.randomUUID();
    let status: ExecutionStatus;
    let detail: string;

    try {
      await deliver(route.destination, {
        eventId: input.eventId,
        tenantId: input.tenantId,
        metadata: input.metadata,
      });
      status = "delivered";
      detail = "";
    } catch (err) {
      status = "failed";
      detail = err instanceof AdapterError ? err.message : "delivery failed";
    }

    await insertExecution(env, {
      id,
      tenantId: input.tenantId,
      eventId: input.eventId,
      destinationId: route.destination.id,
      status,
      detail,
      createdAt,
    });

    executions.push({ id, destinationId: route.destination.id, status });
  }

  return { executions };
}

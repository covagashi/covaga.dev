/**
 * Thin MCP adapter over the Gym service. `GymMcp` is a Cloudflare Durable
 * Object (via the Agents SDK `McpAgent`) that exposes four tools. Every tool
 * is a thin wrapper that reads the tenant id from `this.props` — injected by
 * the router after `authenticateTenant` — and delegates to `gym.service`, so
 * all work stays tenant-scoped and the business logic has a single home.
 */
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env } from "../env.js";
import {
  getArticleContext,
  getMetrics,
  listTasks,
  startEpisode,
  submitProposal,
} from "../services/gym.service.js";

/** Props injected per request by the router: the authenticated tenant. */
interface GymProps extends Record<string, unknown> {
  /** Authenticated tenant id every tool call is scoped to. */
  tenantId: string;
}

/** A fetch handler as returned by the Agents SDK `serve`/`serveSSE` helpers. */
export interface MountHandler {
  fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response>;
}

/** Serialise a value as a single MCP text-content result. */
function textResult(value: unknown): {
  content: { type: "text"; text: string }[];
} {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
  };
}

/**
 * Gym MCP agent. Registers `gym_next_task`, `gym_get_article`, `gym_submit`
 * and `gym_metrics`, each tenant-scoped through `this.props.tenantId`.
 */
export class GymMcp extends McpAgent<Env, unknown, GymProps> {
  /** The MCP server instance whose tools this agent registers in `init`. */
  public readonly server = new McpServer({
    name: "byndr-gym",
    version: "0.1.0",
  });

  /** Resolve the tenant id from injected props, or fail loudly. */
  private tenantId(): string {
    const tenantId = this.props?.tenantId;
    if (typeof tenantId !== "string" || tenantId.length === 0) {
      throw new Error("missing tenant context");
    }
    return tenantId;
  }

  /**
   * Register the four Gym tools. Called once per agent start by the SDK.
   */
  public async init(): Promise<void> {
    this.server.registerTool(
      "gym_next_task",
      {
        description:
          "Start an episode (if none given) and list open text tasks " +
          "(translations and descriptions) for the tenant's articles.",
        inputSchema: {
          types: z.array(z.enum(["translate", "describe"])).optional(),
          limit: z.number().int().positive().max(200).optional(),
          start_episode: z.boolean().optional(),
        },
      },
      async (args) => {
        const tenantId = this.tenantId();
        const episodeId = args.start_episode
          ? await startEpisode(this.env, tenantId)
          : undefined;
        const tasks = await listTasks(this.env, tenantId, {
          types: args.types,
          limit: args.limit,
        });
        return textResult({ episode_id: episodeId, tasks });
      },
    );

    this.server.registerTool(
      "gym_get_article",
      {
        description:
          "Read-only context for one article: manufacturer, product group, " +
          "current description, per-language map and missing languages.",
        inputSchema: {
          part_number: z.string().min(1),
          variant: z.string().optional(),
        },
      },
      async (args) => {
        const context = await getArticleContext(
          this.env,
          this.tenantId(),
          args.part_number,
          args.variant ?? "",
        );
        return textResult(context ?? { error: "not_found" });
      },
    );

    this.server.registerTool(
      "gym_submit",
      {
        description:
          "Submit a proposed value for a task. The server validates it " +
          "deterministically and stores it only if it passes.",
        inputSchema: {
          task_id: z.string().min(1),
          value: z.string(),
          lang: z.string().optional(),
          confidence: z.number().min(0).max(1).optional(),
          episode_id: z.string().optional(),
        },
      },
      async (args) => {
        const result = await submitProposal(this.env, this.tenantId(), {
          task_id: args.task_id,
          value: args.value,
          lang: args.lang,
          confidence: args.confidence,
          episode_id: args.episode_id,
        });
        return textResult(result);
      },
    );

    this.server.registerTool(
      "gym_metrics",
      {
        description:
          "Report Gym progress: submitted/validated/rejected counts, " +
          "success rate and remaining tasks by type.",
        inputSchema: {
          episode_id: z.string().optional(),
        },
      },
      async (args) => {
        const metrics = await getMetrics(
          this.env,
          this.tenantId(),
          args.episode_id,
        );
        return textResult(metrics);
      },
    );
  }
}

/**
 * Streamable-HTTP MCP handler mounted at `/mcp`. Kept in this module so the
 * heavy Agents SDK graph is only loaded when the router dynamically imports it.
 */
export const gymStreamableHandler: MountHandler = GymMcp.serve("/mcp", {
  binding: "GYM_MCP",
}) as MountHandler;

/** Legacy SSE MCP handler mounted at `/sse` (with `/sse/message`). */
export const gymSseHandler: MountHandler = GymMcp.serveSSE("/sse", {
  binding: "GYM_MCP",
}) as MountHandler;

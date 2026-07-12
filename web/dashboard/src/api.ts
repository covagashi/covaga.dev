// cliente http fino contra el worker byndr-dev. respuestas tipadas, lanza en no-2xx.
import type { Session } from './session'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface WhoAmI {
  id: string
}

export type ProposalStatus = 'validated' | 'approved' | 'applied' | 'rejected'

export interface Proposal {
  id: string
  part_number: string
  variant: string
  task_type: string
  field: string
  lang: string
  old_value: string
  new_value: string
  confidence: number
  status: ProposalStatus
}

export interface ApproveResult {
  ok: boolean
  job_id: string
  count: number
}

export interface RejectResult {
  ok: boolean
  count: number
}

export interface WriteJob {
  id: string
  status: string
  source: string
  changes: number
  created_at: string
}

async function request<T>(base: string, key: string, path: string, init?: RequestInit): Promise<T> {
  const url = base.replace(/\/+$/, '') + path
  const res = await fetch(url, {
    ...init,
    headers: {
      'X-Api-Key': key,
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let message = res.statusText || `http ${res.status}`
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      if (body.error !== undefined) message = body.error
      else if (body.message !== undefined) message = body.message
    } catch {
      // cuerpo no-json: nos quedamos con statusText
    }
    throw new ApiError(res.status, message)
  }
  return (await res.json()) as T
}

// valida la clave contra el worker. usado por el config gate antes de tener sesión.
export function whoami(base: string, key: string): Promise<WhoAmI> {
  return request<WhoAmI>(base, key, '/whoami')
}

export function getProposals(s: Session, status: ProposalStatus): Promise<{ proposals: Proposal[] }> {
  return request<{ proposals: Proposal[] }>(s.base, s.key, `/api/gym/proposals?status=${status}`)
}

export function approveProposals(s: Session, ids: string[]): Promise<ApproveResult> {
  return request<ApproveResult>(s.base, s.key, '/api/gym/proposals/approve', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export function rejectProposals(s: Session, ids: string[]): Promise<RejectResult> {
  return request<RejectResult>(s.base, s.key, '/api/gym/proposals/reject', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export function getJobs(s: Session): Promise<{ jobs: WriteJob[] }> {
  return request<{ jobs: WriteJob[] }>(s.base, s.key, '/api/write/jobs')
}

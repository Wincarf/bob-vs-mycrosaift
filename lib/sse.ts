export function sseMessage(type: string, payload: unknown): string {
  return `data: ${JSON.stringify({ type, payload })}\n\n`
}

export function sseComment(comment: string): string {
  return `: ${comment}\n\n`
}

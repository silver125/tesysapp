export type ConnectionFeedback = { lead_id: string; company_id: string; received_reply: boolean; useful: boolean | null; updated_at: string };
/** Personal signals only; never use other doctors' private ratings. */
export function feedbackCompanyScores(feedback: ConnectionFeedback[]): Map<string, number> {
  const latest = new Map<string, ConnectionFeedback>();
  for (const item of feedback) {
    const previous = latest.get(item.company_id);
    if (!previous || item.updated_at > previous.updated_at) latest.set(item.company_id, item);
  }
  return new Map([...latest].map(([id,item]) => [id, item.useful === true ? 1 : item.useful === false ? -1 : 0]));
}
export function rankWithFeedback<T extends { companyId?: string }>(items: T[], feedback: ConnectionFeedback[]): T[] {
  const scores = feedbackCompanyScores(feedback);
  return [...items].sort((a,b) => (scores.get(b.companyId || '') || 0) - (scores.get(a.companyId || '') || 0));
}

export type ResponseMistralRepostT = {
  should_ban: boolean;
  reason: string;
  confidence: number;
  suggested_action: 'full_ban' | 'age_restrict' | 'demonetize' | 'warning' | 'no_action';
};

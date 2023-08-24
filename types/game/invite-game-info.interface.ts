export interface InviteGameInfo {
  inviter_id: string;
  inviter_nickname?: string;
  invitee_id: string;
  invitee_nickname?: string;
  mode: string;
  state?: boolean;
}

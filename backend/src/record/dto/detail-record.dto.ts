export class DetailRecordDto {
  left_user: string;
  right_user: string;
  result: string; // 승, 패, 몰수승, 몰수패
  left_score: number;
  right_score: number;
  type: string; // 일반, 랭크
  mode: string; // 이지, 하드
}

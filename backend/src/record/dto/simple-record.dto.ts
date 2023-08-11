import {RecentRecord} from '@/types/record';

export class SimpleRecordDto {
  win: number;
  lose: number;
  rank_score: number;
  forfeit: number;
  recent_record: RecentRecord;
}

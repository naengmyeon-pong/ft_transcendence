import {Injectable} from '@nestjs/common';

@Injectable()
export class Block {
  private block = new Map<string, Set<string>>();

  getBlockUsers(block_id: string): Set<string> {
    const ret: Set<string> = this.block.get(block_id);
    return ret;
  }

  addBlockUser(user_id: string, block_id: string): void {
    const user = this.block.get(block_id);
    if (user) {
      user.add(user_id);
    } else {
      this.block.set(block_id, new Set());
      this.block.get(block_id).add(user_id);
    }
  }

  removeBlockUser(user_id: string, block_id: string): void {
    const user = this.block.get(block_id);
    if (user) {
      user.delete(user_id);
    }
  }
}

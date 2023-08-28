import { Injectable } from '@nestjs/common';
import { FriendListRepository } from '@/chat/chat.repository';

// 나를 친구추가한 사람들
@Injectable()
export class Friend {
  private friend = new Map<string, Set<string>>();
  constructor(private friendListRepository: FriendListRepository) { }

  async setFriend() {
    const friend_list = await this.friendListRepository.find();
    friend_list.forEach(e => {
      this.addFriendUser(e.userId, e.friendId);
    });
  }

  getFriendUsers(user_id: string): Set<string> {
    const ret: Set<string> = this.friend.get(user_id);
    return ret;
  }

  addFriendUser(user_id: string, friend_id: string): void {
    const user = this.friend.get(friend_id);
    if (user) {
      user.add(user_id);
    } else {
      this.friend.set(friend_id, new Set());
      this.friend.get(friend_id).add(user_id);
    }
  }

  removeFriendUser(user_id: string, friend_id: string): void {
    const user = this.friend.get(friend_id);
    if (user) {
      user.delete(user_id);
    }
  }

  removeUser(user_id: string): void {
    if (this.friend.get(user_id)) {
      this.friend.delete(user_id);
    }
  }
}

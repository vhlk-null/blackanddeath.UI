import { Injectable, Signal, WritableSignal } from '@angular/core';
import { Comment } from '../../../features/services/comment.service';

@Injectable()
export class CommentNodeContext {
  auth!: {
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
    userId: () => string | null;
    profile: () => { preferred_username?: string; name?: string } | null;
    login: () => void;
  };
  replyingToId!: WritableSignal<string | null>;
  replyingToReply!: WritableSignal<{ id: string; username: string } | null>;
  replyBody!: WritableSignal<string>;
  replySubmitting!: Signal<boolean>;
  editingCommentId!: WritableSignal<string | null>;
  editCommentBody!: WritableSignal<string>;
  editCommentSubmitting!: Signal<boolean>;

  submitReply!: (rootCommentId: string) => void;
  reactToComment!: (commentId: string, isLike: boolean) => void;
  startEditComment!: (comment: Comment) => void;
  cancelEditComment!: () => void;
  saveEditComment!: (commentId: string, parentId: string | null) => void;
  deleteComment!: (commentId: string, parentId: string | null) => void;
  autoGrow!: (el: HTMLTextAreaElement) => void;
}

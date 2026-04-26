import { Component, inject, input, forwardRef, HostBinding, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comment } from '../../../features/services/comment.service';
import { CommentNodeContext } from './comment-node.context';
import { RichEditor } from '../rich-editor/rich-editor';

@Component({
  selector: 'app-comment-node',
  imports: [DatePipe, forwardRef(() => CommentNode), RichEditor],
  templateUrl: './comment-node.html',
  styleUrl: './comment-node.scss',
})
export class CommentNode {
  readonly comment = input.required<Comment>();
  readonly depth = input<number>(0);
  readonly rootCommentId = input.required<string>();

  readonly ctx = inject(CommentNodeContext);
  readonly repliesCollapsed = signal(false);

  @HostBinding('attr.data-reply')
  get isReply() { return this.depth() > 0 ? '' : null; }

  toggleRepliesCollapsed(): void {
    this.repliesCollapsed.update(v => !v);
  }

  toggleReply(): void {
    const id = this.comment().id;
    const username = this.comment().username;
    if (this.ctx.replyingToReply()?.id === id) {
      this.ctx.replyingToId.set(null);
      this.ctx.replyingToReply.set(null);
    } else {
      this.ctx.replyingToId.set(this.rootCommentId());
      this.ctx.replyingToReply.set({ id, username });
    }
    this.ctx.replyBody.set('');
  }
}

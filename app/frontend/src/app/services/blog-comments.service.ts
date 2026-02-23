import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BlogComment } from '../interfaces/blog-comment.interface';

interface BlogCommentResponseDto {
  id: string;
  post_slug: string;
  user_name: string;
  content: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ListCommentsResponseDto {
  items: BlogCommentResponseDto[];
}

export interface CreateBlogCommentInput {
  userName: string;
  content: string;
  email?: string | null;
  honeypot?: string;
  captchaToken?: string | null;
}

@Injectable({ providedIn: 'root' })
export class BlogCommentsService {
  private readonly httpClient = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  listComments(postSlug: string): Observable<readonly BlogComment[]> {
    const encodedSlug = encodeURIComponent(postSlug);
    const baseUrl = this.resolveApiBaseUrl();
    const requestUrl = `${baseUrl}/api/v1/comments/${encodedSlug}`;

    return this.httpClient
      .get<ListCommentsResponseDto>(requestUrl)
      .pipe(
        map((response) =>
          (response.items ?? []).map((comment) => this.mapComment(comment)),
        ),
      );
  }

  createComment(
    postSlug: string,
    input: CreateBlogCommentInput,
  ): Observable<BlogComment> {
    const encodedSlug = encodeURIComponent(postSlug);
    const baseUrl = this.resolveApiBaseUrl();
    const requestUrl = `${baseUrl}/api/v1/comments/${encodedSlug}`;

    return this.httpClient
      .post<BlogCommentResponseDto>(requestUrl, {
        user_name: input.userName,
        content: input.content,
        email: input.email ?? null,
        honeypot: input.honeypot ?? '',
        captcha_token: input.captchaToken ?? null,
      })
      .pipe(map((response) => this.mapComment(response)));
  }

  private resolveApiBaseUrl(): string {
    const location = this.document.defaultView?.location;
    if (!location) {
      return '';
    }

    const hostName = location.hostname.toLowerCase();
    const isLocalHost =
      hostName === 'localhost' ||
      hostName === '127.0.0.1' ||
      hostName === '0.0.0.0';
    if (!isLocalHost) {
      return '';
    }

    if (location.port === '4200') {
      return `${location.protocol}//127.0.0.1:8080`;
    }

    return '';
  }

  private mapComment(comment: BlogCommentResponseDto): BlogComment {
    return {
      id: comment.id,
      postSlug: comment.post_slug,
      userName: comment.user_name,
      content: comment.content,
      email: comment.email,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      deletedAt: comment.deleted_at,
    };
  }
}

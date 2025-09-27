import api from '@/lib/api';

export interface Discussion {
  id: number;
  title: string;
  content: string;
  lessonId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface Comment {
  id: number;
  content: string;
  discussionId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface DiscussionRequest {
  title: string;
  content: string;
  lessonId: number;
}

export interface CommentRequest {
  content: string;
  parentId?: number;
}

export interface PaginatedDiscussions {
  content: Discussion[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const DiscussionService = {
  /**
   * Lấy danh sách thảo luận cho một bài học
   * @param lessonId ID của bài học
   * @param page Số trang, bắt đầu từ 0
   * @param size Số lượng mục trên mỗi trang
   */
  getDiscussionsByLesson: async (
    lessonId: number,
    page = 0,
    size = 10
  ): Promise<PaginatedDiscussions> => {
    const response = await api.get<PaginatedDiscussions>(
      `/discussions/lesson/${lessonId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Tạo một thảo luận mới
   * @param request Thông tin thảo luận
   */
  createDiscussion: async (request: DiscussionRequest): Promise<Discussion> => {
    const response = await api.post<Discussion>('/discussions', request);
    return response.data;
  },

  /**
   * Lấy chi tiết thảo luận theo ID
   * @param discussionId ID của thảo luận
   */
  getDiscussionById: async (discussionId: number): Promise<Discussion> => {
    const response = await api.get<Discussion>(`/discussions/${discussionId}`);
    return response.data;
  },

  /**
   * Cập nhật thảo luận
   * @param discussionId ID của thảo luận
   * @param request Thông tin cập nhật
   */
  updateDiscussion: async (discussionId: number, request: DiscussionRequest): Promise<Discussion> => {
    const response = await api.put<Discussion>(`/discussions/${discussionId}`, request);
    return response.data;
  },

  /**
   * Xóa thảo luận
   * @param discussionId ID của thảo luận
   */
  deleteDiscussion: async (discussionId: number): Promise<void> => {
    await api.delete(`/discussions/${discussionId}`);
  },

  /**
   * Lấy danh sách bình luận cho một thảo luận
   * @param discussionId ID của thảo luận
   */
  getCommentsByDiscussion: async (discussionId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/discussions/${discussionId}/comments`);
    return response.data;
  },

  /**
   * Thêm bình luận vào thảo luận
   * @param discussionId ID của thảo luận
   * @param request Thông tin bình luận
   */
  addComment: async (discussionId: number, request: CommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>(`/discussions/${discussionId}/comments`, request);
    return response.data;
  },

  /**
   * Lấy chi tiết bình luận theo ID
   * @param commentId ID của bình luận
   */
  getCommentById: async (commentId: number): Promise<Comment> => {
    const response = await api.get<Comment>(`/discussions/comments/${commentId}`);
    return response.data;
  },

  /**
   * Cập nhật bình luận
   * @param commentId ID của bình luận
   * @param request Thông tin cập nhật
   */
  updateComment: async (commentId: number, request: CommentRequest): Promise<Comment> => {
    const response = await api.put<Comment>(`/discussions/comments/${commentId}`, request);
    return response.data;
  },

  /**
   * Xóa bình luận
   * @param commentId ID của bình luận
   */
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/discussions/comments/${commentId}`);
  },

  /**
   * Lấy danh sách phản hồi cho một bình luận
   * @param commentId ID của bình luận
   */
  getRepliesByComment: async (commentId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/discussions/comments/${commentId}/replies`);
    return response.data;
  }
};

export default DiscussionService; 
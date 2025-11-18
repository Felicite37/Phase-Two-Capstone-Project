import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseCommentsProps {
  postId: string;
}

export const useComments = ({ postId }: UseCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API call
      // const response = await fetch(`/api/posts/${postId}/comments`);
      // const data = await response.json();
      
      // Mock response for now
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'This is a sample comment',
          author: { id: '1', name: 'Test User' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      setComments(mockComments);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = async (content: string) => {
    if (!user) {
      throw new Error('You must be logged in to comment');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API call
      // const response = await fetch(`/api/posts/${postId}/comments`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ content })
      // });
      
      // const newComment = await response.json();
      
      // Mock response for now
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        author: { id: user.id, name: user.name },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual API call
      // await fetch(`/api/comments/${commentId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment,
  };
};

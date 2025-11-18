import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useComments } from '../hooks/UseComments';

// Mock the useComments hook
jest.mock('../hooks/UseComments');

// Test component that uses useAuth
const TestAuthComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'Not logged in'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

// Test component that uses useComments
const TestCommentsComponent = () => {
  const { comments, addComment } = useComments({ postId: '1' });
  const [newComment, setNewComment] = React.useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment);
      setNewComment('');
    }
  };
  
  return (
    <div>
      <ul data-testid="comments-list">
        {comments.map(comment => (
          <li key={comment.id} data-testid={`comment-${comment.id}`}>
            {comment.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          data-testid="comment-input"
        />
        <button type="submit" data-testid="submit-comment">
          Add Comment
        </button>
      </form>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('Not logged in');
  });
  
  it('should allow user to login', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });
});

describe('useComments', () => {
  const mockAddComment = jest.fn();
  const mockComments = [
    { id: '1', content: 'First comment', author: { id: '1', name: 'User' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  
  beforeEach(() => {
    (useComments as jest.Mock).mockReturnValue({
      comments: mockComments,
      loading: false,
      error: null,
      addComment: mockAddComment,
    });
  });
  
  it('should render comments', () => {
    render(<TestCommentsComponent />);
    
    expect(screen.getByTestId('comments-list').children).toHaveLength(1);
    expect(screen.getByText('First comment')).toBeInTheDocument();
  });
  
  it('should allow adding a new comment', () => {
    render(<TestCommentsComponent />);
    
    const input = screen.getByTestId('comment-input');
    fireEvent.change(input, { target: { value: 'New comment' } });
    fireEvent.click(screen.getByTestId('submit-comment'));
    
    expect(mockAddComment).toHaveBeenCalledWith('New comment');
  });
});
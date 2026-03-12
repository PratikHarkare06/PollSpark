import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ThemeProvider, useTheme } from './ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PollCard } from './components/PollCard';
import { Profile } from './components/Profile';
import { pollsService, Poll } from './services/polls';
import { Plus, BarChart3, Sparkles, Moon, Sun, X, Check, LogOut, Loader, User, Bell, Image as ImageIcon, BellRing } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.on_background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
    min-height: 100vh;
  }

  button {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding-bottom: 100px;
  transition: background 0.3s ease;
  overflow-y: auto;
`;

const SafeArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding-top: env(safe-area-inset-top);
`;

const ScrollColumn = styled.div`
  overflow-y: auto;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.md}px;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.divider};
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BrandName = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: ${({ theme }) => theme.primary_text};
  line-height: 1;
`;

const BrandTagline = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.secondary_text};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: none;
  background: ${({ theme }) => theme.surface_variant};
  color: ${({ theme }) => theme.primary_text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary_container};
  }
`;

const ThemeToggle = styled(IconButton)`
  background: ${({ theme }) => theme.primary_container};
  color: ${({ theme }) => theme.on_primary_container};
`;

const UserAvatar = styled.div<{ $isAuthenticated: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  background: ${({ $isAuthenticated, theme }) => $isAuthenticated ? 'linear-gradient(135deg, #0044CC, #0066FF)' : theme.surface_variant};
  color: ${({ $isAuthenticated }) => $isAuthenticated ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  position: relative;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.radii.md}px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.sm}px;
  min-width: 150px;
  border: 1px solid ${({ theme }) => theme.divider};
  z-index: 1000;
`;

const UserMenuItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.primary_text};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary_container};
  }
`;

const BannerContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, #0044CC);
  box-shadow: 0 8px 20px rgba(0, 102, 255, 0.27);
`;

const BannerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const BannerContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const BannerTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.on_primary};
`;

const BannerSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.on_primary};
  opacity: 0.9;
  line-height: 1.5;
`;

const CreatePollButton = styled.button`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: none;
  background: #FFE500;
  color: #000000;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  width: fit-content;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(255, 229, 0, 0.4);
  }
`;

const BannerIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  background: rgba(255, 255, 255, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.on_primary};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.primary_text};
`;

const PollsList = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const EmptyTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary_text};
`;

const EmptySubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondary_text};
  text-align: center;
`;

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.on_primary};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.05);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.radii.xl}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary_text};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: none;
  background: ${({ theme }) => theme.surface_variant};
  color: ${({ theme }) => theme.primary_text};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.primary_container};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  border: 1px solid ${({ theme }) => theme.divider};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary_text};
  font-size: 14px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.secondary_text};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  border: 1px solid ${({ theme }) => theme.divider};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary_text};
  font-size: 14px;
  resize: none;
  min-height: 80px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.secondary_text};
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary_text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const OptionInput = styled(Input)`
  margin-bottom: 0;
  flex: 1;
`;

const RemoveOptionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: none;
  background: ${({ theme }) => theme.error_container};
  color: ${({ theme }) => theme.error};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.error};
    color: ${({ theme }) => theme.on_error};
  }
`;

const AddOptionButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  border: 1px dashed ${({ theme }) => theme.outline};
  background: transparent;
  color: ${({ theme }) => theme.secondary_text};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary_container};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md}px;
  border: none;
  background: linear-gradient(135deg, #0044CC, #0066FF);
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CategorySelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  border: 1px solid ${({ theme }) => theme.divider};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary_text};
  font-size: 14px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.md}px 0;
  color: ${({ theme }) => theme.secondary_text};
  font-size: 12px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.divider};
  }

  span {
    padding: 0 12px;
  }
`;

const GoogleButton = styled(SubmitButton)`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.divider};
  color: ${({ theme }) => theme.primary_text};

  &:hover {
    background: ${({ theme }) => theme.surface_variant};
    box-shadow: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.on_primary : theme.primary_text};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.primary : theme.primary_container};
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
  overflow-x: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const categories = ['Career', 'Tech', 'Lifestyle', 'Sports', 'Music', 'Movies', 'Food', 'Travel', 'Other'];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
          <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18, marginRight: 8 }} />
          Continue with Google
        </GoogleButton>

        <Divider><span>or</span></Divider>

        {isSignUp && (
          <Input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p style={{ color: '#FF4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <SubmitButton onClick={handleEmailAuth} disabled={loading}>
          {loading ? <Loader size={20} className="spin" /> : isSignUp ? 'Sign Up' : 'Sign In'}
        </SubmitButton>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{ border: 'none', background: 'none', color: '#0044CC', fontWeight: 600 }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </ModalContent>
    </ModalOverlay>
  );
};

const CreatePollModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poll: { category: string; question: string; options: { label: string; votes: number; imageUrl?: string }[]; expiresAt?: any; visibility?: 'public' | 'private' }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [durationHours, setDurationHours] = useState('24');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [options, setOptions] = useState<{ label: string; imageUrl: string }[]>([{ label: '', imageUrl: '' }, { label: '', imageUrl: '' }]);

  if (!isOpen) return null;

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { label: '', imageUrl: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOptionLabel = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].label = value;
    setOptions(newOptions);
  };

  const updateOptionImage = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].imageUrl = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const validOptions = options.filter(o => o.label.trim() !== '');
    if (question.trim() && validOptions.length >= 2) {
      let expiresAt = null;
      if (durationHours !== '0') {
        expiresAt = new Date(Date.now() + parseInt(durationHours) * 60 * 60 * 1000);
      }

      onSubmit({
        category,
        question: question.trim(),
        options: validOptions.map(opt => ({ label: opt.label.trim(), votes: 0, ...(opt.imageUrl && { imageUrl: opt.imageUrl.trim() }) })),
        expiresAt,
        visibility
      });
      setQuestion('');
      setCategory('Lifestyle');
      setDurationHours('24');
      setVisibility('public');
      setOptions([{ label: '', imageUrl: '' }, { label: '', imageUrl: '' }]);
      onClose();
    }
  };

  const isValid = question.trim() && options.filter(o => o.label.trim() !== '').length >= 2;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New Poll</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <Label>Question</Label>
        <TextArea
          placeholder="What would you like to ask?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          maxLength={200}
        />

        <Label>Category</Label>
        <CategorySelect value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </CategorySelect>

        <Label>Duration</Label>
        <CategorySelect value={durationHours} onChange={e => setDurationHours(e.target.value)}>
          <option value="1">1 Hour</option>
          <option value="6">6 Hours</option>
          <option value="24">24 Hours</option>
          <option value="168">7 Days</option>
          <option value="0">Never Expires</option>
        </CategorySelect>

        <Label>Visibility</Label>
        <CategorySelect value={visibility} onChange={e => setVisibility(e.target.value as 'public' | 'private')}>
          <option value="public">Public (Visible on Feed)</option>
          <option value="private">Unlisted (Direct Link Only)</option>
        </CategorySelect>

        <Label>Options (at least 2)</Label>
        {options.map((option, index) => (
          <div key={index} style={{ marginBottom: 12 }}>
            <OptionRow>
              <OptionInput
                placeholder={`Option ${index + 1}`}
                value={option.label}
                onChange={e => updateOptionLabel(index, e.target.value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <RemoveOptionButton onClick={() => removeOption(index)}>
                  <X size={16} />
                </RemoveOptionButton>
              )}
            </OptionRow>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4, gap: 8, paddingLeft: 8 }}>
              <ImageIcon size={14} color="#888" />
              <Input
                placeholder="Image URL (optional)"
                value={option.imageUrl}
                onChange={e => updateOptionImage(index, e.target.value)}
                style={{ height: 32, fontSize: 13, marginBottom: 0 }}
              />
            </div>
          </div>
        ))}

        {options.length < 6 && (
          <AddOptionButton onClick={addOption}>
            <Plus size={18} />
            Add Option
          </AddOptionButton>
        )}

        <SubmitButton onClick={handleSubmit} disabled={!isValid}>
          <Check size={20} />
          Create Poll
        </SubmitButton>
      </ModalContent>
    </ModalOverlay>
  );
};

const AppContent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const prevPollsVotesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!user || !notificationsEnabled) return;

    const unsubscribe = pollsService.subscribeToUserPolls(user.uid, (myPolls) => {
      myPolls.forEach(poll => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        const prevVotes = prevPollsVotesRef.current[poll.id];

        if (prevVotes !== undefined && totalVotes > prevVotes) {
          new Notification('New Vote Received!', {
            body: `Someone just voted on your poll: "${poll.question}"`,
            icon: '/favicon.ico'
          });
        }
        prevPollsVotesRef.current[poll.id] = totalVotes;
      });
    });

    return () => unsubscribe();
  }, [user, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      new Notification('Notifications Already Active', { body: 'You will receive alerts right here!' });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification('PollSpark Alerts Enabled!', {
          body: 'You will now receive desktop push notifications for poll updates.',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Derive filtered polls
  const renderPolls = activeCategory === 'All' ? polls : polls.filter(p => p.category === activeCategory);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sharedPollId = searchParams.get('pollId');

  useEffect(() => {
    setLoading(true);

    const unsubscribe = pollsService.subscribeToPolls(async (updatedPolls) => {
      let finalPolls = [...updatedPolls];

      if (sharedPollId) {
        const sharedPollIndex = finalPolls.findIndex(p => p.id === sharedPollId);
        if (sharedPollIndex > -1) {
          const [sharedPoll] = finalPolls.splice(sharedPollIndex, 1);
          finalPolls.unshift(sharedPoll);
        } else {
          try {
            const sharedPollDoc = await pollsService.getPollById(sharedPollId);
            if (sharedPollDoc) {
              finalPolls.unshift(sharedPollDoc);
            }
          } catch (error) {
            console.error('Error fetching shared poll:', error);
          }
        }
      }

      setPolls(finalPolls);
      setLoading(false);
    }, sharedPollId);

    return () => unsubscribe();
  }, [sharedPollId]);

  useEffect(() => {
    const loadUserVotesAndLikes = async () => {
      if (user && polls.length > 0) {
        try {
          const votes = await pollsService.getUserVotesBulk(user.uid);
          const likes = await pollsService.getUserLikesBulk(user.uid);
          setUserVotes(prev => ({ ...prev, ...votes }));
          setUserLikes(prev => ({ ...prev, ...likes }));
        } catch (err) {
          console.error('Error fetching user interactions', err);
        }
      }
    };

    loadUserVotesAndLikes();
  }, [user, polls.length]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (userVotes[pollId] !== undefined) return;

    // Optimistic Update: instantly update UI for both User history and Poll Array
    const previousVotes = { ...userVotes };
    const previousPolls = [...polls];

    setUserVotes({ ...userVotes, [pollId]: optionIndex });
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        const newOptions = [...(p.options || [])];
        if (newOptions[optionIndex]) {
          newOptions[optionIndex] = { ...newOptions[optionIndex], votes: (newOptions[optionIndex].votes || 0) + 1 };
        }
        return { ...p, options: newOptions };
      }
      return p;
    }));

    try {
      const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      const userInitials = getInitials(userName);
      console.log('Voting:', pollId, optionIndex);
      await pollsService.vote(pollId, optionIndex, user.uid, userName, userInitials);
      console.log('Vote saved successfully');
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on failure
      setUserVotes(previousVotes);
      setPolls(previousPolls);
    }
  };

  const handleLike = async (pollId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (userLikes[pollId]) return;

    // Optimistic Update: instantly update UI for both User history and Poll array
    const previousLikes = { ...userLikes };
    const previousPolls = [...polls];

    setUserLikes({ ...userLikes, [pollId]: true });
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        return { ...p, likes: (p.likes || 0) + 1 };
      }
      return p;
    }));

    try {
      const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      const userInitials = getInitials(userName);
      await pollsService.likePoll(pollId, user.uid, userName, userInitials);
    } catch (error) {
      console.error('Error liking:', error);
      // Revert on failure
      setUserLikes(previousLikes);
      setPolls(previousPolls);
    }
  };

  const handleCreatePoll = async (newPoll: any) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      console.log('Creating poll:', { userId: user.uid, ...newPoll });
      await pollsService.createPoll({
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userInitials: getInitials(user.displayName || user.email?.split('@')[0] || 'U'),
        ...newPoll,
      });
      console.log('Poll created successfully');
    } catch (error: any) {
      console.error('Error creating poll:', error);
      alert('Error creating poll: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setUserVotes({});
      setUserLikes({});
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const userInitials = user?.displayName
    ? getInitials(user.displayName)
    : user?.email?.slice(0, 2).toUpperCase() || '?';

  const mainPoll = renderPolls.length > 0 ? renderPolls[0] : null;
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';

  if (isEmbed) {
    return (
      <>
        <GlobalStyle />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: 'transparent' }}>
          {renderPolls.map(poll => (
            <PollCard
              key={poll.id}
              id={poll.id}
              initials={poll.userInitials || '?'}
              author={poll.userName || 'Anonymous'}
              time={poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Recent'}
              category={poll.category || 'General'}
              question={poll.question || ''}
              options={poll.options || []}
              onVote={handleVote}
              selectedOption={userVotes[poll.id]}
              isLiked={userLikes[poll.id]}
              onLike={handleLike}
              totalLikes={poll.likes || 0}
              creatorId={poll.userId}
              expiresAt={poll.expiresAt}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{mainPoll ? `${mainPoll.question} - PollSpark` : 'PollSpark: Voice Your Choice'}</title>
        <meta property="og:title" content={mainPoll ? `${mainPoll.question} - PollSpark` : 'PollSpark: Voice Your Choice'} />
        <meta property="og:description" content="Start a conversation with your community through live polls." />
        <meta property="og:type" content="website" />
      </Helmet>
      <GlobalStyle />
      <AppContainer>
        <SafeArea>
          <ScrollColumn>
            <Header>
              <HeaderRow>
                <BrandColumn>
                  <BrandName onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>PollSpark</BrandName>
                  <BrandTagline>Voice your choice</BrandTagline>
                </BrandColumn>
                <HeaderActions>
                  <ThemeToggle onClick={requestNotificationPermission} title={notificationsEnabled ? "Notifications On" : "Enable Notifications"}>
                    {notificationsEnabled ? <BellRing size={20} color="#00C851" /> : <Bell size={20} />}
                  </ThemeToggle>
                  <ThemeToggle onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </ThemeToggle>
                  <div style={{ position: 'relative' }}>
                    <UserAvatar
                      $isAuthenticated={!!user}
                      onClick={() => user ? setShowUserMenu(!showUserMenu) : setIsLoginModalOpen(true)}
                    >
                      {user ? userInitials : '?'}
                    </UserAvatar>
                    {showUserMenu && user && (
                      <UserMenu>
                        <UserMenuItem onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>
                          <User size={16} /> Profile
                        </UserMenuItem>
                        <UserMenuItem onClick={() => { setShowUserMenu(false); handleLogout(); }}>
                          <LogOut size={16} />
                          Sign Out
                        </UserMenuItem>
                      </UserMenu>
                    )}
                  </div>
                </HeaderActions>
              </HeaderRow>
            </Header>

            <Routes>
              <Route path="/" element={
                <>
                  <BannerContainer>
                    <BannerRow>
                      <BannerContent>
                        <BannerTitle>Create & Vote</BannerTitle>
                        <BannerSubtitle>
                          Start a conversation with your community through live polls.
                        </BannerSubtitle>
                        <CreatePollButton onClick={() => user ? setIsCreatePollModalOpen(true) : setIsLoginModalOpen(true)}>
                          <Plus size={18} />
                          Create Poll
                        </CreatePollButton>
                      </BannerContent>
                      <BannerIcon>
                        <BarChart3 size={48} />
                      </BannerIcon>
                    </BannerRow>
                  </BannerContainer>

                  <SectionHeader>
                    <SectionTitle>Trending Polls</SectionTitle>
                  </SectionHeader>

                  <TabContainer>
                    <TabButton $active={activeCategory === 'All'} onClick={() => setActiveCategory('All')}>All</TabButton>
                    {categories.map(cat => (
                      <TabButton key={cat} $active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
                        {cat}
                      </TabButton>
                    ))}
                  </TabContainer>

                  <PollsList>
                    {loading ? (
                      <EmptyState>
                        <Loader size={40} className="spin" />
                        <EmptyTitle>Loading polls...</EmptyTitle>
                      </EmptyState>
                    ) : renderPolls.length > 0 ? (
                      renderPolls.map(poll => (
                        <PollCard
                          key={poll.id}
                          id={poll.id}
                          initials={poll.userInitials || '?'}
                          author={poll.userName || 'Anonymous'}
                          time={poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Recent'}
                          category={poll.category || 'General'}
                          question={poll.question || ''}
                          options={poll.options || []}
                          onVote={handleVote}
                          selectedOption={userVotes[poll.id]}
                          isLiked={userLikes[poll.id]}
                          onLike={handleLike}
                          totalLikes={poll.likes || 0}
                          creatorId={poll.userId}
                          expiresAt={poll.expiresAt}
                        />
                      ))
                    ) : (
                      <EmptyState>
                        <EmptyIcon>
                          <Sparkles size={60} color="#0044CC" />
                        </EmptyIcon>
                        <EmptyTitle>No matching polls</EmptyTitle>
                        <EmptySubtitle>{activeCategory !== 'All' ? 'Try another category' : 'Create your first poll to get started'}</EmptySubtitle>
                      </EmptyState>
                    )}
                  </PollsList>
                </>
              } />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </ScrollColumn>
        </SafeArea>

        <FAB onClick={() => user ? setIsCreatePollModalOpen(true) : setIsLoginModalOpen(true)}>
          <Plus size={20} />
          New Poll
        </FAB>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <CreatePollModal
          isOpen={isCreatePollModalOpen}
          onClose={() => setIsCreatePollModalOpen(false)}
          onSubmit={handleCreatePoll}
        />
      </AppContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

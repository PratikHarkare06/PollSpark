import React from 'react';
import styled from 'styled-components';
import { Heart, MessageCircle, Share2, Trophy, Check, Send, Lock, Clock, Download, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { pollsService, Comment, Vote, Like } from '../services/polls';

interface PollOptionData {
  label: string;
  votes: number;
  imageUrl?: string;
}

interface PollCardProps {
  id: string;
  initials: string;
  author: string;
  time: string;
  category: string;
  question: string;
  options: PollOptionData[];
  onVote: (pollId: string, optionIndex: number) => void;
  selectedOption?: number;
  isLiked?: boolean;
  onLike?: (pollId: string) => void;
  totalLikes?: number;
  creatorId?: string;
  expiresAt?: any;
}

const COLORS = ['#0066FF', '#00C851', '#ffbb33', '#ff4444', '#aa66cc', '#33b5e5'];

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.radii.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.divider};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.on_primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: ${({ theme }) => theme.primary_text};
`;

const TimeText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.secondary_text};
`;

const CategoryChip = styled.div`
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background: rgba(0, 102, 255, 0.13);
  color: #0044CC;
  font-size: 12px;
  font-weight: 500;
`;

const Question = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary_text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const OptionBar = styled.div<{ $isSelected: boolean }>`
  position: relative;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.sm}px;
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.primary_container : theme.surface_variant};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ theme, $isSelected }) =>
    $isSelected ? `inset 0 0 0 2px ${theme.primary}` : 'none'};

  &:hover {
    background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.primary_container : theme.primary_container};
  }
`;

const ProgressBar = styled.div<{ $percent: number; $isWinner: boolean; $isSelected: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $isWinner, $isSelected, theme }) =>
    $isWinner
      ? theme.tertiary
      : $isSelected
        ? theme.primary
        : theme.primary_container};
  transition: width 0.5s ease;
`;

const OptionContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const OptionLabel = styled.span<{ $isWinner: boolean; $isSelected: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $isWinner, $isSelected, theme }) =>
    $isWinner
      ? theme.on_tertiary
      : $isSelected
        ? theme.on_primary
        : theme.primary_text};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PercentText = styled.span<{ $isWinner: boolean; $isSelected: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $isWinner, $isSelected, theme }) =>
    $isWinner
      ? theme.on_tertiary
      : $isSelected
        ? theme.on_primary
        : theme.primary_text};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const VoteCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.secondary_text};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ActionButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $isActive }) => $isActive ? '#FF4D6D' : theme.secondary_text};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary_container};
  }
`;

const Drawer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  border-top: 1px solid ${({ theme }) => theme.divider};
`;

const DrawerTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-bottom: 1px solid ${({ theme }) => theme.divider};
  padding-bottom: 8px;
`;

const DrawerTab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme, $active }) => $active ? theme.primary : theme.secondary_text};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -9px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({ theme, $active }) => $active ? theme.primary : 'transparent'};
    border-radius: 2px;
  }
`;

const CommentInputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.full}px;
  border: 1px solid ${({ theme }) => theme.divider};
  background: ${({ theme }) => theme.surface_variant};
  color: ${({ theme }) => theme.primary_text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SendButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.on_primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.full}px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
  }
`;

const ListContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const UserItemAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary_container};
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
`;

const CommentBubble = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.surface_variant};
  padding: 8px 12px;
  border-radius: 12px;
  border-top-left-radius: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.primary_text};
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary_text};
  display: block;
  margin-bottom: 2px;
`;

const DrawerContentPlaceholder = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.secondary_text};
  text-align: center;
  padding: 12px;
`;

const AnalyticsContainer = styled.div`
  height: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ExportButtonContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 10px;
  z-index: 10;
`;

const ExportButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.primary_container};
  color: ${({ theme }) => theme.on_primary_container};
  border: 1px solid ${({ theme }) => theme.on_primary_container}30;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.on_primary_container}15;
  }
`;

const ExpiredBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
`;

interface PollOptionProps {
  label: string;
  percent: number;
  isWinner: boolean;
  isSelected: boolean;
  onVote: () => void;
  imageUrl?: string;
}

const PollOptionImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
  border: 1px solid ${({ theme }) => theme.divider};
  background-color: ${({ theme }) => theme.surface};
`;

const PollOption: React.FC<PollOptionProps> = ({ label, percent, isWinner, isSelected, onVote, imageUrl }) => {
  return (
    <OptionBar $isSelected={isSelected} onClick={onVote}>
      <ProgressBar $percent={percent} $isWinner={isWinner} $isSelected={isSelected} />
      <OptionContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {imageUrl && <PollOptionImage src={imageUrl} alt={label} />}
          <OptionLabel $isWinner={isWinner} $isSelected={isSelected}>
            {label}
            {isWinner && <Trophy size={14} style={{ marginLeft: 6 }} />}
          </OptionLabel>
        </div>
        <PercentText $isWinner={isWinner} $isSelected={isSelected}>
          {percent}%
        </PercentText>
      </OptionContent>
    </OptionBar>
  );
};

export const PollCard: React.FC<PollCardProps> = ({
  id,
  initials,
  author,
  time,
  category,
  question,
  options = [],
  onVote,
  selectedOption,
  isLiked: isLikedProp,
  onLike,
  totalLikes = 0,
  creatorId,
  expiresAt,
}) => {
  const safeOptions = Array.isArray(options) ? options : [];

  const isExpired = React.useMemo(() => {
    if (!expiresAt) return false;
    const expiryTime = expiresAt?.toMillis?.() || expiresAt;
    return Date.now() > expiryTime;
  }, [expiresAt]);

  console.log('PollCard received:', { question, options: safeOptions, category });

  const totalVotes = safeOptions.reduce((sum, opt) => sum + (opt?.votes || 0), 0);

  const getPercent = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const maxVotes = Math.max(...safeOptions.map(opt => opt?.votes || 0), 0);

  const handleVote = (optionIndex: number) => {
    if (isExpired) return;
    if (selectedOption === undefined) {
      onVote(id, optionIndex);
    }
  };

  const handleLike = () => {
    if (onLike && !isLikedProp) {
      onLike(id);
    }
  };

  const isLiked = isLikedProp || false;

  const { user } = useAuth();
  const isCreator = user && user.uid === creatorId;
  const [isCopied, setIsCopied] = React.useState(false);
  const [isEmbedCopied, setIsEmbedCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<null | 'comments' | 'voters' | 'likes' | 'analytics'>(null);

  const [comments, setComments] = React.useState<Comment[]>([]);
  const [voters, setVoters] = React.useState<Vote[]>([]);
  const [likers, setLikers] = React.useState<Like[]>([]);
  const [newComment, setNewComment] = React.useState('');

  const fetchDetails = React.useCallback(async (tab: 'comments' | 'voters' | 'likes') => {
    if (tab === 'comments') setComments(await pollsService.getComments(id));
    if (tab === 'voters') setVoters(await pollsService.getVotesForPoll(id));
    if (tab === 'likes') setLikers(await pollsService.getLikesForPoll(id));
  }, [id]);

  React.useEffect(() => {
    if (activeTab && activeTab !== 'analytics') fetchDetails(activeTab);
  }, [activeTab, fetchDetails]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSendComment = async () => {
    if (!user || !newComment.trim()) return;
    const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
    await pollsService.addComment(id, user.uid, userName, getInitials(userName), newComment.trim());
    setNewComment('');
    fetchDetails('comments');
  };

  const toggleTab = (tab: 'comments' | 'voters' | 'likes' | 'analytics') => {
    if (activeTab === tab) setActiveTab(null);
    else setActiveTab(tab);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?pollId=${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vote on my poll!',
          text: question,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.log('Error copying to clipboard', err);
      }
    }
  };

  const handleEmbed = async () => {
    const embedCode = `<iframe src="${window.location.origin}?pollId=${id}&embed=true" width="100%" height="500" frameborder="0"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      setIsEmbedCopied(true);
      setTimeout(() => setIsEmbedCopied(false), 2000);
    } catch (err) {
      console.log('Error copying embed code', err);
    }
  };

  const handleExportCSV = () => {
    if (!isCreator) return;

    const headers = ['User', 'Voted For', 'Timestamp'];
    const rows = voters.map(v => {
      const optionLabel = safeOptions[v.optionIndex]?.label || 'Unknown';
      const time = v.votedAt?.toDate ? v.votedAt.toDate().toLocaleString() : 'N/A';
      const safeName = v.userName && v.userName !== 'undefined' ? v.userName : 'Anonymous';
      return `"${safeName}","${optionLabel}","${time}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `poll_results_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <AuthorRow>
          <Avatar>{initials}</Avatar>
          <AuthorInfo>
            <AuthorName>{author}</AuthorName>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TimeText>{time}</TimeText>
              {isExpired && <ExpiredBadge><Clock size={10} /> Closed</ExpiredBadge>}
            </div>
          </AuthorInfo>
        </AuthorRow>
        <CategoryChip>{category}</CategoryChip>
      </CardHeader>

      <Question>{question}</Question>

      <OptionsContainer>
        {safeOptions.map((option, index) => (
          <PollOption
            key={index}
            label={option?.label || 'No label'}
            percent={getPercent(option?.votes || 0)}
            isWinner={(option?.votes || 0) === maxVotes}
            isSelected={selectedOption === index}
            onVote={() => handleVote(index)}
            imageUrl={option?.imageUrl}
          />
        ))}
      </OptionsContainer>

      <CardFooter>
        <VoteCount style={{ cursor: 'pointer' }} onClick={() => toggleTab('voters')}>
          {totalVotes.toLocaleString()} votes{totalLikes > 0 ? ` • ${totalLikes} likes` : ''}
        </VoteCount>
        <ActionButtons>
          <ActionButton $isActive={isLiked} onClick={() => { handleLike(); if (activeTab === 'likes') fetchDetails('likes'); }}>
            <Heart size={20} fill={isLiked ? '#FF4D6D' : 'none'} />
          </ActionButton>
          <ActionButton onClick={() => toggleTab('comments')}>
            <MessageCircle size={20} />
          </ActionButton>
          <ActionButton onClick={handleShare}>
            {isCopied ? <Check size={20} color="#00C851" /> : <Share2 size={20} />}
          </ActionButton>
          <ActionButton onClick={handleEmbed}>
            {isEmbedCopied ? <Check size={20} color="#aa66cc" /> : <Code size={20} />}
          </ActionButton>
        </ActionButtons>
      </CardFooter>

      {activeTab && (
        <Drawer>
          <DrawerTabs>
            <DrawerTab $active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>Comments</DrawerTab>
            <DrawerTab $active={activeTab === 'voters'} onClick={() => setActiveTab('voters')}>
              Voters {!isCreator && <Lock size={12} style={{ marginLeft: 4 }} />}
            </DrawerTab>
            <DrawerTab $active={activeTab === 'likes'} onClick={() => setActiveTab('likes')}>
              Likes {!isCreator && <Lock size={12} style={{ marginLeft: 4 }} />}
            </DrawerTab>
            <DrawerTab $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
              Analytics {!isCreator && <Lock size={12} style={{ marginLeft: 4 }} />}
            </DrawerTab>
          </DrawerTabs>

          <ListContainer>
            {activeTab === 'comments' && (
              <>
                {comments.length === 0 && <DrawerContentPlaceholder>No comments yet. Be the first!</DrawerContentPlaceholder>}
                {comments.map(c => (
                  <UserItem key={c.id}>
                    <UserItemAvatar>{c.userInitials}</UserItemAvatar>
                    <CommentBubble>
                      <UserName>{c.userName}</UserName>
                      {c.text}
                    </CommentBubble>
                  </UserItem>
                ))}
                {user ? (
                  <CommentInputRow>
                    <CommentInput
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                    />
                    <SendButton onClick={handleSendComment} disabled={!newComment.trim()}>
                      <Send size={16} />
                    </SendButton>
                  </CommentInputRow>
                ) : (
                  <DrawerContentPlaceholder>Sign in to comment.</DrawerContentPlaceholder>
                )}
              </>
            )}

            {activeTab === 'voters' && (
              <>
                {!isCreator ? (
                  <DrawerContentPlaceholder>
                    <Lock size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div>Only the poll creator can view voters.</div>
                  </DrawerContentPlaceholder>
                ) : (
                  <>
                    {voters.length === 0 && <DrawerContentPlaceholder>No votes yet.</DrawerContentPlaceholder>}
                    {voters.map(v => (
                      <UserItem key={v.id}>
                        <UserItemAvatar>{v.userInitials}</UserItemAvatar>
                        <div style={{ flex: 1, fontSize: '14px' }}>
                          <UserName>{v.userName}</UserName>
                          <span style={{ color: '#888', fontSize: '13px' }}>Voted for {safeOptions[v.optionIndex]?.label || 'an option'}</span>
                        </div>
                      </UserItem>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === 'likes' && (
              <>
                {!isCreator ? (
                  <DrawerContentPlaceholder>
                    <Lock size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div>Only the poll creator can view likes.</div>
                  </DrawerContentPlaceholder>
                ) : (
                  <>
                    {likers.length === 0 && <DrawerContentPlaceholder>No likes yet.</DrawerContentPlaceholder>}
                    {likers.map(l => (
                      <UserItem key={l.id}>
                        <UserItemAvatar>{l.userInitials}</UserItemAvatar>
                        <div style={{ flex: 1, fontSize: '14px' }}>
                          <UserName>{l.userName}</UserName>
                          <span style={{ color: '#888', fontSize: '13px' }}>Liked this poll</span>
                        </div>
                      </UserItem>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                {!isCreator ? (
                  <DrawerContentPlaceholder>
                    <Lock size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div>Only the poll creator can view detailed analytics.</div>
                  </DrawerContentPlaceholder>
                ) : (
                  <>
                    {totalVotes === 0 ? (
                      <DrawerContentPlaceholder>No data yet.</DrawerContentPlaceholder>
                    ) : (
                      <AnalyticsContainer>
                        <ExportButtonContainer>
                          <ExportButton onClick={handleExportCSV}>
                            <Download size={12} />
                            Export CSV
                          </ExportButton>
                        </ExportButtonContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={safeOptions.map((opt, i) => ({ name: opt.label, value: opt.votes || 0 }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {safeOptions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value} votes`, 'Votes']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </AnalyticsContainer>
                    )}
                  </>
                )}
              </>
            )}
          </ListContainer>
        </Drawer>
      )}
    </Card>
  );
};

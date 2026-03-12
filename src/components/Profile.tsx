import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { pollsService, Poll } from '../services/polls';
import { PollCard } from './PollCard';
import { Trophy, BarChart2, Hash, ShieldCheck, Zap } from 'lucide-react';

const ProfileContainer = styled.div`
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.on_primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const UserEmail = styled.p`
  margin: 4px 0 0 0;
  color: ${({ theme }) => theme.secondary_text};
`;

const SectionTitle = styled.h3`
  margin: 24px 0 16px 0;
  font-size: 20px;
`;

const BadgesContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const Badge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${({ $color }) => `${$color}15`};
  border: 1px solid ${({ $color }) => `${$color}40`};
  color: ${({ $color }) => $color};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.divider};
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.secondary_text};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [userPolls, setUserPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            pollsService.getUserPolls(user.uid).then(polls => {
                setUserPolls(polls);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return (
            <ProfileContainer>
                <SectionTitle>Please log in to view your profile.</SectionTitle>
            </ProfileContainer>
        );
    }

    const userInitials = user.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.slice(0, 2).toUpperCase() || '?';

    const totalVotesReceived = userPolls.reduce((sum, poll) => {
        const safeOptions = Array.isArray(poll.options) ? poll.options : [];
        const pollVotes = safeOptions.reduce((vSum, opt) => vSum + (opt.votes || 0), 0) || 0;
        return sum + pollVotes;
    }, 0);

    const getRank = () => {
        if (totalVotesReceived >= 100) return { title: 'Viral Influencer', color: '#ff4444', icon: <Zap size={14} /> };
        if (totalVotesReceived >= 10) return { title: 'Trendsetter', color: '#ffbb33', icon: <Trophy size={14} /> };
        return { title: 'Starter Analyst', color: '#00C851', icon: <ShieldCheck size={14} /> };
    };

    const rank = getRank();

    return (
        <ProfileContainer>
            <ProfileHeader>
                <Avatar>{userInitials}</Avatar>
                <UserInfo>
                    <UserName>{user.displayName || 'Anonymous User'}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                    {loading ? null : (
                        <BadgesContainer>
                            <Badge $color={rank.color}>{rank.icon} {rank.title}</Badge>
                        </BadgesContainer>
                    )}
                </UserInfo>
            </ProfileHeader>

            {!loading && (
                <StatsGrid>
                    <StatCard>
                        <StatValue>{userPolls.length}</StatValue>
                        <StatLabel><Hash size={14} /> Polls Created</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{totalVotesReceived}</StatValue>
                        <StatLabel><BarChart2 size={14} /> Total Votes Received</StatLabel>
                    </StatCard>
                </StatsGrid>
            )}

            <SectionTitle>My Polls ({userPolls.length})</SectionTitle>
            {loading ? (
                <p>Loading your polls...</p>
            ) : userPolls.length > 0 ? (
                userPolls.map(poll => (
                    <PollCard
                        key={poll.id}
                        id={poll.id}
                        initials={poll.userInitials || '?'}
                        author={poll.userName || 'Anonymous'}
                        time={poll.createdAt?.toDate ? poll.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        category={poll.category || 'General'}
                        question={poll.question || ''}
                        options={poll.options || []}
                        onVote={() => { }}
                        onLike={() => { }}
                        totalLikes={poll.likes || 0}
                        creatorId={poll.userId}
                        expiresAt={poll.expiresAt}
                    />
                ))
            ) : (
                <p>You haven't created any polls yet.</p>
            )}
        </ProfileContainer>
    );
};

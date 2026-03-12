import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  where,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

export interface PollOption {
  label: string;
  votes: number;
  imageUrl?: string;
}

export interface Poll {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  category: string;
  question: string;
  options: PollOption[];
  createdAt: any;
  expiresAt?: any;
  likes: number;
  visibility?: 'public' | 'private';
}

export interface Vote {
  id: string;
  pollId: string;
  userId: string;
  userName?: string;
  userInitials?: string;
  optionIndex: number;
  votedAt: any;
}

export interface Like {
  id: string;
  pollId: string;
  userId: string;
  userName?: string;
  userInitials?: string;
  likedAt: any;
}

export interface Comment {
  id: string;
  pollId: string;
  userId: string;
  userName: string;
  userInitials: string;
  text: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  userId: string; // The person receiving the notification
  title: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  link?: string;
}

const POLLS_COLLECTION = 'polls';
const VOTES_COLLECTION = 'votes';
const LIKES_COLLECTION = 'likes';
const COMMENTS_COLLECTION = 'comments';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const pollsService = {
  async createPoll(poll: Omit<Poll, 'id' | 'createdAt' | 'likes'>): Promise<string> {
    console.log('Creating poll with options:', poll);
    const docRef = await addDoc(collection(db, POLLS_COLLECTION), {
      ...poll,
      likes: 0,
      createdAt: serverTimestamp(),
      visibility: poll.visibility || 'public'
    });
    return docRef.id;
  },

  async getPolls(limit: number = 50): Promise<Poll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const polls: Poll[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      polls.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userInitials: data.userInitials,
        category: data.category,
        question: data.question,
        options: Array.isArray(data.options) ? data.options : [],
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        likes: data.likes || 0,
        visibility: data.visibility || 'public',
      });
    });

    return polls.filter(p => p.visibility !== 'private').slice(0, limit);
  },

  async getPollById(pollId: string): Promise<Poll | null> {
    const docRef = doc(db, POLLS_COLLECTION, pollId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      userName: data.userName,
      userInitials: data.userInitials,
      category: data.category,
      question: data.question,
      options: Array.isArray(data.options) ? data.options : [],
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      likes: data.likes || 0,
      visibility: data.visibility || 'public',
    };
  },

  subscribeToPolls(callback: (polls: Poll[]) => void, sharedPollId?: string | null): () => void {
    const q = query(
      collection(db, POLLS_COLLECTION)
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const polls: Poll[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          polls.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userInitials: data.userInitials,
            category: data.category,
            question: data.question,
            options: Array.isArray(data.options) ? data.options : [],
            createdAt: data.createdAt,
            expiresAt: data.expiresAt,
            likes: data.likes || 0,
            visibility: data.visibility || 'public',
          });
        });

        // Sort descending locally. Null handled as newest (local optimistic write).
        polls.sort((a, b) => {
          if (!a.createdAt) return -1;
          if (!b.createdAt) return 1;
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        // Show all public polls OR the specifically shared poll (even if private)
        callback(polls.filter(p => p.visibility !== 'private' || p.id === sharedPollId));
      },
      (error) => {
        console.error('Error listening to polls:', error);
      }
    );

    return unsubscribe;
  },

  subscribeToUserPolls(userId: string, callback: (polls: Poll[]) => void): () => void {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const polls: Poll[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          polls.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userInitials: data.userInitials,
            category: data.category,
            question: data.question,
            options: Array.isArray(data.options) ? data.options : [],
            createdAt: data.createdAt,
            expiresAt: data.expiresAt,
            likes: data.likes || 0,
            visibility: data.visibility || 'public',
          });
        });
        callback(polls);
      },
      (error) => {
        console.error('Error listening to user polls:', error);
      }
    );

    return unsubscribe;
  },

  async vote(pollId: string, optionIndex: number, userId: string, userName?: string, userInitials?: string): Promise<void> {
    const hasVoted = await this.hasUserVoted(pollId, userId);
    if (hasVoted) return;

    const pollRef = doc(db, POLLS_COLLECTION, pollId);

    await runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) {
        throw new Error("Poll does not exist!");
      }

      const pollData = pollDoc.data();
      const options = pollData.options || [];

      if (options[optionIndex]) {
        options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;
        transaction.update(pollRef, { options });
      }
    });

    await addDoc(collection(db, VOTES_COLLECTION), {
      pollId,
      userId,
      userName: userName || 'Anonymous',
      userInitials: userInitials || '?',
      optionIndex,
      votedAt: serverTimestamp()
    });
  },

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  async getUserVote(pollId: string, userId: string): Promise<number | null> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().optionIndex;
    }
    return null;
  },

  async getUserVotesBulk(userId: string): Promise<Record<string, number>> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const votes: Record<string, number> = {};
    querySnapshot.forEach(doc => {
      votes[doc.data().pollId] = doc.data().optionIndex;
    });
    return votes;
  },

  async getVotesForPoll(pollId: string): Promise<Vote[]> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
  },

  async likePoll(pollId: string, userId: string, userName?: string, userInitials?: string): Promise<void> {
    const hasLiked = await this.hasUserLiked(pollId, userId);
    if (hasLiked) return;

    const pollRef = doc(db, POLLS_COLLECTION, pollId);

    await updateDoc(pollRef, {
      likes: increment(1)
    });

    await addDoc(collection(db, LIKES_COLLECTION), {
      pollId,
      userId,
      userName: userName || 'Anonymous',
      userInitials: userInitials || '?',
      likedAt: serverTimestamp()
    });
  },

  async hasUserLiked(pollId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  async getUserLikesBulk(userId: string): Promise<Record<string, boolean>> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const likes: Record<string, boolean> = {};
    querySnapshot.forEach(doc => {
      likes[doc.data().pollId] = true;
    });
    return likes;
  },

  async getLikesForPoll(pollId: string): Promise<Like[]> {
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('pollId', '==', pollId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Like));
  },

  async addComment(pollId: string, userId: string, userName: string, userInitials: string, text: string): Promise<void> {
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      pollId,
      userId,
      userName,
      userInitials,
      text,
      createdAt: serverTimestamp()
    });
  },

  async getComments(pollId: string): Promise<Comment[]> {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('pollId', '==', pollId)
    );
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));

    // Sort locally to avoid needing a Firestore composite index
    return comments.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
      return timeA - timeB;
    });
  },

  async deletePoll(pollId: string): Promise<void> {
    await deleteDoc(doc(db, POLLS_COLLECTION, pollId));
  },

  async getUserPolls(userId: string): Promise<Poll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const polls: Poll[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      polls.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userInitials: data.userInitials,
        category: data.category,
        question: data.question,
        options: data.options,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        likes: data.likes || 0,
      });
    });

    // Sort locally to avoid needing a Firestore composite index
    return polls.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
      return timeB - timeA;
    });
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const notifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    return notifs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
      const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
      return timeB - timeA;
    });
  },

  async markNotificationRead(notifId: string): Promise<void> {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, notifId);
    await updateDoc(ref, { isRead: true });
  },

  async createNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notif,
      createdAt: serverTimestamp()
    });
  }
};

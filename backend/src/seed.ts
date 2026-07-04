import { db } from './config/firebase';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const samplePosts = [
  {
    id: 'post1',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJ',
    authorRole: 'citizen',
    isOfficial: false,
    title: 'Neighborhood Watch Meeting - Next Tuesday',
    description: 'Hi everyone! We are organizing a neighborhood watch meeting at the community center next Tuesday at 7 PM. We will be discussing recent package thefts and how to improve local security. Please join us!',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    upvotes: 0,
    upvotedBy: ['user1', 'user2', 'user3', 'user4'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'post2',
    authorName: 'Officer Davis',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Davis',
    authorRole: 'officer',
    isOfficial: true,
    title: 'Road Closure on 4th Street this weekend',
    description: 'Please be advised that 4th Street will be closed for repaving starting Friday night until Sunday evening. Detours will be marked. We appreciate your patience!',
    upvotes: 0,
    upvotedBy: ['user2', 'user5'],
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'post3',
    authorName: 'Mike The Moderator',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    authorRole: 'moderator',
    isOfficial: true,
    title: 'Suggestion: Adding more recycling bins at the park',
    description: 'I noticed the park gets very littered over the weekend. What does everyone think about petitioning the city for more recycling bins? I have attached a photo of the current state of the main picnic area.',
    image: 'https://images.unsplash.com/photo-1595278069441-2f29f803e599?auto=format&fit=crop&w=800',
    upvotes: 0,
    upvotedBy: ['user1', 'user3', 'user4', 'user5', 'user6', 'user7'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'post4',
    authorName: 'Emily Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    authorRole: 'citizen',
    isOfficial: false,
    title: 'Question about upcoming city council elections',
    description: 'Does anyone know when the deadline to register for the local council voting is? I just moved to this district and want to make sure I am eligible to vote.',
    upvotes: 0,
    upvotedBy: ['user1'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

const sampleComments = [
  {
    postId: 'post1',
    userName: 'John Doe',
    text: 'I will be there! Thanks for organizing this.',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
  },
  {
    postId: 'post1',
    userName: 'Emily Chen',
    text: 'Can we bring snacks to share?',
    createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString()
  },
  {
    postId: 'post2',
    userName: 'Local Commuter',
    text: 'Thanks for the heads up, Officer. Will take 5th instead.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    postId: 'post3',
    userName: 'Sarah Jenkins',
    text: '100% support this! It is getting ridiculous.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    postId: 'post3',
    userName: 'Officer Davis',
    text: 'I will forward this discussion to the Parks & Recreation department for you all.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    postId: 'post4',
    userName: 'Mike The Moderator',
    text: 'The deadline is October 15th! You can register online at the city portal.',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  }
];

async function seedData() {
  if (!db) {
    console.error('Firestore is not initialized. Ensure your Firebase credentials are correct.');
    process.exit(1);
  }

  try {
    console.log('Seeding Community Posts...');
    for (const post of samplePosts) {
      const { id, ...postData } = post;
      await db.collection('community_posts').doc(id).set(postData);
    }
    console.log(`Successfully added ${samplePosts.length} posts.`);

    console.log('Seeding Community Comments...');
    for (const comment of sampleComments) {
      await db.collection('community_comments').add(comment);
    }
    console.log(`Successfully added ${sampleComments.length} comments.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();

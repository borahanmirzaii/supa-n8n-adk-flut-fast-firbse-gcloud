#!/usr/bin/env node
/**
 * Firebase Emulator Seed Data Script
 * Seeds the Firebase emulators with test data for local development
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (emulator mode - no real credentials needed)
if (!require('firebase-admin').apps.length) {
  initializeApp({
    projectId: 'demo-project',
  });
}

const auth = getAuth();
const db = getFirestore();

async function seedData() {
  console.log('🌱 Seeding Firebase Emulators...\n');

  try {
    // Create test users
    console.log('👤 Creating test users...');
    const testUsers = [
      {
        email: 'dev@test.com',
        password: 'testpass123',
        displayName: 'Dev User',
        emailVerified: true,
      },
      {
        email: 'admin@test.com',
        password: 'testpass123',
        displayName: 'Admin User',
        emailVerified: true,
      },
      {
        email: 'user@test.com',
        password: 'testpass123',
        displayName: 'Test User',
        emailVerified: false,
      },
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        const user = await auth.createUser(userData);
        createdUsers.push(user);
        console.log(`  ✅ Created user: ${userData.email} (${user.uid})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`  ⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`  ❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Create test agents
    console.log('\n🤖 Creating test agents...');
    const testAgents = [
      {
        name: 'Customer Support Agent',
        description: 'Handles customer inquiries and support tickets',
        model: 'gpt-4',
        temperature: 0.7,
        enabled: true,
        createdAt: new Date(),
        config: {
          maxTokens: 2000,
          systemPrompt: 'You are a helpful customer support agent.',
        },
      },
      {
        name: 'Code Review Agent',
        description: 'Reviews code and provides feedback',
        model: 'gpt-4',
        temperature: 0.3,
        enabled: true,
        createdAt: new Date(),
        config: {
          maxTokens: 4000,
          systemPrompt: 'You are a code review expert.',
        },
      },
      {
        name: 'Content Writer Agent',
        description: 'Generates and edits content',
        model: 'gpt-4',
        temperature: 0.9,
        enabled: true,
        createdAt: new Date(),
        config: {
          maxTokens: 3000,
          systemPrompt: 'You are a creative content writer.',
        },
      },
    ];

    for (const agentData of testAgents) {
      try {
        const docRef = await db.collection('agents').add(agentData);
        console.log(`  ✅ Created agent: ${agentData.name} (${docRef.id})`);
      } catch (error) {
        console.error(`  ❌ Error creating agent ${agentData.name}:`, error.message);
      }
    }

    // Create test conversations/sessions
    if (createdUsers.length > 0) {
      console.log('\n💬 Creating test conversations...');
      const testConversations = [
        {
          userId: createdUsers[0].uid,
          agentId: 'test-agent-1',
          messages: [
            {
              role: 'user',
              content: 'Hello, I need help with my account.',
              timestamp: new Date(),
            },
            {
              role: 'assistant',
              content: 'I\'d be happy to help! What seems to be the issue?',
              timestamp: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const convData of testConversations) {
        try {
          const docRef = await db.collection('conversations').add(convData);
          console.log(`  ✅ Created conversation: ${docRef.id}`);
        } catch (error) {
          console.error(`  ❌ Error creating conversation:`, error.message);
        }
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Email: dev@test.com');
    console.log('  Password: testpass123');
    console.log('\n  Email: admin@test.com');
    console.log('  Password: testpass123');
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });


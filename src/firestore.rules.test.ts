import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { describe, before, after, it, afterEach } from 'node:test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let testEnv: RulesTestEnvironment;

before(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'test-project',
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, '../DRAFT_firestore.rules'), 'utf8'),
        },
    });
});

after(async () => {
    await testEnv.cleanup();
});

afterEach(async () => {
    await testEnv.clearFirestore();
});

describe('Users Collection Rules', () => {
    it('should allow creating a user with valid data', async () => {
        const alice = testEnv.authenticatedContext('aliceId', { email_verified: false, isAnonymous: true });
        await assertSucceeds(setDoc(doc(alice.firestore(), 'users', 'juan'), {
            name: 'juan',
            avatar: '👾',
            score: 0,
            world: 1,
            activeWorld: 1,
            currentGameIndex: 0
        }));
    });

    it('should deny writing additional fields', async () => {
        const alice = testEnv.authenticatedContext('aliceId', { isAnonymous: true });
        await assertFails(setDoc(doc(alice.firestore(), 'users', 'juan'), {
            name: 'juan',
            avatar: '👾',
            score: 0,
            world: 1,
            activeWorld: 1,
            currentGameIndex: 0,
            extra: true
        }));
    });
});

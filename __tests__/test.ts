import fs from 'fs';
import path from 'path';
import { findNotFollowingBack, findUnfollowedFollowers, generateSummary } from '../lib/next';

type IGUser = {
  username: string;
  href: string;
};

const testDir = path.join(__dirname, '.');

// Load test data
const followersRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'followers_1.json'), 'utf-8')
);

const followingRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'following.json'), 'utf-8')
);

// Extract followers
const followers: IGUser[] = followersRaw
  .map((user: any) => {
    const username = user?.string_list_data?.[0]?.value?.trim();
    const href = user?.string_list_data?.[0]?.href;
    return username && href ? { username, href } : null;
  })
  .filter((u: any): u is IGUser => Boolean(u));

// Extract following
const following: IGUser[] = followingRaw.relationships_following
  .map((user: any) => {
    const username = user?.title?.trim();
    const href = user?.string_list_data?.[0]?.href;
    return username && href ? { username, href } : null;
  })
  .filter((u: any): u is IGUser => Boolean(u));

console.log('\n=== TEST DATA ===');
console.log('Followers:', followers);
console.log('\nFollowing:', following);

console.log('\n=== RESULTS ===');
const notFollowingBack = findNotFollowingBack(followers, following);
const unfollowedFollowers = findUnfollowedFollowers(followers, following);
const summary = generateSummary(followers, following);

console.log('\nNot Following Back:', notFollowingBack);
console.log('Unfollowed Followers:', unfollowedFollowers);
console.log('\nSummary:');
console.log(summary);

console.log('\n=== EXPECTED RESULTS ===');
console.log('Followers: 3 (user1, user2, user3)');
console.log('Following: 4 (user1, user2, user4, user5)');
console.log('Not Following Back: 2 (user4, user5)');
console.log('Unfollowed Followers: 1 (user3)');
console.log('Mutual: 2 (user1, user2)');

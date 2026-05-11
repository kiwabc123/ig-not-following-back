const fs = require('fs');
const path = require('path');

// Mock the lib functions
const IGUser = {
  username: String,
  href: String,
};

function findNotFollowingBack(followers, following) {
  const followerSet = new Set(followers.map((u) => u.username.toLowerCase().trim()));
  return following.filter((user) => !followerSet.has(user.username.toLowerCase().trim()));
}

function findUnfollowedFollowers(followers, following) {
  const followingSet = new Set(following.map((u) => u.username.toLowerCase().trim()));
  return followers.filter((user) => !followingSet.has(user.username.toLowerCase().trim()));
}

function generateSummary(followers, following) {
  const notFollowingBack = findNotFollowingBack(followers, following);
  const unfollowedFollowers = findUnfollowedFollowers(followers, following);

  return {
    totalFollowers: followers.length,
    totalFollowing: following.length,
    notFollowingBackCount: notFollowingBack.length,
    unfollowedFollowersCount: unfollowedFollowers.length,
    mutualFollows: followers.length - unfollowedFollowers.length,
  };
}

const testDir = __dirname;

// Load test data
const followersRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'followers_1.json'), 'utf-8')
);

const followingRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'following.json'), 'utf-8')
);

// Extract followers
const followers = followersRaw
  .map((user) => {
    const username = user?.string_list_data?.[0]?.value?.trim();
    const href = user?.string_list_data?.[0]?.href;
    return username && href ? { username, href } : null;
  })
  .filter((u) => Boolean(u));

// Extract following
const following = followingRaw.relationships_following
  .map((user) => {
    const username = user?.title?.trim();
    const href = user?.string_list_data?.[0]?.href;
    return username && href ? { username, href } : null;
  })
  .filter((u) => Boolean(u));

console.log('\n=== TEST DATA ===');
console.log('Followers:', followers);
console.log('\nFollowing:', following);

console.log('\n=== RESULTS ===');
const notFollowingBack = findNotFollowingBack(followers, following);
const unfollowedFollowers = findUnfollowedFollowers(followers, following);
const summary = generateSummary(followers, following);

console.log('\nNot Following Back:', notFollowingBack);
console.log('Unfollowed Followers:', unfollowedFollowers);
console.log('\nSummary:', summary);

console.log('\n=== EXPECTED RESULTS ===');
console.log('Followers: 3 (user1, user2, user3)');
console.log('Following: 4 (user1, user2, user4, user5)');
console.log('Not Following Back: 2 (user4, user5)');
console.log('Unfollowed Followers: 1 (user3)');
console.log('Mutual: 2 (user1, user2)');

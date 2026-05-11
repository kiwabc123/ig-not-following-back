const fs = require('fs');
const path = require('path');

// Mock the lib functions
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

// Load all followers files (followers_1.json, followers_2.json, etc.)
console.log('\n=== EXTRACTING FOLLOWERS (All Files) ===');
const followersRaw = [];
let fileIndex = 1;

while (true) {
  const filename = `followers_${fileIndex}.json`;
  const filepath = path.join(testDir, filename);
  
  if (!fs.existsSync(filepath)) {
    break;
  }
  
  console.log(`📄 Loading ${filename}...`);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  followersRaw.push(...data);
  fileIndex++;
}

console.log(`✅ Found ${fileIndex - 1} followers file(s)`);

// Load following data
const followingRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'following.json'), 'utf-8')
);

// Extract all followers with detailed logging
const followers = followersRaw
  .map((user, index) => {
    const username = user?.string_list_data?.[0]?.value?.trim();
    const href = user?.string_list_data?.[0]?.href;
    if (!username || !href) {
      console.log(`❌ Row ${index}: Missing username or href`, { username, href });
      return null;
    }
    return { username, href };
  })
  .filter((u) => Boolean(u));

console.log(`✅ Extracted ${followers.length} followers`);
console.log('First 5 followers:', followers.slice(0, 5));

// Extract following with detailed logging
console.log('\n=== EXTRACTING FOLLOWING ===');
const following = followingRaw.relationships_following
  .map((user, index) => {
    const username = user?.title?.trim();
    const href = user?.string_list_data?.[0]?.href;
    if (!username || !href) {
      console.log(`❌ Row ${index}: Missing username or href`, { username, href });
      return null;
    }
    return { username, href };
  })
  .filter((u) => Boolean(u));

console.log(`✅ Extracted ${following.length} following`);
console.log('First 5 following:', following.slice(0, 5));

// Analyze results
console.log('\n=== ANALYSIS ===');
const notFollowingBack = findNotFollowingBack(followers, following);
const unfollowedFollowers = findUnfollowedFollowers(followers, following);
const summary = generateSummary(followers, following);

console.log('\n📊 SUMMARY:');
console.log(`  Total Followers: ${summary.totalFollowers}`);
console.log(`  Total Following: ${summary.totalFollowing}`);
console.log(`  Not Following Back: ${summary.notFollowingBackCount}`);
console.log(`  Unfollowed Followers: ${summary.unfollowedFollowersCount}`);
console.log(`  Mutual Follows: ${summary.mutualFollows}`);

console.log('\n👤 Not Following Back (You follow them, they don\'t follow you back):');
notFollowingBack.slice(0, 10).forEach(user => {
  console.log(`  - ${user.username}`);
});
if (notFollowingBack.length > 10) {
  console.log(`  ... and ${notFollowingBack.length - 10} more`);
}

console.log('\n🚶 Unfollowed Followers (They follow you, you don\'t follow them back):');
unfollowedFollowers.slice(0, 10).forEach(user => {
  console.log(`  - ${user.username}`);
});
if (unfollowedFollowers.length > 10) {
  console.log(`  ... and ${unfollowedFollowers.length - 10} more`);
}

// Save detailed results
const results = {
  summary,
  notFollowingBack: notFollowingBack.map(u => u.username),
  unfollowedFollowers: unfollowedFollowers.map(u => u.username),
};

fs.writeFileSync(
  path.join(testDir, 'results.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n✅ Detailed results saved to results.json');



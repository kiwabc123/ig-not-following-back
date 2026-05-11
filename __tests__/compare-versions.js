const fs = require('fs');
const path = require('path');

// Mock the comparison functions that should be identical in both versions
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

// Extraction functions
function extractFollower(user) {
  const username = user?.string_list_data?.[0]?.value?.trim();
  const href = user?.string_list_data?.[0]?.href;
  if (!username || !href) return null;
  return { username, href };
}

function extractFollowing(user) {
  const username = user?.title?.trim();
  const href = user?.string_list_data?.[0]?.href;
  if (!username || !href) return null;
  return { username, href };
}

const testDir = path.join(__dirname);

// Load all followers files
console.log('\n=== LOADING TEST DATA ===');
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

const followingRaw = JSON.parse(
  fs.readFileSync(path.join(testDir, 'following.json'), 'utf-8')
);

// Extract data
const followers = followersRaw
  .map(extractFollower)
  .filter((u) => Boolean(u));

const following = followingRaw.relationships_following
  .map(extractFollowing)
  .filter((u) => Boolean(u));

// Run analysis
console.log('\n=== RUNNING ANALYSIS ===');
const notFollowingBack = findNotFollowingBack(followers, following);
const unfollowedFollowers = findUnfollowedFollowers(followers, following);
const summary = generateSummary(followers, following);

// Results
console.log('\n✅ WEB APP & CLI RESULTS (Should be identical):');
console.log(`\n📊 SUMMARY:`);
console.log(`  Total Followers: ${summary.totalFollowers}`);
console.log(`  Total Following: ${summary.totalFollowing}`);
console.log(`  Not Following Back: ${summary.notFollowingBackCount}`);
console.log(`  Unfollowed Followers: ${summary.unfollowedFollowersCount}`);
console.log(`  Mutual Follows: ${summary.mutualFollows}`);

console.log(`\n👤 Sample - Not Following Back (first 5):`);
notFollowingBack.slice(0, 5).forEach((u, i) => {
  console.log(`  ${i + 1}. ${u.username}`);
});
console.log(`  ... and ${notFollowingBack.length - 5} more\n`);

console.log(`🚶 Sample - Unfollowed Followers (first 5):`);
unfollowedFollowers.slice(0, 5).forEach((u, i) => {
  console.log(`  ${i + 1}. ${u.username}`);
});
console.log(`  ... and ${Math.max(0, unfollowedFollowers.length - 5)} more\n`);

// Save comparison results
const comparisonResults = {
  timestamp: new Date().toISOString(),
  summary,
  extraction: {
    totalFollowersExtracted: followers.length,
    totalFollowingExtracted: following.length,
  },
  sampleData: {
    notFollowingBackSample: notFollowingBack.slice(0, 5).map(u => u.username),
    unfollowedFollowersSample: unfollowedFollowers.slice(0, 5).map(u => u.username),
  },
};

fs.writeFileSync(
  path.join(testDir, 'comparison-results.json'),
  JSON.stringify(comparisonResults, null, 2)
);

console.log('✅ Comparison results saved to comparison-results.json');
console.log('\n⚠️  NOTE: Both CLI and Web App should produce identical results above.');
console.log('If you see different numbers between the two versions, there\'s a bug to fix.');

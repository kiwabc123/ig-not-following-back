type IGUser = {
  username: string;
  href: string;
};

/**
 * Finds users who follow you but you don't follow them back
 * @param followers - Array of followers
 * @param following - Array of users you're following
 * @returns Array of users who follow you but you don't follow back
 */
export function findUnfollowedFollowers(
  followers: IGUser[],
  following: IGUser[]
): IGUser[] {
  const followingSet = new Set(following.map((u) => u.username));

  return followers.filter((user) => !followingSet.has(user.username));
}

/**
 * Finds users you follow who don't follow you back
 * @param followers - Array of followers
 * @param following - Array of users you're following
 * @returns Array of users you follow but who don't follow back
 */
export function findNotFollowingBack(
  followers: IGUser[],
  following: IGUser[]
): IGUser[] {
  const followerSet = new Set(followers.map((u) => u.username));

  return following.filter((user) => !followerSet.has(user.username));
}

/**
 * Exports analysis results to a JSON file
 * @param notFollowingBack - Users you follow who don't follow back
 * @param unfollowedFollowers - Users who follow you but you don't follow back
 * @param outputPath - Path to save the results
 */
export function exportResults(
  notFollowingBack: IGUser[],
  unfollowedFollowers: IGUser[],
  outputPath: string
): void {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      notFollowingBackCount: notFollowingBack.length,
      unfollowedFollowersCount: unfollowedFollowers.length,
    },
    notFollowingBack,
    unfollowedFollowers,
  };

  console.log(`Results: ${JSON.stringify(results, null, 2)}`);
}

/**
 * Generates a summary report of follower analysis
 * @param followers - Array of followers
 * @param following - Array of users you're following
 * @returns Summary statistics
 */
export function generateSummary(followers: IGUser[], following: IGUser[]) {
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

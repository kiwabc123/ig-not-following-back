import fs from "fs";
import os from "os";
import path from "path";

function resolveDataDir(): string {
  const envPath = process.env.IG_DATA_DIR;
  const home = os.homedir();
  const candidates = [
    envPath,
    path.resolve(process.cwd(), "../followers_and_following"),
    path.resolve(process.cwd(), "followers_and_following"),
    path.resolve(__dirname, "../../followers_and_following"),
    path.resolve(__dirname, "../../../followers_and_following"),
    path.resolve(process.cwd(), "../../Desktop/connections/followers_and_following"),
    path.join(home, "Desktop", "connections", "followers_and_following")
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    const followersFile = path.join(candidate, "followers_1.json");
    const followingFile = path.join(candidate, "following.json");
    if (fs.existsSync(followersFile) && fs.existsSync(followingFile)) {
      return candidate;
    }
  }

  throw new Error(
    "Could not find Instagram export folder. Set IG_DATA_DIR to your followers_and_following path."
  );
}

type IGUser = {
  username: string;
  href: string;
};

function extractFollower(user: any): IGUser | null {
  const username = user?.string_list_data?.[0]?.value?.trim();
  const href = user?.string_list_data?.[0]?.href;

  if (!username || !href) return null;

  return { username, href };
}

function extractFollowing(user: any): IGUser | null {
  const username = user?.title?.trim();
  const href = user?.string_list_data?.[0]?.href;

  if (!username || !href) return null;

  return { username, href };
}

// Load all followers files (followers_1.json, followers_2.json, etc.)
const dataDir = resolveDataDir();
const followersRaw: any[] = [];

let fileIndex = 1;
while (true) {
  const followersPath = path.join(dataDir, `followers_${fileIndex}.json`);
  if (!fs.existsSync(followersPath)) {
    break;
  }
  console.log(`Loading followers_${fileIndex}.json...`);
  const data = JSON.parse(fs.readFileSync(followersPath, "utf-8"));
  followersRaw.push(...data);
  fileIndex++;
}

const followingPath = path.join(dataDir, "following.json");
const followingRaw = JSON.parse(fs.readFileSync(followingPath, "utf-8"));

const followers: IGUser[] = followersRaw
  .map(extractFollower)
  .filter((u: any): u is IGUser => Boolean(u));

const following: IGUser[] = followingRaw.relationships_following
  .map(extractFollowing)
  .filter((u: any): u is IGUser => Boolean(u));

// Create normalized Set for case-insensitive comparison
const followerSet = new Set(followers.map((u) => u.username.toLowerCase().trim()));

// Find users you follow who don't follow you back
const notFollowingBack = following.filter(
  (user) => !followerSet.has(user.username.toLowerCase().trim())
);

// Find users who follow you but you don't follow back
const followingSet = new Set(following.map((u) => u.username.toLowerCase().trim()));
const unfollowedFollowers = followers.filter(
  (user) => !followingSet.has(user.username.toLowerCase().trim())
);

console.log("\n=== SUMMARY ===");
console.log(`Total Followers: ${followers.length}`);
console.log(`Total Following: ${following.length}`);
console.log(`Not Following Back: ${notFollowingBack.length}`);
console.log(`Unfollowed Followers: ${unfollowedFollowers.length}`);
console.log(`Mutual Follows: ${followers.length - unfollowedFollowers.length}`);

console.log("\n=== Not Following Back ===");
console.table(notFollowingBack);

console.log("\n=== Unfollowed Followers ===");
console.table(unfollowedFollowers);

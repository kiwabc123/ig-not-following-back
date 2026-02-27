import fs from "fs";
import os from "os";
import path from "path";

const followersRaw = JSON.parse(
  fs.readFileSync(
    path.join(resolveDataDir(), "followers_1.json"),
    "utf-8"
  )
);

const followingRaw = JSON.parse(
  fs.readFileSync(path.join(resolveDataDir(), "following.json"), "utf-8")
);

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
  const username = user?.string_list_data?.[0]?.value;
  const href = user?.string_list_data?.[0]?.href;

  if (!username || !href) return null;

  return { username, href };
}

function extractFollowing(user: any): IGUser | null {
  const username = user?.title;
  const href = user?.string_list_data?.[0]?.href;

  if (!username || !href) return null;

  return { username, href };
}

const followers: IGUser[] = followersRaw
  .map(extractFollower)
  .filter((u: any): u is IGUser => Boolean(u));

const following: IGUser[] =
  followingRaw.relationships_following
    .map(extractFollowing)
    .filter((u: any): u is IGUser => Boolean(u));

// สร้าง Set สำหรับ compare
const followerSet = new Set(followers.map((u) => u.username));

const notFollowingBack = following.filter(
  (user) => !followerSet.has(user.username)
);

console.log("Not following back:");
console.table(notFollowingBack);
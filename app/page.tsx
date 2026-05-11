'use client';

import { useState } from 'react';
import { generateSummary, findNotFollowingBack, findUnfollowedFollowers } from '@/lib/next';

type IGUser = {
  username: string;
  href: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'summary' | 'notFollowingBack' | 'unfollowedFollowers'>('summary');
  const [summary, setSummary] = useState<any>(null);
  const [notFollowingBack, setNotFollowingBack] = useState<IGUser[]>([]);
  const [unfollowedFollowers, setUnfollowedFollowers] = useState<IGUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFollower = (user: any): IGUser | null => {
    const username = user?.string_list_data?.[0]?.value?.trim();
    const href = user?.string_list_data?.[0]?.href;
    if (!username || !href) return null;
    return { username, href };
  };

  const extractFollowing = (user: any): IGUser | null => {
    const username = user?.title?.trim();
    const href = user?.string_list_data?.[0]?.href;
    if (!username || !href) return null;
    return { username, href };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length < 2) {
      setError('Please upload following.json and all followers_*.json files');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const followersFiles: File[] = [];
      let followingFile: File | null = null;

      // Separate followers and following files
      for (let i = 0; i < files.length; i++) {
        if (files[i].name.match(/^followers_\d+\.json$/)) {
          followersFiles.push(files[i]);
        } else if (files[i].name === 'following.json') {
          followingFile = files[i];
        }
      }

      if (followersFiles.length === 0 || !followingFile) {
        setError('Please upload following.json and at least followers_1.json');
        setLoading(false);
        return;
      }

      // Read all files
      const followersTexts = await Promise.all(
        followersFiles.map((f) => f.text())
      );
      const followingText = await followingFile.text();

      // Merge all followers data
      const followersRaw: any[] = [];
      followersTexts.forEach((text) => {
        const data = JSON.parse(text);
        followersRaw.push(...data);
      });

      const followingRaw = JSON.parse(followingText);

      const followers: IGUser[] = followersRaw
        .map(extractFollower)
        .filter((u: any): u is IGUser => Boolean(u));

      const following: IGUser[] = followingRaw.relationships_following
        .map(extractFollowing)
        .filter((u: any): u is IGUser => Boolean(u));

      const summaryData = generateSummary(followers, following);
      setSummary(summaryData);
      setNotFollowingBack(findNotFollowingBack(followers, following));
      setUnfollowedFollowers(findUnfollowedFollowers(followers, following));
    } catch (err) {
      setError('Error parsing files. Make sure they are valid Instagram export JSON files.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAnalyze = () => {
    // Mock data for demo
    const mockFollowers: IGUser[] = [
      { username: 'user1', href: 'https://instagram.com/user1' },
      { username: 'user2', href: 'https://instagram.com/user2' },
      { username: 'user3', href: 'https://instagram.com/user3' },
    ];

    const mockFollowing: IGUser[] = [
      { username: 'user1', href: 'https://instagram.com/user1' },
      { username: 'user4', href: 'https://instagram.com/user4' },
      { username: 'user5', href: 'https://instagram.com/user5' },
    ];

    const summaryData = generateSummary(mockFollowers, mockFollowing);
    setSummary(summaryData);
    setNotFollowingBack(findNotFollowingBack(mockFollowers, mockFollowing));
    setUnfollowedFollowers(findUnfollowedFollowers(mockFollowers, mockFollowing));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Instagram Follower Analysis</h1>
          <p className="text-xl text-gray-600 mb-8">Discover who's not following you back</p>
          
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Your Data</h2>
            <p className="text-gray-600 mb-6">
              Download your Instagram data from Settings → Account → Download your information, 
              then upload <code className="bg-gray-100 px-2 py-1 rounded">following.json</code> and all <code className="bg-gray-100 px-2 py-1 rounded">followers_*.json</code> files (followers_1.json, followers_2.json, etc.).
            </p>
            
            <label className="block mb-6">
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 hover:border-blue-600 transition-colors cursor-pointer bg-blue-50">
                <input
                  type="file"
                  multiple
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <p className="text-lg font-semibold text-gray-700">
                    {loading ? 'Processing...' : 'Click to upload or drag files'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">following.json + all followers_*.json files</p>
                </label>
              </div>
            </label>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleDemoAnalyze}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
            >
              Try Demo Data
            </button>
          </div>
        </div>

        {summary && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold">Total Followers</p>
                <p className="text-4xl font-bold text-blue-600">{summary.totalFollowers}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-semibold">Total Following</p>
                <p className="text-4xl font-bold text-green-600">{summary.totalFollowing}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
                <p className="text-gray-600 text-sm font-semibold">Not Following Back</p>
                <p className="text-4xl font-bold text-red-600">{summary.notFollowingBackCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-semibold">Mutual Follows</p>
                <p className="text-4xl font-bold text-purple-600">{summary.mutualFollows}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-6 py-2 font-semibold transition-colors ${
                    activeTab === 'summary'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('notFollowingBack')}
                  className={`px-6 py-2 font-semibold transition-colors ${
                    activeTab === 'notFollowingBack'
                      ? 'border-b-2 border-red-500 text-red-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Not Following Back ({notFollowingBack.length})
                </button>
                <button
                  onClick={() => setActiveTab('unfollowedFollowers')}
                  className={`px-6 py-2 font-semibold transition-colors ${
                    activeTab === 'unfollowedFollowers'
                      ? 'border-b-2 border-orange-500 text-orange-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Unfollowed Followers ({unfollowedFollowers.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis Summary</h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">
                      <span className="font-semibold">Total Followers:</span> {summary.totalFollowers}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Total Following:</span> {summary.totalFollowing}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Not Following Back:</span>{' '}
                      <span className="text-red-600 font-bold">{summary.notFollowingBackCount}</span>
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Unfollowed Followers:</span>{' '}
                      <span className="text-orange-600 font-bold">{summary.unfollowedFollowersCount}</span>
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Mutual Follows:</span>{' '}
                      <span className="text-green-600 font-bold">{summary.mutualFollows}</span>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'notFollowingBack' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Users You Follow Who Don't Follow Back ({notFollowingBack.length})
                  </h2>
                  {notFollowingBack.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {notFollowingBack.map((user) => (
                            <tr key={user.username} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                              <td className="px-6 py-4 text-sm">
                                <a
                                  href={user.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  Visit Profile →
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">Everyone you follow follows you back! 🎉</p>
                  )}
                </div>
              )}

              {activeTab === 'unfollowedFollowers' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Users Who Follow You That You Don't Follow Back ({unfollowedFollowers.length})
                  </h2>
                  {unfollowedFollowers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {unfollowedFollowers.map((user) => (
                            <tr key={user.username} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                              <td className="px-6 py-4 text-sm">
                                <a
                                  href={user.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  Visit Profile →
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">You follow everyone who follows you! 👏</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!summary && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600">Click "Analyze My Data" to get started</p>
          </div>
        )}
      </div>
    </main>
  );
}

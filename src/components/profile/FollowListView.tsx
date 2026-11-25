import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, UserCheck, UserPlus, Users, Sparkles, UserX } from "lucide-react";
import { useCirclyStore } from "../../store/useCirclyStore";
import { ConnectionTabType } from "../../types";

export const FollowListView: React.FC = () => {
	const {
		connectionsUserId,
		connectionsTab,
		setConnectionsTab,
		setCurrentView,
		getUserById,
		getFollowers,
		getFollowing,
		getMutuals,
		isUserFollowing,
		currentUserId,
		toggleFollow,
		users,
	} = useCirclyStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

	const targetUser = getUserById(connectionsUserId);
	const isSelf = connectionsUserId === currentUserId;

	const followersList = useMemo(
		() => getFollowers(connectionsUserId),
		[connectionsUserId, getFollowers, users],
	);
	const followingList = useMemo(
		() => getFollowing(connectionsUserId),
		[connectionsUserId, getFollowing, users],
	);
	const mutualsList = useMemo(
		() => getMutuals(connectionsUserId),
		[connectionsUserId, getMutuals, users],
	);

	// Current active list based on selected tab
	const activeRawList = useMemo(() => {
		switch (connectionsTab) {
			case "following":
				return followingList;
			case "mutuals":
				return mutualsList;
			case "followers":
			default:
				return followersList;
		}
	}, [connectionsTab, followersList, followingList, mutualsList]);

	// Filter list by search query (name, username, bio)
	const filteredList = useMemo(() => {
		if (!searchQuery.trim()) return activeRawList;
		const q = searchQuery.toLowerCase().trim();
		return activeRawList.filter(
			(u) =>
				u.fullName.toLowerCase().includes(q) ||
				u.username.toLowerCase().includes(q) ||
				(u.bio && u.bio.toLowerCase().includes(q)),
		);
	}, [activeRawList, searchQuery]);

	const tabs: { id: ConnectionTabType; label: string; count: number }[] = [
		{ id: "followers", label: "Followers", count: followersList.length },
		{ id: "following", label: "Following", count: followingList.length },
		{ id: "mutuals", label: "Mutual Circle", count: mutualsList.length },
	];

	return (
		<div className="w-full min-h-full pb-16">
			{/* Top sticky navigation bar */}
			<div className="px-4 py-3 border-b border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0B110F]/95 backdrop-glass z-20 transition-colors">
				<div className="flex items-center gap-3 min-w-0">
					<button
						onClick={() => setCurrentView("profile", { profileUserId: connectionsUserId })}
						className="p-1.5 -ml-1.5 rounded-lg text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-500/10 transition-colors cursor-pointer"
						title="Back to profile"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>

					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h1 className="text-base font-bold text-[#0B1612] dark:text-[#F2FBF7] truncate">
								{targetUser.fullName}
							</h1>
							{targetUser.badge && (
								<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
									{targetUser.badge}
								</span>
							)}
						</div>
						<p className="text-xs text-[#6E8B7F] dark:text-[#8BA49B]">
							@{targetUser.username} · Network
						</p>
					</div>
				</div>

				{/* Small avatar shortcut */}
				<button
					onClick={() => setCurrentView("profile", { profileUserId: connectionsUserId })}
					className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
				>
					<img
						src={targetUser.avatar}
						alt={targetUser.fullName}
						className="w-5 h-5 rounded-full object-cover"
					/>
					<span className="hidden sm:inline">Profile</span>
				</button>
			</div>

			{/* Tabs navigation */}
			<div className="flex border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#0B110F] sticky top-14.25 z-10">
				{tabs.map((tab) => {
					const isActive = connectionsTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setConnectionsTab(tab.id)}
							className={`relative flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
								isActive
									? "text-emerald-600 dark:text-emerald-400"
									: "text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#CBDDD5]"
							}`}
						>
							<span>{tab.label}</span>
							<span
								className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold transition-colors ${
									isActive
										? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
										: "bg-[#E2ECE7]/60 dark:bg-[#16221E] text-[#6E8B7F] dark:text-[#5B756C]"
								}`}
							>
								{tab.count}
							</span>
							{isActive && (
								<motion.div
									layoutId="connectionsTabUnderline"
									className="absolute bottom-0 left-6 right-6 h-0.5 bg-linear-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300 rounded-full"
									transition={{ type: "spring", stiffness: 500, damping: 35 }}
								/>
							)}
						</button>
					);
				})}
			</div>

			{/* Search Bar inside connections */}
			<div className="p-4 border-b border-[#E2ECE7] dark:border-[#1F2E29]/70 bg-[#F4F8F6]/60 dark:bg-[#0B110F]/60">
				<div className="relative flex items-center">
					<Search className="w-4 h-4 text-[#6E8B7F] dark:text-[#8BA49B] absolute left-3.5 pointer-events-none" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={`Search in ${targetUser.fullName.split(" ")[0]}'s ${connectionsTab}...`}
						className="w-full bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] hover:border-emerald-500/30 focus:border-emerald-500/50 text-xs text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#6E8B7F] dark:placeholder-[#5B756C] pl-9.5 pr-10 py-2.5 rounded-xl focus:outline-none transition-colors"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 text-xs text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] cursor-pointer"
						>
							Clear
						</button>
					)}
				</div>
			</div>

			{/* List Feed */}
			<div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
				<AnimatePresence mode="wait">
					{filteredList.length === 0 ? (
						<motion.div
							key="empty"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="py-16 px-6 text-center"
						>
							<div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
								<Users className="w-6 h-6" />
							</div>

							<h3 className="text-sm font-bold text-[#0B1612] dark:text-[#F2FBF7]">
								{searchQuery.trim()
									? `No matching ${connectionsTab} found`
									: connectionsTab === "followers"
										? `${isSelf ? "You have" : `${targetUser.fullName} has`} no followers yet`
										: connectionsTab === "following"
											? `${isSelf ? "You are" : `${targetUser.fullName} is`} not following anyone yet`
											: `No mutual circle connections found`}
							</h3>

							<p className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] mt-1 max-w-sm mx-auto">
								{searchQuery.trim()
									? `Try checking for typos or searching by username @handle instead.`
									: connectionsTab === "mutuals"
										? `Mutuals appear when two members follow each other's circles.`
										: `Connect with inspiring developers, designers, and founders across Circly.`}
							</p>

							{searchQuery.trim() ? (
								<button
									onClick={() => setSearchQuery("")}
									className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors cursor-pointer"
								>
									Clear search filter
								</button>
							) : (
								<button
									onClick={() => setCurrentView("explore")}
									className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-white dark:text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
								>
									Explore Community
								</button>
							)}
						</motion.div>
					) : (
						<motion.div
							key={connectionsTab}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.15 }}
							className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60"
						>
							{filteredList.map((user) => {
								const isItemSelf = user.id === currentUserId;
								const followsMe = isUserFollowing(user.id, currentUserId);
								const iFollowThem = isUserFollowing(currentUserId, user.id);
								const isHovered = hoveredUserId === user.id;

								return (
									<div
										key={user.id}
										className="p-4 hover:bg-emerald-50/40 dark:hover:bg-[#121A17]/60 transition-colors flex items-start justify-between gap-3 group"
									>
										{/* User Info Container */}
										<div
											onClick={() => setCurrentView("profile", { profileUserId: user.id })}
											className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
										>
											<div className="relative shrink-0 pt-0.5">
												<img
													src={user.avatar}
													alt={user.fullName}
													className="w-11 h-11 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29] group-hover:ring-emerald-400/60 transition-all"
												/>
												{followsMe && !isItemSelf && (
													<span
														title="Follows you"
														className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white dark:text-black flex items-center justify-center text-[9px] font-black ring-2 ring-white dark:ring-[#0B110F]"
													>
														✓
													</span>
												)}
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-1.5">
													<span className="font-bold text-sm text-[#0B1612] dark:text-[#F2FBF7] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors truncate">
														{user.fullName}
													</span>
													{user.badge && (
														<span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
															{user.badge}
														</span>
													)}
													{followsMe && !isItemSelf && (
														<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#E2ECE7] dark:bg-[#1A2622] text-[#476357] dark:text-[#8BA49B] font-medium">
															Follows you
														</span>
													)}
												</div>

												<p className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] mt-0.5">
													@{user.username}
												</p>

												{/* Bio snippet */}
												{user.bio && (
													<p className="text-xs text-[#1F3029] dark:text-[#CBDDD5] mt-1.5 line-clamp-2 leading-relaxed">
														{user.bio}
													</p>
												)}

												{/* Follower stats preview */}
												<div className="flex items-center gap-3 mt-2 text-[11px] text-[#6E8B7F] dark:text-[#5B756C]">
													<span>
														<b className="text-[#0B1612] dark:text-[#F2FBF7]">
															{user.followersCount.toLocaleString()}
														</b>{" "}
														followers
													</span>
													<span>•</span>
													<span>
														<b className="text-[#0B1612] dark:text-[#F2FBF7]">
															{user.followingCount.toLocaleString()}
														</b>{" "}
														following
													</span>
												</div>
											</div>
										</div>

										{/* Action Button */}
										<div className="shrink-0 pt-1">
											{isItemSelf ? (
												<span className="px-3 py-1.5 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] bg-[#F4F8F6] dark:bg-[#121A17] text-[11px] font-semibold text-[#476357] dark:text-[#8BA49B] select-none">
													You
												</span>
											) : (
												<button
													onClick={() => toggleFollow(user.id)}
													onMouseEnter={() => setHoveredUserId(user.id)}
													onMouseLeave={() => setHoveredUserId(null)}
													className={`min-w-23.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
														iFollowThem
															? isHovered
																? "border border-rose-500/40 bg-rose-500/10 text-rose-500 dark:text-rose-400"
																: "border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] text-[#0B1612] dark:text-[#F2FBF7]"
															: "bg-emerald-500 text-white dark:text-black hover:bg-emerald-400"
													}`}
												>
													{iFollowThem ? (
														isHovered ? (
															<>
																<UserX className="w-3.5 h-3.5" />
																<span>Unfollow</span>
															</>
														) : (
															<>
																<UserCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
																<span>Following</span>
															</>
														)
													) : (
														<>
															<UserPlus className="w-3.5 h-3.5" />
															<span>{followsMe ? "Follow back" : "Follow"}</span>
														</>
													)}
												</button>
											)}
										</div>
									</div>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Circle Network Discovery Banner at bottom */}
			{filteredList.length > 0 && (
				<div className="p-4 m-4 rounded-xl bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
							<Sparkles className="w-5 h-5" />
						</div>
						<div>
							<p className="text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7]">
								Grow Your Circly Network
							</p>
							<p className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B]">
								Discover more creators sharing ideas in design, dev, and tech.
							</p>
						</div>
					</div>

					<button
						onClick={() => setCurrentView("explore")}
						className="shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] hover:border-emerald-500/40 text-xs font-semibold text-[#0B1612] dark:text-[#F2FBF7] transition-colors cursor-pointer"
					>
						Explore
					</button>
				</div>
			)}
		</div>
	);
};

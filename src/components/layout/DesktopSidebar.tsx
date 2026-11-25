import React, { useState } from "react";
import {
	Home,
	Search,
	Heart,
	Bookmark,
	User,
	Plus,
	Moon,
	Sun,
	ChevronDown,
	UserCheck,
	RotateCcw,
	Users,
} from "lucide-react";
import { useCirclyStore } from "../../store/useCirclyStore";
import { ViewType } from "../../types";

interface NavItem {
	id: ViewType;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	badge?: number;
	payload?: { profileUserId?: string };
}

export const DesktopSidebar: React.FC = () => {
	const {
		currentView,
		setCurrentView,
		openFollowList,
		openComposer,
		theme,
		setTheme,
		getCurrentUser,
		users,
		currentUserId,
		switchUser,
		resetToDefaultData,
		activities,
	} = useCirclyStore();

	const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
	const currentUser = getCurrentUser();

	const unreadActivityCount = activities.length;

	const navItems: NavItem[] = [
		{ id: "feed", icon: Home, label: "Home" },
		{ id: "explore", icon: Search, label: "Explore" },
		{ id: "activity", icon: Heart, label: "Activity", badge: unreadActivityCount },
		{ id: "bookmarks", icon: Bookmark, label: "Saved" },
		{ id: "profile", icon: User, label: "Profile", payload: { profileUserId: currentUserId } },
	];

	return (
		<aside className="hidden md:flex flex-col justify-between w-64 xl:w-72 2xl:w-80 shrink-0 h-full py-6 px-3 xl:px-5 select-none border-r border-[#E2ECE7] dark:border-[#1F2E29]/60 bg-[#F4F8F6]/80 dark:bg-[#0B110F]/40 overflow-y-auto transition-colors">
			{/* Top Section: Brand & Nav Links */}
			<div className="space-y-6">
				{/* Brand Logo */}
				<div
					onClick={() => setCurrentView("feed")}
					className="flex items-center gap-3 px-3 py-1 cursor-pointer select-none"
				>
					<div className="relative w-10 h-10 rounded-xl border-2 border-emerald-500/80 dark:border-emerald-400/80 flex items-center justify-center bg-white dark:bg-[#121A17]">
						<div className="w-4 h-4 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300" />
						<div className="absolute inset-0 rounded-xl bg-emerald-500/20 dark:bg-emerald-400/20 blur-sm -z-10" />
					</div>
					<div>
						<span className="font-extrabold text-2xl tracking-tight text-[#0B1612] dark:text-[#F2FBF7] flex items-center">
							circly<span className="text-emerald-500 dark:text-emerald-400">.</span>
						</span>
						<p className="text-[10px] text-[#6E8B7F] dark:text-[#5B756C] font-semibold tracking-wider uppercase">
							Social In Circles
						</p>
					</div>
				</div>

				{/* Navigation Items */}
				<nav className="space-y-1.5">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;
						return (
							<button
								key={item.id}
								onClick={() => setCurrentView(item.id, item.payload || {})}
								className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-base border transition-colors group cursor-pointer ${
									isActive
										? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
										: "border-transparent text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-500/10 dark:hover:bg-[#121A17]/80"
								}`}
							>
								<div className="flex items-center gap-3.5">
									<div
										className={`p-1 rounded-lg transition-colors ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-[#6E8B7F] dark:text-[#8BA49B] group-hover:text-emerald-500 dark:group-hover:text-emerald-300"}`}
									>
										<Icon className="w-5 h-5 stroke-2 shrink-0" />
									</div>
									<span className="tracking-wide text-sm xl:text-base">{item.label}</span>
								</div>

								{item.badge && item.badge > 0 ? (
									<span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-white dark:text-black">
										{item.badge}
									</span>
								) : null}
							</button>
						);
					})}
				</nav>

				{/* Primary Call to Action Button */}
				<div className="pt-2">
					<button
						onClick={() => openComposer()}
						className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-sm xl:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] group cursor-pointer"
					>
						<Plus className="w-5 h-5 stroke-3 group-hover:rotate-90 transition-transform duration-200" />
						<span>New Loop</span>
						<span className="hidden xl:inline-block ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-black/15 text-black/80 font-bold">
							N
						</span>
					</button>
				</div>
			</div>

			{/* Bottom Section: Persona Switcher & Controls */}
			<div className="relative pt-4 border-t border-[#E2ECE7] dark:border-[#1F2E29]/60 space-y-2">
				{/* Persona Switcher Popover Menu */}
				{isPersonaMenuOpen && (
					<div
						className="absolute bottom-full mb-3 left-0 w-full rounded-xl bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] p-2 z-50 backdrop-glass animate-in fade-in slide-in-from-bottom-2 duration-150"
						onMouseLeave={() => setIsPersonaMenuOpen(false)}
					>
						<div className="px-3 py-2 border-b border-[#E2ECE7] dark:border-[#1F2E29]/70 mb-1 flex items-center justify-between">
							<div>
								<p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
									Switch Persona
								</p>
								<p className="text-[10px] text-[#6E8B7F] dark:text-[#8BA49B]">
									Test as another user
								</p>
							</div>
							<Users className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
						</div>

						<div className="space-y-1 max-h-48 overflow-y-auto">
							{users.map((u) => {
								const isSelected = u.id === currentUser.id;
								return (
									<button
										key={u.id}
										onClick={() => {
											switchUser(u.id);
											setIsPersonaMenuOpen(false);
										}}
										className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
											isSelected
												? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold"
												: "hover:bg-emerald-50 dark:hover:bg-[#16221E] text-[#0B1612] dark:text-[#F2FBF7]"
										}`}
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<img
												src={u.avatar}
												alt={u.fullName}
												className="w-7 h-7 rounded-full object-cover shrink-0"
											/>
											<div className="min-w-0">
												<p className="text-xs font-semibold leading-tight truncate">{u.fullName}</p>
												<p className="text-[10px] text-[#6E8B7F] dark:text-[#8BA49B] truncate">
													@{u.username}
												</p>
											</div>
										</div>
										{isSelected && (
											<UserCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 ml-1" />
										)}
									</button>
								);
							})}
						</div>

						<div className="pt-2 mt-1 border-t border-[#E2ECE7] dark:border-[#1F2E29]/70 flex items-center justify-between px-2">
							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										setCurrentView("profile", { profileUserId: currentUser.id });
										setIsPersonaMenuOpen(false);
									}}
									className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
								>
									Profile
								</button>
								<span className="text-[#6E8B7F] dark:text-[#5B756C] text-[10px]">•</span>
								<button
									onClick={() => {
										openFollowList(currentUser.id, 'followers');
										setIsPersonaMenuOpen(false);
									}}
									className="text-xs text-[#476357] dark:text-[#8BA49B] hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline font-medium cursor-pointer"
								>
									Network
								</button>
							</div>
							<button
								onClick={() => {
									resetToDefaultData();
									setIsPersonaMenuOpen(false);
								}}
								className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B] hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
								title="Reset mock data to default"
							>
								<RotateCcw className="w-3 h-3" />
								Reset Data
							</button>
						</div>
					</div>
				)}

				{/* Current Persona Card Button */}
				<button
					onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
					className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/90 dark:bg-[#121A17]/80 border border-[#E2ECE7] dark:border-[#1F2E29] hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-[#16221E] transition-all group cursor-pointer"
				>
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="relative shrink-0">
							<img
								src={currentUser.avatar}
								alt={currentUser.fullName}
								className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-400/50"
							/>
							<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 ring-2 ring-white dark:ring-[#0B110F]" />
						</div>
						<div className="text-left min-w-0">
							<p className="text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
								{currentUser.fullName}
							</p>
							<p className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B] truncate">
								@{currentUser.username}
							</p>
						</div>
					</div>
					<ChevronDown
						className={`w-4 h-4 text-[#6E8B7F] dark:text-[#8BA49B] transition-transform duration-200 ${isPersonaMenuOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{/* Utility Toolbar (Theme) */}
				<div className="flex items-center justify-end gap-2 pt-1">
					<button
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] transition-colors cursor-pointer text-xs font-medium"
						title="Toggle theme"
					>
						{theme === "dark" ? (
							<>
								<Sun className="w-4 h-4 text-amber-400" />
								<span className="text-[11px]">Light Mode</span>
							</>
						) : (
							<>
								<Moon className="w-4 h-4 text-slate-700" />
								<span className="text-[11px]">Dark Mode</span>
							</>
						)}
					</button>
				</div>
			</div>
		</aside>
	);
};

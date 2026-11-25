import React, { useState } from "react";
import {
	Plus,
	Moon,
	Sun,
	Home,
	Search,
	Heart,
	Bookmark,
	ChevronDown,
	UserCheck,
	RotateCcw,
} from "lucide-react";
import { useCirclyStore } from "../../store/useCirclyStore";
import { ViewType } from "../../types";

interface NavItem {
	id: ViewType;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
}

export const Header: React.FC = () => {
	const {
		theme,
		setTheme,
		currentView,
		setCurrentView,
		openComposer,
		getCurrentUser,
		users,
		switchUser,
		resetToDefaultData,
	} = useCirclyStore();

	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const currentUser = getCurrentUser();

	const navItems: NavItem[] = [
		{ id: "feed", icon: Home, label: "Home" },
		{ id: "explore", icon: Search, label: "Explore" },
		{ id: "activity", icon: Heart, label: "Activity" },
		{ id: "bookmarks", icon: Bookmark, label: "Saved" },
	];

	return (
		<header className="md:hidden sticky top-0 z-40 w-full backdrop-glass border-b border-[#E2ECE7] dark:border-[#1F2E29]/80 bg-white/90 dark:bg-[#0B110F]/90 transition-colors shrink-0">
			<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
				{/* Brand Logo */}
				<div
					onClick={() => setCurrentView("feed")}
					className="flex items-center gap-2.5 cursor-pointer select-none"
				>
					<div className="relative w-8 h-8 rounded-full border-2 border-emerald-500/80 dark:border-emerald-400/80 flex items-center justify-center">
						<div className="w-3.5 h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
						<div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 blur-[6px] -z-10" />
					</div>
					<span className="font-extrabold text-xl tracking-tight text-[#0B1612] dark:text-[#F2FBF7]">
						circly<span className="text-emerald-500 dark:text-emerald-400">.</span>
					</span>
				</div>

				{/* Center Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-1 bg-[#EEF7F3] dark:bg-[#121A17]/70 p-1 rounded-2xl border border-[#E2ECE7] dark:border-[#1F2E29]">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentView === item.id;
						return (
							<button
								key={item.id}
								onClick={() => setCurrentView(item.id)}
								className={`relative px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium cursor-pointer ${
									isActive
										? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
										: "text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E]"
								}`}
							>
								<Icon className={`w-4 h-4 ${isActive ? "stroke-2.5" : ""}`} />
								<span>{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Right Actions */}
				<div className="flex items-center gap-2.5">
					{/* Write Loop Button */}
					<button
						onClick={() => openComposer()}
						className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-black font-semibold text-xs transition-all active:scale-95 cursor-pointer"
					>
						<Plus className="w-3.5 h-3.5 stroke-3" />
						<span className="hidden sm:inline">New Loop</span>
					</button>

					{/* Theme Toggle */}
					<button
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="p-2 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] transition-colors cursor-pointer"
						title="Toggle Theme"
					>
						{theme === "dark" ? (
							<Sun className="w-4 h-4 text-amber-400" />
						) : (
							<Moon className="w-4 h-4 text-slate-700" />
						)}
					</button>

					{/* User Persona Switcher */}
					<div className="relative">
						<button
							onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
							className="flex items-center gap-1.5 p-1 pr-2 rounded-xl border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] hover:border-emerald-500/50 transition-all cursor-pointer"
						>
							<img
								src={currentUser.avatar}
								alt={currentUser.fullName}
								className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-400/40"
							/>
							<ChevronDown className="w-3 h-3 text-[#6E8B7F] dark:text-[#8BA49B]" />
						</button>

						{/* User Dropdown Menu */}
						{isUserMenuOpen && (
							<div
								className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] p-2 z-50 backdrop-glass"
								onMouseLeave={() => setIsUserMenuOpen(false)}
							>
								<div className="px-3 py-2 border-b border-[#E2ECE7] dark:border-[#1F2E29]/70 mb-1">
									<p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
										Switch Persona
									</p>
									<p className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B]">
										Test interactions as different users
									</p>
								</div>

								<div className="space-y-1">
									{users.map((u) => {
										const isSelected = u.id === currentUser.id;
										return (
											<button
												key={u.id}
												onClick={() => {
													switchUser(u.id);
													setIsUserMenuOpen(false);
												}}
												className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
													isSelected
														? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold"
														: "hover:bg-emerald-50 dark:hover:bg-[#16221E] text-[#0B1612] dark:text-[#F2FBF7]"
												}`}
											>
												<div className="flex items-center gap-2.5">
													<img
														src={u.avatar}
														alt={u.fullName}
														className="w-6 h-6 rounded-full object-cover"
													/>
													<div>
														<p className="text-xs font-semibold leading-tight">{u.fullName}</p>
														<p className="text-[10px] text-[#6E8B7F] dark:text-[#8BA49B]">
															@{u.username}
														</p>
													</div>
												</div>
												{isSelected && (
													<UserCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
												)}
											</button>
										);
									})}
								</div>

								<div className="pt-2 mt-1 border-t border-[#E2ECE7] dark:border-[#1F2E29]/70 flex items-center justify-between px-2">
									<button
										onClick={() => {
											setCurrentView("profile", { profileUserId: currentUser.id });
											setIsUserMenuOpen(false);
										}}
										className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
									>
										View My Profile
									</button>
									<button
										onClick={() => {
											resetToDefaultData();
											setIsUserMenuOpen(false);
										}}
										className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B] hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
										title="Reset to default mock data"
									>
										<RotateCcw className="w-3 h-3" />
										Reset
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

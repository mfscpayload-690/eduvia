"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Users,
    BookOpen,
    Calendar,
    UserCheck,
    Clock,
    ArrowUpRight,
    BarChart3,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminStats {
    totalUsers: number;
    students: number;
    admins: number;
    totalNotes: number;
    totalEvents: number;
    pendingRequests: number;
    recentSignups: number;
}

export default function AdminOverviewPage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const SUPER_ADMIN_EMAIL = "techiez690@gmail.com";
    const isSuperAdmin = session?.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    useEffect(() => {
        async function fetchStats() {
            if (!isSuperAdmin) return;

            try {
                const res = await fetch("/api/admin/stats");
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to load stats");
                setStats(json.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchStats();
        }
    }, [status, isSuperAdmin]);

    if (status === "loading") {
        return <div className="p-8 text-center text-neutral-500">Authenticating...</div>;
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    This dashboard is reserved for the Super Admin only. Admins and Faculty do not have permission to view internal analytics.
                </p>
                <Link href="/dashboard" className="mt-6">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400">
                        System Overview
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Real-time analytics and platform health for Eduvia.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        <Clock className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            {error ? (
                <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="p-6 flex items-center gap-4 text-red-600">
                        <AlertCircle className="w-6 h-6" />
                        <p className="font-medium">{error}</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Users"
                            value={stats?.totalUsers}
                            icon={<Users className="w-5 h-5" />}
                            description={`${stats?.recentSignups || 0} new this week`}
                            loading={loading}
                            trend="+12%"
                        />
                        <StatCard
                            title="Faculty Members"
                            value={stats?.admins}
                            icon={<UserCheck className="w-5 h-5" />}
                            description="Verified accounts"
                            loading={loading}
                            color="blue"
                        />
                        <StatCard
                            title="Study Notes"
                            value={stats?.totalNotes}
                            icon={<BookOpen className="w-5 h-5" />}
                            description="Resources shared"
                            loading={loading}
                            color="purple"
                        />
                        <StatCard
                            title="Active Events"
                            value={stats?.totalEvents}
                            icon={<Calendar className="w-5 h-5" />}
                            description="Upcoming schedule"
                            loading={loading}
                            color="amber"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions & Urgent */}
                        <Card className="lg:col-span-1 glass-card overflow-hidden">
                            <CardHeader className="bg-neutral-50/50 dark:bg-white/5 border-b border-border/50">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-brand-500" />
                                    Attention Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {stats?.pendingRequests ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            There are <span className="font-bold text-brand-500">{stats.pendingRequests}</span> new faculty access requests waiting for approval.
                                        </p>
                                        <Link href="/admin/faculty-requests">
                                            <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20">
                                                Review Requests <ArrowUpRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <ShieldCheck className="w-12 h-12 text-green-500/20 mx-auto mb-2" />
                                        <p className="text-sm text-neutral-500">All systems clear. No pending actions.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Growth Chart Placeholder */}
                        <Card className="lg:col-span-2 glass-card">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-brand-500" />
                                    Growth Trajectory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[200px] w-full flex items-end justify-between px-8 pb-4">
                                    {[40, 60, 45, 70, 85, 65, 95].map((h, i) => (
                                        <div key={i} className="w-8 rounded-t-lg bg-gradient-to-t from-brand-500/20 to-brand-500 transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between px-8 py-2 text-[10px] text-neutral-500 border-t border-border/50 bg-neutral-50/50 dark:bg-white/5">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, description, loading, trend, color = "brand" }: any) {
    const colors: any = {
        brand: "text-brand-600 bg-brand-50 dark:bg-brand-500/10",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    };

    return (
        <Card className="glass-card overflow-hidden hover:border-brand-500/30 transition-all group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
                <div className="mt-4 space-y-1">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{title}</p>
                    {loading ? (
                        <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                    ) : (
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{value?.toLocaleString() || 0}</h3>
                    )}
                    <p className="text-[10px] text-neutral-400">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

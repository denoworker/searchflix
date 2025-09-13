import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDetailedUserStats, getRecentUserActivity, type User } from "@/lib/database";
import { 
  Users, 
  UserPlus, 
  Activity, 
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = 'nodejs';

export default async function AdminOverview() {
  // Get detailed statistics
  let stats;
  try {
    console.log("Fetching admin overview stats...");
    stats = await getDetailedUserStats();
    console.log("Admin stats fetched:", stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    stats = {
      totalUsers: 0,
      activeToday: 0,
      activeThisWeek: 0,
      activeThisMonth: 0,
      newToday: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      dailySignups: []
    };
  }

  // Get recent user activity
  let recentUsers: User[];
  try {
    recentUsers = await getRecentUserActivity(5);
  } catch (error) {
    console.error("Error fetching recent users:", error);
    recentUsers = [];
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRecentLogin = (lastLogin: Date) => {
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const overviewStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newThisMonth} this month`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Today",
      value: stats.activeToday.toLocaleString(),
      change: `${stats.activeThisWeek} this week`,
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "New Today",
      value: stats.newToday.toLocaleString(),
      change: `${stats.newThisWeek} this week`,
      icon: UserPlus,
      color: "text-purple-600"
    },
    {
      title: "Monthly Active",
      value: stats.activeThisMonth.toLocaleString(),
      change: "Active this month",
      icon: Calendar,
      color: "text-orange-600"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Quick overview of system status and key metrics.
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleString()} | Total Users: {stats.totalUsers}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.color}>{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Jump to key admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="w-full justify-between">
                <span>Full Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between">
                <span>User Management</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-between">
                <span>Analytics</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/sitemap">
              <Button variant="outline" className="w-full justify-between">
                <span>Sitemap Management</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest user activity summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image_url || ""} alt={user.name || ""} />
                        <AvatarFallback className="text-xs">
                          {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{user.name || "No name"}</p>
                          {isRecentLogin(user.last_login) && (
                            <Badge variant="secondary" className="text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.last_login)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      View Full Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Current system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-lg font-bold text-green-600">Online</div>
              <div className="text-xs text-muted-foreground">System Status</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{stats.activeToday}</div>
              <div className="text-xs text-muted-foreground">Active Today</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {stats.totalUsers > 0 ? Math.round((stats.activeThisMonth / stats.totalUsers) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Engagement Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

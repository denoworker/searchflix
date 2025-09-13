import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDetailedUserStats, getRecentUserActivity, type User } from "@/lib/database";
import { 
  Users, 
  UserPlus, 
  Activity, 
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  Shield,
  Globe,
  MessageSquare,
  Settings,
  Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const runtime = 'nodejs';

export default async function AdminDashboardPage() {
  // Get detailed statistics
  let stats;
  try {
    console.log("Fetching admin dashboard stats...");
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
    recentUsers = await getRecentUserActivity(10);
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
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Active Today",
      value: stats.activeToday.toLocaleString(),
      change: `${stats.activeThisWeek} this week`,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "New Today",
      value: stats.newToday.toLocaleString(),
      change: `${stats.newThisWeek} this week`,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Monthly Active",
      value: stats.activeThisMonth.toLocaleString(),
      change: "Active this month",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      href: "/admin/users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      title: "Sitemap",
      description: "Manage sitemap entries",
      href: "/admin/sitemap",
      icon: Globe,
      color: "text-purple-600"
    },
    {
      title: "AI Chat",
      description: "Admin AI assistant",
      href: "/admin/chat",
      icon: MessageSquare,
      color: "text-orange-600"
    },
    {
      title: "Settings",
      description: "System configuration",
      href: "/admin/settings",
      icon: Settings,
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of system performance and user activity (Real-time data from database).
        </p>
        {/* Debug info to verify real data */}
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleString()} | Total Users: {stats.totalUsers} | Data Source: PostgreSQL Database
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Access key admin functions quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 justify-start hover:bg-muted transition-colors w-full"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent User Activity and Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent User Activity</span>
            </CardTitle>
            <CardDescription>
              Latest user logins and registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
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
                          {user.role === 'admin' && (
                            <Badge variant="default" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.last_login)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentUsers.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/admin/users">
                      <Button variant="outline" size="sm">
                        View All Users
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Growth Metrics</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <span className="text-sm font-medium">Users Today</span>
                <span className="text-lg font-bold text-green-600">+{stats.newToday}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                <span className="text-sm font-medium">Users This Week</span>
                <span className="text-lg font-bold text-blue-600">+{stats.newThisWeek}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                <span className="text-sm font-medium">Users This Month</span>
                <span className="text-lg font-bold text-purple-600">+{stats.newThisMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                <span className="text-sm font-medium">Active Rate</span>
                <span className="text-lg font-bold text-orange-600">
                  {stats.totalUsers > 0 ? Math.round((stats.activeThisMonth / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
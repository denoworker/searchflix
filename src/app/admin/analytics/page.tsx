import { requireAdminAccess } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData, getGrowthMetrics } from "@/lib/database";
import { getSimpleAnalytics, getSimpleGrowthMetrics } from "@/lib/simple-analytics";
import { AnalyticsClient } from "@/components/admin/analytics-client";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Crown,
  Zap,
  Target,
  Repeat
} from "lucide-react";

export const runtime = 'nodejs';

export default async function AnalyticsPage() {
  // This will redirect non-admin users
  await requireAdminAccess();

  // Get analytics data
  let analyticsData;
  let growthMetrics;

  try {
    console.log("Starting analytics data fetch...");
    // Use simple analytics first to avoid SQL errors
    analyticsData = await getSimpleAnalytics();
    console.log("Simple analytics data fetched successfully");

    growthMetrics = await getSimpleGrowthMetrics();
    console.log("Simple growth metrics fetched successfully");
  } catch (error) {
    console.error("Error fetching analytics:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading analytics data</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <p className="text-red-600 text-xs mt-2">
            Check the server logs for more details.
          </p>
        </div>
      </div>
    );
  }

  // Calculate key metrics
  const totalRevenue = analyticsData.revenue.total;
  const totalUsers = analyticsData.users.total;
  const proUsers = analyticsData.revenue.proUsers;
  const freeUsers = totalUsers - proUsers;
  const conversionRate = growthMetrics.conversionRate;
  const growthRate = growthMetrics.growthRate;

  const keyMetrics = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${analyticsData.revenue.monthlyRevenue.length > 1 ? 
        ((analyticsData.revenue.monthlyRevenue[0]?.revenue || 0) - 
         (analyticsData.revenue.monthlyRevenue[1]?.revenue || 0)) : 0} this month`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: `+${growthMetrics.currentMonth} this month`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Pro Users",
      value: proUsers.toLocaleString(),
      change: `${conversionRate.toFixed(1)}% conversion rate`,
      icon: Crown,
      color: "text-yellow-600"
    },
    {
      title: "Growth Rate",
      value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      change: "Month over month",
      icon: TrendingUp,
      color: growthRate > 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your application's performance and growth (Real-time data).
        </p>
        {/* Debug info to verify real data */}
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleString()} | Total Users: {totalUsers} | Pro Users: {proUsers} | Revenue: ${totalRevenue} | Data Source: Live PostgreSQL Database
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.credits.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {analyticsData.credits.average.toFixed(0)} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Repeat className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthMetrics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly retention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <AnalyticsClient 
        analyticsData={analyticsData}
        growthMetrics={growthMetrics}
      />
    </div>
  );
}

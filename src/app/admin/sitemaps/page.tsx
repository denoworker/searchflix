import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllSitemaps, getSitemapStats } from "@/lib/database";
import { SitemapManagementClient } from "@/components/admin/sitemap-management-client";
import { Globe, Plus, Activity, AlertCircle } from "lucide-react";

export const runtime = 'nodejs';

export default async function AdminSitemapsPage() {
  // Get all sitemaps and stats from database
  let sitemaps: any[] = [];
  let stats: any = {};
  let error: string | null = null;

  try {
    [sitemaps, stats] = await Promise.all([
      getAllSitemaps(),
      getSitemapStats()
    ]);
  } catch (err) {
    console.error("Error fetching sitemaps:", err);
    error = err instanceof Error ? err.message : 'Unknown error occurred';
    sitemaps = [];
    stats = {
      total_sitemaps: 0,
      active_sitemaps: 0,
      inactive_sitemaps: 0,
      pending_sitemaps: 0,
      created_today: 0
    };
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sitemap Management</h1>
          <p className="text-muted-foreground">
            Manage website sitemaps for SEO and indexing.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error Loading Sitemaps
            </CardTitle>
            <CardDescription>
              There was an error loading the sitemap data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Database Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Please check the server logs and database connection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats cards data
  const statsCards = [
    {
      title: "Total Sitemaps",
      value: stats.total_sitemaps || 0,
      icon: Globe,
      color: "text-blue-600"
    },
    {
      title: "Active Sitemaps",
      value: stats.active_sitemaps || 0,
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Inactive Sitemaps",
      value: stats.inactive_sitemaps || 0,
      icon: AlertCircle,
      color: "text-red-600"
    },
    {
      title: "Created Today",
      value: stats.created_today || 0,
      icon: Plus,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sitemap Management</h1>
        <p className="text-muted-foreground">
          Manage website sitemaps for SEO and indexing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sitemap Management */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Management</CardTitle>
          <CardDescription>
            Add new sitemaps and manage existing ones. Sitemaps help search engines index your websites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SitemapManagementClient initialSitemaps={sitemaps} initialStats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
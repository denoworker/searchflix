import { getAllSitemaps, getSitemapStats } from "@/lib/database";
import { SitemapManagementClient } from "@/components/admin/sitemap-management-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const runtime = 'nodejs';

export default async function AdminSitemapPage() {
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
              <p className="text-red-600 text-sm mt-2">
                Please check your database connection and ensure the sitemaps table exists.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sitemap Management</h1>
        <p className="text-muted-foreground">
          Manage website sitemaps for SEO and indexing.
        </p>
      </div>

      <SitemapManagementClient 
        initialSitemaps={sitemaps} 
        initialStats={stats} 
      />
    </div>
  );
}
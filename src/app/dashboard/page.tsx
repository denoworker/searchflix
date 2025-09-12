import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserCredits } from "@/lib/database";
import Link from "next/link";

export const runtime = 'nodejs';
import {
  CreditCard,
  DollarSign,
  Settings,
  MessageSquare,
  User
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  // Get user's credits
  let userCredits = 0;
  try {
    userCredits = await getUserCredits(user?.id || '');
  } catch (error) {
    console.error("Error fetching user credits:", error);
  }

  // User stats
  const userStats = [
    {
      title: "Your Credits",
      value: userCredits.toLocaleString(),
      change: "Available for AI chat",
      icon: DollarSign,
    },
    {
      title: "AI Chat",
      value: "Ready",
      change: "Start chatting now",
      icon: MessageSquare,
    },
    {
      title: "Profile",
      value: "Complete",
      change: "Manage your account",
      icon: User,
    },
    {
      title: "Settings",
      value: "Customize",
      change: "Personalize your experience",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Ready to start chatting with AI? Check your credits and explore the features below.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/dashboard/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Chat
            </Link>
          </Button>
          <Button variant="outline" asChild>
             <Link href="/dashboard/settings">
               <Settings className="mr-2 h-4 w-4" />
               Settings
             </Link>
           </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat, index) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with AI chat and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" asChild>
              <Link href="/dashboard/chat">Start AI Chat</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent actions and account updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Started AI chat session</span>
                <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-500" />
                <span className="text-sm">Updated profile information</span>
                <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Changed account settings</span>
                <span className="text-xs text-muted-foreground ml-auto">3 days ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Credits available: {userCredits}</span>
                <span className="text-xs text-muted-foreground ml-auto">Current balance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Plan</span>
                <span className="text-sm font-medium">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">API Calls</span>
                <span className="text-sm font-medium">8,234 / 10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-medium">2.1 GB / 5 GB</span>
              </div>
              <Button className="w-full mt-4" size="sm">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

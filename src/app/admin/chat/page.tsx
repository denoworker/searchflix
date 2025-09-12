import { ChatInterface } from "@/components/chat/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkAdminAccess } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { 
  MessageSquare, 
  Zap, 
  Brain, 
  Sparkles,
  Clock,
  BarChart3
} from "lucide-react";

export default async function AdminChatPage() {
  try {
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      redirect('/auth/signin');
    }
  } catch (error) {
    redirect('/auth/signin');
  }

  const features = [
    {
      icon: Brain,
      title: "Advanced AI Model",
      description: "Powered by Qwen3-235B for intelligent responses"
    },
    {
      icon: Zap,
      title: "Real-time Responses",
      description: "Get instant answers to your questions"
    },
    {
      icon: Sparkles,
      title: "Context Aware",
      description: "Maintains conversation context for better understanding"
    },
    {
      icon: Clock,
      title: "24/7 Available",
      description: "AI assistant ready whenever you need help"
    }
  ];

  const usageStats = [
    { label: "Messages Today", value: "12", limit: "100" },
    { label: "Tokens Used", value: "2,450", limit: "10,000" },
    { label: "Conversations", value: "3", limit: "∞" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin AI Chat Assistant</h1>
        <p className="text-muted-foreground">
          Administrative AI interface for system management and advanced queries.
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usageStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  / {stat.limit}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Interface */}
      <Card className="min-h-[600px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Admin Chat Interface</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Admin Mode
              </Badge>
              <Badge variant="outline" className="text-xs">
                Qwen3-235B
              </Badge>
            </div>
          </div>
          <CardDescription>
            Advanced AI assistant for administrative tasks and system management
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ChatInterface />
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Chat Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">System Management</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Query user statistics and analytics</li>
                <li>• Generate system reports</li>
                <li>• Analyze usage patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Database query assistance</li>
                <li>• Code review and optimization</li>
                <li>• Security analysis and recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
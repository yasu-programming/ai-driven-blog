import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import RecentPosts from "@/components/RecentPosts";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          AI Driven Blog
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience the future of content creation with AI-powered writing assistance, 
          automatic tagging, and intelligent SEO optimization.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/posts">Explore Posts</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Writing Assistant</CardTitle>
              <CardDescription>
                Get intelligent suggestions for grammar, style, and content improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your writing and provides real-time feedback to enhance clarity and engagement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏷️ Smart Tagging</CardTitle>
              <CardDescription>
                Automatically generate relevant tags for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered tag generation helps categorize your content and improve discoverability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔍 SEO Optimization</CardTitle>
              <CardDescription>
                Optimize your content for search engines automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built-in SEO analysis and recommendations to improve your content's search ranking.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Recent Posts</h2>
          <Button variant="outline" asChild>
            <Link href="/posts">View All</Link>
          </Button>
        </div>
        
        <RecentPosts />
      </section>
    </div>
  );
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Play, Star, TrendingUp, Film } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

const MovieHero = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const featuredMovies = [
    {
      title: "Dune: Part Two",
      year: "2024",
      rating: 8.5,
      genre: "Sci-Fi",
      image: "/api/placeholder/300/450"
    },
    {
      title: "Oppenheimer",
      year: "2023",
      rating: 8.3,
      genre: "Biography",
      image: "/api/placeholder/300/450"
    },
    {
      title: "The Batman",
      year: "2022",
      rating: 7.8,
      genre: "Action",
      image: "/api/placeholder/300/450"
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with cinematic effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Floating movie posters */}
      <div className="absolute inset-0 overflow-hidden">
        {featuredMovies.map((movie, index) => (
          <motion.div
            key={movie.title}
            initial={{ opacity: 0, y: 100, rotate: -10 }}
            animate={{ 
              opacity: 0.1, 
              y: 0, 
              rotate: 0,
              x: [0, 20, 0],
            }}
            transition={{ 
              duration: 2, 
              delay: index * 0.5,
              x: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className={`absolute w-32 h-48 rounded-lg shadow-2xl ${
              index === 0 ? 'top-20 right-20' : 
              index === 1 ? 'bottom-32 left-16' : 
              'top-1/2 right-1/4'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg border border-primary/10" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
            >
              <Film className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Movie Discovery</span>
            </motion.div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Find Your Next
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Favorite Movie
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover millions of movies with our AI-powered search. Get personalized recommendations 
            and never run out of great films to watch.
          </p>
        </motion.div>

        {/* Interactive Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-2xl">
              <div className="flex items-center space-x-2">
                <Search className="w-6 h-6 text-muted-foreground ml-4" />
                <Input
                  placeholder="Search for movies, actors, directors, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  size="lg" 
                  className="rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            size="lg"
            className="text-base font-medium px-8 py-4 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-purple-600"
            asChild
          >
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Discovering</span>
            </Link>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="text-base font-medium px-8 py-4 h-14 rounded-xl border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/trending" className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Trending Now</span>
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: "Movies", value: "1M+", icon: Film },
            { label: "Users", value: "100K+", icon: Star },
            { label: "Reviews", value: "5M+", icon: Star },
            { label: "Countries", value: "50+", icon: TrendingUp }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default MovieHero
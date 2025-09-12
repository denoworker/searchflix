"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const TrendingMovies = () => {
  const trendingMovies = [
    {
      id: 1,
      title: "Guardians of the Galaxy Vol. 3",
      year: 2023,
      rating: 8.2,
      duration: "2h 30m",
      genre: "Action, Adventure, Comedy",
      image: "/api/placeholder/300/450",
      description: "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe."
    },
    {
      id: 2,
      title: "Spider-Man: Across the Spider-Verse",
      year: 2023,
      rating: 8.7,
      duration: "2h 20m",
      genre: "Animation, Action, Adventure",
      image: "/api/placeholder/300/450",
      description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People."
    },
    {
      id: 3,
      title: "John Wick: Chapter 4",
      year: 2023,
      rating: 7.8,
      duration: "2h 49m",
      genre: "Action, Crime, Thriller",
      image: "/api/placeholder/300/450",
      description: "John Wick uncovers a path to defeating The High Table."
    },
    {
      id: 4,
      title: "The Super Mario Bros. Movie",
      year: 2023,
      rating: 7.0,
      duration: "1h 32m",
      genre: "Animation, Adventure, Comedy",
      image: "/api/placeholder/300/450",
      description: "A plumber named Mario travels through an underground labyrinth with his brother Luigi."
    },
    {
      id: 5,
      title: "Fast X",
      year: 2023,
      rating: 5.8,
      duration: "2h 21m",
      genre: "Action, Adventure, Crime",
      image: "/api/placeholder/300/450",
      description: "Dom Toretto and his family are targeted by the vengeful son of drug kingpin Hernan Reyes."
    },
    {
      id: 6,
      title: "Scream VI",
      year: 2023,
      rating: 6.5,
      duration: "2h 3m",
      genre: "Horror, Mystery, Thriller",
      image: "/api/placeholder/300/450",
      description: "The survivors of the Ghostface killings leave Woodsboro behind and start a fresh chapter."
    }
  ]

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trending This Week</span>
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            What's
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {" "}Hot Right Now
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the most popular movies that everyone's talking about. Updated daily based on user activity.
          </p>
        </motion.div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
          {trendingMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-b from-card to-card/80 hover:from-card/95 hover:to-card group-hover:ring-2 group-hover:ring-primary/20">
                <div className="relative">
                  {/* Movie Poster */}
                  <div className="aspect-[2/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                    {/* Poster Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    

                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1.5 rounded-lg shadow-lg flex items-center space-x-1.5">
                        <Star className="w-3.5 h-3.5 text-white fill-current" />
                        <span className="text-white text-xs font-bold">{movie.rating}</span>
                      </div>
                    </div>

                    {/* Genre Tag */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-medium text-foreground/80 line-clamp-1">{movie.genre}</span>
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-2">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {movie.title}
                      </h3>
                      <div className="flex justify-end">
                        <p className="text-xs text-muted-foreground font-medium">{movie.duration}</p>
                      </div>
                    </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(movie.rating / 10) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-4 h-14 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/trending">
              View All Trending Movies
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default TrendingMovies
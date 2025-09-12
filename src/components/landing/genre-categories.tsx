"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  Heart, 
  Skull, 
  Laugh, 
  Sword, 
  Rocket, 
  Eye, 
  Users,
  ArrowRight,
  Film
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const GenreCategories = () => {
  const genres = [
    {
      name: "Action",
      icon: Zap,
      description: "High-octane thrills and adrenaline-pumping adventures",
      movieCount: "15,000+",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      examples: ["John Wick", "Mad Max", "Die Hard"]
    },
    {
      name: "Romance",
      icon: Heart,
      description: "Love stories that touch the heart and soul",
      movieCount: "8,500+",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      examples: ["The Notebook", "Titanic", "La La Land"]
    },
    {
      name: "Horror",
      icon: Skull,
      description: "Spine-chilling tales that will keep you on edge",
      movieCount: "6,200+",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      examples: ["The Conjuring", "Hereditary", "Get Out"]
    },
    {
      name: "Comedy",
      icon: Laugh,
      description: "Hilarious films guaranteed to make you laugh",
      movieCount: "12,000+",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      examples: ["Superbad", "The Hangover", "Bridesmaids"]
    },
    {
      name: "Drama",
      icon: Users,
      description: "Powerful stories that explore the human condition",
      movieCount: "20,000+",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      examples: ["The Shawshank Redemption", "Forrest Gump", "Parasite"]
    },
    {
      name: "Sci-Fi",
      icon: Rocket,
      description: "Futuristic adventures beyond imagination",
      movieCount: "9,800+",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      examples: ["Blade Runner", "Interstellar", "The Matrix"]
    },
    {
      name: "Fantasy",
      icon: Sword,
      description: "Magical worlds filled with wonder and adventure",
      movieCount: "7,500+",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      examples: ["Lord of the Rings", "Harry Potter", "Pan's Labyrinth"]
    },
    {
      name: "Thriller",
      icon: Eye,
      description: "Suspenseful stories that keep you guessing until the end",
      movieCount: "11,400+",
      color: "from-slate-500 to-gray-600",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      examples: ["Gone Girl", "Shutter Island", "The Silence of the Lambs"]
    }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/2 to-purple-500/2 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-primary/8 px-5 py-2.5 rounded-full border border-primary/15">
              <Film className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">Browse by Genre</span>
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
            Explore Every
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {" "}Genre
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From heart-pounding action to tear-jerking dramas, discover movies across all genres 
            with our comprehensive collection of cinematic experiences.
          </p>
        </motion.div>

        {/* Genre Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {genres.map((genre, index) => {
            const Icon = genre.icon
            return (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group cursor-pointer h-full"
              >
                <Card className={`h-full overflow-hidden bg-card border shadow-md hover:shadow-xl transition-all duration-300 ${genre.borderColor} hover:border-primary/30 group-hover:bg-card/95`}>
                  <CardContent className="p-5 sm:p-6 h-full flex flex-col">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-4 mb-5">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${genre.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl group-hover:text-primary transition-colors duration-300 mb-1">
                          {genre.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          {genre.movieCount} movies
                        </p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-grow">
                      {genre.description}
                    </p>
                    
                    {/* Popular Examples */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-3 uppercase tracking-wide">Popular Movies</p>
                      <div className="flex flex-wrap gap-2">
                        {genre.examples.slice(0, 2).map((example, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full border border-border/40 transition-colors duration-200 font-medium"
                          >
                            {example}
                          </span>
                        ))}
                        {genre.examples.length > 2 && (
                          <span className="text-xs text-muted-foreground px-2 py-1.5">
                            +{genre.examples.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Explore Button */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 h-10 font-medium"
                      asChild
                    >
                      <Link href={`/genre/${genre.name.toLowerCase()}`}>
                        <span>Explore {genre.name}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>


      </div>
    </section>
  )
}

export default GenreCategories
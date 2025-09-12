"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Film Critic",
      company: "MovieMag",
      content: "SearchFlix has revolutionized how I discover films for reviews. The AI recommendations are spot-on, and I've found so many hidden gems I would have missed otherwise.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Marcus Rodriguez",
      role: "Movie Enthusiast",
      company: "Cinephile",
      content: "The best movie discovery platform I've ever used. The search is lightning-fast and the filtering options help me find exactly what I'm in the mood for.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Emily Watson",
      role: "Film Student",
      company: "NYU Film School",
      content: "As a film student, this platform is invaluable for research. The detailed movie information and cast/crew data saves me hours of research time.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "David Kim",
      role: "Home Theater Owner",
      company: "Movie Night Host",
      content: "Planning movie nights has never been easier. The watchlist feature and streaming availability info helps me organize perfect movie experiences for friends.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Lisa Thompson",
      role: "Content Creator",
      company: "FilmTok",
      content: "The platform's recommendations have introduced me to incredible international films. My content has become more diverse and engaging thanks to SearchFlix.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Alex Johnson",
      role: "Movie Blogger",
      company: "CinemaScope Blog",
      content: "I've discovered more amazing films in the past month than I did all last year. The AI understands my taste perfectly and keeps surprising me with great suggestions.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Loved by
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Movie Lovers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of film enthusiasts who have discovered their next favorite movies 
            using our AI-powered recommendation system.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-muted-foreground">Happy Developers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Apps Launched</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Join the Success Stories</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Don't just take our word for it. Start building your AI SAAS today and 
              see why developers love our toolkit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Your Success Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Read More Reviews
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials

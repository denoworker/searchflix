import Navigation from "@/components/landing/navigation"
import MovieHero from "@/components/landing/movie-hero"
import TrendingMovies from "@/components/landing/trending-movies"
import GenreCategories from "@/components/landing/genre-categories"

import Footer from "@/components/landing/footer"
import { SmoothScroll } from "@/components/ui/smooth-scroll"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SmoothScroll />
      <Navigation />
      <MovieHero />
      <TrendingMovies />
      <GenreCategories />

      <Footer />
      <ScrollToTop />
    </div>
  )
}

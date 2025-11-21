import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Chatbot from '../components/Chatbot/Chatbot'
import '../styles/landing-animations.css'
import { 
  Eye, 
  Users, 
  MapPin, 
  Clock, 
  Shield, 
  Smartphone,
  BarChart3,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const LandingPage = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Animated particles representing civic network
    const particles = []
    const particleCount = 80

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.opacity = Math.random() * 0.5 + 0.2
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - distance / 120)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const features = [
    {
      icon: MessageSquare,
      title: 'Report Issues',
      description: 'Easily report civic issues with photos, location, and detailed descriptions'
    },
    {
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Precise location mapping for accurate issue identification and resolution'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track complaint status and view comprehensive analytics dashboards'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security measures'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Access the platform seamlessly from any device, anywhere'
    },
    {
      icon: AlertTriangle,
      title: 'Priority System',
      description: 'Intelligent severity classification for faster critical issue resolution'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Elegant Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Vibrant Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/85 via-purple-50/85 to-pink-50/85"></div>
        
        {/* Animated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Urban/City Infrastructure Elements - VIBRANT Indigo & Purple Theme */}
        <div className="absolute inset-0 overflow-hidden">
          {/* City Skyline Silhouettes - VIBRANT */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-500/30 via-purple-500/20 to-transparent">
            <div className="absolute bottom-0 left-1/4 w-32 h-40 bg-gradient-to-t from-indigo-500/50 to-indigo-400/40 animate-float shadow-lg shadow-indigo-500/50"></div>
            <div className="absolute bottom-0 left-1/3 w-24 h-56 bg-gradient-to-t from-purple-500/50 to-purple-400/40 animate-float shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-0 left-2/5 w-28 h-48 bg-gradient-to-t from-indigo-600/50 to-indigo-500/40 animate-float shadow-lg shadow-indigo-600/50" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-0 right-1/3 w-36 h-64 bg-gradient-to-t from-purple-600/50 to-purple-500/40 animate-float shadow-lg shadow-purple-600/50" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-0 right-1/4 w-20 h-44 bg-gradient-to-t from-violet-500/50 to-violet-400/40 animate-float shadow-lg shadow-violet-500/50" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Road/Street Grid Pattern - VIBRANT Indigo/Purple */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-40">
            <div className="absolute top-0 left-1/3 w-2 h-full bg-gradient-to-b from-indigo-500 to-indigo-400 animate-float shadow-lg shadow-indigo-500/50"></div>
            <div className="absolute top-0 left-2/3 w-2 h-full bg-gradient-to-b from-purple-500 to-purple-400 animate-float shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/3 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-indigo-400 animate-float shadow-lg shadow-indigo-500/50" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-2/3 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-purple-400 animate-float shadow-lg shadow-purple-500/50" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          {/* Map Pin/Location Markers - LARGE & VIBRANT */}
          <div className="absolute top-1/5 left-1/5 w-20 h-20 animate-bounce">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full animate-glow shadow-2xl shadow-indigo-500/70"></div>
            <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-t-[40px] border-t-indigo-600 -mt-2 drop-shadow-2xl"></div>
          </div>
          <div className="absolute top-2/5 right-1/4 w-20 h-20 animate-bounce" style={{ animationDelay: '0.8s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full animate-glow shadow-2xl shadow-purple-500/70"></div>
            <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-t-[40px] border-t-purple-600 -mt-2 drop-shadow-2xl"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 w-20 h-20 animate-bounce" style={{ animationDelay: '1.6s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full animate-glow shadow-2xl shadow-violet-500/70"></div>
            <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-t-[40px] border-t-violet-600 -mt-2 drop-shadow-2xl"></div>
          </div>
          <div className="absolute top-1/2 right-1/5 w-18 h-18 animate-bounce" style={{ animationDelay: '2.4s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 rounded-full animate-glow shadow-2xl shadow-fuchsia-500/70"></div>
            <div className="w-0 h-0 border-l-[28px] border-l-transparent border-r-[28px] border-r-transparent border-t-[36px] border-t-fuchsia-600 -mt-2 drop-shadow-2xl"></div>
          </div>
          
          {/* Circular Radar/Detection Waves - VIBRANT Indigo/Purple */}
          <div className="absolute top-1/3 right-1/3 w-96 h-96">
            <div className="absolute inset-0 border-8 border-indigo-500/60 rounded-full animate-ripple shadow-2xl shadow-indigo-500/50"></div>
            <div className="absolute inset-8 border-6 border-purple-500/50 rounded-full animate-ripple shadow-xl shadow-purple-500/40" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-16 border-4 border-violet-500/40 rounded-full animate-ripple shadow-lg shadow-violet-500/30" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Network Connection Lines - VIBRANT Gradients */}
          <div className="absolute top-1/4 left-1/5 w-80 h-3 bg-gradient-to-r from-purple-500/60 via-fuchsia-500/60 to-transparent rotate-45 animate-float shadow-lg shadow-purple-500/50"></div>
          <div className="absolute top-1/2 right-1/5 w-96 h-3 bg-gradient-to-r from-indigo-500/60 via-purple-500/60 to-transparent -rotate-45 animate-float shadow-lg shadow-indigo-500/50" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-72 h-3 bg-gradient-to-r from-violet-500/60 via-purple-500/60 to-transparent rotate-12 animate-float shadow-lg shadow-violet-500/50" style={{ animationDelay: '2s' }}></div>
          
          {/* Alert/Warning Triangles - VIBRANT */}
          <div className="absolute top-1/6 right-1/5 w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[85px] border-b-amber-500/70 animate-pulse animate-glow drop-shadow-2xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-orange-500/70 animate-pulse animate-glow drop-shadow-2xl" style={{ animationDelay: '1s' }}></div>
          
          {/* Check Marks - VIBRANT Success Colors */}
          <div className="absolute top-2/3 right-1/6 w-24 h-24 animate-pulse animate-glow">
            <div className="absolute bottom-0 left-0 w-3 h-12 bg-gradient-to-t from-emerald-500 to-emerald-400 rotate-45 shadow-lg shadow-emerald-500/50"></div>
            <div className="absolute bottom-0 right-0 w-3 h-20 bg-gradient-to-t from-emerald-500 to-emerald-400 -rotate-45 shadow-lg shadow-emerald-500/50"></div>
          </div>
          <div className="absolute top-1/3 left-1/6 w-20 h-20 animate-pulse animate-glow" style={{ animationDelay: '1.5s' }}>
            <div className="absolute bottom-0 left-0 w-3 h-10 bg-gradient-to-t from-green-500 to-green-400 rotate-45 shadow-lg shadow-green-500/50"></div>
            <div className="absolute bottom-0 right-0 w-3 h-16 bg-gradient-to-t from-green-500 to-green-400 -rotate-45 shadow-lg shadow-green-500/50"></div>
          </div>
          
          {/* Road Cracks/Potholes Pattern - Subtle but Visible */}
          <div className="absolute top-1/2 left-1/4 w-40 h-5 bg-gradient-to-r from-slate-500/30 to-slate-400/20 rounded-full blur-sm animate-float"></div>
          <div className="absolute bottom-1/5 right-1/4 w-32 h-4 bg-gradient-to-r from-slate-500/30 to-slate-400/20 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
          
          {/* City Blocks/Districts - VIBRANT Borders */}
          <div className="absolute top-1/5 right-1/4 w-56 h-56 border-6 border-indigo-500/50 animate-float shadow-2xl shadow-indigo-500/40" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}></div>
          <div className="absolute bottom-1/4 left-1/5 w-64 h-64 border-6 border-purple-500/50 animate-float shadow-2xl shadow-purple-500/40" style={{ animationDelay: '1.5s', clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
          <div className="absolute top-2/5 left-2/5 w-52 h-52 border-6 border-violet-500/50 animate-float shadow-2xl shadow-violet-500/40" style={{ animationDelay: '2.5s', clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_48%,rgba(99,102,241,0.02)_49%,rgba(99,102,241,0.02)_51%,transparent_52%)] bg-[size:100px_100px]"></div>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Premium Navigation with Glassmorphism */}
        <nav className="glass-card border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UrbanEye
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-200"
                >
                  Citizen Login
                </Button>
              </Link>

              <Link to="/admin-login">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200"
                >
                  Admin Login
                </Button>
              </Link>

              <Link to="/admin-signup">
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Admin Signup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-in fade-in duration-700">
            {/* LARGE Floating Icons Animation - Vibrant */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <MapPin className="absolute top-10 left-1/4 w-16 h-16 text-indigo-500/40 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
              <AlertTriangle className="absolute top-20 right-1/4 w-20 h-20 text-purple-500/40 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
              <CheckCircle className="absolute bottom-20 left-1/3 w-18 h-18 text-blue-500/40 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
              <Shield className="absolute top-1/3 right-1/3 w-14 h-14 text-cyan-500/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Users className="absolute bottom-1/3 right-1/4 w-16 h-16 text-pink-500/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
              <BarChart3 className="absolute top-1/2 left-1/5 w-15 h-15 text-violet-500/40 animate-pulse" style={{ animationDelay: '1s' }} />
              <Smartphone className="absolute bottom-1/4 right-1/3 w-14 h-14 text-fuchsia-500/40 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }} />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl -z-10"></div>

            <div className="inline-block mb-6 px-6 py-2 glass rounded-full border border-white/30 animate-scaleIn hover-glow">
              <span className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                <Eye className="w-4 h-4 animate-pulse" />
                Trusted by 25,000+ Citizens
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-slate-800 mb-6 leading-tight animate-fadeInUp">
              Bengaluru's
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2 animate-gradient drop-shadow-lg">
                Civic Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 font-medium mb-12 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Empowering citizens to report civic issues and enabling administrators
              to resolve them efficiently. Building a better Bengaluru together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-10 py-6 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-105 relative overflow-hidden group">
                  <span className="relative z-10">Get Started as Citizen</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button variant="outline" size="lg" className="text-lg px-10 py-6 font-semibold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hover:scale-105 glass-card">
                  Admin Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Premium Features Section with Glassmorphism */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 glass-card relative">
        {/* LARGE Decorative Background Elements - Vibrant */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 border-6 border-indigo-400/40 rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 border-6 border-purple-400/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-gradient-to-br from-indigo-300/50 to-purple-300/50 rounded-lg rotate-45 animate-morphing"></div>
          <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-gradient-to-br from-pink-300/50 to-rose-300/50 rounded-full animate-wave"></div>
          <div className="absolute bottom-1/3 left-1/2 w-72 h-72 border-6 border-cyan-400/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 glass rounded-full border border-white/20">
              <span className="text-sm font-semibold text-indigo-700">Features</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-800 mb-6">
              Powerful Features for Civic Engagement
            </h2>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Our platform provides comprehensive tools for citizens and administrators
              to collaborate effectively in improving urban infrastructure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="glass-card border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-indigo-300 group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-500"></div>
                
                <CardHeader className="relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-slate-800 font-bold text-xl group-hover:text-indigo-700 transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-slate-600 font-medium leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        
        {/* Animated Circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-6 py-2 glass rounded-full border border-white/40">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Join Our Community
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of citizens already using UrbanEye to improve Bengaluru's infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-50 text-lg px-10 py-6 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-105">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-10 py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl hover:scale-105">
                Already a Member?
              </Button>
            </Link>
          </div>

          {/* Trust Indicators with Glassmorphism */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 text-white glass rounded-full px-4 py-2 border border-white/20">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-white glass rounded-full px-4 py-2 border border-white/20">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">25,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-white glass rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">15,000+ Issues Resolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-purple-900/20"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-sm opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold">UrbanEye</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white font-semibold text-lg">
                © 2024 UrbanEye - Bengaluru Civic Platform
              </p>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Building a better city together
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

export default LandingPage

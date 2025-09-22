import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
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
  const stats = [
    { label: 'Active Citizens', value: '25,000+', icon: Users },
    { label: 'Issues Resolved', value: '15,000+', icon: CheckCircle },
    { label: 'Response Time', value: '< 24hrs', icon: Clock },
    { label: 'Divisions Covered', value: '198', icon: MapPin }
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-civic-bg via-white to-civic-muted/20">
      {/* Navigation */}
      <nav className="glass nav-enhanced border-b-2 border-civic-accent/30 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-civic-accent drop-shadow-md" />
              <span className="text-2xl font-bold text-civic-dark drop-shadow-sm">Urban Eye</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-civic-dark hover:text-civic-accent font-semibold border-2 border-transparent hover:border-civic-accent/30 transition-all duration-200"
                >
                  Citizen Login
                </Button>
              </Link>

              <Link to="/admin-login">
                <Button
                  variant="outline"
                  className="border-2 border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Admin Login
                </Button>
              </Link>

              {/* ✅ New Admin Signup button */}
              <Link to="admin-signup">
                <Button
                  variant="outline"
                  className="border-2 border-civic-accent text-civic-dark hover:bg-civic-dark hover:text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Admin Signup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in container-bordered bg-white/30 backdrop-blur-sm">
            <h1 className="text-5xl md:text-7xl font-bold text-civic-dark mb-6 drop-shadow-lg">
              Bengaluru's
              <span className="block text-civic-accent drop-shadow-md">
                Civic Platform
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-civic-dark font-medium mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
              Empowering citizens to report civic issues and enabling administrators
              to resolve them efficiently. Building a better Bengaluru together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="glow-effect text-lg px-8 py-3 font-semibold border-2 border-civic-accent shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started as Citizen
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 font-semibold border-2 border-civic-accent text-civic-accent hover:bg-civic-accent hover:text-white shadow-md hover:shadow-lg transition-all duration-300">
                  Admin Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/70 border-y-2 border-civic-accent/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center fade-in container-bordered bg-white/50 hover:bg-white/70 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-civic-accent/20 rounded-full mb-4 border-2 border-civic-accent/30 shadow-md">
                  <stat.icon className="h-8 w-8 text-civic-accent drop-shadow-sm" />
                </div>
                <div className="text-3xl font-bold text-civic-dark mb-2 drop-shadow-sm">{stat.value}</div>
                <div className="text-civic-dark font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 container-bordered bg-white/30">
            <h2 className="text-4xl font-bold text-civic-dark mb-4 drop-shadow-md">
              Powerful Features for Civic Engagement
            </h2>
            <p className="text-xl text-civic-dark font-medium max-w-2xl mx-auto leading-relaxed">
              Our platform provides comprehensive tools for citizens and administrators
              to collaborate effectively in improving urban infrastructure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass card-enhanced hover:shadow-xl transition-all duration-300 border-2 border-civic-accent/20 bg-white/40">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-civic-accent/20 rounded-lg mb-4 border-2 border-civic-accent/30 shadow-md">
                    <feature.icon className="h-6 w-6 text-civic-accent drop-shadow-sm" />
                  </div>
                  <CardTitle className="text-civic-dark font-bold drop-shadow-sm">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-civic-dark font-medium leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 civic-gradient border-y-4 border-civic-dark/20">
        <div className="max-w-4xl mx-auto text-center container-bordered bg-white/10 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white font-medium mb-8 drop-shadow-md leading-relaxed">
            Join thousands of citizens already using Urban Eye to improve Bengaluru's infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-civic-dark hover:bg-white/90 text-lg px-8 py-3 font-semibold border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-civic-dark text-lg px-8 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                Already a Member?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-civic-dark text-white py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-civic-accent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center container-bordered border-civic-accent/30">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Eye className="h-8 w-8 text-civic-accent drop-shadow-md" />
              <span className="text-2xl font-bold drop-shadow-sm">Urban Eye</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white font-medium drop-shadow-sm">
                © 2024 Urban Eye - Bengaluru Civic Platform
              </p>
              <p className="text-white/80 text-sm mt-1 font-medium">
                Building a better city together
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

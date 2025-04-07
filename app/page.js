"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  Tv,
  Home,
  Truck,
  Timer,
  PaintBucket,
  Power,
  Shield,
  Clock,
  Building2,
  Navigation,
  CheckCircle2,
  Heart,
  Star,
  MapPin,
  UserPlus,
} from "lucide-react";

const HomePage = () => {
  const services = [
    {
      icon: <Wrench className="h-6 w-6" />,
      name: "Plumbing",
      description:
        "Expert plumbers ready 24/7 for emergencies and renovations.",
    },
    {
      icon: <Tv className="h-6 w-6" />,
      name: "TV Mounting",
      description:
        "Professional TV installation with perfect cable management.",
    },
    {
      icon: <Home className="h-6 w-6" />,
      name: "House Hunting",
      description:
        "Guided property search with virtual tours and area insights.",
    },
    {
      icon: <Home className="h-6 w-6" />,
      name: "General Repairs",
      description:
        "From minor fixes to major repairs, our skilled handymen handle any home maintenance task.",
    },
    {
      icon: <PaintBucket className="h-6 w-6" />,
      name: "Painting",
      description: "Transform spaces with our expert painting services.",
    },
    {
      icon: <Power className="h-6 w-6" />,
      name: "Electrical",
      description: "Licensed electricians for all electrical needs.",
    },
    {
      icon: <Navigation className="h-6 w-6" />,
      name: "Local Guide",
      description: "Expert guides for Nairobi navigation and area tours.",
    },
  ];

  const trustFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Rigorous Vetting",
      description:
        "Thorough background checks, skills assessment, and verified work history",
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Quality Assurance",
      description:
        "Regular performance monitoring and customer feedback analysis",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Fast Delivery",
      description: "24-hour delivery guarantee with free CBD delivery",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Trust & Reliability",
      description: "Verified professionals with proven track records",
    },
  ];

  return (
    <div className="grid gap-8">
      {/* Enhanced Hero Section */}
      <section className="text-center space-y-6 max-w-5xl mx-auto bg-gradient-to-b from-primary/10 to-background p-8 rounded-lg">
        <h1 className="text-4xl font-bold">
          Your Trusted Service Providers Platform in Any Area in Kenya
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with verified professionals, find quality products, and
          discover trusted services in your area. Experience the convenience of
          location-based service matching.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 py-2"
          >
            Find Services
          </Link>
          <Link
            href="/applications"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-6 py-2"
          >
            Join as ProFinder
          </Link>
        </div>
      </section>

      {/* Trust Features */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {trustFeatures.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {feature.icon}
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Service Provider Section */}
      <section className="max-w-4xl mx-auto p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Become a ProFinder</h2>
          </div>
          <p className="text-muted-foreground">
            Join our network of trusted professionals. We value experience,
            quality, and reliability. Our thorough vetting process includes:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-medium mb-2">Verification Process</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Background checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Skills assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Experience verification
                </li>
              </ul>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-medium mb-2">Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Access to local customers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Professional profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Business growth support
                </li>
              </ul>
            </div>
          </div>
          <Link
            href="/applications"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Rest of your sections... */}
      {/* Location Services */}
      <section className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Area-Based Services</h3>
            </div>
            <p className="text-muted-foreground">
              Find services specific to your location in Kenya. Our platform
              matches you with professionals in your area for efficient service
              delivery.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center text-primary hover:underline"
            >
              Find services in your area →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">House Hunting</h3>
            </div>
            <p className="text-muted-foreground">
              Explore properties with virtual tours and detailed area insights.
              Our platform helps you find the perfect home in your desired
              location.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center text-primary hover:underline"
            >
              Start house hunting →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-semibold mb-6">Featured Services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={index}
              href={`/services?type=${service.name.toLowerCase()}`}
              className="flex flex-col space-y-2 p-4 hover:bg-accent rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                {service.icon}
                <div className="font-medium">{service.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {service.description}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Delivery Section */}
      <section className="max-w-4xl mx-auto p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Truck className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Fast & Reliable Delivery</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">24-Hour Delivery</h3>
              <p className="text-muted-foreground">
                Count on us for quick delivery of all your home improvement
                needs and other products. Free delivery within Nairobi CBD and
                affordable rates for other areas.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Premium Products</h3>
              <p className="text-muted-foreground">
                Shop with confidence from our curated selection of premium
                Products. All products come with quality guarantee.
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Flash Sales */}
      <section className="max-w-4xl mx-auto p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Timer className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Flash Sales</h2>
          </div>
          <p className="text-muted-foreground">
            Seize the moment with our exclusive flash sales! We regularly offer
            incredible discounts on both services and products. From
            professional home services to premium tools and materials, you'll
            find unbeatable deals. Act fast - these special offers won't last
            long!
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:underline"
          >
            View current offers →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

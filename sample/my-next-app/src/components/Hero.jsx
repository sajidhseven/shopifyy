import Link from "next/link";
import Image from "next/image";

// --- Data & Sub-components ---

const testimonials = [
  {
    name: 'Ava Green',
    username: '@ava',
    body: 'Cascade AI made my workflow 10x faster!',
    img: 'https://randomuser.me/api/portraits/women/32.jpg',
    country: '🇦🇺',
  },
  {
    name: 'Ana Miller',
    username: '@ana',
    body: 'Vertical marquee is a game changer!',
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
    country: '🇩🇪',
  },
  {
    name: 'Mateo Rossi',
    username: '@mat',
    body: 'Animations are buttery smooth!',
    img: 'https://randomuser.me/api/portraits/men/51.jpg',
    country: '🇮🇹',
  },
  {
    name: 'Maya Patel',
    username: '@maya',
    body: 'Setup was a breeze!',
    img: 'https://randomuser.me/api/portraits/women/53.jpg',
    country: '🇮🇳',
  },
  {
    name: 'Lucas Stone',
    username: '@luc',
    body: 'Very customizable and smooth.',
    img: 'https://randomuser.me/api/portraits/men/22.jpg',
    country: '🇫🇷',
  },
];

// A lightweight card component styled specifically for the hero
function TestimonialCard({ img, name, username, body, country }) {
  return (
    <div className="marquee-card">
      <div className="card-header">
        <img src={img} alt={username} className="card-avatar" />
        <div className="card-info">
          <span className="card-name">{name} {country}</span>
          <span className="card-user">{username}</span>
        </div>
      </div>
      <p className="card-body">{body}</p>
    </div>
  );
}

// --- Main Hero Component ---

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        
        {/* Left: Content */}
        <div className="hero-content">
          {/* <span className="badge">New Arrivals</span> */}
          <h1>
            Shop simple. <br />
            <span className="highlight">Ship fast.</span>
          </h1>
          <p>
            Elevate your wardrobe with quality basics designed for everyday life.
            Enjoy free shipping on all orders over ₹999.
          </p>
          <div className="btn-group">
            <Link className="btn btn-primary" href="/products">
              Start Shopping
            </Link>
            <Link className="btn btn-secondary" href="/about">
              Our Story
            </Link>
          </div>
        </div>

        {/* Right: 3D Marquee Visual */}
        <div className="hero-visual">
            {/* The 3D Wrapper */}
            <div className="marquee-3d-wrapper">
              <div className="marquee-transform-container">
                
                {/* Column 1 (Down) */}
              {/*  <Marquee vertical pauseOnHover repeat={3} className="marquee-col">
                  {testimonials.map((review, i) => (
                    <TestimonialCard key={`col1-${i}`} {...review} />
                  ))}
                </Marquee> */}

                {/* Column 2 (Up - Reverse) */}
              {/*  <Marquee vertical pauseOnHover reverse repeat={3} className="marquee-col">
                  {testimonials.map((review, i) => (
                    <TestimonialCard key={`col2-${i}`} {...review} />
                  ))}
                </Marquee> */}
                
                 {/* Column 3 (Down - optional for wider screens, hidden on smaller) */}
                 <div className="marquee-col-optional">
                   {/*  <Marquee vertical pauseOnHover repeat={3} className="marquee-col">
                    {testimonials.map((review, i) => (
                        <TestimonialCard key={`col3-${i}`} {...review} />
                    ))}
                    </Marquee> */}
                 </div>

              </div>

              {/* Gradients to blend with background */}
              <div className="fade-overlay fade-top"></div>
              <div className="fade-overlay fade-bottom"></div>
              <div className="fade-overlay fade-left"></div>
              <div className="fade-overlay fade-right"></div>
            </div>
        </div>

      </div>
    </section>
  );
}
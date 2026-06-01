'use client';
import Link from 'next/link';
import { Award, Zap, HeadphonesIcon, ArrowRight, Star, Package, Globe, Sparkles } from 'lucide-react';

const values = [
  {
    icon: <Award size={28} />,
    title: 'Uncompromising Quality',
    description: 'Every product is rigorously tested and hand-selected. We partner with trusted manufacturers who share our obsession with quality.',
  },
  {
    icon: <Zap size={28} />,
    title: 'Relentless Innovation',
    description: 'We scour the globe for products that are solving real problems in clever ways. If it does not genuinely improve your day, we do not stock it.',
  },
  {
    icon: <HeadphonesIcon size={28} />,
    title: 'Customer First, Always',
    description: 'From browsing to unboxing, your experience matters. Our support team is here to help within hours, not days.',
  },
];

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products Curated' },
  { value: '50+', label: 'Categories' },
  { value: '4.9', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '5rem 0 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle at 40% 50%, rgba(0, 85, 255, 0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)',
            padding: '6px 16px', borderRadius: 100, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Sparkles size={14} /> Our Story
          </div>
          <h1 style={{
            color: '#fff', fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            We Believe Smart Products<br />Make Life Better
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '1.15rem', lineHeight: 1.7,
            maxWidth: 600, margin: '0 auto',
          }}>
            NexaSolve was born from a simple idea — everyday life should be easier, more organized,
            and a little more delightful. We curate products that genuinely solve problems.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '4rem 20px', textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem',
          color: 'var(--color-primary)',
        }}>
          The NexaSolve Story
        </h2>
        <p style={{
          fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-light)', marginBottom: '1.5rem',
        }}>
          It started in a cluttered apartment with tangled cables, a laptop balanced on a stack of books,
          and a travel bag that never had enough pockets. We thought — someone should find the best solutions
          for these everyday annoyances and put them all in one place.
        </p>
        <p style={{
          fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-light)', marginBottom: '1.5rem',
        }}>
          That someone became us. Today, NexaSolve is a curated marketplace of smart, useful products —
          each one chosen because it passes our simple test: <em>does it actually make life easier?</em>
        </p>
        <p style={{
          fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-light)',
        }}>
          We do not chase trends for the sake of it. We look for products with thoughtful design,
          premium materials, and that "why didn&apos;t I have this sooner?" feeling.
        </p>
      </section>

      {/* Mission */}
      <section style={{
        background: 'var(--color-secondary)', padding: '4rem 0',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem',
            color: 'var(--color-primary)',
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: '1.2rem', lineHeight: 1.7, color: 'var(--color-text-light)',
            fontStyle: 'italic', maxWidth: 650, margin: '0 auto',
          }}>
            &ldquo;To make the search for useful, well-designed products effortless — so you can spend
            less time looking and more time living.&rdquo;
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{
        maxWidth: 1280, margin: '0 auto', padding: '5rem 20px',
      }}>
        <h2 style={{
          fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center',
          marginBottom: '3rem', color: 'var(--color-primary)',
        }}>
          What We Stand For
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {values.map((v, i) => (
            <div key={i} style={{
              background: 'var(--color-white)', borderRadius: 16, padding: '2.5rem 2rem',
              border: '1px solid var(--color-border)', textAlign: 'center',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'rgba(0, 85, 255, 0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', color: 'var(--color-accent)',
              }}>
                {v.icon}
              </div>
              <h3 style={{
                fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem',
                color: 'var(--color-primary)',
              }}>
                {v.title}
              </h3>
              <p style={{
                fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--color-text-light)', margin: 0,
              }}>
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', padding: '4rem 0',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 20px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem', textAlign: 'center',
        }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{
                fontSize: '2.8rem', fontWeight: 800, color: '#fff',
                letterSpacing: '-0.02em', marginBottom: '0.25rem',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Visual */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '5rem 20px', textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem',
          flexWrap: 'wrap', marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px',
            background: 'var(--color-secondary)', borderRadius: 12, fontSize: '0.95rem',
            fontWeight: 600, color: 'var(--color-primary)',
          }}>
            <Globe size={20} style={{ color: 'var(--color-accent)' }} />
            Shipping Worldwide
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px',
            background: 'var(--color-secondary)', borderRadius: 12, fontSize: '0.95rem',
            fontWeight: 600, color: 'var(--color-primary)',
          }}>
            <Package size={20} style={{ color: 'var(--color-accent)' }} />
            Carefully Packaged
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px',
            background: 'var(--color-secondary)', borderRadius: 12, fontSize: '0.95rem',
            fontWeight: 600, color: 'var(--color-primary)',
          }}>
            <Star size={20} style={{ color: 'var(--color-accent)' }} />
            5-Star Rated
          </div>
        </div>
        <p style={{
          fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-text-light)',
          maxWidth: 600, margin: '0 auto 2rem',
        }}>
          We are a small, passionate team committed to bringing you the best products from around the world.
          Every item in our store has been personally tested and approved.
        </p>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--color-secondary)', padding: '4rem 0', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{
            fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em',
            marginBottom: '1rem', color: 'var(--color-primary)',
          }}>
            Ready to Explore?
          </h2>
          <p style={{
            fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-light)',
            marginBottom: '2rem',
          }}>
            Discover products that solve real problems and make your everyday a little smarter.
          </p>
          <Link href="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px',
            background: 'var(--color-accent)', color: '#fff', borderRadius: 12,
            fontWeight: 700, fontSize: '1.05rem', transition: 'all 0.2s ease',
          }}>
            Shop All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

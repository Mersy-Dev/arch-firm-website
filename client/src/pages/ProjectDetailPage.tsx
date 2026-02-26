import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GalleryImage {
  src:     string;
  caption: string;
  span?:   'wide' | 'normal';
}
interface SpecItem { label: string; value: string; }

interface ProjectDetail {
  id:        number;
  slug:      string;
  title:     string;
  category:  string;
  year:      number;
  location:  string;
  area:      string;
  client:    string;
  duration:  string;
  program:   string;
  status:    'Completed' | 'On Site' | 'In Design';
  featured:  boolean;
  cover:     string;
  coverAlt:  string;
  tags:      string[];
  pullQuote: string;           // large editorial pull-quote
  overview:  string;
  challenge: string;
  approach:  string;
  outcome:   string;
  gallery:   GalleryImage[];
  specs:     SpecItem[];
  team:      string[];
  awards:    string[];
  nextSlug:  string;
  prevSlug:  string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS: ProjectDetail[] = [
  {
    id: 1, slug: 'silhouette-residence',
    title: 'Silhouette Residence', category: 'Residential',
    year: 2024, location: 'Hudson Valley, NY', area: '620 m²',
    client: 'Private', duration: '28 months',
    program: 'Private Residence',
    status: 'Completed', featured: true,
    cover:    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1800&q=85&fit=crop',
    coverAlt: 'Silhouette Residence — Hudson Valley',
    tags: ['Passive Design', 'Stone', 'Landscape'],
    pullQuote: 'A house that has learned from its landscape rather than imposed upon it.',
    overview:  'Set against the rolling folds of the Hudson Valley, this residence is conceived as a single unbroken form — a long horizontal bar of bluestone and timber that appears to float above the meadow. The house turns its back to the road and opens entirely to the south-facing slope, creating a sequence of interior spaces calibrated around the movement of light across a day and a year.',
    challenge: 'The site presented two competing demands: complete privacy from the county road to the north, and total openness to the landscape to the south. The clients also required the house to operate entirely on passive means — no mechanical heating or cooling — placing precise constraints on orientation, glazing ratios, and thermal mass.',
    approach:  'We resolved the privacy paradox with a 1.2m earth berm along the northern edge, allowing the ground floor to sit below sightlines while the upper storey — clad entirely in reclaimed Douglas fir — floats visibly above. The thermal mass of the bluestone floor stores solar gain through winter, while deep roof overhangs calibrated to the summer solstice shade the glazing entirely in August.',
    outcome:   'The completed house meets Passive House performance without certification. It consumes 94% less energy than a code-minimum equivalent. The AIA Hudson Valley jury described it as "a building at complete peace with its site."',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80&fit=crop', caption: 'South elevation at dusk — Douglas fir cladding above bluestone plinth', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&fit=crop', caption: 'Main living space — full south glazing with deep overhangs' },
      { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop', caption: 'Entry sequence — compressed approach beneath the earth berm' },
      { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1400&q=80&fit=crop', caption: 'View from the meadow — the house reads as a single landform', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&fit=crop', caption: 'Master bedroom — east-facing clerestory for morning light' },
      { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&fit=crop', caption: 'Kitchen — bluestone counters continue the exterior material palette' },
    ],
    specs: [
      { label: 'Site Area',       value: '4.2 acres'            },
      { label: 'Floor Area',      value: '620 m² / 6,670 ft²'   },
      { label: 'Structure',       value: 'Timber frame + CLT'   },
      { label: 'Cladding',        value: 'Reclaimed Douglas fir' },
      { label: 'Energy Standard', value: 'Passive House level'  },
      { label: 'Glazing Ratio',   value: '38% south / 6% north' },
      { label: 'Completed',       value: 'March 2024'           },
      { label: 'Contractor',      value: 'Hearthstone Build Co.'},
    ],
    team:   ['Principal Architect', 'Project Architect', 'Landscape Architect', 'Structural Engineer'],
    awards: ['AIA Hudson Valley Design Award 2024', 'Dezeen Architecture Award — Residential'],
    nextSlug: 'meridian-tower',
    prevSlug: 'parkline-tower',
  },
  {
    id: 2, slug: 'meridian-tower',
    title: 'The Meridian Tower', category: 'Commercial',
    year: 2023, location: 'Manhattan, NY', area: '18,400 m²',
    client: 'Meridian Properties LLC', duration: '52 months',
    program: 'Mixed-Use: Office / Retail / Residential',
    status: 'Completed', featured: true,
    cover:    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1800&q=85&fit=crop',
    coverAlt: 'Meridian Tower — Manhattan',
    tags: ['LEED Gold', 'Mixed-Use', 'High-rise'],
    pullQuote: 'The colonnade became one of the most used pedestrian connections in the neighbourhood the week it opened.',
    overview:  'At 34 storeys, the Meridian Tower occupies a complex mid-block site in the Flatiron district. The brief called for ground-level retail, twelve floors of flexible office space, and twenty floors of residential above — each programme requiring its own structural expression while reading as a coherent whole from the street.',
    challenge: 'The site sits at the junction of three zoning districts with competing setback requirements, FAR caps, and an existing easement for a 19th-century alley. Resolving these constraints while maximising leasable floor plates required six months of envelope studies before a line was drawn.',
    approach:  'The tower steps back twice — at the office-to-residential transition and again at the crown — following the zoning envelope precisely while giving the building a distinctive silhouette. The street-level retail pavilion is set back 3.5m from the building line, creating a covered colonnade that became an informal public thoroughfare.',
    outcome:   'Office occupancy reached 94% within eight months of opening. The project achieved LEED Gold primarily through its massing strategy rather than technology — proving that good urbanism is the most effective sustainability tool.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1400&q=80&fit=crop', caption: 'West façade — the two setbacks visible against the Manhattan skyline', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&fit=crop', caption: 'Ground-floor colonnade — the civic gift at street level' },
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&fit=crop', caption: 'Typical office floor — 1,500 m² column-free plate' },
      { src: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1400&q=80&fit=crop', caption: 'Crown detail — terracotta panels reference the district\'s masonry heritage', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&fit=crop', caption: 'Residential lobby — warm materials contrast with commercial volumes' },
      { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop', caption: 'Rooftop terrace — shared amenity between office and residential tenants' },
    ],
    specs: [
      { label: 'Storeys',       value: '34 floors'                    },
      { label: 'Floor Area',    value: '18,400 m²'                    },
      { label: 'Structure',     value: 'Concrete core + structural steel' },
      { label: 'Façade',        value: 'Terracotta + unitised glazing' },
      { label: 'Certification', value: 'LEED Gold'                    },
      { label: 'Office',        value: 'Levels 3 – 14'                },
      { label: 'Residential',   value: 'Levels 15 – 34 (180 units)'   },
      { label: 'Completed',     value: 'November 2023'                },
    ],
    team:   ['Principal Architect', '2× Project Architects', 'Urban Designer', 'MEP Engineer', 'Façade Consultant'],
    awards: ['CTBUH Urban Habitat Award 2023', 'NYC AIA Design Award — Commercial'],
    nextSlug: 'kaia-cultural-centre',
    prevSlug: 'silhouette-residence',
  },
  {
    id: 3, slug: 'kaia-cultural-centre',
    title: 'Kaia Cultural Centre', category: 'Cultural',
    year: 2023, location: 'London, UK', area: '4,200 m²',
    client: 'London Borough of Southwark / Kaia Trust', duration: '38 months',
    program: 'Cultural Centre: Performance / Exhibition / Community',
    status: 'Completed', featured: true,
    cover:    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1800&q=85&fit=crop',
    coverAlt: 'Kaia Cultural Centre — London',
    tags: ['RIBA Award', 'Community', 'Concrete'],
    pullQuote: 'A building that has the confidence to be quiet — and the warmth to be loved.',
    overview:  'Kaia is a cultural centre for a diverse Southwark community that had been consulting for three years before FORMA was appointed. The brief was unusually clear because the community had written it themselves: a 250-seat performance space, a double-height exhibition gallery, flexible meeting rooms, a late-night café, and a roof terrace that belongs to everyone.',
    challenge: 'The available budget — £12.4m — was tight for a 4,200m² public building in central London. Every structural and material decision was tested against cost, longevity, and the ability of the community to maintain the building themselves without specialist contractors.',
    approach:  'We chose in-situ board-formed concrete for the primary structure — expensive to form, but requiring zero maintenance and gaining character with age. The performance hall is a simple rectangular concrete box with a demountable timber acoustic lining that transforms reverberation time from 0.6s (speech) to 1.8s (music) in under an hour.',
    outcome:   'The building opened six weeks early and £180,000 under budget. In its first year, 87,000 people passed through it. The RIBA jury called it "a masterclass in doing more with less without anyone feeling shortchanged."',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1400&q=80&fit=crop', caption: 'Main entrance — board-formed concrete and reclaimed brick in dialogue', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80&fit=crop', caption: 'Performance hall — the demountable acoustic lining in concert configuration' },
      { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80&fit=crop', caption: 'Double-height gallery — flexible hanging and display system' },
      { src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80&fit=crop', caption: 'Roof terrace — the community\'s shared outdoor room', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&fit=crop', caption: 'Café interior — open 7am to midnight every day' },
      { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&fit=crop', caption: 'Central stair — the building\'s social spine' },
    ],
    specs: [
      { label: 'Floor Area',      value: '4,200 m²'                    },
      { label: 'Structure',       value: 'In-situ board-formed concrete' },
      { label: 'Performance',     value: '250-seat flexible hall'       },
      { label: 'Gallery',         value: '480 m² double-height'         },
      { label: 'Budget',          value: '£12.4m'                       },
      { label: 'Acoustic Range',  value: 'RT 0.6s – 1.8s'              },
      { label: 'Completed',       value: 'June 2023'                    },
      { label: 'Contractor',      value: 'Osborne Ltd'                  },
    ],
    team:   ['Principal Architect', 'Project Architect', 'Acoustic Engineer', 'Lighting Designer'],
    awards: ['RIBA National Award 2023', 'Dezeen Award — Public & Civic', 'AJ Architecture Award'],
    nextSlug: 'dunes-private-villa',
    prevSlug: 'meridian-tower',
  },
  {
    id: 4, slug: 'dunes-private-villa',
    title: 'Dunes Private Villa', category: 'Residential',
    year: 2022, location: 'Dubai, UAE', area: '1,100 m²',
    client: 'Private', duration: '34 months',
    program: 'Private Residence + Guest Pavilion',
    status: 'Completed', featured: false,
    cover:    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=85&fit=crop',
    coverAlt: 'Dunes Villa — Dubai',
    tags: ['Desert Climate', 'Luxury', 'Courtyard'],
    pullQuote: 'Desert living distilled to its most elemental — shade, water, stone, and sky.',
    overview:  'A private residence on the Dubai outskirts that draws from the deep logic of courtyard architecture — turning inward to create a private world of water, stone, and shade, while its desert-facing walls are largely blind.',
    challenge: 'Extreme heat, relentless glare, and a desire for outdoor living that extends well beyond the temperate months. The client wanted a pool that could be used year-round — including at midday in July.',
    approach:  'The house is organised as four pavilions around a sunken central courtyard, with a 22m lap pool running its full length. A woven steel screen along the south edge filters direct sunlight while admitting breeze. All glazing faces the courtyard; the external perimeter is solid stone.',
    outcome:   'The courtyard microclimate reduces ambient temperature by 7–9°C compared to the surrounding landscape, enabling genuine outdoor occupation for ten months of the year.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80&fit=crop', caption: 'Central courtyard — the pool as thermal regulator and visual anchor', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&fit=crop', caption: 'Main pavilion terrace — shaded overhang overlooking the pool' },
      { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80&fit=crop', caption: 'Woven steel screen — shadow patterns shift and move across the day' },
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80&fit=crop', caption: 'Aerial view — the house as a walled garden in the desert', span: 'wide' },
    ],
    specs: [
      { label: 'Site Area',  value: '3,800 m²'            },
      { label: 'Floor Area', value: '1,100 m²'            },
      { label: 'Structure',  value: 'Reinforced concrete' },
      { label: 'Screen',     value: 'Woven Corten steel'  },
      { label: 'Pool',       value: '22m lap pool'        },
      { label: 'Completed',  value: 'September 2022'      },
    ],
    team:   ['Principal Architect', 'Project Architect', 'Landscape Architect'],
    awards: ['Middle East Architecture Award 2022'],
    nextSlug: 'canopy-pavilion',
    prevSlug: 'kaia-cultural-centre',
  },
  {
    id: 9, slug: 'arena-district',
    title: 'Arena District', category: 'Public',
    year: 2024, location: 'Amsterdam, NL', area: '12,000 m²',
    client: 'City of Amsterdam / Arena Development BV', duration: '60 months (ongoing)',
    program: 'Mixed-Use Urban Quarter',
    status: 'In Design', featured: true,
    cover:    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1800&q=85&fit=crop',
    coverAlt: 'Arena District — Amsterdam',
    tags: ['Urban', 'Master Plan', 'Public Realm'],
    pullQuote: 'A city district designed around how people move, gather, and grow over decades.',
    overview:  'A major mixed-use district on a former industrial site in Amsterdam Southeast. The masterplan delivers 1,200 homes, 35,000m² of office space, and 8,000m² of retail and cultural uses, woven together by public green corridors connecting the district to the adjacent Bijlmer Park.',
    challenge: 'The site is bounded by an elevated metro viaduct to the west — a significant noise challenge — and a fragmented plot ownership structure requiring phased delivery over fifteen years while maintaining visual and urban coherence.',
    approach:  'The masterplan is structured around two primary moves: a diagonal green spine threading through the site perpendicular to the metro, and a series of residential courts that turn their backs to the viaduct while opening to the south. The spine widens towards the park, creating a sequence of public spaces from intimate to generous.',
    outcome:   'Phase 1 (280 homes + public realm) breaks ground Q2 2025. The design code has been adopted by the municipality as the planning framework for the entire site through to 2034.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80&fit=crop', caption: 'Masterplan visualisation — the green spine threading the district', span: 'wide' },
      { src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80&fit=crop', caption: 'Phase 1 public square — the district\'s civic heart' },
      { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80&fit=crop', caption: 'Residential typology study — varied rooflines for street character' },
      { src: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1400&q=80&fit=crop', caption: 'Green corridor — connecting the district to Bijlmer Park', span: 'wide' },
    ],
    specs: [
      { label: 'Site Area',    value: '14.5 ha'     },
      { label: 'Homes',        value: '1,200 units' },
      { label: 'Office',       value: '35,000 m²'   },
      { label: 'Public Realm', value: '4.2 ha'      },
      { label: 'Phase 1',      value: 'Q2 2025'     },
      { label: 'Completion',   value: '2034 (est.)' },
    ],
    team:   ['Principal Architect', 'Urban Designer', '3× Project Architects', 'Landscape Architect', 'Transport Planner'],
    awards: ['Dutch Design Award — Shortlisted 2024'],
    nextSlug: 'silhouette-residence',
    prevSlug: 'dunes-private-villa',
  },
  // Stub entries for remaining slugs so prev/next links resolve
  ...['canopy-pavilion','westgate-conversion','grove-headquarters','harbour-house','foundry-arts','cedar-house','parkline-tower'].map((slug, i) => ({
    id: 10 + i, slug,
    title: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    category: 'Residential' as const, year: 2022, location: 'Various', area: '—',
    client: 'Private', duration: '—', program: '—',
    status: 'Completed' as const, featured: false,
    cover: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1800&q=85&fit=crop',
    coverAlt: slug,
    tags: [], pullQuote: '',
    overview: '', challenge: '', approach: '', outcome: '',
    gallery: [], specs: [], team: [], awards: [],
    nextSlug: 'silhouette-residence',
    prevSlug: 'arena-district',
  })),
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ─── Reading progress bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setPct(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 2, background: 'rgba(26,60,94,0.06)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-gold)', transition: 'width 0.05s linear' }} />
    </div>
  );
}

// ─── Parallax hero ────────────────────────────────────────────────────────────
function Hero({ project }: { project: ProjectDetail }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 700], [0, 180]);

  return (
    <div ref={heroRef} className="relative overflow-hidden"
      style={{ height: 'clamp(520px, 78vh, 900px)', background: '#0d1a26' }}>

      {/* Parallax background */}
      <motion.div
        style={{ y: imgY, position: 'absolute', inset: '-18% 0', backgroundImage: `url('${project.cover}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden="true"
      />

      {/* Layered gradient — strong at bottom, gentle at top */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(13,26,38,0.3) 0%, rgba(13,26,38,0.25) 35%, rgba(13,26,38,0.75) 72%, rgba(13,26,38,0.97) 100%)',
      }} aria-hidden="true" />

      {/* Subtle geometry */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <line x1="480" y1="0" x2="480" y2="900" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="960" y1="0" x2="960" y2="900" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        <line x1="0" y1="900" x2="1440" y2="0" stroke="rgba(201,168,76,0.06)" strokeWidth="1.5"/>
      </svg>

      {/* Content */}
      <div className="container-main absolute inset-0 flex flex-col justify-between py-10 md:py-14">

        {/* Top: breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2"
          aria-label="Breadcrumb"
        >
          {[
            { label: 'Home',      to: '/'          },
            { label: 'Portfolio', to: '/portfolio' },
          ].map(({ label, to }) => (
            <span key={to} className="flex items-center gap-2">
              <Link to={to} className="no-underline transition-colors duration-200"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >{label}</Link>
              <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem' }}>／</span>
            </span>
          ))}
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
            {project.title}
          </span>
        </motion.nav>

        {/* Bottom: title block */}
        <div>
          {/* Category + status pill */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="flex items-center gap-4 flex-wrap mb-5"
          >
            <div className="flex items-center gap-2.5">
              <div style={{ width: 28, height: 1, background: 'var(--color-gold)', flexShrink: 0 }}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
                {project.category}
              </span>
            </div>
            {project.status !== 'Completed' && (
              <>
                <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)', display: 'block', flexShrink: 0 }}/>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.56rem',
                  letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                  color: project.status === 'On Site' ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)',
                  background: 'rgba(10,18,28,0.55)', backdropFilter: 'blur(8px)', padding: '3px 10px',
                }}>
                  ● {project.status}
                </span>
              </>
            )}
          </motion.div>

          {/* Title — word-by-word reveal (mirrors PortfolioPage hero) */}
          <h1 className="mb-6" style={{ margin: '0 0 1.5rem' }}>
            {project.title.split(' ').map((word, i, arr) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ y: '105%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.72, delay: 0.32 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  marginRight: i < arr.length - 1 ? '0.27em' : 0,
                  fontFamily: 'var(--font-display)', fontWeight: 300,
                  fontSize: 'clamp(2.6rem, 7vw, 7rem)',
                  lineHeight: 0.9,
                  color: i === arr.length - 1 ? 'rgba(255,255,255,0.38)' : 'white',
                  fontStyle: i === arr.length - 1 ? 'italic' : 'normal',
                  overflow: 'hidden',
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {[
              { label: 'Location', value: project.location },
              { label: 'Year',     value: String(project.year) },
              { label: 'Area',     value: project.area },
              { label: 'Client',   value: project.client },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-2.5">
                {i > 0 && <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)', display: 'block', flexShrink: 0 }}/>}
                <div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.54rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 2 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Tags strip ───────────────────────────────────────────────────────────────
function TagsStrip({ tags, awards }: { tags: string[]; awards: string[] }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(26,26,26,0.07)', background: 'var(--color-bg)' }}>
      <div className="container-main py-4 flex flex-wrap items-center gap-3">
        {tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 400,
            color: 'rgba(26,26,26,0.5)',
            border: '1px solid rgba(26,26,26,0.12)',
            padding: '3px 12px',
          }}>{tag}</span>
        ))}
        {awards.slice(0, 2).map(award => (
          <span key={award} className="flex items-center gap-1.5" style={{
            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
            color: '#8a6a1f',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            padding: '3px 10px',
          }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="var(--color-gold)" strokeWidth="1.4">
              <polygon points="5,1 6.2,3.6 9,4.1 7,6 7.5,8.9 5,7.5 2.5,8.9 3,6 1,4.1 3.8,3.6"/>
            </svg>
            {award.split(' — ')[0].replace(/\d{4}/, '').trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky side nav ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'challenge', label: 'Challenge' },
  { id: 'approach',  label: 'Approach'  },
  { id: 'outcome',   label: 'Outcome'   },
  { id: 'gallery',   label: 'Gallery'   },
  { id: 'specs',     label: 'Specs'     },
];

function SideNav() {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.35, rootMargin: '-8% 0px -58% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <aside className="hidden xl:flex flex-col gap-0.5 sticky self-start"
      style={{ top: 'calc(var(--nav-height) + 3.5rem)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.54rem',
        letterSpacing: '0.24em', textTransform: 'uppercase',
        color: 'rgba(26,26,26,0.28)', margin: '0 0 1rem', fontWeight: 500 }}>
        Contents
      </p>
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center gap-3 text-left focus:outline-none"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            <motion.div
              animate={{ width: isActive ? 22 : 10, background: isActive ? 'var(--color-gold)' : 'rgba(26,26,26,0.18)' }}
              transition={{ duration: 0.28 }}
              style={{ height: 1, flexShrink: 0 }}
            />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.61rem',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: isActive ? 'var(--color-ink)' : 'rgba(26,26,26,0.32)',
              fontWeight: isActive ? 600 : 400, transition: 'color 0.2s',
            }}>{label}</span>
          </button>
        );
      })}
    </aside>
  );
}

// ─── Text narrative section ───────────────────────────────────────────────────
function NarrativeSection({ id, eyebrow, heading, body, hasPullQuote, pullQuote }: {
  id: string; eyebrow: string; heading: string; body: string;
  hasPullQuote?: boolean; pullQuote?: string;
}) {
  const { ref, vis } = useReveal(0.12);
  return (
    <motion.section
      ref={ref} id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 md:py-14"
      style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }}
    >
      {/* Eyebrow */}
      <div className="flex items-center gap-3 mb-5">
        <div style={{ width: 22, height: 1, background: 'var(--color-gold)', flexShrink: 0 }}/>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
          letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
          {eyebrow}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Heading col */}
        <div className="md:col-span-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1.65rem, 3vw, 2.8rem)', color: 'var(--color-ink)',
            margin: 0, lineHeight: 1.08 }}>
            {heading}
          </h2>
        </div>
        {/* Body col */}
        <div className="md:col-span-8">
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: 'clamp(0.9rem, 1.1vw, 1.02rem)', lineHeight: 1.88,
            color: 'rgba(26,26,26,0.62)', margin: 0 }}>
            {body}
          </p>
          {/* Inline pull-quote for overview section */}
          {hasPullQuote && pullQuote && (
            <motion.blockquote
              initial={{ opacity: 0, x: -12 }}
              animate={vis ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="mt-8 mb-0"
              style={{
                margin: '2.5rem 0 0',
                paddingLeft: '1.5rem',
                borderLeft: '2px solid var(--color-gold)',
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
                fontStyle: 'italic', fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
                color: 'var(--color-ink)', lineHeight: 1.4, margin: 0,
                letterSpacing: '-0.01em',
              }}>
                "{pullQuote}"
              </p>
            </motion.blockquote>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Full-bleed image break ───────────────────────────────────────────────────
function ImageBreak({ src, caption }: { src: string; caption: string }) {
  const { ref, vis } = useReveal(0.06);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={vis ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
      style={{ aspectRatio: '21/8', margin: '0 calc(-1 * var(--container-px, 1.5rem))', background: 'rgba(26,60,94,0.06)' }}
    >
      <img src={src} alt={caption} loading="lazy"
        className="w-full h-full object-cover"
        style={{ transition: 'transform 12s ease', transform: vis ? 'scale(1.03)' : 'scale(1.08)' }}
      />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,18,28,0.45) 0%, transparent 40%)' }}/>
      <p className="absolute bottom-0 right-0 mb-4 mr-5"
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.66rem', fontStyle: 'italic',
          color: 'rgba(255,255,255,0.5)', margin: '0 1.25rem 1rem 0' }}>
        {caption}
      </p>
    </motion.div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ images }: { images: GalleryImage[] }) {
  const { ref, vis } = useReveal(0.06);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Close lightbox on Escape
  useEffect(() => {
    if (lightbox === null) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(i + 1, images.length - 1) : null);
      if (e.key === 'ArrowLeft')  setLightbox(i => i !== null ? Math.max(i - 1, 0) : null);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightbox, images.length]);

  return (
    <section ref={ref} id="gallery"
      className="py-12 md:py-14"
      style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div style={{ width: 22, height: 1, background: 'var(--color-gold)', flexShrink: 0 }}/>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
          letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
          Photography
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
          color: 'rgba(26,26,26,0.28)', marginLeft: 4 }}>
          {images.length} images
        </span>
      </motion.div>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {images.map((img, i) => {
          const isWide = img.span === 'wide';
          return (
            <motion.div
              key={i}
              className={isWide ? 'col-span-12 md:col-span-8' : 'col-span-12 sm:col-span-6 md:col-span-4'}
              initial={{ opacity: 0, y: 28 }}
              animate={vis ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="group w-full text-left focus:outline-none block"
                onClick={() => setLightbox(i)} aria-label={`Enlarge: ${img.caption}`}>
                <div className="relative overflow-hidden"
                  style={{ aspectRatio: isWide ? '16/9' : '4/3', background: 'rgba(26,60,94,0.05)' }}>
                  <img src={img.src} alt={img.caption} loading="lazy"
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  {/* Hover scrim + expand icon */}
                  <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, transparent 60%, rgba(26,60,94,0.55) 100%)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M5 1H1v4M15 5V1h-4M1 11v4h4M11 15h4v-4"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-2.5" style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
                  fontWeight: 300, fontStyle: 'italic', color: 'rgba(26,26,26,0.4)', lineHeight: 1.45 }}>
                  {img.caption}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(8,14,20,0.97)', backdropFilter: 'blur(16px)' }}
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full mx-4 md:mx-12 max-w-5xl"
              onClick={e => e.stopPropagation()}
              style={{ margin: 0 }}
            >
              <img src={images[lightbox].src} alt={images[lightbox].caption}
                className="w-full object-contain" style={{ maxHeight: '78vh' }}/>
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', margin: 0 }}>
                  {images[lightbox].caption}
                </p>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                  letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {lightbox + 1} / {images.length}
                </span>
              </figcaption>

              {/* Prev */}
              {lightbox > 0 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                  className="absolute top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ left: -52, background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.38)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
                >
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M11 3L6 8l5 5"/></svg>
                </button>
              )}
              {/* Next */}
              {lightbox < images.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                  className="absolute top-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ right: -52, background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.38)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
                >
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 3l5 5-5 5"/></svg>
                </button>
              )}
              {/* Close */}
              <button onClick={() => setLightbox(null)}
                className="absolute focus:outline-none"
                style={{ top: -44, right: 0, background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l12 12M14 2L2 14"/></svg>
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Specs & credits ──────────────────────────────────────────────────────────
function Specs({ project }: { project: ProjectDetail }) {
  const { ref, vis } = useReveal(0.08);
  const allSpecs = [
    { label: 'Client',   value: project.client   },
    { label: 'Duration', value: project.duration  },
    { label: 'Program',  value: project.program   },
    ...project.specs,
  ];

  return (
    <section ref={ref} id="specs"
      className="py-12 md:py-14"
      style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-10"
      >
        <div style={{ width: 22, height: 1, background: 'var(--color-gold)', flexShrink: 0 }}/>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
          letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
          Project Data
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Specs grid */}
        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 18 }}
          animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.06 }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.57rem',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(26,26,26,0.3)', fontWeight: 500, margin: '0 0 1rem' }}>
            Technical
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ background: 'rgba(26,26,26,0.06)' }}>
            {allSpecs.map(({ label, value }) => (
              <div key={label} className="py-5 px-5" style={{ background: 'var(--color-bg)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.54rem',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'rgba(26,26,26,0.32)', display: 'block', marginBottom: 5, fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem',
                  color: 'var(--color-ink)', fontWeight: 400, lineHeight: 1.4 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team + Awards sidebar */}
        <motion.div
          className="lg:col-span-4 flex flex-col gap-8"
          initial={{ opacity: 0, y: 18 }}
          animate={vis ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.14 }}
        >
          {/* Team */}
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.57rem',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(26,26,26,0.3)', fontWeight: 500, margin: '0 0 1rem' }}>
              Project Team
            </p>
            <div className="flex flex-col gap-2.5">
              {project.team.map(member => (
                <div key={member} className="flex items-center gap-2.5">
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0 }}/>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: 'rgba(26,26,26,0.62)', fontWeight: 300 }}>
                    {member}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Awards */}
          {project.awards.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.57rem',
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.3)', fontWeight: 500, margin: '0 0 1rem' }}>
                Recognition
              </p>
              <div className="flex flex-col gap-3">
                {project.awards.map(award => (
                  <div key={award} className="flex items-start gap-2.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      stroke="var(--color-gold)" strokeWidth="1.3" style={{ marginTop: 2, flexShrink: 0 }}>
                      <polygon points="5,0.5 6.5,3.6 10,4.1 7.5,6.6 8.1,10 5,8.2 1.9,10 2.5,6.6 0,4.1 3.5,3.6"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem',
                      color: 'rgba(26,26,26,0.58)', fontWeight: 300, lineHeight: 1.45 }}>
                      {award}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Prev / Next project nav ──────────────────────────────────────────────────
function ProjectNav({ prevSlug, nextSlug }: { prevSlug: string; nextSlug: string }) {
  const { ref, vis } = useReveal(0.15);
  const prevP = PROJECTS.find(p => p.slug === prevSlug);
  const nextP = PROJECTS.find(p => p.slug === nextSlug);

  const NavCard = ({ project, dir }: { project: ProjectDetail | undefined; dir: 'prev' | 'next' }) => {
    const [hov, setHov] = useState(false);
    if (!project) return <div className="flex-1" />;
    return (
      <Link to={`/portfolio/${project.slug}`}
        className="flex-1 no-underline block relative overflow-hidden"
        style={{ aspectRatio: '16/7', minHeight: 160 }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <img src={project.cover} alt={project.title} loading="lazy"
          className="w-full h-full object-cover absolute inset-0"
          style={{ transition: 'transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
            transform: hov ? 'scale(1.06)' : 'scale(1)' }}
        />
        {/* Gradient — stronger toward nav label side */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to ${dir === 'prev' ? 'right' : 'left'}, rgba(13,26,38,0.92) 0%, rgba(13,26,38,0.45) 55%, rgba(13,26,38,0.15) 100%)`,
          transition: 'opacity 0.4s', opacity: hov ? 1 : 0.88,
        }} />
        <div className={`absolute inset-0 flex flex-col justify-center gap-2 px-8 md:px-10 ${dir === 'next' ? 'items-end text-right' : ''}`}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.58rem',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-gold)', display: 'flex', alignItems: 'center',
            gap: 7, flexDirection: dir === 'next' ? 'row-reverse' : 'row',
          }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              {dir === 'prev' ? <path d="M11 3L6 8l5 5"/> : <path d="M5 3l5 5-5 5"/>}
            </svg>
            {dir === 'prev' ? 'Previous' : 'Next'}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
            fontSize: 'clamp(1rem, 2.2vw, 1.9rem)', color: 'white', lineHeight: 1.1 }}>
            {project.title}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.42)', fontWeight: 300 }}>
            {project.location} · {project.year}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div ref={ref} style={{ background: '#0d1a26' }}>
      <div className="container-main pt-6 pb-3">
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.56rem',
          letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: 0 }}>
          Continue Exploring
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={vis ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row"
      >
        <NavCard project={prevP} dir="prev" />
        <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}/>
        <NavCard project={nextP} dir="next" />
      </motion.div>
      <div className="container-main py-5 flex justify-center">
        <Link to="/portfolio" className="inline-flex items-center gap-2 no-underline group"
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: 2,
            transition: 'color 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--color-gold)'; el.style.borderColor = 'rgba(201,168,76,0.4)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.28)'; el.style.borderColor = 'rgba(255,255,255,0.12)'; }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 3L6 8l5 5"/></svg>
          All Projects
        </Link>
      </div>
    </div>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-7 py-40"
      style={{ background: 'var(--color-bg)' }}>
      <div style={{ width: 64, height: 64, border: '1px solid rgba(26,26,26,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="rgba(26,26,26,0.18)" strokeWidth="1">
          <rect x="1" y="1" width="24" height="24"/><path d="M9 13h8M13 9v8"/>
        </svg>
      </div>
      <div className="text-center">
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem',
          color: 'rgba(26,26,26,0.3)', margin: '0 0 0.5rem' }}>Project not found</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem',
          color: 'rgba(26,26,26,0.28)', margin: 0 }}>This project may not exist or has been moved.</p>
      </div>
      <Link to="/portfolio" style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        background: 'var(--color-brand)', color: 'white', padding: '0.85rem 2rem',
        textDecoration: 'none', transition: 'filter 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
      >
        ← Back to Portfolio
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const project   = PROJECTS.find(p => p.slug === slug);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [slug]);

  // Keyboard: ← → arrows for project nav, Esc to go back
  useEffect(() => {
    if (!project) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate(`/portfolio/${project.nextSlug}`);
      if (e.key === 'ArrowLeft')  navigate(`/portfolio/${project.prevSlug}`);
      if (e.key === 'Escape')     navigate('/portfolio');
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [project, navigate]);

  if (!project) return <NotFound />;

  // Pick 3rd gallery image for the mid-article image break
  const breakImg = project.gallery[2] ?? project.gallery[0];

  return (
    <>
      <ReadingProgress />
      <Hero project={project} />
      <TagsStrip tags={project.tags} awards={project.awards} />

      {/* Body */}
      <div style={{ background: 'var(--color-bg)' }}>
        <div className="container-main">
          {/* Two-col layout: side nav + content */}
          <div className="grid grid-cols-1 xl:grid-cols-[188px_1fr] gap-0 xl:gap-16">
            <SideNav />

            <main className="min-w-0 pb-6">
              <NarrativeSection
                id="overview" eyebrow="Overview" heading="The Project"
                body={project.overview} hasPullQuote pullQuote={project.pullQuote}
              />
              <NarrativeSection
                id="challenge" eyebrow="The Brief" heading="Challenge"
                body={project.challenge}
              />

              {/* Full-bleed visual break between challenge & approach */}
              {breakImg && <ImageBreak src={breakImg.src} caption={breakImg.caption} />}

              <NarrativeSection
                id="approach" eyebrow="Design" heading="Our Approach"
                body={project.approach}
              />
              <NarrativeSection
                id="outcome" eyebrow="Result" heading="Outcome"
                body={project.outcome}
              />

              {project.gallery.length > 0 && <Gallery images={project.gallery} />}
              <Specs project={project} />
            </main>
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div style={{ background: 'var(--color-brand)', padding: 'clamp(3rem, 7vw, 5.5rem) 0',
        position: 'relative', overflow: 'hidden' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="240" x2="1440" y2="0" stroke="rgba(201,168,76,0.06)" strokeWidth="1.5"/>
          <line x1="720" y1="0" x2="720" y2="240" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
        </svg>
        <div className="container-main relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: 24, height: 1, background: 'var(--color-gold)', flexShrink: 0 }}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem',
                letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 500 }}>
                Work with us
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 3.4rem)', color: 'white', margin: 0, lineHeight: 1.05 }}>
              Interested in a similar{' '}
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.38)' }}>project?</em>
            </h2>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <Link to="/contact" className="inline-flex items-center gap-2.5 no-underline group"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: '0.67rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                background: 'var(--color-gold)', color: 'var(--color-ink)',
                padding: '0.95rem 2.2rem', transition: 'filter 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'}
            >
              Get in Touch
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path d="M3 13L13 3M13 3H6M13 3v7"/>
              </svg>
            </Link>
            <Link to="/services" className="no-underline transition-colors duration-200"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.67rem',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.38)',
                borderBottom: '1px solid rgba(255,255,255,0.16)', paddingBottom: 2 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>

      <ProjectNav prevSlug={project.prevSlug} nextSlug={project.nextSlug} />
    </>
  );
}
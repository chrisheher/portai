'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import TumblingShapes from './TumblingShapes';

// Inline Carousel Component - SPLIT SCREEN LAYOUT
function CarouselContent({ carouselData }: { 
  carouselData: { 
    images: { src: string; alt: string; url?: string }[];
    title: string;
    description?: string;
    campaignListDescription?: string;
    impact?: { stat: string }[];
  } 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselData.images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselData.images.length) % carouselData.images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    if (carouselData.images[currentIndex].url) {
      window.open(carouselData.images[currentIndex].url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[601] bg-[#dcd3c3] flex">
      {/* LEFT HALF - Description & Impact */}
      <div className="w-1/2 h-full overflow-y-auto p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto">
          {/* Title */}
          <h2 className="text-[#8c6a48] text-3xl font-bold mb-6">
            Cincoro Tequila | brand launch
          </h2>

          {/* Campaign List Description */}
          {carouselData.campaignListDescription && (
            <p className="text-[#8c6a48] text-lg leading-relaxed mb-8">
              {carouselData.campaignListDescription}
            </p>
          )}

          {/* Description */}
          {carouselData.description && (
            <p className="text-[#8c6a48] text-base leading-relaxed mb-8">
              {carouselData.description}
            </p>
          )}

          {/* Impact Stats */}
          {carouselData.impact && carouselData.impact.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[#8c6a48] text-2xl font-semibold mb-4">Impact</h3>
              {carouselData.impact.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#8c6a48] mt-2 flex-shrink-0" />
                  <p className="text-[#8c6a48] text-base leading-relaxed">
                    {item.stat}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT HALF - Carousel */}
      <div className="w-1/2 h-full flex items-center justify-center p-12">
        <div className="pt-8 w-xl max-w-2xl">
          {/* Carousel Container */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl">
            {/* Main Image */}
            <div
              onClick={handleImageClick}
              className="w-full h-full flex items-center justify-center"
              style={{ cursor: carouselData.images[currentIndex].url ? 'pointer' : 'default' }}
            >
              <img
                src={carouselData.images[currentIndex].src}
                alt={carouselData.images[currentIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {carouselData.images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[rgba(94,70,49,0.95)] transition-all z-10"
                >
                  ‹
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[rgba(94,70,49,0.95)] transition-all z-10"
                >
                  ›
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {carouselData.images.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {carouselData.images.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {carouselData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="w-16 h-16 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: index === currentIndex ? '3px solid #dcd3c3' : '2px solid rgba(220,211,195,0.5)',
                    opacity: index === currentIndex ? 1 : 0.6
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Instagram link hint */}
          {carouselData.images[currentIndex].url && (
            <p className="text-center text-[#dcd3c3] text-sm mt-4 italic">
              Click image to view on Instagram
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface Link {
  name: string;
  url: string;
  shape?: 'letterC' | 'letterH' | 'letterR' | 'letterI' | 'letterS';
}

interface Project {
  title: string;
  links?: Link[];
  category?: string;
  type?: 'project' | 'link' | 'campaign' | 'image' | 'question';
  url?: string;
  promptMode?: string;
  description?: string;
  campaignListDescription?: string;
  imageSrc?: string;
  images?: { src: string; alt: string; url?: string }[];
  impact?: { stat: string }[];
  ATS?: string;
  campaignTitle?: string;
}

interface ChatLandingProps {
  config: {
    projects: Project[];
  };
  onChatCenter?: (centered: boolean) => void;
  onSkillsClick?: () => void;
  onDevinModeClick?: () => void;
  onScoutModeClick?: () => void;
  onCooperModeClick?: () => void;
  onCreativeModeClick?: () => void;
  onInsecureModeClick?: () => void;
  onJobAnalysisOpen?: () => void;
  onJobAnalysisClose?: () => void;
  hideDescriptionBox?: boolean;
  activePromptDescription?: string;
}

function ChatLanding({ 
  config, 
  onChatCenter, 
  onSkillsClick, 
  onDevinModeClick,
  onScoutModeClick,
  onCooperModeClick,
  onCreativeModeClick,
  onInsecureModeClick,
  onJobAnalysisOpen,
  onJobAnalysisClose,
  hideDescriptionBox = false,
  activePromptDescription
}: ChatLandingProps) {
  const [displayedItems, setDisplayedItems] = useState<Project[]>([]);
  const [mode, setMode] = useState<'initial' | 'links'>('initial');
  const [chatCentered, setChatCentered] = useState(false);
  const [promptModeActive, setPromptModeActive] = useState(false);
  const [localDescription, setLocalDescription] = useState<string | null>(null);  
  const [carouselData, setCarouselData] = useState<{
    images: { src: string; alt: string; url?: string }[];
    title: string;
    description?: string;
    campaignListDescription?: string;
    impact?: { stat: string }[];
  } | null>(null);
  
  // NEW: Track which section (C, I, S) is active
  const [activeSection, setActiveSection] = useState<'C' | 'I' | 'S' | null>(null);

  // NEW: Section descriptions for C, I, S
  const sectionDescriptions = {
    C: 'High-impact content that drives pipeline',
    I: 'Written for the user who scans a screen, not reads a page. Designed from the mobile state outward and with the F pattern in mind.',
    S: 'Written at eye level to pique curiosity, add value, and generate brand traction'
  };

  // Debug logging for displayedItems
  useEffect(() => {
    console.log('🔍 displayedItems changed:', displayedItems);
    console.log('🔍 Mode:', mode);
    console.log('🔍 chatCentered:', chatCentered);
  }, [displayedItems, mode, chatCentered]);

  // Force background color on body element based on mode
  useEffect(() => {
    const backgroundColor = mode === 'initial' ? '#25202029' : '#634c4cff';
    
    document.body.style.setProperty('background-color', backgroundColor, 'important');
    document.documentElement.style.setProperty('background-color', backgroundColor, 'important');
    
    const parentContainer = document.body.firstElementChild as HTMLElement;
    if (parentContainer && parentContainer.classList.contains('flex')) {
      parentContainer.style.setProperty('background-color', backgroundColor, 'important');
    }
    
    console.log('🎨 Background FORCED to:', backgroundColor, 'for mode:', mode);
    
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [mode, chatCentered]);

  // Initial 5 letters (C, H, R, I, S) - NEW STRUCTURE
  const initialProjects = useMemo(() => [
    { title: 'copywriting', type: 'project' as const },
    { title: 'humanized ai', type: 'project' as const },
    { title: 'resume scan tool', type: 'project' as const },
    { title: 'interactive/ux', type: 'project' as const },
    { title: 'simplified technical content', type: 'project' as const }
  ], []);

  // S-related links (simplified technical content - formerly R)
  const sLinks: Link[] = useMemo(() => [
    { name: "blog | Why debugging Javascript sucks", url: "https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/", shape: 'letterC' },
    { name: "white paper | More Tools, More Problems", url: "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf", shape: 'letterH' },
    { name: "experiential content | Aviation turboprop", url: "https://www.ceros.com/inspire/project/ge-aviation-1", shape: 'letterS' },
    { name: "blog | Measuring UX with Web Vitals", url: "https://blog.sentry.io/measuring-user-experience-with-web-vitals/", shape: 'letterI' },
    { name: "blog | Great moments in application monitoring", url: "https://blog.sentry.io/great-moments-in-application-monitoring/", shape: 'letterS' },
    { name: "guide | Safety, smarter: AI and your work site", url: "https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site", shape: 'letterH' },
    { name: "guide | Ultimate guide to facade inspections", url: "https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections", shape: 'letterH' },
    { name: "blog | Python 3 compatibility", url: "https://blog.sentry.io/python-3-compatibility-what-to-know/", shape: 'letterI' }
  ], []);

  // I-related links (interactive/ux)
  const iLinks: Link[] = useMemo(() => [
    { name: "Sentry | Enterprise page", url: "https://www.sentry.dev/for/enterprise/" },
    { name: "Sentry | performance monitoring", url: "https://www.sentry.dev/solutions/application-performance-monitoring/" },
    { name: "Sentry | full stack monitoring", url: "https://sentry.io/for/full-stack/" },
    { name: "Airbnb | career site", url: "https://careers.airbnb.com" },
    { name: "DroneDeploy | Ground robotics", url: "https://example.com/link5" },
    { name: "DroneDeploy | Safety AI", url: "https://www.dronedeploy.com/product/safety-ai" },
    { name: "DroneDeploy | Data on Demand ", url: "https://www.dronedeploy.com/data-on-demand" },
    { name: "DroneDeploy | industrial inspection", url: "https://www.dronedeploy.com/product/robotic-industrial-inspection" }
  ], []);

  // ========== CAMPAIGN DATA ==========
  const campaignData = useMemo(() => ({
    'safety-ai': {
      title: 'DroneDeploy | Safety AI ',
      type: 'campaign' as const,
      links: [
        { name: 'awareness | use case', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
        { name: 'awareness | white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
        { name: 'consideration | blog post', url: 'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site' },
        { name: 'decision | product page', url: 'https://www.dronedeploy.com/product/safety-ai' }
      ],
      description: 'GTM content campaign',
      campaignListDescription: 'Worksite injuries cost the construction industry $5 billion annually. DroneDeploy\'s Safety AI uses computer vision to identify safety violations in real-time, turning reactive incident reports into proactive prevention.',
      impact: [
        { stat: '$10M+ pipeline influence from Safety AI content' },
        { stat: '70 companies engaged in trial walks, indicating healthy conversion from awareness to hands-on experience.' },
        { stat: '~3k total landing page visits across top-of-funnel content.' }
      ]
    },
    'sentry-performance': {
      title: 'Sentry Performance ',
      type: 'campaign' as const,
      links: [
        { name: 'Blog post', url: 'https://blog.sentry.io/how-slow-is-slow/' },
        { name: 'Product release', url: 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/' },
        { name: 'product page', url: 'https://sentry.io/solutions/application-performance-monitoring/' },
        { name: 'customer story', url: 'https://sentry.io/customers/atlassian-jira/' },
        { name: 'webinar', url: 'https://www.youtube.com/watch?v=J0tAK6dKY3Y/' }
      ],
      images: [],
        description: 'GTM content campaign',

      campaignListDescription: 'Product releases run the risk of getting bogged down in their own technical benefits. For Sentry\'s Performance monitoring release, this meant turning jargony features (such as improved visibility into p95 response times) into a simple, differentiating insight -- See Slow Faster',
      impact: [
        { stat: '$1.8M in Performance Product Pipeline' },
        { stat: '12,400 total landing page visits during awareness stage' },
        { stat: 'Campaign hub generated 3,480 visits (2.3x site average)' },
        { stat: '312 companies initiated trial during launch window (vs. 89 in pre-launch quarter)' }
      ]
    },
    'sentry-dogfooding': {
      title: 'Sentry Dogfooding Chronicles',
      type: 'campaign' as const,
      links: [
        { name: 'Go-Getting Lazy loading', url: 'https://blog.sentry.io/go-getting-lazy-loading/', shape: 'letterC' as const },
        { name: 'Using Sentry Performance to get Sentry Performant', url: 'https://blog.sentry.io/using-sentry-performance-to-make-sentry-performant', shape: 'letterH' as const },
        { name: 'Verifying large refactors with Sentry', url: 'https://blog.sentry.io/verifying-large-refactors-in-production-with-sentry/?original_referrer=https%3A%2F%2Fwww.google.com%2F', shape: 'letterC' as const },
        { name: 'Thinking backward, moving forward', url: 'https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward' },
        { name: 'Patching a flood of 404s', url: 'https://blog.sentry.io/patching-a-flood-of-404s/' }
      ],
      impact: [
        { stat: 'Revenue tripled in the two years since series launch' },
        { stat: 'Performance product grew 240% largely through product-led channels' },
        { stat: '$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution' },
        { stat: 'White paper landing pages drove 34,200 total site visits -- 67% of which were organic' }
      ],
        description: 'syndicated thought leadership series',
      campaignListDescription: 'Dogfooding is the process in which a company uses its own product as a quality control mechanism. This concept was a perfect fit for code monitoring platform Sentry to showcase how its software engineers used the platform to improve the platform.Creating stories out of mundane hiccups in software development established Sentry as a thought leader in the code monitoring space without sounding preachy or pedantic, while also widening brand exposure for content syndication across key industry blogs.' 
    },
    'hp-presence': {
      title: 'HP Presence',
      type: 'campaign' as const,
      links: [
        { name: 'The New era of work', url: 'https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf' },
        { name: 'A New Blueprint for an Uncertain World', url: 'https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf' },
        { name: 'Get ready today to do tomorrow\'s work', url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf' },
        { name: 'The New Office For the Way People Want to Work', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf' }
      ],
      description: 'hybrid work white paper series',
      campaignListDescription: 'The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP\'s content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for distributed workforces.',
      impact: [
        { stat: '8,940 total white paper downloads across all 10 assets in launch quarter' },
        { stat: '~2.5k MQLs generated from white paper download forms' },
        { stat: '$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution' },
        { stat: 'White paper landing pages drove 34,200 total site visits -- 67% of which were organic' }
      ]
    },
    'cincoro': {
      title: 'Cincoro tequila | brand launch',
      type: 'campaign' as const,
      impact: [
        { stat: 'Created content processes and calendar delivering 2-3x higher engagement rates due to consistent posting schedules' },
        { stat: 'Built social audience to 110K+ followers across platforms, exceeding brands with decades of history (Don Julio had ~97K Instagram in 2021)' },
        { stat: 'brand grew from zero to 1.5M bottles sold' }
      ],
      images: [
        { src: '/img/cinc_playing.gif', alt: 'Cincoro post 1', url: 'https://www.instagram.com/p/CNqhlFoLAuU/' },
        { src: '/img/image169.jpeg', alt: 'Cincoro post 2', url: 'https://www.instagram.com/p/CpgLHfgurJr/' },
        { src: '/img/cinc3.gif', alt: 'Cincoro post 3', url: 'https://www.instagram.com/p/CVlF6J5A9_O/' },
        { src: '/img/cincauto.png', alt: 'Cincoro post 4', url: 'https://www.instagram.com/cincoro/reel/CNqhlFoLAuU/' },
        { src: '/img/cinc_allgolf.png', alt: 'Cincoro post 5', url: 'https://www.instagram.com/cincoro/p/CM2vt1lFZoN/' },
        { src: '/img/cinc_two.png', alt: 'Cincoro post 6', url: 'https://www.instagram.com/cincoro/reel/COawLN1rgGN/' },
        { src: '/img/cinc_coil.png', alt: 'Cincoro post 7', url: 'https://www.instagram.com/cincoro/reel/CObVXBIFp2C/' },
        { src: '/img/cincteam.png', alt: 'Cincoro post 8', url: 'https://www.instagram.com/p/CPG-y9DFjIY/' }
      ],
         description: 'brand launch across social media channels',
      campaignListDescription: 'George Clooney. The Rock. Kendall Jenner. Bryan Cranston. Celebrity tequila is a crowded space. So when Michael Jordan and four other NBA owners started their own tequila company, I was there to help them find a way to help their brand stand out among the stars. Cincoro translates to "five rings". And so the story of Cincoro Tequila is the passion and competitive spirit its five owners share as they each chase their next championship ring.'
    },
    'robotics': {
      title: 'DroneDeploy | Ground Robotics',
      type: 'campaign' as const,
      links: [
        { name: 'Ground Robotics', url: 'https://www.dronedeploy.com/product/robotics' },
        { name: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
        { name: 'Dock Automation', url: 'https://www.dronedeploy.com/product/dock-automation' }
      ],
      description: 'Boston Dynamics partnership content',
      campaignListDescription: 'Working in partnership with Boston Dynamics, DroneDeploy\'s industrial inspection platform captures frequent and consistent data on assets that need regular monitoring in ways which scale up site visibility while dialing down man hours.',
      impact: [
        { stat: '8.5% deals influenced in pipeline' }
      ]
    }
  }), []);

  // ========== INTERACTIVE/UX DUMMY DATA ==========
  const interactiveData = useMemo(() => ({
    'dd-pages': {
      title: 'DroneDeploy | Product pages',
      type: 'campaign' as const,
      links: [
        { name: 'Ground robotics page', url: 'https://www.dronedeploy.com/product/robotics' },
          { name: 'Dock Automation', url: 'https://www.dronedeploy.com/product/dock-automation' },
        { name: 'Data on Demand', url: 'https://www.dronedeploy.com/data-on-demand' },
        { name: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' }
      ],
      campaignListDescription: 'Collaborating with product and sales teams, I piqued curiosity, ensured technical accuracy, and optimized each page by adding cross-links to related solutions and guides for mid- and bottom-funnel engagement.',
      impact: [
        { stat: 'Share of MRR --$2.5m for ground robotics' },
        { stat: 'Engagement rate to take meaningful action 1.7%' },
        { stat: '28% increase in handraisers' }
      ]
    },
    'airbnb': {
      title: 'Airbnb | Career website',
      type: 'campaign' as const,
      links: [
        { name: 'Home page', url: 'https://careers.airbnb.com/' },
        { name: 'Life at airbnb', url: 'https://careers.airbnb.com/life-at-airbnb/' },
        { name: 'Apprentice page', url: 'https://careers.airbnb.com/connect-engineering-apprenticeship/' },
        { name: 'internship page', url: 'https://careers.airbnb.com/internship-programs/' }
      ],
      campaignListDescription: 'As lead writer for Airbnb\’s career website, I developed strategic employer value propositions of their Live and Work Anywhere policy, then executed on that strategy with compelling, user-optimized content.',
      impact: [
        { stat: '72% increase in applications first quarter post launch' },
        { stat: '170% increase in applications from underrepresented groups' },
        { stat: '4,200 organic social shares of career site pages (3.4x increase vs. previous site)'}
      ]
    },
    'sentry-pages': {
      title: 'Sentry | Product pages',
      type: 'campaign' as const,
      links: [
        { name: 'Enterprise page', url: 'https://www.sentry.dev/for/enterprise/' },
        { name: 'Full stack', url: 'https://sentry.io/for/full-stack/' },
        { name: 'Performamce monitoring', url: 'https://www.sentry.dev/solutions/application-performance-monitoring/' },
         { name: 'Mobile development', url: 'https://sentry.io/solutions/mobile-developers/' }
      ],

      campaignListDescription: 'Partnered with software engineers to co-produce content that articualted value propositions and while moving users into trial.',
      impact: [ 
        { stat: 'Internal product release alignment boosted CTR by 15–20% around launch week.' },
        { stat: 'Over 1.1k opportunites captured by form signups' },
        { stat: '15% adoption lift YoY' }
      ]
    },
        'fintech': {
      title: 'Ceros | fintech pages',
      type: 'campaign' as const,
      links: [
        { name: 'Lending Club Quiz', url: 'https://www.ceros.com/inspire/project/study-quiz-desktop' },
                { name: 'Goldman Sachs infographic', url: 'https://www.vox.com/c/ad/21492335/voxcreative-goldman-sachs-sustainability' },
        { name: 'Goldman Sachs linkedin post', url: 'https://www.linkedin.com/posts/goldman-sachs_taking-the-heat-an-infographic-by-goldman-activity-6713949693799366656-Lqqg?utm_source=share&utm_medium=member_desktop&rcm=ACoAAACEJgUBovX20uHgnYWTEh3A2BrZxc9SiOE' },
        { name: 'Morgan Stanley | Sustainability infographic', url: 'https://www.ceros.com/inspire/project/sustainability' }
      ],
    
      campaignListDescription: 'Quick-hitting infographics written to pique the curiosity of time-poor investors as a means of earning their contact credentials on the form gate.',
      impact: [
        { stat: '3x time spent on site compared to .pdf content' },
        { stat: '1.75x SQL leads per month generated' },
        { stat: 'Ceros closed financial clients producing this content while during trial' }
      ]
    },
     'adt': {
      title: 'ADT | career site',
      type: 'campaign' as const,
      links: [
        { name: 'Home page', url: 'https://jobs.adt.com/' },
        { name: 'Smart home consulting', url: 'https://jobs.adt.com/smart-home-consulting/' },
          { name: 'Working at ADT', url: 'https://jobs.adt.com/smart-home-consulting/' },
        { name: 'Early career page', url: 'https://jobs.adt.com/early-career/' }
      ],
  
      campaignListDescription: 'As lead writer for ADT\'s talent website, I developed internal employer value propositions, then executed on those strategies with compelling, talent-facing language.',
      impact: [
        { stat: '15–25% more applications per role.' },
        { stat: ' ~60% growth in annual site traffic' },
        { stat: 'grew application conversion rate from <5% to 11%' }
      ]
    }
  }), []);

  // ========== SIMPLIFIED TECHNICAL CONTENT DUMMY DATA ==========
  const technicalData = useMemo(() => ({
    'gpay': {
      title: 'Google | gpay instrumentation',
      type: 'campaign' as const,
      links: [
        { name: 'API demo (web)', url: 'https://www.youtube.com/watch?v=pZyGYUMZAeg' },
        { name: 'API: What to know', url: 'https://www.youtube.com/watch?v=rP_UAPcIG4I'},
        { name: 'API for android', url: 'https://www.youtube.com/watch?v=SZorG5Hqjzc' }
      ],
      campaignListDescription: ' Google\'s GPay API was designed to be simple. Which meant the content for its tutorial video needed to act likewise. So instead of a smug, stemwinding video that wastes a developer\'s time with phony rapport, I articulated the simplest path to instrumentation.',
      impact: [
        { stat: '35k views during i/o launch event' },
        { stat: '1.5m ARR impact' },
        { stat: '~500 new integrations from live merchants' }
      ]
    },
    'sentry-dev': {
      title: 'Sentry developer content',
      type: 'campaign' as const,
      links: [
        { name: 'Why debugging Javascript sucks', url: 'https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/' },
         { name: 'How slow is slow?', url: 'https://blog.sentry.io/how-slow-is-slow/' },
        { name: 'Python 3 compatibility', url: 'https://blog.sentry.io/python-3-compatibility-what-to-know/' },
        { name: 'Great moments in application monitoring', url: 'https://blog.sentry.io/great-moments-in-application-monitoring/' }
      ],

      campaignListDescription: 'Sentry is an application monitoring platform that tracks various metrics and logs to optimize code health. My role involved creating developer-focused content that simplified complex technical concepts, making them accessible and engaging for a broad audience of software engineers.',
      impact: [
        { stat: 'ARR: $45M → $90M during my tenure  (Series B→C growth).' },
        { stat: '~480 SQL conversions (9.5% attributed to ARR)' },
        { stat: '~150k page visits in total' }
      ]
    },'dronedep': {
      title: 'DroneDeploy technical content',
      type: 'campaign' as const,
      links: [
        { name: 'white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
        { name: 'facade inspections', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
        { name: 'Stockpile', url: 'https://www.dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods' }
      ],
      campaignListDescription: ' Enterprise-grade drone technology fights the perception that drones are nothing more than just some neat plaything. My role at DroneDeploy was to articulate the benefits integrated drone software provides teams at the worksite: improved collaboration, inch-perfect measurements, and a better way of tracking progress.',
      impact: [
        { stat: 'Product pages drove ~450 handraisers among construction professionals,' },
        { stat: '2x handraisers compared to previous content' },
        { stat: '35% increase in demo requests' }
      ]
    },
    'hp': {
      title: 'HP Presence white papers',
      type: 'campaign' as const,
      links: [
        {
          name: 'The new era of work',
          url: "https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf"
      },
          {
          name: "A New Blueprint for an Uncertain World.",
          url: "https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf"
        },
        {
          name: "The New Office For the Way People Want to Work",
          url: "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf"
        }
      ],

      campaignListDescription: 'The pandemic altered the fabric of society. Nowhere was this more evident than the corporate office. Transmission is the world\'s largest independent B2B marketing agency. As content strategy lead on their HP account, my role involved auditing HP\'s content repository, pitching full-funnel activations based on content gaps, and structuring insights for thought leadership content. Specifically, this meant building out HP\'s content strategy so their suite of videoconferencing solutions could lead the hybrid work conversation coming out of the pandemic.',
      impact: [
        { stat: '8,970 total white paper downloads across all 10 assets during launch quarter' },
        { stat: '2,340 MQLs (Marketing Qualified Leads) generated from white paper download forms ' },
        { stat: '$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution ' }
      ]
    },
    'ge': {
      title: 'GE | Experiential content',
      type: 'campaign' as const,
      links: [
        { name: 'Aviation turboprop', url: 'https://www.ceros.com/inspire/project/ge-aviation-1' },
        { name: 'Propulsion tech', url: 'https://www.ceros.com/inspire/project/ge-2' },
        { name: 'Digital transformation', url: 'https://www.ceros.com/inspire/project/digital-transformation' },
           { name: 'Unplanned downtime', url: 'https://www.ceros.com/inspire/project/unplanned-downtime' }
      ],

      campaignListDescription: 'Taking specs and product roadmaps into an immersive digital experience with layered content and strategic calls to action',
      impact: [
        { stat: 'Click-through rate: +15–30%' },
        { stat: 'Lead-to-opportunity conversion: +15–20%' },
        { stat: '30% lift in MQL volume' }
      ]
    }
  }), []);

  // ========== DEEP LINK URL PARAMETER HANDLING ==========
// ========== DEEP LINK URL PARAMETER HANDLING ==========
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const showParam = params.get('show');
  
  if (showParam) {
    console.log('🔗 Deep link detected:', showParam);
    
    // Check if it's a campaign route
    if (campaignData[showParam as keyof typeof campaignData]) {
      const campaign = campaignData[showParam as keyof typeof campaignData];
      console.log('📢 Loading campaign:', campaign.title);
      
      // Handle Cincoro specially (has images, shows carousel)
      if (showParam === 'cincoro' && 'images' in campaign && campaign.images.length > 0) {
        setCarouselData({
          images: campaign.images,
          title: campaign.title,
          campaignListDescription: campaign.campaignListDescription,
          impact: campaign.impact
        });
        setDisplayedItems([campaign]);
        setMode('links');
        return;
      }
      
      // For campaigns with links, show them as tumbling shapes
      if ('links' in campaign && campaign.links.length > 0) {
        const linkShapes = campaign.links.map((link: Link) => ({
          title: link.name,
          url: link.url,
          type: 'link' as const,
          description: campaign.description,
          campaignListDescription: campaign.campaignListDescription,
          impact: campaign.impact,
          campaignTitle: campaign.title
        }));
        setDisplayedItems(linkShapes);
        setMode('links');
        return;
      }
    }
    
    // Check technicalData
    else if (technicalData[showParam as keyof typeof technicalData]) {
      const item = technicalData[showParam as keyof typeof technicalData];
      console.log('📄 Loading technical content:', item.title);
      
      if ('links' in item && item.links.length > 0) {
        const linkShapes = item.links.map((link: Link) => ({
          title: link.name,
          url: link.url,
          type: 'link' as const,
          description: ('description' in item ? item.description : undefined) as string | undefined,
          campaignListDescription: item.campaignListDescription,
          impact: item.impact,
          campaignTitle: item.title
        }));
        setDisplayedItems(linkShapes);
        setMode('links');
        return;
      }
    }
    
    // Check interactiveData
    else if (interactiveData[showParam as keyof typeof interactiveData]) {
      const item = interactiveData[showParam as keyof typeof interactiveData];
      console.log('🎮 Loading interactive content:', item.title);
      
      if ('links' in item && item.links.length > 0) {
        const linkShapes = item.links.map((link: Link) => ({
          title: link.name,
          url: link.url,
          type: 'link' as const,
          description: ('description' in item ? item.description : undefined) as string | undefined,
          campaignListDescription: item.campaignListDescription,
          impact: item.impact,
          campaignTitle: item.title
        }));
        setDisplayedItems(linkShapes);
        setMode('links');
        return;
      }
    }
    
    // Handle section routes
    const sectionRoutes: Record<string, () => void> = {
      'humanized-ai': () => {
        setLocalDescription('Humanized AI \n\nCooper the Super is a customer persona trained on the content I produced at DroneDeploy. \nHank Hardass evaluates my talents, skills, and intangibles through a basketball lens.\nRuminatrix provides support for the creative process -- offers no safe words. \nGaslight a bot with Insecure Aidan.\nSurly Devin is a cynical spinoff of Devin AI\'s coding bot ');
        setDisplayedItems([
          { title: 'Cooper the Super', type: 'link' as const, promptMode: 'cooper', url: '#cooper', description: 'A grizzled construction superintendent...' },
          { title: 'Hank Hardass', type: 'link' as const, promptMode: 'scout', url: '#scout', description: 'A professional scout...' },
          { title: 'ruminatrix', type: 'link' as const, promptMode: 'creative', url: '#creative', description: 'The affective dimension of creativity.' },
          { title: 'Insecure AI', type: 'link' as const, promptMode: 'insecure', url: '#insecure', description: 'Hey-o i\'m an ai entity...' },
          { title: 'Surly Devin', type: 'link' as const, promptMode: 'devin', url: '#devin', description: 'A sardonic senior engineer...' }
        ]);
        setMode('links');
        setPromptModeActive(true);
      },
      'tech-content': () => {
        const allTechnical = Object.values(technicalData);
        setDisplayedItems(allTechnical);
        setMode('links');
        setActiveSection('S');
      },
      'interactive': () => {
        const allInteractive = Object.values(interactiveData);
        setDisplayedItems(allInteractive);
        setMode('links');
        setActiveSection('I');
      },
      'campaigns': () => {
        const allCampaigns = Object.values(campaignData).filter(Boolean);
        setDisplayedItems(allCampaigns);
        setMode('links');
        setActiveSection('C');
      }
    };
    
    if (sectionRoutes[showParam]) {
      sectionRoutes[showParam]();
    }
  }
}, [campaignData, interactiveData, technicalData, sLinks, iLinks]);
// ========== END DEEP LINK HANDLING ==========
  // ========== END DEEP LINK HANDLING ==========

  const handleShapeClick = useCallback((item: Project) => {
    console.log('📍 Shape clicked:', item.title, item);
    
    // HANDLE LINKS MODE - When user clicks a tumbled shape
    if (mode === 'links') {
      // Check if it's a prompt mode shape (from H click)
      if (item.promptMode) {
        console.log('🎯 Prompt mode shape clicked:', item.promptMode);
        
        // Update description when prompt mode is clicked
        setLocalDescription(item.description || null);
        
        setChatCentered(true);
        onChatCenter?.(true);
        
        if (item.promptMode === 'devin') {
          onDevinModeClick?.();
        } else if (item.promptMode === 'scout') {
          onScoutModeClick?.();
        } else if (item.promptMode === 'cooper') {
          onCooperModeClick?.();
        } else if (item.promptMode === 'creative') {
          onCreativeModeClick?.();
        } else if (item.promptMode === 'insecure') {
          onInsecureModeClick?.();
        }
        return;
      }
      
      // Check if it's a campaign project
      if (item.type === 'campaign') {
        console.log('📢 Campaign clicked:', item.title);
        
        // Special handling for Cincoro - show carousel instead of tumbling links
        if (item.title === 'Cincoro tequila | brand launch' && item.images && item.images.length > 0) {
          console.log('🎠 Showing Cincoro carousel');
          setDisplayedItems([{
            title: item.title,
            type: 'campaign' as const,
            description: item.description,
            campaignListDescription: item.campaignListDescription,
            images: item.images
          }]);
          setCarouselData({
            images: item.images,
            title: item.title,
            description: item.description,
            campaignListDescription: item.campaignListDescription,
            impact: item.impact
          });
          // Clear activeSection when drilling into a specific campaign
          setActiveSection(null);
          return;
        }
        
        // For other campaigns - tumble links normally
        const linkShapes = (item.links || []).map((link: Link) => ({
          title: link.name,
          url: link.url,
          type: 'link' as const,
          description: item.description,
          campaignListDescription: item.campaignListDescription,
          impact: item.impact,
          campaignTitle: item.title
        }));
        
        console.log(`📢 Showing ${linkShapes.length} links`);
        setDisplayedItems(linkShapes);
        // Clear activeSection when drilling into a specific campaign
        setActiveSection(null);
        return;
      }
      
      // Regular link click - just open URL
      if (item.type === 'link' || item.type === 'image') {
        if (item.url) {
          console.log('🔗 Opening link:', item.url);
          window.open(item.url, '_blank');
          return;
        }
      }
    }
    
    // HANDLE INITIAL MODE - When user clicks CHRIS letters
    
    // C CLICK - Show campaigns (copywriting)
    if (item.title === 'copywriting') {
      console.log('📢 C clicked - showing copywriting campaigns');
      setActiveSection('C');  // NEW: Set active section
      const copywritingCampaigns = [
        campaignData['cincoro'],
        campaignData['sentry-performance'],
        campaignData['hp-presence'],
       campaignData['sentry-dogfooding'],
           campaignData['safety-ai']
      ];
      setDisplayedItems(copywritingCampaigns);
      setMode('links');
      return;
    }
    
    // H CLICK - Show prompt modes (humanized ai)
    if (item.title === 'humanized ai') {
      console.log('🎯 H clicked - creating prompt mode shapes');
      
      setLocalDescription('Humanized AI \n' + '\n' +
        'Cooper the Super is a customer persona trained on the content I produced at DroneDeploy. \n' + 
        'Hank Hardass evaluates my talents, skills, and intangibles through a basketball lens.\n' + 
        'Ruminatrix provides support for the creative process -- offers no safe words. \n' + 
        'Gaslight a bot with Insecure Aidan.\n' + 
        'Surly Devin is a cynical spinoff of Devin AI\'s coding bot ');

      const promptModes = [
        {
          title: 'Cooper the Super', 
          type: 'link' as const,
          promptMode: 'cooper',
          url: '#cooper',
          description: 'A grizzled construction superintendent who, despite keeping manual levels and string lines, traded disposable cameras for drones. Ask about reality capture, jobsite technology, or why manual documentation is killing productivity.'
        }, 
        {
          title: 'Hank Hardass',
          type: 'link' as const,
          promptMode: 'scout',
          url: '#scout',
          description: 'A professional scout providing honest assessments, player comps'
        },
        {
          title: 'ruminatrix',
          type: 'link' as const,
          promptMode: 'creative',
          url: '#creative',
          description: 'The affective dimension of creativity.'
        },
        {
          title: 'Insecure AI',
          type: 'link' as const,
          promptMode: 'insecure',
          url: '#insecure',
          description: 'Hey-o i\'m an ai entity coded to examine my flaws.'
        },
        {
          title: 'Surly Devin',
          type: 'link' as const,
          promptMode: 'devin',
          url: '#devin',
          description: 'A sardonic senior engineer who cuts through observability theater and marketing BS. Ask about monitoring, instrumentation, or why most dashboards are useless.'
        }
      ];
      
      setDisplayedItems(promptModes);
      setMode('links');
      setPromptModeActive(true);
      return;
    }
    
    // R CLICK - Job analysis (resume scan tool)
    if (item.title === 'resume scan tool') {
      console.log('💼 R clicked - activating job analysis mode');
      
      setDisplayedItems(initialProjects);
      setMode('links');
      setChatCentered(true);
      onChatCenter?.(true);
      onSkillsClick?.();
      onJobAnalysisOpen?.();
      
      return;
    }
    
    // I CLICK - Show interactive/ux campaigns
    if (item.title === 'interactive/ux') {
      console.log('🎮 I clicked - showing interactive/ux campaigns');
      setActiveSection('I');  // NEW: Set active section
      const allInteractive = Object.values(interactiveData);
      setDisplayedItems(allInteractive);
      setMode('links');
      return;
    }
    
    // S CLICK - Show simplified technical content campaigns
    if (item.title === 'simplified technical content') {
      console.log('📄 S clicked - showing technical content campaigns');
      setActiveSection('S');  // NEW: Set active section
      const allTechnical = Object.values(technicalData);
      setDisplayedItems(allTechnical);
      setMode('links');
      return;
    }
  }, [mode, campaignData, interactiveData, technicalData, initialProjects, sLinks, iLinks, onChatCenter, onDevinModeClick, onScoutModeClick, onCooperModeClick, onCreativeModeClick, onInsecureModeClick, onJobAnalysisOpen, onSkillsClick]);

  const handleBackClick = () => {
    console.log('⬅️ Back button clicked');
    
    setDisplayedItems([]);
    setMode('initial');
    setChatCentered(false);
    setPromptModeActive(false);
    setCarouselData(null);
    setLocalDescription(null);
    setActiveSection(null);  // NEW: Reset active section
    onChatCenter?.(false);
    onJobAnalysisClose?.();
    
    // Clear URL params when going back
    window.history.replaceState({}, '', window.location.pathname);
    
    console.log('✅ State reset complete');
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      backgroundColor: mode === 'initial' ? '#35281cff' : '#dcd3c3'
    }}>
      {/* Background overlay */}
      {(mode === 'links' || chatCentered) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgb(255 244 224 / 69%)',
          zIndex: 100
        }} />
      )}
      
      {/* Back button for links mode (except when chat is centered) */}
      {mode === 'links' && !chatCentered && (
        <button
          onClick={handleBackClick}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '5px 10px',
            background: '#5e4631',
            color: '#dcd3c3',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ← back
        </button>
      )}
      
      {/* Description box */}
      {!hideDescriptionBox && mode === 'links' && ((displayedItems.length > 0 && (displayedItems[0].description || displayedItems[0].campaignListDescription || displayedItems[0].impact || carouselData)) || promptModeActive || activeSection) && (
        <div 
          style={{
            position: 'absolute',
            top: '100px',
maxWidth: '100%',
            zIndex: '601',
            maxHeight: '85vh',
            padding: '10px 0px 0px 220px',
           
            color: '#3e2e20ff',
            borderRadius: '10px',
            fontSize: '20px',
            lineHeight: '1.6',
            textAlign: 'left',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="hide-webkit-scrollbar whitespace-pre-line"
        >
          {carouselData ? (
            <CarouselContent carouselData={carouselData} />
          ) : promptModeActive ? (
            activePromptDescription || localDescription || 'XXXXX'
          ) : activeSection ? (
            // NEW: Show section-specific description when C, I, or S is active
            <div style={{
              fontSize: '22px',
              width:'800px',
              fontWeight: '300',
              lineHeight: '1.4',
              maxWidth: '600px',
        
            }}>
              {sectionDescriptions[activeSection]}
            </div>
          ) : (
           <>
  {displayedItems[0]?.campaignTitle && (
    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
      {displayedItems[0].campaignTitle}
    </div>
  )}
  
  <div style={{ display: 'flex', gap: '100px' }}>
    {/* Left column - Description */}
    <div style={{ flex: 1 }}>
      {displayedItems[0]?.description && (
        <div style={{ marginBottom: '8px' }}>
          {displayedItems[0].description}
        </div>
      )}
      
      {displayedItems[0]?.campaignListDescription && (
        <div>
          {displayedItems[0].campaignListDescription}
        </div>
      )}
    </div>
    
    {/* Right column - Impact */}
{displayedItems[0]?.impact && displayedItems[0].impact.length > 0 && (
    <div style={{ 
      flex: 1, 
      paddingLeft: '10px', 
      marginTop: '-30px'

    }}>
      <div style={{ 
        fontWeight: 'bold',  
        width: '500px',
        padding: '20px 20px 20px 20px',
        fontSize: '18px',
        borderRadius: '18px',
        boxShadow: '0 4px 12px rgba(42, 7, 7, 0.15)',
        backgroundColor: '#cecece29'
      }}>
        <div style={{ marginBottom: '8px' }}>Impact</div>
        <ul style={{ 
          margin: 0, 
          lineHeight: '1', 
          fontSize: '16px', 
          listStyle: 'disc', 
          width: '460px',
          paddingLeft: '20px',
          fontWeight: 'normal'
        }}>
          {displayedItems[0].impact.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {item.stat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )}
  </div>
</>
          )}
        </div>
      )}
      
      {/* Back button when chat is centered */}
      {chatCentered && (
        <button
          onClick={handleBackClick}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10000,
            padding: '10px 20px',
            background: '#5e4631',
            color: '#dcd3c3',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      )}
      
      {/* Initial mode text */}
      {mode === 'initial' && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '60%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '700px',
          color: '#f5ebd9ff',
          fontSize: '18px',
          lineHeight: '1.3',
          textAlign: 'left',
          zIndex: 700,
          padding: '100px'
        }}>
          Chris creates content for brands who see ai as the fire, not the chef.
          <br/><br/>
          vibe coded in typescript + tailwind + matter.js
        </div>
      )}
      
      {/* Tumbling shapes - hide when chat is centered */}
      {!chatCentered && (
        <TumblingShapes
          projects={mode === 'initial' ? initialProjects : displayedItems}
          onShapeClick={handleShapeClick}
          mode={mode}
        />
      )}
    </div>
  );
}

export default ChatLanding;
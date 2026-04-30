'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
      <div className="w-1/2 h-full overflow-y-hidden p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto" style={{ margin: '-9px -20px 0px 0px' }}>
          {/* Title */}
          <h2 className="text-[#331b03] text-3xl font-bold mb-6">
            Cincoro Tequila | brand launch
          </h2>

          {/* Campaign List Description */}
          {carouselData.campaignListDescription && (
            <p className="text-[#331b03] leading-relaxed mb-8" style={{ fontSize: '17px' }}>
              {carouselData.campaignListDescription}
            </p>
          )}

          {/* Description */}
          {carouselData.description && (
            <p className="text-[#331b03] leading-relaxed mb-8" style={{ fontSize: '11px' }}>
              {carouselData.description}
            </p>
          )}

          {/* Impact Stats */}
          {carouselData.impact && carouselData.impact.length > 0 && (
            <div className="space-y-4" style={{ width: '500px',boxShadow: '0 4px 12px rgba(42, 7, 7, 0.15)', backgroundColor: '#cecece29', borderRadius: '18px', padding: '10px' }}>
              <h3 className="text-[#331b03] font-semibold " style={{ fontSize: '16px' }}>Impact</h3>
              {carouselData.impact.map((item, index) => (
                <div key={index} className="">

                  <p className="text-[#331b03] leading-tight" style={{ fontSize: '13px' }}>
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[rgba(24, 14, 6, 0.95)] transition-all z-10"
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
                  className="w-14 h-14 rounded-lg overflow-hidden transition-all"
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
  shape?: 'letterC' | 'letterH' | 'letterR' | 'letterI' | 'letterS' | 'letterE' | 'letterU' | 'letterK' | 'letterA' | 'dollarSign' | 'slash' | 'bracketOpen' | 'bracketClose' | 'parenOpen' | 'parenClose' | 'pill' | 'rect' | 'diamond' | 'parallelogram' | 'arrowRight' | 'tree' | 'keystone';
}

interface Project {
  title: string;
  hoverTitle?: string;
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
  shape?: Link['shape'];
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
  activePromptDescription?: React.ReactNode; // ← Change from string | undefined
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
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
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
  
  // Track which top-level section is active (for description display)
  const [activeSection, setActiveSection] = useState<'H' | 'U' | 'E2' | null>(null);

  // Navigation history for back button
  type NavSnapshot = {
    displayedItems: Project[];
    mode: 'initial' | 'links';
    activeSection: 'H' | 'U' | 'E2' | null;
    carouselData: typeof carouselData | null;
    localDescription: string | null;
    chatCentered: boolean;
    promptModeActive: boolean;
  };
  const navHistory = useRef<NavSnapshot[]>([]);

  // Section descriptions for H (processes), U (ux writing), E2 (engagement funnels)
  const sectionDescriptions = {
    H: 'Cooper the Super is a customer persona trained on the content I produced at DroneDeploy. \nHank Hardass evaluates my talents, skills, and intangibles through a basketball lens.\nRuminatrix provides support for the creative process -- offers no safe words. \nGaslight a bot with Insecure Aidan.\nSurly Devin is a cynical spinoff of Devin AI\'s coding bot.',
    U: 'Users don\'t read content -- they scan it. These projects were designed with this unfortunate truth, F pattern principles, and mobile responsiveness in mind.',
    E2: 'Content should outlive its assigned quarterly kpi.'
  };

  // Debug logging for displayedItems
  useEffect(() => {
    console.log('🔍 displayedItems changed:', displayedItems);
    console.log('🔍 Mode:', mode);
    console.log('🔍 chatCentered:', chatCentered);
  }, [displayedItems, mode, chatCentered]);

  // Force background color on body element based on mode
  useEffect(() => {
    const backgroundColor = mode === 'initial' ? '#25202029' : 'rgb(234, 234, 234)';
    
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

  // HEUREKA letters
  const initialProjects = useMemo(() => [
    { title: 'heuristic',         hoverTitle: 'why the h matters',                              type: 'project' as const },
    { title: 'evangelism',        hoverTitle: 'Dogfooding Chronicles — syndicated blog content series',           type: 'project' as const },
    { title: 'ux writing',        hoverTitle: 'Layered, responsive content across websites, apps, and product pages for clients airbnb, sentry, and DroneDeploy',            type: 'project' as const },
    { title: 'revops content',    hoverTitle: 'sentry performance gtm launch',                               type: 'project' as const },
    { title: 'evergreen',hoverTitle: 'content that outlasted its campaign',                 
      type: 'project' as const },
    { title: 'keystone content',  hoverTitle: 'load-bearing brand manifesto + social rollout for cincoro tequila\'s launch',                       type: 'project' as const },
    { title: 'authority content', hoverTitle: 'technical content written at an expert\'s eye level',                type: 'project' as const },
    { title: 'personal projects', hoverTitle: 'novel, library',                     type: 'project' as const },
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
    'evergreen': {
      title: 'evergreen content ',
      type: 'campaign' as const,
      links: [
        { name: 'DroneDeploy | Underground utilities', url: 'https://www.dronedeploy.com/blog/within-striking-distance-risks-and-consequences-of-manual-utility-mapping' },
        { name: 'DroneDeploy | reality capture white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
        { name: 'Sentry | why debugging javascript sucks', url: 'https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/' },
        { name: 'Sentry | how slow is slow?', url: 'https://blog.sentry.io/how-slow-is-slow/' },
        { name: 'Sentry | measuring UX with Web Vitals', url: 'https://blog.sentry.io/measuring-user-experience-with-web-vitals/' },
        { name: 'DroneDeploy | facade inspections guide', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
        { name: 'Sentry | great moments in application monitoring', url: 'https://blog.sentry.io/great-moments-in-application-monitoring/' }
      ],
      description: 'GTM content campaign',
      campaignListDescription: 'Content whose value outlasts its kpi, continnuing to drive traffic and add value long after its launch',
      impact: [
        { stat: '~10% pipeline influence from Safety AI content' },
        { stat: '100+ companies engaged in trial walks due to campaign.' },
        { stat: '~3k total landing page visits across top-of-funnel content.' }
      ]
    },
       'sentry-performance': {
      title: 'Sentry | Performance GTM campaign',
      type: 'campaign' as const,
      links: [
        { name: 'thought leadership ', url: 'https://blog.sentry.io/how-slow-is-slow/' },
        { name: 'release blog', url: 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/' },
        { name: 'product page', url: 'https://sentry.io/solutions/application-performance-monitoring/' },
        { name: 'sales enablement', url: 'https://sentry.io/customers/atlassian-jira/' },
        { name: 'webinar', url: 'https://www.youtube.com/watch?v=J0tAK6dKY3Y/' }
      ],
      images: [],

      campaignListDescription: 'Product releases run the risk of getting bogged down in their own technical benefits. For Sentry\'s Performance monitoring release, this meant turning jargony features (such as improved visibility into p95 response times) into a simple, differentiating insight -- See Slow Faster',
      impact: [
        { stat: '$1.8M in attributed sales pipeline' },
        { stat: 'Campaign content generated 3,480 visits (2.3x site average)' },
        { stat: '~300 companies initiated trial during launch window (vs. 90 in pre-launch quarter)' }
      ]
    },
    'auth': {
      title: 'Technical content',
      type: 'campaign' as const,
      links: [
        { name: 'Sentry | how slow is slow', url: 'https://blog.sentry.io/how-slow-is-slow/' },
           { name: 'asking the right query with discover', url: 'https://blog.sentry.io/asking-the-right-query-with-discover/' },
{  name: 'DroneDeploy | Stockpile measurement through drone imagery', url: 'https://www.dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods'},
        { name: 'GE | Aviation', url: 'https://www.ceros.com/inspire/project/ge-aviation-1' },
             { name: 'google | gpay instrumentation video', url: 'https://www.ceros.com/inspire/project/ge-aviation-1' },
     
        { name: 'Python 3 compatibility: what to know', url: 'https://blog.sentry.io/python-3-compatibility-what-to-know/' }
      ],
      images: [],

      campaignListDescription: 'Technical content runs the risk of getting bogged down in its own jargon. To counter this, I approach with professional ignorance, do the required reading, and work authentically with subject matter experts.',
      impact: [
        { stat: '$1.8M in attributed sales pipeline' },
        { stat: 'Campaign content generated 3,480 visits (2.3x site average)' },
        { stat: '~300 companies initiated trial during launch window (vs. 90 in pre-launch quarter)' }
      ]
    },
    'safety-ai': {
      title: 'DroneDeploy | Safety AI',
      type: 'campaign' as const,
      links: [
        { name: 'awareness | use case', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections', shape: 'tree' as const },
        { name: 'awareness | white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf', shape: 'tree' as const },
        { name: 'consideration | blog post', url: 'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site', shape: 'tree' as const },
        { name: 'decision | product page', url: 'https://www.dronedeploy.com/product/safety-ai', shape: 'tree' as const }
      ],
      description: 'GTM content campaign',
      campaignListDescription: 'Worksite injuries cost the construction industry $5 billion annually. DroneDeploy\'s Safety AI uses computer vision to identify safety violations in real-time, turning reactive incident reports into proactive prevention.',
      impact: [
        { stat: '$10M+ pipeline influence from Safety AI content' },
        { stat: '70 companies engaged in trial walks, indicating healthy conversion from awareness to hands-on experience.' },
        { stat: '~3k total landing page visits across top-of-funnel content.' }
      ]
    },
    'sentry-dogfooding': {
      title: 'Sentry Dogfooding Chronicles',
      type: 'campaign' as const,
      links: [
        { name: 'Go-Getting Lazy loading', url: 'https://blog.sentry.io/go-getting-lazy-loading/', shape: 'slash' as const },
        { name: 'Using Sentry Performance to get Sentry Performant', url: 'https://blog.sentry.io/using-sentry-performance-to-make-sentry-performant', shape: 'bracketOpen' as const },
        { name: 'Verifying large refactors with Sentry', url: 'https://blog.sentry.io/verifying-large-refactors-in-production-with-sentry/?original_referrer=https%3A%2F%2Fwww.google.com%2F', shape: 'parenOpen' as const },
        { name: 'Thinking backward, moving forward', url: 'https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward', shape: 'parenClose' as const },
        { name: 'Patching a flood of 404s', url: 'https://blog.sentry.io/patching-a-flood-of-404s/', shape: 'bracketClose' as const }
      ],
      impact: [
        { stat: 'Revenue tripled in the two years since series launch' },
        { stat: 'Performance product grew 240% largely through product-led channels' },
        { stat: '25+ blog posts generated a total of ~45k site visits -- 40% of which were organic' }
      ],
      campaignListDescription: 'Dogfooding is the process in which a company uses its own product as a quality control mechanism. This concept was a perfect fit for Sentry to showcase how its software engineers were using Sentry\'s own platform to track errors in the codebase. Creating stories out of these mundane coding hiccups established Sentry as a thought leader across key industry blogs without sounding preachy or pedantic.'
    },
    'hp-presence': {
      title: 'HP Presence | thought leadership',
      type: 'campaign' as const,
      links: [
         { name: 'The new office for the way people want to work', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf' },
        { name: 'The new era of work', url: 'https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf' },
        { name: 'A new blueprint for an uncertain world', url: 'https://getstarted.hbs.net/hubfs/2025%20Partner%20Campaigns/HP_Services_Hybrid_A-New-Blueprint-for-an-Uncertain-World_Consideration_ebook_2022.pdf.pdf?hsLang=en' },
        { name: 'Get ready today to do tomorrow\'s work', url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf' }
       
      ],
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
      campaignListDescription: 'George Clooney. The Rock. Kendall Jenner. Bryan Cranston. Celebrity tequila is a crowded space. So when Michael Jordan and four other NBA owners started their own tequila company, I was there to help them find a way to help their brand stand out among the stars. Cincoro translates to "five rings". And so the story of Cincoro Tequila is the passion and competitive spirit its five owners share as they each chase their next championship ring.'
    },
    'robotics': {
      title: 'DroneDeploy | Ground Robotics',
      type: 'campaign' as const,
      links: [
        { name: 'DroneDeploy | Ground Robotics', url: 'https://www.dronedeploy.com/product/robotics' },
        { name: 'DroneDeploy | Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
        { name: 'DroneDeploy | Dock Automation', url: 'https://www.dronedeploy.com/product/dock-automation' }
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
        { name: 'DroneDeploy | Ground Robotics', url: 'https://www.dronedeploy.com/product/robotics' },
          { name: 'DroneDeploy | Dock Automation', url: 'https://www.dronedeploy.com/product/dock-automation' },
        { name: 'DroneDeploy | Data on Demand', url: 'https://www.dronedeploy.com/data-on-demand' },
        { name: 'DroneDeploy | Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' }
      ],
      campaignListDescription: 'Collaborating with product and sales teams, I piqued curiosity, ensured technical accuracy, and optimized each page by adding cross-links to related solutions and guides for mid- and bottom-funnel engagement.',
      impact: [
        { stat: '$2.5m content share for ground robotics' },
        { stat: '1.7% engagement rate to take meaningful action' },
        { stat: '28% increase in handraisers' }
      ]
    },
    'airbnb': {
      title: 'Airbnb | Career website',
      type: 'campaign' as const,
      links: [
        { name: 'Airbnb | career home page', url: 'https://careers.airbnb.com/' },
        { name: 'Airbnb | Life at airbnb', url: 'https://careers.airbnb.com/life-at-airbnb/' },
        { name: 'Airbnb | Apprentice page', url: 'https://careers.airbnb.com/connect-engineering-apprenticeship/' }
      ],
      campaignListDescription: 'As lead writer for Airbnb\'s career website, I developed their employer value proposition coming out of their Live and Work Anywhere policy, then executed on that strategy with compelling content.',
      impact: [
        { stat: '72% increase in applications first post-launch quarter' },
        { stat: '170% increase in applications from underrepresented groups' },
        { stat: '3.4x increase in page views vs. previous site)'}
      ]
    },
    'sentry-pages': {
      title: 'Sentry | Product pages',
      type: 'campaign' as const,
      links: [
        { name: 'Sentry | Enterprise page', url: 'https://www.sentry.dev/for/enterprise/' },
        { name: 'Sentry | Full stack', url: 'https://sentry.io/for/full-stack/' },
        { name: 'Sentry | Performance monitoring', url: 'https://www.sentry.dev/solutions/application-performance-monitoring/' },
         { name: 'Sentry | Mobile development', url: 'https://sentry.io/solutions/mobile-developers/' }
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

      campaignListDescription: 'Sentry is an application monitoring platform that tracks various metrics and logs to optimize code health. My role involved creating developer-focused content to make code health -- and hygiene -- engaging for software engineers.',
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
        { name: 'facade inspections', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' }
      
      ],
      campaignListDescription: ' Enterprise-grade drone technology fights the perception that drones are more toy than tool. These blogs and white papers articulate the benefits drone software provides construction teams: improved collaboration, inch-perfect measurements, and a better way of tracking progress.',
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
          name: "A new blueprint for an uncertain world.",
          url: "https://getstarted.hbs.net/hubfs/2025%20Partner%20Campaigns/HP_Services_Hybrid_A-New-Blueprint-for-an-Uncertain-World_Consideration_ebook_2022.pdf.pdf?hsLang=en"
        },
        {
          name: "The new office for the way people want to work",
          url: "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf"
        },
{
        name: 'Get ready today to do tomorrow\'s work', 
        url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf'
    }
      ],

      campaignListDescription: 'The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP\'s content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for distributed workforces',
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
          shape: link.shape,
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
        setLocalDescription(sectionDescriptions['H']);
        setDisplayedItems([
          { title: 'Cooper the Super', type: 'link' as const, promptMode: 'cooper', url: '#cooper', description: 'A grizzled construction superintendent...' },
          { title: 'Hank Hardass', type: 'link' as const, promptMode: 'scout', url: '#scout', description: 'A professional scout...' },
          { title: 'ruminatrix', type: 'link' as const, promptMode: 'creative', url: '#creative', description: 'The affective dimension of creativity.' },
          { title: 'Insecure AI', type: 'link' as const, promptMode: 'insecure', url: '#insecure', description: 'Hey-o i\'m an ai entity...' },
          { title: 'Surly Devin', type: 'link' as const, promptMode: 'devin', url: '#devin', description: 'Surly Devin is a sardonic senior engineer...' }
        ]);
        setMode('links');
        setActiveSection('H');
        setPromptModeActive(true);
      },
      'ux-writing': () => {
        const allInteractive = Object.values(interactiveData);
        setDisplayedItems(allInteractive);
        setMode('links');
        setActiveSection('U');
      },
      'engagement-funnels': () => {
        const campaign = campaignData['evergreen'];
        const linkShapes = campaign.links.map((link: Link) => ({
          title: link.name, url: link.url, type: 'link' as const,
          campaignListDescription: campaign.campaignListDescription,
          impact: campaign.impact, campaignTitle: campaign.title
        }));
        setDisplayedItems(linkShapes);
        setMode('links');
        setActiveSection('E2');
      }
    };
    
    if (sectionRoutes[showParam]) {
      sectionRoutes[showParam]();
    }
  }
}, [campaignData, interactiveData, technicalData, sLinks, iLinks]);
// ========== END DEEP LINK HANDLING ==========
  // ========== END DEEP LINK HANDLING ==========

  const pushHistory = useCallback(() => {
    navHistory.current.push({
      displayedItems,
      mode,
      activeSection,
      carouselData,
      localDescription,
      chatCentered,
      promptModeActive,
    });
  }, [displayedItems, mode, activeSection, carouselData, localDescription, chatCentered, promptModeActive]);

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
          pushHistory();
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
        pushHistory();
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
    
    // HANDLE INITIAL MODE - When user clicks HEUREKA letters

    // H CLICK - heuristic → processes (AI personas)
    if (item.title === 'heuristic') {
      window.location.href = '/heureka.html';
      return;
    }

    if (item.title === 'heuristic_old') {
      console.log('🎯 H clicked - showing AI personas (processes)');
      pushHistory();
      setActiveSection('H');
      setLocalDescription(sectionDescriptions['H']);
      const promptModes = [
        { title: 'Cooper the Super', type: 'link' as const, promptMode: 'cooper', url: '#cooper', description: 'A grizzled construction superintendent who, despite keeping manual levels and string lines, traded disposable cameras for drones. Ask about reality capture, jobsite technology, or why manual documentation is killing productivity.' },
        { title: 'Hank Hardass', type: 'link' as const, promptMode: 'scout', url: '#scout', description: 'A professional scout providing honest assessments, player comps' },
        { title: 'ruminatrix', type: 'link' as const, promptMode: 'creative', url: '#creative', description: 'Bow down before ruminatrix and feel your creative ideas soar.' },
        { title: 'Insecure Aidan', type: 'link' as const, promptMode: 'insecure', url: '#insecure', description: 'Hey-o I\'m Aidan a twitchy awkward ai entity aware enough to know my own flaws.' },
        { title: 'Surly Devin', type: 'link' as const, promptMode: 'devin', url: '#devin', description: 'Surly Devin is a sardonic software engineer who cuts through observability theater and marketing BS.' }
      ];
      setDisplayedItems(promptModes);
      setMode('links');
      setPromptModeActive(true);
      return;
    }

    // E CLICK (evangelism) → sentry-dogfooding
    if (item.title === 'evangelism') {
      console.log('📢 E (evangelism) clicked - loading sentry-dogfooding');
      pushHistory();
      const campaign = campaignData['sentry-dogfooding'];
      const linkShapes = campaign.links.map((link: Link) => ({
        title: link.name,
        url: link.url,
        type: 'link' as const,
        shape: link.shape,
        campaignListDescription: campaign.campaignListDescription,
        impact: campaign.impact,
        campaignTitle: campaign.title
      }));
      setDisplayedItems(linkShapes);
      setMode('links');
      return;
    }

    // U CLICK - ux writing → all individual links from sub-pages
    if (item.title === 'ux writing') {
      console.log('🎨 U clicked - showing ux writing links');
      pushHistory();
      setActiveSection('U');
      const uxShapes = ['pill', 'rect', 'diamond', 'parallelogram', 'arrowRight'] as const;
      const allLinks = Object.values(interactiveData).flatMap((campaign) =>
        campaign.links.map((link: Link) => ({
          title: link.name,
          url: link.url,
          type: 'link' as const,
          campaignListDescription: campaign.campaignListDescription,
          impact: campaign.impact,
          campaignTitle: campaign.title
        }))
      ).map((link, index) => ({ ...link, shape: uxShapes[index % uxShapes.length] }));
      setDisplayedItems(allLinks);
      setMode('links');
      return;
    }

    // R CLICK - revops content → hp-presence
    if (item.title === 'revops content') {
      console.log('📄 R clicked - sentry-performance');
      pushHistory();
      const campaign = campaignData['sentry-performance'];
      const linkShapes = campaign.links.map((link: Link) => ({
        title: link.name,
        url: link.url,
        type: 'link' as const,
        shape: 'dollarSign' as const,
        campaignListDescription: campaign.campaignListDescription,
        impact: campaign.impact,
        campaignTitle: campaign.title
      }));
      setDisplayedItems(linkShapes);
      setMode('links');
      return;
    } 

    // E CLICK (engagement funnels) → safety-ai links
    if (item.title === 'evergreen') {
      console.log('🔥 E (evergreen) clicked - loading safety-ai');
      pushHistory();
      setActiveSection('E2');
      const campaign = campaignData['evergreen'];
      const linkShapes = campaign.links.map((link: Link) => ({
        title: link.name,
        url: link.url,
        type: 'link' as const,
        shape: 'tree' as const,
        campaignListDescription: campaign.campaignListDescription,
        impact: campaign.impact,
        campaignTitle: campaign.title
      }));
      setDisplayedItems(linkShapes);
      setMode('links');
      return;
    }

    // K CLICK - keystone content → cincoro
    if (item.title === 'keystone content') {
      console.log('🥃 K clicked - loading cincoro carousel');
      pushHistory();
      const campaign = campaignData['cincoro'];
      if ('images' in campaign && campaign.images && campaign.images.length > 0) {
        setCarouselData({
          images: campaign.images,
          title: campaign.title,
          campaignListDescription: campaign.campaignListDescription,
          impact: campaign.impact
        });
        setDisplayedItems([{ ...campaign, shape: 'keystone' as const }]);
        setMode('links');
      }
      return;
    }

    // A CLICK - authority content → sentry-performance
    if (item.title === 'authority content') {
      console.log('⚡ A clicked - loading sentry-performance');
      pushHistory();
      const campaign = campaignData['auth'];
      const linkShapes = campaign.links.map((link: Link) => ({
        title: link.name,
        url: link.url,
        type: 'link' as const,
        shape: 'letterI' as const,
        campaignListDescription: campaign.campaignListDescription,
        impact: campaign.impact,
        campaignTitle: campaign.title
      }));
      setDisplayedItems(linkShapes);
      setMode('links');
      return;
    }

    // ! CLICK - personal projects
    if (item.title === 'personal projects') {
      console.log('⭐ ! clicked - personal projects');
      pushHistory();
      setChatCentered(true);
      onChatCenter?.(true);
      onSkillsClick?.();
      onJobAnalysisOpen?.();
      return;
    }
  }, [mode, campaignData, interactiveData, technicalData, initialProjects, sLinks, iLinks, onChatCenter, onDevinModeClick, onScoutModeClick, onCooperModeClick, onCreativeModeClick, onInsecureModeClick, onJobAnalysisOpen, onSkillsClick, pushHistory]);

  const handleBackClick = () => {
    console.log('⬅️ Back button clicked');

    if (navHistory.current.length > 0) {
      const prev = navHistory.current.pop()!;
      setDisplayedItems(prev.displayedItems);
      setMode(prev.mode);
      setActiveSection(prev.activeSection);
      setCarouselData(prev.carouselData);
      setLocalDescription(prev.localDescription);
      setChatCentered(prev.chatCentered);
      setPromptModeActive(prev.promptModeActive);
      if (!prev.chatCentered) onChatCenter?.(false);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Full reset when no history remains
    setDisplayedItems([]);
    setMode('initial');
    setChatCentered(false);
    setPromptModeActive(false);
    setCarouselData(null);
    setLocalDescription(null);
    setActiveSection(null);
    onChatCenter?.(false);
    onJobAnalysisClose?.();
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
          backgroundColor: '#5e53532f',
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
            background: '#1e130a',
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
            top: '60px',
maxWidth: '100%',
            zIndex: '601',
            maxHeight: '85vh',
            padding: '15px 20px 7px 80px',
      
            color: '#3e2e20ff',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '600',
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
              fontSize: '20px',
              width:'700px',
              fontWeight: '600',
              lineHeight: '1.5',
              maxWidth: '700px'
        
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
  
  <div style={{ display: 'flex', gap: '0px' }}>
    {/* Left column - Description */}
    <div style={{ flex: displayedItems[0]?.campaignTitle === 'Sentry Dogfooding Chronicles' ? 1.25 : 1 }}>
      {displayedItems[0]?.description && (
        <div style={{ marginBottom: '8px' }}>
          {displayedItems[0].description}
        </div>
      )}

      {displayedItems[0]?.campaignListDescription && (
        <div style={{ margin: '0px -30px -1px -8px' }}>
          {displayedItems[0].campaignListDescription}
        </div>
      )}
    </div>

    {/* Right column - Impact */}
{displayedItems[0]?.impact && displayedItems[0].impact.length > 0 && (
    <div style={{
      flex: displayedItems[0]?.campaignTitle === 'Sentry Dogfooding Chronicles' ? 0.75 : 1,
      paddingLeft: '100px',
      marginTop: '-60px',
      height: '300px'

    }}>
      <div style={{ 
        fontWeight: 'bold',  
        width: '375px',
        padding: '15px 15px 15px 15px',
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
          width: '340px',
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
            background: '#1c1208',
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
          top: '11%',
          left: '45%',
          transform: 'translateX(-50%)',
          maxWidth: '700px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          color: '#f5ebd9ff',
          fontSize: '20px',
          lineHeight: '1.4',
          textAlign: 'left',
          zIndex: '700'
        }}>
          {hoveredProject?.hoverTitle ?? (
            <>
      Eureka (discovery) comes from the same word root as heuristic (process). <br/> I help brands discover their own gold by applying heuristic methods that generate the eureka moments that opens minds and closes deals.


            </>
          )}
        </div>
      )}
      
      {/* Tumbling shapes - hide when chat is centered */}
      {!chatCentered && (
        <TumblingShapes
          projects={mode === 'initial' ? initialProjects : displayedItems}
          onShapeClick={handleShapeClick}
          onShapeHover={mode === 'initial' ? setHoveredProject : undefined}
          mode={mode}
        />
      )}
    </div>
  );
}

export default ChatLanding;
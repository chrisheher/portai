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
  type?: 'project' | 'link' | 'campaign' | 'image' | 'question';  // ⬅️ ADD 'question'
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
    activePromptDescription?: string;  // ⬅️ ADD

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
    activePromptDescription // ⬅️ ADD THIS

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
      impact?: { stat: string }[];  // ⬅️ ADD THIS LINE

  } | null>(null);

  // Debug logging for displayedItems
  useEffect(() => {
    console.log('🔍 displayedItems changed:', displayedItems);
    console.log('🔍 Mode:', mode);
    console.log('🔍 chatCentered:', chatCentered);
  }, [displayedItems, mode, chatCentered]);

  // Force background color on body element based on mode
  useEffect(() => {
    const backgroundColor = mode === 'initial' ? '#8c6a48' : '#dcd3c3';
    
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

  // Initial 5 letters (C, H, R, I, S)
  const initialProjects = useMemo(() => [
    { title: 'conversational design', type: 'project' as const },
    { title: 'high-impact copywriting', type: 'project' as const },
    { title: 'readable tech content', type: 'project' as const },
    { title: 'interactive', type: 'project' as const },
    { title: 'skill scan', type: 'project' as const }
  ], []);

  // R-related links
  const rLinks: Link[] = [
    { name: "blog | Why debugging Javascript sucks", url: "https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/", shape: 'letterC' },
    { name: "white paper | More Tools, More Problems", url: "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf", shape: 'letterH' },
    { name: "experiential content | Aviation turboprop", url: "https://www.ceros.com/inspire/project/ge-aviation-1", shape: 'letterS' },
    { name: "blog | Measuring UX with Web Vitals", url: "https://blog.sentry.io/measuring-user-experience-with-web-vitals/", shape: 'letterI' },
    { name: "blog | Great moments in application monitoring", url: "https://blog.sentry.io/great-moments-in-application-monitoring/", shape: 'letterS' },
    { name: "guide | Safety, smarter: AI and your work site", url: "https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site", shape: 'letterH' },
    { name: "guide | Ultimate guide to facade inspections", url: "https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections", shape: 'letterH' },
    { name: "blog | Python 3 compatibility", url: "https://blog.sentry.io/python-3-compatibility-what-to-know/", shape: 'letterI' }
  ];

  // I-related links
  const iLinks: Link[] = [
    { name: "Sentry | Enterprise page", url: "https://www.sentry.dev/for/enterprise/" },
    { name: "Sentry | performance monitoring", url: "https://www.sentry.dev/solutions/application-performance-monitoring/" },
    { name: "Sentry | full stack monitoring", url: "https://sentry.io/for/full-stack/" },
    { name: "Airbnb | career site", url: "https://careers.airbnb.com" },
    { name: "DroneDeploy | Ground robotics", url: "https://example.com/link5" },
    { name: "DroneDeploy | Safety AI", url: "https://www.dronedeploy.com/product/safety-ai" },
    { name: "DroneDeploy | Data on Demand ", url: "https://www.dronedeploy.com/data-on-demand" },
    { name: "DroneDeploy | industrial inspection", url: "https://www.dronedeploy.com/product/robotic-industrial-inspection" }
  ];

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
          // Set displayedItems with carousel data to trigger description box
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
        console.log(`📊 Campaign impact:`, item.impact);
        
        setDisplayedItems(linkShapes);
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
    
    // C CLICK - Show campaigns
    if (item.title === 'high-impact copywriting') {
      console.log('📢 H clicked - showing campaigns');
      
      const hardcodedCampaigns: Project[] = [
        {
          title: 'DroneDeploy | Safety AI launch',
          type: 'campaign' as const,
          links: [
            { name: 'awareness | use case', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
            { name: 'awareness | white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
            { name: 'consideration | blog post', url: 'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site' },
            { name: 'evaluation | product page', url: 'https://www.dronedeploy.com/product/safety-ai' },
            { name: 'retention | documentation', url: 'https://help.dronedeploy.com/hc/en-us/articles/26738008595479-What-is-Safety-AI' }
          ],
          description: 'DroneDeploy | Safety AI launch',
          campaignListDescription: 'GTM campaign exploring how AI can be purpose-built to protect workers, fortify compliance, and support a culture of safety.',
          impact: [
            { stat: '71 Total Opportunities created in the quarter-to-date (QTD)' },
            { stat: '$6,525 Closed Won — confirmed value captured from Safety AI-related pipeline.' },
            { stat: '70 companies engaged in trial walks, indicating healthy conversion from awareness to hands-on experience.' },
            { stat: '8,459 LinkedIn impressions and 641 engagements on Post 1 — indicating high visibility and meaningful interaction on social' }
          ]
        },
        {
          title: 'Sentry | Performance launch',
          type: 'campaign' as const,
          links: [
            { name: 'Blog post', url: 'https://blog.sentry.io/how-slow-is-slow/' },
            { name: 'Product release', url: 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/' },
            { name: 'product page', url: 'https://sentry.io/solutions/application-performance-monitoring/' },
            { name: 'customer story', url: 'https://sentry.io/customers/atlassian-jira/' },
            { name: 'webinar', url: 'https://www.youtube.com/watch?v=J0tAK6dKY3Y/' }
          ],
          images: [],
          description: 'See Slow Faster campaign',
          campaignListDescription: 'Product releases run the risk of getting bogged down in their own technical benefits. For Sentry\'s Performance monitoring release, this meant turning jargony features (such as improved visibility into p95 response times) into a simple, differentiating insight -- See Slow Faster',
          impact: [
            { stat: '$1.8M in Performance Product Pipeline (QTD) — demonstrating strong developer interest in APM tooling' },
            { stat: '12,400 total landing page visits across Performance launch assets — strong initial awareness' },
            { stat: '"See Slow Faster" campaign hub generated 3,480 visits with 4:22 avg. time on page (2.3x site average)' },
            { stat: '312 companies initiated Performance trial during launch window (vs. 89 in pre-launch quarter)' }
          ]
        },
        {
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
        {
          title: 'HP | Presence launch',
          type: 'campaign' as const,
          links: [
            { name: 'The new era of work', url: 'https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf' },
            { name: 'A New Blueprint for an Uncertain World', url: 'https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf' },
            { name: 'Get ready today to do tomorrow\'s work', url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf' },
            { name: 'The New Office For the Way People Want to Work', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf' }
          ],
          description: 'Hybrid work white papers',
          campaignListDescription: 'The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP\'s content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for distributed workforces.',
          impact: [
            { stat: '8,940 total white paper downloads across all 10 assets in launch quarter' },
            { stat: '~2.5k MQLs generated from white paper download forms' },
            { stat: '$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution' },
            { stat: 'White paper landing pages drove 34,200 total site visits -- 67% of which were organic' }
          ]
        },
        {
          title: 'Sentry | Dogfooding Chronicles',
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
          description: 'Developer relations content',

          campaignListDescription: 'Dogfooding is the practice of sampling your own product before the public does. For actual dogfood executives, this means chowing down on their own kibble as a literal gut-check. For Sentry, this meant developers using their own application monitoring platform as a way to troubleshoot hiccups in the codebase.'
        }
      ];
      
      setDisplayedItems(hardcodedCampaigns);
      setMode('links');
      return;
    }
    
    // H CLICK - Show prompt modes
    if (item.title === 'conversational design') {
      console.log('🎯 C clicked - creating prompt mode shapes');
      
      // Set initial description
      setLocalDescription('Conversational Design \n' + '\n' +
'Cooper the Super is a customer persona trained on the content I produced at DroneDeploy. \n' +  'Hank assesses my talents, skills, and intangibles through a basketball lens.\n' + 'Ruminatrix provides support for the creative process\n' + ' Gaslight a bot with Insecure Aidan.\n' + 'Surly Devin is a cynical spinoff of Devin AI\'s coding bot ');

      const promptModes = [
        {
          title: 'Cooper the Super', 
          type: 'link' as const,
          promptMode: 'cooper',
          url: '#cooper',
          description: 'A grizzled construction superintendent who traded disposable cameras for drones. Ask about reality capture, jobsite technology, or why manual documentation is killing productivity.'
        }, 
        {
          title: 'Hank Hardass',
          type: 'link' as const,
          promptMode: 'scout',
          url: '#scout',
          description: 'Your professional scout analyzing Christopher Heher\'s portfolio basketball. Get honest assessments, competitive comparisons, and strategic career guidance.'
        },
       
        {
          title: 'randy the rumninator',
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
    
    // R CLICK - Show tech content
    if (item.title === 'readable tech content') {
      console.log('📄 R clicked - showing tech content links');
      const linkProjects = rLinks.map(link => ({
        title: link.name,
        url: link.url,
        shape: link.shape,
        type: 'link' as const,
        description: 'Dev tools, construction infrastructure, and modern engineering practices, all written at eye level for technical audiences.'
      }));
      
      setDisplayedItems(linkProjects);
      setMode('links');
      return;
    }
    
    // I CLICK - Show interactive
    if (item.title === 'interactive') {
      console.log('🎮 I clicked - showing interactive links');
      const linkProjects = iLinks.map(link => ({
        title: link.name,
        url: link.url,
        type: 'link' as const,
        description: 'Written for the screen, not the page.'
      }));
      
      setDisplayedItems(linkProjects);
      setMode('links');
      return;
    }
    
    // S CLICK - Job analysis
    if (item.title === 'skill scan') {
      console.log('💼 S clicked - activating job analysis mode');
      
      setDisplayedItems(initialProjects);
      setMode('links');
      setChatCentered(true);
      onChatCenter?.(true);
      onSkillsClick?.();
      onJobAnalysisOpen?.();
      
      return;
    }
  }, [mode, initialProjects, rLinks, iLinks, onChatCenter, onDevinModeClick, onScoutModeClick, onCooperModeClick, onCreativeModeClick, onInsecureModeClick, onJobAnalysisOpen, onSkillsClick]);

  const handleBackClick = () => {
    console.log('⬅️ Back button clicked');
    
    setDisplayedItems([]);
    setMode('initial');
    setChatCentered(false);
    setPromptModeActive(false);
    setCarouselData(null);
    setLocalDescription(null);
    onChatCenter?.(false);
    onJobAnalysisClose?.();
    
    console.log('✅ State reset complete');
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      backgroundColor: mode === 'initial' ? '#8c6a48' : '#dcd3c3'
    }}>
      {/* Background overlay */}
      {(mode === 'links' || chatCentered) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#dcd3c3',
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
      {!hideDescriptionBox && mode === 'links' && ((displayedItems.length > 0 && (displayedItems[0].description || displayedItems[0].campaignListDescription || displayedItems[0].impact || carouselData)) || promptModeActive) && (
        <div 
          style={{
            position: 'absolute',
            top: '68px',
            right: '500px',
            zIndex: 601,
            maxWidth: '750px',
            maxHeight: '85vh',
            padding: '20px',
            background: '#dcd3c3f2',
            color: '#5e4631',
            borderRadius: '10px',
            fontSize: '18px',
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
            // Show activePromptDescription for prompt modes
            activePromptDescription || localDescription || 'XXXXX'
          ) : displayedItems[0]?.type === 'campaign' ? (
            'Authentic product narratives that have piqued curiosity in customers, gained traction for marketing, and built pipeline for sales.'
          ) : (
            <>
              {displayedItems[0]?.campaignTitle && (
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                  {displayedItems[0].campaignTitle}
                </div>
              )}
              
              {displayedItems[0]?.description && (
                <div style={{ marginBottom: '8px' }}>
                  {displayedItems[0].description}
                </div>
              )}
              
              {displayedItems[0]?.campaignListDescription && (
                <div style={{ marginBottom: '11px' }}>
                  {displayedItems[0].campaignListDescription}
                </div>
              )}
              
              {displayedItems[0]?.impact && displayedItems[0].impact.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '12px' }}>
                    Impact & Results:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1', fontSize: '14px', listStyle: 'disc' }}>
                    {displayedItems[0].impact.map((item, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {item.stat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            fontFamily: 'Arial',
            fontSize: '16px',
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
          color: '#dcd3c3',
          fontSize: '18px',
          lineHeight: '1.3',
          textAlign: 'left',
          zIndex: 700,
          padding: '20px'
        }}>
          Chris  content for brands who see ai as the fire, not the chef.
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
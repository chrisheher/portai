// The portfolio's existing pages (/?show=<key>), used by the home-page search, each with
// the published pieces (sources) it links to. Search results open those pieces directly.
// Copied from the campaign, technical and interactive data in chat-landing.tsx:
// update both when a page is added.

export type Source = { name: string; url: string };
export type PortfolioPage = { key: string; title: string; category: string; description: string; sources: Source[]; impact?: string[] };

export const PAGES: PortfolioPage[] = [
  {
    "key": "evergreen",
    "title": "evergreen content ",
    "category": "Campaign",
    "description": "Content whose value outlasts its kpi, continnuing to drive traffic and add value long after its launch",
    "sources": [
      {
        "name": "DroneDeploy | Underground utilities",
        "url": "https://www.dronedeploy.com/blog/within-striking-distance-risks-and-consequences-of-manual-utility-mapping"
      },
      {
        "name": "DroneDeploy | reality capture white paper",
        "url": "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf"
      },
      {
        "name": "Sentry | why debugging javascript sucks",
        "url": "https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/"
      },
      {
        "name": "Sentry | how slow is slow?",
        "url": "https://blog.sentry.io/how-slow-is-slow/"
      },
      {
        "name": "Sentry | measuring UX with Web Vitals",
        "url": "https://blog.sentry.io/measuring-user-experience-with-web-vitals/"
      },
      {
        "name": "DroneDeploy | facade inspections guide",
        "url": "https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections"
      },
      {
        "name": "Sentry | great moments in application monitoring",
        "url": "https://blog.sentry.io/great-moments-in-application-monitoring/"
      }
    ],
    "impact": [
      "~10% pipeline influence from Safety AI content",
      "100+ companies engaged in trial walks due to campaign.",
      "~3k total landing page visits across top-of-funnel content."
    ]
  },
  {
    "key": "sentry-performance",
    "title": "Sentry | Performance GTM campaign",
    "category": "Campaign",
    "description": "Product releases run the risk of getting bogged down in their own technical benefits. For Sentry's Performance monitoring release, this meant turning jargony features (such as improved visibility into p95 response times) into a simple, differentiating insight -- See Slow Faster",
    "sources": [
      {
        "name": "Sentry | How slow is slow? (awareness)",
        "url": "https://blog.sentry.io/how-slow-is-slow/"
      },
      {
        "name": "Sentry | See slow faster: release blog",
        "url": "https://blog.sentry.io/see-slow-faster-with-performance-monitoring/"
      },
      {
        "name": "Sentry | Performance monitoring product page",
        "url": "https://sentry.io/solutions/application-performance-monitoring/"
      },
      {
        "name": "Sentry | See slow faster: Atlassian Jira customer story",
        "url": "https://sentry.io/customers/atlassian-jira/"
      },
      {
        "name": "Sentry | See slow faster webinar",
        "url": "https://www.youtube.com/watch?v=J0tAK6dKY3Y"
      }
    ],
    "impact": [
      "$850k in attributed sales pipeline",
      "Campaign content generated 3,480 visits (2.3x site average)",
      "~300 companies initiated trial during launch window (vs. 90 in pre-launch quarter)"
    ]
  },
  {
    "key": "auth",
    "title": "Technical content",
    "category": "Campaign",
    "description": "Technical content runs the risk of getting bogged down in its own jargon. To counter this, I approach with professional ignorance, do the required reading, and work authentically with subject matter experts.",
    "sources": [
      {
        "name": "Sentry | how slow is slow",
        "url": "https://blog.sentry.io/how-slow-is-slow/"
      },
      {
        "name": "asking the right query with discover",
        "url": "https://blog.sentry.io/asking-the-right-query-with-discover/"
      },
      {
        "name": "DroneDeploy | Stockpile measurement through drone imagery",
        "url": "https://www.dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods"
      },
      {
        "name": "GE | Aviation",
        "url": "https://www.ceros.com/inspire/project/ge-aviation-1"
      },
      {
        "name": "google | gpay instrumentation video",
        "url": "https://www.ceros.com/inspire/project/ge-aviation-1"
      },
      {
        "name": "Python 3 compatibility: what to know",
        "url": "https://blog.sentry.io/python-3-compatibility-what-to-know/"
      }
    ],
    "impact": [
      "$1.8M in attributed sales pipeline",
      "Campaign content generated 3,480 visits (2.3x site average)",
      "~300 companies initiated trial during launch window (vs. 90 in pre-launch quarter)"
    ]
  },
  {
    "key": "safety-ai",
    "title": "DroneDeploy | Safety AI",
    "category": "Campaign",
    "description": "Worksite injuries cost the construction industry $5 billion annually. DroneDeploy's Safety AI uses computer vision to identify safety violations in real-time, turning reactive incident reports into proactive prevention.",
    "sources": [
      {
        "name": "elevating your project with autonomous facade inspections",
        "url": "https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections"
      },
      {
        "name": "the pain points of point solutions",
        "url": "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf"
      },
      {
        "name": "safety, smarter: AI and your work site",
        "url": "https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site"
      },
      {
        "name": "Safety AI product page",
        "url": "https://www.dronedeploy.com/product/safety-ai"
      }
    ],
    "impact": [
      "$10M+ pipeline influence from Safety AI content",
      "70 companies engaged in trial walks, indicating healthy conversion from awareness to hands-on experience.",
      "~3k total landing page visits across top-of-funnel content."
    ]
  },
  {
    "key": "sentry-dogfooding",
    "title": "Sentry Dogfooding Chronicles",
    "category": "Campaign",
    "description": "Dogfooding is the process in which a company uses its own product as a quality control mechanism. This concept was a perfect fit for Sentry to showcase how its software engineers were using Sentry's own platform to track errors in the codebase. Creating stories out of mundane coding hiccups established Sentry as a thought leader across key industry blogs without sounding preachy or pedantic.",
    "sources": [
      {
        "name": "Go-Getting Lazy loading",
        "url": "https://blog.sentry.io/go-getting-lazy-loading/"
      },
      {
        "name": "Using Sentry Performance to get Sentry Performant",
        "url": "https://blog.sentry.io/using-sentry-performance-to-make-sentry-performant"
      },
      {
        "name": "Thinking backward, moving forward",
        "url": "https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward"
      },
      {
        "name": "Patching a flood of 404s",
        "url": "https://blog.sentry.io/patching-a-flood-of-404s/"
      }
    ],
    "impact": [
      "Revenue tripled in the two years since series launch",
      "$1.8M influence on expansion ARR pipeline",
      "25+ blog posts generated a total of ~145k site visits -- 40% of which were organic"
    ]
  },
  {
    "key": "hp-presence",
    "title": "HP Presence | white paper series",
    "category": "Campaign",
    "description": "The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP's content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for distributed workforces.",
    "sources": [
      {
        "name": "The new office for the way people want to work",
        "url": "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf"
      },
      {
        "name": "HP Presence Product page",
        "url": "https://www.hp.com/us-en/solutions/presence.html"
      },
      {
        "name": "A new blueprint for an uncertain world",
        "url": "https://getstarted.hbs.net/hubfs/2025%20Partner%20Campaigns/HP_Services_Hybrid_A-New-Blueprint-for-an-Uncertain-World_Consideration_ebook_2022.pdf.pdf?hsLang=en"
      },
      {
        "name": "Get ready today to do tomorrow's work",
        "url": "https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf"
      },
      {
        "name": "An essential guide to the new era of work",
        "url": "/hp_guide.pdf"
      }
    ],
    "impact": [
      "8,940 total white paper downloads across all 10 assets in launch quarter",
      "~2.5k MQLs generated from white paper download forms",
      "$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution",
      "White paper landing pages drove 34,200 total site visits -- 67% of which were organic"
    ]
  },
  {
    "key": "cincoro",
    "title": "Cincoro tequila | brand launch",
    "category": "Campaign",
    "description": "George Clooney. The Rock. Kendall Jenner. Bryan Cranston. Celebrity tequila is a crowded space. So when Michael Jordan and four other NBA owners started their own tequila company, I was there to help them find a way to help their brand stand out among the stars. <br/><br/> Cincoro translates to \"five rings\". And so the story of Cincoro Tequila is the passion and competitive spirit its five owners share as they each chase their next championship ring.",
    "sources": [
      {
        "name": "Cincoro tequila | Instagram",
        "url": "https://www.instagram.com/cincoro/"
      }
    ],
    "impact": [
      "1–3M of revenue when social was a customer's first-touch",
      "Built social audience to 110K+ followers across platforms, exceeding historical leaders in the space (Don Julio was at ~97K)",
      "brand grew from zero to 1.5M bottles sold"
    ]
  },
  {
    "key": "robotics",
    "title": "DroneDeploy | Ground Robotics",
    "category": "Campaign",
    "description": "Working in partnership with Boston Dynamics, DroneDeploy's industrial inspection platform captures frequent and consistent data on assets that need regular monitoring in ways which scale up site visibility while dialing down man hours.",
    "sources": [
      {
        "name": "Ground Robotics",
        "url": "https://www.dronedeploy.com/product/robotics"
      },
      {
        "name": "DroneDeploy | Industrial Inspection",
        "url": "https://www.dronedeploy.com/product/robotic-industrial-inspection"
      },
      {
        "name": "DroneDeploy | Dock Automation",
        "url": "https://www.dronedeploy.com/product/dock-automation"
      }
    ],
    "impact": [
      "8.5% deals influenced in pipeline"
    ]
  },
  {
    "key": "gpay",
    "title": "Google | gpay instrumentation videos",
    "category": "Technical content",
    "description": " Google's GPay API was designed to be simple. Which meant the content for its tutorial video needed to act likewise. So instead of a smug, stemwinding video that wastes a developer's time with phony rapport, I articulated the simplest path to instrumentation.",
    "sources": [
      {
        "name": "API demo (web)",
        "url": "https://www.youtube.com/watch?v=pZyGYUMZAeg"
      },
      {
        "name": "API: What to know",
        "url": "https://www.youtube.com/watch?v=rP_UAPcIG4I"
      },
      {
        "name": "API for android",
        "url": "https://www.youtube.com/watch?v=SZorG5Hqjzc"
      }
    ],
    "impact": [
      "900k+ combined youtube views on google's developer channels",
      "1.5m ARR impact",
      "~500 new integrations from live merchants"
    ]
  },
  {
    "key": "sentry-dev",
    "title": "Sentry developer content",
    "category": "Technical content",
    "description": "Sentry is an application monitoring platform that optimizes code health by tracking metrics, logs and traces. Like a periodontist handing out lollies to patients, my role involved creating appetizing content that made code hygiene tolerable to software engineers.",
    "sources": [
      {
        "name": "How slow is slow?",
        "url": "https://blog.sentry.io/how-slow-is-slow/"
      },
      {
        "name": "Why debugging Javascript sucks",
        "url": "https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/"
      },
      {
        "name": "Python 3 compatibility",
        "url": "https://blog.sentry.io/python-3-compatibility-what-to-know/"
      },
      {
        "name": "Great moments in application monitoring",
        "url": "https://blog.sentry.io/great-moments-in-application-monitoring/"
      },
      {
        "name": "Asking the Right Query With Discover",
        "url": "https://blog.sentry.io/asking-the-right-query-with-discover/"
      }
    ],
    "impact": [
      "ARR: $45M → $90M during my tenure (Series B→C growth).",
      "~480 SQL conversions (9.5% attributed to ARR)",
      "~150k page visits in total",
      "Product pages drove ~450 handraisers among construction professionals",
      "2x handraisers compared to previous content",
      "35% increase in demo requests"
    ]
  },
  {
    "key": "hp",
    "title": "HP Presence white papers",
    "category": "Technical content",
    "description": "The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP's content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for newly distributed workforces",
    "sources": [
      {
        "name": "The new era of work",
        "url": "https://dandh.com/media/pdf/pages/focusedlanding/devicerefresh/2024/An_essential_guide_The_new_era_of_work.pdf"
      },
      {
        "name": "A new blueprint for an uncertain world.",
        "url": "https://getstarted.hbs.net/hubfs/2025%20Partner%20Campaigns/HP_Services_Hybrid_A-New-Blueprint-for-an-Uncertain-World_Consideration_ebook_2022.pdf.pdf?hsLang=en"
      },
      {
        "name": "The new office for the way people want to work",
        "url": "https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf"
      },
      {
        "name": "Get ready today to do tomorrow's work",
        "url": "https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf"
      }
    ],
    "impact": [
      "8,970 total white paper downloads across all 10 assets during launch quarter",
      "2,340 MQLs (Marketing Qualified Leads) generated from white paper download forms",
      "$680K in closed-won deals with white paper download in buyer journey — direct revenue attribution"
    ]
  },
  {
    "key": "ge",
    "title": "GE | Experiential content",
    "category": "Technical content",
    "description": "Taking specs and product roadmaps into an immersive digital experience with layered content and strategic calls to action",
    "sources": [
      {
        "name": "Aviation turboprop",
        "url": "https://www.ceros.com/inspire/project/ge-aviation-1"
      },
      {
        "name": "Propulsion tech",
        "url": "https://www.ceros.com/inspire/project/ge-2"
      },
      {
        "name": "Digital transformation",
        "url": "https://www.ceros.com/inspire/project/digital-transformation"
      },
      {
        "name": "Unplanned downtime",
        "url": "https://www.ceros.com/inspire/project/unplanned-downtime"
      }
    ],
    "impact": [
      "Click-through rate: +15–30%",
      "Lead-to-opportunity conversion: +15–20%",
      "30% lift in MQL volume"
    ]
  },
  {
    "key": "dd-construction",
    "title": "DroneDeploy | Construction site content",
    "category": "Technical content",
    "description": "The perception of drones is that they're more fun than functional. These pieces articulate how drones benefit a crew working the site: safer surveys, inch-perfect measurements, and a more consistent way to track progress.",
    "sources": [
      {
        "name": "The Ultimate Guide to Facade Inspections",
        "url": "https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections"
      },
      {
        "name": "Closing The Gap in Stockpile Quantification",
        "url": "https://dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods"
      },
      {
        "name": "Within Striking Distance: Dangers of Underground Utilities",
        "url": "https://www.dronedeploy.com/blog/within-striking-distance-risks-and-consequences-of-manual-utility-mapping"
      },
      {
        "name": "Flying beyond line of sight",
        "url": "https://www.dronedeploy.com/blog/flying-beyond-visual-line-of-sight-the-complete-guide-to-bvlos-waivers-and-docked-drones"
      }
    ]
  },
  {
    "key": "cloud",
    "title": "Cloud content",
    "category": "Technical content",
    "description": "Lead writer across three separate functions of cloud computing: observability (chronosphere), migration (NetApp/Azure), and best practices (Pendo)",
    "sources": [
      {
        "name": "Are the three pillars of observability still relevant?",
        "url": "https://chronosphere.io/learn/are-the-three-pillars-of-observability-still-relevant/"
      },
      {
        "name": "NetApp | Azure migration",
        "url": "https://www.netapp.com/pdf.html?item=/media/16141-wp-azure-migration.pdf"
      },
      {
        "name": "Pendo | Product Cloud",
        "url": "https://www.ceros.com/inspire/project/theproductcloud"
      }
    ]
  },
  {
    "key": "dd-pages",
    "title": "DroneDeploy | Product pages",
    "category": "Product & web",
    "description": "Collaborating with product and sales teams at Boston Dynamics, my content piqued curiosity, ensured technical accuracy, and got customers engaged with the funnel by adding cross-links to related content.",
    "sources": [
      {
        "name": "Ground Robotics",
        "url": "https://www.dronedeploy.com/product/robotics"
      },
      {
        "name": "Dock Automation",
        "url": "https://www.dronedeploy.com/product/dock-automation"
      },
      {
        "name": "Data on Demand",
        "url": "https://www.dronedeploy.com/data-on-demand"
      },
      {
        "name": "Industrial Inspection",
        "url": "https://www.dronedeploy.com/product/robotic-industrial-inspection"
      }
    ],
    "impact": [
      "content influenced 8.5% of ground robotics pipeline deals",
      "1.7% engagement rate to take meaningful action",
      "28% increase in handraisers"
    ]
  },
  {
    "key": "airbnb",
    "title": "Airbnb | Career website",
    "category": "Product & web",
    "description": "As lead writer for Airbnb's career website, I developed their employer value proposition coming out of their Live and Work Anywhere policy, then executed on that strategy with compelling content.",
    "sources": [
      {
        "name": "Career home page",
        "url": "https://careers.airbnb.com/"
      },
      {
        "name": "Life at airbnb",
        "url": "https://careers.airbnb.com/life-at-airbnb/"
      },
      {
        "name": "Apprentice page",
        "url": "https://careers.airbnb.com/connect-engineering-apprenticeship/"
      }
    ],
    "impact": [
      "72% increase in applications first post-launch quarter",
      "170% increase in applications from underrepresented groups",
      "3.4x increase in page views vs. previous site)"
    ]
  },
  {
    "key": "sentry-pages",
    "title": "Sentry | Product pages",
    "category": "Product & web",
    "description": "Partnered with software engineers to co-produce content that articualted value propositions and while moving users into trial.",
    "sources": [
      {
        "name": "Sentry | Enterprise page",
        "url": "https://www.sentry.dev/for/enterprise/"
      },
      {
        "name": "Sentry | Full stack",
        "url": "https://sentry.io/for/full-stack/"
      },
      {
        "name": "Sentry | Performance monitoring",
        "url": "https://www.sentry.dev/solutions/application-performance-monitoring/"
      },
      {
        "name": "Sentry | Mobile development",
        "url": "https://sentry.io/solutions/mobile-developers/"
      },
      {
        "name": "Asking the Right Query With Discover",
        "url": "https://blog.sentry.io/asking-the-right-query-with-discover/"
      }
    ],
    "impact": [
      "Internal product release alignment boosted CTR by 15–20% around launch week.",
      "Over 1.1k opportunites captured by form signups",
      "15% adoption lift YoY"
    ]
  },
  {
    "key": "fintech",
    "title": "Ceros | fintech pages",
    "category": "Interactive",
    "description": "Quick-hitting infographics written to pique the curiosity of time-poor investors as a means of earning their contact credentials on the form gate.",
    "sources": [
      {
        "name": "Ceros | Lending Club Quiz",
        "url": "https://www.ceros.com/inspire/project/study-quiz-desktop"
      },
      {
        "name": "Goldman Sachs infographic",
        "url": "https://www.vox.com/c/ad/21492335/voxcreative-goldman-sachs-sustainability"
      },
      {
        "name": "Goldman Sachs linkedin post",
        "url": "https://www.linkedin.com/posts/goldman-sachs_taking-the-heat-an-infographic-by-goldman-activity-6713949693799366656-Lqqg?utm_source=share&utm_medium=member_desktop&rcm=ACoAAACEJgUBovX20uHgnYWTEh3A2BrZxc9SiOE"
      },
      {
        "name": "Morgan Stanley | Sustainability infographic",
        "url": "https://www.ceros.com/inspire/project/sustainability"
      }
    ],
    "impact": [
      "3x time spent on site compared to .pdf content",
      "1.75x SQL leads per month generated",
      "Ceros closed financial clients producing this content while during trial"
    ]
  },
  {
    "key": "personal",
    "title": "Personal projects",
    "category": "Personal & experimental",
    "description": "Self-directed work: an AI retrieval engine for literature, an audiobook, and long-form interactive explainers that teach software and content strategy through the parts of a marine diesel engine.",
    "sources": [
      {
        "name": "raglib | a literary RAG engine with graph-based retrieval, reranking and Claude integration",
        "url": "https://onlychr.is/raglib"
      },
      {
        "name": "SDK 13 explained by a 6-71 Detroit Diesel (interactive explainer)",
        "url": "/sdk-13.html"
      },
      {
        "name": "Content Engine Parts Desk: content job descriptions broken down like an engine",
        "url": "/content-engine.html"
      },
      {
        "name": "Heureka: the creative process, and why the H matters",
        "url": "/heureka.html"
      },
      {
        "name": "Audiobook on Spotify, voiced by Sopranos characters",
        "url": "https://open.spotify.com/show/1ypvv6o17z6aEt3HODd1xt"
      }
    ]
  }
];

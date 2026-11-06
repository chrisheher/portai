// The portfolio's existing pages (/?show=<key>), used by the home-page search.
// Copied from the campaign, technical and interactive data in chat-landing.tsx:
// update both when a page is added.

export type PortfolioPage = { key: string; title: string; category: string; description: string };

export const PAGES: PortfolioPage[] = [
  {
    "key": "evergreen",
    "title": "evergreen content ",
    "category": "Campaign",
    "description": "Content whose value outlasts its kpi, continnuing to drive traffic and add value long after its launch"
  },
  {
    "key": "auth",
    "title": "Technical content",
    "category": "Campaign",
    "description": "Technical content runs the risk of getting bogged down in its own jargon. To counter this, I approach with professional ignorance, do the required reading, and work authentically with subject matter experts."
  },
  {
    "key": "safety-ai",
    "title": "DroneDeploy | Safety AI",
    "category": "Campaign",
    "description": "Worksite injuries cost the construction industry $5 billion annually. DroneDeploy's Safety AI uses computer vision to identify safety violations in real-time, turning reactive incident reports into proactive prevention."
  },
  {
    "key": "sentry-dogfooding",
    "title": "Sentry Dogfooding Chronicles",
    "category": "Campaign",
    "description": "Dogfooding is the process in which a company uses its own product as a quality control mechanism. This concept was a perfect fit for Sentry to showcase how its software engineers were using Sentry's own platform to track errors in the codebase. Creating stories out of mundane coding hiccups established Sentry as a thought leader across key industry blogs without sounding preachy or pedantic."
  },
  {
    "key": "hp-presence",
    "title": "HP Presence | white paper series",
    "category": "Campaign",
    "description": "The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP's content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for distributed workforces."
  },
  {
    "key": "cincoro",
    "title": "Cincoro tequila | brand launch",
    "category": "Campaign",
    "description": "George Clooney. The Rock. Kendall Jenner. Bryan Cranston. Celebrity tequila is a crowded space. So when Michael Jordan and four other NBA owners started their own tequila company, I was there to help them find a way to help their brand stand out among the stars. <br/><br/> Cincoro translates to \"five rings\". And so the story of Cincoro Tequila is the passion and competitive spirit its five owners share as they each chase their next championship ring."
  },
  {
    "key": "robotics",
    "title": "DroneDeploy | Ground Robotics",
    "category": "Campaign",
    "description": "Working in partnership with Boston Dynamics, DroneDeploy's industrial inspection platform captures frequent and consistent data on assets that need regular monitoring in ways which scale up site visibility while dialing down man hours."
  },
  {
    "key": "gpay",
    "title": "Google | gpay instrumentation videos",
    "category": "Technical content",
    "description": " Google's GPay API was designed to be simple. Which meant the content for its tutorial video needed to act likewise. So instead of a smug, stemwinding video that wastes a developer's time with phony rapport, I articulated the simplest path to instrumentation."
  },
  {
    "key": "sentry-dev",
    "title": "Sentry developer content",
    "category": "Technical content",
    "description": "Sentry is an application monitoring platform that optimizes code health by tracking metrics, logs and traces. Like a periodontist handing out lollies to patients, my role involved creating appetizing content that made code hygiene tolerable to software engineers."
  },
  {
    "key": "hp",
    "title": "HP Presence white papers",
    "category": "Technical content",
    "description": "The pandemic altered the fabric of society. And nowhere was this more evident than in the office. As HP's content strategist, I helped position their Presence videoconferencing suite to be the connective tissue for newly distributed workforces"
  },
  {
    "key": "ge",
    "title": "GE | Experiential content",
    "category": "Technical content",
    "description": "Taking specs and product roadmaps into an immersive digital experience with layered content and strategic calls to action"
  },
  {
    "key": "dd-construction",
    "title": "DroneDeploy | Construction site content",
    "category": "Technical content",
    "description": "The perception of drones is that they're more fun than functional. These pieces articulate how drones benefit a crew working the site: safer surveys, inch-perfect measurements, and a more consistent way to track progress."
  },
  {
    "key": "cloud",
    "title": "Cloud content",
    "category": "Technical content",
    "description": "Lead writer across three separate functions of cloud computing: observability (chronosphere), migration (NetApp/Azure), and best practices (Pendo)"
  },
  {
    "key": "dd-pages",
    "title": "DroneDeploy | Product pages",
    "category": "Product & web",
    "description": "Collaborating with product and sales teams at Boston Dynamics, my content piqued curiosity, ensured technical accuracy, and got customers engaged with the funnel by adding cross-links to related content."
  },
  {
    "key": "airbnb",
    "title": "Airbnb | Career website",
    "category": "Product & web",
    "description": "As lead writer for Airbnb's career website, I developed their employer value proposition coming out of their Live and Work Anywhere policy, then executed on that strategy with compelling content."
  },
  {
    "key": "sentry-pages",
    "title": "Sentry | Product pages",
    "category": "Product & web",
    "description": "Partnered with software engineers to co-produce content that articualted value propositions and while moving users into trial."
  }
];

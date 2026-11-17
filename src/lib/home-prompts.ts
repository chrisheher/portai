// The home page's falling prompts (p1–p5) and the pieces each one drops in.
// Each piece: title ("Company | piece"), blurb, optional impact, and links shown in brackets.
// A link with no url is still owed: it's kept here as a reminder but not shown on the page.

export type PieceLink = { label: string; url?: string };
export type Piece = { title: string; blurb: string; impact?: string; links: PieceLink[] };
export type HomePrompt = { id: string; prompt: string; pieces: Piece[] };

export const HOME_PROMPTS: HomePrompt[] = [
  {
    id: 'p1',
    prompt: 'Show me content that drove pipeline.',
    pieces: [
      {
        title: 'Sentry | Full-funnel content for Performance Monitoring launch',
        blurb: '“See Slow Faster” tagline that defined the performance monitoring category in addition to targeted content that drove customers from awareness to action.',
        impact: '$1.8m in attributed pipeline.',
        links: [
          { label: 'CEO tweet' }, // needed
          { label: 'release blog', url: 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/' },
          { label: 'atlassian customer story', url: 'https://sentry.io/customers/atlassian-jira/' },
          { label: 'webinar', url: 'https://www.youtube.com/watch?v=J0tAK6dKY3Y' },
        ],
      },
      {
        title: 'DroneDeploy | Safety AI GTM content',
        blurb: 'Content ranged from articulating AI’s benefits on the job site, launch tagline (“Your AI In The Sky”) and product use cases.',
        impact: '$450K in Stage 2 pipeline; 70% lift in organic traffic; 87% increase in trial adoption compared to previous launches.',
        links: [
          { label: 'Safety Smarter: AI and your work site', url: 'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site' },
          { label: 'Product page', url: 'https://www.dronedeploy.com/product/safety-ai' },
          { label: 'Within striking distance: Underground Utilities', url: 'https://www.dronedeploy.com/blog/within-striking-distance-risks-and-consequences-of-manual-utility-mapping' },
        ],
      },
      {
        title: 'HP | Thought Leadership series for Presence rollout',
        blurb: 'A series of white papers investigating how employees communicate differently coming out of the pandemic, and how companies can adapt their offices to improve collaboration.',
        impact: '$680k closed-won revenue resulting from content-generated leads.',
        links: [
          { label: 'The new office for the way people want to work', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf' },
          { label: 'Get ready today to do tomorrow’s work', url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf' },
          { label: 'An essential guide to the new era of work', url: '/hp_guide.pdf' },
        ],
      },
      {
        title: 'Cincoro | Brand Launch',
        blurb: 'Wrote brand manifesto, website content and owned social media calendar for a tequila launched by Michael Jordan and four NBA owners.',
        impact: 'Grew social following from 0–91k, leading to 1.5m bottles sold in Cincoro’s first year.',
        links: [
          // cincoro.com doesn't respond; this is the Wayback copy of the launch site.
          { label: 'Web Page', url: 'https://web.archive.org/web/20210723165425/https://www.cincoro.com/' },
          { label: 'social posts', url: '/social.pdf#page=6' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    prompt: 'How has he built brands through content?',
    pieces: [
      {
        title: 'Sentry | Dogfooding Chronicles',
        blurb: 'Creator of a syndicated content series which turned a dev team’s internal hiccups into external thought leadership.',
        impact: '$100K–$150K SEO value from dev.to + Hacker News coverage.',
        links: [
          { label: 'Patching a flood of 404s', url: 'https://blog.sentry.io/patching-a-flood-of-404s/' },
          { label: 'Thinking Backward, Moving Forward', url: 'https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward/' },
          { label: 'Using Sentry Performance to get Sentry Performant', url: 'https://blog.sentry.io/using-sentry-performance-to-make-sentry-performant/' },
          { label: 'Go-Getting Lazy loading', url: 'https://blog.sentry.io/go-getting-lazy-loading/' },
        ],
      },
      {
        title: 'Airbnb | Career website',
        blurb: 'Coming out of The Great Resignation, an organization’s culture became a key differentiator toward attracting talent. As lead writer for Airbnb’s career website, I developed their internal employer value proposition, then executed it with compelling, talent-facing copy.',
        impact: '72% increase in applications in first quarter post-launch.',
        links: [
          { label: 'Career home page', url: 'https://careers.airbnb.com/' },
          { label: 'Life at Airbnb', url: 'https://careers.airbnb.com/life-at-airbnb/' },
          { label: 'Apprentice page', url: 'https://careers.airbnb.com/connect-engineering-apprenticeship/' },
        ],
      },
      {
        title: 'DroneDeploy | White Collar content',
        blurb: 'Part of a strategic pivot to ConTech content written from the construction executive’s perspective in ways which expanded DroneDeploy’s prospect pool, increased demos, and improved win rates across a ~10m pipeline.',
        links: [
          { label: 'More tools, more problems white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
          { label: 'Data on Demand page', url: 'https://www.dronedeploy.com/data-on-demand' },
          { label: 'Facade Inspections', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
        ],
      },
      {
        title: 'Sentry | Social + sales enablement content',
        blurb: 'Content that helped Sentry’s sales team build awareness, turn prospects into customers, trials to paid seats, and get developers to evangelize Sentry internally within their organizations.',
        links: [
          { label: 'Social posts', url: '/social.pdf#page=2' },
          { label: 'Sentry for Enterprise page', url: 'https://sentry.io/for/enterprise/' },
          { label: 'Full stack', url: 'https://sentry.io/for/full-stack/' },
          { label: 'One-pager' }, // needed
        ],
      },
      {
        title: 'DroneDeploy | Boston Dynamics partnership',
        blurb: 'Ground robotics content that articulated DroneDeploy’s partnership with a key industry leader.',
        links: [
          { label: 'Product page', url: 'https://www.dronedeploy.com/product/robotics' },
          { label: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
          { label: 'Dock Automation', url: 'https://www.dronedeploy.com/product/dock-automation' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    prompt: 'Can he write for developers? Judging by his github profile, he’s a poser coder at best.',
    pieces: [
      {
        title: 'Sentry | How Slow is Slow',
        blurb: 'Written in concert with Sentry’s Head of Product, this piece argues that a slow app is not only as costly as one that’s down, but that the abstract quality of “slow” (time is relative, y’know) creates DevOps blind spots.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/how-slow-is-slow/' }],
      },
      {
        title: 'Sentry | Great moments in application monitoring',
        blurb: 'A rundown celebrating Sentry’s earliest customer successes in a tone that’s as grandiose as it is earnest.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/great-moments-in-application-monitoring/' }],
      },
      {
        title: 'Google | GPay instrumentation videos',
        // The submitted blurb was cut off ("Tutorial on; the series drew."); this stands in until it's rewritten.
        blurb: 'Tutorial videos on the simplest path to instrumenting Google’s GPay API.',
        impact: '~500 merchant integrations during launch at I/O; 900k+ combined views on Google’s developer channels.',
        links: [
          { label: 'demo (web)', url: 'https://www.youtube.com/watch?v=pZyGYUMZAeg' },
          { label: 'API: What to know', url: 'https://www.youtube.com/watch?v=rP_UAPcIG4I' },
          { label: 'API for Android', url: 'https://www.youtube.com/watch?v=SZorG5Hqjzc' },
        ],
      },
      {
        title: 'Sentry | Why debugging JavaScript sucks',
        blurb: 'An explainer on JavaScript debugging pain points, one which keeps drawing traffic long after launch.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/' }],
      },
      {
        title: 'Sentry | Asking the right query with Discover',
        blurb: 'Articulating how developers benefit (both in time and sanity) by using Discover to write the right query.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/asking-the-right-query-with-discover/' }],
      },
      {
        title: 'Chronosphere | Three pillars of observability (Executive ghostwriter)',
        blurb: 'Defining observability’s three pillars, then explaining how data cardinality can throw a wrench into each of them.',
        links: [{ label: 'Read', url: 'https://chronosphere.io/learn/are-the-three-pillars-of-observability-still-relevant/' }],
      },
    ],
  },
  {
    id: 'p4',
    prompt: 'Can he write technical content that experts will actually read, not roll their eyes at?',
    pieces: [
      {
        title: 'GE | Turboprop product explainer',
        blurb: 'Interactive/experiential pieces articulating the inner workings of aviation technology.',
        links: [
          { label: 'Propulsion tech', url: 'https://www.ceros.com/inspire/project/ge-2/' },
          { label: 'Digital transformation', url: 'https://www.ceros.com/inspire/project/digital-transformation/' },
          { label: 'Unplanned downtime', url: 'https://www.ceros.com/inspire/project/unplanned-downtime/' },
        ],
      },
      {
        title: 'DroneDeploy | Blue-collar content',
        blurb: 'Breaking down the benefits of photogrammetry in plain English that get through hard hats.',
        links: [
          { label: 'Facade inspections guide', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
          { label: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
          { label: 'Closing the gap in stockpile quantification', url: 'https://www.dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods' },
          { label: 'Flying beyond line of sight', url: 'https://www.dronedeploy.com/blog/flying-beyond-visual-line-of-sight-the-complete-guide-to-bvlos-waivers-and-docked-drones' },
        ],
      },
      {
        title: 'Sentry | Python 3 compatibility',
        blurb: 'Blog post that runs through why Sentry upgraded to Python 3.6: security patches, type hinting, in addition to laying the groundwork for Python 3.8’s shared memory to scale CPU-bound event processing.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/python-3-compatibility-what-to-know/' }],
      },
      {
        title: 'Sentry | Receives SOC 2 Type 2 Certification',
        blurb: 'Blog post recognizing Sentry earning its SOC 2 Type II certification that confirms the platform adheres to the highest security standards.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/sentry-receives-soc-2-type-2-certification/' }],
      },
      {
        title: 'Sentry | Building Dark Mode',
        blurb: 'A ghostwritten 2000-word explainer about why dark mode matters, how Sentry implemented it, and how it led them to become more thoughtful about design choices.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/building-dark-mode/' }],
      },
    ],
  },
  {
    id: 'p5',
    prompt: 'Just show me some cool stuff',
    pieces: [
      {
        title: 'Groaning Shelves',
        blurb: 'A GraphRAG library spanning fiction, myth, AI research and nautical manuals featuring Leiden-clustered themes, cross-corpus search functionality, and current events matched to passages.',
        links: [{ label: 'Explore', url: 'https://onlychr.is/raglib' }],
      },
      {
        title: 'Heureka',
        blurb: 'A historical explainer on why ideas worth shouting about originate from a silent letter.',
        links: [{ label: 'Explore', url: '/heureka.html' }],
      },
      {
        title: 'The Floating Studio',
        blurb: 'A novel about two millennials taking The American Dream on a deep water story voyage.',
        links: [{ label: 'Read', url: '/The_Floating_Studio.pdf' }],
      },
      {
        title: 'Audiobook',
        blurb: 'Demo audiobook using Sopranos characters and DJ Pauly D as character voices.',
        links: [{ label: 'Listen', url: 'https://open.spotify.com/show/1ypvv6o17z6aEt3HODd1xt' }],
      },
    ],
  },
];

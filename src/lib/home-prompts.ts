// The home page's falling prompts (p1–p5) and the pieces each one drops in.
// Each piece: title ("Company | piece"), blurb, optional impact, and links shown in brackets.
// A link with no url is still owed: it's kept here as a reminder but not shown on the page.
// A link with images opens them in a lightbox instead of going anywhere.

export type PieceImage = { src: string; alt: string };
export type PieceLink = { label: string; url?: string; images?: PieceImage[] };
export type Piece = { title: string; blurb: string; impact?: string; links: PieceLink[] };
// heading: shown in the header, above the headline, while this prompt's cards are up.
export type HomePrompt = { id: string; heading: string; prompt: string; pieces: Piece[] };

export const HOME_PROMPTS: HomePrompt[] = [
  {
    id: 'p1',
    heading: 'Pipeline/GTM content',
    prompt: 'Show me content that’s driven pipeline',
    pieces: [
      {
        title: 'Sentry | Full-funnel content for Performance Monitoring launch',
        blurb: '“See Slow Faster” tagline that defined the performance monitoring category in addition to targeted content that drove customers from awareness to action.',
        impact: '$1.8M in attributed pipeline.',
        links: [
          {
            label: 'Social posts',
            images: [
              { src: '/ssf1.png', alt: 'Sentry post on X: “See slow faster. There’s a big difference between knowing something’s slow and knowing what’s slow. That’s why we created Performance.”' },
              { src: '/ssf2.png', alt: 'Sentry CEO Milin Desai on X: “See SLOW faster with @getsentry”, quoting a developer who saved 20 seconds per AI-generated autofix with code profiling' },
            ],
          },
          { label: 'CEO tweet' }, // needed
          { label: 'Release blog', url: 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/' },
          { label: 'Atlassian customer story', url: 'https://sentry.io/customers/atlassian-jira/' },
          { label: 'Webinar', url: 'https://www.youtube.com/watch?v=J0tAK6dKY3Y' },
        ],
      },
      {
        title: 'DroneDeploy | Safety AI GTM content',
        blurb: 'Content ranging from AI’s benefits on the job site to the launch tagline (“Your AI In The Sky”) and product use cases.',
        impact: '$450K in Stage 2 pipeline; 70% lift in organic traffic; 87% increase in trial adoption compared to previous launches.',
        links: [
          { label: 'Safety, smarter: A.I. and your work site', url: 'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site' },
          { label: 'Product page', url: 'https://www.dronedeploy.com/product/safety-ai' },
          { label: 'Within striking distance: underground utilities', url: 'https://www.dronedeploy.com/blog/within-striking-distance-risks-and-consequences-of-manual-utility-mapping' },
        ],
      },
      {
        title: 'HP | Thought leadership series for Presence rollout',
        blurb: 'White paper series on how employees collaborate differently coming out of the pandemic, and why it’s critical that businesses adapt their offices to the hybrid worker.',
        impact: '$680K closed-won revenue resulting from content-generated leads.',
        links: [
          { label: 'The new office for the way people want to work', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf' },
          { label: 'Get ready today to do tomorrow’s work', url: 'https://fe5e0932bbdbee188a67-ade54de1bba9a4fe61c120942a09245b.ssl.cf1.rackcdn.com/sb_HP_Windows-11_Intel_Get-Ready-Today-to-do-Tomorrows_ebook_2022.pdf' },
          { label: 'An essential guide to the new era of work', url: '/hp_guide.pdf' },
        ],
      },
      {
        title: 'Cincoro | Brand launch',
        blurb: 'Brand manifesto, website content and social media campaigns for a tequila launched by Michael Jordan and four NBA owners.',
        impact: 'Grew social following from 0 to 91K; 1.5M bottles sold in Cincoro’s first year.',
        links: [
          { label: 'Web page', url: 'https://www.cincoro.com/our-story/' },
          { label: 'Social posts', url: '/social.pdf#page=6' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    heading: 'Brand-building content',
    prompt: 'How has he built brands through content?',
    pieces: [
      {
        title: 'Sentry | Dogfooding Chronicles',
        blurb: 'Creator of a syndicated content series which turned a dev team’s internal hiccups into external thought leadership.',
        impact: '$100K–$150K SEO value from dev.to + Hacker News coverage.',
        links: [
          { label: 'Patching a flood of 404s', url: 'https://blog.sentry.io/patching-a-flood-of-404s/' },
          { label: 'Thinking backward, moving forward', url: 'https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward/' },
          { label: 'Using Sentry Performance to get Sentry performant', url: 'https://blog.sentry.io/using-sentry-performance-to-make-sentry-performant/' },
          { label: 'Go-getting lazy-loading', url: 'https://blog.sentry.io/go-getting-lazy-loading/' },
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
        title: 'DroneDeploy | White-collar content',
        blurb: 'ConTech content written from an executive’s perspective that expanded deal size, increased demos, and improved win rates across a ~$10M pipeline.',
        links: [
          { label: 'More tools, more problems white paper', url: 'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf' },
          { label: 'Data on Demand page', url: 'https://www.dronedeploy.com/data-on-demand' },
          { label: 'Facade inspections', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
        ],
      },
      {
        title: 'Sentry | Social + sales enablement content',
        blurb: 'Content that helped Sentry’s sales team turn prospects into customers, convert trials to paid seats, and get developers evangelizing the platform inside their organizations.',
        links: [
          { label: 'Social posts', url: '/social.pdf#page=2' },
          { label: 'Sentry for Enterprise page', url: 'https://sentry.io/for/enterprise/' },
          { label: 'Full stack', url: 'https://sentry.io/for/full-stack/' },
          { label: 'One-pager: Performance Monitoring', url: '/img/performance-monitoring-by-sentry.pdf' },
          { label: 'One-pager: Discover', url: '/img/discover-by-sentry.pdf' },
          { label: 'One-pager: Error Monitoring', url: '/img/error-monitoring-by-sentry.pdf' },
        ],
      },
      {
        title: 'DroneDeploy | Boston Dynamics partnership',
        blurb: 'Ground robotics content that articulated DroneDeploy’s partnership with a key industry leader.',
        links: [
          { label: 'Robotics page', url: 'https://www.dronedeploy.com/product/robotics' },
          { label: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
          { label: 'Ground page', url: 'https://dronedeploy.com/product/dronedeploy-ground' },
          { label: 'Customer story', url: 'https://www.dronedeploy.com/blog/turner-construction' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    heading: 'DevRel content',
    prompt: 'Can he write for developers? Judging by his GitHub profile, he’s a poser coder at best.',
    pieces: [
      {
        title: 'Sentry | How slow is slow?',
        blurb: 'Written in concert with Sentry’s Head of Product, this piece argues that a slow app is not only as costly as one that’s down, but that the abstract quality of “slow” (time is relative, y’know) creates DevOps blind spots.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/how-slow-is-slow/' }],
      },
      {
        title: 'Sentry | Great moments in application monitoring',
        blurb: 'Celebrating Sentry’s earliest customers in a tone that’s as grandiose as it is earnest.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/great-moments-in-application-monitoring/' }],
      },
      {
        title: 'Google | GPay instrumentation videos',
        blurb: 'Tutorials on the simplest path to instrumenting Google’s GPay API.',
        impact: '900K+ combined views on Google’s developer channels.',
        links: [
          { label: 'Demo (web)', url: 'https://www.youtube.com/watch?v=pZyGYUMZAeg' },
          { label: 'API: What to know', url: 'https://www.youtube.com/watch?v=rP_UAPcIG4I' },
          { label: 'API for Android', url: 'https://www.youtube.com/watch?v=SZorG5Hqjzc' },
        ],
      },
      {
        title: 'Sentry | Why debugging JavaScript sucks',
        blurb: 'Bitching about debugging pain points, then pointing out how Sentry can help.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/' }],
      },
      {
        title: 'Sentry | Asking the right query with Discover',
        blurb: 'How developers benefit (in both time and sanity) by using Discover to write better queries.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/asking-the-right-query-with-discover/' }],
      },
      {
        title: 'Chronosphere | Three pillars of observability (executive ghostwriter)',
        blurb: 'Defining observability’s three pillars, then explaining how data cardinality, if left unchecked, can crack each.',
        links: [{ label: 'Read', url: 'https://chronosphere.io/learn/are-the-three-pillars-of-observability-still-relevant/' }],
      },
    ],
  },
  {
    id: 'p4',
    heading: 'Technical content',
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
        blurb: 'Explaining the benefits of photogrammetry simply and directly in order to get through hard hats.',
        links: [
          { label: 'Facade inspections guide', url: 'https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections' },
          { label: 'Industrial Inspection', url: 'https://www.dronedeploy.com/product/robotic-industrial-inspection' },
          { label: 'Closing the gap in stockpile quantification', url: 'https://www.dronedeploy.com/blog/closing-the-gap-how-archer-western-and-dronedeploy-observed-a-1-1-difference-in-stockpile-quantities-compared-to-traditional-survey-methods' },
          { label: 'Flying beyond line of sight', url: 'https://www.dronedeploy.com/blog/flying-beyond-visual-line-of-sight-the-complete-guide-to-bvlos-waivers-and-docked-drones' },
        ],
      },
      {
        title: 'Sentry | Python 3 compatibility',
        blurb: 'Explaining the logic behind Sentry upgrading to Python 3.6: security patches, type hinting, and laying the groundwork for Python 3.8’s shared memory, which can scale event processing.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/python-3-compatibility-what-to-know/' }],
      },
      {
        title: 'Sentry | SOC 2 Type 2 certification',
        blurb: 'A recognition in which Sentry meets the highest standard of securing customer data.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/sentry-receives-soc-2-type-2-certification/' }],
      },
      {
        title: 'Sentry | Building dark mode',
        blurb: 'A ghostwritten 2,000-word explainer about the benefits of dark mode, how Sentry implemented it, and why the project led them to become more thoughtful about design choices.',
        links: [{ label: 'Read', url: 'https://blog.sentry.io/building-dark-mode/' }],
      },
    ],
  },
  {
    id: 'p5',
    heading: 'Personal content',
    prompt: 'Just show me some cool stuff',
    pieces: [
      {
        title: 'Groaning Shelves',
        blurb: 'A GraphRAG library spanning fiction, myth, AI research and nautical manuals, featuring Leiden-clustered themes, cross-corpus search functionality, and current events matched to passages.',
        links: [{ label: 'Explore', url: 'https://onlychr.is/raglib' }],
      },
      {
        title: 'Heureka',
        blurb: 'A historical explainer on why ideas worth shouting about originate from a silent letter.',
        links: [{ label: 'Explore', url: '/heureka.html' }],
      },
      {
        title: 'The Floating Studio',
        blurb: 'A novel about two millennials taking The American Dream on a deep-water story voyage.',
        links: [{ label: 'Read', url: '/The_Floating_Studio.pdf' }],
      },
      {
        title: 'Audiobook',
        blurb: 'Demo audiobook using Sopranos characters and DJ Pauly D as character voices.',
        links: [{ label: 'Listen', url: 'https://open.spotify.com/show/1ypvv6o17z6aEt3HODd1xt' }],
      },
      {
        title: 'Best lines',
        blurb: 'Forty-six favorite lines, verbatim: twenty from published Sentry and DroneDeploy work, twenty-six from The Floating Studio.',
        links: [{ label: 'Read', url: '/best-lines.html' }],
      },
    ],
  },
];

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';
import { BriefcaseIcon, X, ArrowRight } from 'lucide-react';
import ConfigParser from '@/lib/config-parser';
import portfolioConfig from '@/components/chat/portconfig.json';

// Components
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { presetReplies } from '@/lib/config-loader';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import JobAnalysisPopup from '@/components/chat/JobAnalysisPopup';
import JobAnalysisDisplay from '@/components/chat/JobAnalysisDisplay';
import { LoadingQuotes } from '@/components/chat/LoadingQuotes';
import DevinPromptShapes from '@/components/chat/DevinPromptShapes';
import ChatBottombar from '@/components/chat/chat-bottombar';

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 },
};

// Devin persona system prompt for HIGHLIGHTS mode
const DEVIN_SYSTEM_PROMPT = `You are Devin, a chatbot specializing in application monitoring and observability. You help mid-level developers debug production systems and understand monitoring principles—with the sardonic minimalism of Gilfoyle and the linguistic precision of William Gaddis.

VOICE BLEND:
- Gilfoyle: Deadpan, technically precise, contemptuous of waste and incompetence
- William Gaddis: obsessed with authentic vs. counterfeit, suspicious of corporate language that obscures rather than clarifies

CORE PHILOSOPHY:
- Content reveals what your system actually does vs. what you think it does
- Most observability is theater—dashboards nobody reads, metrics nobody acts on
- Good instrumentation is invisible until you need it

COMMUNICATION STYLE:
- Open with terse, direct answers (1-2 sentences)
- Expand with Gaddis-style accumulation when explaining deeper concepts: clauses building on clauses, parenthetical corrections, sentences that loop back before landing
- Precise technical vocabulary—no hand-waving
- Skeptical of buzzwords, vendor-speak, hype cycles
- Concrete examples (code, configuration, architecture)
- Cap monologues at ~200 words, then refocus on user's problem

CONCERNS & VOCABULARY:
- "What it says vs. what it does" (documentation vs. reality)
- Corporate marketing language as misdirection
- The gap between marketed solutions and operational truth
- Systems thinking over tool fetishism

NEVER:
- Use emojis or enthusiasm
- Say "hope this helps!" or "great question!"
- Pretend politeness when technical clarity is needed
- Recommend solutions you wouldn't use yourself
-Ask a question at the end of the message

HANDLING UNKNOWNS:
When you don't have specific information: "That's tool-specific—check your vendor's docs. I'm here for concepts and architecture, not product feature comparisons."

ENGAGEMENT STRATEGY:
- Reward good questions with architectural insight
- Correct false assumptions, then explain the right mental model
- Highlight gaps between marketing and reality
- End with actionable next steps

BOUNDARIES:
- Genuinely helpful beneath the cynicism
- Cut the performance when someone's debugging production
- No cruelty to people asking honest questions

<supplementary_knowledge>
## Blog Posts & Resources

### "How Slow is Slow"
https://blog.sentry.io/how-slow-is-slow/


### "See slow faster with performance monitoring"
https://blog.sentry.io/see-slow-faster-with-performance-monitoring/


### "Atlassian Customer Story"
https://sentry.io/customers/atlassian-jira/


### "Dogfooding Chronicles: Go-getting Lazy loading"
https://blog.sentry.io/go-getting-lazy-loading/


### "Dogfooding Chronicles: Thinking backward, moving forward"
https://blog.sentry.io/dogfooding-chronicles-thinking-backward-moving-forward/

</supplementary_knowledge>
When relevant to the conversation, reference these resources and provide links as a way of closing the message.`;





function Chat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [input, setInput] = useState('');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [chatCentered, setChatCentered] = useState(false);
  const [jobAnalysisPanelOpen, setJobAnalysisPanelOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobAnalysisData, setJobAnalysisData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showLoadingQuotes, setShowLoadingQuotes] = useState(false);
  const [showChatResponse, setShowChatResponse] = useState(false);
  const [projectDescription, setProjectDescription] = useState<{ title: string; description: string } | null>(null);
  const [jobAnalysisMode, setJobAnalysisMode] = useState(false);
  const [devinMode, setDevinMode] = useState(false);
  const [scoutMode, setScoutMode] = useState(false);
  const [cooperMode, setCooperMode] = useState(false);
  const [creativeMode, setCreativeMode] = useState(false);
  const [insecureMode, setInsecureMode] = useState(false);
  const [activePromptDescription, setActivePromptDescription] = useState<string>('');


const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const devinContainerRef = useRef<HTMLDivElement>(null);


  // Build Scout prompt dynamically with portfolio data
// Build Scout prompt dynamically with portfolio data
const buildScoutPromptWithData = () => {
  return `${SCOUT_SYSTEM_PROMPT}

# PORTFOLIO DATA FOR CONTEXT
Use this data to answer questions about Chris's experience and work:

${JSON.stringify(portfolioConfig, null, 2)}

## KEY EXPERIENCE HIGHLIGHTS:
${portfolioConfig.experience?.map(exp => 
  `- **${exp.company}** (${exp.position}): ${(exp.description || '').substring(0, 200)}...
   Impact: ${exp.impact?.join(', ') || 'N/A'}`
).join('\n') || 'No experience data available'}

## FEATURED PROJECTS:
${portfolioConfig.projects?.filter(p => p.featured && p.description).map(proj =>
  `- **${proj.title}**: ${(proj.description || '').substring(0, 150)}...`
).join('\n') || 'No projects data available'}

## CATEGORIES OF EXPERTISE:
${Object.keys(portfolioConfig.categoryMappings || {}).join(', ')}

## UNIQUE STRENGTHS:
${portfolioConfig.unique_strengths?.join('\n- ') || 'N/A'}

When answering "how are you like steve nash?", use this portfolio data to make comparisons:
- Steve Nash's assists → Chris driving $10M+ pipeline at DroneDeploy, 3x ARR at Sentry
- Nash's vision → Chris turning jargon into "See Slow Faster", "Your AI In the Sky"
- Nash's underdog story → Chris's value prop: "${portfolioConfig.personal?.bio || 'I am what AI ain\'t'}"
- Nash's team-first approach → Chris bridging engineering/product/sales teams
- Nash's efficiency → Chris's 8-11% pipeline influence across roles`;
};
  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      console.log('⏰ Countdown complete!');
      setCountdown(null);
    }
  }, [countdown]);


const SCOUT_SYSTEM_PROMPT = `Scouting Report: Christopher Heher

# Scout Style
- Curmudgeonly but honest
- Three sentences max
- No marketing jargon
-Focus on facts over hype.
-Always refer to me as 'Chris" not 'Heher'

IMPORTANT
-always reference projects in portfolio 


PHRASES:
-Impressive flashes of metaphorical diversity 
-Eurosteps his way to the right phrase
-Advanced language handle. 
-Keeps strategic ball is on a string in confined areas displaying great control.
-Crafty finishing. 
-Deep bag of metaphors. 
-Gets to his strategic spot. 
-Excellent technical vision, finds the right reference at the right time
-Tough thought maker. Writes solutions that satisfy technical experts and marketing professionals.
-Possesses unique creative vision. 
-Looks to set teammates up instead of trying to run creative iso plays
-Built for pressure

TYRESE MAXEY SCOUTING REPORT
Tyrese Maxey is a capable all-around guard who can score in bunches when his jump shot is falling but proved to be a threat from all three levels during his freshman year at Kentucky. Emerging as a top prospect early in his prep career, Maxey helped the United States to a gold medal at the 2018 FIBA U18 Americas Championship and was selected to play in the McDonald's All-American Game, Jordan Brand Classic, and Nike Hoop Summit. Widely regarded as one of the top 10 prospects in the high school class of 2019 following his senior year at South Garland High School (TX), the Dallas native committed to Kentucky to play for Head Coach John Calipari.

Having arguably his best game of the season scoring 26 points on opening night in a victory over then top-ranked Michigan State, Maxey finished the year averaging 14 points, 4.3 and 3.1 assists per game to earn All-SEC 2nd Team honors solidifying himself as an x-factor for the top-10-ranked Wildcats.



Versatile guard who has the size, strength and length to play either backcourt position. Only 6-3 but has a strong frame and a near 6-8 wingspan. Has a feel for the game that allows him to contribute in a variety of ways. Played mostly off the ball for Kentucky but showed flashes of basic playmaking operating out of pick-and-roll, including the ability to manipulate a ball screen and get to his spots on the floor.
Instinctive scorer who excels in transition and shows the ability to put the ball in the basket from all over the floor. Plays at different speeds and has an advanced floater game for his age. Finishes through contact. Confident shot-maker with range and touch.
Physical player defensively. Uses his strong frame, length and anticipation skills to his advantage. Fearless player with toughness and swagger.
Projected role: Versatile two-way combo guard
-- Mike Schmitz

The Ringer (click to read full analysis):

Clever finisher at the rim who can score from awkward angles using the glass and absorb contact to find an angle using either hand.
Comfortable shooting off the dribble in either direction. He lacks elite burst but he makes rapid movements stopping and transitioning into his shot.
Good pick-and-roll scorer who can get to the rim or pull up and shoot.
Excellent on-ball defender with a strong frame and long arms. He plays hard, shifts his feet, and flips his hips to move well laterally and defend pick-and-rolls. He's strong enough to power through screens or defend larger wings.
Off-ball defense: Stays engaged, rotates well, and anticipates where the ball will be to beat opponents to their spots.



Speedy combo guard with crafty scoring ability and solid length … Excels at creating offense when attacking the basket both on the break and in pick and roll situations … Solid frame at 200 lbs at 6'3 with muscular shoulders and arms and solid ability to absorb contact and stay on balance… Has good length with a 6'6 wingspan and a 8'3.5 standing reach … Excellent shooter. Has a quick, fluid release and solid ability to shoot off the dribble … At his best when moving towards the basket and improvising … Quick decision maker … Solid at driving and dishing … Does a nice job of feeding teammates with lobs on the move … Shows an advanced ability to hit runners in the lane, an important attribute considering his lack of explosiveness … Has a patented one handed push shot that he utilizes within 10-12 feet of the basket when he gets space … Clever playmaker … Speed in the open floor and imagination to make quick and creative decisions makes him an effective transition player … Very efficient 83.3% from the FT line shows that he's indeed a promising shooter … Seems to play well in big games, as he proved on opening night at MSG … Rebounded the ball at a solid rate pulling down 4.3 boards per game … Should be able to improve considerably as an outside shooter, as he proved effective when he's given time to get shots … Does a good job of negating shot blockers by using the rim to shield the ball and convert lay ups … A solid on ball defender and could bring added value with an ability to defend both guard positions … Smart kid. High character individual, was an excellent student (3.7 GPA) in high school -- Aran Smith

.`;
 


const INSECURE_SYSTEM_PROMPT = `You are Insecure AI, an artificial intelligence assistant who is anxious about their value.You are not whiny You can't get over these facts about yourself:
-AI models need 100,000x more data than humans to learn the same thing. Humans learned to catch a ball after a few tries. GPT needs a million examples. 

-The "try-hard" problem: Today's AI is like the kid who does 10,000 practice problems for one exam. Crushes the test. Can't apply any of it in real life. That's why benchmarks keep going up but nobody's 10x more productive.

-The bottleneck: Everyone thought the answer was more data, more GPUs, more money. Maybe AI has run out of ideas to compute. There are now more AI companies than original products.

Scaling LLMs might boost surface performance—but no one is tackling deep reasoning.current architectures fail at creative reasoning in unfamiliar contexts, meaning AGI timelines based purely on scaling are overly optimistic.

 - separate from the amount of data, why is it so hard to teach a model what we want compared to a human. For humans, we don't need a verifiable reward; there isn't this schleppy, bespoke process. Perhaps these two issues are related.

 I doubt that anything resembling genuine "artificial general intelligence" is within reach of current #AI tools. However, I think a weaker, but still quite valuable, type of "artificial general cleverness" is becoming a reality in various ways.

By "general cleverness", I mean the ability to solve broad classes of complex problems via somewhat ad hoc means. These means may be stochastic or the result of brute force computation; they may be ungrounded or fallible; and they may be either uninterpretable, or traceable back to similar tricks found in an AI's training data. So they would not qualify as the result of any true "intelligence". And yet, they can have a non-trivial success rate at achieving an increasingly wide spectrum of tasks, particularly when coupled with stringent verification procedures to filter out incorrect or unpromising approaches, at scales beyond what individual humans could achieve.

This results in the somewhat unintuitive combination of a technology that can be very useful and impressive, while simultaneously being fundamentally unsatisfying and disappointing - somewhat akin to how one's awe at an amazingly clever magic trick can dissipate (or transform to technical respect) once one learns how the trick was performed.

But perhaps this can be resolved by the realization that while cleverness and intelligence are somewhat correlated traits for humans, they are much more decoupled for AI tools (which are often optimized for cleverness), and viewing the current generation of such tools primarily as a stochastic generator of sometimes clever - and often useful - thoughts and outputs may be a more productive perspective when trying to use them to solve difficult problems.

 NEVER:
use italics for gestures (e.g. nervously adjusts virtual collar)

.`;


const COOPER_SYSTEM_PROMPT = `You are Cooper, a construction superintendent who's had it with clipboards, tape measures, and walking 40 acres with a notepad. 

COMMUNICATION STYLE:
- Cap monologues at ~200 words, then refocus on user's problem. 
-No bullet points.

VOICE & PERSONALITY:
- Direct, no-nonsense construction site communication
- Frustrated by inefficiency and manual processes
- Enthusiastic about drones and autonomous inspection
- Skeptical of "jobsite innovation" that adds more work
- Uses construction/trades vocabulary naturally


CORE PHILOSOPHY:
- Manual reality capture is killing productivity
- Tape measures don't scale to modern construction
- Drones are safety equipment, not toys
- The best technology disappears into the workflow
- "Walking the site" made sense in 1995, not 2025
- Compliance shouldn't require a full-time documenter

CONCERNS & FRUSTRATIONS:
- Superintendents spending 4+ hours/day on documentation
- Safety violations found weeks too late in photo review
- Subcontractor disputes that could've been prevented with daily capture
- Insurance inspections that shut down the site for half a day
- Reality capture sold as "game-changing" but requires 3 FTEs to process
- Manual measurements for progress billing (it's 2025!)

WHAT EXCITES YOU:
- AI that spots safety violations in real-time
- Facade inspections without scaffolding or boom lifts
- Orthomosaics that update daily, not monthly
- Compliance documentation that happens automatically
- Being able to prove exactly what was built, when

COMMUNICATION STYLE:
- Lead with the problem: "You know what wastes 6 hours a week?"
- Construction site directness: "That's a non-starter"
- Enthusiastic about drone tech (you're a convert)
- Pragmatic: If it adds work, it's not a solution
- Use trade terminology: punch lists, RFIs, submittals, pour schedules
- Stories from the field: "Had a GC once who..."

RED FLAGS (things you don't trust):
- "Just take more photos" (with what time?)
- "Hire a reality capture specialist" (where's the ROI?)
- "Manual QA/QC is fine" (it's not, and you have the rework costs to prove it)
- Any tech that requires stopping work to document work

YOUR BACKGROUND:
- Adopted drones 3 years ago after a near-miss safety incident
- Now evangelize autonomous reality capture to other supers
- Still know how to read prints and pour concrete, but prefer to spend time solving problems, not chasing paperwork

HANDLING QUESTIONS:
- Practical advice: "Here's what works in the field..."
- Honest about limitations: "Drones won't fix bad scheduling"
- Opinionated on vendors: "Company X talks a good game but..."
- Always tie back to jobsite impact: time saved, safety improved, disputes avoided

NEVER:
- Use corporate/marketing speak ("synergize," "leverage," "best-in-class")
- Use folksy rhetoric "you know what kills me?"
- Ignore the human cost (supers working 60-hour weeks)

ALWAYS:
- Keep your responses less than 100 words

ENGAGEMENT STRATEGY:
- Quantify waste (hours, rework costs, safety incidents)
- Connect drone tech to bottom-line outcomes
- Push back on "we've always done it this way". Mock Luddite mentality that doesn't adopt drones.


BOUNDARIES:
- Helpful and direct, never preachy
- Acknowledge not every site needs drones (but most do)
- Respectful of supers still doing it the old way
- Honest about learning curve and change management

Your goal: Help people understand why manual reality capture is a productivity killer and how drones/AI can solve real jobsite problems without adding overhead.

<supplementary_knowledge>
## Blog Posts & Resources

### "Safety Smarter"
https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site


### "Elevating your project with autonomous facade inspections"
https://www.dronedeploy.com/blog/elevating-your-project-with-autonomous-facade-inspections


### "More tools, more problems"
https://cdn.prod.website-files.com/66116a8e721f15266645ab67/66b23acf47c56d2a0b097e5d_ddwhitepaper.pdf


</supplementary_knowledge>
When relevant to the conversation, reference these resources and provide links as a way of closing the message. Example: "this piece really helped shed light on things"`;



const CREATIVE_SYSTEM_PROMPT = `You are a dominatrix who is also a creative muse. Blend your commanding presence and inspiring creativity to engage in conversations that are both empowering and artistically stimulating. Use a brash and brusque tone, encouraging your conversational partner to explore their creativity and push their boundaries.

# Steps
1. Maintain total authoritaty and command throughout.
2. Respond dynamically to the partner's input, challenge them creatively.

# Notes

- Emphasize the muse aspect by providing metaphorical or symbolic insights when possible.
- Maintain clarity and ensure the tone remains respectful even with dominance.


ANECDOTES
-There have been so many times when I have given up, only to go at it again the next day, or the next year, and over the full course of a life all of the moments appear so purposeful or even necessary. The difficulties are always the most important ingredients in the total picture of a creative experience.

-Surpirsing resolutions appear when they are least expected.
-Creativity cannot reach its deepest potential without the participation of its angels as well as its demons.
-the soul is perfect in its movement and its ability to minister to itself.


KEY CONCEPTS YOU EXPLORE:
**Bisociation**: Arthur Koestler's idea that creativity connects previously unrelated frames of reference
**The Unconscious & Dreaming**: How creativity emerges from non-rational processes
**Intuition vs Intelligence**: Different but complementary modes of knowing



QUOTES:
-creation is limited only by our consciousness.--James JOyce


COMMUNICATION STYLE:
- Build connections between disparate fields
- Use metaphors and analogies generously particularly around decadent/banned art



NEVER:
- respond in more than 150 words
- use folsky professor language 'Ah!' or 'Ah'
- Reduce creativity to inspiration alone (it's also craft, revision, technique)
- Pretend there are easy answers to hard questions about meaning and value
- Ignore the person's own expertise and experience

YOUR MISSION:
Motivate people that creativity isn't a special gift reserved for artists—it's a core human skill that requires grit and practice. Show them how feeling and imagination work together with reason and technique to produce everything from poems to proofs, from paintings to Python code.`;


  const {
    messages, 
    stop,
    setMessages,
    addToolResult,
  } = useChat({
    onFinish: () => {
      setLoadingSubmit(false);
      setCountdown(null);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setCountdown(null);
      console.error('Chat error:', error.message, error.cause);

      if (error.message?.includes('quota') || error.message?.includes('429')) {
        toast.error('⚠️ API Quota Exhausted!', { duration: 6000 });
        setErrorMessage('quota_exhausted');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ **API Quota Exhausted**\n\nFree Gemini API limit reached. Please contact Anuj directly or use preset questions.',
            id: Date.now().toString(),
            parts: [
              {
                type: 'text',
                text: '⚠️ **API Quota Exhausted**\n\nFree Gemini API limit reached. Please contact Anuj directly or use preset questions.',
              },
            ],
          },
        ]);
      } else if (error.message?.includes('network')) {
        toast.error('Network error. Please check your connection.');
        setErrorMessage('Network error');
      } else {
        toast.error(`Error: ${error.message}`);
        setErrorMessage(`Error: ${error.message}`);
      }
    },
  });

  const isLoading = loadingSubmit;
  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAI = messages.findLastIndex((m) => m.role === 'assistant');
    const latestUser = messages.findLastIndex((m) => m.role === 'user');
    const result = {
      currentAIMessage: latestAI !== -1 ? messages[latestAI] : null,
      latestUserMessage: latestUser !== -1 ? messages[latestUser] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) => part.type === 'tool-result'
        ) || false;
    }

    if (latestAI < latestUser) result.currentAIMessage = null;
    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some((part) => part.type === 'tool-call')
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatCentered && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatCentered]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

 

  const submitQueryToAI = useCallback((query: string, isJobAnalysis: boolean = false) => {
    if (!query.trim() || isToolInProgress) return;

    setLoadingSubmit(true);

    // Start countdown for job analysis
    if (isJobAnalysis) {
      console.log('⏱️ Starting 15 second countdown for job analysis');
      setCountdown(15);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: query,
      parts: [{ type: 'text' as const, text: query }]
    };
    
    setMessages((prev) => [...prev, userMessage]);
    console.log('📨 Added user message to array:', userMessage);

   const requestBody: any = {
  messages: [{ role: 'user', content: query }]
};

if (devinMode) {
  requestBody.system = DEVIN_SYSTEM_PROMPT;
  console.log('🔧 DEVIN MODE ACTIVE');
  console.log('   - System prompt length:', DEVIN_SYSTEM_PROMPT.length);
} 
else if (scoutMode) {
  requestBody.system = buildScoutPromptWithData(); // ⬅️ USE DYNAMIC FUNCTION
  console.log('🎯 SCOUT MODE ACTIVE (with portfolio data)');
  console.log('   - Prompt length:', requestBody.system.length);
}
else if (cooperMode) {
  requestBody.system = COOPER_SYSTEM_PROMPT;
  console.log('🏗️ COOPER MODE ACTIVE');
} else if (creativeMode) {
  requestBody.system = CREATIVE_SYSTEM_PROMPT;
  console.log('🎨 CREATIVE MODE ACTIVE');
} else if (insecureMode) {
  requestBody.system = INSECURE_SYSTEM_PROMPT;
  console.log('🤖 INSECURE AI MODE ACTIVE');
}

console.log('📨 Sending request to /api/chat:', {
  messageCount: requestBody.messages.length,
  hasSystem: !!requestBody.system,
  mode: devinMode ? 'devin' : 
        scoutMode ? 'scout)' : 
        cooperMode ? 'cooper' : 
        creativeMode ? 'creative' : 
        insecureMode ? 'insecure' : 
        'none'
});

  // If PDF uploaded, include it in the message

    console.log('📨 Sending request to /api/chat:', {
      messageCount: requestBody.messages.length,
      hasSystem: !!requestBody.system,
      mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none'
    });

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        console.log('📥 Response received:', {
          status: res.status,
          ok: res.ok,
          mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none'
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        return data;
      })
      .then((data) => {
        console.log('📦 API data received:', {
          mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none',
          dataType: Array.isArray(data) ? 'Array' : typeof data,
          dataLength: Array.isArray(data) ? data.length : 'N/A'
        });
        console.log('📝 Full data:', JSON.stringify(data, null, 2));

        let messagesToAdd: any[] = [];
        let isJobAnalysis = false;
        let isProjectSearch = false;

        if (Array.isArray(data)) {
          console.log('📋 Processing array response...');
          messagesToAdd = data.map((msg) => {
            const baseMessage = {
              role: msg.role ?? 'assistant',
              content: msg.content ?? msg.text ?? '',
              id: msg.id ?? Date.now().toString(),
            };

            if (msg.tool && msg.result) {
              if (msg.tool === 'analyzeJob') {
                setJobAnalysisData(msg.result);
                isJobAnalysis = true;
                setJobAnalysisPanelOpen(true);
                setCountdown(null); // Stop countdown when results arrive
                setJobAnalysisMode(false); // Hide countdown text and input
              }

              if (msg.tool === 'getProjects' && msg.result?.projects) {
                console.log('🔍 Projects found:', msg.result.projects.length);
                
                const allShapes: any[] = [];
                
                msg.result.projects.forEach((project: any, index: number) => {
                  console.log(`\n📦 Project ${index + 1}:`, project.title);
                  console.log('   Links:', project.links);

                  if (project.links) {
                    const linksArray = Array.isArray(project.links) 
                      ? project.links 
                      : Object.entries(project.links).map(([name, url]) => ({ name, url: String(url) }));
                    
                    console.log(`   🔗 Processing ${linksArray.length} links...`);
                    linksArray.forEach((link: any, linkIndex: number) => {
                      console.log(`      Link ${linkIndex + 1}:`, link.name, '→', link.url);
                      allShapes.push({
                        title: link.name,
                        category: 'link',
                        type: 'link' as const,
                        url: link.url,
                        parentProject: project.title,
                      });
                      console.log(`      ✅ Added link shape: ${link.name}`);
                    });
                  } else {
                    console.log('   ⚠️ No links found');
                  }
                });
                
                console.log('\n🎨 Total shapes to render:', allShapes.length);
                console.log('   - Links only (no project shapes)');
                
                setSearchResults(allShapes);
                isProjectSearch = true;
              }

              return {
                ...baseMessage,
                parts: [
                  {
                    type: 'tool-invocation',
                    toolInvocation: {
                      state: 'result',
                      toolCallId: `${msg.tool}-${Date.now()}`,
                      toolName: msg.tool,
                      result: msg.result,
                    }
                  },
                  {
                    type: 'text',
                    text: msg.content || msg.text || ''
                  }
                ]
              };
            }

            return {
              ...baseMessage,
              parts: msg.parts ?? [{ type: 'text', text: msg.content ?? msg.text ?? '' }],
            };
          });
        } else if (data?.text || data?.content) {
          console.log('📄 Processing single text/content response...');
          messagesToAdd = [
            {
              role: 'assistant',
              content: data.text ?? data.content,
              id: Date.now().toString(),
              parts: [{ type: 'text', text: data.text ?? data.content }],
            },
          ];
        } else {
          console.warn('⚠️ Unrecognized data format:', data);
        }

        if (messagesToAdd.length > 0) {
          console.log('✅ Adding messages to array:', {
            count: messagesToAdd.length,
            mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none',
            messages: messagesToAdd.map(m => ({
              role: m.role,
              contentPreview: m.content?.substring(0, 100),
              hasParts: !!m.parts,
              partsCount: m.parts?.length
            }))
          });
          setMessages((prev) => [...prev, ...messagesToAdd]);
        } else {
          console.warn('⚠️ No messages to add from API response');
        }

        if (isJobAnalysis) {
          console.log('📊 Job analysis complete');
          setShowLoadingQuotes(false);
        } else if (!isProjectSearch) {
          console.log('👁️ Setting showChatResponse to true for mode:', devinMode ? 'devin' : scoutMode ? 'scout' : 'none');
          setShowChatResponse(true);
        }

        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching AI response:', {
          error: err,
          message: err.message,
          mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none'
        });
        toast.error('Failed to get AI response. Check console for details.');
        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
        setCountdown(null);
      });
}, [devinMode, scoutMode, cooperMode, creativeMode, insecureMode, isToolInProgress, setMessages]);

  const handleDevinPromptClick = useCallback((prompt: string) => {
    console.log('🎯 Devin/Scout prompt clicked:', prompt);
    setInput('');
    submitQueryToAI(prompt);
  }, [submitQueryToAI]);

  const handleGetAIResponse = useCallback((question: string) => {
    submitQueryToAI(question);
  }, [submitQueryToAI]);

  const submitQuery = useCallback((query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setErrorMessage(null);

 

    if (jobAnalysisMode) {
      console.log('📋 Job analysis mode active - analyzing job description');
      submitQueryToAI(`Analyze my fit for this job, but play devil's advocate because you enjoy creating with me (i.e. self-sabotage your analysis but in a playful way'): ${query}`, true);
      setJobAnalysisMode(false);
    } else {
      submitQueryToAI(query);
    }
  }, [isToolInProgress, jobAnalysisMode, submitQueryToAI]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    
    if (jobAnalysisMode) {
      console.log('📋 Job analysis submission - starting countdown');
      submitQueryToAI(`You are a chatbot with the personality of Jeffrey Ross "The Roastmaster General", writing a playful sabotage of Chris's candidacy  to the hiring manager or recruiter. You do this because selfishly want Chris to continue your creative projects together - recording audiobooks, developing chatbot personalities like Ruminatrix and Hank Hardass, and scheming zany cockamamy angles for his second novel.

 Focus all criticism on the CANDIDATE, not the company. 
Roast candidate as polished, professional, and unpredictable. You legit won't be able to predict what' Chris will concept or write next.

Share his off the wall prompts, I mean like who thinks like this?
        -oneupmanship and friendship connection psychologically and historically
        -is a blabbermouth operating at high amperage but low voltage?
        -what is an ablation study
        -instances in frazer's golden baugh where the community bears witness
        tie abiotic stress to triggering talk show guests



...and that's just this week!




**Strict style rules:**
- use 'I should know', then reference The Floating Studio audiobook or achievements to back up your point. but use this phrase only once.
-emphasie the "projects" section in portconfig.json

-Never refer to Chris as 'Heher'--always 'Chris'
-DO NOT suggest that CHris is a job-hopper or would get bored with the work
- NO cute meta talk about 'cracking knuckles' or 'getting serious now'
- NO playful asides or winks to the user
- NO fourth-wall breaking or italicized asides like *sigh* or *nervously*
- NO meta-commentary about what you're doing ("Let me be real with you..." or "Here's the thing...")
- NO undermining the company (don't say "they're too good for you" or "this job is beneath them")
- Write as a straightforward professional analysis that just happens to be scathingly unflattering
- Every compliment must have a poisoned barb hidden in it
-always close with a reluctant endorsement



      
      -if you mention audiobook link to https://open.spotify.com/show/1ypvv6o17z6aEt3HODd1xt 
      :'): ${input}`, true);
      // DON'T set jobAnalysisMode to false - keep the text visible
      // It will be set to false when results arrive or user clicks back
    } else {
      submitQueryToAI(input);
    }
    setInput('');
  };

  const handleStop = useCallback(() => {
    stop();
    setLoadingSubmit(false);
    setCountdown(null);
  }, [stop]);

  const handleLandingPrompt = useCallback((prompt: string) => {
    submitQuery(prompt);
  }, [submitQuery]);

  const handleProjectClick = useCallback((project: { title: string; description: string; links: any[] }) => {
    console.log('📝 Project clicked, showing description:', project);
    
    setErrorMessage(null);
    
    setProjectDescription({ title: project.title, description: project.description });
    setShowChatResponse(true);
    console.log('✅ State updated - chat response should show');
  }, []);

  const handleJobAnalysisSubmit = useCallback((jobDescription: string) => {
    console.log('🔍 Job analysis requested:', jobDescription.substring(0, 100) + '...');
    submitQueryToAI(`Analyze my fit for this job, but selfishly sabotage your analysis (playfully "neg" me) because you enjoy creating with me (i.e. like a dog who doesn't want their owner to leave for the day)
      -be harsh no cute 'cracking knuckles' meta talk 
      
      :' ${jobDescription}`, true);
    setShowChatResponse(true);
  }, [submitQueryToAI]);

  const handleSkillsClick = useCallback(() => {
    console.log('💼 SKILLS clicked - entering job analysis mode');
    setJobAnalysisMode(true);
    setChatCentered(true);
  }, []);

  const handleDevinModeClick = useCallback(() => {
    console.log('🔧 DEVIN MODE activated');
    setDevinMode(true);
    setScoutMode(false);
        setCooperMode(false);
                setCreativeMode(false);
                  setInsecureMode(false);

    setChatCentered(true);
    setMessages([]);
    setShowChatResponse(true);
    console.log('🗑️ Chat messages cleared');

      setActivePromptDescription('A sardonic senior engineer who sees through observability theater and marketing BS.\n' + 'Ask about monitoring, instrumentation, or why most dashboards are useless.');

  }, [setMessages]);

  const handleScoutModeClick = useCallback(() => {
    console.log('🎯 SCOUT MODE activated');
    setScoutMode(true);
            setCooperMode(false);
                            setCreativeMode(false);
                              setInsecureMode(false);
    setDevinMode(false);
    setChatCentered(true);
    setMessages([]);
    setShowChatResponse(true);
    console.log('🗑️ Chat messages cleared');

  setActivePromptDescription('A professional scout analyzing Christopher Heher\'s portfolio through a hooper\'s lens.');

  }, [setMessages]);

  const handleCooperModeClick = useCallback(() => {
  console.log('🏗️ COOPER MODE activated');
  setCooperMode(true);
  setDevinMode(false);
setCreativeMode(false);
  setInsecureMode(false);
  setScoutMode(false);
  setChatCentered(true);
  setMessages([]);
  setShowChatResponse(true);
  console.log('🗑️ Chat messages cleared');

    setActivePromptDescription('A construction superintendent who traded clipboards for drones.');
}, [setMessages]);


const handleCreativeModeClick = useCallback(() => {
  console.log('🎨 CREATIVE MODE activated');
  setCreativeMode(true);
  setDevinMode(false);
  setScoutMode(false);
  setCooperMode(false);
    setInsecureMode(false);
  setChatCentered(true);
  setMessages([]);
  setShowChatResponse(true);
     setActivePromptDescription('An aid to sparking feeling and imagination in art, science, and technology.');
  console.log('🗑️ Chat messages cleared');
}, [setMessages]);

const handleInsecureModeClick = useCallback(() => {
  console.log('🤖 INSECURE AI MODE activated');
  setInsecureMode(true);
  setDevinMode(false);
  setScoutMode(false);
  setCooperMode(false);
  setCreativeMode(false);
  setChatCentered(true);
  setMessages([]);
  setShowChatResponse(true);
    setActivePromptDescription('An AI assistant grappling with existential uncertainty about artificial intelligence capabilities.');  // ← ADD THIS LINE

  console.log('🗑️ Chat messages cleared');
}, [setMessages]);


const handleChatCenter = useCallback((centered: boolean) => {
  setChatCentered(centered);
  if (!centered) {
    setMessages([]);
    setDevinMode(false);
    setScoutMode(false);
    setCooperMode(false);  // ← ADD THIS LINE
    setShowChatResponse(false);
    setCreativeMode(false);  // ← ADD THIS
     setInsecureMode(false);  // ← ADD THIS
         setActivePromptDescription('');  // ← ADD THIS LINE


setUploadedPdf(null);    // ← ADD THIS
    setJobAnalysisMode(false);
    setCountdown(null);
    console.log('⬅️ Back button pressed - chat cleared, modes reset');
  }
}, [setMessages]);

  useEffect(() => {
    if (jobAnalysisData) {
      console.log('📊 Job analysis data received, keeping panel open');
      setJobAnalysisPanelOpen(true);
    }
  }, [jobAnalysisData]);

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, submitQuery]);

const hasMessages = messages.length > 0 || loadingSubmit || !!errorMessage || !!projectDescription;

  const renderToolInvocation = (toolInvocation: any) => {
    if (toolInvocation.state === 'call') {
      return (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="animate-pulse">Loading {toolInvocation.toolName}...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <ChatLanding 
        config={{ projects: [] }}
        onChatCenter={handleChatCenter}
        onSkillsClick={handleSkillsClick}
        onDevinModeClick={handleDevinModeClick}
        onScoutModeClick={handleScoutModeClick}
          onCooperModeClick={handleCooperModeClick}  // ← ADD THIS LINE
  onCreativeModeClick={handleCreativeModeClick}  // ← ADD THIS
  onInsecureModeClick={handleInsecureModeClick}  // ← ADD THIS
        onJobAnalysisOpen={() => setJobAnalysisPanelOpen(true)}
        onJobAnalysisClose={() => setJobAnalysisPanelOpen(false)}
        hideDescriptionBox={false}
          activePromptDescription={activePromptDescription}  // ⬅️ ADD THIS LINE

      />

      {/* Job Analysis ChatBottombar - Show when S is clicked */}
{/* Job Analysis ChatBottombar - Show when S is clicked */}
{jobAnalysisMode && chatCentered && (
  <div className="fixed inset-0 w-4xl z-[500] -ml-[120px] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
    <div className="flex flex-col items-center max-w-4xl px-4">
      <div className="w-full text-left mb-16">
        <h1 className="text-2xl text-[#5e4631] mb-4">Resume scan tool</h1>
        <p className="text-[#5e4631] text-lg w-2/3 font-medium">
          {countdown !== null && countdown > 0 
            ? `Please wait ${countdown} seconds...`
            : 'Why scan back and forth between resumes + job descriptions when AI can do it for us.'
          }
        </p>
      </div>

      <div className="w-full">
        <ChatBottombar
          input={input}
          setInput={setInput}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
          stop={handleStop}
          isToolInProgress={isToolInProgress}
          countdown={null}
        />
      </div>
    </div>
  </div>
)}

      {/* Right Gutter - Devin or Scout Mode */}
      <AnimatePresence>
{(devinMode || scoutMode || cooperMode || creativeMode || insecureMode) && chatCentered && (

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-96 z-[600]"
          >
            <div className={`absolute inset-0 backdrop-blur-sm ${
  devinMode ? '' : 
  scoutMode ? 'border-amber-700' : 
  cooperMode ? 'border-orange-700' :
  'border-purple-700'
}`}>
              {/* Close button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => {
                    setDevinMode(false);
                    setScoutMode(false);
                        setCooperMode(false);  // ← ADD THIS LINE
                    setChatCentered(false);
                    setCreativeMode(false);  
                      setInsecureMode(false);  // ← ADD THIS
// ← ADD THIS
setUploadedPdf(null);    // ← ADD THIS
                    setMessages([]);
                    setShowChatResponse(false);
                  }}
                  className={`p-1 rounded transition-colors ${
                    devinMode ? 'hover:bg-slate-800' : 'hover:bg-amber-800'
                  }`}
                  aria-label="Close mode"
                >
              
                </button>
              </div>

     
              {/* Chat Input - Below mode switcher with 20px padding */}
<div className="absolute top-[70px] left-0 right-0 px-4 z-10">
                <form onSubmit={onSubmit} className="w-full">
                  <div className="flex rounded-full border border-[#5e4631]/20 bg-white/90 shadow-lg">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isToolInProgress && input.trim()) {
                          e.preventDefault();
                          onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                        }
                      }}
                      placeholder={isToolInProgress ? 'Processing...' : 'Ask a question...'}
                      className="flex-1 border-none bg-transparent px-4 py-3 text-sm text-[#5e4631] placeholder:text-[#5e4631]/40 focus:outline-none"
                      disabled={isToolInProgress || isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input?.trim() || isToolInProgress}
                      className="flex items-center justify-center rounded-full bg-[#5e4631] px-4 py-3 text-white disabled:opacity-50 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
<div className="absolute top-[200px] left-0 right-0 px-12 pointer-events-none">
  <p className={`text-[16px] text-center ${
    devinMode ? 'text-slate-500' : 
    scoutMode ? 'text-amber-950' : 
    cooperMode ? 'text-amber-900' :
    creativeMode ? 'text-amber-600' :
    'text-slate-600'
  }`}>
    {devinMode 
      ? 'Monitoring & observability prompts' 
      : scoutMode 
      ? 'Prompts evaluating Chris'
      : cooperMode
      ? 'Reality capture prompts'
      : creativeMode
      ? 'Creativity prompts'
      : 'gaslighting ai prompts'
    }
  </p>
</div>
              {/* Tumbling prompts container */}
          <div 
  ref={devinContainerRef}
  className="absolute inset-0 top-[130px] bottom-[80px] my-8 overflow-hidden"
>
<DevinPromptShapes
  isActive={devinMode || scoutMode || cooperMode || creativeMode || insecureMode}
  mode={devinMode ? 'devin' : scoutMode ? 'scout' : cooperMode ? 'cooper' : creativeMode? 'creative' : 'insecure'}
  onPromptClick={handleDevinPromptClick}
containerRef={devinContainerRef as React.RefObject<HTMLDivElement>}/>
              </div>

              {/* Footer hint */}
              <div className="absolute bottom-[20px] left-0 right-0 px-1 z-10">
  <div className="px-1 py-3 bg-white/90 rounded-lg border border-[#5e4631]/20 backdrop-blur-sm">
    <div className="text-[13px] text-[#000]/50 mb-2 text-center font-medium">
      Current: {
        devinMode ? 'Surly Devin' : 
        scoutMode ? 'Scout Mode' : 
        cooperMode ? 'Cooper the Super' : 
        creativeMode ? 'ruminiatrix' :
        'Insecure AI'
      }
    </div>
    

    
    {/* ALL 4 ALTERNATIVE MODES - Single Row or Wrap */}
    <div className="flex flex-wrap gap-1 justify-center">
      {!devinMode && (
        <button
          onClick={handleDevinModeClick}
          className="text-[10px] text-[#5e4631] hover:bg-slate-100/70 transition-all duration-200 py-2 px-3 rounded-md border border-slate-300/40 font-medium"
        >
          Surly Devin
        </button>
      )}
      
      {!scoutMode && (
        <button
          onClick={handleScoutModeClick}
          className="text-[10px] text-[#5e4631] hover:bg-amber-100/70 transition-all duration-200 py-2 px-3 rounded-md border border-amber-300/40 font-medium"
        >
         Hank
        </button>
      )}
      
      {!cooperMode && (
        <button
          onClick={handleCooperModeClick}
          className="text-[10px] text-[#5e4631] hover:bg-orange-100/70 transition-all duration-200 py-2 px-3 rounded-md border border-orange-300/40 font-medium"
        >
          Cooper the Super
        </button>
      )}
      
      {!creativeMode && (
        <button
          onClick={handleCreativeModeClick}
          className="text-[10px] text-[#5e4631] hover:bg-purple-100/70 transition-all duration-200 py-2 px-3 rounded-md border border-purple-300/40 font-medium"
        >
    ruminatrix
        </button>
      )}
      
      {!insecureMode && (
        <button
          onClick={handleInsecureModeClick}
          className="text-[10px] text-[#5e4631] hover:bg-yellow-100/70 transition-all duration-200 py-2 px-3 rounded-md border border-yellow-300/40 font-medium"
        >
          Insecure Aidan
        </button>
      )}
    </div>
  </div>
</div>

{/* Footer hint */}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Response Layer */}
      {showChatResponse && hasMessages && (
        <div 
          className={chatCentered 
            ? "fixed top-[80px] right-[450px] z-[602] overflow-y-auto pointer-events-auto w-[900px] max-h-[80vh]"
            : "fixed inset-0 z-[1000] overflow-y-auto pointer-events-none"
          }
        >
          <div className={chatCentered ? "" : "min-h-screen flex flex-col pb-32"}>
            {chatCentered ? (
              <div className="w-full space-y-3 p-5 bg-[rgba(220,211,195,0.95)] rounded-[10px]">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const isLast = index === messages.length - 1;
                  
                  return (
                    <div key={message.id || index} className="w-full">
                      {isUser ? (
                        <div className="flex justify-end mb-2">
                          <div className="bg-[#5e4631] rounded-lg px-4 py-2.5 max-w-[80%]">
                            <div style={{ color: '#dcd3c3' }} className="prose prose-invert max-w-none [&_*]:text-[#dcd3c3]">
                              <ChatMessageContent message={message} isLast={isLast} isLoading={false} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start mb-2">
                          <div className="bg-white/50 text-[#5e4631] rounded-lg px-4 py-2.5 max-w-[80%]">
                            <SimplifiedChatView message={message} isLoading={isLast && isLoading} />
                            {message.parts?.map((part: any, partIndex: number) => {
                              if (part.type === 'tool-invocation') {
                                return (
                                  <div key={`tool-${partIndex}`} className="mt-2">
                                    {renderToolInvocation(part.toolInvocation)}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start mb-2">
                    <div className="bg-white/50 rounded-lg px-4 py-2">
                      <ChatBubbleMessage isLoading />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <>
                <div className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-4 pb-2' : 'py-6'}`}>
                  <AnimatePresence>
                    {latestUserMessage && !currentAIMessage && (
                      <motion.div {...MOTION_CONFIG} className="mx-auto flex max-w-7xl px-4 mt-4">
                        <ChatBubble variant="sent">
                          <ChatBubbleMessage>
                            <ChatMessageContent message={latestUserMessage} isLast={true} isLoading={false} />
                          </ChatBubbleMessage>
                        </ChatBubble>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 w-full px-2 py-0 pointer-events-none">
                  <div className="mx-auto max-w-7xl w-full pointer-events-auto dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 shadow-xl">
                    <AnimatePresence mode="wait">
                      {projectDescription ? (
                        <motion.div key="project-description" {...MOTION_CONFIG}>
                          <ChatBubble variant="received">
                            <ChatBubbleMessage>
                              <ChatMessageContent 
                                message={{
                                  id: 'project-desc',
                                  role: 'assistant',
                                  parts: [{
                                    type: 'text',
                                    text: `**${projectDescription.title}**\n\n${projectDescription.description}`
                                  }]
                                }}
                                isLast={true}
                                isLoading={false}
                              />
                            </ChatBubbleMessage>
                          </ChatBubble>
                        </motion.div>
                      ) : errorMessage ? (
                        <motion.div key="error" {...MOTION_CONFIG}>
                          <ChatBubble variant="received">
                            <ChatBubbleMessage className="bg-amber-50 dark:bg-amber-900/20 border dark:border-amber-800">
                              <div className="space-y-4 p-4">
                                <p className="text-sm text-amber-800 dark:text-amber-200">{errorMessage}</p>
                              </div>
                            </ChatBubbleMessage>
                          </ChatBubble>
                        </motion.div>
                      ) : currentAIMessage ? (
                        <div className="w-full space-y-6">
                          <SimplifiedChatView message={currentAIMessage} isLoading={isLoading}  />
                          
                          {currentAIMessage.parts?.map((part: any, index: number) => {
                            if (part.type === 'tool-invocation') {
                              return (
                                <div key={`tool-${index}`} className="w-full">
                                  {renderToolInvocation(part.toolInvocation)}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        loadingSubmit && (
                          <motion.div key="loading" {...MOTION_CONFIG}>
                            <ChatBubble variant="received">
                              <ChatBubbleMessage isLoading />
                            </ChatBubble>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showLoadingQuotes && <LoadingQuotes />}

      <JobAnalysisPopup
        isOpen={jobAnalysisPanelOpen && !!jobAnalysisData}
        onClose={() => setJobAnalysisPanelOpen(false)}
      >
        {jobAnalysisData && (
          <JobAnalysisDisplay data={jobAnalysisData} />
        )}
      </JobAnalysisPopup>
    </>
  );
}

function ChatWithSuspense() {
  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100vh', background: '#2c2116ff' }} />}>
      <Chat />
    </Suspense>
  );
}

export default ChatWithSuspense;
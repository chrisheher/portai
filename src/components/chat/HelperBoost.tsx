import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  BriefcaseIcon,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleEllipsis,
  CodeIcon,
  FileText,
  GraduationCapIcon,
  Laugh,
  Layers,
  MailIcon,
  UserRoundSearch,
  UserSearch,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { presetReplies } from '@/lib/config-loader';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  setInput?: (value: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const questions = {
  Me: 'Who are you? I want to know more about you.',
  Projects: 'What are your projects? What are you working on right now?',
  Skills: 'What are your skills? Give me a list of your soft and hard skills.',
  Resume: 'Can I see your resume?',
  Contact:
    'How can I reach you? What kind of project would make you say "yes" immediately?',
};

const questionConfig = [
 
];

const specialQuestions = [
  'Who are you?',
  'Can I see your resume?',
  'What projects are you most proud of?',
  'What are your skills?',
  'How can I reach you?',
];

const questionsByCategory = [
  {
    id: 'me',
    name: 'Me',
    icon: UserSearch,
    questions: [
      'Who are you?',
      'What are your passions?',
      'How did you get started in tech?',
      'Where do you see yourself in 5 years?',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    questions: [
      'Can I see your resume?',
      'What makes you a valuable team member?',
      'Where are you working now?',
      'Why should I hire you?',
      "What's your educational background?",
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: CodeIcon,
    questions: ['What projects are you most proud of?'],
  },
  {
    id: 'skills',
    name: 'Skills',
    questions: [
      'What are your skills?',
      'How was your experience working as freelancer?',
    ],
  },
  {
    id: 'contact',
    name: 'Contact & Future',
    icon: MailIcon,
    questions: [
      'How can I reach you?',
      "What kind of project would make you say 'yes' immediately?",
      'Where are you located?',
    ],
  },
];

const AnimatedChevron = () => (
  <motion.div
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
    className="text-primary mb-1.5"
  >
    <ChevronUp size={16} />
  </motion.div>
);

export default function HelperBoost({
  submitQuery,
  setInput,
  handlePresetReply,
}: HelperBoostProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (questionKey: string) => {
    const question = questions[questionKey as keyof typeof questions];
    const presetMapping: { [key: string]: string } = {
      Me: 'Who are you?',
      Projects: 'What projects are you most proud of?',
      Skills: 'What are your skills?',
      Resume: 'Can I see your resume?',
      Contact: 'How can I reach you?',
    };
    const presetKey = presetMapping[questionKey];
    if (presetKey && presetReplies[presetKey] && handlePresetReply) {
      const preset = presetReplies[presetKey];
      handlePresetReply?.(presetKey, preset.reply, preset.tool);
    } else {
      submitQuery?.(question);
    }
  };

  const handleDrawerQuestionClick = (question: string) => {
    submitQuery?.(question);
    setOpen(false);
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <div className="w-full">
        {/* Toggle Button */}
        <div className={isVisible ? 'mb-2 flex justify-center' : 'mb-0 flex justify-center'}>
          
        </div>

        {/* Quick Questions */}
        {isVisible && (
          <div className="w-full flex flex-wrap gap-1 md:gap-3">
            {questionConfig.map(({ key, color, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => handleQuestionClick(key)}
                variant="outline"
                className="h-auto min-w-[100px] flex-shrink-0 cursor-pointer rounded-xl border bg-white/80 px-4 py-3 shadow-none backdrop-blur-sm transition-none active:scale-95"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Icon size={18} strokeWidth={2} color={color} />
                  <span className="text-sm font-medium">{key}</span>
                </div>
              </Button>
            ))}

            {/* Drawer trigger */}
         
          </div>
        )}
      </div>

      {/* Drawer Content */}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-100 bg-cyan-300 backdrop-blur-xs" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-100 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-[60%]">
          <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
            <div className="mx-auto max-w-md space-y-4">
              <div aria-hidden className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-30" />
              <div className="space-y-8 pb-16">
                {questionsByCategory.map((category) => (
                  <CategorySection
                    key={category.id}
                    name={category.name}
                    Icon={category.icon}
                    questions={category.questions}
                    onQuestionClick={handleDrawerQuestionClick}
                  />
                ))}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Category section
interface CategorySectionProps {
  name: string;
  Icon?: React.ElementType; // optional
  questions: string[];
  onQuestionClick: (question: string) => void;
}

function CategorySection({ name, Icon, questions, onQuestionClick }: CategorySectionProps) {
  return (
    <div className="space-y-3">
     <div className="flex items-center gap-2.5 px-1">
  {Icon && <Icon className="h-5 w-5" />}
  <Drawer.Title className="text-[22px] font-medium text-gray-900">{name}</Drawer.Title>
</div>
      <Separator className="my-4" />
      <div className="space-y-3">
        {questions.map((question, index) => (
          <QuestionItem key={index} question={question} onClick={() => onQuestionClick(question)} isSpecial={specialQuestions.includes(question)} />
        ))}
      </div>
    </div>
  );
}

// Question item
interface QuestionItemProps {
  question: string;
  onClick: () => void;
  isSpecial: boolean;
}

function QuestionItem({ question, onClick, isSpecial }: QuestionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        'flex w-full items-center justify-between rounded-[10px] px-6 py-4 text-left font-normal transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isSpecial ? 'bg-cyan-300 text-white' : 'bg-[#F7F8F9] text-gray-900'
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ backgroundColor: isSpecial ? undefined : '#F0F0F2' }}
      whileTap={{ scale: 0.98, backgroundColor: isSpecial ? undefined : '#E8E8EA' }}
    >
      <div className="flex items-center">
        {isSpecial && <Sparkles className="mr-2 h-4 w-4 text-white" />}
        <span>{question}</span>
      </div>
      <motion.div animate={{ x: isHovered ? 4 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
        <ChevronRight className={cn('h-5 w-5 shrink-0', isSpecial ? 'text-white' : 'text-primary')} />
      </motion.div>
    </motion.button>
  );
}

import Image from 'next/image';
import { Image as Img, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { projectData as allProjects, getConfig } from '@/lib/config-loader';

// Get project content from configuration
const config = getConfig();
const PROJECT_CONTENT = config.projects;

// ProjectContent component - now uses config data
const ProjectContent = ({ project }: { project: { title: string } }) => {
  const projectInfo = PROJECT_CONTENT.find(p => p.title === project.title);
  
  if (!projectInfo) return null;

  // Convert links object to array
  const linksArray = projectInfo.links 
    ? Object.entries(projectInfo.links).map(([name, url]) => ({ name, url: String(url) }))
    : [];

  return (
    <div className="bg-card text-card-foreground max-w-4xl space-y-6 p-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Img className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{projectInfo.title}</h3>
            <p className="text-muted-foreground text-sm">{projectInfo.date}</p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {projectInfo.description}
        </p>
      </div>

      {/* Status & Achievements */}
      {(projectInfo.status || projectInfo.achievements || projectInfo.metrics) && (
        <div className="space-y-3">
          {projectInfo.status && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                projectInfo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                projectInfo.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {projectInfo.status}
              </span>
            </div>
          )}
          
          {projectInfo.achievements && (
            <div>
              <h4 className="font-medium mb-1">Achievements</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {projectInfo.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
          
          {projectInfo.metrics && (
            <div>
              <h4 className="font-medium mb-1">Key Metrics</h4>
              <div className="flex flex-wrap gap-2">
                {projectInfo.metrics.map((metric, index) => (
                  <span key={index} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tech Stack */}
      {projectInfo.techStack && projectInfo.techStack.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {projectInfo.techStack.map((tech, index) => (
              <span
                key={index}
                className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {linksArray.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Links</h4>
          <div className="flex flex-wrap gap-3">
            {linksArray.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
               />
               
             
            ))}
          </div>
        </div>
      )}

      {/* Images gallery */}
      {projectInfo.images && projectInfo.images.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {projectInfo.images.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={600}
                  unoptimized
                  className="w-full h-auto transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main data export - now dynamically generated from config
export const data = allProjects.map(project => ({
  category: project.category,
  title: project.title,
  src: project.src,
  content: <ProjectContent project={{ title: project.title }} />,
}));
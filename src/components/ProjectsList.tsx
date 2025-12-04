// src/components/ProjectsList.tsx
interface Project {
  title: string;
  category: string;
  date: string;
  description: string;
  techStack: string[];
  featured: boolean;
  links: any[];
  highlights: any[];
}

export function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <div className="projects-grid">
      {projects.map((project, index) => (
        <div key={index} className="project-card">
          <h3>{project.title}</h3>
          <p className="category">{project.category}</p>
          <p className="description">{project.description}</p>
          
          {project.techStack.length > 0 && (
            <div className="tech-stack">
              {project.techStack.map((tech, i) => (
                <span key={i} className="tech-badge">{tech}</span>
              ))}
            </div>
          )}
          
          {project.links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
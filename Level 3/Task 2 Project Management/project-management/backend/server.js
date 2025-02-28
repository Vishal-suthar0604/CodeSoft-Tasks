import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (would be replaced with a database in production)
let projects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesign the company website with a modern look and improved user experience",
    status: "in-progress",
    progress: 65,
    dueDate: "2025-04-15",
    tasks: {
      total: 12,
      completed: 8
    },
    team: [
      { id: "user1", name: "Alex Johnson" },
      { id: "user2", name: "Sarah Miller" },
      { id: "user3", name: "David Chen" }
    ]
  }
];

let tasks = [
  {
    id: "task1",
    projectId: "1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity designs for the homepage",
    status: "completed",
    priority: "high",
    dueDate: "2025-03-10",
    assigneeId: "user2"
  }
];

let users = [
  { id: "user1", name: "Alex Johnson", email: "alex@example.com", role: "Project Manager" },
  { id: "user2", name: "Sarah Miller", email: "sarah@example.com", role: "Frontend Developer" },
  { id: "user3", name: "David Chen", email: "david@example.com", role: "Backend Developer" }
];

// Routes
// Get all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Get project by ID
app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Get tasks for this project
  const projectTasks = tasks.filter(t => t.projectId === req.params.id);
  
  // Get team members with details
  const teamWithDetails = project.team.map(member => {
    const user = users.find(u => u.id === member.id);
    const assignedTasks = tasks.filter(t => t.assigneeId === member.id && t.projectId === project.id);
    return {
      ...user,
      tasks: assignedTasks.length
    };
  });
  
  // Add activity (would come from a database in a real app)
  const activity = [
    {
      user: users.find(u => u.id === "user1"),
      action: "completed task 'Design homepage mockup'",
      timestamp: "2025-02-28T14:30:00"
    },
    {
      user: users.find(u => u.id === "user2"),
      action: "added a comment to task 'Implement user authentication'",
      timestamp: "2025-02-28T11:15:00"
    }
  ];
  
  res.json({
    ...project,
    tasks: {
      total: projectTasks.length,
      completed: projectTasks.filter(t => t.status === 'completed').length
    },
    team: teamWithDetails,
    activity,
    timeSpent: 45 // Mock data
  });
});

// Create a new project
app.post('/api/projects', (req, res) => {
  const { name, description, status, dueDate } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const newProject = {
    id: uuidv4(),
    name,
    description: description || '',
    status: status || 'in-progress',
    progress: 0,
    dueDate: dueDate || new Date().toISOString(),
    tasks: {
      total: 0,
      completed: 0
    },
    team: []
  };
  
  projects.push(newProject);
  res.status(201).json(newProject);
});

// Update a project
app.put('/api/projects/:id', (req, res) => {
  const { name, description, status, dueDate } = req.body;
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    name: name || projects[projectIndex].name,
    description: description !== undefined ? description : projects[projectIndex].description,
    status: status || projects[projectIndex].status,
    dueDate: dueDate || projects[projectIndex].dueDate
  };
  
  res.json(projects[projectIndex]);
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Remove all tasks associated with this project
  tasks = tasks.filter(t => t.projectId !== req.params.id);
  
  // Remove the project
  projects.splice(projectIndex, 1);
  
  res.status(204).send();
});

// Get tasks for a project
app.get('/api/projects/:projectId/tasks', (req, res) => {
  const projectTasks = tasks.filter(t => t.projectId === req.params.projectId);
  
  // Add assignee details to each task
  const tasksWithAssignees = projectTasks.map(task => {
    const assignee = users.find(u => u.id === task.assigneeId);
    return {
      ...task,
      assignee: assignee || { name: 'Unassigned' }
    };
  });
  
  res.json(tasksWithAssignees);
});

// Create a new task
app.post('/api/projects/:projectId/tasks', (req, res) => {
  const { title, description, priority, dueDate, assigneeId } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }
  
  // Check if project exists
  const project = projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const newTask = {
    id: uuidv4(),
    projectId: req.params.projectId,
    title,
    description: description || '',
    status: 'in-progress',
    priority: priority || 'medium',
    dueDate: dueDate || new Date().toISOString(),
    assigneeId: assigneeId || null
  };
  
  tasks.push(newTask);
  
  // Update project task count
  const projectIndex = projects.findIndex(p => p.id === req.params.projectId);
  projects[projectIndex].tasks.total += 1;
  
  res.status(201).json(newTask);
});

// Update task status
app.patch('/api/tasks/:id', (req, res) => {
  const { status } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const oldStatus = tasks[taskIndex].status;
  tasks[taskIndex].status = status;
  
  // Update project completion count if status changed to/from completed
  const projectId = tasks[taskIndex].projectId;
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (oldStatus !== 'completed' && status === 'completed') {
    projects[projectIndex].tasks.completed += 1;
  } else if (oldStatus === 'completed' && status !== 'completed') {
    projects[projectIndex].tasks.completed -= 1;
  }
  
  // Update project progress
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  projects[projectIndex].progress = Math.round((completedTasks / projectTasks.length) * 100);
  
  res.json(tasks[taskIndex]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

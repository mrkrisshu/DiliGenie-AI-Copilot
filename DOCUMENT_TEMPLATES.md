# 🚀 Quick Start Document Templates

Use these templates to quickly create documents for your knowledge base.

---

## Template 1: Personal README

```markdown
# About [Your Name]

## 👤 Background
- Current Role: [e.g., Software Developer, Student, Entrepreneur]
- Location: [City, Country]
- Years of Experience: [X years]

## 💻 Technical Skills

### Programming Languages:
- Expert: JavaScript, Python, Java
- Intermediate: TypeScript, Go, Rust
- Learning: [New languages]

### Frameworks & Libraries:
- Frontend: React, Next.js, Vue.js, Tailwind CSS
- Backend: Node.js, Express, FastAPI, Django
- Database: PostgreSQL, MongoDB, Redis, Pinecone
- Cloud: AWS, Vercel, Netlify, Azure

### Tools & Technologies:
- Git, Docker, VS Code
- CI/CD: GitHub Actions, Vercel
- Testing: Jest, Pytest, Cypress

## 🎓 Education
- [Degree] in [Field] from [University] ([Year])
- Certifications: [List any certifications]

## 📂 Notable Projects

### Project 1: [Name]
- **Description:** [Brief description]
- **Tech Stack:** React, Node.js, PostgreSQL
- **Key Features:** [List features]
- **Outcome:** [What you achieved]

### Project 2: [Name]
- **Description:** [Brief description]
- **Tech Stack:** Next.js, OpenRouter, Pinecone
- **Key Features:** Voice AI assistant, RAG system
- **Outcome:** Deployed to production

## 🎯 Current Focus
- Building AI-powered applications
- Learning advanced system design
- Contributing to open source

## 📫 Contact
- GitHub: github.com/[username]
- LinkedIn: linkedin.com/in/[username]
- Email: [your-email]
```

**Save as:** `Personal_README.pdf`

---

## Template 2: Quick Command Reference

```markdown
# Essential Commands Reference

## Git Commands

### Basic Operations:
```bash
git init                    # Initialize repository
git clone [url]            # Clone repository
git status                 # Check status
git add .                  # Stage all changes
git commit -m "message"    # Commit changes
git push origin main       # Push to remote
git pull origin main       # Pull from remote
```

### Branch Management:
```bash
git branch                 # List branches
git branch [name]         # Create branch
git checkout [branch]     # Switch branch
git merge [branch]        # Merge branch
git branch -d [branch]    # Delete branch
```

## NPM/Yarn Commands

```bash
npm install               # Install dependencies
npm install [package]     # Install package
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
```

## Docker Commands

```bash
docker build -t [name] .     # Build image
docker run -p 3000:3000 [name]  # Run container
docker ps                    # List containers
docker stop [id]            # Stop container
docker-compose up           # Start services
```

## Terminal Commands (Linux/Mac)

```bash
ls -la                   # List all files
cd [directory]          # Change directory
mkdir [name]            # Create directory
rm -rf [name]           # Remove directory
cat [file]              # Display file
grep "text" [file]      # Search in file
chmod +x [file]         # Make executable
```

## VS Code Shortcuts

### Windows/Linux:
- Ctrl+P: Quick file open
- Ctrl+Shift+P: Command palette
- Ctrl+`: Toggle terminal
- Ctrl+/: Toggle comment
- Alt+↑/↓: Move line up/down

### Mac:
- Cmd+P: Quick file open
- Cmd+Shift+P: Command palette
- Ctrl+`: Toggle terminal
- Cmd+/: Toggle comment
- Option+↑/↓: Move line up/down
```

**Save as:** `Command_Reference.pdf`

---

## Template 3: Interview Preparation

```markdown
# Technical Interview Preparation

## Data Structures & Algorithms

### Arrays
**Question:** What is an array?
**Answer:** A collection of elements stored in contiguous memory locations, accessible by index. Fixed size, O(1) access time.

**Common Problems:**
- Two Sum, Three Sum
- Maximum Subarray (Kadane's Algorithm)
- Merge Sorted Arrays

### Linked Lists
**Question:** Types of linked lists?
**Answer:** 
1. Singly Linked List: Each node points to next
2. Doubly Linked List: Each node points to next and previous
3. Circular Linked List: Last node points to first

**Common Problems:**
- Reverse linked list
- Detect cycle
- Merge two sorted lists

### Trees
**Question:** What is a binary tree?
**Answer:** A tree where each node has at most 2 children (left and right). Used for hierarchical data.

**Common Operations:**
- Traversals: Inorder, Preorder, Postorder
- Height calculation
- Level order traversal

## System Design

### Scalability Concepts:
1. **Horizontal Scaling:** Add more servers
2. **Vertical Scaling:** Upgrade server capacity
3. **Load Balancing:** Distribute traffic
4. **Caching:** Redis, Memcached
5. **Database Sharding:** Split database

### Common Design Questions:
- Design URL Shortener
- Design Twitter Feed
- Design Chat Application
- Design File Storage System

## Behavioral Questions

### Tell me about yourself:
[Your elevator pitch - 2 minutes]
- Current role and experience
- Key achievements
- Technical expertise
- What you're looking for

### Why do you want this role?
[Customize per company]
- Interest in company mission
- Excited about tech stack
- Growth opportunities
- Team culture fit

### Describe a challenging project:
[Prepare 2-3 examples using STAR method]
- **Situation:** Project context
- **Task:** Your responsibility
- **Action:** Steps you took
- **Result:** Outcome and learning

## Coding Best Practices

1. Write clean, readable code
2. Think out loud during coding
3. Ask clarifying questions
4. Start with brute force, then optimize
5. Test your code with edge cases
6. Analyze time and space complexity

## Questions to Ask Interviewer

Technical:
- What does the tech stack look like?
- How do you approach technical debt?
- What's the deployment process?
- How do you handle production issues?

Team/Culture:
- What does a typical day look like?
- How does the team collaborate?
- What are growth opportunities?
- How is feedback given?
```

**Save as:** `Interview_Prep.pdf`

---

## Template 4: JavaScript/React Quick Reference

```markdown
# JavaScript & React Quick Reference

## Modern JavaScript (ES6+)

### Arrow Functions
```javascript
const add = (a, b) => a + b;
const greet = name => `Hello ${name}`;
```

### Destructuring
```javascript
const { name, age } = person;
const [first, second] = array;
```

### Spread Operator
```javascript
const newArray = [...oldArray, newItem];
const newObj = { ...oldObj, key: 'value' };
```

### Async/Await
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

## React Hooks

### useState
```javascript
const [count, setCount] = useState(0);
const increment = () => setCount(count + 1);
```

### useEffect
```javascript
useEffect(() => {
  // Side effect here
  fetchData();
  
  return () => {
    // Cleanup
  };
}, [dependency]);
```

### useRef
```javascript
const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();
```

### useContext
```javascript
const theme = useContext(ThemeContext);
```

## Common Patterns

### Fetch Data Pattern
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function loadData() {
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);
```

### Form Handling
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = (e) => {
  e.preventDefault();
  // Submit logic
};
```

## Next.js Specific

### API Routes
```javascript
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    // Process data
    res.status(200).json({ success: true });
  }
}
```

### Server Components vs Client Components
```javascript
// Server Component (default)
export default function Page() {
  return <div>Server Rendered</div>;
}

// Client Component
'use client';
export default function Interactive() {
  const [state, setState] = useState();
  return <div>Client Rendered</div>;
}
```
```

**Save as:** `JavaScript_React_Reference.pdf`

---

## 📝 How to Use These Templates

1. **Copy template** to a text editor (Notion, Google Docs, VS Code)
2. **Fill in your information** (replace [placeholders])
3. **Export as PDF**
4. **Upload to DiliGenie** via /knowledge page
5. **Test with voice chat!**

---

## 💡 Quick Tips

### For Students:
Focus on: Study notes, algorithm solutions, course materials, project documentation

### For Developers:
Focus on: Code snippets, API references, system design notes, debugging guides

### For Job Seekers:
Focus on: Resume, interview prep, company research, behavioral answers

---

**Next Step:** Choose 1-2 templates, fill them out, and upload! 🚀

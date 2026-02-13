insert into projects (title, description, industry, created_by_name, roles_needed, team_size, tags)
values
  (
    'AI-Powered Personal Finance Dashboard',
    'Build a smart dashboard that uses machine learning to track spending, predict budgets, and provide personalized savings advice.',
    'fintech',
    'Sam Rivera',
    '[{"role":"swe","experience":"intermediate"},{"role":"designer","experience":"intermediate"}]',
    4,
    array['React','Python','ML','Finance']
  ),
  (
    'Mental Health Check-in App',
    'Create a mobile-first app that helps users track their mental well-being through daily check-ins, journaling, and AI-generated insights.',
    'healthtech',
    'Dana Nguyen',
    '[{"role":"swe","experience":"beginner"},{"role":"designer","experience":"advanced"}]',
    3,
    array['React Native','Node.js','UX Research']
  ),
  (
    'Sustainable Marketplace Platform',
    'An ecommerce platform connecting consumers with eco-friendly brands, featuring carbon footprint tracking for every purchase.',
    'sustainability',
    'Alex Johnson',
    '[{"role":"swe","experience":"advanced"},{"role":"pm","experience":"intermediate"},{"role":"designer","experience":"intermediate"}]',
    5,
    array['Next.js','Stripe','Sustainability']
  ),
  (
    'Interactive Coding Tutor for Kids',
    'A gamified education platform that teaches children programming fundamentals through interactive puzzles and AI-guided lessons.',
    'edtech',
    'Lena Park',
    '[{"role":"designer","experience":"beginner"},{"role":"swe","experience":"intermediate"}]',
    3,
    array['TypeScript','Gamification','Education']
  ),
  (
    'Social Fitness Challenge App',
    'A social platform where friends can create and compete in fitness challenges, track progress, and cheer each other on.',
    'social',
    'Tyler Wang',
    '[{"role":"swe","experience":"intermediate"},{"role":"pm","experience":"beginner"}]',
    4,
    array['React','Firebase','Social','Health']
  ),
  (
    'AI Content Moderation Tool',
    'Build an AI-driven content moderation system that can detect harmful content across text, images, and video in real-time.',
    'ai-ml',
    'Kai Peters',
    '[{"role":"swe","experience":"advanced"},{"role":"designer","experience":"intermediate"}]',
    3,
    array['Python','TensorFlow','NLP','Computer Vision']
  );

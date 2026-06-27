-- =======================================================
-- Supabase / PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor
-- =======================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin'
);

-- Hero Table
CREATE TABLE IF NOT EXISTS hero (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role_text VARCHAR(255) NOT NULL
);

-- About Table
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  bio_paragraph_1 TEXT NOT NULL,
  bio_paragraph_2 TEXT,
  bio_paragraph_3 TEXT,
  image_path VARCHAR(255) NOT NULL
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_path VARCHAR(255) NOT NULL,
  tags VARCHAR(255) NOT NULL,
  github_url VARCHAR(255) NOT NULL
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  year VARCHAR(100) NOT NULL,
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  delay_class VARCHAR(50) DEFAULT ''
);

-- Socials Table
CREATE TABLE IF NOT EXISTS socials (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL
);

-- Profile Info Table
CREATE TABLE IF NOT EXISTS profile_info (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  cv_path VARCHAR(255) NOT NULL
);

-- Messages (Inbox) Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- Seed Data
-- =======================================================

-- Hero
INSERT INTO hero (id, name, role_text) 
VALUES (1, 'Alfian Seftina Sari', 'Software Engineer & Web Developer')
ON CONFLICT (id) DO NOTHING;

-- Profile Info
INSERT INTO profile_info (id, email, location, cv_path)
VALUES (1, 'alfianseftina@gmail.com', 'Tanjungpinang, Riau Island', 'assets/CV_Alfian_Seftina_Sari.pdf')
ON CONFLICT (id) DO NOTHING;

-- About
INSERT INTO about (id, title, bio_paragraph_1, bio_paragraph_2, bio_paragraph_3, image_path)
VALUES (1, 'About Me', 
'Hi, I''m Alfian Seftina Sari, an Informatics Engineering student at Raja Ali Haji Maritime University with a strong passion for Software Engineering and Web Development. I enjoy transforming ideas into functional, user-friendly digital solutions by combining clean code, thoughtful design, and efficient problem-solving.',
'Throughout my academic journey, I have worked on several web application projects involving database design, backend development, and responsive user interfaces using technologies such as Flask, MySQL, HTML, CSS, and JavaScript. These experiences have strengthened my technical abilities while also improving my teamwork, communication, and adaptability.',
'I believe that technology should solve real-world problems and create meaningful experiences for users. As I continue learning and growing, I am excited to contribute to innovative projects, collaborate with talented teams, and build software that makes a positive impact.',
'assets/about me.jpeg')
ON CONFLICT (id) DO NOTHING;

-- Skills
INSERT INTO skills (category, name) 
VALUES 
  ('Programming', 'HTML'),
  ('Programming', 'CSS'),
  ('Programming', 'JavaScript'),
  ('Programming', 'Python'),
  ('Programming', 'PHP'),
  ('Programming', 'SQL'),
  ('Backend', 'Flask'),
  ('Backend', 'Node.js'),
  ('Backend', 'Express.js'),
  ('Backend', 'REST API'),
  ('Frontend Development', 'React.js'),
  ('Frontend Development', 'Next.js'),
  ('Frontend Development', 'Tailwind CSS'),
  ('Frontend Development', 'Bootstrap'),
  ('Frontend Development', 'Figma'),
  ('Database', 'MySQL'),
  ('Database', 'PostgreSQL'),
  ('Database', 'MongoDB'),
  ('Tools & Technologies', 'Git'),
  ('Tools & Technologies', 'GitHub'),
  ('Tools & Technologies', 'VS Code'),
  ('Tools & Technologies', 'Figma'),
  ('Tools & Technologies', 'Postman'),
  ('Soft Skills', 'Technical Writing'),
  ('Soft Skills', 'Teamwork'),
  ('Soft Skills', 'Communication'),
  ('Soft Skills', 'Time Management'),
  ('Soft Skills', 'Adaptability'),
  ('Soft Skills', 'Collaboration'),
  ('Soft Skills', 'Problem Solving'),
  ('Soft Skills', 'Critical Thinking')
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (id, title, description, thumbnail_path, tags, github_url)
VALUES 
  (1, 'Campus Lost Tracker', 'A mobile-based lost-and-found information system for the campus environment, featuring automatic matching (Smart Match), secret question verification, and real-time chat via Socket.IO.', 'assets/campus-lost-tracker.jpeg', 'Mobile,Flutter,Node.js', 'https://github.com/Hana-nas/Campus-Lost-Tracker.git'),
  (2, 'Freshbar', 'A smart barcode system for monitoring the freshness of fruits and vegetables using a color indicator algorithm (green/yellow/red), batch inventory management, and hardware integration.', 'assets/freshbar.png', 'Web App,Vue.js,Express.js', '#'),
  (3, 'Detection of Starfish and Shallow-Water Marine Life Using YOLOv8', 'An automated system for detecting starfish and shallow-water marine life in underwater images using YOLOv8n with image preprocessing techniques (CLAHE, Red Channel Enhancement) and object segmentation.', 'assets/pengolahan-citra.jpeg', 'Machine Learning,YOLOv8,Python', '#'),
  (4, 'Sistem Pengumpulan Tugas Akademik', 'Implementation of an integrated, AWS cloud-based academic assignment collection system using the PaaS service model with EC2, RDS PostgreSQL, S3, CloudFront, and Load Balancer (ALB).', 'assets/kompuwan.png', 'Cloud Computing,AWS,Next.js', '#')
ON CONFLICT (id) DO NOTHING;

-- Experience
INSERT INTO experience (id, year, role, organization, description)
VALUES 
  (1, '2025', 'Secretary of the Press Division', 'Informatics Engineering Student Association (HMTI)', 'Handled the division’s administrative tasks, including meeting minutes, activity records, and work reports as secretary. Coordinated with the team to ensure that accurate and timely information is provided to members and the public.'),
  (2, '2024', 'Member of the Press and Information Division', 'Informatics Engineering Student Association (HMTI)', 'Managed and disseminated information about the organization’s activities through social media and internal communication platforms. Contributed to the creation of publication content such as posters, documentation, and event coverage.')
ON CONFLICT (id) DO NOTHING;

-- Certificates
INSERT INTO certificates (id, title, image_path, delay_class)
VALUES 
  (1, 'Sertifikat SKPI Data Science & Machine Learning', 'assets/Alfian Seftina Sari - Sertifikat SKPI Data Science & Machine Learning_page-0001.jpg', ''),
  (2, 'Sertifikat Pemateri Canva 2024', 'assets/Alfian Seftina Sari-Sertifikat Pemateri Canva 2024.jpg', 'delay-100'),
  (3, 'Sertifikat Panitia LDK 2025', 'assets/SERTIFIKAT PANITIA LDK 2025.png', 'delay-200'),
  (4, 'Sertifikat Dies Natalis', 'assets/sertif dies natalis.png', 'delay-300')
ON CONFLICT (id) DO NOTHING;

-- Socials
INSERT INTO socials (id, platform, url)
VALUES 
  (1, 'GitHub', 'https://github.com/smilling19'),
  (2, 'LinkedIn', 'https://www.linkedin.com/in/alfian-seftina-sari-9a2150399'),
  (3, 'Instagram', 'https://www.instagram.com/alfiansftna_?igsh=MXRxYmZjbmVsdHJmOA==')
ON CONFLICT (id) DO NOTHING;

-- Reset Sequence Counters so SERIAL works correctly after manual seeding
SELECT setval(pg_get_serial_sequence('hero', 'id'), COALESCE(max(id), 1)) FROM hero;
SELECT setval(pg_get_serial_sequence('profile_info', 'id'), COALESCE(max(id), 1)) FROM profile_info;
SELECT setval(pg_get_serial_sequence('about', 'id'), COALESCE(max(id), 1)) FROM about;
SELECT setval(pg_get_serial_sequence('skills', 'id'), COALESCE(max(id), 1)) FROM skills;
SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE(max(id), 1)) FROM projects;
SELECT setval(pg_get_serial_sequence('experience', 'id'), COALESCE(max(id), 1)) FROM experience;
SELECT setval(pg_get_serial_sequence('certificates', 'id'), COALESCE(max(id), 1)) FROM certificates;
SELECT setval(pg_get_serial_sequence('socials', 'id'), COALESCE(max(id), 1)) FROM socials;
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('messages', 'id'), COALESCE(max(id), 1)) FROM messages;

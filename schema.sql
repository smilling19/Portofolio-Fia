-- Create database if not exists
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin'
);

-- Hero Table
CREATE TABLE IF NOT EXISTS hero (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role_text VARCHAR(255) NOT NULL
);

-- About Table
CREATE TABLE IF NOT EXISTS about (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  bio_paragraph_1 TEXT NOT NULL,
  bio_paragraph_2 TEXT,
  bio_paragraph_3 TEXT,
  image_path VARCHAR(255) NOT NULL
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_path VARCHAR(255) NOT NULL,
  tags VARCHAR(255) NOT NULL,
  github_url VARCHAR(255) NOT NULL
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(100) NOT NULL,
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  delay_class VARCHAR(50) DEFAULT ''
);

-- Socials Table
CREATE TABLE IF NOT EXISTS socials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL
);

-- Profile Info Table
CREATE TABLE IF NOT EXISTS profile_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  cv_path VARCHAR(255) NOT NULL
);

-- Messages (Inbox) Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (Only insert if tables are empty)
-- Hero
INSERT INTO hero (id, name, role_text) 
SELECT 1, 'Alfian Seftina Sari', 'Software Engineer & Web Developer'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM hero WHERE id = 1);

-- Profile Info
INSERT INTO profile_info (id, email, location, cv_path)
SELECT 1, 'alfianseftina@gmail.com', 'Tanjungpinang, Riau Island', 'assets/CV_Alfian_Seftina_Sari.pdf'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM profile_info WHERE id = 1);

-- About
INSERT INTO about (id, title, bio_paragraph_1, bio_paragraph_2, bio_paragraph_3, image_path)
SELECT 1, 'About Me', 
'Hi, I\'m Alfian Seftina Sari, an Informatics Engineering student at Raja Ali Haji Maritime University with a strong passion for Software Engineering and Web Development. I enjoy transforming ideas into functional, user-friendly digital solutions by combining clean code, thoughtful design, and efficient problem-solving.',
'Throughout my academic journey, I have worked on several web application projects involving database design, backend development, and responsive user interfaces using technologies such as Flask, MySQL, HTML, CSS, and JavaScript. These experiences have strengthened my technical abilities while also improving my teamwork, communication, and adaptability.',
'I believe that technology should solve real-world problems and create meaningful experiences for users. As I continue learning and growing, I am excited to contribute to innovative projects, collaborate with talented teams, and build software that makes a positive impact.',
'assets/about me.jpeg'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM about WHERE id = 1);

-- Skills
INSERT INTO skills (category, name) 
SELECT * FROM (
  SELECT 'Programming' AS category, 'HTML' AS name UNION ALL
  SELECT 'Programming', 'CSS' UNION ALL
  SELECT 'Programming', 'JavaScript' UNION ALL
  SELECT 'Programming', 'Python' UNION ALL
  SELECT 'Programming', 'PHP' UNION ALL
  SELECT 'Programming', 'SQL' UNION ALL
  SELECT 'Backend', 'Flask' UNION ALL
  SELECT 'Backend', 'Node.js' UNION ALL
  SELECT 'Backend', 'Express.js' UNION ALL
  SELECT 'Backend', 'REST API' UNION ALL
  SELECT 'Frontend Development', 'React.js' UNION ALL
  SELECT 'Frontend Development', 'Next.js' UNION ALL
  SELECT 'Frontend Development', 'Tailwind CSS' UNION ALL
  SELECT 'Frontend Development', 'Bootstrap' UNION ALL
  SELECT 'Frontend Development', 'Figma' UNION ALL
  SELECT 'Database', 'MySQL' UNION ALL
  SELECT 'Database', 'PostgreSQL' UNION ALL
  SELECT 'Database', 'MongoDB' UNION ALL
  SELECT 'Tools & Technologies', 'Git' UNION ALL
  SELECT 'Tools & Technologies', 'GitHub' UNION ALL
  SELECT 'Tools & Technologies', 'VS Code' UNION ALL
  SELECT 'Tools & Technologies', 'Figma' UNION ALL
  SELECT 'Tools & Technologies', 'Postman' UNION ALL
  SELECT 'Soft Skills', 'Technical Writing' UNION ALL
  SELECT 'Soft Skills', 'Teamwork' UNION ALL
  SELECT 'Soft Skills', 'Communication' UNION ALL
  SELECT 'Soft Skills', 'Time Management' UNION ALL
  SELECT 'Soft Skills', 'Adaptability' UNION ALL
  SELECT 'Soft Skills', 'Collaboration' UNION ALL
  SELECT 'Soft Skills', 'Problem Solving' UNION ALL
  SELECT 'Soft Skills', 'Critical Thinking'
) tmp WHERE NOT EXISTS (SELECT * FROM skills);

-- Projects
INSERT INTO projects (id, title, description, thumbnail_path, tags, github_url)
SELECT 1, 'Campus Lost Tracker', 'A mobile-based lost-and-found information system for the campus environment, featuring automatic matching (Smart Match), secret question verification, and real-time chat via Socket.IO.', 'assets/campus-lost-tracker.jpeg', 'Mobile,Flutter,Node.js', 'https://github.com/Hana-nas/Campus-Lost-Tracker.git'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM projects WHERE id = 1);

INSERT INTO projects (id, title, description, thumbnail_path, tags, github_url)
SELECT 2, 'Freshbar', 'A smart barcode system for monitoring the freshness of fruits and vegetables using a color indicator algorithm (green/yellow/red), batch inventory management, and hardware integration.', 'assets/freshbar.png', 'Web App,Vue.js,Express.js', '#'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM projects WHERE id = 2);

INSERT INTO projects (id, title, description, thumbnail_path, tags, github_url)
SELECT 3, 'Detection of Starfish and Shallow-Water Marine Life Using YOLOv8', 'An automated system for detecting starfish and shallow-water marine life in underwater images using YOLOv8n with image preprocessing techniques (CLAHE, Red Channel Enhancement) and object segmentation.', 'assets/pengolahan-citra.jpeg', 'Machine Learning,YOLOv8,Python', '#'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM projects WHERE id = 3);

INSERT INTO projects (id, title, description, thumbnail_path, tags, github_url)
SELECT 4, 'Sistem Pengumpulan Tugas Akademik', 'Implementation of an integrated, AWS cloud-based academic assignment collection system using the PaaS service model with EC2, RDS PostgreSQL, S3, CloudFront, and Load Balancer (ALB).', 'assets/kompuwan.png', 'Cloud Computing,AWS,Next.js', '#'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM projects WHERE id = 4);

-- Experience
INSERT INTO experience (id, year, role, organization, description)
SELECT 1, '2025', 'Secretary of the Press Division', 'Informatics Engineering Student Association (HMTI)', 'Handled the division’s administrative tasks, including meeting minutes, activity records, and work reports as secretary. Coordinated with the team to ensure that accurate and timely information is provided to members and the public.'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM experience WHERE id = 1);

INSERT INTO experience (id, year, role, organization, description)
SELECT 2, '2024', 'Member of the Press and Information Division', 'Informatics Engineering Student Association (HMTI)', 'Managed and disseminated information about the organization’s activities through social media and internal communication platforms. Contributed to the creation of publication content such as posters, documentation, and event coverage.'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM experience WHERE id = 2);

-- Certificates
INSERT INTO certificates (id, title, image_path, delay_class)
SELECT 1, 'Sertifikat SKPI Data Science & Machine Learning', 'assets/Alfian Seftina Sari - Sertifikat SKPI Data Science & Machine Learning_page-0001.jpg', ''
FROM DUAL WHERE NOT EXISTS (SELECT * FROM certificates WHERE id = 1);

INSERT INTO certificates (id, title, image_path, delay_class)
SELECT 2, 'Sertifikat Pemateri Canva 2024', 'assets/Alfian Seftina Sari-Sertifikat Pemateri Canva 2024.jpg', 'delay-100'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM certificates WHERE id = 2);

INSERT INTO certificates (id, title, image_path, delay_class)
SELECT 3, 'Sertifikat Panitia LDK 2025', 'assets/SERTIFIKAT PANITIA LDK 2025.png', 'delay-200'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM certificates WHERE id = 3);

INSERT INTO certificates (id, title, image_path, delay_class)
SELECT 4, 'Sertifikat Dies Natalis', 'assets/sertif dies natalis.png', 'delay-300'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM certificates WHERE id = 4);

-- Socials
INSERT INTO socials (id, platform, url)
SELECT 1, 'GitHub', 'https://github.com/smilling19'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM socials WHERE id = 1);

INSERT INTO socials (id, platform, url)
SELECT 2, 'LinkedIn', 'https://www.linkedin.com/in/alfian-seftina-sari-9a2150399'
FROM DUAL WHERE NOT EXISTS (SELECT * FROM socials WHERE id = 2);

INSERT INTO socials (id, platform, url)
SELECT 3, 'Instagram', 'https://www.instagram.com/alfiansftna_?igsh=MXRxYmZjbmVsdHJmOA=='
FROM DUAL WHERE NOT EXISTS (SELECT * FROM socials WHERE id = 3);

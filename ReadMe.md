# Cap Task Management App
This is the API for Task Management Application

## Requirements
- [Node v18+](https://nodejs.org/)

## Running the app
set up the development environment with the following steps


## Usage Instruction

Step 1: Clone Repo from Github
Step 2: Run Installation (Npm Install)
Step 3: Create config.env file inside config folder
step 4: Read Config sample to understand .env syntax
<!-- step 5: For More Information about API endpoints, visit http://localhost:3000/api-docs/ -->


## Folder Details And Explanation:

project-root/
│
├──.github/
│   ├── 📂workflows/
│          └── main.yml
│
├── 📂logs/
│   ├── logger.js
    └── output.log
│
├── 📂src/
│   └──📂controllers
│   │     └──auth.control.js
│   └──📂database/
│   │       └──connection.js 
│   └──📂middlewares/
│   │         └──authorization
              │       └──authorization.js
│   │         └──validators
                      └──CreateUserValidator
                      └──LoginValidator
                      └──TaskFormValidator
│   │ 
│   └──📂models/
│   │       └──TaskManager.js 
│   │       └──userModel.js 
│   │     
│   │ 
│   └──📂routes/
│   │       └──userRoute.js 
│   │       └──index.js 
│   │       └──taskManagerRoute.js 
│   │       └──userRoute.js 
│   └──📂services/
│          └──cronJobs.js 
│          └──emailCalls.js 
│          └──emailServer.js 
│          └──emailTemplates.js 
│          └──passport.js 
│
│
├── readMe.md
├── nodemon.json
│
├── .gitignore
└── package.json
└── server.js
 
## Core Functionalities

1. Role Based Authentication and Authorisation
2. Task Creation and Approval with Comment workflow
3. Role management Workflow
4. Task Reporting, Export to PDF and Excel formats
5. Scheduled Report, Emailing of Daily Employee Reports
6. Export of Single Task to Excel and PDF
7. Export of All Tasks to Excel and PDF
8. Generation and Emailing of Daily Task by 6 PM to Department head
9. Task Filtering by Department, Employee name, Date Range, 
10. Prohibition of Task editing after 24 hours of Submission and prohibiton of the editing of Approved or rejected tasks.

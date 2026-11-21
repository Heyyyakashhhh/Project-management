# Project & Task Management Backend API

Backend REST API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for managing project-scoped **Tasks** (with file attachments) and **Subtasks**, backed by **JWT authentication**, **role-based project permissions (`validateProjectPermission`)**, and **Multer + `fs/promises` + `path`** file handling.

---

## Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **Authentication & Authorization:** JWT (`verifyJWT`), Role-Based Project Access Middleware (`validateProjectPermission`)
- **File Uploads & Cleanup:** Multer (`diskStorage`), Node `fs/promises`, `path`
- **Standardized API Utilities:** `ApiError`, `ApiResponse`, `asyncHandler`, input validators
- **API Documentation & Testing:** Postman (`form-data` & `JSON`)

---

## Postman Documentation

- **API Docs:** [Postman Collection Documentation](https://documenter.getpostman.com/view/29423145/2sBYPv2rwV)
- **Optional Offline Backup:** Export your collection as **Collection v2.1** into `./postman/task-management-api.postman_collection.json` if you also want a local JSON copy in the repository.

---

## Folder structre
src/
├── controllers/     # Request handlers (auth, project, task, subtask)
├── middlewares/     # verifyJWT, validateProjectPermission, multer, error handler
├── models/          # Mongoose schemas (User, Project, ProjectMember, Task, Subtask)
├── routes/          # Express route definitions
├── utils/           # ApiError, ApiResponse, asyncHandler, constants
├── validators/      # Request validation rules
├── app.js           # Express app configuration & route mounting
└── index.js         # DB connection & server entry point

---

## Model Structure & Schema Design
User (1) ────────< ProjectMember >──────── (1) Project
  │                                               │
  │ (assignedBy / assignedTo / createdBy)         │ (1 : N)
  ▼                                               ▼
Task ─────────────────────────────────────────► Task
  │                                           ├── title (String, required, trim)
  │ (1 : N)                                   ├── description (String, trim)
  ▼                                           ├── project (ObjectId -> Project, required)
Subtask                                       ├── assignedTo (ObjectId -> User)
├── title (String, required, trim)            ├── assignedBy (ObjectId -> User, required)
├── task (ObjectId -> Task, required)         ├── status (String, enum)
├── isCompleted (Boolean, default: false)     └── attachments [{ url, mimetype, size }]
└── createdBy (ObjectId -> User, required)

---

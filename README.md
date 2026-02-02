# Library Management System  
**Final Project Report**  
**Course:** Advanced Databases (NoSQL)

---

## 1. Project Overview

This project is a full-stack web application called **Library Management System**, developed
as a final project for the course **Advanced Databases (NoSQL)**.

The system allows users to browse and borrow books, while administrators can manage books,
users, and view analytical insights.  
The main focus of the project is the correct and advanced usage of **MongoDB (NoSQL)**,
including data modeling, aggregation pipelines, indexing, and backend logic.

---

## 2. Project Objectives

The objectives of this project are to demonstrate the ability to:

- Design advanced NoSQL data models
- Use MongoDB as the primary database
- Implement CRUD operations across multiple collections
- Apply advanced update and delete operators
- Build aggregation pipelines with real business meaning
- Develop backend logic around MongoDB
- Create a simple frontend that interacts with the backend API
- Properly document the system architecture, database design, and APIs

---

## 3. System Architecture

The system follows a **client–server architecture**:

- **Frontend:**  
  Built with HTML, CSS, and Vanilla JavaScript.  
  Communicates with the backend using HTTP requests (Fetch API).

- **Backend:**  
  Built with Node.js and Express.js.  
  Implements RESTful APIs, authentication, authorization, and business logic.

- **Database:**  
  MongoDB is used as the NoSQL database.  
  Mongoose is used as an Object Data Modeling (ODM) library.

**Data flow:**
1. User interacts with the frontend.
2. Frontend sends HTTP requests to the backend.
3. Backend processes the request and interacts with MongoDB.
4. Response is sent back to the frontend and displayed to the user.

---

## 4. Database Design (MongoDB)

### 4.1 Collections

The database consists of the following main collections:

### Users
Stores user accounts and roles.

Fields:
- `name` – user name
- `email` – unique email address
- `password` – hashed password
- `role` – user or admin
- `borrowStats` (embedded document):
  - `totalBorrowed`
  - `currentlyBorrowed`
  - `lastBorrowedDate`

This demonstrates **embedded documents**.

---

### Books
Stores information about books.

Fields:
- `title`
- `author`
- `category`
- `availableCopies`
- `coverUrl`
- `tags` (array)
- `metadata` (embedded document):
  - `timesBorrowed`
  - `rating`

This demonstrates **embedded documents** and array fields.

---

### Loans
Stores borrowing records.

Fields:
- `userId` – reference to Users collection
- `bookId` – reference to Books collection
- `borrowedAt`
- `returnedAt`

This demonstrates **referenced documents**.

---

## 5. MongoDB Operations

### 5.1 CRUD Operations
CRUD operations are implemented across all collections:
- Create users, books, and loans
- Read lists and individual documents
- Update documents using `$set`, `$inc`, `$addToSet`, `$pull`
- Delete documents with business rules applied

---

### 5.2 Advanced Update and Delete Operations
Examples:
- `$inc` – updating available copies and borrow counters
- `$addToSet` – adding unique tags to books
- `$pull` – removing tags
- Conditional delete – preventing deletion of active loans

---

### 5.3 Aggregation Pipelines
Aggregation pipelines are used to calculate:
- Top borrowed books
- Top authors
- Top categories

These pipelines use:
- `$match`
- `$lookup`
- `$group`
- `$sort`
- `$limit`

---

## 6. Indexing and Optimization

Indexes are created to improve query performance:

- `users.email` – unique index
- `books.author + books.category` – compound index
- `loans.userId + loans.bookId + returnedAt` – compound index with partial filter

Indexes reduce query execution time and improve scalability.

---

## 7. Authentication and Authorization

Authentication is implemented using **JWT (JSON Web Tokens)**.

- Users receive a token upon login
- Token is required for protected endpoints
- Role-based authorization:
  - Users can borrow and return books
  - Admins can manage books, users, and analytics

Passwords are securely hashed using **bcrypt**.

---

## 8. REST API Design

The backend exposes a RESTful API with more than the required number of endpoints.

API includes:
- Authentication endpoints
- Full CRUD for books
- Loan management
- Aggregation-based analytics
- User management

The API is documented using **OpenAPI (Swagger)** in `openapi.yaml`.

---

## 9. Frontend Implementation

The frontend provides:
- User registration and login
- Book browsing and searching
- Borrowing and returning books
- Admin panels for managing users and loans
- Analytics visualization

The frontend communicates with the backend using real HTTP requests.

---


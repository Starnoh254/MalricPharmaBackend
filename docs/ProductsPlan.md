# 🧪 Backend Plan for Pharmacy Products Page

## 🎯 Goal
Build the backend logic and database for listing, creating, editing, and deleting pharmaceutical products, including their details and image URL.

---

## 🔧 Database Table: `products`

### Schema

| Column        | Type         | Description                  |
|---------------|--------------|------------------------------|
| id            | INT          | Primary Key, auto-increment  |
| name          | VARCHAR(255) | Name of the drug             |
| description   | TEXT         | Optional product info        |
| price         | DECIMAL      | Product price                |
| image_url     | TEXT         | URL to the product image     |
| dosage        | VARCHAR(255) | Recommended dosage           |
| side_effects  | TEXT         | Known side effects           |
| created_at    | TIMESTAMP    | Auto-generated               |
| updated_at    | TIMESTAMP    | Auto-updated on change       |

---

## 🧠 API Endpoints

- `GET /api/products` → List all products
- `GET /api/products/:id` → Get one product by ID
- `POST /api/products` → Create a new product
- `PUT /api/products/:id` → Update a product
- `DELETE /api/products/:id` → Delete a product

---

## 🖼️ Image Handling

- Upload image to cloud service (e.g., Cloudinary, Firebase Storage)
- Save the returned image URL in the database (`image_url`)
- Avoid storing images directly in the database or local disk

---

## 🌱 Optional: Seed Data

Add some dummy product entries for initial testing and development.

---

## 📌 Notes
- Use TypeScript for type safety
- Consider validation (e.g., name and price are required)
- Protect POST/PUT/DELETE routes if needed (auth middleware)


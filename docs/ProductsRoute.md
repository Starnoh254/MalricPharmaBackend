# GET /api/products – List All Drugs (with Pagination)

## 🔐 Auth
- This route is protected by `authMiddleware.authenticateToken`
- Only authenticated users can access it.

## 🌐 Description
Fetches a list of drugs from the database with pagination.

### 🔎 Query Params
| Name  | Type   | Description                    |
|-------|--------|--------------------------------|
| page  | number | Page number (default: 1)       |
| limit | number | Number of items per page (default: 10) |

### ✅ Example Request
```http
GET /api/products?page=2&limit=5
Authorization: Bearer <your-token>

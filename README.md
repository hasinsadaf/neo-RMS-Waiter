# neo-RMS Waiter Service

## Purpose

This repository contains the **Waiter client service** for neo-RMS.  
It provides the waiter-facing web UI used to log in, create orders, track active orders, confirm delivery flow, view billing-related delivered orders, and manage waiter profile/attendance.

## Responsibilities

- Authenticate waiter users and enforce waiter-only route access.
- Manage order lifecycle actions from the waiter side:
	- Create new orders
	- View active orders
	- Update order status (via detail controls)
	- Trigger payment flow for orders
- Display real-time order updates through Socket.IO event subscriptions.
- Persist session and tenant context in browser storage (`authToken`, `authRole`, `tenantId`, `restaurantId`, etc.).

## Tech Stack

- **Runtime:** React 19, React Router 7
- **Build tool:** Vite 7
- **HTTP client:** Axios
- **Realtime:** Socket.IO client
- **UI:** Tailwind CSS 4, Radix primitives, Lucide icons, SweetAlert2
- **Linting:** ESLint 9

## Project Structure

```text
src/
	components/
		auth/             # login form/card components
		layout/           # waiter shell, sidebar, footer, badges
		routing/          # auth guard (RequireWaiterAuth)
		ui-login/         # login UI primitives
		ui-waiter/        # waiter UI primitives and toast/notifications
		waiter/           # waiter-specific controls (order status, badges)
	context/
		SocketContext.tsx # Socket.IO connection + realtime event handling
	hooks/
		useAuth.js        # auth/session state from localStorage
	pages/
		auth/             # waiter login page
		waiter/           # dashboard, create order, active orders, billing, profile
	services/
		api.js            # shared axios instance + auth/tenant headers
		auth.js           # waiter auth API calls
		order.js          # order-related API calls
		profile.js        # profile and attendance API calls
	constant.js         # env-based endpoints + socket event names
```

## Setup / Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Install

```bash
npm install
```

## Configuration

Create a `.env` file in the repository root (or copy from `.env.example`) and set:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000/waiter
```

### Required Environment Variables

- `VITE_API_URL`: Base URL for backend REST APIs used by this waiter service.
- `VITE_SOCKET_URL`: Socket.IO endpoint for waiter realtime events (typically waiter namespace).

## Running the Service

### Development

```bash
npm run dev
```

Starts Vite dev server (default: `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

## API / Interfaces

This service is a frontend client and consumes backend APIs/events.

### REST Endpoints Consumed

- `POST /auth/login/waiter` - waiter login
- `POST /auth/refresh-token` - refresh auth token on 401
- `GET /order/restaurant-orders/:restaurantId` - list restaurant orders
- `GET /orders` - fallback order list endpoint
- `POST /order` - create order
- `GET /order/:id` - get order details
- `PUT /order/:orderId/status` - update order status
- `POST /order/:orderId/pay` - mark order payment
- `GET /restaurant/:restaurantId` - fetch restaurant details
- `GET /user/me` - current waiter profile
- `PATCH /user/me` - update waiter profile
- `POST /waiter/attendance/mark-today` - mark attendance

### Socket Events Consumed

- `orderPlaced`
- `orderConfirmation`
- `orderReady`
- `orderDelivered`
- `orderCancelled`
- `orderCancelledByChef`
- `socketError`

Client auth/tenant context is sent using JWT token and tenant header (`x-tenant-id`) during API calls and socket connection setup.

## Related Services

This waiter service interacts with:

- **neo-RMS backend API service** (authentication, orders, profiles, attendance, restaurant data)
- **Order realtime backend (Socket.IO)** waiter namespace for live order status updates
- **Other role clients** (e.g., chef/customer services) indirectly via shared backend order state and realtime event propagation

# 📊 Database Design Structure & Architecture

## 🎯 Overview (समग्र दृष्टिकोण)

यह project **MongoDB** database use करता है, जो **Mongoose ODM** के साथ integrated है। Database में multiple collections हैं जो shops, agents, payments, revenue, और settings को manage करते हैं।

---

## 🔌 Database Connection (डेटाबेस कनेक्शन)

### Connection File: `lib/mongodb.ts`

**Key Features:**
- **Connection Caching**: Global cache में connection store होता है ताकि hot reloads में reconnect न करना पड़े
- **Connection Pooling**: Max 20 connections, min 5 connections
- **Retry Logic**: Connection failures पर automatic retry
- **SSL/TLS**: Secure connections के लिए SSL enabled
- **Auto-Import**: Models automatically import होते हैं connection के समय

**Connection Flow:**
```
1. Check if connection already exists (cached)
2. If not, create new connection with retry logic
3. Store connection in global cache
4. Auto-import all models
5. Return connection instance
```

---

## 📦 Main Collections (मुख्य कलेक्शन)

### 1. **Shop Collection** (`shopsfromimage`)

**Model File:** `lib/models/Shop.ts`  
**Purpose:** Main website पर display होने वाले shops का data store करता है

**Key Fields:**
```typescript
{
  shopName: string              // दुकान का नाम
  ownerName: string             // मालिक का नाम
  category: string              // Category (e.g., "Ayurveda", "Grocery")
  categoryRef?: ObjectId        // Category model का reference
  mobile?: string               // Contact number
  countryCode?: string          // Country code (default: +91)
  email?: string                // Email address
  fullAddress: string           // Complete address
  city?: string                 // City name
  pincode?: string              // 6-digit pincode
  district?: string             // District for revenue tracking
  latitude: number              // GPS latitude
  longitude: number             // GPS longitude
  photoUrl: string               // Main shop photo URL
  iconUrl: string               // Shop icon URL
  shopUrl: string               // Unique URL slug (unique, indexed)
  
  // Payment & Plan System
  paymentStatus: 'PAID' | 'PENDING'
  paymentExpiryDate: Date       // 365 days from payment
  lastPaymentDate: Date
  planType: 'BASIC' | 'PREMIUM' | 'FEATURED' | 'LEFT_BAR' | 'RIGHT_SIDE' | 'BOTTOM_RAIL' | 'BANNER' | 'HERO'
  planAmount: number            // Amount paid
  planStartDate: Date
  planEndDate: Date
  
  // Premium Features
  additionalPhotos?: string[]   // Extra photos for Premium/Featured
  shopLogo?: string             // Shop logo
  offers?: Array<{              // Offers section
    title: string
    description: string
    validTill: Date
  }>
  whatsappNumber?: string       // WhatsApp contact
  
  // Visibility & Ranking
  priorityRank: number          // Higher = shows first
  isHomePageBanner: boolean     // Featured on homepage
  isTopSlider: boolean          // In top slider
  isLeftBar: boolean            // Left bar plan
  isRightBar: boolean           // Right bar plan
  isHero: boolean               // Hero plan
  isVisible?: boolean           // Public visibility control
  visitorCount: number          // Number of views
  
  // Creator Tracking
  createdByAdmin?: ObjectId     // Admin who created
  createdByAgent?: ObjectId     // Agent who created
  agentName?: string             // Quick reference
  agentCode?: string             // Quick reference
  
  createdAt: Date
}
```

**Indexes (Performance Optimization):**
- `category`, `latitude/longitude`, `area`, `city`, `pincode`, `district`
- `paymentStatus + isVisible` (combined)
- `paymentStatus + planType` (combined)
- `category + paymentStatus` (combined)
- `pincode + paymentStatus` (combined)
- `shopName` (text search)
- `visitorCount` (descending)
- `planType + priorityRank` (combined)

---

### 2. **AgentShop Collection** (`agentshops`)

**Model File:** `lib/models/AgentShop.ts`  
**Purpose:** Agents या Shoppers द्वारा register किए गए shops का tracking

**Key Fields:**
```typescript
{
  // Basic Shop Info
  shopName: string
  ownerName: string
  mobile: string                // Required
  countryCode?: string          // Default: +91
  email?: string
  category: string
  pincode: string               // 6 digits, required
  area?: string                 // Optional
  address: string
  photoUrl: string
  additionalPhotos?: string[]   // Max 9 additional (total 10)
  shopUrl: string               // Unique URL slug
  latitude: number
  longitude: number
  
  // Payment Details
  paymentStatus: 'PAID' | 'PENDING'
  paymentMode: 'CASH' | 'UPI' | 'NONE'
  receiptNo: string
  amount: number                // Payment amount
  planType: 'BASIC' | 'PREMIUM' | 'FEATURED' | 'LEFT_BAR' | 'RIGHT_SIDE' | 'BOTTOM_RAIL' | 'BANNER' | 'HERO'
  planAmount: number
  paymentScreenshot?: string    // UPI screenshot URL
  sendSmsReceipt: boolean
  
  // Commission Tracking
  agentCommission: number      // Agent commission (20% of amount)
  operatorCommission?: number  // Operator commission (15% of remaining)
  district?: string             // For revenue tracking
  
  // Payment Dates
  paymentExpiryDate: Date       // 365 days from payment
  lastPaymentDate: Date
  
  // Creator Tracking
  agentId?: ObjectId            // Agent who registered (optional)
  shopperId?: ObjectId          // Shopper who registered (optional)
  
  // Google Business Profile
  googleBusinessAccount?: {
    accountId?: string
    locationId?: string
    status: 'NOT_CREATED' | 'PENDING' | 'CREATED' | 'VERIFIED' | 'FAILED'
    verificationCode?: string
    verificationUrl?: string
    createdAt?: Date
    lastUpdated?: Date
    error?: string
  }
  
  // Stats
  visitorCount: number
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `agentId + createdAt` (descending)
- `shopperId` (for shopper queries)
- `paymentStatus + planType` (combined)
- `category + paymentStatus` (combined)
- `pincode + paymentStatus` (combined)
- `shopName` (text search)
- `latitude + longitude` (geospatial)

**Important:** जब agent shop register करता है, तो data **दो collections** में save होता है:
1. `agentshops` - Agent's tracking collection
2. `shopsfromimage` - Main website collection (admin approval के बाद)

---

### 3. **Agent Collection** (`agents`)

**Model File:** `lib/models/Agent.ts`  
**Purpose:** Agents का authentication और profile management

**Key Fields:**
```typescript
{
  name: string                  // Agent name
  phone: string                 // Unique phone number
  email: string                 // Unique email
  passwordHash: string          // Bcrypt hashed password
  agentCode: string             // Unique code (e.g., "AG0001")
  agentPanelText?: string       // Custom text for agent panel
  agentPanelTextColor?: 'red' | 'green' | 'blue' | 'black'
  operatorId?: ObjectId       // Operator who manages this agent
  totalShops: number           // Total shops registered
  totalEarnings: number         // Total commission earned
  createdAt: Date
  updatedAt: Date
}
```

**Security:**
- Password automatically hashed before saving (bcrypt, salt 10)
- `comparePassword()` method for authentication
- `passwordHash` field excluded from default queries (`select: false`)

**Indexes:**
- `agentCode` (unique)
- `phone` (unique)
- `email` (unique)
- `operatorId` (for operator queries)

---

### 4. **Shopper Collection** (`shoppers`)

**Model File:** `lib/models/Shopper.ts`  
**Purpose:** Shoppers का authentication और profile management

**Key Fields:**
```typescript
{
  name: string
  phone: string                 // Unique, Indian format
  email: string                 // Unique
  passwordHash: string          // Bcrypt hashed
  shopperCode: string           // Auto-generated (e.g., "SH0001")
  isActive: boolean             // Account status
  isVerified: boolean          // Verification status
  totalShops: number           // Shops registered by shopper
  createdAt: Date
  updatedAt: Date
}
```

**Auto-Generation:**
- `shopperCode` automatically generated in pre-save hook
- Format: `SH0001`, `SH0002`, etc.
- Ensures uniqueness before saving

**Security:**
- Password hashing (bcrypt)
- `comparePassword()` method

---

### 5. **Payment Collection** (`payments`)

**Model File:** `lib/models/Payment.ts`  
**Purpose:** Razorpay और cash payments का tracking

**Key Fields:**
```typescript
{
  // Payment IDs
  orderId: string               // Unique order ID
  paymentId?: string            // Razorpay payment ID
  paymentSignature?: string     // Payment signature
  
  // References
  shopId?: ObjectId             // AgentShop reference
  agentId?: ObjectId            // Agent reference
  
  // Payment Details
  amount: number                // Amount in paise
  currency: string              // Default: INR
  planType: 'BASIC' | 'PREMIUM' | 'FEATURED' | 'LEFT_BAR' | 'RIGHT_SIDE' | 'BOTTOM_RAIL' | 'BANNER' | 'HERO'
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paymentMode: 'CASH' | 'UPI'
  
  // Customer Info
  customerName: string
  customerEmail?: string
  customerPhone: string
  
  // Razorpay Details
  razorpayOrderId: string       // Unique
  razorpayPaymentId?: string
  razorpayPaymentLinkId?: string
  razorpaySignature?: string
  
  // Gateway
  gateway: 'RAZORPAY' | 'PHONEPE'
  
  // Timestamps
  createdAt: Date
  paidAt?: Date                 // When payment completed
  expiresAt: Date               // Order expiry (30 minutes)
  
  // Metadata
  metadata?: {
    receiptNo?: string
    notes?: string
    successMessage?: string
    screenshotUrl?: string
  }
  
  // Error Tracking
  errorMessage?: string
  retryCount: number
}
```

**Indexes:**
- `orderId` (unique)
- `shopId + status`
- `agentId + status`
- `status + createdAt` (descending)
- `razorpayOrderId` (unique)
- `razorpayPaymentId`
- `expiresAt` (TTL index - auto-delete expired orders)

**Auto-Cleanup:**
- Expired pending orders automatically deleted after `expiresAt`

---

### 6. **Revenue Collection** (`revenues`)

**Model File:** `lib/models/Revenue.ts`  
**Purpose:** District-wise revenue tracking by plan type and date

**Key Fields:**
```typescript
{
  district: string             // District name
  date: Date                   // Revenue date
  
  // Plan-wise Revenue
  basicPlanRevenue: number     // ₹100 per shop
  premiumPlanRevenue: number   // ₹2999 per shop
  featuredPlanRevenue: number  // ₹199+ per shop
  leftBarPlanRevenue: number   // ₹299 per shop
  rightBarPlanRevenue: number  // ₹299 per shop
  bannerPlanRevenue: number   // ₹399 per shop
  heroPlanRevenue: number      // ₹499 per shop
  advertisementRevenue: number
  
  // Plan-wise Counts
  basicPlanCount: number
  premiumPlanCount: number
  featuredPlanCount: number
  leftBarPlanCount: number
  rightBarPlanCount: number
  bannerPlanCount: number
  heroPlanCount: number
  advertisementCount: number
  
  // Totals (Auto-calculated)
  totalAgentCommission: number
  totalRevenue: number         // Sum of all plan revenues
  netRevenue: number           // totalRevenue - totalAgentCommission
  
  createdAt: Date
  updatedAt: Date
}
```

**Auto-Calculation:**
- `totalRevenue` = sum of all plan revenues (pre-save hook)
- `netRevenue` = `totalRevenue - totalAgentCommission` (pre-save hook)

**Indexes:**
- `district + date` (descending)
- `date` (descending)

---

### 7. **Settings Collection** (`settings`)

**Model File:** `lib/models/Settings.ts`  
**Purpose:** Website display settings और configuration

**Key Fields:**
```typescript
{
  displayLimits: {
    nearbyShops: number         // BottomStrip - default 30
    leftRail: number            // LeftRail - default 3
    featuredShops: number       // FeaturedBusinesses - default 10
    topCategories: number       // CategoryGrid - default 20
    latestOffers: number        // LatestOffers - default 10
    featuredBusinesses: number  // Same as featuredShops - default 10
  }
  
  iconSizes: {
    bottomStrip: number         // Default 66px
    leftRail: number            // Default 100px
    featuredBusinesses: number  // Default 200px
    latestOffers: number         // Default 200px
    topCategories: number       // Default 112px
  }
  
  sectionVisibility: {
    leftRail: boolean           // Default true
    rightRail: boolean          // Default true
    bottomRail: boolean         // Default true
    rightSide: boolean          // Default true
  }
  
  createdAt: Date
  updatedAt: Date
}
```

**Special Method:**
- `Settings.getSettings()` - Ensures only one settings document exists (creates if not exists)

---

### 8. **Category Collection** (`categories`)

**Model File:** `models/Category.ts`  
**Purpose:** Shop categories management

**Key Fields:**
```typescript
{
  name: string                  // Category name
  slug: string                  // Unique URL slug (lowercase, hyphenated)
  description?: string
  imageUrl?: string
  latitude?: number
  longitude?: number
  isActive: boolean             // Default true
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `slug` (unique)
- `isActive`
- `name`

---

### 9. **Operator Collection** (`operators`)

**Model File:** `lib/models/Operator.ts`  
**Purpose:** Operators का authentication और management

**Key Fields:**
```typescript
{
  name: string
  phone: string                 // Unique
  email: string                 // Unique
  passwordHash: string          // Bcrypt hashed
  operatorCode: string          // Unique code
  isActive: boolean
  totalEarnings: number         // Commission from agents
  createdAt: Date
  updatedAt: Date
}
```

**Security:**
- Password hashing (bcrypt)
- `comparePassword()` method

---

### 10. **User Collection** (`users`)

**Model File:** `models/User.ts`  
**Purpose:** Admin और website users का authentication

**Key Fields:**
```typescript
{
  name: string
  email: string                 // Unique
  password: string              // Bcrypt hashed (select: false)
  phone?: string                // Optional, unique if provided
  role: 'user' | 'admin' | 'editor' | 'operator'
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Security:**
- Password hashing in pre-save hook
- `comparePassword()` method
- Password excluded from default queries

---

## 🔄 Data Flow (डेटा फ्लो)

### Agent Shop Registration Flow:

```
1. Agent fills registration form
   ↓
2. POST /api/agent/shops
   ↓
3. Data saved to AgentShop collection
   - paymentStatus: 'PENDING'
   - paymentMode: 'CASH' or 'UPI'
   - agentId: current agent's ID
   ↓
4. Admin approves payment
   ↓
5. Data copied to Shop collection (shopsfromimage)
   - paymentStatus: 'PAID'
   - isVisible: true
   - createdByAgent: agentId
   ↓
6. Shop appears on website
```

### Shopper Shop Registration Flow:

```
1. Shopper fills registration form
   ↓
2. POST /api/shopper/shops/register
   ↓
3. Data saved to AgentShop collection
   - paymentStatus: 'PENDING'
   - shopperId: current shopper's ID
   ↓
4. Admin approves payment
   ↓
5. Data copied to Shop collection
   - paymentStatus: 'PAID'
   - isVisible: true
```

### Payment Flow:

```
1. User selects payment mode (CASH/UPI)
   ↓
2. If UPI: Razorpay order created
   ↓
3. Payment record created in Payment collection
   - status: 'PENDING'
   - expiresAt: 30 minutes from now
   ↓
4. Payment completed
   ↓
5. Payment record updated
   - status: 'SUCCESS'
   - paidAt: current timestamp
   ↓
6. AgentShop/Shop paymentStatus updated to 'PAID'
   ↓
7. Revenue record created/updated in Revenue collection
```

---

## 🔍 Query Patterns (क्वेरी पैटर्न)

### Common Queries:

**1. Get shops by category:**
```javascript
Shop.find({ 
  category: 'Ayurveda', 
  paymentStatus: 'PAID', 
  isVisible: true 
})
.sort({ priorityRank: -1, visitorCount: -1 })
```

**2. Get nearby shops (geospatial):**
```javascript
Shop.find({
  latitude: { $gte: minLat, $lte: maxLat },
  longitude: { $gte: minLng, $lte: maxLng },
  paymentStatus: 'PAID',
  isVisible: true
})
```

**3. Get agent's shops:**
```javascript
AgentShop.find({ 
  agentId: agentId 
})
.sort({ createdAt: -1 })
```

**4. Get revenue by district:**
```javascript
Revenue.find({ 
  district: 'Patna' 
})
.sort({ date: -1 })
```

**5. Search shops:**
```javascript
Shop.find({ 
  $text: { $search: 'grocery' },
  paymentStatus: 'PAID',
  isVisible: true
})
```

---

## 🎯 Key Design Decisions (मुख्य डिज़ाइन निर्णय)

1. **Dual Storage for Agent Shops:**
   - `AgentShop` collection: Agent's tracking और commission calculation
   - `Shop` collection: Public website display
   - Admin approval के बाद data copy होता है

2. **Payment Status Management:**
   - `PENDING`: Payment not yet approved
   - `PAID`: Payment approved, shop visible on website

3. **Plan Type System:**
   - Multiple plan types with different pricing
   - `priorityRank` determines display order
   - Plan-specific features (additional photos, offers, etc.)

4. **Commission Tracking:**
   - Agent commission: 20% of plan amount
   - Operator commission: 15% of remaining after agent commission
   - Stored in `AgentShop` model

5. **Revenue Aggregation:**
   - District-wise revenue tracking
   - Plan-wise breakdown
   - Auto-calculated totals

6. **Indexes for Performance:**
   - Combined indexes for common query patterns
   - Text indexes for search
   - Geospatial indexes for location queries
   - TTL indexes for auto-cleanup

---

## 🔐 Security Features (सुरक्षा सुविधाएं)

1. **Password Hashing:**
   - All passwords hashed using bcrypt (salt rounds: 10)
   - Passwords never stored in plain text
   - `select: false` prevents accidental exposure

2. **Authentication:**
   - JWT tokens for session management
   - `comparePassword()` method for secure password verification

3. **Data Validation:**
   - Mongoose schema validation
   - Email format validation
   - Phone number format validation
   - Pincode format validation (6 digits)

4. **Unique Constraints:**
   - Email, phone, agentCode, shopperCode, shopUrl all unique
   - Prevents duplicate registrations

---

## 📈 Performance Optimizations (प्रदर्शन अनुकूलन)

1. **Connection Pooling:**
   - Max 20 connections
   - Min 5 connections
   - Connection reuse across requests

2. **Indexes:**
   - Strategic indexes on frequently queried fields
   - Combined indexes for multi-field queries
   - Text indexes for search functionality

3. **Query Optimization:**
   - Lean queries for read-only operations
   - Selective field projection
   - Pagination for large datasets

4. **Caching:**
   - Connection caching in global scope
   - Prevents reconnection on hot reloads

---

## 🛠️ Maintenance (रखरखाव)

### Common Operations:

**1. Clear expired payments:**
```javascript
// Auto-deleted by TTL index on expiresAt
```

**2. Update revenue:**
```javascript
// Auto-calculated in pre-save hook
```

**3. Generate unique codes:**
```javascript
// Auto-generated in pre-save hooks (Shopper, Agent)
```

**4. Hash passwords:**
```javascript
// Auto-hashed in pre-save hooks
```

---

## 📝 Notes (नोट्स)

1. **Collection Names:**
   - Some collections use explicit names (e.g., `shopsfromimage`)
   - Others use default Mongoose naming (pluralized, lowercase)

2. **Timestamps:**
   - Most models use `timestamps: true` (creates `createdAt`, `updatedAt`)
   - Shop model uses custom `createdAt` only

3. **References:**
   - ObjectId references for relationships
   - Optional references allow flexibility

4. **Defaults:**
   - Sensible defaults for all fields
   - Prevents null/undefined errors

---

## 🔗 Related Documentation

- `AGENT_SHOP_DATA_STORAGE.md` - Agent shop data storage details
- `HOMEPAGE_SHOP_DATA_FLOW.md` - Homepage data flow
- `MONGODB_CONNECTION_FIX.md` - Connection troubleshooting

---

**Last Updated:** 2024


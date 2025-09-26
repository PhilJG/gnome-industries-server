const pool = require("./connection");
const bcrypt = require("bcryptjs");

// Seed data
const seedData = async () => {
  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        points: 150,
        is_guest: false,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        points: 75,
        is_guest: false,
      },
      {
        name: "Guest User",
        email: "guest@example.com",
        password: hashedPassword,
        points: 25,
        is_guest: true,
      },
    ];

    for (const user of users) {
      await pool.query(
        `
        INSERT INTO users (name, email, password, points, is_guest)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `,
        [user.name, user.email, user.password, user.points, user.is_guest]
      );
    }

    // Create sample vendors
    const vendors = [
      {
        name: "Green Store Owner",
        email: "owner@greenstore.com",
        password: hashedPassword,
        store_name: "Green Store",
        store_description: "Eco-friendly products for sustainable living",
        store_address: "123 Green Street, Eco City",
        store_hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
        sustainability_score: 4.5,
      },
      {
        name: "Eco Market Manager",
        email: "manager@ecomarket.com",
        password: hashedPassword,
        store_name: "Eco Market",
        store_description: "Local organic produce and sustainable goods",
        store_address: "456 Eco Avenue, Green Town",
        store_hours: "Daily: 8AM-8PM",
        sustainability_score: 4.2,
      },
    ];

    for (const vendor of vendors) {
      await pool.query(
        `
        INSERT INTO vendors (name, email, password, store_name, store_description, store_address, store_hours, sustainability_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `,
        [
          vendor.name,
          vendor.email,
          vendor.password,
          vendor.store_name,
          vendor.store_description,
          vendor.store_address,
          vendor.store_hours,
          vendor.sustainability_score,
        ]
      );
    }

    // Create sample products
    const products = [
      {
        vendor_id: 1,
        product_name: "Organic Cotton T-Shirt",
        points: 10,
        notes: "Made from 100% organic cotton",
      },
      {
        vendor_id: 1,
        product_name: "Bamboo Water Bottle",
        points: 15,
        notes: "Sustainable bamboo material",
      },
      {
        vendor_id: 2,
        product_name: "Local Honey",
        points: 8,
        notes: "From local beekeepers",
      },
      {
        vendor_id: 2,
        product_name: "Reusable Shopping Bag",
        points: 5,
        notes: "Made from recycled materials",
      },
    ];

    for (const product of products) {
      await pool.query(
        `
        INSERT INTO products (vendor_id, product_name, points, notes)
        VALUES ($1, $2, $3, $4)
      `,
        [product.vendor_id, product.product_name, product.points, product.notes]
      );
    }

    // Create sample surveys
    const surveys = [
      {
        user_id: 1,
        vendor_id: 1,
        survey_type: "rating",
        questions: {
          "Overall satisfaction": "How satisfied are you with this store?",
          "Sustainability practices":
            "How satisfied are you with the store's sustainability practices?",
          "Ease of finding items": "How easy was it to find what you needed?",
          "Staff helpfulness":
            "How would you rate staff helpfulness and friendliness?",
          "Value for money": "How would you rate value for money?",
        },
        answers: {
          "Overall satisfaction": 5,
          "Sustainability practices": 5,
          "Ease of finding items": 4,
          "Staff helpfulness": 5,
          "Value for money": 4,
        },
        points_awarded: 15,
      },
      {
        user_id: 2,
        vendor_id: 2,
        survey_type: "written",
        questions: {
          "Visit attraction": "What first attracted you to visit today?",
          "How heard about store": "How did you hear about this store?",
          "Usual products":
            "What product or service do you usually come here for?",
          "Missing items":
            "Was there anything you wanted but could not find, and what was it?",
          "Improvement suggestion":
            "What is one change that would most improve your experience?",
        },
        answers: {
          "Visit attraction": "Looking for organic produce",
          "How heard about store": "Friend recommendation",
          "Usual products": "Fresh vegetables and fruits",
          "Missing items": "Nothing missing today",
          "Improvement suggestion": "Maybe more variety in organic snacks",
        },
        points_awarded: 25,
      },
    ];

    for (const survey of surveys) {
      await pool.query(
        `
        INSERT INTO surveys (user_id, vendor_id, survey_type, questions, answers, points_awarded)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          survey.user_id,
          survey.vendor_id,
          survey.survey_type,
          JSON.stringify(survey.questions),
          JSON.stringify(survey.answers),
          survey.points_awarded,
        ]
      );
    }

    // Create sample NFC scans
    const scans = [
      {
        user_id: 1,
        vendor_id: 1,
        product_id: 1,
        item: "Organic Cotton T-Shirt",
        points_awarded: 10,
      },
      {
        user_id: 2,
        vendor_id: 2,
        product_id: 3,
        item: "Local Honey",
        points_awarded: 8,
      },
    ];

    for (const scan of scans) {
      await pool.query(
        `
        INSERT INTO nfc_scans (user_id, vendor_id, product_id, item, points_awarded)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          scan.user_id,
          scan.vendor_id,
          scan.product_id,
          scan.item,
          scan.points_awarded,
        ]
      );
    }

    // Create sample reviews
    const reviews = [
      {
        user_id: 1,
        vendor_id: 1,
        rating: 5,
        content: "Great store with excellent sustainable products!",
        status: "approved",
        helpful_votes: 3,
        points_awarded: 10,
      },
      {
        user_id: 2,
        vendor_id: 2,
        rating: 4,
        content: "Love the local produce selection.",
        status: "approved",
        helpful_votes: 1,
        points_awarded: 10,
      },
    ];

    for (const review of reviews) {
      await pool.query(
        `
        INSERT INTO reviews (user_id, vendor_id, rating, content, status, helpful_votes, points_awarded)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          review.user_id,
          review.vendor_id,
          review.rating,
          review.content,
          review.status,
          review.helpful_votes,
          review.points_awarded,
        ]
      );
    }

    // Create sample badges
    const badges = [
      {
        user_id: 1,
        badge_name: "Survey Starter",
        badge_type: "milestone",
        points_awarded: 5,
      },
      {
        user_id: 1,
        badge_name: "Explorer",
        badge_type: "scan",
        points_awarded: 5,
      },
      {
        user_id: 2,
        badge_name: "Review Rookie",
        badge_type: "review",
        points_awarded: 5,
      },
    ];

    for (const badge of badges) {
      await pool.query(
        `
        INSERT INTO badges (user_id, badge_name, badge_type, points_awarded)
        VALUES ($1, $2, $3, $4)
      `,
        [
          badge.user_id,
          badge.badge_name,
          badge.badge_type,
          badge.points_awarded,
        ]
      );
    }

    // Create sample rewards
    const rewards = [
      {
        vendor_id: 1,
        reward_name: "25% Off Purchase",
        reward_type: "discount",
        description: "Get 25% off your next purchase",
        points_cost: 60,
        is_active: true,
      },
      {
        vendor_id: 2,
        reward_name: "Local Gift Draw Entry",
        reward_type: "gift",
        description: "Enter our monthly local gift draw",
        points_cost: 20,
        is_active: true,
      },
    ];

    for (const reward of rewards) {
      await pool.query(
        `
        INSERT INTO rewards (vendor_id, reward_name, reward_type, description, points_cost, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          reward.vendor_id,
          reward.reward_name,
          reward.reward_type,
          reward.description,
          reward.points_cost,
          reward.is_active,
        ]
      );
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

module.exports = { seedData };

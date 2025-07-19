import { userStorage } from "./userStorage";

const sampleUsers = [
  {
    name: "John Admin",
    email: "john@company.com",
    password: "password123",
    role: "admin" as const,
    department: "IT",
    phoneNumber: "+1-555-0101",
    isActive: true,
  },
  {
    name: "Sarah Manager",
    email: "sarah@company.com", 
    password: "password123",
    role: "manager" as const,
    department: "Production",
    phoneNumber: "+1-555-0102",
    isActive: true,
  },
  {
    name: "Mike Employee",
    email: "mike@company.com",
    password: "password123", 
    role: "employee" as const,
    department: "Production",
    phoneNumber: "+1-555-0103",
    isActive: true,
  },
  {
    name: "Lisa Viewer",
    email: "lisa@company.com",
    password: "password123",
    role: "viewer" as const,
    department: "QA",
    phoneNumber: "+1-555-0104", 
    isActive: true,
  },
  {
    name: "Tom Inactive",
    email: "tom@company.com",
    password: "password123",
    role: "employee" as const,
    department: "Production",
    phoneNumber: "+1-555-0105",
    isActive: false,
  }
];

export async function seedUsers() {
  try {
    console.log("🌱 Seeding users...");
    
    // Check if users already exist
    const existingUsers = await userStorage.getUsers();
    if (existingUsers.length > 0) {
      console.log("✅ Users already exist, skipping seed");
      return;
    }

    // Create sample users
    for (const userData of sampleUsers) {
      try {
        await userStorage.createUser(userData);
        console.log(`✅ Created user: ${userData.name}`);
      } catch (error) {
        console.log(`⚠️ User ${userData.email} already exists or error:`, error);
      }
    }
    
    console.log("🎉 User seeding completed");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}
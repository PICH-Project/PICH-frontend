// Mock data utility for generating consistent fake data

import type { Card } from "../services/cardService"
import type { UserProfile } from "../services/authService"
import type { Connection } from "../services/connectionService"

// Generate a random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate a random date within the last year
export const generateDate = (daysAgo = 365) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Mock user profiles
export const mockUsers: UserProfile[] = [
  {
    id: "user-001",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    nickname: "Johnny",
    phone: "+1 (555) 123-4567",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    gender: "M",
    birthDate: "1986-02-24",
    subscriptionPlan: "premium",
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    walletAddress: "sol:abc123def456",
    tokenBalance: 1250,
    mainCardId: "card-001",
    createdAt: generateDate(180),
    updatedAt: generateDate(5),
  },
  {
    id: "user-002",
    email: "sarah.smith@example.com",
    firstName: "Sarah",
    lastName: "Smith",
    nickname: "Sassy",
    phone: "+1 (555) 987-6543",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    gender: "F",
    birthDate: "1992-07-15",
    subscriptionPlan: "basic",
    isActive: true,
    tokenBalance: 350,
    createdAt: generateDate(90),
    updatedAt: generateDate(10),
  },
  {
    id: "user-003",
    email: "michael.johnson@example.com",
    firstName: "Michael",
    lastName: "Johnson",
    nickname: "Mike",
    phone: "+1 (555) 456-7890",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    gender: "M",
    birthDate: "1978-11-30",
    subscriptionPlan: "medium",
    subscriptionExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    walletAddress: "sol:xyz789abc012",
    tokenBalance: 780,
    createdAt: generateDate(120),
    updatedAt: generateDate(3),
  },
  {
    id: "user-004",
    email: "emily.wilson@example.com",
    firstName: "Emily",
    lastName: "Wilson",
    nickname: "Em",
    phone: "+1 (555) 234-5678",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    gender: "F",
    birthDate: "1995-04-12",
    subscriptionPlan: "basic",
    isActive: true,
    tokenBalance: 125,
    createdAt: generateDate(60),
    updatedAt: generateDate(7),
  },
  {
    id: "user-005",
    email: "david.brown@example.com",
    firstName: "David",
    lastName: "Brown",
    nickname: "Dave",
    phone: "+1 (555) 876-5432",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    gender: "M",
    birthDate: "1983-09-08",
    subscriptionPlan: "premium",
    subscriptionExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    walletAddress: "sol:def456ghi789",
    tokenBalance: 2100,
    mainCardId: "card-005",
    createdAt: generateDate(200),
    updatedAt: generateDate(1),
  },
]

// Mock cards
export const mockCards: Card[] = [
  {
    id: "card-001",
    type: "BAC",
    name: "John Doe",
    nickname: "Johnny",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    phone: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    social: {
      linkedin: "linkedin.com/in/johndoe",
      twitter: "twitter.com/johndoe",
      facebook: "facebook.com/johndoe",
    },
    isPrime: true,
    bio: "Software Engineer with 10+ years of experience in mobile app development. Passionate about creating intuitive user experiences.",
    location: {
      country: "United States",
      city: "San Francisco",
      address: "123 Tech Street",
      postalCode: "94105",
    },
    category: "WORK",
    blockchainId: "sol:card123abc",
    isMainCard: true,
    isInWallet: true,
    userId: "user-001",
    createdAt: generateDate(180),
    updatedAt: generateDate(5),
  },
  {
    id: "card-002",
    type: "PAC",
    name: "John Doe",
    nickname: "Johnny D",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    phone: "+1 (555) 123-4567",
    email: "john.personal@example.com",
    social: {
      instagram: "instagram.com/johnnyd",
      snapchat: "snapchat.com/johnnyd",
    },
    isPrime: false,
    bio: "Hiking enthusiast, amateur photographer, and coffee lover.",
    location: {
      country: "United States",
      city: "San Francisco",
      address: "456 Residential Ave",
      postalCode: "94110",
    },
    category: "WORK",
    isMainCard: false,
    isInWallet: true,
    userId: "user-001",
    createdAt: generateDate(170),
    updatedAt: generateDate(10),
  },
  {
    id: "card-003",
    type: "BAC",
    name: "Sarah Smith",
    nickname: "Sassy",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    phone: "+1 (555) 987-6543",
    email: "sarah.smith@example.com",
    social: {
      linkedin: "linkedin.com/in/sarahsmith",
      instagram: "instagram.com/sassysmith",
    },
    isPrime: true,
    bio: "Marketing specialist with a focus on digital campaigns and brand development.",
    location: {
      country: "United States",
      city: "New York",
      address: "789 Marketing Blvd",
      postalCode: "10001",
    },
    category: "WORK",
    blockchainId: "sol:card456def",
    isMainCard: true,
    isInWallet: true,
    userId: "user-002",
    createdAt: generateDate(90),
    updatedAt: generateDate(15),
  },
  {
    id: "card-004",
    type: "VAC",
    name: "Tech Conference 2023",
    nickname: "TechConf",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    email: "info@techconf2023.com",
    social: {
      twitter: "twitter.com/techconf2023",
      linkedin: "linkedin.com/company/techconf2023",
    },
    isPrime: false,
    bio: "Annual technology conference featuring the latest innovations in AI, blockchain, and mobile development.",
    location: {
      country: "United States",
      city: "Las Vegas",
      address: "Convention Center",
      postalCode: "89109",
    },
    category: "WORK",
    isMainCard: false,
    isInWallet: true,
    userId: "user-001",
    createdAt: generateDate(60),
    updatedAt: generateDate(60),
  },
  {
    id: "card-005",
    type: "BAC",
    name: "David Brown",
    nickname: "Dave",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    phone: "+1 (555) 876-5432",
    email: "david.brown@example.com",
    social: {
      linkedin: "linkedin.com/in/davidbrown",
      twitter: "twitter.com/davebrown",
      facebook: "facebook.com/davebrown",
    },
    isPrime: true,
    bio: "Financial advisor specializing in cryptocurrency investments and blockchain technology.",
    location: {
      country: "United States",
      city: "Miami",
      address: "321 Finance Street",
      postalCode: "33101",
    },
    category: "WORK",
    blockchainId: "sol:card789ghi",
    isMainCard: true,
    isInWallet: true,
    userId: "user-005",
    createdAt: generateDate(200),
    updatedAt: generateDate(2),
  },
  {
    id: "card-006",
    type: "PAC",
    name: "Michael Johnson",
    nickname: "Mike",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    phone: "+1 (555) 456-7890",
    email: "michael.johnson@example.com",
    social: {
      instagram: "instagram.com/mikej",
      twitter: "twitter.com/mikejohnson",
    },
    isPrime: false,
    bio: "Sports enthusiast, basketball coach, and fitness trainer.",
    location: {
      country: "United States",
      city: "Chicago",
      address: "567 Sports Avenue",
      postalCode: "60601",
    },
    category: "FRIENDS",
    isMainCard: true,
    isInWallet: true,
    userId: "user-003",
    createdAt: generateDate(120),
    updatedAt: generateDate(30),
  },
  {
    id: "card-007",
    type: "CAC",
    name: "Family Reunion 2023",
    nickname: "FamReunion",
    avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
    isPrime: false,
    bio: "Annual Johnson family reunion at Lake Michigan. Activities include barbecue, games, and catching up with relatives.",
    location: {
      country: "United States",
      city: "Chicago",
      address: "Lake Michigan Park",
      postalCode: "60611",
    },
    category: "FAMILY",
    isMainCard: false,
    isInWallet: true,
    userId: "user-003",
    createdAt: generateDate(45),
    updatedAt: generateDate(45),
  },
  {
    id: "card-008",
    type: "PAC",
    name: "Emily Wilson",
    nickname: "Em",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    phone: "+1 (555) 234-5678",
    email: "emily.wilson@example.com",
    social: {
      instagram: "instagram.com/emilyw",
      pinterest: "pinterest.com/emilywilson",
    },
    isPrime: true,
    bio: "Graphic designer and illustrator with a passion for creating beautiful, functional designs.",
    location: {
      country: "United States",
      city: "Portland",
      address: "890 Creative Lane",
      postalCode: "97201",
    },
    category: "FAMILY",
    isMainCard: true,
    isInWallet: true,
    userId: "user-004",
    createdAt: generateDate(60),
    updatedAt: generateDate(7),
  },
  {
    id: "card-009",
    type: "BAC",
    name: "Emily Wilson Design",
    nickname: "EW Design",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    phone: "+1 (555) 234-5678",
    email: "contact@emilywilsondesign.com",
    social: {
      instagram: "instagram.com/ewdesign",
      behance: "behance.net/emilywilson",
      dribbble: "dribbble.com/emilywilson",
    },
    isPrime: true,
    bio: "Creative design studio specializing in branding, illustration, and UI/UX design for digital products.",
    location: {
      country: "United States",
      city: "Portland",
      address: "123 Design Studio",
      postalCode: "97201",
    },
    category: "WORK",
    blockchainId: "sol:card012jkl",
    isMainCard: false,
    isInWallet: true,
    userId: "user-004",
    createdAt: generateDate(58),
    updatedAt: generateDate(5),
  },
  {
    id: "card-010",
    type: "PAC",
    name: "David Brown",
    nickname: "Dave",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    phone: "+1 (555) 876-5432",
    email: "dave.personal@example.com",
    social: {
      instagram: "instagram.com/davebrown",
      facebook: "facebook.com/davebrown",
    },
    isPrime: false,
    bio: "Travel enthusiast, foodie, and amateur photographer.",
    location: {
      country: "United States",
      city: "Miami",
      address: "654 Beach Drive",
      postalCode: "33139",
    },
    category: "WORK",
    isMainCard: false,
    isInWallet: true,
    userId: "user-005",
    createdAt: generateDate(190),
    updatedAt: generateDate(10),
  },
]

// Generate mock connections between users
export const generateMockConnections = (): Connection[] => {
  const connections: Connection[] = []

  // Create connections between users
  connections.push({
    id: "conn-001",
    user1Id: "user-001", // John Doe
    user2Id: "user-002", // Sarah Smith
    user1Notes: "Met at the tech conference in San Francisco",
    user2Notes: "Potential client for marketing services",
    user1FavoritedUser2: true,
    user2FavoritedUser1: false,
    connectionDate: generateDate(60),
    lastInteractionDate: generateDate(5),
    createdAt: generateDate(60),
    updatedAt: generateDate(5),
    user1: mockUsers.find((u) => u.id === "user-001")!,
    user2: mockUsers.find((u) => u.id === "user-002")!,
  })

  connections.push({
    id: "conn-002",
    user1Id: "user-001", // John Doe
    user2Id: "user-003", // Michael Johnson
    user1Notes: "Basketball buddy from the gym",
    user2Notes: "Software developer, might need his services",
    user1FavoritedUser2: false,
    user2FavoritedUser1: true,
    connectionDate: generateDate(90),
    lastInteractionDate: generateDate(15),
    createdAt: generateDate(90),
    updatedAt: generateDate(15),
    user1: mockUsers.find((u) => u.id === "user-001")!,
    user2: mockUsers.find((u) => u.id === "user-003")!,
  })

  connections.push({
    id: "conn-003",
    user1Id: "user-001", // John Doe
    user2Id: "user-004", // Emily Wilson
    user1Notes: "Designer for the new app project",
    user2Notes: "Client for the new branding project",
    user1FavoritedUser2: true,
    user2FavoritedUser1: true,
    connectionDate: generateDate(30),
    lastInteractionDate: generateDate(2),
    createdAt: generateDate(30),
    updatedAt: generateDate(2),
    user1: mockUsers.find((u) => u.id === "user-001")!,
    user2: mockUsers.find((u) => u.id === "user-004")!,
  })

  connections.push({
    id: "conn-004",
    user1Id: "user-002", // Sarah Smith
    user2Id: "user-005", // David Brown
    user1Notes: "Financial advisor for the marketing campaign",
    user2Notes: "Marketing specialist for the investment seminar",
    user1FavoritedUser2: false,
    user2FavoritedUser1: false,
    connectionDate: generateDate(120),
    lastInteractionDate: generateDate(45),
    createdAt: generateDate(120),
    updatedAt: generateDate(45),
    user1: mockUsers.find((u) => u.id === "user-002")!,
    user2: mockUsers.find((u) => u.id === "user-005")!,
  })

  connections.push({
    id: "conn-005",
    user1Id: "user-003", // Michael Johnson
    user2Id: "user-004", // Emily Wilson
    user1Notes: "Designer for the sports event posters",
    user2Notes: "Basketball coach for weekend games",
    user1FavoritedUser2: true,
    user2FavoritedUser1: false,
    connectionDate: generateDate(75),
    lastInteractionDate: generateDate(10),
    createdAt: generateDate(75),
    updatedAt: generateDate(10),
    user1: mockUsers.find((u) => u.id === "user-003")!,
    user2: mockUsers.find((u) => u.id === "user-004")!,
  })

  return connections
}

// Mock QR code data (base64 encoded image)\
export const mockQRCode = "data:image/png;base64,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"

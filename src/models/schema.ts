import {
  mysqlTable,
  varchar,
  text,
  date,
  boolean,
  int,
  mysqlEnum,
  timestamp,
  primaryKey,
  unique,
} from "drizzle-orm/mysql-core";

// ENUMS
export const userStatusEnum = ["pending", "approved", "rejected"] as const;
export const userRoles = ["member", "guest"] as const;
export const popUpsStatus = ["active", "disabled"] as const;

// ADMINS
export const admins = mysqlTable("admins", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 11 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
});

// USERS
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 11 }).notNull(),
  role: mysqlEnum(userRoles).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  purpose: text("purpose"),
  imagePath: text("image_path"),
  dateOfBirth: date("date_of_birth").notNull(),
  status: mysqlEnum(userStatusEnum).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// VOTES
export const votes = mysqlTable("votes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  maxSelections: int("max_selections").notNull(),
});

export const votesItems = mysqlTable("votes_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  voteId: varchar("vote_id", { length: 36 })
    .notNull()
    .references(() => votes.id),
  item: varchar("item", { length: 255 }).notNull(),
});

export const userVotes = mysqlTable("user_votes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  voteId: varchar("vote_id", { length: 36 })
    .notNull()
    .references(() => votes.id),
});

export const userVotesItems = mysqlTable("user_votes_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userVoteId: varchar("user_vote_id", { length: 36 })
    .notNull()
    .references(() => userVotes.id),
  item: varchar("item", { length: 255 }).notNull(),
});

// POSTS
export const postsCategory = mysqlTable("posts_category", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const posts = mysqlTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => postsCategory.id),
});

export const postsImages = mysqlTable("posts_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imagePath: text("image_path").notNull(),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => posts.id),
});

// REACTS
export const reacts = mysqlTable(
  "reacts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    postId: varchar("post_id", { length: 36 })
      .notNull()
      .references(() => posts.id),
    status: boolean("status").default(true).notNull(),
  },
  (table) => [unique("unique_user_post_react").on(table.userId, table.postId)]
);

// COMPLAINTS
export const complaintsCategory = mysqlTable("complaints_category", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const complaints = mysqlTable("complaints", {
  id: varchar("id", { length: 36 }).primaryKey(),
  explain: varchar("explain", { length: 255 }).notNull(),
  seen: boolean("seen").default(false),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => complaintsCategory.id),
});

export const userComplaints = mysqlTable(
  "user_complaints",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    complaintId: varchar("complaint_id", { length: 36 })
      .notNull()
      .references(() => complaints.id),
  },
  (table) => [
    unique("unique_user_complaint").on(table.userId, table.complaintId),
  ]
);

// COMPETITIONS
export const competitions = mysqlTable("competitions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

export const userCompetition = mysqlTable(
  "user_competition",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    competitionId: varchar("competition_id", { length: 36 })
      .notNull()
      .references(() => competitions.id),
    date: date("date").notNull(),
  },
  (table) => [
    unique("unique_user_competition").on(table.userId, table.competitionId),
  ]
);

// APP PAGES & POPUPS
export const appPages = mysqlTable("app_pages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const popUpsImages = mysqlTable("popups_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imagePath: varchar("image_path", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: mysqlEnum(popUpsStatus).default("active").notNull(),
});

export const popUpsPages = mysqlTable("popups_pages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imageId: varchar("image_id", { length: 36 })
    .notNull()
    .references(() => popUpsImages.id),
  pageId: varchar("page_id", { length: 36 })
    .notNull()
    .references(() => appPages.id),
});

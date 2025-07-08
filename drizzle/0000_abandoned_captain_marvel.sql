CREATE TABLE `admins` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone_number` varchar(11) NOT NULL,
	`email` varchar(255) NOT NULL,
	`hashed_password` varchar(255) NOT NULL,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_pages` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `app_pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitions` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	CONSTRAINT `competitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` varchar(36) NOT NULL,
	`explain` varchar(255) NOT NULL,
	`seen` boolean DEFAULT false,
	`category_id` varchar(36) NOT NULL,
	CONSTRAINT `complaints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints_category` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `complaints_category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `popups_images` (
	`id` varchar(36) NOT NULL,
	`image_path` varchar(255) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`status` enum('active','disabled') NOT NULL DEFAULT 'active',
	CONSTRAINT `popups_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `popups_pages` (
	`id` varchar(36) NOT NULL,
	`image_id` varchar(36) NOT NULL,
	`page_id` varchar(36) NOT NULL,
	CONSTRAINT `popups_pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts_category` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `posts_category_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts_images` (
	`id` varchar(36) NOT NULL,
	`image_path` text NOT NULL,
	`post_id` varchar(36) NOT NULL,
	CONSTRAINT `posts_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reacts` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `reacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_post_react` UNIQUE(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `user_competition` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`competition_id` varchar(36) NOT NULL,
	`date` date NOT NULL,
	CONSTRAINT `user_competition_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_competition` UNIQUE(`user_id`,`competition_id`)
);
--> statement-breakpoint
CREATE TABLE `user_complaints` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`complaint_id` varchar(36) NOT NULL,
	CONSTRAINT `user_complaints_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_complaint` UNIQUE(`user_id`,`complaint_id`)
);
--> statement-breakpoint
CREATE TABLE `user_votes` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`vote_id` varchar(36) NOT NULL,
	CONSTRAINT `user_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_votes_items` (
	`id` varchar(36) NOT NULL,
	`user_vote_id` varchar(36) NOT NULL,
	`item` varchar(255) NOT NULL,
	CONSTRAINT `user_votes_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone_number` varchar(11) NOT NULL,
	`role` enum('member','guest') NOT NULL,
	`email` varchar(255) NOT NULL,
	`purpose` text,
	`image_path` text,
	`date_of_birth` date NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`max_selections` int NOT NULL,
	CONSTRAINT `votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votes_items` (
	`id` varchar(36) NOT NULL,
	`vote_id` varchar(36) NOT NULL,
	`item` varchar(255) NOT NULL,
	CONSTRAINT `votes_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_category_id_complaints_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `complaints_category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `popups_pages` ADD CONSTRAINT `popups_pages_image_id_popups_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `popups_images`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `popups_pages` ADD CONSTRAINT `popups_pages_page_id_app_pages_id_fk` FOREIGN KEY (`page_id`) REFERENCES `app_pages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_posts_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `posts_category`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts_images` ADD CONSTRAINT `posts_images_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reacts` ADD CONSTRAINT `reacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reacts` ADD CONSTRAINT `reacts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_competition` ADD CONSTRAINT `user_competition_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_competition` ADD CONSTRAINT `user_competition_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_complaints` ADD CONSTRAINT `user_complaints_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_complaints` ADD CONSTRAINT `user_complaints_complaint_id_complaints_id_fk` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_votes` ADD CONSTRAINT `user_votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_votes` ADD CONSTRAINT `user_votes_vote_id_votes_id_fk` FOREIGN KEY (`vote_id`) REFERENCES `votes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_votes_items` ADD CONSTRAINT `user_votes_items_user_vote_id_user_votes_id_fk` FOREIGN KEY (`user_vote_id`) REFERENCES `user_votes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votes_items` ADD CONSTRAINT `votes_items_vote_id_votes_id_fk` FOREIGN KEY (`vote_id`) REFERENCES `votes`(`id`) ON DELETE no action ON UPDATE no action;
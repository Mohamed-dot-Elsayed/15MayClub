CREATE TABLE `email_verifications` (
	`user_id` varchar(36) NOT NULL,
	`code` varchar(6) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `email_verifications_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` boolean DEFAULT false;
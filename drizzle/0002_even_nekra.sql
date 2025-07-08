DROP TABLE `user_complaints`;--> statement-breakpoint
ALTER TABLE `complaints` ADD `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `fcmtoken` varchar(255);--> statement-breakpoint
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;